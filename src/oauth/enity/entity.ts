export class OauthClient {
    clientId: string;
}

export class OauthToken {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export class OauthUser {
    userId: string;
}
