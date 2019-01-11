import {CodeData, OauthClient, OauthToken, OauthUser, SignJwtOptions, TokenData, TokenStoreInterface} from "..";
import {JwtModuleOptions} from "@nestjs/jwt";
import * as jwt from 'jsonwebtoken';
import {Principle} from "../enity/principle";

const defaultOption: any = {
    signOptions: {
        expiresIn: 3600
    }
};

const defaultCodeOption: any = {
    signOptions: {
        expiresIn: 60
    }
};

const defaultRefreshOption: any = {
    signOptions: {
        expiresIn: 3600 * 60
    }
};

export class JwtStore implements TokenStoreInterface {
    private optionsCode: SignJwtOptions;
    private optionsToken: SignJwtOptions;
    private optionsRefresh: SignJwtOptions;
    private vOptions: jwt.VerifyOptions = {};

    constructor(options: SignJwtOptions) {
        this.optionsCode = Object.assign({}, options, defaultCodeOption);
        this.optionsRefresh = Object.assign({}, options, defaultRefreshOption);
        this.optionsToken = Object.assign({}, defaultOption, options);
        if (this.optionsToken.signOptions.algorithm) {
            this.vOptions.algorithms = [this.optionsToken.signOptions.algorithm]
        }
        if (this.optionsToken.signOptions.audience) {
            this.vOptions.audience = this.optionsToken.signOptions.audience
        }
        if (this.optionsToken.signOptions.subject) {
            this.vOptions.subject = this.optionsToken.signOptions.subject
        }
        if (this.optionsToken.signOptions.jwtid) {
            this.vOptions.jwtid = this.optionsToken.signOptions.jwtid
        }
        if (this.optionsToken.signOptions.issuer) {
            this.vOptions.issuer = this.optionsToken.signOptions.issuer
        }
    }

    buildAndSaveCode(user: OauthUser, client: OauthClient, scope: string, allParams: any): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const codeDate: CodeData = {
                    user: user,
                    client: client,
                    scope: scope || '',
                    signTime: new Date()
                };
                const code = jwt.sign(codeDate, this.optionsCode.secretOrPrivateKey || '', this.optionsCode.signOptions);
                resolve(code);
            } catch (e) {
                reject(e)
            }
        })
    }

    buildAndStoreToken(client: OauthClient, user: OauthUser, scopes: string, allParams: any): Promise<OauthToken> {
        return new Promise((resolve, reject) => {
            try {
                const principle: Principle = {
                    userId: user.userId,
                    userInfo: user,
                    client: client,
                    loginTime: new Date(),
                    scopes: scopes ? scopes.split(',') : []
                };
                principle.scopes.sort();
                const tokenData: TokenData = {
                    user: user,
                    client: client,
                    scope: scopes,
                    signTime: new Date(),
                };
                const access_token = jwt.sign(principle, this.optionsToken.secretOrPrivateKey || '', this.optionsToken.signOptions);
                const refresh_token = jwt.sign(tokenData, this.optionsRefresh.secretOrPrivateKey || '', this.optionsRefresh.signOptions);
                resolve({
                    access_token: access_token,
                    refresh_token: refresh_token,
                    expires_in: this.optionsToken.signOptions.expiresIn
                });
            } catch (e) {
                reject(e)
            }
        })
    }

    getCodeData(code: string, allParams: any): Promise<CodeData> {
        return new Promise((resolve, reject) => {
            try {
                const data: CodeData = jwt.verify(
                    code,
                    this.optionsCode.publicKey || (this.optionsCode.secretOrPrivateKey as any),
                    this.vOptions
                ) as CodeData;
                resolve(data)
            } catch (e) {
                reject(e)
            }
        })
    }

    getRefreshTokenData(refresh_token: string, allParams: any): Promise<TokenData> {
        return new Promise((resolve, reject) => {
            try {
                const data: TokenData = jwt.verify(refresh_token,
                    this.optionsRefresh.publicKey || (this.optionsRefresh.secretOrPrivateKey as any),
                    this.vOptions
                ) as TokenData;
                resolve(data)
            } catch (e) {
                reject(e)
            }
        })
    }

}
