import {INestApplication, Injectable, Module} from "@nestjs/common";
import {OauthModule, OauthStoreInterface} from "../src/oauth";
import {NestFactory} from "@nestjs/core";
import {OauthClient, OauthUser} from "../src/oauth/enity/entity";
import {Log4j, Log4jModule} from "../src/log4j";

@Injectable()
export class TestDemoClass {
    constructor() {
        console.log('create TestDemoClass')
    }

}

@Injectable()
export class OauthStoreService implements OauthStoreInterface {
    constructor(private test: TestDemoClass) {
        console.log('create OauthStoreService')
    }

    getClient(client_id: string, scope: string, allParams?: any): Promise<OauthClient> {
        return undefined;
    }

    getClientAndValidate(client_id: string, client_secret: string, scope: string, allParams?: any): Promise<OauthClient> {
        return undefined;
    }

    getUser(username: string, password: string, allParams: any): Promise<OauthUser> {
        return undefined;
    }

}


@Module({
    imports: [
        Log4jModule.register(),
        OauthModule.registerAsync({
            extraProviders: [OauthStoreService, TestDemoClass],
            useFactory: (oauthStore: OauthStoreService, log: Log4j) => {
                console.log(oauthStore)
                return {
                    oauthSore: oauthStore,
                    logger: log,
                    jwt: {
                        secretOrPrivateKey: 'secretKey',
                        signOptions: {
                            expiresIn: 3600,
                        }
                    }
                };
            },
            inject: [OauthStoreService, Log4j]
        })
    ],
    providers: [],
    exports: []
})
export class AppModule {
}


async function boot() {
    const app: INestApplication = await NestFactory.create(AppModule);
    app.listen(3000)
}

boot().then(() => {

})
