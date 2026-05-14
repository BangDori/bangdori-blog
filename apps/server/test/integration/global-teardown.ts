export default async function globalTeardown(): Promise<void> {
  // globalSetup 에서 띄운 Postgres 컨테이너를 정리
  await globalThis.__PG_CONTAINER__?.stop();
  globalThis.__PG_CONTAINER__ = undefined;
}
