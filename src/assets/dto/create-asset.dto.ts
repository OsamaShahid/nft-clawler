import { IsEthereumAddress, IsString } from 'class-validator';

export class Blockchain {
  expire?: string;

  blockchain?: string;

  assets?: any;
}

export class Blockchains {
  ethereum?: Blockchain;

  polygon?: Blockchain;

  binanceSmartChain?: Blockchain;
}

export class CreateAssetDTO {
  @IsEthereumAddress()
  _id: string;

  blockchains: Blockchains;
}

export class CreateNftDTO {
  @IsString()
  _id: string;
}
