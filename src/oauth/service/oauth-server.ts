import {UnauthorizedException} from "@nestjs/common";
import {OauthType} from "../common/oauth-type.enum";
import {CodeData, TokenData} from "../enity/data";
import {OauthClient, OauthToken, OauthUser} from "../enity/entity";
import {
    AuthorizationCodeParams,
    OauthCodeTokenParams,
    OauthInterface,
    OauthStoreInterface, PasswordTokenParams, RefreshTokenParams,
    TokenStoreInterface
} from "../common/oauth.interface";

export class OauthServerInstance implements OauthInterface {
    private oauthStore: OauthStoreInterface;
    private tokenStore: TokenStoreInterface;

    private logger?: any;

    constructor(oauthStore: OauthStoreInterface,
                tokenStore: TokenStoreInterface,
                logger: any) {
        this.oauthStore = oauthStore;
        this.tokenStore = tokenStore;
        this.logger = logger || console;
    }

    async authorizationCode(params: AuthorizationCodeParams, allParams?: any): Promise<string> {
        this.logger.debug('start authorizationCode');
        const client: OauthClient = await this.oauthStore.getClient(params.client_id, params.scope, allParams);
        if (!client) {
            throw new UnauthorizedException('client invalidate')
        }
        const user: OauthUser = await this.oauthStore.getUser(params.username, params.password, allParams);
        if (!user) {
            throw new UnauthorizedException('user invalidate')
        }
        const codeStr: string = await this.tokenStore.buildAndSaveCode(user, client, params.scope, allParams);
        this.logger.debug('end authorizationCode');
        return codeStr;
    }

    async token(params: OauthCodeTokenParams | PasswordTokenParams | RefreshTokenParams, allParams?: any): Promise<OauthToken> {
        switch (params.grant_type) {
            case OauthType.AuthorizationCode:
                return await this._AuthorizationCodeToken(params as OauthCodeTokenParams, allParams)
                break;
            case OauthType.Password:
                return await this._PasswordToken(params as PasswordTokenParams, allParams)
                break;
            case OauthType.RefreshToken:
                return await this._RefreshToken(params as RefreshTokenParams, allParams)
                break;
            default:
                throw new UnauthorizedException('grant_type not support');
                break;
        }
    }

    private async _AuthorizationCodeToken(params: OauthCodeTokenParams, allParams?: any): Promise<OauthToken> {
        this.logger.debug('start AuthorizationCodeToken')
        const codeData: CodeData = await this.tokenStore.getCodeData(params.code, allParams);
        let client: OauthClient = await this.oauthStore.getClientAndValidate(codeData.client.clientId, params.client_secret, codeData.scope, allParams);
        if (!client) {
            throw new UnauthorizedException('client invalidate');
        }
        let user: OauthUser = codeData.user;
        return await this.tokenStore.buildAndStoreToken(client, user, codeData.scope, allParams);
    }

    private async _PasswordToken(params: PasswordTokenParams, allParams?: any): Promise<OauthToken> {
        this.logger.debug('start PasswordToken');
        const client: OauthClient = await this.oauthStore.getClientAndValidate(params.client_id, params.client_secret, params.scope, allParams);
        if (!client) {
            throw new UnauthorizedException('client invalidate')
        }
        const user: OauthUser = await this.oauthStore.getUser(params.username, params.password, allParams);
        if (!user) {
            throw new UnauthorizedException('user invalidate')
        }
        return await this.tokenStore.buildAndStoreToken(client, user, params.scope, allParams);
    }

    private async _RefreshToken(params: RefreshTokenParams, allParams?: any): Promise<OauthToken> {
        this.logger.debug('start RefreshToken');
        const refreshTokenData: TokenData = await this.tokenStore.getRefreshTokenData(params.refresh_token, allParams);
        return await this.tokenStore.buildAndStoreToken(refreshTokenData.client, refreshTokenData.user, refreshTokenData.scope, allParams);
    }
}


