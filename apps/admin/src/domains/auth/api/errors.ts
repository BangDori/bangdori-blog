import { ApiError } from '@shared/lib/http';

export function describeLoginError(err: Error): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return '이메일 또는 비밀번호가 올바르지 않습니다.';
    if (err.status === 400) return err.message;
    if (err.status === 0) return '서버에 연결할 수 없습니다.';
    return `[${err.status}] ${err.message}`;
  }
  return err.message;
}
