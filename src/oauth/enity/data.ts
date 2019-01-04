import {OauthClient, OauthUser} from "./entity";

export class CodeData {
    client: OauthClient;
    user: OauthUser;
    scope: string;
}

export class TokenData {
    client: OauthClient;
    user: OauthUser;
    scope: string
}
