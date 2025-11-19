import { createClient } from 'redis';

// Redis 클라이언트를 재사용하기 위한 싱글톤 패턴
let client: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL,
    });

    client.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Redis Client Error', err);
    });

    await client.connect();
  }

  return client;
}
