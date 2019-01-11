import {All, Controller, Get, Req, UseGuards} from "@nestjs/common";
import {JwtAuthGuard, OauthServerInstance, OauthType, Principle} from "../../src";

@Controller()
export class OauthController {

    constructor(private oauthService: OauthServerInstance) {
    }


    @Get('login')
    async login(@Req() request) {
        const code = await this.oauthService.authorizationCode({
            client_id: 'client_id',
            username: 'username',
            password: 'password',
            response_type: 'code',
            redirect_uri: 'redirect_uri',
            scope: 'scope,a,b,c,d,e,f,g,h',
            state: 'state',
        });
        const token = await this.oauthService.token({
            code: code,
            client_id: 'client_id',
            client_secret: 'client_secret',
            grant_type: OauthType.AuthorizationCode,
            state: 'state'
        });

        const token2 = await this.oauthService.token({
            username: 'username',
            password: 'password',
            client_id: 'client_id',
            client_secret: 'client_secret',
            grant_type: OauthType.Password,
            state: 'asda',
            scope: 'a,b,c'
        });

        const token3 = await this.oauthService.token({
            client_id: 'client_id',
            client_secret: 'client_secret',
            grant_type: OauthType.RefreshToken,
            state: 'asdaasd',
            refresh_token: token.refresh_token
        });
        return {token, token2, token3};
    }

    @All('me')
    @UseGuards(JwtAuthGuard('scope'))
    async me(@Req() req: any) {
        return {}
    }

    @Get('me1')
    @UseGuards(JwtAuthGuard('scope'))
    async me1(@Req() req: any, user: Principle) {
        return {}
    }
}


