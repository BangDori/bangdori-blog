import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@components/layout';
import { useLogout, useMe } from '@domains/auth';
import { ApiError } from '@shared/lib/http';
import { ROUTES } from '@shared/lib/routes';
import { Notice } from '@shared/ui/notice';

/**
 * 보호 라우트의 layout-route. ATK 쿠키는 클라이언트가 볼 수 없으므로
 * `/auth/me` 성공 여부가 단일 진실 원천이다. 도메인 데이터/액션을 여기서 끌어와
 * Layout 에 props 로 주입하므로 `components/` 는 `@domains/auth` 에 의존하지 않는다.
 */
export function ProtectedRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const me = useMe();
  const logoutMutation = useLogout();

  if (me.error instanceof ApiError && me.error.status === 401) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  if (!me.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Notice>세션 확인 중…</Notice>
      </div>
    );
  }

  const onLogout = () => {
    if (logoutMutation.isPending) return;
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        navigate(ROUTES.login, { replace: true });
      },
    });
  };

  return <Layout auth={{ email: me.data.email, onLogout }} />;
}
