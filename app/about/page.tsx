import type { Metadata } from 'next';
import Image from 'next/image';

const description =
  'Product Engineer 강병준과 기술을 만나며 생긴 질문, 시도, 실패를 기록하는 이 블로그를 소개합니다.';

export const metadata: Metadata = {
  title: '강병준 소개',
  description,
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: '강병준 소개',
    description,
    url: '/about',
  },
};

function ProfileBackground() {
  return (
    <div
      className="pointer-events-none relative z-0 hidden w-full overflow-hidden sm:col-start-1 sm:row-start-1 sm:row-end-3 sm:block sm:w-[72%] sm:max-w-[30.25rem] sm:justify-self-end lg:min-h-96"
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
      <h1 id="about-page-title" className="sr-only">
        강병준 소개
      </h1>

      <div className="isolate grid grid-cols-1 gap-y-10 overflow-hidden md:gap-y-16 md:py-8">
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
              이야기처럼 기록합니다. 무엇을 만들었는지보다 왜 시작했는지, 어디서 막혔는지, 시도와
              실패를 거치며 생각이 어떻게 달라졌는지를 솔직하게 담고자 합니다.
            </p>
            <p>
              각 글이 하나의 정답을 제시하기보다, 비슷한 고민을 가진 누군가가 이야기를 함께 따라가며
              자신만의 답을 발견할 수 있는 기록이 되기를 바랍니다.
            </p>
          </div>
        </section>

        <section className="col-start-1 row-start-3" aria-labelledby="lately">
          <h2 id="lately" className="text-foreground text-base font-semibold tracking-tight italic">
            Lately
          </h2>
          <div className="text-foreground dark:text-muted-foreground mt-3 space-y-4 text-base leading-7">
            <p>
              AI가 코드를 더 빠르고 더 잘 만들어낼수록, 개발자에게는 기본기와 자기 판단, 그리고
              사람과 함께 문제를 풀어가는 능력이 더욱 중요해진다고 생각합니다. 그래서 최근에는 AI가
              제시한 답을 그대로 받아들이기보다 코드의 구조와 데이터로 검증하고, 정답이 없는
              문제에서는 스스로의 판단 기준을 세우려고 합니다.
            </p>
            <p>
              다만 충분히 정리된 답을 준비한 뒤에야 생각을 공유하려는 경향이 있어 요즘은 불완전한
              고민도 더 일찍 꺼내놓고, 동료들과 함께 답을 만들어가는 연습을 하고 있습니다.
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}
