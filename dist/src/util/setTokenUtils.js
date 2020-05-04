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
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require(".");
var TRANSFER_GAS_MAXIMUM = new _1.BigNumber(70000);
exports.estimateIssueRedeemGasCost = function (numComponents) {
    var baseIssueRedeemGasCost = new _1.BigNumber(70000);
    return numComponents
        .times(TRANSFER_GAS_MAXIMUM)
        .plus(baseIssueRedeemGasCost)
        .toNumber();
};
exports.parseRebalanceState = function (contractRebalanceState) {
    switch (contractRebalanceState.valueOf()) {
        case '0':
            return 'Default';
        case '1':
            return 'Proposal';
        case '2':
            return 'Rebalance';
        default:
            return 'Drawdown';
    }
};
//# sourceMappingURL=setTokenUtils.js.map