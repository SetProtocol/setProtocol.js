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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var set_protocol_contracts_1 = require("set-protocol-contracts");
/**
 * @title ContractWrapper
 * @author Set Protocol
 *
 * The Contracts API handles all functions that load contracts
 *
 */
var ContractWrapper = /** @class */ (function () {
    function ContractWrapper(web3) {
        this.web3 = web3;
        this.cache = {};
    }
    /**
     * Load Core contract
     *
     * @param  coreAddress        Address of the Core contract
     * @param  transactionOptions Options sent into the contract deployed method
     * @return                    The Core Contract
     */
    ContractWrapper.prototype.loadCoreAsync = function (coreAddress, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, coreContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "Core_" + coreAddress;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_contracts_1.CoreContract.at(coreAddress, this.web3, transactionOptions)];
                    case 2:
                        coreContract = _a.sent();
                        this.cache[cacheKey] = coreContract;
                        return [2 /*return*/, coreContract];
                }
            });
        });
    };
    /**
     * Load Set Token contract
     *
     * @param  setTokenAddress    Address of the Set Token contract
     * @param  transactionOptions Options sent into the contract deployed method
     * @return                    The Set Token Contract
     */
    ContractWrapper.prototype.loadSetTokenAsync = function (setTokenAddress, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, setTokenContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "SetToken_" + setTokenAddress;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_contracts_1.SetTokenContract.at(setTokenAddress, this.web3, transactionOptions)];
                    case 2:
                        setTokenContract = _a.sent();
                        this.cache[cacheKey] = setTokenContract;
                        return [2 /*return*/, setTokenContract];
                }
            });
        });
    };
    /**
     * Load Rebalancing Set Token contract
     *
     * @param  rebalancingSetTokenAddress    Address of the Set Token contract
     * @param  transactionOptions            Options sent into the contract deployed method
     * @return                               The Set Token Contract
     */
    ContractWrapper.prototype.loadRebalancingSetTokenAsync = function (rebalancingSetTokenAddress, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, rebalancingSetTokenContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "RebalancingSetToken_" + rebalancingSetTokenAddress;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetTokenContract.at(rebalancingSetTokenAddress, this.web3, transactionOptions)];
                    case 2:
                        rebalancingSetTokenContract = _a.sent();
                        this.cache[cacheKey] = rebalancingSetTokenContract;
                        return [2 /*return*/, rebalancingSetTokenContract];
                }
            });
        });
    };
    /**
     * Load ERC20 Token contract
     *
     * @param  tokenAddress    Address of the ERC20 Token contract
     * @param  transactionOptions Options sent into the contract deployed method
     * @return                    The ERC20 Token Contract
     */
    ContractWrapper.prototype.loadERC20TokenAsync = function (tokenAddress, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, erc20TokenContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "ERC20Token_" + tokenAddress;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_contracts_1.ERC20DetailedContract.at(tokenAddress, this.web3, transactionOptions)];
                    case 2:
                        erc20TokenContract = _a.sent();
                        this.cache[cacheKey] = erc20TokenContract;
                        return [2 /*return*/, erc20TokenContract];
                }
            });
        });
    };
    /**
     * Load Vault contract
     *
     * @param  vaultAddress       Address of the Vault contract
     * @param  transactionOptions Options sent into the contract deployed method
     * @return                    The Vault Contract
     */
    ContractWrapper.prototype.loadVaultAsync = function (vaultAddress, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, vaultContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "Vault_" + vaultAddress;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_contracts_1.VaultContract.at(vaultAddress, this.web3, transactionOptions)];
                    case 2:
                        vaultContract = _a.sent();
                        this.cache[cacheKey] = vaultContract;
                        return [2 /*return*/, vaultContract];
                }
            });
        });
    };
    /**
     * Load TransferProxy contract
     *
     * @param  transferProxyAddress       Address of the TransferProxy contract
     * @param  transactionOptions Options sent into the contract deployed method
     * @return                    The TransferProxy Contract
     */
    ContractWrapper.prototype.loadTransferProxyAsync = function (transferProxyAddress, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, transferProxyContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "Vault_" + transferProxyAddress;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_contracts_1.TransferProxyContract.at(transferProxyAddress, this.web3, transactionOptions)];
                    case 2:
                        transferProxyContract = _a.sent();
                        this.cache[cacheKey] = transferProxyContract;
                        return [2 /*return*/, transferProxyContract];
                }
            });
        });
    };
    /**
     * Load Rebalance Auction Module contract
     *
     * @param  rebalanceAuctionModuleAddress       Address of the Rebalance Auction Module contract
     * @param  transactionOptions                  Options sent into the contract deployed method
     * @return                                     The Rebalance Auction Module Contract
     */
    ContractWrapper.prototype.loadRebalanceAuctionModuleAsync = function (rebalanceAuctionModuleAddress, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, rebalanceAuctionModuleContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "RebalanceAuctionModule_" + rebalanceAuctionModuleAddress;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_contracts_1.RebalanceAuctionModuleContract.at(rebalanceAuctionModuleAddress, this.web3, transactionOptions)];
                    case 2:
                        rebalanceAuctionModuleContract = _a.sent();
                        this.cache[cacheKey] = rebalanceAuctionModuleContract;
                        return [2 /*return*/, rebalanceAuctionModuleContract];
                }
            });
        });
    };
    /**
     * Load Kyber Network Wrapper contract
     *
     * @param  kyberNetworkWrapperAddress          Address of the Kyber Network Wrapper contract
     * @param  transactionOptions                  Options sent into the contract deployed method
     * @return                                     The Kyber Network Wrapper Contract
     */
    ContractWrapper.prototype.loadKyberNetworkWrapperAsync = function (kyberNetworkWrapperAddress, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, kyberNetworkWrapperContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "KyberNetworkWrapper_" + kyberNetworkWrapperAddress;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_contracts_1.KyberNetworkWrapperContract.at(kyberNetworkWrapperAddress, this.web3, transactionOptions)];
                    case 2:
                        kyberNetworkWrapperContract = _a.sent();
                        this.cache[cacheKey] = kyberNetworkWrapperContract;
                        return [2 /*return*/, kyberNetworkWrapperContract];
                }
            });
        });
    };
    /**
     * Load RebalancingSetExchangeIssuanceModule contract
     *
     * @param  rebalancingSetExchangeIssuanceAddress    Address of the RebalancingSetExchangeIssuanceModule contract
     * @param  transactionOptions                       Options sent into the contract deployed method
     * @return                                          The RebalancingSetExchangeIssuanceModule Contract
     */
    ContractWrapper.prototype.loadRebalancingSetExchangeIssuanceModuleAsync = function (rebalancingSetExchangeIssuanceAddress, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, rebalancingSetExchangeIssuanceModuleContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "RebalancingSetExchangeIssuanceModule_" + rebalancingSetExchangeIssuanceAddress;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_contracts_1.RebalancingSetExchangeIssuanceModuleContract.at(rebalancingSetExchangeIssuanceAddress, this.web3, transactionOptions)];
                    case 2:
                        rebalancingSetExchangeIssuanceModuleContract = _a.sent();
                        this.cache[cacheKey] = rebalancingSetExchangeIssuanceModuleContract;
                        return [2 /*return*/, rebalancingSetExchangeIssuanceModuleContract];
                }
            });
        });
    };
    /**
     * Load an Authorizable contract
     *
     * @param  authorizableAddress    Address of the Authorizable contract
     * @param  transactionOptions     Options sent into the contract deployed method
     * @return                        The Authorizable Contract
     */
    ContractWrapper.prototype.loadAuthorizableAsync = function (authorizableAddress, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, setTokenContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "Authorizable_" + authorizableAddress;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_contracts_1.AuthorizableContract.at(authorizableAddress, this.web3, transactionOptions)];
                    case 2:
                        setTokenContract = _a.sent();
                        this.cache[cacheKey] = setTokenContract;
                        return [2 /*return*/, setTokenContract];
                }
            });
        });
    };
    /**
     * Load a TimeLockUpgrade contract
     *
     * @param  timeLockUpgradeAddress Address of the TimeLockUpgrade contract
     * @param  transactionOptions     Options sent into the contract deployed method
     * @return                        The TimeLockUpgrade Contract
     */
    ContractWrapper.prototype.loadTimeLockUpgradeAsync = function (timeLockUpgradeAddress, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, setTokenContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "TimeLockUpgrade_" + timeLockUpgradeAddress;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_contracts_1.TimeLockUpgradeContract.at(timeLockUpgradeAddress, this.web3, transactionOptions)];
                    case 2:
                        setTokenContract = _a.sent();
                        this.cache[cacheKey] = setTokenContract;
                        return [2 /*return*/, setTokenContract];
                }
            });
        });
    };
    /**
     * Load a Whitelist contract
     *
     * @param  whitelistAddress Address of the Whitelist contract
     * @param  transactionOptions     Options sent into the contract deployed method
     * @return                        The Whitelist Contract
     */
    ContractWrapper.prototype.loadWhitelistAsync = function (whitelistAddress, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, whitelistContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "WhiteList_" + whitelistAddress;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_contracts_1.WhiteListContract.at(whitelistAddress, this.web3, transactionOptions)];
                    case 2:
                        whitelistContract = _a.sent();
                        this.cache[cacheKey] = whitelistContract;
                        return [2 /*return*/, whitelistContract];
                }
            });
        });
    };
    /**
     * Load BtcEthManagerContract contract
     *
     * @param  btcEthManagerAddress           Address of the BTCETHRebalancingManagerContract contract
     * @param  transactionOptions             Options sent into the contract deployed method
     * @return                                The BtcEthManagerContract Contract
     */
    ContractWrapper.prototype.loadBtcEthManagerAsync = function (btcEthManagerAddress, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, btcEthRebalancingManagerContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "BtcEthManager_" + btcEthManagerAddress;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_contracts_1.BTCETHRebalancingManagerContract.at(btcEthManagerAddress, this.web3, transactionOptions)];
                    case 2:
                        btcEthRebalancingManagerContract = _a.sent();
                        this.cache[cacheKey] = btcEthRebalancingManagerContract;
                        return [2 /*return*/, btcEthRebalancingManagerContract];
                }
            });
        });
    };
    /**
     * Load a ExchangeIssuanceModule contract
     *
     * @param  exchangeIssuanceModule                Address of the ExchangeIssuanceModule contract
     * @param  transactionOptions                    Options sent into the contract deployed method
     * @return                                       The ExchangeIssuanceModule Contract
     */
    ContractWrapper.prototype.loadExchangeIssuanceModuleAsync = function (exchangeIssuanceModule, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, exchangeIssuanceModuleContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "ExchangeIssuanceModule_" + exchangeIssuanceModule;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_contracts_1.ExchangeIssuanceModuleContract.at(exchangeIssuanceModule, this.web3, transactionOptions)];
                    case 2:
                        exchangeIssuanceModuleContract = _a.sent();
                        this.cache[cacheKey] = exchangeIssuanceModuleContract;
                        return [2 /*return*/, exchangeIssuanceModuleContract];
                }
            });
        });
    };
    /**
     * Load a Medianizer contract
     *
     * @param  medianizer                   Address of the Medianizer contract
     * @param  transactionOptions           Options sent into the contract deployed method
     * @return                              The Medianizer Contract
     */
    ContractWrapper.prototype.loadMedianizerContract = function (medianizer, transactionOptions) {
        if (transactionOptions === void 0) { transactionOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, medianizerContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "Medianizer_" + medianizer;
                        if (!(cacheKey in this.cache)) return [3 /*break*/, 1];
                        return [2 /*return*/, this.cache[cacheKey]];
                    case 1: return [4 /*yield*/, set_protocol_contracts_1.MedianContract.at(medianizer, this.web3, transactionOptions)];
                    case 2:
                        medianizerContract = _a.sent();
                        this.cache[cacheKey] = medianizerContract;
                        return [2 /*return*/, medianizerContract];
                }
            });
        });
    };
    return ContractWrapper;
}());
exports.ContractWrapper = ContractWrapper;
//# sourceMappingURL=ContractWrapper.js.map