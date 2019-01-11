import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {Principle} from "./enity/principle";

export class _JwtAuthGuard_ extends AuthGuard('jwt') {
    private scopes: Array<string>;

    constructor(...scopes) {
        super();
        this.scopes = scopes.sort();
    }

    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

    handleRequest(err, user, info) {
        if (err || !user) {
            throw err || new UnauthorizedException();
        }
        const princple: Principle = user as Principle;
        this.validateScope(princple);
        return user;
    }


    private validateScope(princple: Principle) {
        if (this.scopes.length === 0) {
            return
        }
        if (!princple.scopes || princple.scopes.length <= 0) {
            throw new UnauthorizedException(`no scope all`);
        }
        for (const reqScop of this.scopes) {
            if (!princple.scopes.includes(reqScop)) {
                throw new UnauthorizedException(`no scope [${reqScop}]`);
            }
        }
    }
}


export function JwtAuthGuard(...scopes) {
    return new _JwtAuthGuard_(...scopes)
}
