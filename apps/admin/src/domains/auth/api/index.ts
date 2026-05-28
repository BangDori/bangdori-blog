import { api } from '@shared/lib/http';
import type { LoginDto } from '../model/schema';
import type { AuthUser, LoginResponse } from '../model/types';

export function login(dto: LoginDto): Promise<LoginResponse> {
  // 401 은 "비번 틀림" 의 일반 흐름 — 전역 redirect 우회 (폼 입력·토스트 유지)
  return api.post<LoginResponse>('/auth/login', dto, { skipAuthRedirect: true });
}

export function logout(): Promise<void> {
  return api.post<void>('/auth/logout');
}

export function me(): Promise<AuthUser> {
  return api.get<AuthUser>('/auth/me', undefined, { skipAuthRedirect: true });
}
