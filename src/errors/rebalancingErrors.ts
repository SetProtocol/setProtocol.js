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


export const rebalancingErrors = {
  REBALANCE_IN_PROGRESS: (rebalancingSetAddress: string) => `Rebalancing token at ${rebalancingSetAddress} is ` +
    `currently in rebalancing state. Issue, Redeem, and propose functionality is not available during this time`,
  NOT_REBALANCING_MANAGER: (caller: string) => `Caller ${caller} is not the manager of this Rebalancing Set Token.`,
  INSUFFICIENT_TIME_PASSED: (nextAvailableRebalance: string) => `Attempting to rebalance too soon. Rebalancing next ` +
    `available on ${nextAvailableRebalance}`,
  INCORRECT_STATE: (rebalancingSetAddress: string, requiredState: string) => `Rebalancing token at ` +
    `${rebalancingSetAddress} must be in ${requiredState} state to call that function.`,
  NOT_ENOUGH_SETS_REBALANCED: (nextAvailableRebalance: string, minimumBid: string, remainingCurrentSets: string) =>
    `In order to settle rebalance there must be less than current ${minimumBid} sets remaining to be rebalanced. ` +
    `There are currently ${remainingCurrentSets} remaining for rebalance.`,
  BID_AMOUNT_EXCEEDS_REMAINING_CURRENT_SETS: (remainingCurrentSets: string, bidQuantity: string) => `The submitted ` +
    `bid quantity, ${bidQuantity}, exceeds the remaining current sets, ${remainingCurrentSets}.`,
  BID_AMOUNT_NOT_MULTIPLE_OF_MINIMUM_BID: (bidQuantity: string, minimumBid: string) => `The submitted bid quantity` +
    `, ${bidQuantity}, must be a multiple of the minimumBid, ${minimumBid}.`,
};