import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { GetAssetFilterDTO } from './dto/get-assets-filter.dto';
import { GetNftFilterDTO } from './dto/get-nft-filter.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';


@ApiTags('assets')
@Controller({
  path: 'assets',
  version: '1',
})
export class AssetsController {
  constructor(
    private assetsService: AssetsService,
    @InjectQueue('crawlerwallet') private crawlerWalletQueue: Queue,
    @InjectQueue('crawlerasset') private crawlerAssetQueue: Queue,
  ) {}

  WALLET_CRON_DEFINITION = '*/30 * * * *';
  NFT_ASSET_CRON_DEFINITION = '*/30 * * * *';
  WALLET_QUEUE_NAME = 'crawlerwallet';
  NFT_ASSET_QUEUE_NAME = 'crawlerasset'

  @Get('/:wallet/:userId')
  async findAllAssetsByWallet(
    @Param('wallet') wallet: string,
    @Param('userId') userId: string,
    @Query() filterDTO: GetAssetFilterDTO,
  ) {
    this.crawlerWalletQueue.add(
      this.WALLET_QUEUE_NAME,
      {
        wallet: wallet,
        userId: userId,
        filterDTO: filterDTO,
      },
      { repeat: { cron: this.WALLET_CRON_DEFINITION }, jobId: wallet },
    );
    return this.assetsService.findAllAssetsByWallet(wallet, userId, filterDTO);
  }

  @Delete('/:wallet/:userId')
  async disconnectWalletFromCrawlJobs(
    @Param('wallet') wallet: string,
    @Param('userId') userId: string,
  ) {
    const jobs = await this.crawlerWalletQueue.getRepeatableJobs();
    const containsJobForWallet = jobs.some(
      (e) => e.id.normalize() === wallet.normalize(),
    );
    if (containsJobForWallet) {
      this.crawlerWalletQueue.removeRepeatableByKey(
        `${this.WALLET_QUEUE_NAME}:${wallet}:::${this.WALLET_CRON_DEFINITION}`,
      );
      return { statusCode: 200, message: 'Success' };
    } else {
      return { statusCode: 401, message: 'No Such Crawl Job Found' };
    }
  }

  @Get(`token/:token_id/contract/:asset_contract_address`)
  async  findNftAssetsByTokenIdAndContract(
    @Param('token_id') tokenId: string,
    @Param('asset_contract_address') assetContractAddress: string,
    @Query() filterDTO: GetNftFilterDTO,
  ) {
    this.crawlerAssetQueue.add(
      this.NFT_ASSET_QUEUE_NAME,
      {
        tokenId,
        assetContractAddress,
        filterDTO,
      },
      { repeat: { cron: this.NFT_ASSET_CRON_DEFINITION }, jobId: tokenId },
    );
    return this.assetsService.findNftAssetByTokenIdAndContractAddress(tokenId, assetContractAddress, filterDTO);
  }
}
