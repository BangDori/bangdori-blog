import { DashboardIcon } from './dashboard';
import type { IconProps } from './icon-base';
import { PostsIcon } from './posts';

const ICONS = {
  dashboard: DashboardIcon,
  posts: PostsIcon,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, ...props }: { name: IconName } & IconProps) {
  const Component = ICONS[name];

  return <Component {...props} />;
}
