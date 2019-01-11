import {CodeData, OauthClient, OauthToken, OauthUser, TokenData, TokenStoreInterface} from "..";
import {JwtModuleOptions} from "@nestjs/jwt";
import * as jwt from 'jsonwebtoken';
import {Principle} from "../enity/principle";


export class JwtStore implements TokenStoreInterface {
    private options: JwtModuleOptions;

    constructor(options: JwtModuleOptions) {
        this.options = options;
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
                const code = jwt.sign(codeDate, this.options.secretOrPrivateKey, this.options.signOptions);
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
                const access_token = jwt.sign(principle, this.options.secretOrPrivateKey, Object.assign({}, this.options.signOptions, {expiresIn: 3600 * 24 * 30}))
                const refresh_token = jwt.sign(tokenData, this.options.secretOrPrivateKey, this.options.signOptions);
                resolve({
                    access_token: access_token,
                    refresh_token: refresh_token,
                    expires_in: this.options.signOptions.expiresIn || 36000
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
                    this.options.publicKey || (this.options.secretOrPrivateKey as any),
                    this.options.verifyOptions
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
                    this.options.publicKey || (this.options.secretOrPrivateKey as any),
                    this.options.verifyOptions
                ) as TokenData;
                resolve(data)
            } catch (e) {
                reject(e)
            }
        })
    }

}
