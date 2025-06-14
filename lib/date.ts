import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatDate(date: string | Date | undefined) {
  if (!date) return '';

  return format(new Date(date), 'yyyy년 MM월 dd일', { locale: ko });
}
