import { Github, Instagram, Linkedin, Mail } from 'lucide-react';
import { Button } from '../ui/button';

const socialLinks = [
  {
    icon: Github,
    href: 'https://github.com/bangdori',
  },
  {
    icon: Linkedin,
    href: 'https://www.linkedin.com/in/bangdori/',
  },
  {
    icon: Instagram,
    href: 'https://www.instagram.com/joooon2_/',
  },
  {
    icon: Mail,
    href: `mailto:bangdori@gmail.com?subject=제목을 입력해주세요&body=${encodeURIComponent(
      '안녕하세요, 블로그를 보고 연락드립니다.\n\n문의 내용:\n'
    )}`,
  },
];

export default function Footer() {
  return (
    <footer className="bg-background top-0 z-50 border-b">
      <div className="container flex h-[var(--header-height)] items-center px-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex justify-center gap-2">
            {socialLinks.map((item, index) => (
              <Button key={index} variant="ghost" className="bg-primary/10" size="icon" asChild>
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  <item.icon className="h-4 w-4" />
                </a>
              </Button>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">© 2025 강병준. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
