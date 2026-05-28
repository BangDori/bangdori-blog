export interface AuthUser {
  id: string;
  email: string;
  role: 'admin';
}

export interface LoginResponse {
  user: AuthUser;
  accessTokenExpiresAt: string;
}
