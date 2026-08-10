import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { compile } from '@mdx-js/mdx';
import withToc from '@stefanprobst/rehype-extract-toc';
import withTocExport from '@stefanprobst/rehype-extract-toc/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { rehypePrettyCode } from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { GALogger } from '@/components/ga-logger';
import { JsonLd } from '@/components/JsonLd';
import { Button } from '@/components/ui/button';
import { getPostBySlug, getPublishedPosts } from '@/domains/post/api/notion';
import { formatDate } from '@/lib/date';
import { SITE } from '@/lib/site';
import { createBlogPostingJsonLd, createPostBreadcrumbJsonLd } from '@/lib/structured-data';
import { calculateReadingTime } from '@/lib/utils/calculateReadingTime';
import { Bookmark } from './_components/Bookmark';
import { CodeBlock } from './_components/CodeBlock';
import GiscusComments from './_components/GiscusComments';
import { MarkdownImage } from './_components/MarkdownImage';
import ShareButton from './_components/ShareButton';
import { TableOfContentsLink } from './_components/TableOfContentsLink';
import { VideoOrLink } from './_components/VideoOrLink';
import { ViewCounter } from './_components/ViewCounter';

// 동적 메타데이터 생성
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const postData = await getPostBySlug(slug);

  if (!postData) {
    notFound();
  }

  const { post } = postData;
  const path = `/blog/${encodeURIComponent(post.slug)}`;
  const description = post.description || `${post.title} - 강병준 블로그`;
  const ogImage = `${path}/opengraph-image`;

  return {
    title: post.title,
    description,
    keywords: post.tag,
    authors: [{ name: SITE.author.name, url: '/about' }],
    publisher: SITE.author.name,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: 'article',
      locale: SITE.locale,
      siteName: SITE.name,
      title: post.title,
      description,
      url: path,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt || post.createdAt,
      authors: [SITE.author.name],
      tags: post.tag ? [post.tag] : undefined,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [{ url: ogImage, alt: post.title }],
    },
  };
}

// 모든 포스트를 미리 생성하여 정적 렌더링 처리
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  // External 링크는 정적 생성에서 제외 (외부 URL이므로)
  return posts.filter((post) => post.status !== 'External').map((post) => ({ slug: post.slug }));
}

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  const postData = await getPostBySlug(slug);

  if (!postData) {
    notFound();
  }

  const { markdown, post } = postData;
  const readingMinutes = calculateReadingTime(markdown);

  const { data } = await compile(markdown, {
    rehypePlugins: [rehypeSlug, withToc, withTocExport],
  });

  return (
    <GALogger.OnVisible event={['post', { slug }]}>
      <GALogger.OnScroll event={['post_content', { thresholds: [25, 50, 75, 90], slug }]}>
        <article className="container flex flex-col gap-8" aria-labelledby="post-title">
          <JsonLd data={[createBlogPostingJsonLd(post), createPostBreadcrumbJsonLd(post)]} />
          <section className="flex flex-col gap-8">
            {/* 블로그 헤더 */}
            <header className="space-y-2 sm:space-y-4 md:space-y-6">
              <h1 id="post-title" className="text-2xl font-bold sm:text-3xl md:text-4xl">
                {post.title}
              </h1>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-1">
                  <p className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">
                    <b className="font-normal text-black dark:text-white">{readingMinutes}</b> min
                    read
                  </p>
                  <span className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">•</span>
                  <ViewCounter slug={slug} />
                  <span className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">•</span>
                  <p className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">
                    By <b className="font-normal text-black dark:text-white">강병준</b>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <p className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">
                    Created at{' '}
                    <time
                      dateTime={post.createdAt}
                      className="font-normal text-black dark:text-white"
                    >
                      {formatDate(post.createdAt)}
                    </time>
                  </p>
                  {post.updatedAt && (
                    <>
                      <span className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">
                        •
                      </span>
                      <p className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">
                        Updated at{' '}
                        <time
                          dateTime={post.updatedAt}
                          className="font-normal text-black dark:text-white"
                        >
                          {formatDate(post.updatedAt)}
                        </time>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </header>

            <aside className="w-full" aria-labelledby="table-of-contents-title">
              <div className="bg-muted/60 space-y-4 rounded-lg p-6 backdrop-blur-sm">
                <h2 id="table-of-contents-title" className="text-lg font-semibold">
                  📚 목차
                </h2>
                <nav aria-label="글 목차" className="space-y-3 text-sm">
                  {data?.toc?.map((item) => (
                    <TableOfContentsLink key={item.id} item={item} />
                  ))}
                </nav>
              </div>
            </aside>

            {/* 블로그 본문 */}
            <div className="prose prose-neutral prose-sm dark:prose-invert prose-headings:scroll-mt-[var(--header-height)] xl:prose-base w-full max-w-full flex-1">
              <MDXRemote
                source={markdown}
                components={{ pre: CodeBlock, a: VideoOrLink, img: MarkdownImage, Bookmark }}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [rehypePrettyCode, rehypeSlug],
                  },
                }}
              />
            </div>
          </section>
          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="ghost" asChild>
              <Link href="/" className="text-muted-foreground text-sm">
                글 목록으로 돌아가기
              </Link>
            </Button>
            <ShareButton title={post.title} text={post.description} />
          </div>
          <GALogger.OnVisible event={['comment_area', { slug }]}>
            <section aria-labelledby="comments-title">
              <h2 id="comments-title" className="sr-only">
                댓글
              </h2>
              <GiscusComments />
            </section>
          </GALogger.OnVisible>
        </article>
      </GALogger.OnScroll>
    </GALogger.OnVisible>
  );
}
