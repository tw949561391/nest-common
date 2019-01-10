import {INestApplication, Module} from "@nestjs/common";
import {OauthModule} from "../src/oauth";
import {NestFactory} from "@nestjs/core";
import {Log4j, Log4jModule} from "../src/log4j";
import {OauthStoreService} from "./controller/oauth.store";
import {OauthController} from "./controller/oauth.controller";


@Module({
    imports: [
        Log4jModule.register(),
        OauthModule.registerAsync({
            extraProviders: [OauthStoreService],
            useFactory: (oauthStore: OauthStoreService, log: Log4j) => {
                return {
                    oauthSore: oauthStore,
                    logger: log,
                    jwt: {
                        secretOrPrivateKey: 'secretKey',
                        signOptions: {
                            expiresIn: 360000,
                        }
                    }
                };
            },
            inject: [OauthStoreService, Log4j]
        })
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
