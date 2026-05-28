import { createContext, type ReactNode, useContext } from 'react';

/**
 * Layout 트리 안에서 사용하는 현재 사용자 + 로그아웃 액션.
 *
 * components 레이어가 `@domains/auth` 를 직접 의존하지 않도록 도메인 데이터/액션을
 * 위 레이어(pages/_protected)에서 끌어와 이 context 를 통해 주입한다.
 */
interface LayoutAuthValue {
  email: string;
  onLogout: () => void;
}

const LayoutAuthContext = createContext<LayoutAuthValue | null>(null);

export function LayoutAuthProvider({
  value,
  children,
}: {
  value: LayoutAuthValue;
  children: ReactNode;
}) {
  return <LayoutAuthContext.Provider value={value}>{children}</LayoutAuthContext.Provider>;
}

export function useLayoutAuth(): LayoutAuthValue {
  const v = useContext(LayoutAuthContext);
  if (!v) throw new Error('useLayoutAuth must be used within LayoutAuthProvider');
  return v;
}
