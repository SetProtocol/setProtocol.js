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

import Web3 from 'web3';

import {
  BaseContract,
  BTCDaiRebalancingManagerContract,
  BTCETHRebalancingManagerContract,
  ETHDaiRebalancingManagerContract,
  HistoricalPriceFeedContract,
  MACOStrategyManagerContract,
  MovingAverageOracleContract
} from 'set-protocol-strategies';

import { Address } from '../../types/common';

/**
 * @title ContractWrapper
 * @author Set Protocol
 *
 * The Contracts API handles all functions that load contracts
 *
 */
export class ContractWrapper {
  private web3: Web3;
  private cache: { [contractName: string]: BaseContract };

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.cache = {};
  }

  /**
   * Load a HistoricalPriceFeed contract
   *
   * @param  historicalPriceFeed          Address of the HistoricalPriceFeed contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The HistoricalPriceFeed Contract
   */
  public async loadHistoricalPriceFeedContract(
    historicalPriceFeed: Address,
    transactionOptions: object = {},
  ): Promise<HistoricalPriceFeedContract> {
    const cacheKey = `HistoricalPriceFeed_${historicalPriceFeed}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as HistoricalPriceFeedContract;
    } else {
      const historicalPriceFeedContract = await HistoricalPriceFeedContract.at(
        historicalPriceFeed,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = historicalPriceFeedContract;
      return historicalPriceFeedContract;
    }
  }

  /**
   * Load a MovingAverageOracle contract
   *
   * @param  movingAveragesOracle         Address of the MovingAveragesOracle contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The MovingAveragesOracle Contract
   */
  public async loadMovingAverageOracleContract(
    movingAveragesOracle: Address,
    transactionOptions: object = {},
  ): Promise<MovingAverageOracleContract> {
    const cacheKey = `MovingAverageOracle_${movingAveragesOracle}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as MovingAverageOracleContract;
    } else {
      const movingAverageOracleContract = await MovingAverageOracleContract.at(
        movingAveragesOracle,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = movingAverageOracleContract;
      return movingAverageOracleContract;
    }
  }

  /**
   * Load BTCETHManagerContract contract
   *
   * @param  btcEthManagerAddress           Address of the BTCETHRebalancingManagerContract contract
   * @param  transactionOptions             Options sent into the contract deployed method
   * @return                                The BtcEthManagerContract Contract
   */
  public async loadBtcEthManagerContractAsync(
    btcEthManagerAddress: Address,
    transactionOptions: object = {},
  ): Promise<BTCETHRebalancingManagerContract> {
    const cacheKey = `BtcEthManager_${btcEthManagerAddress}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as BTCETHRebalancingManagerContract;
    } else {
      const btcEthRebalancingManagerContract = await BTCETHRebalancingManagerContract.at(
        btcEthManagerAddress,
        this.web3,
        transactionOptions
      );
      this.cache[cacheKey] = btcEthRebalancingManagerContract;
      return btcEthRebalancingManagerContract;
    }
  }

  /**
   * Load a BTCDAIRebalancingManager contract
   *
   * @param  btcDaiManager                Address of the BTCDAIRebalancingManager contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The BTCDAIRebalancingManager Contract
   */
  public async loadBtcDaiManagerContractAsync(
    btcDaiManager: Address,
    transactionOptions: object = {},
  ): Promise<BTCDaiRebalancingManagerContract> {
    const cacheKey = `btcDaiManager_${btcDaiManager}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as BTCDaiRebalancingManagerContract;
    } else {
      const btcDaiRebalancingManagerContract = await BTCDaiRebalancingManagerContract.at(
        btcDaiManager,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = btcDaiRebalancingManagerContract;
      return btcDaiRebalancingManagerContract;
    }
  }

  /**
   * Load a ETHDAIRebalancingManager contract
   *
   * @param  ethDaiManager                Address of the ETHDAIRebalancingManager contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The ETHDAIRebalancingManager Contract
   */
  public async loadEthDaiManagerContractAsync(
    ethDaiManager: Address,
    transactionOptions: object = {},
  ): Promise<ETHDaiRebalancingManagerContract> {
    const cacheKey = `ethDaiManager_${ethDaiManager}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as ETHDaiRebalancingManagerContract;
    } else {
      const ethDaiRebalancingManagerContract = await ETHDaiRebalancingManagerContract.at(
        ethDaiManager,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = ethDaiRebalancingManagerContract;
      return ethDaiRebalancingManagerContract;
    }
  }

  /**
   * Load a MACOStrategyManager contract
   *
   * @param  macoStrategyManager          Address of the MACOStrategyManager contract
   * @param  transactionOptions           Options sent into the contract deployed method
   * @return                              The MACOStrategyManager Contract
   */
  public async loadMACOStrategyManagerContractAsync(
    macoStrategyManager: Address,
    transactionOptions: object = {},
  ): Promise<MACOStrategyManagerContract> {
    const cacheKey = `macoStrategyManager_${macoStrategyManager}`;

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as MACOStrategyManagerContract;
    } else {
      const macoStrategyManagerContract = await MACOStrategyManagerContract.at(
        macoStrategyManager,
        this.web3,
        transactionOptions,
      );
      this.cache[cacheKey] = macoStrategyManagerContract;
      return macoStrategyManagerContract;
    }
  }
}
