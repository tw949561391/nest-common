import {CodeData, OauthClient, OauthToken, OauthUser, TokenData, TokenStoreInterface} from "..";
import {JwtModuleOptions} from "@nestjs/jwt";
import * as jwt from 'jsonwebtoken';
import {Principle} from "../enity/principle";


export class JwtStore implements TokenStoreInterface {

    constructor(private options: JwtModuleOptions) {
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
                const code = this.sign(codeDate);
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
                const access_token = this.sign(principle)
                const refresh_token = this.sign(tokenData);
                resolve({
                    access_token: access_token,
                    refresh_token: refresh_token,
                    expires_in: 3600
                });
            } catch (e) {
                reject(e)
            }
        })
    }

    getCodeData(code: string, allParams: any): Promise<CodeData> {
        return new Promise((resolve, reject) => {
            try {
                const data: CodeData = this.verify(code);
                resolve(data)
            } catch (e) {
                reject(e)
            }
        })
    }

    getRefreshTokenData(refresh_token: string, allParams: any): Promise<TokenData> {
        return new Promise((resolve, reject) => {
            try {
                const data: TokenData = this.verify(refresh_token);
                resolve(data)
            } catch (e) {
                reject(e)
            }
        })
    }


    private sign(payload: string | Object | Buffer, options?: jwt.SignOptions): string {
        const signOptions = options
            ? {
                ...(this.options.signOptions || {}),
                ...options
            }
            : this.options.signOptions;
        return jwt.sign(payload, this.options.secretOrPrivateKey, signOptions);
    }

    private verify<T extends object = any>(token: string, options?: jwt.VerifyOptions): T {
        const verifyOptions = options
            ? {
                ...(this.options.verifyOptions || {}),
                ...options
            }
            : this.options.verifyOptions;
        return jwt.verify(
            token,
            this.options.publicKey || (this.options.secretOrPrivateKey as any),
            verifyOptions
        ) as T;
    }

    private decode(token: string, options?: jwt.DecodeOptions): null | { [key: string]: any } | string {
        return jwt.decode(token, options);
    }
}
