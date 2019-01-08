import {DynamicModule, Global, Inject, Module, Provider, Type} from "@nestjs/common";
import {FactoryProvider, ModuleMetadata} from "@nestjs/common/interfaces";
import {OauthService} from "./service/oauth.service";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from '@nestjs/jwt';

export const OAUTH_MODULE_OPTIONS = 'OAUTH_MODULE_OPTIONS';
export * from './common/oauth-type.enum'
export * from './enity/data'
export * from './enity/entity'
export * from './service/oauth.interface'
export * from './service/oauth.service'
export * from './store/store.interface'

export interface OauthModuleOptions {
    store: any,
    logger?: any
}

export interface OauthOptionsFactory {
    createCacheOptions(): Promise<OauthModuleOptions> | OauthModuleOptions;
}

export interface OauthModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<OauthOptionsFactory>;
    useClass?: Type<OauthOptionsFactory>;
    useFactory?: (
        ...args: any[]
    ) => Promise<OauthModuleOptions> | OauthModuleOptions;
    inject?: any[];
    extraProviders?: Provider[];
}


@Global()
@Module({})
export class OauthModule {


    public static registerAsync(options: OauthModuleAsyncOptions): DynamicModule {
        const oauthServiceProvider: FactoryProvider = {
            provide: OauthService,
            useFactory: (option: OauthModuleOptions) => {
                return new OauthService(option.store, option.logger)
            },
            inject: [OAUTH_MODULE_OPTIONS]
        };
        return {
            module: OauthModule,
            imports: [...options.imports,
                PassportModule.register({defaultStrategy: 'jwt'}),
                JwtModule.register({
                    secretOrPrivateKey: 'secretKey',
                    signOptions: {
                        expiresIn: 3600,
                    },
                })
            ],
            providers: [
                oauthServiceProvider,
                ...this.createAsyncProviders(options),
                oauthService,
                ...(options.extraProviders || []),
            ],
            exports: [oauthServiceProvider]
        };
    }

    private static createAsyncProviders(options: OauthModuleAsyncOptions): Provider[] {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: options.useClass,
                useClass: options.useClass,
            },
        ];
    }

    private static createAsyncOptionsProvider(options: OauthModuleAsyncOptions): Provider {
        if (options.useFactory) {
            return {
                provide: OAUTH_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        return {
            provide: OAUTH_MODULE_OPTIONS,
            useFactory: async (optionsFactory: OauthOptionsFactory) =>
                optionsFactory.createCacheOptions(),
            inject: [options.useExisting || options.useClass],
        };
    }
}


