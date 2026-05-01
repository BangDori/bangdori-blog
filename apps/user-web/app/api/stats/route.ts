import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
  try {
    const redis = await getRedisClient();

    // 오늘 날짜 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // 전체 방문자 수
    const totalVisits = (await redis.get('site:total_visits')) || '0';

    // 오늘 방문자 수
    const todayVisits = (await redis.get(`site:visits:${today}`)) || '0';

    return NextResponse.json({
      totalVisits: parseInt(totalVisits),
      todayVisits: parseInt(todayVisits),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to get stats:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 },
    );
  }
}
