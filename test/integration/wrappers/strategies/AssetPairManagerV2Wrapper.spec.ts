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
import * as setProtocolUtils from 'set-protocol-utils';
import Web3 from 'web3';
import {
  CoreContract,
  FeeCalculatorHelper,
  SetTokenContract,
  RebalancingSetTokenV3Contract,
  RebalancingSetTokenV3FactoryContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TransferProxyContract,
  WhiteListContract,
} from 'set-protocol-contracts';

import {
  AssetPairManagerV2Contract,
  BinaryAllocatorContract,
  RSITrendingTriggerContract
} from 'set-protocol-strategies';

import {
  ConstantPriceOracleContract,
  MedianContract,
  RSIOracleContract,
  OracleProxyContract,
} from 'set-protocol-oracles';

import { ACCOUNTS, DEFAULT_ACCOUNT } from '@src/constants/accounts';
import { AssetPairManagerV2Wrapper } from '@src/wrappers';
import {
  E18,
  TX_DEFAULTS,
  ONE_DAY_IN_SECONDS,
  ONE_HOUR_IN_SECONDS,
  ZERO,
  ZERO_BYTES
} from '@src/constants';
import {
  addPriceFeedOwnerToMedianizer,
  addWhiteListedTokenAsync,
  approveContractToOracleProxy,
  approveForTransferAsync,
  createDefaultRebalancingSetTokenV3Async,
  deployAssetPairManagerV2Async,
  deployBaseContracts,
  deployBinaryAllocatorAsync,
  deployConstantPriceOracleAsync,
  deployLegacyMakerOracleAdapterAsync,
  deployLinearAuctionLiquidatorContractAsync,
  deployLinearizedPriceDataSourceAsync,
  deployMedianizerAsync,
  deployOracleProxyAsync,
  deployOracleWhiteListAsync,
  deployRebalancingSetTokenV3FactoryContractAsync,
  deployRSIOracleAsync,
  deployRSITrendingTriggerAsync,
  deploySetTokenAsync,
  deployTimeSeriesFeedAsync,
  deployTokensSpecifyingDecimals,
  deployWhiteListContract,
  increaseChainTimeAsync,
  initializeManagerAsync,
  updateMedianizerPriceAsync,
} from '@test/helpers';
import {
  BigNumber,
  ether
} from '@src/util';
import { Address } from '@src/types/common';

const Core = require('set-protocol-contracts/dist/artifacts/ts/Core').Core;

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const contract = require('truffle-contract');
const web3 = new Web3('http://localhost:8545');
const { SetProtocolTestUtils: SetTestUtils, Web3Utils } = setProtocolUtils;
const web3Utils = new Web3Utils(web3);

const coreContract = contract(Core);
coreContract.setProvider(web3.currentProvider);
coreContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;

describe('AssetPairManagerV2Wrapper', () => {
  let core: CoreContract;
  let transferProxy: TransferProxyContract;
  let factory: SetTokenFactoryContract;
  let rebalancingFactory: RebalancingSetTokenV3FactoryContract;
  let rebalancingComponentWhiteList: WhiteListContract;
  let assetPairManagerV2: AssetPairManagerV2Contract;
  let allocator: BinaryAllocatorContract;
  let trigger: RSITrendingTriggerContract;

  let rsiOracle: RSIOracleContract;
  let ethMedianizer: MedianContract;
  let ethOracleProxy: OracleProxyContract;
  let usdcOracle: ConstantPriceOracleContract;

  let usdc: StandardTokenMockContract;
  let wrappedETH: StandardTokenMockContract;
  let initialQuoteCollateral: SetTokenContract;
  let initialBaseCollateral: SetTokenContract;
  let rebalancingSetToken: RebalancingSetTokenV3Contract;

  let seededPriceFeedPrices: BigNumber[];

  let assetPairManagerV2Wrapper: AssetPairManagerV2Wrapper;

  const useBullishBaseAssetAllocation = true;
  const allocationDenominator = new BigNumber(100);
  const bullishBaseAssetAllocation = new BigNumber(100);
  const bearishBaseAssetAllocation = allocationDenominator.sub(bullishBaseAssetAllocation);

  const signalConfirmationMinTime = ONE_HOUR_IN_SECONDS.mul(6);
  const signalConfirmationMaxTime = ONE_HOUR_IN_SECONDS.mul(12);

  const initialMedianizerEthPrice: BigNumber = E18;
  const priceFeedDataDescription: string = '200DailyETHPrice';

  const rsiTimePeriod = new BigNumber(14);
  const lowerBound = new BigNumber(40);
  const upperBound = new BigNumber(60);

  const quoteCollateralUnit = new BigNumber(250);
  const quoteCollateralNaturalUnit = new BigNumber(10 ** 12);

  const baseCollateralUnit = new BigNumber(10 ** 6);
  const baseCollateralNaturalUnit = new BigNumber(10 ** 6);

  const feeCalculatorHelper = new FeeCalculatorHelper(DEFAULT_ACCOUNT);

  beforeAll(() => {
    ABIDecoder.addABI(coreContract.abi);
    seededPriceFeedPrices = _.map(new Array(15), function(el, i) {return new BigNumber((170 - i) * 10 ** 18); });
  });

  afterAll(() => {
    ABIDecoder.removeABI(coreContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    [
      core,
      transferProxy, ,
      factory,
      ,
      ,
      rebalancingComponentWhiteList,
    ] = await deployBaseContracts(web3);

    ethMedianizer = await deployMedianizerAsync(web3);
    await addPriceFeedOwnerToMedianizer(ethMedianizer, DEFAULT_ACCOUNT);
    await updateMedianizerPriceAsync(
      web3,
      ethMedianizer,
      initialMedianizerEthPrice,
      SetTestUtils.generateTimestamp(1000),
    );

    const medianizerAdapter = await deployLegacyMakerOracleAdapterAsync(
      web3,
      ethMedianizer.address
    );

    ethOracleProxy = await deployOracleProxyAsync(
      web3,
      medianizerAdapter.address
    );

    usdcOracle = await deployConstantPriceOracleAsync(
      web3,
      new BigNumber(10 ** 18)
    );

    const dataSource = await deployLinearizedPriceDataSourceAsync(
      web3,
      ethOracleProxy.address,
      ONE_HOUR_IN_SECONDS,
      ''
    );

    await approveContractToOracleProxy(
      ethOracleProxy,
      dataSource.address
    );

    const timeSeriesFeed = await deployTimeSeriesFeedAsync(
      web3,
      dataSource.address,
      seededPriceFeedPrices
    );

    rsiOracle = await deployRSIOracleAsync(
      web3,
      timeSeriesFeed.address,
      priceFeedDataDescription
    );

    [usdc, wrappedETH] = await deployTokensSpecifyingDecimals(2, [6, 18], web3, DEFAULT_ACCOUNT);
    await approveForTransferAsync(
      [usdc, wrappedETH],
      transferProxy.address
    );
    await addWhiteListedTokenAsync(
      rebalancingComponentWhiteList,
      usdc.address,
    );
    await addWhiteListedTokenAsync(
      rebalancingComponentWhiteList,
      wrappedETH.address,
    );

    const oracleWhiteList = await deployOracleWhiteListAsync(
      web3,
      [wrappedETH.address, usdc.address],
      [ethOracleProxy.address, usdcOracle.address],
    );

    const liquidator = await deployLinearAuctionLiquidatorContractAsync(
      web3,
      core,
      oracleWhiteList
    );
    const liquidatorWhiteList = await deployWhiteListContract(web3, [liquidator.address]);

    const maxProfitFeePercentage = ether(.4);
    const maxStreamingFeePercentage = ether(.07);
    const performanceFeeCalculator = await feeCalculatorHelper.deployPerformanceFeeCalculatorAsync(
      core.address,
      oracleWhiteList.address,
      maxProfitFeePercentage,
      maxStreamingFeePercentage,
    );

    const feeCalculatorWhiteList = await deployWhiteListContract(web3, [performanceFeeCalculator.address]);
    console.log(performanceFeeCalculator.address, feeCalculatorWhiteList.address);

    rebalancingFactory = await deployRebalancingSetTokenV3FactoryContractAsync(
      web3,
      core,
      rebalancingComponentWhiteList,
      liquidatorWhiteList,
      feeCalculatorWhiteList
    );

    console.log(rebalancingFactory.address);

    // Create Stable Collateral Set
    initialQuoteCollateral = await deploySetTokenAsync(
      web3,
      core,
      factory.address,
      [usdc.address],
      [quoteCollateralUnit],
      quoteCollateralNaturalUnit,
    );

    // Create Risk Collateral Set
    initialBaseCollateral = await deploySetTokenAsync(
      web3,
      core,
      factory.address,
      [wrappedETH.address],
      [baseCollateralUnit],
      baseCollateralNaturalUnit,
    );

    allocator = await deployBinaryAllocatorAsync(
      web3,
      wrappedETH.address,
      usdc.address,
      ethOracleProxy.address,
      usdcOracle.address,
      initialBaseCollateral.address,
      initialQuoteCollateral.address,
      core.address,
      factory.address
    );

    trigger = await deployRSITrendingTriggerAsync(
      web3,
      rsiOracle.address,
      lowerBound,
      upperBound,
      rsiTimePeriod
    );

    const liquidatorData = ZERO_BYTES;
    assetPairManagerV2 = await deployAssetPairManagerV2Async(
      web3,
      core.address,
      allocator.address,
      trigger.address,
      useBullishBaseAssetAllocation,
      allocationDenominator,
      bullishBaseAssetAllocation,
      signalConfirmationMinTime,
      signalConfirmationMaxTime,
      liquidatorData
    );

    await assetPairManagerV2.setTimeLockPeriod.sendTransactionAsync(ONE_DAY_IN_SECONDS, { from: DEFAULT_ACCOUNT });

    console.log(assetPairManagerV2.address);

    await approveContractToOracleProxy(
      ethOracleProxy,
      trigger.address
    );

    await approveContractToOracleProxy(
      ethOracleProxy,
      allocator.address
    );

    // Deploy a RB Set
    const rbSetFeeRecipient = ACCOUNTS[2].address;
    const rebalanceFeeCalculator = performanceFeeCalculator.address;
    const failRebalancePeriod = ONE_DAY_IN_SECONDS;
    const { timestamp } = await web3.eth.getBlock('latest');
    const lastRebalanceTimestamp = new BigNumber(timestamp);
    const rbSetEntryFee = ether(.01);
    const rbSetProfitFee = ether(.2);
    const rbSetStreamingFee = ether(.02);
    console.log('hserse');
    rebalancingSetToken = await createDefaultRebalancingSetTokenV3Async(
      web3,
      core,
      rebalancingFactory.address,
      assetPairManagerV2.address,
      liquidator.address,
      rbSetFeeRecipient,
      rebalanceFeeCalculator,
      initialBaseCollateral.address,
      failRebalancePeriod,
      lastRebalanceTimestamp,
      rbSetEntryFee,
      rbSetProfitFee,
      rbSetStreamingFee
    );
    console.log(rebalancingSetToken.address);
    await initializeManagerAsync(
      assetPairManagerV2,
      rebalancingSetToken.address
    );

    assetPairManagerV2Wrapper = new AssetPairManagerV2Wrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe.only('core', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = assetPairManagerV2.address;
    });

    async function subject(): Promise<Address> {
      return await assetPairManagerV2Wrapper.core(
        subjectManagerAddress,
      );
    }

    test('gets the correct core', async () => {
      const address = await subject();
      expect(address).to.equal(core.address);
    });
  });

  describe('allocator', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = assetPairManagerV2.address;
    });

    async function subject(): Promise<Address> {
      return await assetPairManagerV2Wrapper.allocator(
        subjectManagerAddress,
      );
    }

    test('gets the correct core', async () => {
      const address = await subject();
      expect(address).to.equal(allocator.address);
    });
  });

  describe('trigger', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = assetPairManagerV2.address;
    });

    async function subject(): Promise<Address> {
      return await assetPairManagerV2Wrapper.trigger(
        subjectManagerAddress,
      );
    }

    test('gets the correct core', async () => {
      const address = await subject();
      expect(address).to.equal(trigger.address);
    });
  });

  describe('rebalancingSetToken', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = assetPairManagerV2.address;
    });

    async function subject(): Promise<Address> {
      return await assetPairManagerV2Wrapper.rebalancingSetToken(
        subjectManagerAddress,
      );
    }

    test('gets the correct rebalancingSetToken', async () => {
      const address = await subject();
      expect(address).to.equal(rebalancingSetToken.address);
    });
  });

  describe('baseAssetAllocation', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = assetPairManagerV2.address;
    });

    async function subject(): Promise<BigNumber> {
      return await assetPairManagerV2Wrapper.baseAssetAllocation(
        subjectManagerAddress,
      );
    }

    test('gets the correct baseAssetAllocation', async () => {
      const address = await subject();
      const baseAssetAllocation = useBullishBaseAssetAllocation ? new BigNumber(100) : ZERO;

      expect(address).to.be.bignumber.equal(baseAssetAllocation);
    });
  });

  describe('allocationDenominator', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = assetPairManagerV2.address;
    });

    async function subject(): Promise<BigNumber> {
      return await assetPairManagerV2Wrapper.allocationDenominator(
        subjectManagerAddress,
      );
    }

    test('gets the correct allocationDenominator', async () => {
      const address = await subject();
      expect(address).to.be.bignumber.equal(allocationDenominator);
    });
  });

  describe('bullishBaseAssetAllocation', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = assetPairManagerV2.address;
    });

    async function subject(): Promise<BigNumber> {
      return await assetPairManagerV2Wrapper.bullishBaseAssetAllocation(
        subjectManagerAddress,
      );
    }

    test('gets the correct bullishBaseAssetAllocation', async () => {
      const address = await subject();
      expect(address).to.be.bignumber.equal(bullishBaseAssetAllocation);
    });
  });

  describe('bearishBaseAssetAllocation', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = assetPairManagerV2.address;
    });

    async function subject(): Promise<BigNumber> {
      return await assetPairManagerV2Wrapper.bearishBaseAssetAllocation(
        subjectManagerAddress,
      );
    }

    test('gets the correct bearishBaseAssetAllocation', async () => {
      const address = await subject();
      expect(address).to.be.bignumber.equal(bearishBaseAssetAllocation);
    });
  });

  describe('signalConfirmationMinTime', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = assetPairManagerV2.address;
    });

    async function subject(): Promise<BigNumber> {
      return await assetPairManagerV2Wrapper.signalConfirmationMinTime(
        subjectManagerAddress,
      );
    }

    test('gets the correct signalConfirmationMinTime', async () => {
      const address = await subject();
      expect(address).to.be.bignumber.equal(signalConfirmationMinTime);
    });
  });

  describe('signalConfirmationMaxTime', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = assetPairManagerV2.address;
    });

    async function subject(): Promise<BigNumber> {
      return await assetPairManagerV2Wrapper.signalConfirmationMaxTime(
        subjectManagerAddress,
      );
    }

    test('gets the correct signalConfirmationMaxTime', async () => {
      const address = await subject();
      expect(address).to.be.bignumber.equal(signalConfirmationMaxTime);
    });
  });

  describe('recentInitialProposeTimestamp', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = assetPairManagerV2.address;
    });

    async function subject(): Promise<BigNumber> {
      return await assetPairManagerV2Wrapper.recentInitialProposeTimestamp(
        subjectManagerAddress,
      );
    }

    test('gets the correct recentInitialProposeTimestamp', async () => {
      const address = await subject();
      expect(address).to.be.bignumber.equal(ZERO);
    });
  });

  describe('initialPropose', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = assetPairManagerV2.address;

      // Elapse the rebalance interval
      await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

      await updateMedianizerPriceAsync(
        web3,
        ethMedianizer,
        initialMedianizerEthPrice.div(10),
        SetTestUtils.generateTimestamp(1000),
      );
    });

    async function subject(): Promise<string> {
      return await assetPairManagerV2Wrapper.initialPropose(
        subjectManagerAddress,
      );
    }

    test('sets the recentInitialProposeTimestamp properly', async () => {
      const txnHash = await subject();
      const { blockNumber } = await web3.eth.getTransactionReceipt(txnHash);
      const { timestamp } = await web3.eth.getBlock(blockNumber);

      const lastTimestamp = await assetPairManagerV2Wrapper.recentInitialProposeTimestamp(
        subjectManagerAddress,
      );
      expect(lastTimestamp).to.bignumber.equal(timestamp);
    });
  });

  describe('confirmPropose', async () => {
    let subjectManagerAddress: Address;

    beforeEach(async () => {
      subjectManagerAddress = assetPairManagerV2.address;

      // Elapse the rebalance interval
      await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

      await updateMedianizerPriceAsync(
        web3,
        ethMedianizer,
        initialMedianizerEthPrice.div(4),
        SetTestUtils.generateTimestamp(1000),
      );

      await assetPairManagerV2.initialPropose.sendTransactionAsync();

      // Elapse the signal confirmation period
      await increaseChainTimeAsync(web3, ONE_HOUR_IN_SECONDS.mul(7));
    });

    async function subject(): Promise<string> {
      return await assetPairManagerV2Wrapper.confirmPropose(
        subjectManagerAddress,
      );
    }

    test('sets the rebalancing Set into proposal period', async () => {
      await subject();
      const proposalStateEnum = new BigNumber(1);
      const rebalancingSetState = await rebalancingSetToken.rebalanceState.callAsync();

      expect(rebalancingSetState).to.bignumber.equal(proposalStateEnum);
    });
  });

  describe('canInitialPropose', async () => {
    let subjectManagerAddress: Address;
    let subjectTimeFastForward: BigNumber;

    beforeEach(async () => {
      subjectManagerAddress = assetPairManagerV2.address;
      subjectTimeFastForward = ONE_DAY_IN_SECONDS;

      await updateMedianizerPriceAsync(
        web3,
        ethMedianizer,
        initialMedianizerEthPrice.div(10),
        SetTestUtils.generateTimestamp(1000),
      );
    });

    async function subject(): Promise<boolean> {
      await increaseChainTimeAsync(web3, subjectTimeFastForward);
      return await assetPairManagerV2Wrapper.canInitialPropose(
        subjectManagerAddress,
      );
    }

    test('sets the recentInitialProposeTimestamp properly', async () => {
      const canInitialPropose = await subject();

      expect(canInitialPropose).to.be.true;
    });

    describe('when initialPropose not valid', async () => {
      beforeEach(async () => {
        subjectTimeFastForward = ZERO;
      });

      test('returns false', async () => {
        const canInitialPropose = await subject();

        expect(canInitialPropose).to.be.false;
      });
    });
  });

  describe('canConfirmPropose', async () => {
    let subjectManagerAddress: Address;
    let subjectTimeFastForward: BigNumber;

    beforeEach(async () => {
      subjectManagerAddress = assetPairManagerV2.address;
      subjectTimeFastForward = ONE_HOUR_IN_SECONDS.mul(7);

      // Elapse the rebalance interval
      await increaseChainTimeAsync(web3, ONE_DAY_IN_SECONDS);

      await updateMedianizerPriceAsync(
        web3,
        ethMedianizer,
        initialMedianizerEthPrice.div(4),
        SetTestUtils.generateTimestamp(1000),
      );

      await assetPairManagerV2.initialPropose.sendTransactionAsync();
    });

    async function subject(): Promise<boolean> {
      await increaseChainTimeAsync(web3, subjectTimeFastForward);
      return await assetPairManagerV2Wrapper.canConfirmPropose(
        subjectManagerAddress,
      );
    }

    test('sets the recentInitialProposeTimestamp properly', async () => {
      const canInitialPropose = await subject();

      expect(canInitialPropose).to.be.true;
    });

    describe('when initialPropose not valid', async () => {
      beforeEach(async () => {
        subjectTimeFastForward = ZERO;
      });

      test('returns false', async () => {
        const canInitialPropose = await subject();

        expect(canInitialPropose).to.be.false;
      });
    });
  });
});
