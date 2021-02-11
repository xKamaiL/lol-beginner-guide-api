import { Injectable, NotFoundException } from '@nestjs/common';
import { API_CHAMPION_LIST, API_RUNE, API_VERSION } from './shared/constant';
import axios from 'axios';
import { IChampion } from './shared/interfaces/Champion.interface';
import { Positions } from './shared/positions.enum';
import * as https from 'https';

@Injectable()
export class AppService {
  private OP_GG_ENDPOINT = `https://th.op.gg/`;

  getHello(): string {
    return 'Hello World!';
  }

  async getCurrentVersion(): Promise<any> {
    const { data } = await axios.get(API_VERSION);
    const versions = JSON.parse(
      data.replace('Riot.DDragon.versions = ', '').replace(';', ''),
    );
    return versions[0];
  }

  async searchForChampionName(name: string): Promise<IChampion> {
    const ver = await this.getCurrentVersion();
    const { data } = await axios.get(API_CHAMPION_LIST(ver));
    const searchName = Object.keys(data.data).find((champion) => {
      return champion.indexOf(name) > -1;
    });
    if (typeof searchName === 'undefined') {
      throw new NotFoundException('Champion name not found');
    }
    // console.log(data.data[searchName]);
    return data.data[searchName] as IChampion;
  }

  async getPosition(champion: IChampion): Promise<Positions> {
    let position: Positions = Positions.TopLane;
    try {
      await axios.get(
        `${
          this.OP_GG_ENDPOINT
        }/champion/${champion.name.toLowerCase()}/statistics`,
        {
          maxRedirects: 0,
        },
      );
    } catch (e) {
      if (e.response.status === 302) {
        console.log(e.response.headers.location.split('/').reverse()[0]);
        position = e.response.headers.location
          .split('/')
          .reverse()[0] as Positions;
      }
    }
    return position;
  }

  async fetchRuneConfig(championName: string) {
    const champion = await this.searchForChampionName(championName);
    const position = await this.getPosition(champion);
    const instance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
    const { data } = await instance.get(API_RUNE(champion.key, position), {
      headers: {
        'x-requested-with': 'XMLHttpRequest',
        Accept: '*/*',
      },
    });
    console.log(data.config);
    return data;
  }
}
