import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { HttpModule } from '@nestjs/axios';
import { AssetRepository } from './repository/asset.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema, Nft, NftSchema } from './schemas/asset.schema';
import { MarketplacesModule } from 'src/marketplaces/marketplaces.module';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { BullModule } from '@nestjs/bull';
import { WalletQueueProcessor, NftQueueProcessor } from './assets.processor';

@Module({
  imports: [
    HttpModule,
    MarketplacesModule,
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }, { name: Nft.name, schema: NftSchema }]),
    RedisCacheModule,
    BullModule.registerQueue({
      name: 'wallet',
    }, {
      name: 'nft',
    }),
  ],
  controllers: [AssetsController],
  providers: [AssetsService, AssetRepository, WalletQueueProcessor, NftQueueProcessor],
  exports: [AssetsService],
})
export class AssetsModule {}
