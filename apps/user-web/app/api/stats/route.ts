import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
  try {
    const redis = await getRedisClient();

    const today = new Date().toISOString().split('T')[0];
    const totalVisits = (await redis.get('site:total_visits')) || '0';
    const todayVisits = (await redis.get(`site:visits:${today}`)) || '0';

    return NextResponse.json({
      totalVisits: parseInt(totalVisits, 10),
      todayVisits: parseInt(todayVisits, 10),
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
