import { CloseIcon } from './close';
import { DashboardIcon } from './dashboard';
import type { IconProps } from './icon-base';
import { LogOutIcon } from './log-out';
import { MenuIcon } from './menu';
import { MoonIcon } from './moon';
import { PanelLeftIcon } from './panel-left';
import { PostsIcon } from './posts';
import { SunIcon } from './sun';

const ICONS = {
  close: CloseIcon,
  dashboard: DashboardIcon,
  'log-out': LogOutIcon,
  menu: MenuIcon,
  moon: MoonIcon,
  'panel-left': PanelLeftIcon,
  posts: PostsIcon,
  sun: SunIcon,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, ...props }: { name: IconName } & IconProps) {
  const Component = ICONS[name];

  return <Component {...props} />;
}
