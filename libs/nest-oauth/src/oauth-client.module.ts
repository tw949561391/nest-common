import { DynamicModule, Global, Module, ValueProvider } from '@nestjs/common';
import { FactoryProvider, ModuleMetadata } from '@nestjs/common/interfaces';
import { JwtModule, JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './service/jwt.strategy';
import * as jwt from 'jsonwebtoken';

export const OAUTH_CLIENT_MODULE_OPTIONS = 'OAUTH_CLIENT_MODULE_OPTIONS';


export interface VerifyJwtOptions {
  secretOrPrivateKey?: jwt.Secret;
  publicKey?: string | Buffer;
  verifyOptions?: jwt.VerifyOptions;
}

export interface OauthClientModuleOptions {
  logger?: any
  fromRequest?: Array<'body' | 'header' | 'query' | 'cookie'>,
  defaultScopes?: string;
  jwt?: VerifyJwtOptions
}


export interface OauthClientModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (
    ...args: any[]
  ) => Promise<OauthClientModuleOptions> | OauthClientModuleOptions;
  inject?: any[];
  extraProviders?: []
}

@Global()
@Module({})
export class OauthClientModule {
  public static registerAsync(options: OauthClientModuleAsyncOptions): DynamicModule {
    const configProvider: FactoryProvider = {
      provide: OAUTH_CLIENT_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
    const jwtStrategyProvider: FactoryProvider = {
      provide: JwtStrategy,
      useFactory: (options: OauthClientModuleOptions) => {
        const fromTypes = new Set(options.fromRequest || []);
        return new JwtStrategy(fromTypes, options.jwt, options.logger);
      },
      inject: [OAUTH_CLIENT_MODULE_OPTIONS],
    };
    return {
      module: OauthClientModule,
      imports: [
        ...(options.imports || []),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          useFactory: (options: OauthClientModuleOptions) => {
            return options.jwt as JwtModuleOptions;
          },
          inject: [OAUTH_CLIENT_MODULE_OPTIONS],
        } as JwtModuleAsyncOptions),
      ],
      providers: [
        jwtStrategyProvider,
        configProvider,
      ],
      exports: [
        jwtStrategyProvider,
      ],
    };
  }

  public static register(options: OauthClientModuleOptions) {
    const fromTypes = new Set(options.fromRequest || []);
    const jwtStrategy = new JwtStrategy(fromTypes, options.jwt, options.logger);
    const jwtStrategyProvider: ValueProvider = {
      provide: JwtStrategy,
      useValue: jwtStrategy,
    };

    return {
      module: OauthClientModule,
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register(options.jwt),
      ],
      providers: [
        jwtStrategyProvider,
      ],
      exports: [
        jwtStrategyProvider,
      ],
    };

  }
}
