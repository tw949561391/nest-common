import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Log4j } from '@miup/nest-log4j';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(Log4j);
  app.useLogger(logger);
  await app.listen(3000);
}

bootstrap();
