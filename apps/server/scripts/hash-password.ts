/**
 * admin 비밀번호 1회용 argon2 hash 생성기.
 *
 * 평문 비밀번호는 stdin 으로만 전달 (argv 는 ps / 쉘 history 에 노출):
 *   printf '%s' '실제비밀번호' | pnpm --filter server hash-password
 *
 * 출력된 hash 를 운영 DB users.password_hash 에 INSERT:
 *   INSERT INTO users (email, password_hash, role)
 *   VALUES ('me@bangdori.kr', '$argon2id$v=19$m=...', 'admin');
 */
import * as argon2 from 'argon2';

async function readPasswordFromStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks)
    .toString('utf8')
    .replace(/\r?\n$/, '');
}

async function main(): Promise<void> {
  const password = await readPasswordFromStdin();
  if (!password) {
    // biome-ignore lint/suspicious/noConsole: CLI 사용법 출력
    console.error("usage: printf '%s' '<password>' | pnpm --filter server hash-password");
    process.exit(1);
  }
  const hash = await argon2.hash(password);
  // biome-ignore lint/suspicious/noConsole: CLI 결과 출력
  console.log(hash);
}

main().catch((err) => {
  // biome-ignore lint/suspicious/noConsole: CLI 에러 출력
  console.error(err);
  process.exit(1);
});
