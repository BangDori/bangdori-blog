import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function POST() {
  try {
    const redis = await getRedisClient();

    // 오늘 날짜 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // 전체 방문자 수 증가
    await redis.incr('site:total_visits');

    // 오늘 방문자 수 증가
    await redis.incr(`site:visits:${today}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to increment stats:', error);
    return NextResponse.json(
      { error: 'Failed to increment stats' },
      { status: 500 },
    );
  }
}