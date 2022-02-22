import { ExceptionFilter, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { CreateAssetDTO } from '../dto/create-asset.dto';
import { GetAssetFilterDTO } from '../dto/get-assets-filter.dto';
import { CrawlerWallet, WalletDocument, CrawlerAsset, NftDocument } from '../schemas/asset.schema';
import { RedisCacheService } from '../../redis-cache/redis-cache.service';
import { GetNftFilterDTO } from '../dto/get-nft-filter.dto';

@Injectable()
export class AssetRepository {
  constructor(
    @InjectModel(CrawlerWallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(CrawlerAsset.name) private assetModel: Model<NftDocument>,
    private redisCacheService: RedisCacheService,
  ) {}

  async createWallet(createAssetDTO: CreateAssetDTO): Promise<CrawlerWallet> {
    // const { startDate, nftCollections } = createAssetDTO;

    let wallet: CrawlerWallet | (CrawlerWallet & Document<any, any, any> & { _id: any; }) | PromiseLike<CrawlerWallet>;
    try {
      const query = { _id: createAssetDTO._id };
      const update = { $set: { ...createAssetDTO, }};
      const options = { upsert: true, new: true };
      wallet = await this.walletModel.findOneAndUpdate(query, update, options);

    } catch (e: unknown) {
      console.log(e);
    }
    const wallet_ttl = 1800;
    this.redisCacheService.set(wallet['_id'], wallet, wallet_ttl);
    return wallet;
  }

  async findAllAssetsByWallet(
    wallet: string,
    userId: string,
    filterDTO: GetAssetFilterDTO,
  ): Promise<CrawlerWallet> {
    try {
      return await this.loadWalletFromCache(wallet);
    } catch (error) {
      const {} = filterDTO;
      return this.walletModel.findOne({ _id: wallet }).exec();
    }
  }

  async loadWalletFromCache(wallet: string): Promise<CrawlerWallet> {
    try {
      return await this.redisCacheService.get(wallet);
    } catch (error) {
      throw new NotFoundException(`Wallet ${wallet} not found in cache`);
    }
  }

  async loadNftAssetFromCache(tokenId: string): Promise<CrawlerAsset> {
    try {
      return await this.redisCacheService.get(tokenId);
    } catch (error) {
      throw new NotFoundException(`Token ${tokenId} not found in cache`);
    }
  }

  async findAssetByTokenIdAndAssetContract(
    tokenId: string,
    assetContractAddress: string,
    filterDTO: GetNftFilterDTO,
  ): Promise<CrawlerAsset> {
    try {
      return await this.loadNftAssetFromCache(tokenId);
    } catch (error) {
      const {} = filterDTO;
      return this.assetModel.findOne({ _id: tokenId }).exec();
    }
  }

  async createNftAsset(createAssetDTO: any): Promise<CrawlerAsset> {

    let asset: CrawlerAsset | (CrawlerAsset & Document<any, any, any> & { _id: any; }) | PromiseLike<CrawlerAsset>;
    try {
      const query = { _id: createAssetDTO._id };
      const update = { $set: { ...createAssetDTO, }};
      const options = { upsert: true, new: true };
      asset = await this.assetModel.findOneAndUpdate(query, update, options);

    } catch (e: unknown) {
      console.log(e);
    }
    const wallet_ttl = 1800;
    this.redisCacheService.set(asset['_id'], asset, wallet_ttl);
    return asset;
  }

}
