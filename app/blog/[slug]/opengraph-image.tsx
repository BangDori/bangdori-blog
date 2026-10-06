import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/domains/post/api/notion';

export const alt = '강병준 블로그 글 대표 이미지';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600;

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postData = await getPostBySlug(slug);

  if (!postData) {
    notFound();
  }

  const { post } = postData;

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(to bottom, #000000, #333333)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          color: 'white',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: '#aaaaaa',
              marginBottom: 20,
            }}
          >
            강병준 블로그
          </div>
          <div
            style={{
              fontSize: post.title.length > 60 ? 48 : 64,
              fontWeight: 'bold',
              marginBottom: 30,
              maxWidth: '100%',
              lineHeight: 1.2,
            }}
          >
            {post.title}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            fontSize: 24,
            color: '#aaaaaa',
          }}
        >
          <div>{post.createdAt}</div>
          <div>{post.tag}</div>
        </div>
      </div>
    ),
    { ...size, headers: { 'Cache-Control': 'public, max-age=3600, must-revalidate' } }
  );
}
