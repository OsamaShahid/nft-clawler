import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetsModule } from './assets/assets.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketplacesModule } from './marketplaces/marketplaces.module';
import { HealthzModule } from './healthz/healthz.module';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: "localhost",
        port: 6379,
      },
    }),
    AssetsModule,
    MongooseModule.forRoot(
      'mongodb+srv://sa:CvcTyVcPmTI0t0Dn@cluster0.re2y1.mongodb.net/Lago?retryWrites=true&w=majority',
      //'mongodb+srv://backend:PEiziFz3YjzQNALj@cluster0.hk7rg.mongodb.net/LagoDev?retryWrites=true&w=majority',
      // 'mongodb://localhost:27017/lago?retryWrites=true&w=majority',
    ),
    MarketplacesModule,
    HealthzModule,
    RedisCacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
