import {DynamicModule, Global, Module, Provider, Type} from "@nestjs/common";
import {FactoryProvider, ModuleMetadata} from "@nestjs/common/interfaces";
import {OauthServerInstance} from "./service/oauth-server";
import {OauthStoreInterface, TokenStoreInterface} from "./common/oauth.interface";
import {JwtStore} from "./service/jwt.store";
import {JwtModule, JwtModuleAsyncOptions, JwtModuleOptions} from '@nestjs/jwt';
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "./service/jwt.strategy";
import * as jwt from "jsonwebtoken";

export const OAUTH_SERVER_MODULE_OPTIONS = 'OAUTH_SERVER_MODULE_OPTIONS';
export const OAUTH_CLIENT_MODULE_OPTIONS = 'OAUTH_CLIENT_MODULE_OPTIONS';
export const OAUTH_MODULE_TOKEN_STORE = 'OAUTH_MODULE_TOKEN_STORE';

export interface OauthModuleOptions {
    logger?: any
}

export interface SignJwtOptions {
    secretOrPrivateKey: jwt.Secret;
    publicKey?: string | Buffer;
    signOptions?: jwt.SignOptions;
}

export interface VerifyJwtOptions {
    secretOrPrivateKey?: jwt.Secret;
    publicKey?: string | Buffer;
    verifyOptions?: jwt.VerifyOptions;
}

export interface OauthServerModuleOptions extends OauthModuleOptions {
    oauthSore: OauthStoreInterface,
    jwt: SignJwtOptions
}

export interface OauthClientModuleOptions extends OauthModuleOptions {
    fromRequest?: Array<'body' | 'header' | 'query' | 'cookie'>,
    defaultScopes?: string;
    jwt?: VerifyJwtOptions
}

export interface OauthOptionsFactory {
    createOptions(): Promise<OauthModuleOptions> | OauthModuleOptions;
}

export interface OauthModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<OauthOptionsFactory>;
    useClass?: Type<OauthOptionsFactory>;
    useFactory?: (
        ...args: any[]
    ) => Promise<OauthServerModuleOptions | OauthClientModuleOptions> | OauthServerModuleOptions | OauthClientModuleOptions;
    inject?: any[];
    extraProviders?: Provider[];
}


class OauthModule {

    protected static createAsyncProviders(options: OauthModuleAsyncOptions, provideName: string): Provider[] {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options, provideName)];
        }
        return [
            this.createAsyncOptionsProvider(options, provideName),
            {
                provide: options.useClass,
                useClass: options.useClass,
            },
        ];
    }

    protected static createAsyncOptionsProvider(options: OauthModuleAsyncOptions, provideName: string): Provider {
        if (options.useFactory) {
            return {
                provide: provideName,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        return {
            provide: provideName,
            useFactory: async (optionsFactory: OauthOptionsFactory) =>
                optionsFactory.createOptions(),
            inject: [options.useExisting || options.useClass],
        };
    }
}

@Global()
@Module({})
export class OauthServerModule extends OauthModule {
    public static registerAsync(options: OauthModuleAsyncOptions): DynamicModule {
        const oauthServiceProvider: FactoryProvider = {
            provide: OauthServerInstance,
            useFactory: (option: OauthServerModuleOptions, tokenStore: TokenStoreInterface) => {
                return new OauthServerInstance(option.oauthSore, tokenStore, option.logger)
            },
            inject: [OAUTH_SERVER_MODULE_OPTIONS, OAUTH_MODULE_TOKEN_STORE]
        };

        const tokenStoreProvider: FactoryProvider = {
            provide: OAUTH_MODULE_TOKEN_STORE,
            useFactory: (options: OauthServerModuleOptions) => {
                return new JwtStore(options.jwt)
            },
            inject: [OAUTH_SERVER_MODULE_OPTIONS]
        };


        const asyncProviders: Provider[] = this.createAsyncProviders(options, OAUTH_SERVER_MODULE_OPTIONS);
        return {
            module: OauthServerModule,
            imports: [...(options.imports || []),
            ],
            providers: [
                oauthServiceProvider,
                tokenStoreProvider,
                ...asyncProviders,
                ...(options.extraProviders || []),
            ],
            exports: [
                oauthServiceProvider
            ]
        };
    }

}

@Global()
@Module({})
export class OauthClientModule extends OauthModule {
    public static registerAsync(options: OauthModuleAsyncOptions): DynamicModule {
        const jwtStrategyProvider: FactoryProvider = {
            provide: JwtStrategy,
            useFactory: (options: OauthClientModuleOptions) => {
                const fromTypes = new Set(options.fromRequest || [])
                return new JwtStrategy(fromTypes, options.jwt, options.logger)
            },
            inject: [OAUTH_CLIENT_MODULE_OPTIONS]
        };

        const asyncProviders: Provider[] = this.createAsyncProviders(options, OAUTH_CLIENT_MODULE_OPTIONS);
        return {
            module: OauthClientModule,
            imports: [...(options.imports || []),
                PassportModule.register({defaultStrategy: 'jwt'}),
                JwtModule.registerAsync({
                    useFactory: (options: OauthClientModuleOptions) => {
                        return options.jwt as JwtModuleOptions;
                    },
                    inject: [OAUTH_CLIENT_MODULE_OPTIONS],
                } as JwtModuleAsyncOptions)
            ],
            providers: [
                jwtStrategyProvider,
                ...asyncProviders,
                ...(options.extraProviders || []),
            ],
            exports: [
                ...asyncProviders,
                jwtStrategyProvider,
                ...(options.extraProviders || [])]
        };
    }

}
