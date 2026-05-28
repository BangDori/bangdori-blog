import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@shared/lib/http';
import type { AuthUser } from '../model/types';
import { me } from './index';
import { authKeys } from './keys';

export function useMe() {
  return useQuery<AuthUser, Error>({
    queryKey: authKeys.me,
    queryFn: () => me(),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, err) => {
      // 401 은 "비인증" 신호로 즉시 받아들이고 재시도하지 않는다.
      if (err instanceof ApiError && err.status === 401) return false;
      return failureCount < 2;
    },
  });
}
