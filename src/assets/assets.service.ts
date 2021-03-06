import { Injectable, NotFoundException } from '@nestjs/common';
import { GetAssetFilterDTO } from './dto/get-assets-filter.dto';
import { AssetRepository } from './repository/asset.repository';
import { CrawlerWallet, CrawlerAsset } from './schemas/asset.schema';
import { Blockchain } from './enums/blockchain.enum';
import { OpenseaService } from 'src/marketplaces/opensea/opensea.service';
import { ThegraphService } from 'src/marketplaces/thegraph/thegraph.service';
import { cLogger } from 'src/helpers';
import { GetNftFilterDTO } from './dto/get-nft-filter.dto';

@Injectable()
export class AssetsService {
  constructor(
    private openseaService: OpenseaService,
    private thegraphService: ThegraphService,
    private assetRepository: AssetRepository,
  ) {}
  async findAllAssetsByWallet(
    wallet: string,
    userId: string,
    filterDTO: GetAssetFilterDTO,
  ): Promise<CrawlerWallet> {
    let asset = await this.assetRepository.findAllAssetsByWallet(
      wallet,
      userId,
      filterDTO,
    );

    if (!asset) {
      asset = await this.getWallet(wallet, userId);
    }

    cLogger.success(
      `findAllAssetsByWallet:: Successfully fulfilled request to find assets from wallet:: ${wallet}`
    );
    return asset;
  }

  async getWallet(wallet: string, userId: string): Promise<CrawlerWallet> {
    cLogger.info(`getWallet:: No wallet:: ${wallet} data found in either redis or in database, getting wallet data from opensea service`);
    const enumeratedAssetsOnEthereum =
      await this.openseaService.enumerateNFTsByWalletOnEthereum(wallet);
      const enumeratedTransactionsOnEthereum =
        await this.openseaService.enumerateTransactionsByWalletOnEthereum(
          wallet
        );
      const enumeratedAssetsOnPolygon =
        await this.thegraphService.enumerateNFTsByWalletOnPolygon(wallet);

      console.log("enumeratedAssetsOnPolygon: ", enumeratedAssetsOnPolygon);

      const currentISODate = new Date().toISOString();

      const newWallet = {
        _id: wallet,
        userId: userId,
        blockchains: {
          ethereum: {
            expire: currentISODate,
            blockchain: Blockchain.ETHEREUM,
            assets: enumeratedAssetsOnEthereum,
            events: enumeratedTransactionsOnEthereum,
          },
          polygon: {
            expire: currentISODate,
            blockchain: Blockchain.POLYGON,
            assets: enumeratedAssetsOnPolygon,
          },
        },
      };

      cLogger.success(`getWallet:: Successfuly fetched wallet:: ${wallet} data from opensea service`);
    return this.assetRepository.createWallet(newWallet);
  }

  async getNftAsset(tokenId: string, assetContractAddress: string): Promise<CrawlerAsset> {

    cLogger.info(`getNftAsset:: Getting asset with token Id:: ${tokenId} and contract:: ${assetContractAddress} from opensea`);
    const assetOnEthereum =
      await this.openseaService.getAssetFromOpenSeaService(tokenId, assetContractAddress);

    cLogger.success(`getNftAsset:: successfully retrieved asset with token Id:: ${tokenId} and contract:: ${assetContractAddress} from opensea`);

    const currentISODate = new Date().toISOString();

    const newNftAsset: any = {
      _id: tokenId,
      tokenId,
      assetContractAddress,
      Blockchain: Blockchain.ETHEREUM,
      expire: currentISODate,
      assets: assetOnEthereum,
    };
    return this.assetRepository.createNftAsset(newNftAsset);
  }

  async findNftAssetByTokenIdAndContractAddress(
    tokenId: string,
    assetContractAddress: string,
    filterDTO: GetNftFilterDTO,
  ): Promise<CrawlerAsset> {
    let asset = await this.assetRepository.findAssetByTokenIdAndAssetContract(
      tokenId,
      assetContractAddress,
      filterDTO,
    );

    if (!asset) {
      asset = await this.getNftAsset(tokenId, assetContractAddress);
    }

    return asset;
  }
}
