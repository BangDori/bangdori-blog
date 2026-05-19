import { IconBase, type IconProps as PostsIconProps } from './icon-base';

export function PostsIcon(props: PostsIconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 4h12a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-2 1V6a2 2 0 0 1 2-2z" />
      <path d="M8 8h6" />
      <path d="M8 12h6" />
      <path d="M8 16h4" />
    </IconBase>
  );
}
