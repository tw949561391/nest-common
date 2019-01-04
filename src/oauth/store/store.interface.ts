import {CodeData, TokenData} from "../enity/data";
import {OauthClient, OauthToken, OauthUser} from "../enity/entity";

export interface ClientStoreInterface {
    getClient(client_id: string, scope: string, allParams?: any): Promise<OauthClient>;

    getClientAndValidate(client_id: string, client_secret: string, scope: string, allParams?: any): Promise<OauthClient>;
}

export interface CodeStoreInterface {
    buildAndSaveCode(user: OauthUser, client: OauthClient, scope: string, allParams: any): Promise<string>;

    getCodeData(code: string, allParams: any): Promise<CodeData>;
}

export interface TokenStoreInterface {
    buildAndStoreToken(client: OauthClient, user: OauthUser, allParams: any): Promise<OauthToken>;

    getRefreshTokenData(refresh_token: string, allParams: any): Promise<TokenData>;
}

export interface UserStoreInterface {
    getUser(username: string, password: string, allParams: any): Promise<OauthUser>;
}

export interface OauthStoreInterface extends ClientStoreInterface, CodeStoreInterface, TokenStoreInterface, UserStoreInterface {

}
