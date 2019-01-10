import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtModuleOptions} from '@nestjs/jwt';
import {Principle} from "..";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private jwtOption: JwtModuleOptions) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtOption.secretOrPrivateKey,
            jsonWebTokenOptions: jwtOption
        });
    }

    async validate(payload: Principle) {
        return payload;
    }
}
