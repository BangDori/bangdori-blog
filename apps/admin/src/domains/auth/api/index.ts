import { api } from '@shared/lib/http';
import type { LoginDto } from '../model/schema';
import type { AuthUser, LoginResponse } from '../model/types';

export function login(dto: LoginDto): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/login', dto);
}

export function logout(): Promise<void> {
  return api.post<void>('/auth/logout');
}

export function me(): Promise<AuthUser> {
  return api.get<AuthUser>('/auth/me', undefined, { skipAuthRedirect: true });
}
