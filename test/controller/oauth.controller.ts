import {Controller, Get, Req, UseGuards} from "@nestjs/common";
import {JwtAuthGuard, OauthService, OauthType, Principle} from "../../src";

@Controller()
export class OauthController {

    constructor(private oauthService: OauthService) {
    }


    @Get('login')
    async login() {
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
        return token
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async me(@Req() req: any) {
        return {}
    }

    @Get('me1')
    @UseGuards(JwtAuthGuard('a', 'b', 'ff'))
    async me1(@Req() req: any, user: Principle) {
        return {}
    }
}


