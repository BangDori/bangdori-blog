import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site';

export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600;

// 검색 결과 썸네일은 가운데를 정사각형에 가깝게 자르므로 핵심 문구를 가운데 폭 안에 둡니다.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          textAlign: 'center',
          color: '#f8fafc',
          background:
            'radial-gradient(circle at 50% 0%, #334155 0, transparent 55%), linear-gradient(135deg, #020617, #111827)',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, color: '#94a3b8' }}>bangdori.kr</div>
        <div style={{ display: 'flex', fontSize: 80, fontWeight: 800 }}>{SITE.name}</div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: 32,
            lineHeight: 1.4,
            color: '#cbd5e1',
          }}
        >
          <div style={{ display: 'flex' }}>기술을 만나며 생긴 질문과</div>
          <div style={{ display: 'flex' }}>답을 찾아가는 기록</div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8' }}>
          Product Engineer · 강병준
        </div>
      </div>
    ),
    { ...size, headers: { 'Cache-Control': 'public, max-age=3600, must-revalidate' } }
  );
}
