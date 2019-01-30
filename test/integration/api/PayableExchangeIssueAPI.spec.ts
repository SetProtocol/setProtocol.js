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
import { Bytes, ExchangeIssueParams } from 'set-protocol-utils';
import Web3 from 'web3';
import { Core, Vault } from 'set-protocol-contracts';
import {
  CoreContract,
  ExchangeIssueModuleContract,
  IssuanceOrderModuleContract,
  PayableExchangeIssueContract,
  RebalanceAuctionModuleContract,
  RebalancingSetTokenContract,
  RebalancingSetTokenFactoryContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  VaultContract,
  WethMockContract,
  WhiteListContract,
  ZeroExExchangeWrapperContract,
} from 'set-protocol-contracts';

import ChaiSetup from '@test/helpers/chaiSetup';
import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { CoreWrapper, IssuanceOrderModuleWrapper, PayableExchangeIssueWrapper } from '@src/wrappers';
import { PayableExchangeIssueAPI } from '@src/api';
import {
  NULL_ADDRESS,
  TX_DEFAULTS,
  ZERO,
  ONE_DAY_IN_SECONDS,
  DEFAULT_AUCTION_PRICE_NUMERATOR,
  DEFAULT_AUCTION_PRICE_DENOMINATOR,
  DEFAULT_UNIT_SHARES,
  DEFAULT_REBALANCING_NATURAL_UNIT,
} from '@src/constants';
import { Assertions } from '@src/assertions';
import {
  addAuthorizationAsync,
  addModuleAsync,
  approveForTransferAsync,
  createDefaultRebalancingSetTokenAsync,
  deployBaseContracts,
  deployCoreContract,
  deployExchangeIssueModuleAsync,
  deployPayableExchangeIssueAsync,
  deploySetTokenAsync,
  deployTokenAsync,
  deployTokensAsync,
  deployTokensSpecifyingDecimals,
  deployWethMockAsync,
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
import {
  Address,
  KyberTrade,
  Tx,
  ZeroExSignedFillOrder,
} from '@src/types/common';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
ChaiSetup.configure();
const { SetProtocolTestUtils: SetTestUtils, SetProtocolUtils: SetUtils, Web3Utils } = setProtocolUtils;
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const setUtils = new SetUtils(web3);
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;


describe('PayableExchangeIssueAPI', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let rebalancingSetTokenFactory: RebalancingSetTokenFactoryContract;
  let issuanceOrderModule: IssuanceOrderModuleContract;
  let rebalanceAuctionModule: RebalanceAuctionModuleContract;
  let whitelist: WhiteListContract;
  let payableExchangeIssue: PayableExchangeIssueContract;
  let wrappedEtherMock: WethMockContract;
  let exchangeIssueModule: ExchangeIssueModuleContract;
  let payableExchangeIssueWrapper: PayableExchangeIssueWrapper;

  let payableExchangeIssueAPI: PayableExchangeIssueAPI;

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

    const coreWrapper = new CoreWrapper(
      web3,
      core.address,
      transferProxy.address,
      vault.address,
      rebalanceAuctionModule.address,
    );

    exchangeIssueModule = await deployExchangeIssueModuleAsync(web3, core, transferProxy, vault);
    await addModuleAsync(core, exchangeIssueModule.address);
    await addAuthorizationAsync(transferProxy, exchangeIssueModule.address);
    await addAuthorizationAsync(vault, exchangeIssueModule.address);

    await deployZeroExExchangeWrapperContract(
      web3,
      SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,
      SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
      SetTestUtils.ZERO_EX_TOKEN_ADDRESS,
      transferProxy,
      core,
    );

    wrappedEtherMock = await deployWethMockAsync(web3, NULL_ADDRESS, ZERO);
    payableExchangeIssue = await deployPayableExchangeIssueAsync(
      web3,
      core,
      transferProxy,
      exchangeIssueModule,
      wrappedEtherMock,
    );

    payableExchangeIssueWrapper = new PayableExchangeIssueWrapper(
      web3,
      payableExchangeIssue.address,
    );

    const issuanceOrderWrapper = new IssuanceOrderModuleWrapper(
      web3,
      issuanceOrderModule.address,
    );

    const assertions = new Assertions(web3);
    assertions.setOrderAssertions(web3, coreWrapper, issuanceOrderWrapper);
    payableExchangeIssueAPI = new PayableExchangeIssueAPI(
      web3,
      coreWrapper,
      assertions,
      payableExchangeIssueWrapper,
      wrappedEtherMock.address,
    );
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('issueRebalancingSetWithEther', async () => {
    let subjectRebalancingSetAddress: Address;
    let subjectExchangeIssueData: ExchangeIssueParams;
    let subjectExchangeOrder: (KyberTrade | ZeroExSignedFillOrder)[];
    let subjectCaller: Address;
    let subjectEther: BigNumber;

    let zeroExOrderMaker: Address;

    let rebalancingSetQuantity: BigNumber;

    let baseSetToken: SetTokenContract;
    let baseSetNaturalUnit: BigNumber;
    let rebalancingSetToken: RebalancingSetTokenContract;
    let rebalancingUnitShares: BigNumber;

    let exchangeIssueSetAddress: Address;
    let exchangeIssueQuantity: BigNumber;
    let exchangeIssuePaymentToken: Address;
    let exchangeIssuePaymentTokenAmount: BigNumber;
    let exchangeIssueRequiredComponents: Address[];
    let exchangeIssueRequiredComponentAmounts: BigNumber[];

    let zeroExOrder: ZeroExSignedFillOrder;

    beforeEach(async () => {
      // Create component token (owned by 0x order maker)
      zeroExOrderMaker = ACCOUNTS[2].address;
      const [baseSetComponent] = await deployTokensSpecifyingDecimals(1, [18], web3, zeroExOrderMaker);

      // Create the Set (1 component)
      const componentAddresses = [baseSetComponent.address];
      const componentUnits = [new BigNumber(10 ** 10)];
      baseSetNaturalUnit = new BigNumber(10 ** 9);
      baseSetToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        baseSetNaturalUnit,
      );

      // Create the Rebalancing Set
      rebalancingUnitShares = DEFAULT_UNIT_SHARES;
      rebalancingSetToken = await createDefaultRebalancingSetTokenAsync(
        web3,
        core,
        rebalancingSetTokenFactory.address,
        DEFAULT_ACCOUNT,
        baseSetToken.address,
        ONE_DAY_IN_SECONDS,
      );

      subjectEther = new BigNumber(10 ** 10);

      // Generate exchange issue data
      exchangeIssueSetAddress = baseSetToken.address;
      exchangeIssueQuantity = new BigNumber(10 ** 10);
      exchangeIssuePaymentToken = wrappedEtherMock.address;
      exchangeIssuePaymentTokenAmount = subjectEther;
      exchangeIssueRequiredComponents = componentAddresses;
      exchangeIssueRequiredComponentAmounts = componentUnits.map(
        unit => unit.mul(exchangeIssueQuantity).div(baseSetNaturalUnit)
      );

      subjectExchangeIssueData = {
        setAddress: exchangeIssueSetAddress,
        paymentToken: exchangeIssuePaymentToken,
        paymentTokenAmount: exchangeIssuePaymentTokenAmount,
        quantity: exchangeIssueQuantity,
        requiredComponents: exchangeIssueRequiredComponents,
        requiredComponentAmounts: exchangeIssueRequiredComponentAmounts,
      };

      await approveForTransferAsync(
        [baseSetComponent],
        SetTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        zeroExOrderMaker
      );

      // Create 0x order for the component, using weth(4) paymentToken as default
      zeroExOrder = await setUtils.generateZeroExSignedFillOrder(
        NULL_ADDRESS,                                     // senderAddress
        zeroExOrderMaker,                                 // makerAddress
        NULL_ADDRESS,                                     // takerAddress
        ZERO,                                             // makerFee
        ZERO,                                             // takerFee
        subjectExchangeIssueData.requiredComponentAmounts[0],         // makerAssetAmount
        exchangeIssuePaymentTokenAmount,                  // takerAssetAmount
        exchangeIssueRequiredComponents[0],               // makerAssetAddress
        exchangeIssuePaymentToken,                        // takerAssetAddress
        SetUtils.generateSalt(),                          // salt
        SetTestUtils.ZERO_EX_EXCHANGE_ADDRESS,            // exchangeAddress
        NULL_ADDRESS,                                     // feeRecipientAddress
        SetTestUtils.generateTimestamp(10000),            // expirationTimeSeconds
        exchangeIssuePaymentTokenAmount,                  // amount of zeroExOrder to fill
      );

      subjectExchangeOrder = [zeroExOrder];
      subjectRebalancingSetAddress = rebalancingSetToken.address;
      rebalancingSetQuantity = exchangeIssueQuantity.mul(DEFAULT_REBALANCING_NATURAL_UNIT).div(rebalancingUnitShares);

      subjectCaller = ACCOUNTS[1].address;
    });

    async function subject(): Promise<string> {
      return await payableExchangeIssueAPI.issueRebalancingSetWithEtherAsync(
        subjectRebalancingSetAddress,
        subjectExchangeIssueData,
        subjectExchangeOrder,
        { from: subjectCaller, value: subjectEther.toString() }
      );
    }

    test('issues the rebalancing Set to the caller', async () => {
      const previousRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      const expectedRBSetTokenBalance = previousRBSetTokenBalance.add(rebalancingSetQuantity);

      await subject();

      const currentRBSetTokenBalance = await rebalancingSetToken.balanceOf.callAsync(subjectCaller);
      expect(expectedRBSetTokenBalance).to.bignumber.equal(currentRBSetTokenBalance);
    });

    describe('when the payment token is not wrapped ether', async () => {
      const notWrappedEther = ACCOUNTS[3].address;

      beforeEach(async () => {
        subjectExchangeIssueData.paymentToken = notWrappedEther;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Payment token at ${notWrappedEther} is not the expected wrapped ether token at ${wrappedEtherMock.address}`
        );
      });
    });

    describe('when a set address is not rebalancing Sets current set address', async () => {
      const notBaseSet = ACCOUNTS[3].address;

      beforeEach(async () => {
        subjectExchangeIssueData.setAddress = notBaseSet;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Set token at ${notBaseSet} is not the expected rebalancing set token current Set at ${baseSetToken.address}`
        );
      });
    });
  });
});