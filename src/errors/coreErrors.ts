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

import { BigNumber } from "../util";

export const coreAPIErrors = {
  COMPONENTS_AND_UNITS_EQUAL_LENGTHS: () =>
    "The components and units arrays need to be equal lengths",
  QUANTITY_NEEDS_TO_BE_NON_ZERO: (quantity: BigNumber) =>
    `The quantity ${quantity.toString()} inputted needs to be non-zero`,
  STRING_CANNOT_BE_EMPTY: (variable: string) => `The string ${variable} cannot be empty`,
};

export const coreAssertionErrors = {
  MISSING_CORE_METHOD: (address: string) =>
    `Contract at ${address} does not implement Core interface.`,
};