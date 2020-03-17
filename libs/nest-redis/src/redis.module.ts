import { DynamicModule, FactoryProvider, Global, Module, ValueProvider } from "@nestjs/common";
import { REDIS_MODULE_OPTIONS, RedisModuleAsyncOptions, RedisModuleOptions } from "./redis.interface";
import { RedisService } from "./redis.service";

@Module({
  imports: [],
  providers: [
    {
      provide: REDIS_MODULE_OPTIONS,
      useFactory: () => ({})
    },
    {
      provide: RedisService,
      useFactory: () => ({})
    }

  ],
  exports: [REDIS_MODULE_OPTIONS, RedisService]
})
export class RedisModule {

  public static registerAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const configProvider: FactoryProvider = {
      provide: REDIS_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject
    };

    const createClientProvider: FactoryProvider = {
      provide: RedisService,
      useFactory: (options: RedisModuleOptions | RedisModuleOptions[]) => {
        return new RedisService(options);
      },
      inject: [REDIS_MODULE_OPTIONS]
    };

    return {
      module: RedisModule,
      imports: [...(options.imports || [])],
      providers: [
        configProvider,
        createClientProvider
      ],
      exports: [createClientProvider]
    };
  }

  public static register(options: RedisModuleOptions | RedisModuleOptions[]) {
    const configProvider: ValueProvider = {
      useValue: options,
      provide: REDIS_MODULE_OPTIONS
    };
    const createClientProvider: FactoryProvider = {
      provide: RedisService,
      useFactory: (options: RedisModuleOptions | RedisModuleOptions[]) => {
        return new RedisService(options);
      },
      inject: [REDIS_MODULE_OPTIONS]
    };
    return {
      module: RedisModule,
      providers: [
        configProvider,
        createClientProvider
      ],
      exports: [createClientProvider]
    };

  }
}