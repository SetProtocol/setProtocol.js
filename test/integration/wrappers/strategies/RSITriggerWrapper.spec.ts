/*
  Copyright 2019 Set Labs Inc.

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
import * as chai from 'chai';
import * as setProtocolUtils from 'set-protocol-utils';
import Web3 from 'web3';
import { MedianContract } from 'set-protocol-contracts';
import {
  OracleProxyContract,
  RSIOracleContract,
  RSITrendingTriggerContract,
} from 'set-protocol-strategies';

import { DEFAULT_ACCOUNT } from '@src/constants/accounts';
import { RSITriggerWrapper } from '@src/wrappers';
import {
  ONE_HOUR_IN_SECONDS
} from '@src/constants';

import {
  addPriceFeedOwnerToMedianizer,
  approveContractToOracleProxy,
  deployLegacyMakerOracleAdapterAsync,
  deployLinearizedPriceDataSourceAsync,
  deployMedianizerAsync,
  deployOracleProxyAsync,
  deployRSIOracleAsync,
  deployRSITrendingTriggerAsync,
  deployTimeSeriesFeedAsync,
  expectRevertError,
} from '@test/helpers';
import { Address } from '@src/types/common';
import {
  BigNumber,
} from '@src/util';

const chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(BigNumber));
const { expect } = chai;
const web3 = new Web3('http://localhost:8545');
const { Web3Utils } = setProtocolUtils;
const web3Utils = new Web3Utils(web3);

let currentSnapshotId: number;

describe('RSITriggerWrapper', () => {
  let ethMedianizer: MedianContract;
  let ethOracleProxy: OracleProxyContract;

  let rsiOracle: RSIOracleContract;
  let rsiTrigger: RSITrendingTriggerContract;

  const rsiLowerBound: BigNumber = new BigNumber(40);
  const rsiUpperBound: BigNumber = new BigNumber(60);
  const rsiTimePeriod: BigNumber = new BigNumber(14);

  let seededPriceFeedPrices: BigNumber[];

  let rsiTriggerWrapper: RSITriggerWrapper;

  beforeAll(async () => {
    seededPriceFeedPrices = _.map(new Array(20), function(el, i) {return new BigNumber((150 + i) * 10 ** 18); });
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    ethMedianizer = await deployMedianizerAsync(web3);
    await addPriceFeedOwnerToMedianizer(ethMedianizer, DEFAULT_ACCOUNT);

    const medianizerAdapter = await deployLegacyMakerOracleAdapterAsync(
      web3,
      ethMedianizer.address
    );

    ethOracleProxy = await deployOracleProxyAsync(
      web3,
      medianizerAdapter.address
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
      'ETHRSIOracle'
    );


    rsiTrigger = await deployRSITrendingTriggerAsync(
      web3,
      rsiOracle.address,
      rsiLowerBound,
      rsiUpperBound,
      rsiTimePeriod
    );

    rsiTriggerWrapper = new RSITriggerWrapper(web3);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('rsiOracle', async () => {
    let subjectTriggerAddress: Address;

    beforeEach(async () => {
      subjectTriggerAddress = rsiTrigger.address;
    });

    async function subject(): Promise<Address> {
      return await rsiTriggerWrapper.rsiOracle(
        subjectTriggerAddress,
      );
    }

    test('gets the correct rsiOracle', async () => {
      const address = await subject();
      expect(address).to.equal(rsiOracle.address);
    });
  });

  describe('lowerBound', async () => {
    let subjectTriggerAddress: Address;

    beforeEach(async () => {
      subjectTriggerAddress = rsiTrigger.address;
    });

    async function subject(): Promise<BigNumber> {
      return await rsiTriggerWrapper.lowerBound(
        subjectTriggerAddress,
      );
    }

    test('gets the correct lowerBound', async () => {
      const lowerBound = await subject();
      expect(lowerBound).to.be.bignumber.equal(rsiLowerBound);
    });
  });

  describe('upperBound', async () => {
    let subjectTriggerAddress: Address;

    beforeEach(async () => {
      subjectTriggerAddress = rsiTrigger.address;
    });

    async function subject(): Promise<BigNumber> {
      return await rsiTriggerWrapper.upperBound(
        subjectTriggerAddress,
      );
    }

    test('gets the correct upperBound', async () => {
      const upperBound = await subject();
      expect(upperBound).to.be.bignumber.equal(rsiUpperBound);
    });
  });

  describe('rsiTimePeriod', async () => {
    let subjectTriggerAddress: Address;

    beforeEach(async () => {
      subjectTriggerAddress = rsiTrigger.address;
    });

    async function subject(): Promise<BigNumber> {
      return await rsiTriggerWrapper.rsiTimePeriod(
        subjectTriggerAddress,
      );
    }

    test('gets the correct rsiTimePeriod', async () => {
      const timePeriod = await subject();
      expect(timePeriod).to.be.bignumber.equal(rsiTimePeriod);
    });
  });

  describe('isBullish', async () => {
    let subjectTriggerAddress: Address;

    beforeEach(async () => {
      subjectTriggerAddress = rsiTrigger.address;
    });

    async function subject(): Promise<boolean> {
      return await rsiTriggerWrapper.isBullish(
        subjectTriggerAddress,
      );
    }

    test('returns correct isBullish value', async () => {
      const isBullish = await subject();
      const expectedIsBullish = await rsiTrigger.isBullish.callAsync();

      expect(isBullish).to.equal(expectedIsBullish);
    });

    describe('when canConfirmPropose should throw a revert', async () => {
      beforeAll(async () => {
        seededPriceFeedPrices = [
          new BigNumber(170 * 10 ** 18),
          new BigNumber(150 * 10 ** 18),
          new BigNumber(170 * 10 ** 18),
          new BigNumber(150 * 10 ** 18),
          new BigNumber(170 * 10 ** 18),
          new BigNumber(150 * 10 ** 18),
          new BigNumber(170 * 10 ** 18),
          new BigNumber(150 * 10 ** 18),
          new BigNumber(170 * 10 ** 18),
          new BigNumber(150 * 10 ** 18),
          new BigNumber(170 * 10 ** 18),
          new BigNumber(150 * 10 ** 18),
          new BigNumber(170 * 10 ** 18),
          new BigNumber(150 * 10 ** 18),
          new BigNumber(170 * 10 ** 18),
        ];
      });

      afterAll(async () => {
        seededPriceFeedPrices = _.map(new Array(15), function(el, i) {return new BigNumber((170 - i) * 10 ** 18); });
      });

      test('should revert', async () => {
        await expectRevertError(subject());
      });
    });
  });
});