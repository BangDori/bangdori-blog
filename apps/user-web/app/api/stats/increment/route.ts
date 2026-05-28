import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function POST() {
  try {
    const redis = await getRedisClient();

    const today = new Date().toISOString().split('T')[0];
    await redis.incr('site:total_visits');
    await redis.incr(`site:visits:${today}`);

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to increment stats' }, { status: 500 });
  }
}
