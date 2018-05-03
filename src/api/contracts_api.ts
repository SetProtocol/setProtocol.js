import * as _ from "lodash";
import * as Web3 from "web3";
import { BigNumber } from "../util/bignumber";

import { Assertions } from "../invariants";

// wrappers
import {
    BaseContract,
    ContractWrapper,
    ERC20Contract,
    SetTokenContract,
} from "../wrappers";

export interface SetContracts {
    ERC20: ERC20Contract;
    setToken: SetTokenContract;
}

export const ContractsError = {
  SET_TOKEN_CONTRACT_NOT_FOUND: (setTokenAddress: string) =>
    `Could not find a Set Token Contract at address ${setTokenAddress}`,
  ERC20_TOKEN_CONTRACT_NOT_FOUND: (tokenAddress: string) =>
    `Could not find a ERC20 Token Contract at address ${tokenAddress}`,
};

export class ContractsAPI {
  private provider: Web3;
  private assert: Assertions;

  private cache: { [contractName: string]: ContractWrapper };

  public constructor(provider: Web3) {
      this.provider = provider;
      this.cache = {};
      this.assert = new Assertions(this.provider);
  }

  public async loadSetTokenAsync(
    setTokenAddress: string,
    transactionOptions: object = {},
  ): Promise<SetTokenContract> {
    this.assert.schema.isValidAddress("setTokenAddress", setTokenAddress);

    const cacheKey = this.getSetTokenCacheKey(setTokenAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as SetTokenContract;
    } else {
      const setTokenContract = await SetTokenContract.at(
        setTokenAddress,
        this.provider,
        transactionOptions,
      );

      if (!setTokenContract) {
        throw new Error(ContractsError.SET_TOKEN_CONTRACT_NOT_FOUND(setTokenAddress));
      }

      this.assert.setToken.implementsSet(setTokenContract);

      this.cache[cacheKey] = setTokenContract;
      return setTokenContract;
    }
  }

  public async loadERC20TokenAsync(
    tokenAddress: string,
    transactionOptions: object = {},
  ): Promise<ERC20Contract> {
    this.assert.schema.isValidAddress("tokenAddress", tokenAddress);

    const cacheKey = this.getERC20TokenCacheKey(tokenAddress);

    if (cacheKey in this.cache) {
      return this.cache[cacheKey] as ERC20Contract;
    } else {
      const tokenContract = await ERC20Contract.at(
        tokenAddress,
        this.provider,
        transactionOptions,
      );

      if (!tokenContract) {
        throw new Error(ContractsError.ERC20_TOKEN_CONTRACT_NOT_FOUND(tokenAddress));
      }

      this.assert.erc20.implementsERC20(tokenContract);

      this.cache[cacheKey] = tokenContract;
      return tokenContract;
    }
  }

  private getERC20TokenCacheKey(tokenAddress: string): string {
    return `ERC20_${tokenAddress}`;
  }

  private getSetTokenCacheKey(tokenAddress: string): string {
    return `Set_${tokenAddress}`;
  }
}