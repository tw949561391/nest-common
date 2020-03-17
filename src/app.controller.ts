import { All, Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard, OauthServer, OauthType, Principle, UserInfo } from "@miup/nest-oauth";
import { TokenGuard } from "@miup/nest-oauth";

@Controller("demo")
export class AppController {

  constructor(private oauthService: OauthServer) {
  }

  @Get("login")
  @UseGuards(TokenGuard)
  async login(@Req() request) {
    return request.token;
  }

  @All("me")
  @UseGuards(JwtAuthGuard("scope"))
  async me(@Req() req: any) {
    return {};
  }

  @Get("me1")
  @UseGuards(JwtAuthGuard("scope"))
  async me1(@UserInfo() user: Principle) {
    return user;
  }
}