/**
 * This file is auto-generated using abi-gen. Don't edit directly.
 * Templates can be found at https://github.com/0xProject/0x.js/tree/development/packages/abi-gen-templates.
 */
// tslint:disable-next-line:no-unused-variable
import { TxData, TxDataPayable } from "../types/common";
import { promisify } from "@0xproject/utils";
import { classUtils } from "../types/common";
import { BigNumber } from "../util/bignumber";
import * as Web3 from "web3";

import { BaseContract } from "./base_contract";

export class SetTokenContract extends BaseContract {
    public name = {
        async callAsync(
            defaultBlock?: any,
        ): Promise<string
    > {
            const self = this as SetTokenContract;
            const result = await promisify<string
    >(
                self.web3ContractInstance.name.call,
                self.web3ContractInstance,
            )(
            );
            return result;
        },
    };
    public approve = {
        async sendTransactionAsync(
            _spender: string,
            _value: BigNumber,
            txData: TxData = {},
        ): Promise<string> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
                self.approve.estimateGasAsync.bind(
                    self,
                    _spender,
                    _value,
                ),
            );
            const txHash = await promisify<string>(
                self.web3ContractInstance.approve, self.web3ContractInstance,
            )(
                _spender,
                _value,
                txDataWithDefaults,
            );
            return txHash;
        },
        async estimateGasAsync(
            _spender: string,
            _value: BigNumber,
            txData: TxData = {},
        ): Promise<number> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
            );
            const gas = await promisify<number>(
                self.web3ContractInstance.approve.estimateGas, self.web3ContractInstance,
            )(
                _spender,
                _value,
                txDataWithDefaults,
            );
            return gas;
        },
        getABIEncodedTransactionData(
            _spender: string,
            _value: BigNumber,
            txData: TxData = {},
        ): string {
            const self = this as SetTokenContract;
            const abiEncodedTransactionData = self.web3ContractInstance.approve.getData();
            return abiEncodedTransactionData;
        },
    };
    public totalSupply = {
        async callAsync(
            defaultBlock?: any,
        ): Promise<BigNumber
    > {
            const self = this as SetTokenContract;
            const result = await promisify<BigNumber
    >(
                self.web3ContractInstance.totalSupply.call,
                self.web3ContractInstance,
            )(
            );
            return result;
        },
    };
    public decimals = {
        async callAsync(
            defaultBlock?: any,
        ): Promise<BigNumber
    > {
            const self = this as SetTokenContract;
            const result = await promisify<BigNumber
    >(
                self.web3ContractInstance.decimals.call,
                self.web3ContractInstance,
            )(
            );
            return result;
        },
    };
    public naturalUnit = {
        async callAsync(
            defaultBlock?: any,
        ): Promise<BigNumber
    > {
            const self = this as SetTokenContract;
            const result = await promisify<BigNumber
    >(
                self.web3ContractInstance.naturalUnit.call,
                self.web3ContractInstance,
            )(
            );
            return result;
        },
    };
    public decreaseApproval = {
        async sendTransactionAsync(
            _spender: string,
            _subtractedValue: BigNumber,
            txData: TxData = {},
        ): Promise<string> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
                self.decreaseApproval.estimateGasAsync.bind(
                    self,
                    _spender,
                    _subtractedValue,
                ),
            );
            const txHash = await promisify<string>(
                self.web3ContractInstance.decreaseApproval, self.web3ContractInstance,
            )(
                _spender,
                _subtractedValue,
                txDataWithDefaults,
            );
            return txHash;
        },
        async estimateGasAsync(
            _spender: string,
            _subtractedValue: BigNumber,
            txData: TxData = {},
        ): Promise<number> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
            );
            const gas = await promisify<number>(
                self.web3ContractInstance.decreaseApproval.estimateGas, self.web3ContractInstance,
            )(
                _spender,
                _subtractedValue,
                txDataWithDefaults,
            );
            return gas;
        },
        getABIEncodedTransactionData(
            _spender: string,
            _subtractedValue: BigNumber,
            txData: TxData = {},
        ): string {
            const self = this as SetTokenContract;
            const abiEncodedTransactionData = self.web3ContractInstance.decreaseApproval.getData();
            return abiEncodedTransactionData;
        },
    };
    public balanceOf = {
        async callAsync(
            _owner: string,
            defaultBlock?: any,
        ): Promise<BigNumber
    > {
            const self = this as SetTokenContract;
            const result = await promisify<BigNumber
    >(
                self.web3ContractInstance.balanceOf.call,
                self.web3ContractInstance,
            )(
                _owner,
            );
            return result;
        },
    };
    public unredeemedComponents = {
        async callAsync(
            index_0: string,
            index_1: string,
            defaultBlock?: any,
        ): Promise<[BigNumber, boolean]
    > {
            const self = this as SetTokenContract;
            const result = await promisify<[BigNumber, boolean]
    >(
                self.web3ContractInstance.unredeemedComponents.call,
                self.web3ContractInstance,
            )(
                index_0,
                index_1,
            );
            return result;
        },
    };
    public symbol = {
        async callAsync(
            defaultBlock?: any,
        ): Promise<string
    > {
            const self = this as SetTokenContract;
            const result = await promisify<string
    >(
                self.web3ContractInstance.symbol.call,
                self.web3ContractInstance,
            )(
            );
            return result;
        },
    };
    public components = {
        async callAsync(
            index_0: BigNumber,
            defaultBlock?: any,
        ): Promise<[string, BigNumber]
    > {
            const self = this as SetTokenContract;
            const result = await promisify<[string, BigNumber]
    >(
                self.web3ContractInstance.components.call,
                self.web3ContractInstance,
            )(
                index_0,
            );
            return result;
        },
    };
    public increaseApproval = {
        async sendTransactionAsync(
            _spender: string,
            _addedValue: BigNumber,
            txData: TxData = {},
        ): Promise<string> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
                self.increaseApproval.estimateGasAsync.bind(
                    self,
                    _spender,
                    _addedValue,
                ),
            );
            const txHash = await promisify<string>(
                self.web3ContractInstance.increaseApproval, self.web3ContractInstance,
            )(
                _spender,
                _addedValue,
                txDataWithDefaults,
            );
            return txHash;
        },
        async estimateGasAsync(
            _spender: string,
            _addedValue: BigNumber,
            txData: TxData = {},
        ): Promise<number> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
            );
            const gas = await promisify<number>(
                self.web3ContractInstance.increaseApproval.estimateGas, self.web3ContractInstance,
            )(
                _spender,
                _addedValue,
                txDataWithDefaults,
            );
            return gas;
        },
        getABIEncodedTransactionData(
            _spender: string,
            _addedValue: BigNumber,
            txData: TxData = {},
        ): string {
            const self = this as SetTokenContract;
            const abiEncodedTransactionData = self.web3ContractInstance.increaseApproval.getData();
            return abiEncodedTransactionData;
        },
    };
    public allowance = {
        async callAsync(
            _owner: string,
            _spender: string,
            defaultBlock?: any,
        ): Promise<BigNumber
    > {
            const self = this as SetTokenContract;
            const result = await promisify<BigNumber
    >(
                self.web3ContractInstance.allowance.call,
                self.web3ContractInstance,
            )(
                _owner,
                _spender,
            );
            return result;
        },
    };
    public issue = {
        async sendTransactionAsync(
            quantity: BigNumber,
            txData: TxData = {},
        ): Promise<string> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
                self.issue.estimateGasAsync.bind(
                    self,
                    quantity,
                ),
            );
            const txHash = await promisify<string>(
                self.web3ContractInstance.issue, self.web3ContractInstance,
            )(
                quantity,
                txDataWithDefaults,
            );
            return txHash;
        },
        async estimateGasAsync(
            quantity: BigNumber,
            txData: TxData = {},
        ): Promise<number> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
            );
            const gas = await promisify<number>(
                self.web3ContractInstance.issue.estimateGas, self.web3ContractInstance,
            )(
                quantity,
                txDataWithDefaults,
            );
            return gas;
        },
        getABIEncodedTransactionData(
            quantity: BigNumber,
            txData: TxData = {},
        ): string {
            const self = this as SetTokenContract;
            const abiEncodedTransactionData = self.web3ContractInstance.issue.getData();
            return abiEncodedTransactionData;
        },
    };
    public redeem = {
        async sendTransactionAsync(
            quantity: BigNumber,
            txData: TxData = {},
        ): Promise<string> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
                self.redeem.estimateGasAsync.bind(
                    self,
                    quantity,
                ),
            );
            const txHash = await promisify<string>(
                self.web3ContractInstance.redeem, self.web3ContractInstance,
            )(
                quantity,
                txDataWithDefaults,
            );
            return txHash;
        },
        async estimateGasAsync(
            quantity: BigNumber,
            txData: TxData = {},
        ): Promise<number> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
            );
            const gas = await promisify<number>(
                self.web3ContractInstance.redeem.estimateGas, self.web3ContractInstance,
            )(
                quantity,
                txDataWithDefaults,
            );
            return gas;
        },
        getABIEncodedTransactionData(
            quantity: BigNumber,
            txData: TxData = {},
        ): string {
            const self = this as SetTokenContract;
            const abiEncodedTransactionData = self.web3ContractInstance.redeem.getData();
            return abiEncodedTransactionData;
        },
    };
    public partialRedeem = {
        async sendTransactionAsync(
            quantity: BigNumber,
            excludedComponents: string[],
            txData: TxData = {},
        ): Promise<string> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
                self.partialRedeem.estimateGasAsync.bind(
                    self,
                    quantity,
                    excludedComponents,
                ),
            );
            const txHash = await promisify<string>(
                self.web3ContractInstance.partialRedeem, self.web3ContractInstance,
            )(
                quantity,
                excludedComponents,
                txDataWithDefaults,
            );
            return txHash;
        },
        async estimateGasAsync(
            quantity: BigNumber,
            excludedComponents: string[],
            txData: TxData = {},
        ): Promise<number> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
            );
            const gas = await promisify<number>(
                self.web3ContractInstance.partialRedeem.estimateGas, self.web3ContractInstance,
            )(
                quantity,
                excludedComponents,
                txDataWithDefaults,
            );
            return gas;
        },
        getABIEncodedTransactionData(
            quantity: BigNumber,
            excludedComponents: string[],
            txData: TxData = {},
        ): string {
            const self = this as SetTokenContract;
            const abiEncodedTransactionData = self.web3ContractInstance.partialRedeem.getData();
            return abiEncodedTransactionData;
        },
    };
    public redeemExcluded = {
        async sendTransactionAsync(
            componentsToRedeem: string[],
            quantities: BigNumber[],
            txData: TxData = {},
        ): Promise<string> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
                self.redeemExcluded.estimateGasAsync.bind(
                    self,
                    componentsToRedeem,
                    quantities,
                ),
            );
            const txHash = await promisify<string>(
                self.web3ContractInstance.redeemExcluded, self.web3ContractInstance,
            )(
                componentsToRedeem,
                quantities,
                txDataWithDefaults,
            );
            return txHash;
        },
        async estimateGasAsync(
            componentsToRedeem: string[],
            quantities: BigNumber[],
            txData: TxData = {},
        ): Promise<number> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
            );
            const gas = await promisify<number>(
                self.web3ContractInstance.redeemExcluded.estimateGas, self.web3ContractInstance,
            )(
                componentsToRedeem,
                quantities,
                txDataWithDefaults,
            );
            return gas;
        },
        getABIEncodedTransactionData(
            componentsToRedeem: string[],
            quantities: BigNumber[],
            txData: TxData = {},
        ): string {
            const self = this as SetTokenContract;
            const abiEncodedTransactionData = self.web3ContractInstance.redeemExcluded.getData();
            return abiEncodedTransactionData;
        },
    };
    public componentCount = {
        async callAsync(
            defaultBlock?: any,
        ): Promise<BigNumber
    > {
            const self = this as SetTokenContract;
            const result = await promisify<BigNumber
    >(
                self.web3ContractInstance.componentCount.call,
                self.web3ContractInstance,
            )(
            );
            return result;
        },
    };
    public getComponents = {
        async callAsync(
            defaultBlock?: any,
        ): Promise<string[]
    > {
            const self = this as SetTokenContract;
            const result = await promisify<string[]
    >(
                self.web3ContractInstance.getComponents.call,
                self.web3ContractInstance,
            )(
            );
            return result;
        },
    };
    public getUnits = {
        async callAsync(
            defaultBlock?: any,
        ): Promise<BigNumber[]
    > {
            const self = this as SetTokenContract;
            const result = await promisify<BigNumber[]
    >(
                self.web3ContractInstance.getUnits.call,
                self.web3ContractInstance,
            )(
            );
            return result;
        },
    };
    public transfer = {
        async sendTransactionAsync(
            _to: string,
            _value: BigNumber,
            txData: TxData = {},
        ): Promise<string> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
                self.transfer.estimateGasAsync.bind(
                    self,
                    _to,
                    _value,
                ),
            );
            const txHash = await promisify<string>(
                self.web3ContractInstance.transfer, self.web3ContractInstance,
            )(
                _to,
                _value,
                txDataWithDefaults,
            );
            return txHash;
        },
        async estimateGasAsync(
            _to: string,
            _value: BigNumber,
            txData: TxData = {},
        ): Promise<number> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
            );
            const gas = await promisify<number>(
                self.web3ContractInstance.transfer.estimateGas, self.web3ContractInstance,
            )(
                _to,
                _value,
                txDataWithDefaults,
            );
            return gas;
        },
        getABIEncodedTransactionData(
            _to: string,
            _value: BigNumber,
            txData: TxData = {},
        ): string {
            const self = this as SetTokenContract;
            const abiEncodedTransactionData = self.web3ContractInstance.transfer.getData();
            return abiEncodedTransactionData;
        },
    };
    public transferFrom = {
        async sendTransactionAsync(
            _from: string,
            _to: string,
            _value: BigNumber,
            txData: TxData = {},
        ): Promise<string> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
                self.transferFrom.estimateGasAsync.bind(
                    self,
                    _from,
                    _to,
                    _value,
                ),
            );
            const txHash = await promisify<string>(
                self.web3ContractInstance.transferFrom, self.web3ContractInstance,
            )(
                _from,
                _to,
                _value,
                txDataWithDefaults,
            );
            return txHash;
        },
        async estimateGasAsync(
            _from: string,
            _to: string,
            _value: BigNumber,
            txData: TxData = {},
        ): Promise<number> {
            const self = this as SetTokenContract;
            const txDataWithDefaults = await self.applyDefaultsToTxDataAsync(
                txData,
            );
            const gas = await promisify<number>(
                self.web3ContractInstance.transferFrom.estimateGas, self.web3ContractInstance,
            )(
                _from,
                _to,
                _value,
                txDataWithDefaults,
            );
            return gas;
        },
        getABIEncodedTransactionData(
            _from: string,
            _to: string,
            _value: BigNumber,
            txData: TxData = {},
        ): string {
            const self = this as SetTokenContract;
            const abiEncodedTransactionData = self.web3ContractInstance.transferFrom.getData();
            return abiEncodedTransactionData;
        },
    };
    async deploy(...args: any[]): Promise<any> {
        const wrapper = this;
        const rejected = false;

        return new Promise((resolve, reject) => {
            wrapper.web3ContractInstance.new(wrapper.defaults, (err: string, contract: Web3.ContractInstance) => {
                if (err) {
                    reject(err);
                } else if (contract.address) {
                    wrapper.web3ContractInstance = wrapper.web3ContractInstance.at(contract.address);
                    wrapper.address = contract.address;
                    resolve();
                }
            });
        });
    }
    static async deployed(web3: Web3, defaults: Partial<TxData>): Promise<SetTokenContract> {
        const currentNetwork = web3.version.network;
        const { abi, networks } = await this.getArtifactsData(web3);
        const web3ContractInstance = web3.eth.contract(abi).at(networks[currentNetwork].address);

        return new SetTokenContract(web3ContractInstance, defaults);
    }
    static async at(address: string, web3: Web3, defaults: Partial<TxData>): Promise<SetTokenContract> {
        const { abi } = await this.getArtifactsData(web3);
        const web3ContractInstance = web3.eth.contract(abi).at(address);

        return new SetTokenContract(web3ContractInstance, defaults);
    }
    private static async getArtifactsData(web3: Web3):
        Promise<any> {
        try {
            const artifact = require("../../artifacts/SetToken.json");
            const { abi, networks } = artifact;
            return { abi, networks };
        } catch (e) {
            console.error("Artifacts malformed or nonexistent: " + e.toString());
        }
    }
    constructor(web3ContractInstance: Web3.ContractInstance, defaults: Partial<TxData>) {
        super(web3ContractInstance, defaults);
        classUtils.bindAll(this, ["web3ContractInstance", "defaults"]);
    }
} // tslint:disable:max-file-line-count
