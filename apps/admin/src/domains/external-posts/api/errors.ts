import { ApiError } from '@shared/lib/http';

export function describeCreateExternalPostError(err: Error): string {
  if (err instanceof ApiError) {
    if (err.status === 409) return '이미 등록된 외부 글 URL입니다.';
    if (err.status === 400) return err.message;
    return `[${err.status}] ${err.message}`;
  }
  return err.message;
}

export function describeUpdateExternalPostError(err: Error): string {
  if (err instanceof ApiError) {
    if (err.status === 404) return '삭제되었거나 존재하지 않는 외부 글입니다.';
    if (err.status === 409) return '이미 등록된 외부 글 URL입니다.';
    if (err.status === 400) return err.message;
    return `[${err.status}] ${err.message}`;
  }
  return err.message;
}

export function describeDeleteExternalPostError(err: Error): string {
  if (err instanceof ApiError) {
    if (err.status === 404) return '이미 삭제되었거나 존재하지 않는 외부 글입니다.';
    return `[${err.status}] ${err.message}`;
  }
  return err.message;
}
