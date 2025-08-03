

export type authLoginRequest = {
    account: string;
    password: string;
}

export type authLoginResponse = {
    success: boolean,
    jwt: string,
    name: string,
    message?: string,
}