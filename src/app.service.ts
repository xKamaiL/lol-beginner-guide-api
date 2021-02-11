import { Injectable, NotFoundException } from '@nestjs/common';
import { API_CHAMPION_LIST, API_RUNE, API_VERSION } from './shared/constant';
import axios from 'axios';
import { IChampion } from './shared/interfaces/Champion.interface';
import { Positions } from './shared/positions.enum';
import * as https from 'https';

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const mappingResult = (el) => {
  const img = el.getElementsByTagName('img')[0];
  const runeName = img.title.split('<br>')[0].replace(/<[^>]+>/g, '');
  return {
    runeName,
    src: `https://${img.src}`,
    isActive: el.className.split(' ').indexOf('perk-page__item--active') > -1,
  };
};

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
      return (
        champion.indexOf(name.charAt(0).toUpperCase() + name.slice(1)) > -1
      );
    });
    if (typeof searchName === 'undefined') {
      throw new NotFoundException('Champion name not found');
    }
    // console.log(data.data[searchName]);
    return data.data[searchName] as IChampion;
  }

  async getPosition(champion: IChampion): Promise<Positions> {
    let position: Positions = Positions.TopLane;
    console.log(
      `${
        this.OP_GG_ENDPOINT
      }champion/${champion.name.toLowerCase()}/statistics`,
    );
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
      if (e.response.status === 301) {
        console.log(e.response.headers.location);
        position = e.response.headers.location
          .split('/')
          .reverse()[0] as Positions;
      }
    }
    return position === Positions.BotLane ? Positions.ADC : position;
  }

  async fetchRuneConfig(championName: string) {
    const champion = await this.searchForChampionName(championName);
    const position = await this.getPosition(champion);
    const instance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
    console.log(API_RUNE(champion.key, position));
    const { data } = await instance.get(API_RUNE(champion.key, position), {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'upgrade-insecure-requests': '1',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
      },
    });
    // console.log(API_RUNE(champion.key, position));
    const { window } = new JSDOM(data);
    const s = window.document.getElementsByClassName('perk-page');
    return {
      name: champion.name,
      primary: [...s[0].getElementsByClassName('perk-page__row')].map(
        (parentEl) => {
          const list = [...parentEl.getElementsByClassName('perk-page__item')];
          return list.map(mappingResult);
        },
      ),
      secondary: [...s[1].getElementsByClassName('perk-page__row')].map(
        (parentEl) => {
          const list = [...parentEl.getElementsByClassName('perk-page__item')];
          return list.map(mappingResult);
        },
      ),
    };
  }
}
