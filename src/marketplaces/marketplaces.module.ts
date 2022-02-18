import { Module } from '@nestjs/common';
import { OpenseaService } from './opensea/opensea.service';
import { ThegraphService } from './thegraph/thegraph.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [OpenseaService, ThegraphService],
  exports: [OpenseaService, ThegraphService],
})
export class MarketplacesModule {}
