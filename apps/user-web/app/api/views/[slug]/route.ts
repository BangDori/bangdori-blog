import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

type Params = Promise<{ slug: string }>;

export async function POST(
  request: NextRequest,
  segmentData: { params: Params },
) {
  try {
    const { slug } = await segmentData.params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const redis = await getRedisClient();

    // 게시물 조회수만 증가
    const views = await redis.incr(`post:${slug}:views`);

    return NextResponse.json({ views });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to increment views:', error);
    return NextResponse.json(
      { error: 'Failed to increment views' },
      { status: 500 },
    );
  }
}

export async function GET(
  _request: NextRequest,
  segmentData: { params: Params },
) {
  try {
    const { slug } = await segmentData.params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const redis = await getRedisClient();

    // 게시물 조회수 조회
    const views = (await redis.get(`post:${slug}:views`)) || '0';

    return NextResponse.json({ views: parseInt(views) });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to get views:', error);
    return NextResponse.json(
      { error: 'Failed to get views' },
      { status: 500 },
    );
  }
}
