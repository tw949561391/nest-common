import { DynamicModule, FactoryProvider, Global, Module, ValueProvider } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Log4j } from './service/log4j.logger';
import * as pkgReader from 'read-pkg';
import * as os from 'os';
import * as Path from 'path';

export const PROVIDER_LOG4J_MODULE_OPTION = 'PROVIDER_LOG4J_MODULE_OPTION';

export interface Log4jOptions {
  baseDir?: string;
  pkgName?: string;
}

const defaultLog4jOptions = {
  baseDir: Path.join(os.homedir(), 'log'),
  pkgName: '',
};


export interface Log4jAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: any[]
  ) => Promise<Log4jOptions> | Log4jOptions;
  inject?: any[];
}

@Global()
@Module({})
export class Log4jModule {
  public static register(options?: Log4jOptions): DynamicModule {
    const log4jProvider: FactoryProvider = {
      provide: Log4j,
      useFactory: (options: Log4jOptions) => {
        return new Log4j(options);
      },
      inject: [PROVIDER_LOG4J_MODULE_OPTION],
    };
    const optionsProvider: ValueProvider = {
      provide: PROVIDER_LOG4J_MODULE_OPTION,
      useValue: Object.assign(defaultLog4jOptions, options),
    };
    return {
      module: Log4jModule,
      providers: [optionsProvider, log4jProvider],
      exports: [Log4j],
    };
  }

  public static registerAsync(asyncOption: Log4jAsyncOptions): DynamicModule {


    const log4jProvider: FactoryProvider = {
      provide: Log4j,
      useFactory: (options: Log4jOptions) => {
        return new Log4j(options);
      },
      inject: [PROVIDER_LOG4J_MODULE_OPTION],
    };
    const optionsProvider = {
      provide: PROVIDER_LOG4J_MODULE_OPTION,
      useFactory: async () => {
        // eslint-disable-next-line prefer-rest-params
        const op = await asyncOption.useFactory(arguments);
        return Object.assign(defaultLog4jOptions, op);
      },
      inject: asyncOption.inject || [],
    };
    return {
      module: Log4jModule,
      imports: asyncOption.imports,
      providers: [optionsProvider, log4jProvider],
      exports: [Log4j],
    };
  }
}

export * from './service/log4j.logger';
