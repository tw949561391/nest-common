import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import * as path from 'path';
import { ConfigService } from './service/config.service';

@Global()
@Module({})
export class ConfigModule {

  public static register(option?: ConfigOption): DynamicModule {
    const exportProviders = [
      {
        provide: ConfigService,
        useValue: new ConfigService(option || {}),
      },
    ];
    return {
      module: ConfigModule,
      providers: exportProviders,
      exports: [ConfigService],
    };
  }
}


export class ConfigOption {
  path?: string = path.join(process.cwd(), 'env');
  encoding?: string = 'utf-8';
  basename?: string = 'environment';
  env?: string = process.env.NODE_ENV;
  default?: string = 'default';
}

export * from './service/config.service';


