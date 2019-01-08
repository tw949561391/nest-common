import {
    CodeData,
    OAUTH_MODULE_OPTIONS,
    OauthClient,
    OauthModuleOptions,
    OauthToken,
    OauthUser,
    TokenData,
    TokenStoreInterface
} from "..";
import {JwtModuleOptions} from "@nestjs/jwt";


export class JwtStore implements TokenStoreInterface {

    constructor(private jwtOption:JwtModuleOptions) {
    }

    buildAndSaveCode(user: OauthUser, client: OauthClient, scope: string, allParams: any): Promise<string> {
        return undefined;
    }

    buildAndStoreToken(client: OauthClient, user: OauthUser, allParams: any): Promise<OauthToken> {
        return undefined;
    }

    getCodeData(code: string, allParams: any): Promise<CodeData> {
        return undefined;
    }

    getRefreshTokenData(refresh_token: string, allParams: any): Promise<TokenData> {
        return undefined;
    }
}
