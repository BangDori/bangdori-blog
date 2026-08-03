import Image from 'next/image';

export default function About() {
  return (
    <section className="container">
      <div className="mx-auto max-w-2xl py-4 md:py-8">
        <div className="relative isolate overflow-hidden">
          <h1 className="sr-only">강병준</h1>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-full overflow-hidden sm:block sm:w-[72%]"
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
              sizes="(min-width: 640px) 420px, 78vw"
              className="object-cover object-[54%_58%] saturate-100 dark:brightness-75 dark:saturate-75"
              priority
            />
            <div className="from-background/70 via-background/25 dark:from-background dark:via-background/45 absolute inset-0 bg-linear-to-r to-transparent" />
            <div className="from-background/70 dark:from-background absolute inset-y-0 right-0 w-28 bg-linear-to-l to-transparent sm:w-32" />
          </div>

          <div className="relative z-10 space-y-10 sm:max-w-[75%]">
            <section aria-labelledby="currently-working-on">
              <h2
                id="currently-working-on"
                className="text-foreground text-sm font-semibold tracking-tight"
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

            <section aria-labelledby="about-this-blog">
              <h2
                id="about-this-blog"
                className="text-foreground text-sm font-semibold tracking-tight"
              >
                About this blog
              </h2>
              <div className="text-foreground dark:text-muted-foreground mt-3 space-y-4 text-base leading-7">
                <p>
                  기술을 설명하는 데서 멈추지 않고, 기술을 만나며 생긴 질문과 그 답을 찾아가는
                  과정을 이야기처럼 기록합니다. 무엇을 만들었는지보다 왜 시작했는지, 어디서
                  막혔는지, 시도와 실패를 거치며 생각이 어떻게 달라졌는지를 솔직하게 담고자 합니다.
                </p>
                <p>
                  각 글이 하나의 정답을 제시하기보다, 비슷한 고민을 가진 누군가가 이야기를 함께
                  따라가며 자신만의 답을 발견할 수 있는 기록이 되기를 바랍니다.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
