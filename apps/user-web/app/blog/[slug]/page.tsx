import { compile } from '@mdx-js/mdx';
import withToc from '@stefanprobst/rehype-extract-toc';
import withTocExport from '@stefanprobst/rehype-extract-toc/mdx';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { rehypePrettyCode } from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { GALogger } from '@/components/ga-logger';
import { Button } from '@/components/ui/button';
import { getPostBySlug, getPublishedPosts } from '@/domains/post/api/notion';
import { formatDate } from '@/lib/date';
import { Bookmark } from './_components/Bookmark';
import { CodeBlock } from './_components/CodeBlock';
import CopyLinkButton from './_components/CopyLinkButton';
import GiscusComments from './_components/GiscusComments';
import { MarkdownImage } from './_components/MarkdownImage';
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
  const { post } = await getPostBySlug(slug);

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다',
      description: '요청하신 블로그 포스트를 찾을 수 없습니다.',
    };
  }

  return {
    title: post.title,
    description: post.description || `${post.title} - 강병준 블로그`,
    keywords: post.tag,
    authors: [{ name: '강병준' }],
    publisher: '강병준',
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: '강병준',
      tags: post.tag,
      images: [{ url: post.coverImage || '', width: 1200, height: 630 }],
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
  const { markdown, post } = await getPostBySlug(slug);

  const { data } = await compile(markdown, {
    rehypePlugins: [rehypeSlug, withToc, withTocExport],
  });

  return (
    <GALogger.OnVisible event={['post', { slug }]}>
      <article className="container flex flex-col gap-8">
        <section className="flex flex-col gap-8">
          {/* 블로그 헤더 */}
          <div className="space-y-2 sm:space-y-4 md:space-y-6">
            <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">{post.title}</h1>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-1">
                <p className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">
                  Created at{' '}
                  <b className="font-normal text-black dark:text-white">
                    {formatDate(post.createdAt)}
                  </b>
                </p>
                {post.updatedAt && (
                  <>
                    <span className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">
                      •
                    </span>
                    <p className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">
                      Updated at{' '}
                      <b className="font-normal text-black dark:text-white">
                        {formatDate(post.updatedAt)}
                      </b>
                    </p>
                  </>
                )}
                <span className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">•</span>
                <ViewCounter slug={slug} />
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">
                  By <b className="font-normal text-black dark:text-white">강병준</b>
                </p>
              </div>
            </div>
          </div>

          <aside className="w-full">
            <div className="bg-muted/60 space-y-4 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold">📚 목차</h3>
              <nav className="space-y-3 text-sm">
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
          <CopyLinkButton />
        </div>
        <GALogger.OnVisible event={['comment_area', { slug }]}>
          <GiscusComments />
        </GALogger.OnVisible>
      </article>
    </GALogger.OnVisible>
  );
}
