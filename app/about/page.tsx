import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function About() {
  return (
    <section className="container">
      <div className="flex flex-col items-center">
        <div className="mb-8">
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
        </div>
        <p className="text-muted-foreground mb-8 text-center text-base font-medium">
          혼자보단 함께하는 게 더 즐거워요.
          <br />
          복잡한 문제도 함께라면 해결할 수 있기에,
          <br />
          서로를 이해하며 조화롭게 빛나는 서비스를 만들고 싶어요.
        </p>

        <p className="text-muted-foreground text-base font-medium">
          저는 현재{' '}
          <a
            href="https://creatrip.com/en"
            className="font-semibold underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Creatrip
          </a>
          에서 일하고 있어요.
        </p>
      </div>
    </section>
  );
}
