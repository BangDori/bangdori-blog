/**
 * admin 비밀번호 1회용 hash 생성기.
 *
 * 사용:
 *   pnpm --filter server hash-password '실제비번'
 *
 * 출력된 argon2 hash 를 운영 DB users.password_hash 컬럼에 직접 INSERT 한다.
 * 평문 비번은 이 스크립트 실행 순간(터미널 입력 + argon2.hash) 외에는 어디에도 남지 않는다.
 *
 * 예:
 *   INSERT INTO users (email, password_hash, role)
 *   VALUES ('me@bangdori.kr', '$argon2id$v=19$m=...', 'admin');
 */
import * as argon2 from 'argon2';

async function main(): Promise<void> {
  const password = process.argv[2];
  if (!password) {
    // biome-ignore lint/suspicious/noConsole: CLI 스크립트 사용법 출력
    console.error("usage: pnpm --filter server hash-password '<password>'");
    process.exit(1);
  }
  const hash = await argon2.hash(password);
  // biome-ignore lint/suspicious/noConsole: CLI 스크립트 결과 출력
  console.log(hash);
}

main().catch((err) => {
  // biome-ignore lint/suspicious/noConsole: CLI 스크립트 에러 출력
  console.error(err);
  process.exit(1);
});
