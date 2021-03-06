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

import { StrategyContractWrapper } from './StrategyContractWrapper';
import { BigNumber, generateTxOpts } from '../../util';
import { Address, Tx } from '../../types/common';

/**
 * @title  ETHDAIRebalancingManagerWrapper
 * @author Set Protocol
 *
 * The ETHDAIRebalancingManagerWrapper API handles all functions on the ETHDAIRebalancingManager smart contract.
 *
 */
export class ETHDAIRebalancingManagerWrapper {
  private web3: Web3;
  private contracts: StrategyContractWrapper;

  public constructor(web3: Web3) {
    this.web3 = web3;
    this.contracts = new StrategyContractWrapper(this.web3);
  }

  /**
   * Calls a rebalancing ETHDAI rebalancing manager's propose function. This function deploys a new Set token
   * and calls the underling rebalancing set token's propose function with fixed parameters and the new deployed Set.
   *
   * @param  managerAddress               Address of the rebalancing manager contract
   * @param  rebalancingSetTokenAddress   Address of the set to be rebalanced (must be managed by the manager address)
   * @return                              The hash of the resulting transaction.
   */
  public async propose(
    managerAddress: Address,
    rebalancingSetTokenAddress: Address,
    txOpts?: Tx,
  ): Promise<string> {
    const ethDaiManagerInstance = await this.contracts.loadEthDaiManagerContractAsync(managerAddress);
    const txOptions = await generateTxOpts(this.web3, txOpts);

    return await ethDaiManagerInstance.propose.sendTransactionAsync(rebalancingSetTokenAddress, txOptions);
  }

  public async core(managerAddress: Address): Promise<Address> {
    const ethDaiManagerInstance = await this.contracts.loadEthDaiManagerContractAsync(managerAddress);

    return await ethDaiManagerInstance.coreAddress.callAsync();
  }

  public async ethPriceFeed(managerAddress: Address): Promise<Address> {
    const ethDaiManagerInstance = await this.contracts.loadEthDaiManagerContractAsync(managerAddress);

    return await ethDaiManagerInstance.ethPriceFeed.callAsync();
  }

  public async ethAddress(managerAddress: Address): Promise<Address> {
    const ethDaiManagerInstance = await this.contracts.loadEthDaiManagerContractAsync(managerAddress);

    return await ethDaiManagerInstance.ethAddress.callAsync();
  }

  public async daiAddress(managerAddress: Address): Promise<Address> {
    const ethDaiManagerInstance = await this.contracts.loadEthDaiManagerContractAsync(managerAddress);

    return await ethDaiManagerInstance.daiAddress.callAsync();
  }

  public async setTokenFactory(managerAddress: Address): Promise<Address> {
    const ethDaiManagerInstance = await this.contracts.loadEthDaiManagerContractAsync(managerAddress);

    return await ethDaiManagerInstance.setTokenFactory.callAsync();
  }

  public async ethMultiplier(managerAddress: Address): Promise<BigNumber> {
    const ethDaiManagerInstance = await this.contracts.loadEthDaiManagerContractAsync(managerAddress);

    return await ethDaiManagerInstance.ethMultiplier.callAsync();
  }

  public async daiMultiplier(managerAddress: Address): Promise<BigNumber> {
    const ethDaiManagerInstance = await this.contracts.loadEthDaiManagerContractAsync(managerAddress);

    return await ethDaiManagerInstance.daiMultiplier.callAsync();
  }

  public async maximumLowerThreshold(managerAddress: Address): Promise<BigNumber> {
    const ethDaiManagerInstance = await this.contracts.loadEthDaiManagerContractAsync(managerAddress);

    return await ethDaiManagerInstance.maximumLowerThreshold.callAsync();
  }

  public async minimumUpperThreshold(managerAddress: Address): Promise<BigNumber> {
    const ethDaiManagerInstance = await this.contracts.loadEthDaiManagerContractAsync(managerAddress);

    return await ethDaiManagerInstance.minimumUpperThreshold.callAsync();
  }

  public async auctionLibrary(managerAddress: Address): Promise<Address> {
    const ethDaiManagerInstance = await this.contracts.loadEthDaiManagerContractAsync(managerAddress);

    return await ethDaiManagerInstance.auctionLibrary.callAsync();
  }

  public async auctionTimeToPivot(managerAddress: Address): Promise<BigNumber> {
    const ethDaiManagerInstance = await this.contracts.loadEthDaiManagerContractAsync(managerAddress);

    return await ethDaiManagerInstance.auctionTimeToPivot.callAsync();
  }
}
