import { execSync } from 'node:child_process';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

export default async function globalSetup(): Promise<void> {
  // 모든 migration을 테스트 DB에 적용
  const container = await new PostgreSqlContainer('postgres:16')
    .withDatabase('bangdori_blog_test')
    .withUsername('bangdori')
    .withPassword('1234')
    .start();

  const url = container.getConnectionUri();
  process.env.TEST_DATABASE_URL = url;
  globalThis.__PG_CONTAINER__ = container;

  execSync('pnpm typeorm:ds migration:run', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}
