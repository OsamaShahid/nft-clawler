import { Job } from 'bull';
import { AssetsService } from './assets.service';
import {
  Process,
  Processor,
  OnQueueCompleted,
  OnQueueActive,
  OnQueueError,
  OnQueueWaiting,
} from '@nestjs/bull';

import { cLogger } from 'src/helpers';

@Processor('wallet')
export class WalletQueueProcessor {
  constructor(private assetsService: AssetsService) {}

  @Process('wallet')
  handleWallet(job: Job) {
    cLogger.info(`handleWallet:: Handling wallet job ${job.id} of type ${job.name} with data `, job.data);
    return this.assetsService.getWallet(job.data.wallet, job.data.userId);
  }

  @OnQueueCompleted()
  onComplete(job: Job) {
    cLogger.info(
      `onComplete:: Processing job ${job.id} of type ${job.name} with data ${job.data} is complete`,
    );
  }

  @OnQueueActive()
  onActivate(job: Job) {
    cLogger.info(
      `onActivate:: Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @OnQueueError()
  onError(job: Job) {
    cLogger.info(
      `onError:: Processing job ${job.id} of type ${job.name} with data ${job.data} has caused an error`,
    );
  }

  @OnQueueWaiting()
  onWaiting(job: Job) {
    cLogger.info(
      `onWaiting:: Waiting job ${job.id} of type ${job.name} with data ${job.data}`,
    );
  }
}

@Processor('nft')
export class NftQueueProcessor {
  constructor(private assetsService: AssetsService) {}

  @Process('nft')
  handleNft(job: Job) {
    cLogger.info(`handleNft:: Handling Nft job ${job.id} of type ${job.name} with data `, job.data);
    return this.assetsService.getNftAsset(job.data.tokenId, job.data.assetContractAddress);
  }

  @OnQueueCompleted()
  onComplete(job: Job) {
    cLogger.info(
      `onComplete:: Processing job ${job.id} of type ${job.name} with data ${job.data} is complete`,
    );
  }

  @OnQueueActive()
  onActivate(job: Job) {
    cLogger.info(
      `onActivate:: Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @OnQueueError()
  onError(job: Job) {
    cLogger.info(
      `onError:: Processing job ${job.id} of type ${job.name} with data ${job.data} has caused an error`,
    );
  }

  @OnQueueWaiting()
  onWaiting(job: Job) {
    cLogger.info(
      `onWaiting:: Waiting job ${job.id} of type ${job.name} with data ${job.data}`,
    );
  }
}
