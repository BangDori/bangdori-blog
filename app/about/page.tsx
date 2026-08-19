import type { Metadata } from 'next';
import Image from 'next/image';
import { JsonLd } from '@/components/JsonLd';
import { SITE } from '@/lib/site';
import { createPersonJsonLd } from '@/lib/structured-data';

const description =
  'Product Engineer 강병준과 기술을 만나며 생긴 질문, 시도, 실패를 기록하는 이 블로그를 소개합니다.';

export const metadata: Metadata = {
  title: '소개',
  description,
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    type: 'profile',
    locale: SITE.locale,
    siteName: SITE.name,
    title: '강병준 소개',
    description,
    url: '/about',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '강병준 소개',
    description,
    images: ['/opengraph-image'],
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
          className="relative z-10 col-start-1 row-start-1 sm:max-w-[75%]"
          aria-labelledby="currently-working-on"
        >
          <h2
            id="currently-working-on"
            className="text-foreground text-base font-semibold tracking-tight italic"
          >
            Currently working on
          </h2>
          <p className="text-foreground dark:text-muted-foreground mt-3 text-base">
            Product Engineer{' '}
            <a
              href="https://creatrip.com/en"
              className="text-foreground font-medium underline decoration-1 underline-offset-4 transition-opacity hover:opacity-60"
              target="_blank"
              rel="noopener noreferrer"
            >
              @Creatrip
            </a>
          </p>
        </section>

        <section
          className="relative z-10 col-start-1 row-start-2"
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

        <section className="relative z-10 col-start-1 row-start-3" aria-labelledby="where-im-going">
          <h2
            id="where-im-going"
            className="text-foreground text-base font-semibold tracking-tight italic"
          >
            Where I&apos;m going
          </h2>
          <div className="text-foreground dark:text-muted-foreground mt-3 space-y-4 text-base leading-7">
            <p>
              저는 제 전문성을 하나의 기술에 한정하고 싶지 않습니다. 지금은 AI를 다루고 있지만,
              다음에는 Robotics나 아직 이름조차 붙지 않은 분야를 마주할 수도 있습니다.
            </p>
            <p>
              기술이 바뀌어도 제가 좋아하는 일은 같습니다. 함께 일하는 사람들의 어려움을 듣고,
              설명하기 힘들었던 불편을 풀어야 할 문제로 바꾸는 일입니다. 정답이 없을 때 함께 머리를
              맞대고, 작은 시도를 반복하며 어제보다 나은 방식을 찾는 과정도 좋아합니다.
            </p>
            <p>
              제가 바라는 효율은 사람을 줄이는 데 있지 않습니다. 반복적인 부담은 기술에 맡기고,
              사람은 자신의 판단과 강점을 더 잘 발휘할 수 있게 하는 것. 저는 기술로 그런 환경을 만들
              수 있는 사람이 되고 싶습니다.
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}
