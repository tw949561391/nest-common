import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@miup/nest-config';
import { Log4jModule } from '@miup/nest-log4j';
@Module({
  imports: [
    Log4jModule.register({
      pkgName: 'miup-common',
    }),
    ConfigModule.register({}),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
