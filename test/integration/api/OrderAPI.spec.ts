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
import * as Web3 from 'web3';
import compact = require('lodash.compact');
import {
  Address,
  Bytes,
  ECSig,
  IssuanceOrder,
  SetProtocolUtils,
  SetProtocolTestUtils,
  SignedIssuanceOrder,
  TakerWalletOrder,
  ZeroExSignedFillOrder,
} from 'set-protocol-utils';
import {
  CoreContract,
  SetTokenContract,
  SetTokenFactoryContract,
  StandardTokenMockContract,
  TakerWalletWrapperContract,
  TransferProxyContract,
  VaultContract
} from 'set-protocol-contracts';

import { BigNumber, SignatureUtils } from '../../../src/util';
import ChaiSetup from '../../helpers/chaiSetup';
import { CoreWrapper } from '../../../src/wrappers';
import { DEFAULT_ACCOUNT, ACCOUNTS } from '../../../src/constants/accounts';
import { OrderAPI } from '../../../src/api';
import { ZERO } from '../../../src/constants';
import { ether, Web3Utils, generateFutureTimestamp } from '../../../src/util';
import {
  addAuthorizationAsync,
  approveForTransferAsync,
  deployCoreContract,
  deploySetTokenAsync,
  deployTokenAsync,
  deployTokensAsync,
  deploySetTokenFactoryContract,
  deployTransferProxyContract,
  deployVaultContract,
} from '../../helpers/coreHelpers';
import { deployTakerWalletWrapperContract, deployZeroExExchangeWrapperContract } from '../../helpers/exchangeHelpers';

ChaiSetup.configure();
const { expect } = chai;
const contract = require('truffle-contract');
const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(provider);
const web3Utils = new Web3Utils(web3);
const setProtocolUtils = new SetProtocolUtils(web3);
const { NULL_ADDRESS } = SetProtocolUtils.CONSTANTS;

let currentSnapshotId: number;


describe('OrderAPI', () => {
  let transferProxy: TransferProxyContract;
  let vault: VaultContract;
  let core: CoreContract;
  let setTokenFactory: SetTokenFactoryContract;
  let coreWrapper: CoreWrapper;
  let ordersAPI: OrderAPI;

  beforeEach(async () => {
    currentSnapshotId = await web3Utils.saveTestSnapshot();

    transferProxy = await deployTransferProxyContract(provider);
    vault = await deployVaultContract(provider);
    core = await deployCoreContract(provider, transferProxy.address, vault.address);
    setTokenFactory = await deploySetTokenFactoryContract(provider, core);

    await addAuthorizationAsync(vault, core.address);
    await addAuthorizationAsync(transferProxy, core.address);

    coreWrapper = new CoreWrapper(web3, core.address, transferProxy.address, vault.address);
    ordersAPI = new OrderAPI(web3, coreWrapper);
  });

  describe('generateSalt', async () => {
    function subject(): BigNumber {
      return ordersAPI.generateSalt();
    }

    test('should generate a timestamp in the future', async () => {
      const salt = subject();

      expect(salt).to.be.an('object');
    });
  });

  describe('generateExpirationTimestamp', async () => {
    let secondsInFuture: number;

    beforeEach(async () => {
      secondsInFuture = 100000;
    });

    function subject(): BigNumber {
      return ordersAPI.generateExpirationTimestamp(
        secondsInFuture,
      );
    }

    test('should generate a timestamp in the future', async () => {
      const timestamp = subject();

      const currentTime = new BigNumber(Math.floor((Date.now()) / 1000));
      const expectedTimestamp = currentTime.add(secondsInFuture);
      expect(timestamp).to.bignumber.equal(expectedTimestamp);
    });
  });

  describe('isValidSignatureOrThrowAsync', async () => {
    let orderHash: string;
    let subjectIssuanceOrder: IssuanceOrder;
    let subjectSignature: ECSig;
    let subjectPrefix: boolean;

    beforeEach(async () => {
      const setAddress = '0x8d98a5d27fe34cf7ca410e771a897ed0f14af34c';
      const makerToken = '0x45af2bc687e136460eff84771c4303b90ee0035d';
      const makerTokenAmount = new BigNumber(100000000);
      const relayerAddress = '0x41fbe55863218606f4c6bff768fa70fdbff6e05b';
      const relayerToken = '0x06b7b2996b1bd54805487b20cd97fda90cbffb3d';
      const quantity = new BigNumber(100000);
      const requiredComponents = ['0x48fbf47994d88099913272f91db13fc250a', '0x8421da994a050d01e5f6a09968c2a936a89cd'];
      const requiredComponentAmounts = [new BigNumber(1000), new BigNumber(1000)];
      subjectIssuanceOrder = {
        setAddress,
        makerAddress: DEFAULT_ACCOUNT,
        makerToken,
        makerTokenAmount,
        relayerAddress,
        relayerToken,
        quantity,
        expiration: ordersAPI.generateExpirationTimestamp(86400),
        makerRelayerFee: ZERO,
        takerRelayerFee: ZERO,
        requiredComponents,
        requiredComponentAmounts,
        salt: ordersAPI.generateSalt(),
      };
      orderHash = SetProtocolUtils.hashOrderHex(subjectIssuanceOrder);
      subjectSignature = await setProtocolUtils.signMessage(orderHash, DEFAULT_ACCOUNT);
      subjectPrefix = true;
    });

    async function subject(): Promise<boolean> {
      return await ordersAPI.isValidSignatureOrThrowAsync(
        subjectIssuanceOrder,
        subjectSignature,
        subjectPrefix,
      );
    }

    test('should return true with a valid signature', async () => {
      const isValid = await subject();

      expect(isValid).to.equal(true);
    });
  });

  describe('signOrderAsync', async () => {
    let subjectIssuanceOrder: IssuanceOrder;
    let subjectSigner: Address;
    let subjectAddPrefix: boolean;
    let orderHash: string;

    beforeEach(async () => {
      const setAddress = '0x8d98a5d27fe34cf7ca410e771a897ed0f14af34c';
      const makerToken = '0x45af2bc687e136460eff84771c4303b90ee0035d';
      const makerTokenAmount = new BigNumber(100000000);
      const relayerAddress = '0x41fbe55863218606f4c6bff768fa70fdbff6e05b';
      const relayerToken = '0x06b7b2996b1bd54805487b20cd97fda90cbffb3d';
      const quantity = new BigNumber(100000);
      const requiredComponents = ['0x48fbf47994d88099913272f91db13fc250a', '0x8421da994a050d01e5f6a09968c2a936a89cd'];
      const requiredComponentAmounts = [new BigNumber(1000), new BigNumber(1000)];
      subjectIssuanceOrder = {
        setAddress,
        makerAddress: DEFAULT_ACCOUNT,
        makerToken,
        makerTokenAmount,
        relayerAddress,
        relayerToken,
        quantity,
        expiration: ordersAPI.generateExpirationTimestamp(86400),
        makerRelayerFee: ZERO,
        takerRelayerFee: ZERO,
        requiredComponents,
        requiredComponentAmounts,
        salt: ordersAPI.generateSalt(),
      };

      subjectSigner = DEFAULT_ACCOUNT;
      subjectAddPrefix = false;
    });

    async function subject(): Promise<ECSig> {
      return await ordersAPI.signOrderAsync(
        subjectIssuanceOrder,
        subjectAddPrefix,
        { from: subjectSigner }
      );
    }

    test('produces a valid signature', async () => {
      const signature = await subject();

      orderHash = SetProtocolUtils.hashOrderHex(subjectIssuanceOrder);
      const isValid = SignatureUtils.isValidSignature(orderHash, signature, DEFAULT_ACCOUNT);
      expect(isValid);
    });
  });

  describe('validateOrderFillableOrThrowAsync', async () => {
    let issuanceOrderMaker: Address;
    let issuanceOrderQuantity: BigNumber;

    let subjectSignedIssuanceOrder: SignedIssuanceOrder;
    let subjectFillQuantity: BigNumber;

    beforeEach(async () => {
      const issuanceOrderTaker = ACCOUNTS[0].address;
      issuanceOrderMaker = ACCOUNTS[1].address;
      const relayerAddress = ACCOUNTS[2].address;
      const zeroExOrderMaker = ACCOUNTS[3].address;

      const firstComponent = await deployTokenAsync(provider, issuanceOrderTaker);
      const secondComponent = await deployTokenAsync(provider, zeroExOrderMaker);
      const makerToken = await deployTokenAsync(provider, issuanceOrderMaker);
      const relayerToken = await deployTokenAsync(provider, issuanceOrderMaker);

      const componentTokens = [firstComponent, secondComponent];
      const setComponentUnit = ether(4);
      const componentAddresses = componentTokens.map(token => token.address);
      const componentUnits = componentTokens.map(token => setComponentUnit);
      const naturalUnit = ether(2);
      const setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        naturalUnit,
      );

      issuanceOrderQuantity = ether(4);
      const issuanceOrderMakerTokenAmount = ether(10);
      const issuanceOrderExpiration = generateFutureTimestamp(10000);
      const requiredComponents = [firstComponent.address, secondComponent.address];
      const requredComponentAmounts = _.map(componentUnits, unit => unit.mul(issuanceOrderQuantity).div(naturalUnit));
      const issuanceOrderMakerRelayerFee = ZERO;
      const issuanceOrderTakerRelayerFee = ZERO;
      subjectSignedIssuanceOrder = await ordersAPI.createSignedOrderAsync(
        setToken.address,
        issuanceOrderQuantity,
        requiredComponents,
        requredComponentAmounts,
        issuanceOrderMaker,
        makerToken.address,
        issuanceOrderMakerTokenAmount,
        issuanceOrderExpiration,
        relayerAddress,
        relayerToken.address,
        issuanceOrderMakerRelayerFee,
        issuanceOrderTakerRelayerFee,
      );
      subjectFillQuantity = issuanceOrderQuantity;
    });

    async function subject(): Promise<void> {
      return await ordersAPI.validateOrderFillableOrThrowAsync(
        subjectSignedIssuanceOrder,
        subjectFillQuantity
      );
    }

    it('should not throw', async () => {
      return expect(subject()).to.not.be.rejected;
    });

    describe('when the order is expired', async () => {
      beforeEach(async () => {
        const expiredTime = generateFutureTimestamp(0);
        const { signature, ...issuanceOrder } = subjectSignedIssuanceOrder;
        issuanceOrder.expiration = expiredTime;

        const orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);
        const newSignature = await setProtocolUtils.signMessage(orderHash, issuanceOrderMaker);

        subjectSignedIssuanceOrder.expiration = expiredTime;
        subjectSignedIssuanceOrder.signature = newSignature;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('Expiration date has already passed.');
      });
    });

    describe('when the fill amount is greater than the fillable amount', async () => {
      beforeEach(async () => {
        subjectFillQuantity = issuanceOrderQuantity.add(100000);
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('The fill quantity supplied exceeds the amount available to fill.');
      });
    });
  });

  describe('createSignedOrderAsync', async () => {
    let componentTokens: StandardTokenMockContract[];

    let subjectSetAddress: Address;
    let subjectQuantity: BigNumber;
    let subjectRequiredComponents: Address[];
    let subjectRequredComponentAmounts: BigNumber[];
    let subjectMakerAddress: Address;
    let subjectMakerToken: Address;
    let subjectMakerTokenAmount: BigNumber;
    let subjectExpiration: BigNumber;
    let subjectRelayerAddress: Address;
    let subjectRelayerToken: Address;
    let subjectMakerRelayerFee: BigNumber;
    let subjectTakerRelayerFee: BigNumber;
    let subjectSalt: BigNumber;

    beforeEach(async () => {
      componentTokens = await deployTokensAsync(4, provider);
      const firstComponentAddress = componentTokens[0].address;
      const secondComponentAddress = componentTokens[1].address;
      const makerTokenAddress = componentTokens[2].address;
      const relayerTokenAddress = componentTokens[3].address;

      subjectSetAddress = '0x8d98a5d27fe34cf7ca410e771a897ed0f14af34c';
      subjectQuantity = ether(4);
      subjectMakerToken = makerTokenAddress;
      subjectMakerAddress = DEFAULT_ACCOUNT;
      subjectMakerTokenAmount = ether(2);
      subjectExpiration = generateFutureTimestamp(10000);
      subjectRelayerAddress = '0x41fbe55863218606f4c6bff768fa70fdbff6e05b';
      subjectRelayerToken = relayerTokenAddress;
      subjectRequiredComponents = [firstComponentAddress, secondComponentAddress];
      subjectRequredComponentAmounts = [ether(4), ether(4)];
      subjectMakerRelayerFee = ZERO;
      subjectTakerRelayerFee = ZERO;
      subjectSalt = ordersAPI.generateSalt();
    });

    async function subject(): Promise<SignedIssuanceOrder> {
      return await ordersAPI.createSignedOrderAsync(
        subjectSetAddress,
        subjectQuantity,
        subjectRequiredComponents,
        subjectRequredComponentAmounts,
        subjectMakerAddress,
        subjectMakerToken,
        subjectMakerTokenAmount,
        subjectExpiration,
        subjectRelayerAddress,
        subjectRelayerToken,
        subjectMakerRelayerFee,
        subjectTakerRelayerFee,
        subjectSalt,
      );
    }

    test('produces a signed issuance order containing a valid signature', async () => {
      const signedIssuanceOrder = await subject();

      const order: IssuanceOrder = {
        setAddress: subjectSetAddress,
        makerAddress: subjectMakerAddress,
        makerToken: subjectMakerToken,
        relayerAddress: subjectRelayerAddress,
        relayerToken: subjectRelayerToken,
        quantity: subjectQuantity,
        makerTokenAmount: subjectMakerTokenAmount,
        expiration: subjectExpiration,
        makerRelayerFee: subjectMakerRelayerFee,
        takerRelayerFee: subjectTakerRelayerFee,
        requiredComponents: subjectRequiredComponents,
        requiredComponentAmounts: subjectRequredComponentAmounts,
        salt: subjectSalt,
      };
      const orderHashBuffer = SignatureUtils.addPersonalMessagePrefix(SetProtocolUtils.hashOrderHex(order));
      const signature = signedIssuanceOrder.signature;
      const signerPublicKey = ethUtil.ecrecover(
        ethUtil.toBuffer(orderHashBuffer),
        Number(signature.v.toString()),
        ethUtil.toBuffer(signature.r),
        ethUtil.toBuffer(signature.s),
      );

      const signerWalletAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(signerPublicKey));
      expect(signerWalletAddress).to.equal(DEFAULT_ACCOUNT);
    });

    describe('when the set address is invalid', async () => {
      beforeEach(async () => {
        subjectSetAddress = 'invalidSetAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected setAddress to conform to schema /Address.

        Encountered: "invalidSetAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the maker address is invalid', async () => {
      beforeEach(async () => {
        subjectMakerAddress = 'invalidMakerAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected makerAddress to conform to schema /Address.

        Encountered: "invalidMakerAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the relayer address is invalid', async () => {
      beforeEach(async () => {
        subjectRelayerAddress = 'invalidRelayerAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected relayerAddress to conform to schema /Address.

        Encountered: "invalidRelayerAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the relayer address is invalid', async () => {
      beforeEach(async () => {
        subjectRelayerToken = 'invalidRelayerTokenAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected relayerToken to conform to schema /Address.

        Encountered: "invalidRelayerTokenAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the relayer token address is invalid', async () => {
      beforeEach(async () => {
        subjectRelayerToken = 'invalidRelayerTokenAddress';
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected relayerToken to conform to schema /Address.

        Encountered: "invalidRelayerTokenAddress"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the quantity is negative', async () => {
      let invalidQuantity: BigNumber;

      beforeEach(async () => {
        invalidQuantity = new BigNumber(-1);

        subjectQuantity = invalidQuantity;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity ${invalidQuantity} inputted needs to be greater than zero.`
        );
      });
    });

    describe('when the token addresses and quantities are not the same length', async () => {
      beforeEach(async () => {
        subjectRequiredComponents = [componentTokens[0].address];
        subjectRequredComponentAmounts = [];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          'The requiredComponents and requiredComponentAmounts arrays need to be equal lengths.'
        );
      });
    });

    describe('when the token addresses contains an empty address', async () => {
      beforeEach(async () => {
        const placeholderRequiredAmountForArrayLength = ether(1);

        subjectRequiredComponents = [undefined];
        subjectRequredComponentAmounts = [placeholderRequiredAmountForArrayLength];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('The string tokenAddress cannot be empty.');
      });
    });

    describe('when required components contains an invalid address', async () => {
      let invalidComponentAddress: Address;

      beforeEach(async () => {
        const placeholderRequiredAmountForArrayLength = ether(1);
        invalidComponentAddress = 'someNonAddressString';

        subjectRequiredComponents = [invalidComponentAddress];
        subjectRequredComponentAmounts = [placeholderRequiredAmountForArrayLength];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
      `
        Expected tokenAddress to conform to schema /Address.

        Encountered: "someNonAddressString"

        Validation errors: instance does not match pattern "^0x[0-9a-fA-F]{40}$"
      `
        );
      });
    });

    describe('when the token addresses contains an address for a contract that is not ERC20', async () => {
      let nonERC20ContractAddress: Address;

      beforeEach(async () => {
        const placeholderRequiredAmountForArrayLength = ether(1);
        nonERC20ContractAddress = coreWrapper.vaultAddress;

        subjectRequiredComponents = [nonERC20ContractAddress];
        subjectRequredComponentAmounts = [placeholderRequiredAmountForArrayLength];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `Contract at ${nonERC20ContractAddress} does not implement ERC20 interface.`
        );
      });
    });

    describe('when the expiration is expired', async () => {
      beforeEach(async () => {
        const invalidUnixExpirationTime = new BigNumber(1);
        subjectExpiration = invalidUnixExpirationTime;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith('Expiration date has already passed.');
      });
    });
  });

  describe('fillOrderAsync', async () => {
    let issuanceOrderMaker: Address;
    let issuanceOrderQuantity: BigNumber;
    let setToken: SetTokenContract;

    let subjectSignedIssuanceOrder: SignedIssuanceOrder;
    let subjectQuantityToFill: BigNumber;
    let subjectOrders: (ZeroExSignedFillOrder | TakerWalletOrder)[];
    let subjectCaller: Address;

    beforeEach(async () => {
      await deployTakerWalletWrapperContract(transferProxy, core, provider);
      await deployZeroExExchangeWrapperContract(
        SetProtocolTestUtils.ZERO_EX_EXCHANGE_ADDRESS,
        SetProtocolTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        transferProxy,
        core,
        provider,
      );

      const issuanceOrderTaker = ACCOUNTS[0].address;
      issuanceOrderMaker = ACCOUNTS[1].address;
      const relayerAddress = ACCOUNTS[2].address;
      const zeroExOrderMaker = ACCOUNTS[3].address;

      const firstComponent = await deployTokenAsync(provider, issuanceOrderTaker);
      const secondComponent = await deployTokenAsync(provider, zeroExOrderMaker);
      const makerToken = await deployTokenAsync(provider, issuanceOrderMaker);
      const relayerToken = await deployTokenAsync(provider, issuanceOrderMaker);

      const componentTokens = [firstComponent, secondComponent];
      const setComponentUnit = ether(4);
      const componentAddresses = componentTokens.map(token => token.address);
      const componentUnits = componentTokens.map(token => setComponentUnit);
      const naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        naturalUnit,
      );

      await approveForTransferAsync([makerToken, relayerToken], transferProxy.address, issuanceOrderMaker);
      await approveForTransferAsync([firstComponent, relayerToken], transferProxy.address, issuanceOrderTaker);
      await approveForTransferAsync(
        [secondComponent],
        SetProtocolTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        zeroExOrderMaker
      );

      issuanceOrderQuantity = ether(4);
      const issuanceOrderMakerTokenAmount = ether(10);
      const issuanceOrderExpiration = generateFutureTimestamp(10000);
      const requiredComponents = [firstComponent.address, secondComponent.address];
      const requredComponentAmounts = _.map(componentUnits, unit => unit.mul(issuanceOrderQuantity).div(naturalUnit));
      const issuanceOrderMakerRelayerFee = ZERO;
      const issuanceOrderTakerRelayerFee = ZERO;
      subjectSignedIssuanceOrder = await ordersAPI.createSignedOrderAsync(
        setToken.address,
        issuanceOrderQuantity,
        requiredComponents,
        requredComponentAmounts,
        issuanceOrderMaker,
        makerToken.address,
        issuanceOrderMakerTokenAmount,
        issuanceOrderExpiration,
        relayerAddress,
        relayerToken.address,
        issuanceOrderMakerRelayerFee,
        issuanceOrderTakerRelayerFee,
      );

      const takerWalletOrder = {
        takerTokenAddress: firstComponent.address,
        takerTokenAmount: requredComponentAmounts[0],
      } as TakerWalletOrder;

      const zeroExOrder: ZeroExSignedFillOrder = await setProtocolUtils.generateZeroExSignedFillOrder(
        NULL_ADDRESS,                                  // senderAddress
        zeroExOrderMaker,                              // makerAddress
        NULL_ADDRESS,                                  // takerAddress
        ZERO,                                          // makerFee
        ZERO,                                          // takerFee
        requredComponentAmounts[1],                    // makerAssetAmount
        ether(10).div(2),                              // takerAssetAmount
        secondComponent.address,                       // makerAssetAddress
        makerToken.address,                            // takerAssetAddress
        SetProtocolUtils.generateSalt(),               // salt
        SetProtocolTestUtils.ZERO_EX_EXCHANGE_ADDRESS, // exchangeAddress
        NULL_ADDRESS,                                  // feeRecipientAddress
        generateFutureTimestamp(10000),                // expirationTimeSeconds
        ether(10).div(2),                              // amount of zeroExOrder to fill
      );

      subjectOrders = [takerWalletOrder, zeroExOrder];
      subjectQuantityToFill = issuanceOrderQuantity;
      subjectCaller = issuanceOrderTaker;
    });

    async function subject(): Promise<string> {
      return await ordersAPI.fillOrderAsync(
        subjectSignedIssuanceOrder,
        subjectQuantityToFill,
        subjectOrders,
        { from: subjectCaller }
      );
    }

    test('issues the set to the order maker', async () => {
      const existingUserSetTokenBalance = await setToken.balanceOf.callAsync(issuanceOrderMaker);

      await subject();

      const expectedUserSetTokenBalance = existingUserSetTokenBalance.add(issuanceOrderQuantity);
      const newUserSetTokenBalance = await setToken.balanceOf.callAsync(issuanceOrderMaker);
      expect(newUserSetTokenBalance).to.eql(expectedUserSetTokenBalance);
    });

    describe('when the quantities containes a negative number', async () => {
      let invalidQuantity: BigNumber;

      beforeEach(async () => {
        invalidQuantity = new BigNumber(-1);

        subjectQuantityToFill = invalidQuantity;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity ${invalidQuantity} inputted needs to be greater than zero.`
        );
      });
    });

    describe('when the orders array is empty', async () => {
      beforeEach(async () => {
        subjectOrders = [];
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The array orders cannot be empty.`
        );
      });
    });
  });

  describe('cancelOrderAsync', async () => {
    let subjectSignedIssuanceOrder: SignedIssuanceOrder;
    let subjectCancelQuantity: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const issuanceOrderTaker = ACCOUNTS[0].address;
      const issuanceOrderMaker = ACCOUNTS[1].address;
      const relayerAddress = ACCOUNTS[2].address;
      const zeroExOrderMaker = ACCOUNTS[3].address;

      const firstComponent = await deployTokenAsync(provider, issuanceOrderTaker);
      const secondComponent = await deployTokenAsync(provider, zeroExOrderMaker);
      const makerToken = await deployTokenAsync(provider, issuanceOrderMaker);
      const relayerToken = await deployTokenAsync(provider, issuanceOrderMaker);

      const componentTokens = [firstComponent, secondComponent];
      const setComponentUnit = ether(4);
      const componentAddresses = componentTokens.map(token => token.address);
      const componentUnits = componentTokens.map(token => setComponentUnit);
      const naturalUnit = ether(2);
      const setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        naturalUnit,
      );

      const issuanceOrderQuantity = ether(4);
      const issuanceOrderMakerTokenAmount = ether(10);
      const issuanceOrderExpiration = generateFutureTimestamp(10000);
      const requiredComponents = [firstComponent.address, secondComponent.address];
      const requredComponentAmounts = _.map(componentUnits, unit => unit.mul(issuanceOrderQuantity).div(naturalUnit));
      const issuanceOrderMakerRelayerFee = ZERO;
      const issuanceOrderTakerRelayerFee = ZERO;
      subjectSignedIssuanceOrder = await ordersAPI.createSignedOrderAsync(
        setToken.address,
        issuanceOrderQuantity,
        requiredComponents,
        requredComponentAmounts,
        issuanceOrderMaker,
        makerToken.address,
        issuanceOrderMakerTokenAmount,
        issuanceOrderExpiration,
        relayerAddress,
        relayerToken.address,
        issuanceOrderMakerRelayerFee,
        issuanceOrderTakerRelayerFee,
      );
      subjectCancelQuantity = issuanceOrderQuantity;
      subjectCaller = issuanceOrderMaker;
    });

    async function subject(): Promise<string> {
      return await ordersAPI.cancelOrderAsync(
        subjectSignedIssuanceOrder,
        subjectCancelQuantity,
        { from: subjectCaller }
      );
    }

    test('updates the cancel amount for the order', async () => {
      const { signature, ...issuanceOrder } = subjectSignedIssuanceOrder;
      const orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);
      const existingCancelAmount = await core.orderCancels.callAsync(orderHash);

      await subject();

      const expectedCancelAmounts = existingCancelAmount.add(subjectCancelQuantity);
      const newCancelAmount = await core.orderCancels.callAsync(orderHash);
      expect(newCancelAmount).to.bignumber.equal(expectedCancelAmounts);
    });

    describe('when the quantity is negative', async () => {
      let invalidQuantity: BigNumber;

      beforeEach(async () => {
        invalidQuantity = new BigNumber(-1);

        subjectCancelQuantity = invalidQuantity;
      });

      test('throws', async () => {
        return expect(subject()).to.be.rejectedWith(
          `The quantity ${invalidQuantity} inputted needs to be greater than zero.`
        );
      });
    });
  });

  describe('getOrderFillsAsync', async () => {
    let issuanceOrderMaker: Address;
    let issuanceOrderQuantity: BigNumber;
    let setToken: SetTokenContract;

    let subjectSignedIssuanceOrder: SignedIssuanceOrder;
    let subjectQuantityToFill: BigNumber;

    beforeEach(async () => {
      let orders: (ZeroExSignedFillOrder | TakerWalletOrder)[];
      let caller: Address;

      await deployTakerWalletWrapperContract(transferProxy, core, provider);
      await deployZeroExExchangeWrapperContract(
        SetProtocolTestUtils.ZERO_EX_EXCHANGE_ADDRESS,
        SetProtocolTestUtils.ZERO_EX_ERC20_PROXY_ADDRESS,
        transferProxy,
        core,
        provider,
      );

      const issuanceOrderTaker = ACCOUNTS[0].address;
      issuanceOrderMaker = ACCOUNTS[1].address;
      const relayerAddress = ACCOUNTS[2].address;

      const firstComponent = await deployTokenAsync(provider, issuanceOrderTaker);
      const secondComponent = await deployTokenAsync(provider, issuanceOrderTaker);
      const makerToken = await deployTokenAsync(provider, issuanceOrderMaker);
      const relayerToken = await deployTokenAsync(provider, issuanceOrderMaker);

      const componentTokens = [firstComponent, secondComponent];
      const setComponentUnit = ether(4);
      const componentAddresses = componentTokens.map(token => token.address);
      const componentUnits = componentTokens.map(token => setComponentUnit);
      const naturalUnit = ether(2);
      setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        naturalUnit,
      );

      await approveForTransferAsync([makerToken, relayerToken], transferProxy.address, issuanceOrderMaker);
      await approveForTransferAsync(
        [firstComponent, secondComponent, relayerToken],
        transferProxy.address,
        issuanceOrderTaker
      );

      issuanceOrderQuantity = ether(4);
      const issuanceOrderMakerTokenAmount = ether(10);
      const issuanceOrderExpiration = generateFutureTimestamp(10000);
      const requiredComponents = [firstComponent.address, secondComponent.address];
      const requredComponentAmounts = _.map(componentUnits, unit => unit.mul(issuanceOrderQuantity).div(naturalUnit));
      const issuanceOrderMakerRelayerFee = ZERO;
      const issuanceOrderTakerRelayerFee = ZERO;
      subjectSignedIssuanceOrder = await ordersAPI.createSignedOrderAsync(
        setToken.address,
        issuanceOrderQuantity,
        requiredComponents,
        requredComponentAmounts,
        issuanceOrderMaker,
        makerToken.address,
        issuanceOrderMakerTokenAmount,
        issuanceOrderExpiration,
        relayerAddress,
        relayerToken.address,
        issuanceOrderMakerRelayerFee,
        issuanceOrderTakerRelayerFee,
      );

      const takerWalletOrder1 = {
        takerTokenAddress: firstComponent.address,
        takerTokenAmount: requredComponentAmounts[0],
      } as TakerWalletOrder;

      const takerWalletOrder2 = {
        takerTokenAddress: secondComponent.address,
        takerTokenAmount: requredComponentAmounts[1],
      } as TakerWalletOrder;

      orders = [takerWalletOrder1, takerWalletOrder2];
      subjectQuantityToFill = issuanceOrderQuantity;
      caller = issuanceOrderTaker;

      await ordersAPI.fillOrderAsync(
        subjectSignedIssuanceOrder,
        subjectQuantityToFill,
        orders,
        { from: caller }
      );
    });

    async function subject(): Promise<BigNumber> {
      return await ordersAPI.getOrderFillsAsync(
        subjectSignedIssuanceOrder,
      );
    }

    test('should return with the correct filled quantity', async () => {
      const orderFilledQuantity = await subject();

      expect(orderFilledQuantity).to.bignumber.equal(subjectQuantityToFill);
    });
  });

  describe('getOrderCancelledAsync', async () => {
    let subjectSignedIssuanceOrder: SignedIssuanceOrder;
    let subjectCancelQuantity: BigNumber;
    let subjectCaller: Address;

    beforeEach(async () => {
      const issuanceOrderTaker = ACCOUNTS[0].address;
      const issuanceOrderMaker = ACCOUNTS[1].address;
      const relayerAddress = ACCOUNTS[2].address;

      const firstComponent = await deployTokenAsync(provider, issuanceOrderTaker);
      const makerToken = await deployTokenAsync(provider, issuanceOrderMaker);
      const relayerToken = await deployTokenAsync(provider, issuanceOrderMaker);

      const componentTokens = [firstComponent];
      const setComponentUnit = ether(4);
      const componentAddresses = componentTokens.map(token => token.address);
      const componentUnits = componentTokens.map(token => setComponentUnit);
      const naturalUnit = ether(2);
      const setToken = await deploySetTokenAsync(
        web3,
        core,
        setTokenFactory.address,
        componentAddresses,
        componentUnits,
        naturalUnit,
      );

      const issuanceOrderQuantity = ether(4);
      const issuanceOrderMakerTokenAmount = ether(10);
      const issuanceOrderExpiration = generateFutureTimestamp(10000);
      const requiredComponents = [firstComponent.address];
      const requredComponentAmounts = _.map(componentUnits, unit => unit.mul(issuanceOrderQuantity).div(naturalUnit));
      const issuanceOrderMakerRelayerFee = ZERO;
      const issuanceOrderTakerRelayerFee = ZERO;
      subjectSignedIssuanceOrder = await ordersAPI.createSignedOrderAsync(
        setToken.address,
        issuanceOrderQuantity,
        requiredComponents,
        requredComponentAmounts,
        issuanceOrderMaker,
        makerToken.address,
        issuanceOrderMakerTokenAmount,
        issuanceOrderExpiration,
        relayerAddress,
        relayerToken.address,
        issuanceOrderMakerRelayerFee,
        issuanceOrderTakerRelayerFee,
      );
      subjectCancelQuantity = issuanceOrderQuantity;
      subjectCaller = issuanceOrderMaker;

      await ordersAPI.cancelOrderAsync(
        subjectSignedIssuanceOrder,
        subjectCancelQuantity,
        { from: subjectCaller }
      );
    });

    async function subject(): Promise<BigNumber> {
      return ordersAPI.getOrderCancelledAsync(
        subjectSignedIssuanceOrder,
      );
    }
    test('should return with the correct cancel quantity', async () => {
      const orderFilledQuantity = await subject();

      expect(orderFilledQuantity).to.bignumber.equal(subjectCancelQuantity);
    });
  });
});
