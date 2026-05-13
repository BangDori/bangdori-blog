import 'dotenv/config';
import { execSync } from 'node:child_process';

/**
 * 통합 테스트 시작 전 한 번 실행.
 * TEST_DATABASE_URL 가리키는 DB에 모든 migration을 적용한다.
 */
export default async function globalSetup(): Promise<void> {
  const url = process.env.TEST_DATABASE_URL;

  if (!url) {
    throw new Error('통합 테스트를 실행하려면 TEST_DATABASE_URL 환경변수가 필요합니다.');
  }

  if (!url.endsWith('_test')) {
    throw new Error("안전하지 않은 TEST_DATABASE_URL입니다. URL이 '_test'로 끝나야 합니다.");
  }

  execSync('pnpm typeorm:ds migration:run', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}
