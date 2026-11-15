import type { Metadata } from 'next';
import Image from 'next/image';
import { JsonLd } from '@/components/JsonLd';
import { SITE } from '@/lib/site';
import { createPersonJsonLd } from '@/lib/structured-data';

const description = 'Product Engineer 강병준입니다.';

const profileImage = {
  url: '/profile-og.jpg',
  width: 1200,
  height: 1200,
  alt: '강병준 프로필 사진',
};

export const metadata: Metadata = {
  title: '강병준',
  description,
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    type: 'profile',
    locale: SITE.locale,
    siteName: SITE.name,
    title: '강병준',
    description,
    url: '/about',
    images: [profileImage],
  },
  twitter: {
    card: 'summary',
    title: '강병준',
    description,
    images: [profileImage.url],
  },
};

function ProfileBackground() {
  return (
    <div
      className="pointer-events-none relative z-0 hidden w-full overflow-hidden sm:col-start-1 sm:row-start-1 sm:row-end-3 sm:block sm:w-[72%] sm:max-w-[30.25rem] sm:justify-self-end lg:absolute lg:top-8 lg:right-0 lg:col-auto lg:row-auto lg:h-96 lg:justify-self-auto"
      style={{
        maskImage:
          'radial-gradient(ellipse 66% 62% at 58% 50%, black 24%, rgba(0, 0, 0, 0.68) 50%, transparent 78%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 66% 62% at 58% 50%, black 24%, rgba(0, 0, 0, 0.68) 50%, transparent 78%)',
      }}
      aria-hidden="true"
    >
      <Image
        src="/profile.jpg"
        alt=""
        fill
        sizes="(min-width: 704px) 484px, (min-width: 640px) calc(72vw - 23px), 1px"
        className="object-cover object-[54%_58%] saturate-100 dark:brightness-75 dark:saturate-75"
      />
      <div className="from-background via-background/85 absolute inset-0 bg-linear-to-r via-60% to-transparent dark:hidden" />
      <div className="from-background via-background/45 absolute inset-0 hidden bg-linear-to-r to-transparent dark:block" />
      <div className="from-background/70 dark:from-background absolute inset-y-0 right-0 w-28 bg-linear-to-l to-transparent sm:w-32" />
    </div>
  );
}

const EXPERIENCES = [
  { period: '2026.07 -', company: '크리에이트립', role: 'Forward Deployed Engineer' },
  { period: '2025.09 - 2026.06', company: '크리에이트립', role: 'Product Engineer' },
  { period: '2024.06 - 2025.07', company: '주식회사 말달리자', role: 'Frontend Engineer' },
];

export default function About() {
  return (
    <article className="container" aria-labelledby="about-page-title">
      <JsonLd data={createPersonJsonLd()} />
      <h1 id="about-page-title" className="sr-only">
        강병준 소개
      </h1>

      <div className="relative isolate grid grid-cols-1 gap-y-10 overflow-hidden md:gap-y-16 md:py-8">
        <ProfileBackground />

        <section
          className="relative z-10 col-start-1 row-start-1"
          aria-labelledby="about-this-blog"
        >
          <h2
            id="about-this-blog"
            className="text-foreground text-base font-semibold tracking-tight italic"
          >
            About this blog
          </h2>
          <div className="text-foreground dark:text-muted-foreground mt-3 space-y-4 text-base leading-7">
            <p>
              기술을 설명하는 데서 멈추지 않고, 기술을 만나며 생긴 질문과 그 답을 찾아가는 과정을
              기록합니다.
            </p>
            <p>
              무엇을 만들었는지보다 왜 시작했는지, 어디에서 막혔는지, 어떤 선택을 했고 시도와 실패를
              거쳐 어떻게 생각이 변했는지를 솔직하게 담고자 합니다. 각각의 글이 하나의 정답을
              제시하기보다, 비슷한 고민을 가진 누군가가 이야기를 함께 따라가며 자신만의 답을 발견할
              수 있는 기록이 되기를 바랍니다.
            </p>
          </div>
        </section>

        <section
          className="relative z-10 col-start-1 row-start-2 sm:max-w-[75%]"
          aria-labelledby="experience"
        >
          <h2
            id="experience"
            className="text-foreground text-base font-semibold tracking-tight italic"
          >
            Experience
          </h2>
          <ol className="text-foreground dark:text-muted-foreground mt-3 space-y-3 text-base">
            {EXPERIENCES.map(({ period, company, role }) => (
              <li key={period} className="grid gap-x-6 sm:grid-cols-[10.5rem_1fr]">
                <span className="text-muted-foreground text-sm italic tabular-nums sm:text-base">
                  {period}
                </span>
                <span>
                  <span className="text-foreground font-medium">{company}</span> {role}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
