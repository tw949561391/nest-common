import {INestApplication, Module} from "@nestjs/common";
import {NestFactory} from "@nestjs/core";
import {Log4j, Log4jModule} from "../src/log4j";
import {OauthStoreService} from "./controller/oauth.store";
import {OauthController} from "./controller/oauth.controller";
import {OauthClientModule, OauthModuleAsyncOptions, OauthServerModule} from "../src/oauth";


@Module({
    imports: [
        Log4jModule.register(),
        OauthServerModule.registerAsync({
            extraProviders: [OauthStoreService],
            useFactory: (oauthStore: OauthStoreService, log: Log4j) => {
                return {
                    oauthSore: oauthStore,
                    logger: log,
                    jwt: {
                        secretOrPrivateKey: 'secretOrPrivateKey',
                        signOptions: {
                            expiresIn: 360000
                        }
                    }
                };
            },
            inject: [OauthStoreService, Log4j]
        }),
        OauthClientModule.registerAsync({
            useFactory: (log: Log4j) => {
                return {
                    logger: log,
                    fromRequest: ['header', 'query'],
                    jwt: {
                        secretOrPrivateKey: 'secretOrPrivateKey',
                        signOptions: {
                            expiresIn: 360000
                        }
                    }
                }
            },
            inject: [Log4j]
        } as OauthModuleAsyncOptions)

    ],
    providers: [],
    exports: [],
    controllers: [OauthController]
})
export class AppModule {
}


async function boot() {
    const app: INestApplication = await NestFactory.create(AppModule);
    app.listen(3000)
}

boot().then(() => {

})
