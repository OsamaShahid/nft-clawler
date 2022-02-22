import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type WalletDocument = CrawlerWallet & mongoose.Document;
export type NftDocument = CrawlerAsset & mongoose.Document;

export class Blockchain extends mongoose.Document {
  @Prop()
  expire?: string;

  @Prop()
  blockchain?: string;

  @Prop({ type: mongoose.SchemaTypes.Mixed })
  assets?: any;
}

export class Blockchains extends mongoose.Document {
  @Prop()
  ethereum?: Blockchain;

  @Prop()
  polygon?: Blockchain;

  @Prop()
  binanceSmartChain?: Blockchain;
}

@Schema({ timestamps: true })
export class CrawlerWallet {
  @Prop()
  _id: string;

  @Prop()
  blockchains?: Blockchains;

  @Prop()
  userId: string;
}

@Schema({ timestamps: true })
export class CrawlerAsset {
  @Prop()
  _id: string;

  @Prop()
  tokenId: string;

  @Prop()
  assetContractAddress: string;

  @Prop()
  blockchain?: string;

  @Prop()
  expire?: string;

  @Prop({ type: mongoose.SchemaTypes.Mixed })
  assets?: any;
}

export const WalletSchema = SchemaFactory.createForClass(CrawlerWallet);
export const NftSchema = SchemaFactory.createForClass(CrawlerAsset);
