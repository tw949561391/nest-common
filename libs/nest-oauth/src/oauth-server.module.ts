import { DynamicModule, Global, Module, ValueProvider, Logger, LoggerService } from "@nestjs/common";
import { FactoryProvider, ModuleMetadata } from "@nestjs/common/interfaces";
import { OauthServer } from "./service/oauth-server";
import { OauthStoreInterface, TokenStoreInterface } from "./common/oauth.interface";
import { JwtStore } from "./service/jwt.store";
import * as jwt from "jsonwebtoken";
import { OauthStrategy } from "./service/oauth.strategy";
import { PassportModule } from "@nestjs/passport";
import { TokenGuard } from "./token.guard";

export const OAUTH_SERVER_MODULE_OPTIONS = "OAUTH_SERVER_MODULE_OPTIONS";
export const OAUTH_MODULE_TOKEN_STORE = "OAUTH_MODULE_TOKEN_STORE";


export interface SignJwtOptions {
  secretOrPrivateKey: jwt.Secret;
  publicKey?: string | Buffer;
  signOptions?: jwt.SignOptions;
}


export interface OauthServerModuleOptions {
  oauthStore: OauthStoreInterface,
  jwt: SignJwtOptions
}


export interface OauthServerModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  useFactory?: (
    ...args: any[]
  ) => Promise<OauthServerModuleOptions> | OauthServerModuleOptions;
  inject?: any[];
}

@Global()
@Module({})
export class OauthServerModule {
  public static registerAsync(options: OauthServerModuleAsyncOptions): DynamicModule {

    const configProvider: FactoryProvider = {
      provide: OAUTH_SERVER_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || []
    };

    const oauthServiceProvider: FactoryProvider = {
      provide: OauthServer,
      useFactory: (option: OauthServerModuleOptions, tokenStore: TokenStoreInterface) => {
        return new OauthServer(option.oauthStore, tokenStore);
      },
      inject: [OAUTH_SERVER_MODULE_OPTIONS, OAUTH_MODULE_TOKEN_STORE]
    };

    const tokenStoreProvider: FactoryProvider = {
      provide: OAUTH_MODULE_TOKEN_STORE,
      useFactory: (options: OauthServerModuleOptions) => {
        return new JwtStore(options.jwt);
      },
      inject: [OAUTH_SERVER_MODULE_OPTIONS]
    };

    return {
      module: OauthServerModule,
      imports: [
        PassportModule.register({
          property: "token"
        }),
        ...(options.imports || [])
      ],
      providers: [
        configProvider,
        oauthServiceProvider,
        tokenStoreProvider,
        OauthStrategy,
        TokenGuard
      ],
      exports: [
        oauthServiceProvider
      ]
    };
  }


  public static register(options: OauthServerModuleOptions) {

    const configProvider: ValueProvider = {
      provide: OAUTH_SERVER_MODULE_OPTIONS,
      useValue: options
    };
    const oauthServiceProvider: FactoryProvider = {
      provide: OauthServer,
      useFactory: (option: OauthServerModuleOptions, tokenStore: TokenStoreInterface, log: LoggerService) => {
        return new OauthServer(option.oauthStore, tokenStore);
      },
      inject: [OAUTH_SERVER_MODULE_OPTIONS, OAUTH_MODULE_TOKEN_STORE, Logger]
    };

    const tokenStoreProvider: FactoryProvider = {
      provide: OAUTH_MODULE_TOKEN_STORE,
      useFactory: (options: OauthServerModuleOptions) => {
        return new JwtStore(options.jwt);
      },
      inject: [OAUTH_SERVER_MODULE_OPTIONS]
    };

    return {
      module: OauthServerModule,
      imports: [
        PassportModule.register({
          property: "token"
        })
      ],
      providers: [
        configProvider,
        oauthServiceProvider,
        tokenStoreProvider,
        OauthStrategy,
        TokenGuard
      ],
      exports: [
        oauthServiceProvider
      ]
    };
  }

}
