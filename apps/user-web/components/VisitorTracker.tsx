'use client';

import { useEffect } from 'react';

const LAST_VISIT_KEY = 'last_visit_date';

function shouldIncrementVisitor(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const today = new Date().toISOString().split('T')[0];
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);

    // 오늘 처음 방문이거나, 마지막 방문 날짜가 다른 경우
    if (!lastVisit || lastVisit !== today) {
      localStorage.setItem(LAST_VISIT_KEY, today);
      return true;
    }

    return false;
  } catch {
    // localStorage 접근 실패 시 (프라이빗 모드 등)
    return false;
  }
}

export function VisitorTracker() {
  useEffect(() => {
    // 오늘 첫 방문이면 사이트 방문자 수 증가
    if (shouldIncrementVisitor()) {
      fetch('/api/stats/increment', { method: 'POST' }).catch(() => {
        // 실패해도 무시
      });
    }
  }, []);

  return null; // 화면에 아무것도 렌더링하지 않음
}
