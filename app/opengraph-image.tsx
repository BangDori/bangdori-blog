import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom, #000000, #333333)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '40px',
        }}
      >
        <div
          style={{
            fontSize: 64,
            marginBottom: 40,
            fontWeight: 'bold',
          }}
        >
          강병준 블로그
        </div>
        <div
          style={{
            fontSize: 32,
            maxWidth: '70%',
            textAlign: 'center',
            color: '#cccccc',
          }}
        >
          프론트엔드 개발자 강병준의 개발 블로그입니다.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
