"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_1 = __importDefault(require("web3"));
var constants_1 = require("@src/constants");
var util_1 = require("@src/util");
var ComptrollerABI_1 = require("../external/abis/compound/ComptrollerABI");
var CErc20ABI_1 = require("../external/abis/compound/CErc20ABI");
var InterestRateModelABI_1 = require("../external/abis/compound/InterestRateModelABI");
var compoundSnapshotAddresses_1 = require("../external/compoundSnapshotAddresses");
var web3 = new web3_1.default('http://localhost:8545');
var CompoundHelper = /** @class */ (function () {
    function CompoundHelper() {
        this.priceOracle = compoundSnapshotAddresses_1.CONTRACTS.PriceOracle;
        this.interestRateModel = compoundSnapshotAddresses_1.CONTRACTS.InterestRateModel;
        this.comptroller = compoundSnapshotAddresses_1.CONTRACTS.Comptroller;
        this.admin = compoundSnapshotAddresses_1.PERMISSIONED_ACCOUNTS.admin;
        this.senderAccountAddress = constants_1.DEFAULT_ACCOUNT;
    }
    /**
     * Example Usage: USDC
     *
     * const usdc: StandardTokenMockContract = await this._erc20Helper.deployTokenAsync(
     *   this.senderAccountAddress,
     *   6,
     * );
     *
     * const cUSDC = await this.deployMockCUSDC(usdc.address, this.admin);
     * await this.enableCToken(cUSDC);
     *
     *  Set the Borrow Rate
     *  await this.setBorrowRate(cUSDC, new BigNumber('1000000000000'));
     *
     * await this._erc20Helper.approveTransferAsync(
     *   usdc,
     *   cUSDC,
     *   this.senderAccountAddress
     * );
     *
     * await this.accrueInterest(cUSDC);
     *
     * const ONE_USDC = new BigNumber(10 ** 6);
     * await this.mintCToken(cUSDC, ONE_USDC);
     */
    /* ============ Compound Methods ============ */
    CompoundHelper.prototype.deployMockCUSDC = function (underlying, admin) {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = {
                            'name': 'Compound USD Coin',
                            'symbol': 'cUSDC',
                            'decimals': new util_1.BigNumber(8),
                            'underlying': underlying,
                            'contract': 'CErc20',
                            'initial_exchange_rate_mantissa': new util_1.BigNumber('200000000000000'),
                        };
                        return [4 /*yield*/, this.deployCToken(config.underlying, this.comptroller, this.interestRateModel, config.initial_exchange_rate_mantissa, config.symbol, config.name, config.decimals, this.admin)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    CompoundHelper.prototype.deployMockCDAI = function (underlying, admin) {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = {
                            'name': 'C_DAI',
                            'symbol': 'cDAI',
                            'decimals': new util_1.BigNumber(8),
                            'underlying': underlying,
                            'contract': 'CErc20',
                            'initial_exchange_rate_mantissa': new util_1.BigNumber('20000000000000000'),
                        };
                        return [4 /*yield*/, this.deployCToken(config.underlying, this.comptroller, this.interestRateModel, config.initial_exchange_rate_mantissa, config.symbol, config.name, config.decimals, this.admin)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // cToken must be enabled before minting or accruing interest is allowed
    CompoundHelper.prototype.enableCToken = function (cToken) {
        return __awaiter(this, void 0, void 0, function () {
            var ComptrollerContract, supportMarketData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ComptrollerContract = new web3.eth.Contract(ComptrollerABI_1.ComptrollerABI, this.comptroller);
                        supportMarketData = ComptrollerContract.methods._supportMarket(cToken).encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: this.senderAccountAddress,
                                to: this.comptroller,
                                data: supportMarketData,
                                gas: constants_1.DEFAULT_GAS_LIMIT,
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Sets borrow rate on the interestRateModel
    CompoundHelper.prototype.setBorrowRate = function (cToken, borrowRate) {
        return __awaiter(this, void 0, void 0, function () {
            var InterestRateModelContract, setBorrowData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        InterestRateModelContract = new web3.eth.Contract(InterestRateModelABI_1.InterestRateModelABI, this.interestRateModel);
                        setBorrowData = InterestRateModelContract.methods.setBorrowRate(borrowRate.toString()).encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({
                                from: this.senderAccountAddress,
                                to: this.interestRateModel,
                                data: setBorrowData,
                                gas: constants_1.DEFAULT_GAS_LIMIT,
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CompoundHelper.prototype.deployCToken = function (underlying, comptroller, interestRateModel, initialExchangeRate, symbol, name, decimals, admin) {
        return __awaiter(this, void 0, void 0, function () {
            var instance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new web3.eth.Contract(CErc20ABI_1.CErc20ABI).deploy({
                            data: compoundSnapshotAddresses_1.BYTECODE.CErc20,
                            arguments: [
                                underlying,
                                comptroller,
                                interestRateModel,
                                initialExchangeRate.toString(),
                                name,
                                symbol,
                                decimals.toString(),
                                admin,
                            ],
                        }).send({ from: admin, gas: constants_1.DEFAULT_GAS_LIMIT })];
                    case 1:
                        instance = _a.sent();
                        return [2 /*return*/, instance.options.address];
                }
            });
        });
    };
    CompoundHelper.prototype.getExchangeRate = function (cToken) {
        return __awaiter(this, void 0, void 0, function () {
            var exchangeRate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cTokenInstance(cToken).methods.exchangeRateStored().call()];
                    case 1:
                        exchangeRate = _a.sent();
                        return [2 /*return*/, new util_1.BigNumber(exchangeRate)];
                }
            });
        });
    };
    CompoundHelper.prototype.getExchangeRateCurrent = function (cToken) {
        return __awaiter(this, void 0, void 0, function () {
            var exchangeRate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cTokenInstance(cToken).methods.exchangeRateCurrent().call()];
                    case 1:
                        exchangeRate = _a.sent();
                        return [2 /*return*/, new util_1.BigNumber(exchangeRate)];
                }
            });
        });
    };
    CompoundHelper.prototype.mintCToken = function (cToken, underlyingQuantity, from) {
        if (from === void 0) { from = this.senderAccountAddress; }
        return __awaiter(this, void 0, void 0, function () {
            var txnData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        txnData = this.cTokenInstance(cToken).methods.mint(underlyingQuantity.toString()).encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({ from: from, to: cToken, data: txnData, gas: constants_1.DEFAULT_GAS_LIMIT })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // The redeem function transfers the underlying asset from the money market to
    // the user in exchange for previously minted cTokens. The amount of underlying
    // redeemed is the number of cTokens multiplied by the current Exchange Rate.
    CompoundHelper.prototype.cTokenToUnderlying = function (cToken, cTokenQuantity) {
        return __awaiter(this, void 0, void 0, function () {
            var exchangeRate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cTokenInstance(cToken).methods.exchangeRateStored().call()];
                    case 1:
                        exchangeRate = _a.sent();
                        return [2 /*return*/, cTokenQuantity.mul(exchangeRate).div(util_1.ether(1))];
                }
            });
        });
    };
    // Retrieve # of cTokens expected from Underlying Quantity
    CompoundHelper.prototype.underlyingToCToken = function (cToken, underlyingQuantity) {
        return __awaiter(this, void 0, void 0, function () {
            var exchangeRate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cTokenInstance(cToken).methods.exchangeRateStored().call()];
                    case 1:
                        exchangeRate = _a.sent();
                        return [2 /*return*/, underlyingQuantity.div(exchangeRate).mul(util_1.ether(1))];
                }
            });
        });
    };
    CompoundHelper.prototype.balanceOf = function (cToken, account) {
        return __awaiter(this, void 0, void 0, function () {
            var balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cTokenInstance(cToken).methods.balanceOf(account).call()];
                    case 1:
                        balance = _a.sent();
                        return [2 /*return*/, new util_1.BigNumber(balance)];
                }
            });
        });
    };
    // Retrieves balance of underlying owned
    CompoundHelper.prototype.balanceOfUnderlying = function (cToken, account) {
        return __awaiter(this, void 0, void 0, function () {
            var balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cTokenInstance(cToken).methods.balanceOfUnderlying(account).call()];
                    case 1:
                        balance = _a.sent();
                        return [2 /*return*/, new util_1.BigNumber(balance)];
                }
            });
        });
    };
    CompoundHelper.prototype.accrueInterest = function (cToken, from) {
        if (from === void 0) { from = this.senderAccountAddress; }
        return __awaiter(this, void 0, void 0, function () {
            var txnData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        txnData = this.cTokenInstance(cToken).methods.accrueInterest().encodeABI();
                        return [4 /*yield*/, web3.eth.sendTransaction({ from: from, to: cToken, data: txnData, gas: constants_1.DEFAULT_GAS_LIMIT })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    CompoundHelper.prototype.cTokenInstance = function (cToken) {
        return new web3.eth.Contract(CErc20ABI_1.CErc20ABI, cToken);
    };
    return CompoundHelper;
}());
exports.CompoundHelper = CompoundHelper;
//# sourceMappingURL=compoundHelper.js.map