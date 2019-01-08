import {DynamicModule, Global, Module, Provider, Type} from "@nestjs/common";
import {FactoryProvider, ModuleMetadata} from "@nestjs/common/interfaces";
import {OauthService} from "./service/oauth.service";
import {OauthStoreInterface, TokenStoreInterface} from "./common/oauth.interface";
import {JwtStore} from "./service/jwt.store";
import {JwtModule, JwtModuleAsyncOptions, JwtModuleOptions} from '@nestjs/jwt';
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "./service/jwt.strategy";
import {OauthStoreService, TestDemoClass} from "../../test";

export const OAUTH_MODULE_OPTIONS = 'OAUTH_MODULE_OPTIONS';
export const OAUTH_MODULE_TOKEN_STORE = 'OAUTH_MODULE_TOKEN_STORE';
export const OAUTH_MODULE_OAUTH_STORE = 'OAUTH_MODULE_OAUTH_STORE';


export interface OauthModuleOptions {
    oauthSore: OauthStoreInterface,
    jwt: JwtModuleOptions,
    logger?: any
}

export interface OauthOptionsFactory {
    createOptions(): Promise<OauthModuleOptions> | OauthModuleOptions;
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
            provide: OAUTH_MODULE_OAUTH_STORE,
            useFactory: (option: OauthModuleOptions, tokenStore: TokenStoreInterface) => {
                return new OauthService(option.oauthSore, tokenStore, option.logger)
            },
            inject: [OAUTH_MODULE_OPTIONS, OAUTH_MODULE_TOKEN_STORE]
        };

        const tokenStoreProvider: FactoryProvider = {
            provide: OAUTH_MODULE_TOKEN_STORE,
            useFactory: (options: OauthModuleOptions) => {
                return new JwtStore(options.jwt)
            },
            inject: [OAUTH_MODULE_OPTIONS]
        };


        const jwtStrategyProvider: FactoryProvider = {
            provide: JwtStrategy,
            useFactory: (options: OauthModuleOptions) => {
                return new JwtStrategy(options.jwt)
            },
            inject: [OAUTH_MODULE_OPTIONS]
        };

        const asyncProviders: Provider[] = this.createAsyncProviders(options);
        return {
            module: OauthModule,
            imports: [...(options.imports || []),
                PassportModule.register({defaultStrategy: 'jwt'}),
                JwtModule.registerAsync({
                    extraProviders: [OAUTH_MODULE_OPTIONS],
                    useFactory: (options: OauthModuleOptions) => {
                        return options.jwt;
                    },
                    inject: [OAUTH_MODULE_OPTIONS],
                } as JwtModuleAsyncOptions)
            ],
            providers: [
                oauthServiceProvider,
                tokenStoreProvider,
                jwtStrategyProvider,
                ...asyncProviders,
                ...(options.extraProviders || []),
            ],
            exports: [
                oauthServiceProvider,
                tokenStoreProvider,
                ...asyncProviders,
                jwtStrategyProvider,
                ...(options.extraProviders || [])]
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
                optionsFactory.createOptions(),
            inject: [options.useExisting || options.useClass],
        };
    }
}


