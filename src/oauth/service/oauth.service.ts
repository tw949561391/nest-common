import {
    AuthorizationCodeParams,
    OauthCodeTokenParams,
    OauthInterface,
    PasswordTokenParams,
    RefreshTokenParams
} from "./oauth.interface";
import {OauthStoreInterface} from "../store/store.interface";
import {ForbiddenException} from "@nestjs/common";
import {OauthType} from "../common/oauth-type.enum";
import {CodeData, TokenData} from "../enity/data";
import {OauthClient, OauthToken, OauthUser} from "../enity/entity";
import {Log4j} from "../../log4j";

export class OauthService implements OauthInterface {
    private store: OauthStoreInterface;

    private logger?: any;

    constructor(store: OauthStoreInterface,
                logger: any) {
        this.store = store;
        this.logger = logger || defaultLog;
    }

    async authorizationCode(params: AuthorizationCodeParams, allParams?: any): Promise<string> {
        this.logger.debug('start authorizationCode');
        const client: OauthClient = await this.store.getClient(params.client_id, params.scope, allParams);
        if (!client) {
            throw new ForbiddenException('client invalidate')
        }
        const user: OauthUser = await this.store.getUser(params.username, params.password, allParams);
        if (!user) {
            throw new ForbiddenException('user invalidate')
        }
        const codeStr: string = await this.store.buildAndSaveCode(user, client, params.scope, allParams);
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
                throw new ForbiddenException('grant_type not support');
                break;
        }
    }

    private async _AuthorizationCodeToken(params: OauthCodeTokenParams, allParams?: any): Promise<OauthToken> {
        this.logger.debug('start AuthorizationCodeToken')
        const codeData: CodeData = await this.store.getCodeData(params.code, allParams);
        let client: OauthClient = await this.store.getClientAndValidate(codeData.client.clientId, params.client_secret, codeData.scope, allParams);
        if (!client) {
            throw new ForbiddenException('client invalidate');
        }
        let user: OauthUser = codeData.user;
        return await this.store.buildAndStoreToken(client, user, allParams);
    }

    private async _PasswordToken(params: PasswordTokenParams, allParams?: any): Promise<OauthToken> {
        this.logger.debug('start PasswordToken');
        const client: OauthClient = await this.store.getClientAndValidate(params.client_id, params.client_secret, params.scope, allParams);
        if (!client) {
            throw new ForbiddenException('client invalidate')
        }
        const user: OauthUser = await this.store.getUser(params.username, params.password, allParams);
        if (!user) {
            throw new ForbiddenException('user invalidate')
        }
        return await this.store.buildAndStoreToken(client, user, allParams);
    }

    private async _RefreshToken(params: RefreshTokenParams, allParams?: any): Promise<OauthToken> {
        this.logger.debug('start RefreshToken');
        const refreshTokenData: TokenData = await this.store.getRefreshTokenData(params.refresh_token, allParams);
        return await this.store.buildAndStoreToken(refreshTokenData.client, refreshTokenData.user, allParams);
    }
}

const defaultLog = {
    debug: function (...attr) {
        console.log(attr)
    },
    info: function (...attr) {
        console.log(attr)

    },
    error: function (...attr) {
        console.log(attr)

    }
}
