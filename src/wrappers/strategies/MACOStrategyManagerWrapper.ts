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

import { Address } from '../../types/common';
import { MACOStrategyManagerBaseWrapper } from './MACOStrategyManagerBaseWrapper';

/**
 * @title  MACOStrategyManagerWrapper
 * @author Set Protocol
 *
 * The MACOStrategyManagerWrapper handles all functions on the MACOStrategyManager smart contract.
 *
 */
export class MACOStrategyManagerWrapper extends MACOStrategyManagerBaseWrapper {
  public constructor(web3: Web3) {
    super(web3);
  }

  public async movingAveragePriceFeed(managerAddress: Address): Promise<Address> {
    const macoStrategyManagerInstance = await this.contracts.loadMACOStrategyManagerContractAsync(managerAddress);

    return await macoStrategyManagerInstance.movingAveragePriceFeed.callAsync();
  }
}