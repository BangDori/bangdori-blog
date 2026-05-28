import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { LoginDto } from '../model/schema';
import type { LoginResponse } from '../model/types';
import { login, logout } from './index';
import { authKeys } from './keys';

export function useLogin() {
  const qc = useQueryClient();

  return useMutation<LoginResponse, Error, LoginDto>({
    mutationFn: (dto) => login(dto),
    onSuccess: (res) => {
      // 로그인 직전 /auth/me 가 401 로 캐시되어 있을 수 있다.
      // invalidate 만 하면 백그라운드 refetch 가 끝날 때까지 이전 error 가 남아
      // AuthGuard 가 잠깐 /login 으로 되돌릴 수 있다. 응답의 user 를 즉시 캐시에 박아 race 차단.
      qc.setQueryData(authKeys.me, res.user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => logout(),
    onSettled: () => {
      qc.removeQueries({ queryKey: authKeys.all });
    },
  });
}
