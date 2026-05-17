import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T, Error>;
  loading?: ReactNode;
  error?: (err: Error) => ReactNode;
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
  isEmpty,
  empty = null,
  children,
}: QueryBoundaryProps<T>) {
  if (query.isLoading) return loading;
  if (query.isError) return error ? error(query.error) : null;
  if (query.data === undefined) return null;
  if (isEmpty?.(query.data)) return empty;
  return children(query.data);
}
