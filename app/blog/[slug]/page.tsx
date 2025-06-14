import { Metadata } from 'next';
import { compile } from '@mdx-js/mdx';
import withToc from '@stefanprobst/rehype-extract-toc';
import withTocExport from '@stefanprobst/rehype-extract-toc/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { rehypePrettyCode } from 'rehype-pretty-code';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { getPostBySlug, getPublishedPosts } from '@/domains/post/api/notion';
import { formatDate } from '@/lib/date';
import { CodeBlock } from './_components/CodeBlock';
import { TableOfContentsLink } from './_components/TableOfContentsLink';
import { VideoOrLink } from './_components/VideoOrLink';

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
      publishedTime: post.date,
      modifiedTime: post.modifiedDate,
      authors: '강병준',
      tags: post.tag,
      images: [{ url: post.coverImage || '', width: 1200, height: 630 }],
    },
  };
}

// 모든 포스트를 미리 생성하여 정적 렌더링 처리
export async function generateStaticParams() {
  const slugs = await getPublishedPosts();
  return slugs.map((post) => ({ slug: post.slug }));
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
    <div className="container">
      <section className="flex flex-col gap-8">
        {/* 블로그 헤더 */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">{post.title}</h1>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground text-sm">
                Posted{' '}
                <b className="font-normal text-black dark:text-white">{formatDate(post.date)}</b>
              </p>
              <span className="text-muted-foreground text-sm">•</span>
              <p className="text-muted-foreground text-sm">
                Updated{' '}
                <b className="font-normal text-black dark:text-white">
                  {formatDate(post.modifiedDate)}
                </b>
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                By <b className="font-normal text-black dark:text-white">강병준</b>
              </p>
            </div>
          </div>
        </div>

        <aside className="w-full">
          <div className="bg-muted/60 space-y-4 rounded-lg p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold">📚 목차</h3>
            <nav className="space-y-3 text-sm">
              {data?.toc?.map((item) => <TableOfContentsLink key={item.id} item={item} />)}
            </nav>
          </div>
        </aside>

        {/* 블로그 본문 */}
        <div className="prose prose-neutral prose-sm dark:prose-invert prose-headings:scroll-mt-[var(--header-height)] xl:prose-base w-full max-w-full flex-1">
          <MDXRemote
            source={markdown}
            components={{ pre: CodeBlock, a: VideoOrLink }}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSanitize, rehypePrettyCode, rehypeSlug],
              },
            }}
          />
        </div>
      </section>
    </div>
  );
}
