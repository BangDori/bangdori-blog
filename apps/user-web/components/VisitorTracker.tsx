'use client';

import { useEffect } from 'react';

const LAST_VISIT_KEY = 'last_visit_date';

function shouldIncrementVisitor(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const today = new Date().toISOString().split('T')[0];
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);

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
    if (shouldIncrementVisitor()) {
      fetch('/api/stats/increment', { method: 'POST' }).catch(() => {});
    }
  }, []);

  return null;
}
