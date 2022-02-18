import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { map, catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class ThegraphService {
  constructor(private httpService: HttpService) {}

  async enumerateNFTsByWalletOnPolygon(wallet: string): Promise<any> {
    const url = `https://api.thegraph.com/subgraphs/name/creazy231/artvatars`;
    const graphQuery = `{
      artvatars(where: {owner: "${wallet}"}, orderBy: tokenId, orderDirection: desc) {
        tokenId
        owner
        traits {
          type
          value
        }
      } 
    }`;

    const data = this.httpService
      .post(url, {
        query: graphQuery,
      })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          throw new HttpException(
            error?.response?.data,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      );

    return lastValueFrom(data);
  }
}
