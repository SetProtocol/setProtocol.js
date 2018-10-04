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

// External
import * as Web3 from 'web3';

import { CoreWrapper } from '../wrappers';

// Assertions
import { AccountAssertions } from './AccountAssertions';
import { CommonAssertions } from './CommonAssertions';
import { CoreAssertions } from './CoreAssertions';
import { ERC20Assertions } from './ERC20Assertions';
import { OrderAssertions } from './OrderAssertions';
import { RebalancingAssertions } from './RebalancingAssertions';
import { SchemaAssertions } from './SchemaAssertions';
import { SetTokenAssertions } from './SetTokenAssertions';
import { VaultAssertions } from './VaultAssertions';

export class Assertions {
  public account: AccountAssertions;
  public common: CommonAssertions;
  public core: CoreAssertions;
  public erc20: ERC20Assertions;
  public order: OrderAssertions;
  public rebalancing: RebalancingAssertions;
  public schema: SchemaAssertions;
  public setToken: SetTokenAssertions;
  public vault: VaultAssertions;

  public constructor(web3: Web3, coreWrapper: CoreWrapper) {
    this.account = new AccountAssertions();
    this.common = new CommonAssertions();
    this.core = new CoreAssertions(web3);
    this.erc20 = new ERC20Assertions(web3);
    this.order = new OrderAssertions(web3, coreWrapper);
    this.rebalancing = new RebalancingAssertions(web3);
    this.schema = new SchemaAssertions();
    this.setToken = new SetTokenAssertions(web3);
    this.vault = new VaultAssertions(web3);
  }
}

