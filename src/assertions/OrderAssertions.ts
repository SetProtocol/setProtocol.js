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

import * as _ from 'lodash';
import {
  Address,
  ExchangeOrder,
  IssuanceOrder,
  SetProtocolUtils,
  SignedIssuanceOrder,
} from 'set-protocol-utils';
import { erc20AssertionErrors, coreAPIErrors, setTokenAssertionsErrors } from '../errors';
import { SetTokenContract, CoreContract } from 'set-protocol-contracts';
import { CoreAssertions } from './CoreAssertions';
import { CommonAssertions } from './CommonAssertions';
import { SchemaAssertions } from './SchemaAssertions';
import { ERC20Assertions } from './ERC20Assertions';
import { SetTokenAssertions } from './SetTokenAssertions';
import { CoreWrapper } from '../wrappers';
import { NULL_ADDRESS } from '../constants';
import { BigNumber } from '../util';
import * as Web3 from 'web3';



export class OrderAssertions {
  private web3: Web3;
  private erc20Assertions: ERC20Assertions;
  private schemaAssertions: SchemaAssertions;
  private coreAssertions: CoreAssertions;
  private commonAssertions: CommonAssertions;
  private setTokenAssertions: SetTokenAssertions;

  constructor(web3: Web3) {
    this.web3 = web3;
    this.erc20Assertions = new ERC20Assertions(web3);
    this.schemaAssertions = new SchemaAssertions();
    this.coreAssertions = new CoreAssertions(web3);
    this.commonAssertions = new CommonAssertions();
    this.setTokenAssertions = new SetTokenAssertions(web3);
  }

  public async isIssuanceOrderFillable(
    coreAddress: Address,
    signedIssuanceOrder: SignedIssuanceOrder,
    fillQuantity: BigNumber,
  ): Promise<void> {
    const coreContract = await CoreContract.at(coreAddress, this.web3, {});

    const issuanceOrder: IssuanceOrder = _.omit(signedIssuanceOrder, 'signature');
    const orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);

    // Checks the order has not expired
    this.commonAssertions.isValidExpiration(issuanceOrder.expiration, coreAPIErrors.EXPIRATION_PASSED());

    // Checks that it has not been fully filled already
    const filledAmount = await coreContract.orderFills.callAsync(orderHash);
    const cancelledAmount = await coreContract.orderCancels.callAsync(orderHash);
    const fillableQuantity = issuanceOrder.quantity.sub(filledAmount).sub(cancelledAmount);
    this.commonAssertions.isGreaterOrEqualThan(fillableQuantity, fillQuantity, coreAPIErrors.FILL_EXCEEDS_AVAILABLE());
  }

  /**
   * Checks the issuance order to ensure inputs adhere to the schema
   * and are valid inputs
   */
  public async isValidIssuanceOrder(issuanceOrder: IssuanceOrder) {
    const {
      setAddress,
      makerAddress,
      makerToken,
      relayerAddress,
      relayerToken,
      quantity,
      makerTokenAmount,
      expiration,
      makerRelayerFee,
      takerRelayerFee,
      requiredComponents,
      requiredComponentAmounts,
      salt,
    } = issuanceOrder;

    this.schemaAssertions.isValidAddress('setAddress', setAddress);
    this.schemaAssertions.isValidAddress('makerAddress', makerAddress);
    this.schemaAssertions.isValidAddress('relayerAddress', relayerAddress);
    this.schemaAssertions.isValidAddress('relayerToken', relayerToken);
    this.commonAssertions.isValidExpiration(issuanceOrder.expiration, coreAPIErrors.EXPIRATION_PASSED());
    this.commonAssertions.greaterThanZero(quantity, coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(quantity));
    this.commonAssertions.greaterThanZero(
      makerTokenAmount,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(makerTokenAmount)
    );
    this.commonAssertions.isEqualLength(
      requiredComponents,
      requiredComponentAmounts,
      coreAPIErrors.ARRAYS_EQUAL_LENGTHS('requiredComponents', 'requiredComponentAmounts'),
    );
    await this.erc20Assertions.implementsERC20(makerToken);


    await Promise.all(
      requiredComponents.map(async (tokenAddress, i) => {
        this.commonAssertions.isValidString(tokenAddress, coreAPIErrors.STRING_CANNOT_BE_EMPTY('tokenAddress'));
        this.schemaAssertions.isValidAddress('tokenAddress', tokenAddress);
        await this.erc20Assertions.implementsERC20(tokenAddress);

        this.commonAssertions.greaterThanZero(
          requiredComponentAmounts[i],
          coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(requiredComponentAmounts[i]),
        );
      }),
    );

    if (relayerToken !== NULL_ADDRESS) {
      await this.erc20Assertions.implementsERC20(relayerToken);
    }
  }

  public isValidZeroExOrderFills (
    signedIssuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    orders: ExchangeOrder[],
  ) {
    let zeroExFillAmounts = SetProtocolUtils.CONSTANTS.ZERO;
    _.each(orders, (order: any) => {
      if (SetProtocolUtils.isZeroExOrder(order)) {
        this.commonAssertions.greaterThanZero(
          order.fillAmount,
          coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(order.fillAmount),
        );
        zeroExFillAmounts = zeroExFillAmounts.plus(order.fillAmount);
        this.commonAssertions.isEqualString(
          signedIssuanceOrder.makerToken,
          SetProtocolUtils.extractAddressFromAssetData(order.takerAssetData),
          coreAPIErrors.ISSUANCE_ORDER_MAKER_ZERO_EX_TAKER_MISMATCH(),
        );
      }
    });

    // All 0x signed fill order fillAmounts are filled using the makerTokenAmount of the
    // signedIssuanceOrder so we need to make sure that signedIssuanceOrder.makerTokenAmount
    // has enough for the 0x orders (scaled by fraction of order quantity being filled).
    const {
      makerTokenAmount,
      quantity,
    } = signedIssuanceOrder;
    this.commonAssertions.isGreaterOrEqualThan(
      signedIssuanceOrder.makerTokenAmount.mul(quantityToFill).div(quantity),
      zeroExFillAmounts,
      coreAPIErrors.MAKER_TOKEN_INSUFFICIENT(signedIssuanceOrder.makerTokenAmount, zeroExFillAmounts),
    );
  }
}
