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

import Web3 from 'web3';

import { Address, RebalancingSetStatus } from '../../types/common';
import { BigNumber } from '../../util';
import { ProtocolContractWrapper } from './ProtocolContractWrapper';

/**
 * @title  ProtocolViewerWrapper
 * @author Set Protocol
 *
 * The ProtocolViewerWrapper handles all functions on the Protocol Viewer smart contract.
 *
 */
export class ProtocolViewerWrapper {
  private web3: Web3;
  private contracts: ProtocolContractWrapper;
  private protocolViewerAddress: Address;

  public constructor(web3: Web3, protocolViewerAddress: Address) {
    this.web3 = web3;
    this.protocolViewerAddress = protocolViewerAddress;
    this.contracts = new ProtocolContractWrapper(this.web3);
  }

  /**
   * Fetches multiple balances for passed in array of ERC20 contract addresses for an owner
   *
   * @param  tokenAddresses    Addresses of ERC20 contracts to check balance for
   * @param  owner             Address to check balance of tokenAddress for
   */
  public async batchFetchBalancesOf(
    tokenAddresses: Address[],
    owner: Address,
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchBalancesOf.callAsync(tokenAddresses, owner);
  }

  /**
   * Fetches token balances for each tokenAddress, tokenOwner pair
   *
   * @param  tokenAddresses    Addresses of ERC20 contracts to check balance for
   * @param  tokenOwners       Addresses of users sequential to tokenAddress to fetch balance for
   */
  public async batchFetchUsersBalances(
    tokenAddresses: Address[],
    tokenOwners: Address[],
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchUsersBalances.callAsync(tokenAddresses, tokenOwners);
  }

  /**
   * Fetches multiple supplies for passed in array of ERC20 contract addresses
   *
   * @param  tokenAddresses    Addresses of ERC20 contracts to check supply for
   */
  public async batchFetchSupplies(
    tokenAddresses: Address[],
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchSupplies.callAsync(tokenAddresses);
  }

  /**
   * Fetches all RebalancingSetToken state associated with a rebalance proposal
   *
   * @param  rebalancingSetTokenAddress    RebalancingSetToken contract instance address
   */
  public async fetchRebalanceProposalStateAsync(
    rebalancingSetTokenAddress: Address,
  ): Promise<any> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.fetchRebalanceProposalStateAsync.callAsync(rebalancingSetTokenAddress);
  }

  /**
   * Fetches all RebalancingSetToken state associated with a new rebalance auction
   *
   * @param  rebalancingSetTokenAddress    RebalancingSetToken contract instance address
   */
  public async fetchRebalanceAuctionStateAsync(
    rebalancingSetTokenAddress: Address,
  ): Promise<any> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.fetchRebalanceAuctionStateAsync.callAsync(rebalancingSetTokenAddress);
  }

  /**
   * Fetches all rebalance states for an array of RebalancingSetToken contracts
   *
   * @param  rebalancingSetTokenAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchRebalanceStateAsync(
    rebalancingSetTokenAddresses: Address[],
  ): Promise<any> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchRebalanceStateAsync.callAsync(rebalancingSetTokenAddresses);
  }

  /**
   * Fetches all unitShares for an array of RebalancingSetToken contracts
   *
   * @param  rebalancingSetTokenAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchUnitSharesAsync(
    rebalancingSetTokenAddresses: Address[],
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchUnitSharesAsync.callAsync(rebalancingSetTokenAddresses);
  }

  /**
   * Fetches state of trading pool info, underlying RebalancingSetTokenV2, and current collateralSet.
   *
   * @param  tradingPoolAddress      RebalancingSetTokenV2 contract address of tradingPool
   */
  public async fetchNewTradingPoolDetails(
    tradingPoolAddress: Address,
  ): Promise<any> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.fetchNewTradingPoolDetails.callAsync(tradingPoolAddress);
  }

  /**
   * Fetches state of trading pool v2 info, underlying RebalancingSetTokenV3, performance fee info
   * and current collateralSet.
   *
   * @param  tradingPoolAddress      RebalancingSetTokenV3 contract address of tradingPool
   */
  public async fetchNewTradingPoolV2Details(
    tradingPoolAddress: Address,
  ): Promise<any> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.fetchNewTradingPoolV2Details.callAsync(tradingPoolAddress);
  }

  /**
   * Fetches rebalance state of trading pool info, underlying RebalancingSetTokenV2, and current
   * collateralSet.
   *
   * @param  tradingPoolAddress      RebalancingSetTokenV2 contract address of tradingPool
   */
  public async fetchTradingPoolRebalanceDetails(
    tradingPoolAddress: Address,
  ): Promise<any> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.fetchTradingPoolRebalanceDetails.callAsync(tradingPoolAddress);
  }

  /**
   * Fetches rebalance state of a TWAP auction including info about underlying RebalancingSetTokenV2/V3, and
   * next collateralSet.
   *
   * @param  tradingPoolAddress      RebalancingSetTokenV2/V3 contract address
   */
  public async fetchRBSetTWAPRebalanceDetails(
    rebalancingSetTokenAddress: Address,
  ): Promise<any> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.fetchRBSetTWAPRebalanceDetails.callAsync(rebalancingSetTokenAddress);
  }

  /**
   * Fetches rebalance state of a TWAP auction including info about the trading pool from the manager,
   *  underlying RebalancingSetTokenV2/V3 info, and next collateralSet.
   *
   * @param  tradingPoolAddress      RebalancingSetTokenV2/V3 contract address of tradingPool
   */
  public async fetchTradingPoolTWAPRebalanceDetails(
    tradingPoolAddress: Address,
  ): Promise<any> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.fetchTradingPoolTWAPRebalanceDetails.callAsync(tradingPoolAddress);
  }

  /**
   * Fetches all liquidator addresses for an array of RebalancingSetTokens
   *
   * @param  rebalancingSetAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchLiquidator(
    rebalancingSetAddresses: Address[],
  ): Promise<string[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchLiquidator.callAsync(rebalancingSetAddresses);
  }

  /**
   * Fetches rebalanceState and currentSet for an array of RebalancingSetTokens
   *
   * @param  rebalancingSetAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchStateAndCollateral(
    rebalancingSetAddresses: Address[],
  ): Promise<RebalancingSetStatus[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchStateAndCollateral.callAsync(rebalancingSetAddresses);
  }

  /**
   * Fetches all trading pool operators for an array of trading pools
   *
   * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchTradingPoolOperator(
    tradingPoolAddresses: Address[],
  ): Promise<string[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchTradingPoolOperator.callAsync(tradingPoolAddresses);
  }

  /**
   * Fetches all entry fees for an array of trading pools
   *
   * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchTradingPoolEntryFees(
    tradingPoolAddresses: Address[],
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchTradingPoolEntryFees.callAsync(tradingPoolAddresses);
  }

  /**
   * Fetches all rebalance fees for an array of trading pools
   *
   * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchTradingPoolRebalanceFees(
    tradingPoolAddresses: Address[],
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchTradingPoolRebalanceFees.callAsync(tradingPoolAddresses);
  }

  /**
   * Fetches all profit and streaming fees for an array of trading pools
   *
   * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchTradingPoolAccumulation(
    tradingPoolAddresses: Address[],
  ): Promise<any[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchTradingPoolAccumulation.callAsync(tradingPoolAddresses);
  }

  /**
   * Fetches all performance fee state info for an array of trading pools
   *
   * @param  tradingPoolAddresses[]    RebalancingSetToken contract instance addresses
   */
  public async batchFetchTradingPoolFeeState(
    tradingPoolAddresses: Address[],
  ): Promise<any[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchTradingPoolFeeState.callAsync(tradingPoolAddresses);
  }

  /**
   * Fetches cToken exchange rate stored for an array of cToken addresses
   *
   * @param  cTokenAddresses[]    CToken contract instance addresses
   */
  public async batchFetchExchangeRateStored(
    cTokenAddresses: Address[],
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchExchangeRateStored.callAsync(cTokenAddresses);
  }

  /**
   * Fetches the crossover confirmation timestamp given an array of MACO V2 managers
   *
   * @param  managerAddresses[]    Manager contract instance addresses
   */
  public async batchFetchMACOV2CrossoverTimestamp(
    managerAddresses: Address[],
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchMACOV2CrossoverTimestamp.callAsync(managerAddresses);
  }

  /**
   * Fetches the crossover confirmation timestamp given an array of Asset Pair managers
   *
   * @param  managerAddresses[]    Manager contract instance addresses
   */
  public async batchFetchAssetPairCrossoverTimestamp(
    managerAddresses: Address[],
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchAssetPairCrossoverTimestamp.callAsync(managerAddresses);
  }

  /**
   * Fetches oracle prices for a passed array of oracle addresses
   *
   * @param  oracleAddresses[]    Oracle addresses to read from
   */
  public async batchFetchOraclePrices(
    oracleAddresses: Address[],
  ): Promise<BigNumber[]> {
    const protocolViewerInstance = await this.contracts.loadProtocolViewerContract(
      this.protocolViewerAddress
    );

    return await protocolViewerInstance.batchFetchOraclePrices.callAsync(oracleAddresses);
  }
}
