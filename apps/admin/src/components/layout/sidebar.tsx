import { NavLink } from 'react-router-dom';
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

interface SidebarProps {
  mobileOpen: boolean;
  desktopOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, desktopOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      <Display tablet desktop>
        <aside
          inert={!desktopOpen}
          className={cn(
            'shrink-0 flex flex-col bg-background overflow-hidden transition-[width] duration-200',
            desktopOpen ? 'w-60 border-r border-border' : 'w-0',
          )}
        >
          <SidebarContent />
        </aside>
      </Display>

      <Display mobile>
        <aside
          inert={!mobileOpen}
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-border bg-background transition-transform',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <SidebarContent />
        </aside>
        {mobileOpen && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="fixed inset-0 z-40 bg-black/40"
            aria-label="메뉴 닫기"
          />
        )}
      </Display>
    </>
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
