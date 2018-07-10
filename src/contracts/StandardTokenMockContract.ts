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

/**
 * This file is auto-generated using abi-gen. Don't edit directly.
 * Templates can be found at https://github.com/0xProject/0x.js/tree/development/packages/abi-gen-templates.
 */
// tslint:disable-next-line:no-unused-variable
import { promisify } from "@0xproject/utils";
import { BigNumber } from "bignumber.js";
import * as fs from "fs-extra";
import { StandardTokenMock as ContractArtifacts } from "set-protocol-contracts";
import * as Web3 from "web3";

import { BaseContract } from "./BaseContract";
import { TxData, TxDataPayable } from "../common";
import { classUtils } from "../util";

export class StandardTokenMockContract extends BaseContract {
  public name = {
    async callAsync(defaultBlock?: any): Promise<string> {
      const self = this as StandardTokenMockContract;
      const result = await promisify<string>(
        self.web3ContractInstance.name.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public approve = {
    async sendTransactionAsync(
      _spender: string,
      _value: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as StandardTokenMockContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.approve.estimateGasAsync.bind(self, _spender, _value),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.approve,
        self.web3ContractInstance,
      )(_spender, _value, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _spender: string,
      _value: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as StandardTokenMockContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.approve.estimateGas,
        self.web3ContractInstance,
      )(_spender, _value, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_spender: string, _value: BigNumber, txData: TxData = {}): string {
      const self = this as StandardTokenMockContract;
      const abiEncodedTransactionData = self.web3ContractInstance.approve.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_spender: string, _value: BigNumber, txData: TxData = {}): Promise<boolean> {
      const self = this as StandardTokenMockContract;
      const result = await promisify<boolean>(
        self.web3ContractInstance.approve.call,
        self.web3ContractInstance,
      )(_spender, _value);
      return result;
    },
  };
  public totalSupply = {
    async callAsync(defaultBlock?: any): Promise<BigNumber> {
      const self = this as StandardTokenMockContract;
      const result = await promisify<BigNumber>(
        self.web3ContractInstance.totalSupply.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public transferFrom = {
    async sendTransactionAsync(
      _from: string,
      _to: string,
      _value: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as StandardTokenMockContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.transferFrom.estimateGasAsync.bind(self, _from, _to, _value),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.transferFrom,
        self.web3ContractInstance,
      )(_from, _to, _value, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _from: string,
      _to: string,
      _value: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as StandardTokenMockContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.transferFrom.estimateGas,
        self.web3ContractInstance,
      )(_from, _to, _value, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _from: string,
      _to: string,
      _value: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as StandardTokenMockContract;
      const abiEncodedTransactionData = self.web3ContractInstance.transferFrom.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _from: string,
      _to: string,
      _value: BigNumber,
      txData: TxData = {},
    ): Promise<boolean> {
      const self = this as StandardTokenMockContract;
      const result = await promisify<boolean>(
        self.web3ContractInstance.transferFrom.call,
        self.web3ContractInstance,
      )(_from, _to, _value);
      return result;
    },
  };
  public decimals = {
    async callAsync(defaultBlock?: any): Promise<BigNumber> {
      const self = this as StandardTokenMockContract;
      const result = await promisify<BigNumber>(
        self.web3ContractInstance.decimals.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public decreaseApproval = {
    async sendTransactionAsync(
      _spender: string,
      _subtractedValue: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as StandardTokenMockContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.decreaseApproval.estimateGasAsync.bind(self, _spender, _subtractedValue),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.decreaseApproval,
        self.web3ContractInstance,
      )(_spender, _subtractedValue, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _spender: string,
      _subtractedValue: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as StandardTokenMockContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.decreaseApproval.estimateGas,
        self.web3ContractInstance,
      )(_spender, _subtractedValue, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _spender: string,
      _subtractedValue: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as StandardTokenMockContract;
      const abiEncodedTransactionData = self.web3ContractInstance.decreaseApproval.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _spender: string,
      _subtractedValue: BigNumber,
      txData: TxData = {},
    ): Promise<boolean> {
      const self = this as StandardTokenMockContract;
      const result = await promisify<boolean>(
        self.web3ContractInstance.decreaseApproval.call,
        self.web3ContractInstance,
      )(_spender, _subtractedValue);
      return result;
    },
  };
  public balanceOf = {
    async callAsync(_owner: string, defaultBlock?: any): Promise<BigNumber> {
      const self = this as StandardTokenMockContract;
      const result = await promisify<BigNumber>(
        self.web3ContractInstance.balanceOf.call,
        self.web3ContractInstance,
      )(_owner);
      return result;
    },
  };
  public symbol = {
    async callAsync(defaultBlock?: any): Promise<string> {
      const self = this as StandardTokenMockContract;
      const result = await promisify<string>(
        self.web3ContractInstance.symbol.call,
        self.web3ContractInstance,
      )();
      return result;
    },
  };
  public transfer = {
    async sendTransactionAsync(
      _to: string,
      _value: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as StandardTokenMockContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.transfer.estimateGasAsync.bind(self, _to, _value),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.transfer,
        self.web3ContractInstance,
      )(_to, _value, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(_to: string, _value: BigNumber, txData: TxData = {}): Promise<number> {
      const self = this as StandardTokenMockContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.transfer.estimateGas,
        self.web3ContractInstance,
      )(_to, _value, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(_to: string, _value: BigNumber, txData: TxData = {}): string {
      const self = this as StandardTokenMockContract;
      const abiEncodedTransactionData = self.web3ContractInstance.transfer.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(_to: string, _value: BigNumber, txData: TxData = {}): Promise<boolean> {
      const self = this as StandardTokenMockContract;
      const result = await promisify<boolean>(
        self.web3ContractInstance.transfer.call,
        self.web3ContractInstance,
      )(_to, _value);
      return result;
    },
  };
  public increaseApproval = {
    async sendTransactionAsync(
      _spender: string,
      _addedValue: BigNumber,
      txData: TxData = {},
    ): Promise<string> {
      const self = this as StandardTokenMockContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
        txData,
        self.increaseApproval.estimateGasAsync.bind(self, _spender, _addedValue),
      );
      const txHash = await promisify<string>(
        self.web3ContractInstance.increaseApproval,
        self.web3ContractInstance,
      )(_spender, _addedValue, txDataWithDefaults);
      return txHash;
    },
    async estimateGasAsync(
      _spender: string,
      _addedValue: BigNumber,
      txData: TxData = {},
    ): Promise<number> {
      const self = this as StandardTokenMockContract;
      const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(txData);
      const gas = await promisify<number>(
        self.web3ContractInstance.increaseApproval.estimateGas,
        self.web3ContractInstance,
      )(_spender, _addedValue, txDataWithDefaults);
      return gas;
    },
    getABIEncodedTransactionData(
      _spender: string,
      _addedValue: BigNumber,
      txData: TxData = {},
    ): string {
      const self = this as StandardTokenMockContract;
      const abiEncodedTransactionData = self.web3ContractInstance.increaseApproval.getData();
      return abiEncodedTransactionData;
    },
    async callAsync(
      _spender: string,
      _addedValue: BigNumber,
      txData: TxData = {},
    ): Promise<boolean> {
      const self = this as StandardTokenMockContract;
      const result = await promisify<boolean>(
        self.web3ContractInstance.increaseApproval.call,
        self.web3ContractInstance,
      )(_spender, _addedValue);
      return result;
    },
  };
  public allowance = {
    async callAsync(_owner: string, _spender: string, defaultBlock?: any): Promise<BigNumber> {
      const self = this as StandardTokenMockContract;
      const result = await promisify<BigNumber>(
        self.web3ContractInstance.allowance.call,
        self.web3ContractInstance,
      )(_owner, _spender);
      return result;
    },
  };
  async deploy(...args: any[]): Promise<any> {
    const wrapper = this;
    const rejected = false;

    return new Promise((resolve, reject) => {
      wrapper.web3ContractInstance.new(
        wrapper.defaults,
        (err: string, contract: Web3.ContractInstance) => {
          if (err) {
            reject(err);
          } else if (contract.address) {
            wrapper.web3ContractInstance = wrapper.web3ContractInstance.at(contract.address);
            wrapper.address = contract.address;
            resolve();
          }
        },
      );
    });
  }
  static async deployed(web3: Web3, defaults: Partial<TxData>): Promise<StandardTokenMockContract> {
    const currentNetwork = web3.version.network;
    const { abi, networks }: { abi: any; networks: any } = ContractArtifacts;
    const web3ContractInstance = web3.eth.contract(abi).at(networks[currentNetwork].address);

    return new StandardTokenMockContract(web3ContractInstance, defaults);
  }
  static async at(
    address: string,
    web3: Web3,
    defaults: Partial<TxData>,
  ): Promise<StandardTokenMockContract> {
    const { abi }: { abi: any } = ContractArtifacts;
    const web3ContractInstance = web3.eth.contract(abi).at(address);

    return new StandardTokenMockContract(web3ContractInstance, defaults);
  }
  constructor(web3ContractInstance: Web3.ContractInstance, defaults: Partial<TxData>) {
    super(web3ContractInstance, defaults);
    classUtils.bindAll(this, ["web3ContractInstance", "defaults"]);
  }
} // tslint:disable:max-file-line-count
