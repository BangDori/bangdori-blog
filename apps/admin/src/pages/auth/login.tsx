import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LoginForm, useMe } from '@domains/auth';
import { ROUTES } from '@shared/lib/routes';

interface LocationState {
  from?: { pathname: string; search?: string; hash?: string };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const me = useMe();

  // 이미 로그인된 사용자가 /login 에 들어오면 보호 영역으로 돌려보낸다.
  if (me.data) {
    return <Navigate to={ROUTES.posts} replace />;
  }

  const handleSuccess = () => {
    const state = (location.state ?? null) as LocationState | null;
    const from = state?.from;
    const dest = from ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}` : ROUTES.posts;
    navigate(dest, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">bangdori.kr admin</h1>
          <p className="text-sm text-muted-foreground">관리자 계정으로 로그인하세요.</p>
        </div>
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
