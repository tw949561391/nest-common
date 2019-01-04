import {DynamicModule, Global, Module, Provider} from '@nestjs/common';
import {ValueProvider} from '@nestjs/common/interfaces';
import {Log4j} from './service/log4j.logger';

const exportProviders: Provider[] = [];

@Global()
@Module({})
export class Log4jModule {
    public static register(options?: { baseDir: string }): DynamicModule {
        const logProvider: ValueProvider = {provide: Log4j, useValue: new Log4j(options as any || {})};
        exportProviders.push(logProvider);
        return {
            module: Log4jModule,
            providers: [...exportProviders],
            exports: exportProviders,
        };
    }

}

export * from './service/log4j.logger';
