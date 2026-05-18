import { CloseIcon } from './close';
import { DashboardIcon } from './dashboard';
import type { IconProps } from './icon-base';
import { MenuIcon } from './menu';
import { PanelLeftIcon } from './panel-left';
import { PostsIcon } from './posts';

const ICONS = {
  close: CloseIcon,
  dashboard: DashboardIcon,
  menu: MenuIcon,
  'panel-left': PanelLeftIcon,
  posts: PostsIcon,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, ...props }: { name: IconName } & IconProps) {
  const Component = ICONS[name];

  return <Component {...props} />;
}
