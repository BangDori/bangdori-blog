import Image from 'next/image';
import { Github, Instagram, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export default function About() {
  return (
    <section className="container">
      <div className="flex flex-col items-center gap-8">
        <Image
          src="/profile.jpg"
          alt="프로필 사진"
          width={160}
          height={160}
          className={cn(
            'h-40 w-40 rounded-full object-cover',
            'shadow-2xl dark:shadow-[8px_8px_24px_0_rgba(0,180,216,0.18),_-8px_-8px_24px_0_rgba(200,240,255,0.7)]'
          )}
          priority
        />
        <p className="text-muted-foreground text-center text-base font-medium">
          혼자보단 함께하는 게 더 즐거워요.
          <br />
          복잡한 문제도 함께라면 해결할 수 있기에,
          <br />
          서로를 이해하며 조화롭게 빛나는 서비스를 만들고 싶어요.
        </p>
      </div>

      <div className="mt-12">
        <div className="flex justify-center gap-2">
          {socialLinks.map((item, index) => (
            <Button key={index} variant="ghost" className="bg-primary/10" size="icon" asChild>
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                <item.icon className="h-4 w-4" />
              </a>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
