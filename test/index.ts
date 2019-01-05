import {INestApplication, Inject, Injectable, Module} from "@nestjs/common";
import {OauthModule, OauthModuleAsyncOptions} from "../src/oauth";
import {NestFactory} from "@nestjs/core";
import {OauthService} from "../src/oauth/service/oauth.service";
import {OauthStoreInterface} from "../src/oauth/store/store.interface";
import {OauthClient, OauthToken, OauthUser} from "../src/oauth/enity/entity";
import {CodeData, TokenData} from "../src/oauth/enity/data";
import {Log4j, Log4jModule} from "../src/log4j";

@Injectable()
class OauthStore implements OauthStoreInterface {
    buildAndSaveCode(user: OauthUser, client: OauthClient, scope: string, allParams: any): Promise<string> {
        return undefined;
    }

    buildAndStoreToken(client: OauthClient, user: OauthUser, allParams: any): Promise<OauthToken> {
        return undefined;
    }

    getClient(client_id: string, scope: string, allParams?: any): Promise<OauthClient> {
        return undefined;
    }

    getClientAndValidate(client_id: string, client_secret: string, scope: string, allParams?: any): Promise<OauthClient> {
        return undefined;
    }

    getCodeData(code: string, allParams: any): Promise<CodeData> {
        return undefined;
    }

    getRefreshTokenData(refresh_token: string, allParams: any): Promise<TokenData> {
        return undefined;
    }

    getUser(username: string, password: string, allParams: any): Promise<OauthUser> {
        return undefined;
    }

}

@Module({
    imports: [
        Log4jModule.register(),
    ],
    providers: []
})
export class AppModule {
    constructor(private oauthService: OauthService) {
        console.log(oauthService)
    }
}


async function boot() {
    const app: INestApplication = await NestFactory.create(AppModule);
    app.listen(3000)
}

boot().then(() => {

})