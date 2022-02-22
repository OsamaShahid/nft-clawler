import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class OpenseaService {
  constructor(private httpService: HttpService) {}

  async enumerateNFTsByWalletOnEthereum(wallet: string) {
    let offset = 0;
    const limit = 50;

    let allAssets = [];

    while (true) {
      const url = `https://api.opensea.io/api/v1/assets?owner=${wallet}&order_direction=desc&offset=${offset}&limit=${limit}`;
      const options = {
        headers: { 'X-API-KEY': "025ccfe1f0dc46cba0d80d8fba31b720" },
      };
      const data = this.httpService.get(url, options).pipe(
        map((response) => response.data),
        catchError((error) => {
          throw new HttpException(
            error?.response?.data,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      );

      const opensea = await lastValueFrom(data);

      allAssets = [...allAssets, ...opensea.assets];
      offset += limit;

      console.log(allAssets.length);

      if (opensea.assets.length < limit) {
        break;
      }
    }

    return allAssets;
  }

  async getAssetFromOpenSeaService(tokenId: string, assetContractAddress: string) {
    let offset = 0;
    const limit = 50;

    let allAssets = [];

    while (true) {
      const url = `https://api.opensea.io/api/v1/assets?token_ids=${tokenId}&asset_contract_address=${assetContractAddress}&order_direction=desc&offset=${offset}&limit=${limit}`;
      const options = {
        headers: { 'X-API-KEY': "025ccfe1f0dc46cba0d80d8fba31b720" },
      };
      const data = this.httpService.get(url, options).pipe(
        map((response) => response.data),
        catchError((error) => {
          throw new HttpException(
            error?.response?.data,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      );

      const opensea = await lastValueFrom(data);

      allAssets = [...allAssets, ...opensea.assets];
      offset += limit;

      console.log(allAssets.length);

      if (opensea.assets.length < limit) {
        break;
      }
    }

    return allAssets;
  }
}
