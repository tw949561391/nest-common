import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Principle } from "./enity/principle";

@Injectable()
export class TokenGuard extends AuthGuard("token") {

  handleRequest(err, tokenInfo, info) {
    if (err || !tokenInfo) {
      throw err || new UnauthorizedException();
    }
    return tokenInfo;
  }
}