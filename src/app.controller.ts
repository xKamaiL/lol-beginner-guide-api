import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('rune')
  getRuneFromOpGG(@Query('championName') championName: string): Promise<any> {
    if (typeof championName === 'undefined') {
      throw new BadRequestException('No Champion name');
    }
    return this.appService.fetchRuneConfig(championName);
  }

  @Get('counter')
  getCounterPickFromOpGG(@Query('championName') championName: string) {
    if (typeof championName === 'undefined') {
      throw new BadRequestException('No Champion name');
    }
    return this.appService.fetchCounterChampion(championName);
  }
}
