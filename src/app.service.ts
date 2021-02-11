import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  async searchForChampionName(){

  }
  async fetchRuneConfig(championName: string) {
    return championName;
  }
}
