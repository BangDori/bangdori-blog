import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site';

export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          color: '#f8fafc',
          background:
            'radial-gradient(circle at 12% 10%, #334155 0, transparent 36%), linear-gradient(135deg, #020617, #111827)',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, color: '#94a3b8' }}>bangdori.kr</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 800 }}>{SITE.name}</div>
          <div style={{ display: 'flex', fontSize: 34, color: '#cbd5e1' }}>
            기술을 만나며 생긴 질문과 답을 찾아가는 기록
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8' }}>
          Product Engineer · 강병준
        </div>
      </div>
    ),
    size
  );
}
