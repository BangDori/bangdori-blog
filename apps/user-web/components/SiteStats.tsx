'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalVisits: number;
  todayVisits: number;
}

export function SiteStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats(data);
      } catch {
        // 실패해도 무시
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return null;
  }

  return (
    <span className="text-xs font-medium text-black italic dark:text-white">
      {stats.todayVisits.toLocaleString()} / {stats.totalVisits.toLocaleString()}
    </span>
  );
}
