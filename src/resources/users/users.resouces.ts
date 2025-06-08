import {JwtPayload} from "jwt-decode";

export class Users {
    name?: string;
    login?: string;
    senha?: string;
}

export class Credentials {
    login?: string;
    senha?: string;
}

export class AcessToken {
    accessToken?: string;
}

export class UserSessionToken {
    name?: string;
    login?: string;
    accessToken?: string;
    expiration?: number;
}

export interface ExtendedJwtPayload extends JwtPayload {
    name?: string;
}
