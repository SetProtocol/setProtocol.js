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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
// Given that this is an integration test, we unmock the Set Protocol
// smart contracts artifacts package to pull the most recently
// deployed contracts on the current network.
jest.unmock('set-protocol-contracts');
jest.setTimeout(30000);
var chai = __importStar(require("chai"));
var setProtocolUtils = __importStar(require("set-protocol-utils"));
var web3_1 = __importDefault(require("web3"));
var set_protocol_utils_1 = require("set-protocol-utils");
var wrappers_1 = require("@src/wrappers");
var util_1 = require("@src/util");
var helpers_1 = require("@test/helpers");
var SetTestUtils = setProtocolUtils.SetProtocolTestUtils;
var chaiBigNumber = require('chai-bignumber');
chai.use(chaiBigNumber(util_1.BigNumber));
var expect = chai.expect;
var web3 = new web3_1.default('http://localhost:8545');
var web3Utils = new set_protocol_utils_1.Web3Utils(web3);
var currentSnapshotId;
describe('KyberNetworkWrapper', function () {
    var kyberNetworkWrapper;
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, core, transferProxy, kyberNetworkWrapperContract;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, web3Utils.saveTestSnapshot()];
                case 1:
                    currentSnapshotId = _b.sent();
                    return [4 /*yield*/, helpers_1.deployBaseContracts(web3)];
                case 2:
                    _a = _b.sent(), core = _a[0], transferProxy = _a[1];
                    return [4 /*yield*/, helpers_1.deployKyberNetworkWrapperContract(web3, SetTestUtils.KYBER_NETWORK_PROXY_ADDRESS, transferProxy, core)];
                case 3:
                    kyberNetworkWrapperContract = _b.sent();
                    kyberNetworkWrapper = new wrappers_1.KyberNetworkWrapper(web3, kyberNetworkWrapperContract.address);
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, web3Utils.revertToSnapshot(currentSnapshotId)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('conversionRates', function () { return __awaiter(_this, void 0, void 0, function () {
        function subject() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, kyberNetworkWrapper.conversionRates(subjectSourceTokenAddresses, subjectDestinationTokenAddresses, subjectQuantities)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        var subjectSourceTokenAddresses, subjectDestinationTokenAddresses, subjectQuantities;
        var _this = this;
        return __generator(this, function (_a) {
            beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
                var makerTokenAddress, componentTokenAddress;
                return __generator(this, function (_a) {
                    makerTokenAddress = SetTestUtils.KYBER_RESERVE_SOURCE_TOKEN_ADDRESS;
                    componentTokenAddress = SetTestUtils.KYBER_RESERVE_DESTINATION_TOKEN_ADDRESS;
                    subjectSourceTokenAddresses = [makerTokenAddress, makerTokenAddress];
                    subjectDestinationTokenAddresses = [componentTokenAddress, componentTokenAddress];
                    subjectQuantities = [new util_1.BigNumber(Math.pow(10, 10)), new util_1.BigNumber(Math.pow(10, 10))];
                    return [2 /*return*/];
                });
            }); });
            test('gets the correct rates', function () { return __awaiter(_this, void 0, void 0, function () {
                var _a, _b, firstRate, secondRate, firstSlippage, secondSlippage, conversionRates, expectedRate, expectedSecondRate, expectedSlippage, expectedSecondSlippage;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, subject()];
                        case 1:
                            conversionRates = _c.sent();
                            _a = conversionRates[0], firstRate = _a[0], secondRate = _a[1], _b = conversionRates[1], firstSlippage = _b[0], secondSlippage = _b[1];
                            expectedRate = new util_1.BigNumber('321556325900000000');
                            expect(firstRate).to.be.bignumber.equal(expectedRate);
                            expectedSecondRate = new util_1.BigNumber('321556325900000000');
                            expect(secondRate).to.be.bignumber.equal(expectedSecondRate);
                            expectedSlippage = new util_1.BigNumber('319948544270500000');
                            expect(firstSlippage).to.be.bignumber.equal(expectedSlippage);
                            expectedSecondSlippage = new util_1.BigNumber('319948544270500000');
                            expect(secondSlippage).to.be.bignumber.equal(expectedSecondSlippage);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=KyberNetworkWrapper.spec.js.map