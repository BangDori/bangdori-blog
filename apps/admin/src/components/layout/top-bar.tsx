import { Icon } from '@shared/icons';
import { Display } from '@shared/ui/display';
import { ThemeToggle } from '@shared/ui/theme-toggle';
import { useLayoutAuth } from './auth-context';

interface TopBarProps {
  desktopOpen: boolean;
  onToggleDesktop: () => void;
  onOpenMobile: () => void;
}

export function TopBar({ desktopOpen, onToggleDesktop, onOpenMobile }: TopBarProps) {
  const { email } = useLayoutAuth();

  return (
    <header className="h-12 border-b border-border flex items-center gap-2 px-4">
      <Display tablet desktop>
        <button
          type="button"
          onClick={onToggleDesktop}
          aria-expanded={desktopOpen}
          aria-label={desktopOpen ? '사이드바 접기' : '사이드바 펴기'}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Icon name="panel-left" className="size-5" />
        </button>
        {!desktopOpen && (
          <span className="text-sm font-semibold tracking-tight">bangdori.kr admin</span>
        )}
      </Display>
      <Display mobile>
        <button
          type="button"
          onClick={onOpenMobile}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="메뉴 열기"
        >
          <Icon name="menu" className="size-5" />
        </button>
        <span className="text-sm font-semibold tracking-tight">bangdori.kr admin</span>
      </Display>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden sm:inline text-xs text-muted-foreground" title={email}>
          {email}
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
