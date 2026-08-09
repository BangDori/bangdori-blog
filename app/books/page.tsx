import type { Metadata } from 'next';
import { GALogger } from '@/components/ga-logger';
import { getBookPosts } from '@/domains/post/api/notion';
import { BookGrid } from '@/domains/post/components/BookGrid';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: '내가 읽은 책',
  description: '읽고 오래 남은 책과 독후감을 모아둔 책장입니다.',
  alternates: {
    canonical: '/books',
  },
};

export default async function BooksPage() {
  const books = await getBookPosts();

  return (
    <GALogger.OnScroll event={['book_list', { thresholds: [25, 50, 75, 100] }]}>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        {books.length > 0 && <BookGrid books={books} />}
      </div>
    </GALogger.OnScroll>
  );
}
