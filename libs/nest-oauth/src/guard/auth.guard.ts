import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Principle } from '../index';

@Injectable()
export class JwtAuthGuardClass extends AuthGuard('jwt') {
  private readonly scopes: Array<string>;

  constructor(...scopes) {
    super();
    this.scopes = scopes.sort();
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException((info || {}).message);
    }
    const principle: Principle = user as Principle;
    this.validateScope(principle);
    return user;
  }


  private validateScope(principle: Principle) {
    if (this.scopes.length === 0) {
      return;
    }
    if (!principle.scopes || principle.scopes.length <= 0) {
      throw new UnauthorizedException(`no scope all`);
    }
    for (const reqScop of this.scopes) {
      if (!principle.scopes.includes(reqScop)) {
        throw new UnauthorizedException(`no scope [${reqScop}]`);
      }
    }
  }
}


export function JwtOAuthGuard(...scopes) {
  return new JwtAuthGuardClass(...scopes);
}
