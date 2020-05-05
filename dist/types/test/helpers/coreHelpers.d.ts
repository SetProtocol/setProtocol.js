import Web3 from 'web3';
import { AuthorizableContract, CoreContract, ExchangeIssuanceModuleContract, FixedFeeCalculatorContract, LinearAuctionLiquidatorContract, NoDecimalTokenMockContract, OracleWhiteListContract, RebalancingSetExchangeIssuanceModuleContract, RebalancingSetIssuanceModuleContract, RebalanceAuctionModuleContract, RebalancingSetTokenFactoryContract, RebalancingSetTokenV2FactoryContract, RebalancingSetTokenV3FactoryContract, SetTokenContract, SetTokenFactoryContract, StandardTokenMockContract, TransferProxyContract, VaultContract, WethMockContract, WhiteListContract } from 'set-protocol-contracts';
import { BigNumber } from '@src/util';
export declare const deployTransferProxyContract: (web3: Web3) => Promise<TransferProxyContract>;
export declare const deployVaultContract: (web3: Web3) => Promise<VaultContract>;
export declare const deployCoreContract: (web3: Web3, transferProxyAddress: string, vaultAddress: string) => Promise<CoreContract>;
export declare const deploySetTokenFactoryContract: (web3: Web3, core: CoreContract) => Promise<SetTokenFactoryContract>;
export declare const deployRebalancingSetTokenFactoryContract: (web3: Web3, core: CoreContract, whitelist: WhiteListContract, minimumRebalanceInterval?: BigNumber, minimumProposalPeriod?: BigNumber, minimumTimeToPivot?: BigNumber, maximumTimeToPivot?: BigNumber, minimumNaturalUnit?: BigNumber, maximumNaturalUnit?: BigNumber) => Promise<RebalancingSetTokenFactoryContract>;
export declare const deployRebalancingSetTokenV2FactoryContractAsync: (web3: Web3, core: CoreContract, componentWhitelist: WhiteListContract, liquidatorWhitelist: WhiteListContract, feeCalculatorWhitelist: WhiteListContract, minimumRebalanceInterval?: BigNumber, minimumFailRebalancePeriod?: BigNumber, maximumFailRebalancePeriod?: BigNumber, minimumNaturalUnit?: BigNumber, maximumNaturalUnit?: BigNumber) => Promise<RebalancingSetTokenV2FactoryContract>;
export declare const deployRebalancingSetTokenV3FactoryContractAsync: (web3: Web3, core: CoreContract, componentWhitelist: WhiteListContract, liquidatorWhitelist: WhiteListContract, feeCalculatorWhitelist: WhiteListContract, minimumRebalanceInterval?: BigNumber, minimumFailRebalancePeriod?: BigNumber, maximumFailRebalancePeriod?: BigNumber, minimumNaturalUnit?: BigNumber, maximumNaturalUnit?: BigNumber) => Promise<RebalancingSetTokenV3FactoryContract>;
export declare const deployLinearAuctionLiquidatorContractAsync: (web3: Web3, core: CoreContract, oracleWhiteList: OracleWhiteListContract, auctionPeriod?: BigNumber, rangeStart?: BigNumber, rangeEnd?: BigNumber, name?: string) => Promise<LinearAuctionLiquidatorContract>;
export declare const deployFixedFeeCalculatorAsync: (web3: Web3) => Promise<FixedFeeCalculatorContract>;
export declare const deployRebalanceAuctionModuleContract: (web3: Web3, core: CoreContract, vault: VaultContract) => Promise<RebalanceAuctionModuleContract>;
export declare const deployBaseContracts: (web3: Web3) => Promise<[CoreContract, TransferProxyContract, VaultContract, SetTokenFactoryContract, RebalancingSetTokenFactoryContract, RebalanceAuctionModuleContract, WhiteListContract]>;
export declare const deployWhiteListContract: (web3: Web3, initialAddresses: string[]) => Promise<WhiteListContract>;
export declare const deployOracleWhiteListAsync: (web3: Web3, tokenAddresses: string[], oracleAddresses: string[]) => Promise<OracleWhiteListContract>;
export declare const deployExchangeIssuanceModuleAsync: (web3: Web3, core: CoreContract, vault: VaultContract, owner?: string) => Promise<ExchangeIssuanceModuleContract>;
export declare const deployRebalancingSetExchangeIssuanceModuleAsync: (web3: Web3, core: CoreContract, transferProxy: TransferProxyContract, exchangeIssuanceModule: ExchangeIssuanceModuleContract, wrappedEther: WethMockContract, vault: VaultContract, owner?: string) => Promise<RebalancingSetExchangeIssuanceModuleContract>;
export declare const deployRebalancingSetIssuanceModuleAsync: (web3: Web3, core: CoreContract, vault: VaultContract, transferProxy: TransferProxyContract, wrappedEther: WethMockContract, owner?: string) => Promise<RebalancingSetIssuanceModuleContract>;
export declare const deployWethMockAsync: (web3: Web3, initialAccount: string, initialBalance: BigNumber, owner?: string) => Promise<WethMockContract>;
export declare const deployTokenAsync: (web3: Web3, owner?: string) => Promise<StandardTokenMockContract>;
export declare const deployTokensAsync: (tokenCount: number, web3: Web3, owner?: string) => Promise<StandardTokenMockContract[]>;
export declare const deployTokenSpecifyingDecimalAsync: (decimalCount: number, web3: Web3, owner?: string) => Promise<StandardTokenMockContract>;
export declare const deployTokensSpecifyingDecimals: (tokenCount: number, decimalsList: number[], web3: Web3, owner?: string) => Promise<StandardTokenMockContract[]>;
export declare const deployNoDecimalTokenAsync: (web3: Web3, owner?: string) => Promise<NoDecimalTokenMockContract>;
export declare const deploySetTokenAsync: (web3: Web3, core: CoreContract, setTokenFactoryAddress: string, componentAddresses: string[], componentUnits: BigNumber[], naturalUnit: BigNumber, name?: string, symbol?: string) => Promise<SetTokenContract>;
export declare const tokenDeployedOnSnapshot: (web3: Web3, tokenAddress: string) => Promise<StandardTokenMockContract>;
export declare const registerExchange: (web3: Web3, coreAddress: string, exchangeId: number, exchangeAddress: string) => Promise<void>;
export declare const approveForTransferAsync: (tokens: (StandardTokenMockContract | WethMockContract)[], spender: string, from?: string) => Promise<void>;
export declare const transferTokenAsync: (token: StandardTokenMockContract, spender: string, quantity: BigNumber, from?: string) => Promise<void>;
export declare const addAuthorizationAsync: (contract: AuthorizableContract, toAuthorize: string) => Promise<void>;
export declare const addModuleAsync: (core: CoreContract, moduleAddress: string) => Promise<void>;
export declare const addPriceLibraryAsync: (core: CoreContract, priceLibrary: string) => Promise<void>;
export declare const addWhiteListedTokenAsync: (whitelist: WhiteListContract, toAdd: string) => Promise<void>;
export declare const getTokenBalances: (tokens: StandardTokenMockContract[], owner: string) => Promise<BigNumber[]>;
export declare const getTokenInstances: (web3: Web3, tokenAddresses: string[]) => Promise<StandardTokenMockContract[]>;
export declare const getTokenSupplies: (tokens: StandardTokenMockContract[]) => Promise<BigNumber[]>;
export declare const setDefaultTruffleContract: (web3: Web3, contractInstance: any) => any;