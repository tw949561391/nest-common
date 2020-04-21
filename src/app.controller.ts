import { All, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthPrinciple, JwtOAuthGuard, JwtTokenGuard, Principle } from '@miup/nest-oauth';

@Controller('demo')
export class AppController {


  @Post('authorie')
  @UseGuards(JwtTokenGuard('code'))
  async authorie(@Req() request) {
    return request.code;
  }

  @Post('login')
  @UseGuards(JwtTokenGuard('token'))
  async login(@Req() request) {
    return request.token;
  }

  @All('me')
  @UseGuards(JwtOAuthGuard('scope'))
  async me(@AuthPrinciple() principle: Principle) {
    return principle;
  }
}