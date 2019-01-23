/*
  Copyright 2018 Set Labs Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

'use strict';

// Given that this is an integration test, we unmock the Set Protocol
// smart contracts artifacts package to pull the most recently
// deployed contracts on the current network.
jest.unmock('set-protocol-contracts');
jest.setTimeout(30000);

import * as _ from 'lodash';
import * as ABIDecoder from 'abi-decoder';
import * as chai from 'chai';
import * as ethUtil from 'ethereumjs-util';
import * as setProtocolUtils from 'set-protocol-utils';
import Web3 from 'web3';
import { Core, Vault } from 'set-protocol-contracts';
import {
  CoreContract,
  IssuanceOrderModuleContract,
  RebalanceAuctionModuleContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract,
  WhiteListContract,
  ZeroExExchangeWrapperContract,
} from 'set-protocol-contracts';

import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { RebalancingAuctionModuleWrapper } from '@src/wrappers';
import { OrderAPI } from '@src/api';
import {
  NULL_ADDRESS,
  TX_DEFAULTS,
  ZERO,
  ONE_DAY_IN_SECONDS,
  DEFAULT_AUCTION_PRICE_NUMERATOR,
  DEFAULT_AUCTION_PRICE_DENOMINATOR,
} from '@src/constants';
import { Assertions } from '@src/assertions';
import {
  addPriceCurveToCoreAsync,
  addWhiteListedTokenAsync,
  approveForTransferAsync,
  constructInflowOutflowArraysAsync,
  createDefaultRebalancingSetTokenAsync,
  deployBaseContracts,
  deployConstantAuctionPriceCurveAsync,
  deployCoreContract,
  deployKyberNetworkWrapperContract,
  deploySetTokenAsync,
  deploySetTokensAsync,
  deployTakerWalletWrapperContract,
  deployTokenAsync,
  deployTokensAsync,
  deployZeroExExchangeWrapperContract,
  getVaultBalances,
  tokenDeployedOnSnapshot,
  transitionToRebalanceAsync,
} from '@test/helpers';
import {
  BigNumber,
  ether,
  extractNewSetTokenAddressFromLogs,
  generateFutureTimestamp,
  getFormattedLogsFromTxHash,
} from '@src/util';
import { Address, SignedIssuanceOrder, KyberTrade, TakerWalletOrder, ZeroExSignedFillOrder } from '@src/types/common';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const { SetProtocolTestUtils: SetTestUtils, SetProtocolUtils: SetUtils, Web3Utils } = setProtocolUtils;
const web3Utils = new Web3Utils(web3);
const setUtils = new SetUtils(web3);
const setTestUtils = new SetTestUtils(web3);

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('RebalancingAuctionModuleWrapper', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let issuanceOrderModule: IssuanceOrderModuleContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;
  let whitelist: WhiteListContract;

  let rebalancingAuctionModuleWrapper: RebalancingAuctionModuleWrapper;

  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    [
      core,
      transferProxy,
      vault,
      setTokenFactory,
      rebalancingSetTokenFactory,
      rebalanceAuctionModule,
      issuanceOrderModule,
      whitelist,
    ] = await deployBaseContracts(web3);

    rebalancingAuctionModuleWrapper = new RebalancingAuctionModuleWrapper(
      web3,
      rebalanceAuctionModule.address,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('bid', async () => {
    let rebalancingSetToken: RebalancingSetTokenContract;
    let currentSetToken: SetTokenContract;
    let nextSetToken: SetTokenContract;

    let subjectRebalancingSetToken: Address;
    let subjectBidQuantity: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const setTokens = await deploySetTokensAsync(
        web3,
        core,
        setTokenFactory.address,
        transferProxy.address,
        2,
      );

      currentSetToken = setTokens[0];
      nextSetToken = setTokens[1];

      const proposalPeriod = ONE_DAY_IN_SECONDS;
      const managerAddress = ACCOUNTS[1].address;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        managerAddress,
        currentSetToken.address,
        proposalPeriod
      );

      // Issue currentSetToken
      await core.issue.sendTransactionAsync(currentSetToken.address, ether(9), TX_DEFAULTS);
      await approveForTransferAsync([currentSetToken], transferProxy.address);

      // Use issued currentSetToken to issue rebalancingSetToken
      const rebalancingSetQuantityToIssue = ether(7);
      await core.issue.sendTransactionAsync(rebalancingSetToken.address, rebalancingSetQuantityToIssue);

      // Approve proposed Set's components to the whitelist;
      const [proposalComponentOne, proposalComponentTwo] = await nextSetToken.getComponents.callAsync();
      await addWhiteListedTokenAsync(whitelist, proposalComponentOne);
      await addWhiteListedTokenAsync(whitelist, proposalComponentTwo);

      // Deploy price curve used in auction
      const priceCurve = await deployConstantAuctionPriceCurveAsync(
        web3,
        DEFAULT_AUCTION_PRICE_NUMERATOR,
        DEFAULT_AUCTION_PRICE_DENOMINATOR
      );

      addPriceCurveToCoreAsync(
        core,
        priceCurve.address
      );

      // Transition to proposal state
      const auctionPriceCurveAddress = priceCurve.address;
      const setAuctionTimeToPivot = new BigNumber(100000);
      const setAuctionStartPrice = new BigNumber(500);
      const setAuctionPivotPrice = new BigNumber(1000);
      await transitionToRebalanceAsync(
        web3,
        rebalancingSetToken,
        managerAddress,
        nextSetToken.address,
        auctionPriceCurveAddress,
        setAuctionTimeToPivot,
        setAuctionStartPrice,
        setAuctionPivotPrice,
      );

      subjectRebalancingSetToken = rebalancingSetToken.address;
      subjectBidQuantity = ether(2);
      subjectCaller = DEFAULT_ACCOUNT;
    });

    async function subject(): Promise<string> {
      return await rebalancingAuctionModuleWrapper.bid(
        subjectRebalancingSetToken,
        subjectBidQuantity,
        { from: subjectCaller },
      );
    }

    test('subtract correct amount from remainingCurrentSets', async () => {
      const [, existingRemainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();

      await subject();

      const expectedRemainingCurrentSets = existingRemainingCurrentSets.sub(subjectBidQuantity);
      const [, newRemainingCurrentSets] = await rebalancingSetToken.getBiddingParameters.callAsync();
      expect(newRemainingCurrentSets).to.eql(expectedRemainingCurrentSets);
    });

    test('transfers the correct amount of tokens from the bidder to the rebalancing token in Vault', async () => {
      const expectedTokenFlows = await constructInflowOutflowArraysAsync(
        rebalancingSetToken,
        subjectBidQuantity,
        DEFAULT_AUCTION_PRICE_NUMERATOR,
      );
      const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

      const oldSenderBalances = await getVaultBalances(
        vault,
        combinedTokenArray,
        rebalancingSetToken.address
      );

      await subject();

      const newSenderBalances = await getVaultBalances(
        vault,
        combinedTokenArray,
        rebalancingSetToken.address
      );
      const expectedSenderBalances = _.map(oldSenderBalances, (balance, index) =>
        balance.add(expectedTokenFlows['inflow'][index]).sub(expectedTokenFlows['outflow'][index])
      );
      expect(JSON.stringify(newSenderBalances)).to.equal(JSON.stringify(expectedSenderBalances));
    });

    it('transfers the correct amount of tokens to the bidder in the Vault', async () => {
      const expectedTokenFlows = await constructInflowOutflowArraysAsync(
        rebalancingSetToken,
        subjectBidQuantity,
        DEFAULT_AUCTION_PRICE_NUMERATOR,
      );
      const combinedTokenArray = await rebalancingSetToken.getCombinedTokenArray.callAsync();

      const oldReceiverBalances = await getVaultBalances(
        vault,
        combinedTokenArray,
        DEFAULT_ACCOUNT
      );

      await subject();

      const newReceiverBalances = await getVaultBalances(
        vault,
        combinedTokenArray,
        DEFAULT_ACCOUNT
      );
      const expectedReceiverBalances = _.map(oldReceiverBalances, (balance, index) =>
        balance.add(expectedTokenFlows['outflow'][index])
      );

      expect(JSON.stringify(newReceiverBalances)).to.equal(JSON.stringify(expectedReceiverBalances));
    });
  });
});
