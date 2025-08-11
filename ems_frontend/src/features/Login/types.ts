export type authLoginRequest = {
  account: string;
  password: string;
};

export type authLoginResponse = {
  success: boolean;
  data?: {
    access_token: string;
    refresh_token: string;
    member: {
      id: string;
      name: string;
    };
    member_roles: Array<{
      id: string;
      name: string;
    }>;
    expires_in: number;
    token_type: string;
  };
  error?: string;
};
