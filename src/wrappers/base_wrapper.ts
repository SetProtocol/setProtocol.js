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

"use strict";

import * as _ from "lodash";
import * as Web3 from "web3";

import { TxData, TxDataPayable } from "../types/common";

export class BaseContract {
  public address: string;
  public abi: any[];
  // public abi: Web3.AbiDefinition[];

  public web3ContractInstance: Web3.ContractInstance;

  protected defaults: Partial<TxData>;

  constructor(web3ContractInstance: Web3.ContractInstance, defaults: Partial<TxData>) {
    this.web3ContractInstance = web3ContractInstance;
    this.address = web3ContractInstance.address;
    this.abi = web3ContractInstance.abi;
    this.defaults = defaults;
  }

  protected async applyDefaultsToTxDataAsync<T extends TxData | TxDataPayable>(
    txData: T,
    estimateGasAsync?: (txData: T) => Promise<number>,
  ): Promise<TxData> {
    // Gas amount sourced with the following priorities:
    // 1. Optional param passed in to public method call
    // 2. Global config passed in at library instantiation
    // 3. Gas estimate calculation + safety margin
    const removeUndefinedProperties = _.pickBy;
    const txDataWithDefaults = {
      ...removeUndefinedProperties(this.defaults),
      ...removeUndefinedProperties(txData as any),
      // HACK: TS can't prove that T is spreadable.
      // Awaiting https://github.com/Microsoft/TypeScript/pull/13288 to be merged
    };
    if (_.isUndefined(txDataWithDefaults.gas) && !_.isUndefined(estimateGasAsync)) {
      const estimatedGas = await estimateGasAsync(txData);
      txDataWithDefaults.gas = estimatedGas;
    }
    return txDataWithDefaults;
  }
}
