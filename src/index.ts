require('module-alias/register');

import { Address } from 'set-protocol-utils';

export {
  Address,
  Bytes,
  UInt,
  Constants,
  ECSig,
  Exchanges,
  IssuanceOrder,
  SignedIssuanceOrder,
  Log,
  SolidityTypes,
  TakerWalletOrder,
  ZeroExSignedFillOrder,
} from 'set-protocol-utils';

export {
  Component,
  SetComponent,
  CreateUnitInputs,
  SetDetails,
  Token,
  TxData,
} from './types/common';

import SetProtocol from './SetProtocol';

export { SetProtocolConfig } from './SetProtocol';
export default SetProtocol;
