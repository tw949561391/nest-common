import {OauthType} from "../common/oauth-type.enum";
import {OauthToken} from "../enity/entity";

export interface OauthInterface {
    authorizationCode(params: AuthorizationCodeParams, allParams?: any): Promise<string>;

    token(params: OauthCodeTokenParams | PasswordTokenParams | RefreshTokenParams, allParams?: any): Promise<OauthToken>;

}

export class AuthorizationCodeParams {
    client_id: string;
    username: string;
    password: string;
    response_type: string = 'code';
    redirect_uri?: string;
    scope?: string;
    state?: string;
}

export class TokenParams {
    client_id: string;
    client_secret: string;
    grant_type: OauthType;
    state?: string;
}

export class OauthCodeTokenParams extends TokenParams {
    code: string;
}

export class PasswordTokenParams extends TokenParams {
    username: string;
    password: string;
    scope?: string;
}

export class RefreshTokenParams extends TokenParams {
    refresh_token: string;
}
