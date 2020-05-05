import Web3 from 'web3';
import { ConstantAuctionPriceCurveContract, CoreContract, RebalanceAuctionModuleContract, RebalancingSetTokenContract, RebalancingSetTokenV2Contract, RebalancingSetTokenV3Contract, SetTokenContract, VaultContract } from 'set-protocol-contracts';
import { TokenFlows, TokenFlowsDetails } from '@src/types/common';
import { BigNumber } from '@src/util';
export declare const deploySetTokensAsync: (web3: Web3, core: CoreContract, factory: string, transferProxy: string, tokenCount: number, naturalUnits?: BigNumber[]) => Promise<SetTokenContract[]>;
export declare const deployConstantAuctionPriceCurveAsync: (web3: Web3, priceNumerator: BigNumber, priceDenominator: BigNumber) => Promise<ConstantAuctionPriceCurveContract>;
export declare const addPriceCurveToCoreAsync: (core: CoreContract, priceCurveAddress: string) => Promise<void>;
export declare const createRebalancingSetTokenAsync: (web3: Web3, core: CoreContract, factory: string, componentAddresses: string[], units: BigNumber[], naturalUnit: BigNumber, callData?: string, name?: string, symbol?: string) => Promise<RebalancingSetTokenContract>;
export declare const createRebalancingTokenV2Async: (web3: Web3, core: CoreContract, factory: string, componentAddresses: string[], units: BigNumber[], naturalUnit: BigNumber, callData?: string, name?: string, symbol?: string, from?: string) => Promise<RebalancingSetTokenV2Contract>;
export declare const createRebalancingTokenV3Async: (web3: Web3, core: CoreContract, factory: string, componentAddresses: string[], units: BigNumber[], naturalUnit: BigNumber, callData?: string, name?: string, symbol?: string, from?: string) => Promise<RebalancingSetTokenV3Contract>;
export declare const createDefaultRebalancingSetTokenAsync: (web3: Web3, core: CoreContract, factory: string, manager: string, initialSet: string, proposalPeriod: BigNumber, initialUnitShares?: BigNumber) => Promise<RebalancingSetTokenContract>;
export declare const createDefaultRebalancingSetTokenV2Async: (web3: Web3, core: CoreContract, factory: string, manager: string, liquidator: string, feeRecipient: string, rebalanceFeeCalculator: string, initialSet: string, failRebalancePeriod: BigNumber, lastRebalanceTimestamp: BigNumber, entryFee?: BigNumber, rebalanceFee?: BigNumber, initialUnitShares?: BigNumber) => Promise<RebalancingSetTokenV2Contract>;
export declare const createDefaultRebalancingSetTokenV3Async: (web3: Web3, core: CoreContract, factory: string, manager: string, liquidator: string, feeRecipient: string, rebalanceFeeCalculator: string, initialSet: string, failRebalancePeriod: BigNumber, lastRebalanceTimestamp: BigNumber, entryFee?: BigNumber, profitFee?: BigNumber, streamingFee?: BigNumber, profitFeePeriod?: BigNumber, highWatermarkResetPeriod?: BigNumber, initialUnitShares?: BigNumber) => Promise<RebalancingSetTokenV3Contract>;
export declare const transitionToProposeAsync: (web3: Web3, rebalancingSetToken: RebalancingSetTokenContract, manager: string, nextSetToken: string, auctionPriceCurve: string, auctionTimeToPivot?: BigNumber, auctionStartPrice?: BigNumber, auctionPivotPrice?: BigNumber) => Promise<void>;
export declare const transitionToRebalanceAsync: (web3: Web3, rebalancingSetToken: RebalancingSetTokenContract, manager: string, nextSetToken: string, auctionPriceCurve: string, auctionTimeToPivot?: BigNumber, auctionStartPrice?: BigNumber, auctionPivotPrice?: BigNumber) => Promise<void>;
export declare const transitionToDrawdownAsync: (web3: Web3, rebalancingSetToken: RebalancingSetTokenContract, manager: string, nextSetToken: string, auctionPriceCurve: string, rebalanceAuctionModule: RebalanceAuctionModuleContract, bidAmount: BigNumber, auctionTimeToPivot?: BigNumber, auctionStartPrice?: BigNumber, auctionPivotPrice?: BigNumber) => Promise<void>;
export declare const increaseChainTimeAsync: (web3: Web3, duration: BigNumber) => Promise<void>;
export declare const mineBlockAsync: (web3: Web3) => Promise<void>;
export declare const constructCombinedUnitArrayAsync: (rebalancingSetToken: RebalancingSetTokenContract, targetSetToken: SetTokenContract, otherSetToken: SetTokenContract, combinedTokenArray: string[]) => Promise<BigNumber[]>;
export declare const getAuctionSetUpOutputsAsync: (rebalancingSetToken: RebalancingSetTokenContract, currentSetToken: SetTokenContract, nextSetToken: SetTokenContract, auctionPriceDivisor: BigNumber) => Promise<any>;
export declare const constructInflowOutflowArraysAsync: (rebalancingSetToken: RebalancingSetTokenContract, quantity: BigNumber, priceNumerator: BigNumber) => Promise<TokenFlows>;
export declare const constructInflowOutflowAddressesArraysAsync: (rebalancingSetToken: RebalancingSetTokenContract, quantity: BigNumber, priceNumerator: BigNumber, combinedTokenArray: string[]) => Promise<TokenFlowsDetails>;
export declare const getExpectedUnitSharesAsync: (rebalancingSetToken: RebalancingSetTokenContract, newSet: SetTokenContract, vault: VaultContract) => Promise<BigNumber>;