import { GitHubIcon } from '@/components/icons/GitHubIcon';
import { LinkedInIcon } from '@/components/icons/LinkedInIcon';
import { RssIcon } from '@/components/icons/RssIcon';
import { XIcon } from '@/components/icons/XIcon';

export const FOOTER_SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/bangdori',
    icon: GitHubIcon,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/bangdori/',
    icon: LinkedInIcon,
  },
  {
    label: 'X',
    href: 'https://x.com/bangdorii',
    icon: XIcon,
  },
  {
    label: 'RSS',
    href: '/rss.xml',
    icon: RssIcon,
  },
] as const;
