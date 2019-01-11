import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from '@nestjs/passport';
import {Principle, VerifyJwtOptions} from "..";
import {FromRequestUtil} from "../util/from-request.util";

export class JwtStrategy extends PassportStrategy(Strategy) {
    private logger: any;

    constructor(fromRequest: Set<'body' | 'header' | 'query' | 'cookie'>, private jwtOption: VerifyJwtOptions, log: any) {
        super({
            jwtFromRequest: FromRequestUtil.buid(fromRequest),
            secretOrKey: jwtOption.secretOrPrivateKey,
            jsonWebTokenOptions: jwtOption.verifyOptions
        });
        this.logger = log || console
    }

    async validate(payload: Principle) {
        return payload;
    }
}
