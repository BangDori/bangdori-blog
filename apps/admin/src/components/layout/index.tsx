import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';

const DESKTOP_SIDEBAR_KEY = 'admin:sidebar:desktop-open';

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState<boolean>(() => {
    const v = window.localStorage.getItem(DESKTOP_SIDEBAR_KEY);
    return v === null ? true : v === '1';
  });
  const location = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: 라우트 변경을 trigger로만 사용
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  useEffect(() => {
    window.localStorage.setItem(DESKTOP_SIDEBAR_KEY, desktopOpen ? '1' : '0');
  }, [desktopOpen]);

  return (
    <div className="min-h-screen flex">
      <Sidebar
        mobileOpen={mobileOpen}
        desktopOpen={desktopOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          desktopOpen={desktopOpen}
          onToggleDesktop={() => setDesktopOpen((v) => !v)}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-6 lg:px-10 py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
