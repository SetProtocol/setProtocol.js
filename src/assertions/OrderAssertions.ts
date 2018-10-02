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
import * as Web3 from 'web3';
import { SetProtocolUtils, SetProtocolTestUtils } from 'set-protocol-utils';

import { erc20AssertionErrors, coreAPIErrors, orderErrors, setTokenAssertionsErrors } from '../errors';
import { SetTokenContract, CoreContract } from 'set-protocol-contracts';
import { CoreAssertions } from './CoreAssertions';
import { CommonAssertions } from './CommonAssertions';
import { SchemaAssertions } from './SchemaAssertions';
import { ERC20Assertions } from './ERC20Assertions';
import { SetTokenAssertions } from './SetTokenAssertions';
import { CoreWrapper } from '../wrappers';
import { NULL_ADDRESS, ZERO } from '../constants';
import { BigNumber, calculatePartialAmount } from '../util';
import { Address,
  IssuanceOrder,
  KyberTrade,
  SignedIssuanceOrder,
  TakerWalletOrder,
  ZeroExSignedFillOrder,
} from '../types/common';

export class OrderAssertions {
  private web3: Web3;
  private core: CoreWrapper;
  private erc20Assertions: ERC20Assertions;
  private schemaAssertions: SchemaAssertions;
  private coreAssertions: CoreAssertions;
  private commonAssertions: CommonAssertions;
  private setTokenAssertions: SetTokenAssertions;

  constructor(web3: Web3, coreWrapper: CoreWrapper) {
    this.web3 = web3;
    this.core = coreWrapper;
    this.erc20Assertions = new ERC20Assertions(web3);
    this.schemaAssertions = new SchemaAssertions();
    this.coreAssertions = new CoreAssertions(web3);
    this.commonAssertions = new CommonAssertions();
    this.setTokenAssertions = new SetTokenAssertions(web3);
  }

  public async isIssuanceOrderFillable(issuanceOrder: SignedIssuanceOrder, fillQuantity: BigNumber): Promise<void> {
    const {
      expiration,
      quantity,
      makerToken,
      makerAddress,
      makerTokenAmount,
    } = issuanceOrder;

    this.commonAssertions.isValidExpiration(expiration, coreAPIErrors.EXPIRATION_PASSED());

    await this.isValidFillQuantity(issuanceOrder, fillQuantity);

    await this.erc20Assertions.hasSufficientAllowanceAsync(
      makerToken,
      makerAddress,
      this.core.transferProxyAddress,
      makerTokenAmount,
    );

    const requiredMakerTokenAmount = this.calculateRequiredMakerToken(fillQuantity, quantity, makerTokenAmount);
    await this.erc20Assertions.hasSufficientBalanceAsync(makerToken, makerAddress, requiredMakerTokenAmount);
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
    await this.assertRequiredComponentsAndAmounts(requiredComponents, requiredComponentAmounts, setAddress);

    if (relayerToken !== NULL_ADDRESS) {
      await this.erc20Assertions.implementsERC20(relayerToken);
    }
  }

  public async assertLiquidityValidity(
    orderTaker: Address,
    issuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    orders: (KyberTrade | TakerWalletOrder | ZeroExSignedFillOrder)[],
  ) {
    await this.assertOrdersValidity(
      orderTaker,
      issuanceOrder,
      quantityToFill,
      orders,
    );

    this.assertSufficientMakerTokensForOrders(
      issuanceOrder,
      quantityToFill,
      orders,
    );
  }

  /* ============ Private Helpers =============== */

  private async isValidFillQuantity(issuanceOrder: SignedIssuanceOrder, fillQuantity: BigNumber) {
    const fillableQuantity = await this.calculateFillableQuantity(issuanceOrder);
    this.commonAssertions.isGreaterOrEqualThan(
      fillableQuantity,
      fillQuantity,
      orderErrors.FILL_EXCEEDS_AVAILABLE(fillableQuantity)
    );

    await this.setTokenAssertions.isMultipleOfNaturalUnit(
      issuanceOrder.setAddress,
      fillQuantity,
      `Fill quantity of issuance order`,
    );
  }

  private async assertOrdersValidity(
    issuanceOrderTaker: Address,
    issuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    orders: (KyberTrade | TakerWalletOrder | ZeroExSignedFillOrder)[],
  ) {
     await Promise.all(
      _.map(orders, async (order: any) => {
        if (SetProtocolUtils.isZeroExOrder(order)) {
          await this.isValidZeroExOrderFill(issuanceOrder, quantityToFill, order);
        } else if (SetProtocolUtils.isTakerWalletOrder(order)) {
          await this.isValidTakerWalletOrderFill(issuanceOrderTaker, issuanceOrder, quantityToFill, order);
        } else if (SetProtocolUtils.isKyberTrade(order)) {
          await this.isValidKyberTradeFill(issuanceOrder, order);
        }
      })
    );

    // Ensure that the liquidity orders that we have specified can fill the amount of the
    // issuance order that we're trying to fill.
    this.isValidLiquidityAmounts(issuanceOrder, quantityToFill, orders);
  }

  private assertSufficientMakerTokensForOrders(
    issuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    orders: (KyberTrade | TakerWalletOrder | ZeroExSignedFillOrder)[],
  ): void {
    const makerTokensUsed = this.calculateMakerTokensUsed(orders);

    // All 0x signed fill order fillAmounts are filled using the makerTokenAmount of the
    // issuanceOrder so we need to make sure that issuanceOrder.makerTokenAmount
    // has enough for the 0x orders (scaled by fraction of order quantity being filled).
    const {
      makerTokenAmount,
      quantity,
    } = issuanceOrder;

    const requiredMakerTokenAmount = this.calculateRequiredMakerToken(
      quantityToFill,
      quantity,
      makerTokenAmount,
    );

    this.commonAssertions.isGreaterOrEqualThan(
      requiredMakerTokenAmount,
      makerTokensUsed,
      orderErrors.INSUFFICIENT_MAKER_TOKEN(makerTokenAmount, makerTokensUsed),
    );
  }

  private isValidLiquidityAmounts(
    issuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    orders: (KyberTrade | TakerWalletOrder | ZeroExSignedFillOrder)[],
  ) {
    const {
      quantity,
      requiredComponents,
      requiredComponentAmounts,
    } = issuanceOrder;

    const componentAmountsFromLiquidity = this.calculateLiquidityFills(orders);

    _.each(requiredComponents, (component, i) => {
      const requiredComponentAmountForFillQuantity = calculatePartialAmount(
        requiredComponentAmounts[i],
        quantityToFill,
        quantity
      );

      this.commonAssertions.isEqualBigNumber(
        componentAmountsFromLiquidity[component],
        requiredComponentAmountForFillQuantity,
        orderErrors.INSUFFICIENT_COMPONENT_AMOUNT_FROM_LIQUIDITY(
          component,
          componentAmountsFromLiquidity[component],
          requiredComponentAmountForFillQuantity,
        ),
      );
    });
  }

  private async assertRequiredComponentsAndAmounts(
    requiredComponents: Address[],
    requiredComponentAmounts: BigNumber[],
    setAddress: Address,
  ) {
    await Promise.all(
      requiredComponents.map(async (tokenAddress, i) => {
        this.commonAssertions.isValidString(tokenAddress, coreAPIErrors.STRING_CANNOT_BE_EMPTY('tokenAddress'));
        this.schemaAssertions.isValidAddress('tokenAddress', tokenAddress);
        await this.erc20Assertions.implementsERC20(tokenAddress);
        await this.setTokenAssertions.isComponent(setAddress, tokenAddress);

        this.commonAssertions.greaterThanZero(
          requiredComponentAmounts[i],
          coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(requiredComponentAmounts[i]),
        );
      }),
    );
  }

  private calculateLiquidityFills(
    orders: (KyberTrade | TakerWalletOrder | ZeroExSignedFillOrder)[],
  ): { [addr: string]: BigNumber } {
    let requiredComponentFills: { [addr: string]: BigNumber } = {};

    _.each(orders, (order: any) => {
      // Count up components of issuance order that have been filled from this liquidity order
      requiredComponentFills = this.addLiquidityOrderContribution(order, requiredComponentFills);
    });

    return requiredComponentFills;
  }

  private calculateMakerTokensUsed(
    orders: (KyberTrade | TakerWalletOrder | ZeroExSignedFillOrder)[]
  ): BigNumber {
    let makerTokensUsed: BigNumber = ZERO;

    _.each(orders, (order: any) => {
      if (SetProtocolUtils.isZeroExOrder(order)) {
        makerTokensUsed = makerTokensUsed.add(order.fillAmount);
      } if (SetProtocolUtils.isKyberTrade(order)) {
        makerTokensUsed = makerTokensUsed.add(order.sourceTokenQuantity);
      }
    });

    return makerTokensUsed;
  }

  /*
   * This takes in an order from a liquidity source and adds up the amount of token being filled
   * for a given component.
   */
  private addLiquidityOrderContribution(
    order: any,
    requiredComponentFills: { [addr: string]: BigNumber },
  ): { [addr: string]: BigNumber } {
    let existingAmount: BigNumber;
    let currentOrderAmount: BigNumber;
    let orderComponent: Address;
    if (SetProtocolUtils.isZeroExOrder(order)) {
      const {
        fillAmount,
        makerAssetAmount,
        makerAssetData,
        takerAssetAmount,
      } = order;
      const tokenAddress = SetProtocolUtils.extractAddressFromAssetData(makerAssetData);

      // Accumulate fraction of 0x order that was filled
      existingAmount = requiredComponentFills[tokenAddress] || ZERO;
      currentOrderAmount = calculatePartialAmount(makerAssetAmount, fillAmount, takerAssetAmount);
      orderComponent = tokenAddress;

      return Object.assign(requiredComponentFills, { [orderComponent]: existingAmount.plus(currentOrderAmount) });
    } else if (SetProtocolUtils.isTakerWalletOrder(order)) {
      const {
        takerTokenAddress,
        takerTokenAmount,
      } = order;

      existingAmount = requiredComponentFills[takerTokenAddress] || ZERO;
      currentOrderAmount = takerTokenAmount;
      orderComponent = takerTokenAddress;

      return Object.assign(requiredComponentFills, { [orderComponent]: existingAmount.plus(currentOrderAmount) });
    } else if (SetProtocolUtils.isKyberTrade(order)) {
      const {
        destinationToken,
        maxDestinationQuantity,
      } = order;

      existingAmount = requiredComponentFills[destinationToken] || ZERO;
      currentOrderAmount = maxDestinationQuantity;
      orderComponent = destinationToken;

      return Object.assign(requiredComponentFills, { [orderComponent]: existingAmount.plus(currentOrderAmount) });
    }

    return requiredComponentFills;
  }

  private async isValidKyberTradeFill(
    issuanceOrder: SignedIssuanceOrder,
    trade: KyberTrade
  ) {
    this.commonAssertions.greaterThanZero(
      trade.sourceTokenQuantity,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(trade.sourceTokenQuantity),
    );

    // Kyber trade source token is equivalent to the issuance order maker token
    this.commonAssertions.isEqualString(
      issuanceOrder.makerToken,
      trade.sourceToken,
      orderErrors.MAKER_TOKEN_AND_KYBER_SOURCE_TOKEN_MISMATCH(),
    );

    // Kyber trade destination token is not the issuance order maker token
    this.commonAssertions.isDifferentString(
      issuanceOrder.makerToken,
      trade.destinationToken,
      orderErrors.MAKER_TOKEN_AND_KYBER_DESTINATION_TOKEN_MISMATCH(),
    );

    // Kyber destination token is a component of the Set
    await this.setTokenAssertions.isComponent(issuanceOrder.setAddress, trade.destinationToken);

    // Kyber trade parameters will yield enough component token
    const amountComponentTokenFromTrade = trade.minimumConversionRate.mul(trade.sourceTokenQuantity);
    this.commonAssertions.isGreaterOrEqualThan(
      amountComponentTokenFromTrade,
      trade.maxDestinationQuantity,
      orderErrors.INSUFFICIENT_KYBER_SOURCE_TOKEN_FOR_RATE(
        trade.sourceTokenQuantity,
        amountComponentTokenFromTrade,
        trade.destinationToken
      )
    );
  }

  private async isValidZeroExOrderFill(
    issuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    zeroExOrder: ZeroExSignedFillOrder,
  ) {
    this.commonAssertions.greaterThanZero(
      zeroExOrder.fillAmount,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(zeroExOrder.fillAmount),
    );

    // 0x taker token is equivalent to the issuance order maker token
    this.commonAssertions.isEqualString(
      issuanceOrder.makerToken,
      SetProtocolUtils.extractAddressFromAssetData(zeroExOrder.takerAssetData),
      orderErrors.MAKER_TOKEN_AND_ZERO_EX_TAKER_TOKEN_MISMATCH(),
    );

    // 0x maker token is a component of the Set
    await this.setTokenAssertions.isComponent(
      issuanceOrder.setAddress,
      SetProtocolUtils.extractAddressFromAssetData(zeroExOrder.makerAssetData),
    );

    // 0x order maker has sufficient balance of the maker token
    await this.erc20Assertions.hasSufficientBalanceAsync(
      SetProtocolUtils.extractAddressFromAssetData(zeroExOrder.makerAssetData),
      zeroExOrder.makerAddress,
      zeroExOrder.makerAssetAmount,
    );
  }

  private async isValidTakerWalletOrderFill(
    issuanceOrderTaker: Address,
    issuanceOrder: SignedIssuanceOrder,
    quantityToFill: BigNumber,
    order: TakerWalletOrder,
  ) {
    const { takerTokenAddress, takerTokenAmount } = order;

    this.commonAssertions.greaterThanZero(
      takerTokenAmount,
      coreAPIErrors.QUANTITY_NEEDS_TO_BE_POSITIVE(takerTokenAmount),
    );

    // Token provided by order taker is a component of the Set
    await this.setTokenAssertions.isComponent(issuanceOrder.setAddress, takerTokenAddress);

    // Order taker has enough of component token they plan to contribute
    await this.erc20Assertions.hasSufficientBalanceAsync(takerTokenAddress, issuanceOrderTaker, takerTokenAmount);

    // Transfer proxy has enough allowance to transfer cmoponent token from taker
    await this.erc20Assertions.hasSufficientAllowanceAsync(
      takerTokenAddress,
      issuanceOrderTaker,
      this.core.transferProxyAddress,
      takerTokenAmount,
    );
  }

  private async calculateFillableQuantity(signedIssuanceOrder: SignedIssuanceOrder): Promise<BigNumber> {
    const issuanceOrder: IssuanceOrder = _.omit(signedIssuanceOrder, 'signature');
    const orderHash = SetProtocolUtils.hashOrderHex(issuanceOrder);
    const filledAmount = await this.core.orderFills(orderHash);
    const cancelledAmount = await this.core.orderCancels(orderHash);

    return issuanceOrder.quantity.sub(filledAmount).sub(cancelledAmount);
  }

  private calculateRequiredMakerToken(
    fillQuantity: BigNumber,
    quantity: BigNumber,
    makerTokenAmount: BigNumber
  ): BigNumber {
    return fillQuantity.div(quantity).mul(makerTokenAmount);
  }
}
