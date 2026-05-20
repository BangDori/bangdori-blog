import { ApiError } from '@shared/lib/http';

export function describeCreatePostError(err: Error): string {
  if (err instanceof ApiError) {
    if (err.status === 409) return '이미 사용 중인 slug 입니다.';
    if (err.status === 400) return err.message;
    return `[${err.status}] ${err.message}`;
  }
  return err.message;
}

export function describeUpdatePostError(err: Error): string {
  if (err instanceof ApiError) {
    if (err.status === 404) return '삭제되었거나 존재하지 않는 글입니다.';
    if (err.status === 409) return '이미 사용 중인 slug 입니다.';
    if (err.status === 400) return err.message;
    return `[${err.status}] ${err.message}`;
  }
  return err.message;
}
