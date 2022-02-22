import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { HttpModule } from '@nestjs/axios';
import { AssetRepository } from './repository/asset.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { CrawlerWallet, WalletSchema, CrawlerAsset, NftSchema } from './schemas/asset.schema';
import { MarketplacesModule } from 'src/marketplaces/marketplaces.module';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { BullModule } from '@nestjs/bull';
import { CrawlerWalletQueueProcessor, CrawlerAssetQueueProcessor } from './assets.processor';

@Module({
  imports: [
    HttpModule,
    MarketplacesModule,
    MongooseModule.forFeature([{ name: CrawlerWallet.name, schema: WalletSchema }, { name: CrawlerAsset.name, schema: NftSchema }]),
    RedisCacheModule,
    BullModule.registerQueue({
      name: 'crawlerwallet',
    }, {
      name: 'crawlerasset',
    }),
  ],
  controllers: [AssetsController],
  providers: [AssetsService, AssetRepository, CrawlerWalletQueueProcessor, CrawlerAssetQueueProcessor],
  exports: [AssetsService],
})
export class AssetsModule {}
