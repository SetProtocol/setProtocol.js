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

// Given that this is an integration test, we unmock the Set Protocol
// smart contracts artifacts package to pull the most recently
// deployed contracts on the current network.
jest.unmock('set-protocol-contracts');
jest.setTimeout(30000);

import * as _ from 'lodash';
import * as ABIDecoder from 'abi-decoder';
import * as chai from 'chai';
import * as ethUtil from 'ethereumjs-util';
import { TransactionReceipt } from 'ethereum-types';
import * as Web3 from 'web3';
import { Address, Log } from 'set-protocol-utils';
import { StandardTokenMock } from 'set-protocol-contracts';
import { CoreContract, StandardTokenMockContract, VaultContract } from 'set-protocol-contracts';

import ChaiSetup from '@test/helpers/chaiSetup';
import { BlockchainAPI } from '@src/api';
import { CoreWrapper } from '@src/wrappers';
import { Assertions } from '@src/assertions';
import { BigNumber, getFormattedLogsFromReceipt } from '@src/util';
import { DEFAULT_ACCOUNT, ACCOUNTS } from '@src/constants/accounts';
import { TX_DEFAULTS, ZERO } from '@src/constants';
import {
  deployTokenAsync,
  deployVaultContract,
  deployTransferProxyContract,
  deployCoreContract
} from '@test/helpers';
import { getVaultBalances } from '@test/helpers/vaultHelpers';
import { testSets, TestSet } from '../../testSets';
import { Web3Utils } from '@src/util/Web3Utils';

ChaiSetup.configure();
const contract = require('truffle-contract');
const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);
const { expect } = chai;

const standardTokenContract = contract(StandardTokenMock);
standardTokenContract.setProvider(provider);
standardTokenContract.defaults(TX_DEFAULTS);

let currentSnapshotId: number;


describe('BlockchainAPI', () => {
  let blockchainAPI: BlockchainAPI;
  let standardToken: StandardTokenMockContract;

  beforeAll(() => {
    ABIDecoder.addABI(standardTokenContract.abi);
  });

  afterAll(() => {
    ABIDecoder.removeABI(standardTokenContract.abi);
  });

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    standardToken = await deployTokenAsync(provider);
    const transferProxy = await deployTransferProxyContract(provider);
    const vault = await deployVaultContract(provider);
    const core = await deployCoreContract(provider, transferProxy.address, vault.address);
    const coreWrapper = new CoreWrapper(web3, core.address, transferProxy.address, vault.address);
    const assertions = new Assertions(web3, coreWrapper);

    blockchainAPI = new BlockchainAPI(web3, assertions);
  });

  afterEach(async () => {
    await web3Utils.revertToSnapshot(currentSnapshotId);
  });

  describe('awaitTransactionMinedAsync', async () => {
    let subjectCaller: Address;
    let subjectSpender: Address;
    let subjectQuantity: BigNumber;
    let subjectTxHash: ByteString;

    beforeEach(async () => {
      subjectCaller = DEFAULT_ACCOUNT;
      subjectSpender = ACCOUNTS[0].address;
      subjectQuantity = new BigNumber(1);

      subjectTxHash = await standardToken.approve.sendTransactionAsync(
        subjectSpender,
        subjectQuantity,
        { from: subjectCaller},
      );
    });

    async function subject(): Promise<TransactionReceipt> {
      return await blockchainAPI.awaitTransactionMinedAsync(
        subjectTxHash,
      );
    }

    test('returns transaction receipt with the correct logs', async () => {
      const receipt = await subject();

      const formattedLogs: Log[] = getFormattedLogsFromReceipt(receipt);
      const [approvalLog] = formattedLogs;
      const { owner, spender, value } = approvalLog.args;

      expect(approvalLog.address).to.equal(standardToken.address);
      expect(owner).to.equal(subjectCaller);
      expect(spender).to.equal(subjectSpender);
      expect(value).to.bignumber.equal(subjectQuantity);
    });
  });
});
