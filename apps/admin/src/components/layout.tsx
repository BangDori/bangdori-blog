import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon, type IconName } from '@shared/icons';
import { cn } from '@shared/lib/cn';
import { ROUTES } from '@shared/lib/routes';
import { Display } from '@shared/ui/display';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: 'dashboard', end: true },
  { to: ROUTES.posts, label: 'Posts', icon: 'posts' },
];

export function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: location.pathname 을 trigger 로 사용 (effect 본문에서 직접 참조하지 않지만, 라우트 변경 감지가 목적이라 의존성으로 둠)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="min-h-screen flex">
      <Display tablet desktop>
        <aside className="w-60 shrink-0 flex flex-col border-r border-border bg-background">
          <SidebarContent />
        </aside>
      </Display>

      <Display mobile>
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-border bg-background transition-transform',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <SidebarContent />
        </aside>
        {open && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40"
            aria-label="메뉴 닫기"
          />
        )}
      </Display>

      <div className="flex-1 min-w-0 flex flex-col">
        <Display mobile>
          <header className="h-12 border-b border-border flex items-center gap-2 px-4">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="메뉴 열기"
            >
              <Icon name="menu" className="size-5" />
            </button>
            <span className="text-sm font-semibold tracking-tight">bangdori.kr admin</span>
          </header>
        </Display>
        <main className="flex-1 px-6 lg:px-10 py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent() {
  return (
    <>
      <div className="px-5 pt-6 pb-4">
        <span className="text-lg font-bold tracking-tight">bangdori.kr</span>
        <span className="ml-1 text-sm text-muted-foreground">admin</span>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-secondary text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
              )
            }
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
