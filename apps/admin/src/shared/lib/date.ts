export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-';

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
