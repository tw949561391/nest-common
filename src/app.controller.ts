import { Controller, Get, Injectable } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@miup/nest-config';
import { Log4j } from '@miup/nest-log4j';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              private log: Log4j,
              private readonly configService: ConfigService) {
  }

  @Get()
  getHello(): string {
    this.log.debug('---------');
    return this.appService.getHello();
  }
}
