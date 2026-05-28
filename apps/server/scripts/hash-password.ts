/**
 * admin 비밀번호 1회용 hash 생성기.
 *
 * 사용 (stdin 으로 전달 — 쉘 history / ps 에 평문이 남지 않는다):
 *   printf '%s' '실제비번' | pnpm --filter server hash-password
 *
 * 출력된 argon2 hash 를 운영 DB users.password_hash 컬럼에 직접 INSERT 한다.
 * 평문 비번은 argv 가 아니라 stdin 으로 전달한다 — argv 는 다른 사용자가
 * `ps` 등으로 볼 수 있고, 쉘 history 에 그대로 남는다.
 *
 * 예:
 *   INSERT INTO users (email, password_hash, role)
 *   VALUES ('me@bangdori.kr', '$argon2id$v=19$m=...', 'admin');
 */
import * as argon2 from 'argon2';

async function readPasswordFromStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8').replace(/\r?\n$/, '');
}

async function main(): Promise<void> {
  const password = await readPasswordFromStdin();
  if (!password) {
    // biome-ignore lint/suspicious/noConsole: CLI 스크립트 사용법 출력
    console.error("usage: printf '%s' '<password>' | pnpm --filter server hash-password");
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
