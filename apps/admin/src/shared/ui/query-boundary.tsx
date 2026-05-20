import type { UseQueryResult } from '@tanstack/react-query';
import { type ReactNode, useEffect } from 'react';

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T, Error>;
  loading?: ReactNode;
  error?: (err: Error) => ReactNode;
  /** 에러 발생 시 1회성 부수 효과 (toast 등)을 넘기고 싶을 때 */
  onError?: (err: Error) => void;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}

/**
 * useQuery 결과의 loading / error / empty / data 분기를 선언적으로 표현한다.
 */
export function QueryBoundary<T>({
  query,
  loading = null,
  error,
  onError,
  isEmpty,
  empty = null,
  children,
}: QueryBoundaryProps<T>) {
  useEffect(() => {
    if (query.isError && onError) onError(query.error);
  }, [query.isError, query.error, onError]);

  if (query.isLoading) return loading;
  if (query.isError) return error ? error(query.error) : null;
  if (query.data === undefined) return null;
  if (isEmpty?.(query.data)) return empty;
  return children(query.data);
}
