import {ExtractJwt, Strategy} from 'passport-jwt';

export const cookieExtractor = function (paramname: string) {
    return function (req) {
        var token = null;
        if (req && req.cookies) {
            token = req.cookies[paramname];
        }
        return token;
    }

};

export class FromRequestUtil {
    public static buid(types: Set<'body' | 'header' | 'query' | 'cookie'>) {
        const arrays = []
        if (types) {
            for (const type of types) {
                const f = this.get(type)
                if (f) {
                    arrays.push(f)
                }
            }
        }
        if (arrays.length > 0) {
            return ExtractJwt.fromExtractors(arrays);
        } else {
            return ExtractJwt.fromAuthHeaderAsBearerToken()
        }
    }

    public static get(type: 'body' | 'header' | 'query' | 'cookie') {
        switch (type) {
            case 'body':
                return ExtractJwt.fromBodyField('access_token')
                break
            case 'header':
                return ExtractJwt.fromAuthHeaderAsBearerToken()
                break
            case 'query':
                return ExtractJwt.fromUrlQueryParameter('access_token')
                break
            case 'cookie':
                return cookieExtractor('access_token')
                break
            default:
                return null;
                break

        }
    }
}
