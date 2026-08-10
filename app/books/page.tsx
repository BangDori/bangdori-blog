import type { Metadata } from 'next';
import { GALogger } from '@/components/ga-logger';
import { getBookPosts } from '@/domains/post/api/notion';
import { BookGrid } from '@/domains/post/components/BookGrid';
import { SITE } from '@/lib/site';

export const revalidate = 3600;

const description = '읽고 오래 남은 책과 독후감을 모아둔 책장입니다.';

export const metadata: Metadata = {
  title: '내가 읽은 책',
  description,
  alternates: {
    canonical: '/books',
  },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    siteName: SITE.name,
    title: '내가 읽은 책',
    description,
    url: '/books',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '내가 읽은 책',
    description,
    images: ['/opengraph-image'],
  },
};

export default async function BooksPage() {
  const books = await getBookPosts();

  return (
    <GALogger.OnScroll event={['book_list', { thresholds: [25, 50, 75, 100] }]}>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <h1 className="sr-only">내가 읽은 책</h1>
        {books.length > 0 && <BookGrid books={books} />}
      </div>
    </GALogger.OnScroll>
  );
}
