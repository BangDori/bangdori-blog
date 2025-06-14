import { compile } from '@mdx-js/mdx';
import withToc from '@stefanprobst/rehype-extract-toc';
import withTocExport from '@stefanprobst/rehype-extract-toc/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { rehypePrettyCode } from 'rehype-pretty-code';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { getPostBySlug } from '@/domains/post/api/notion';
import { CodeBlock } from './_components/CodeBlock';
import { TableOfContentsLink } from './_components/TableOfContentsLink';
import { VideoOrLink } from './_components/VideoOrLink';

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
    <div className="w-full px-4">
      <section>
        {/* 블로그 헤더 */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{post.title}</h1>
        </div>

        {/* 블로그 본문 */}
        <div className="prose prose-neutral prose-sm dark:prose-invert prose-headings:scroll-mt-[var(--header-height)] flex-1">
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
      <aside className="relative">
        <div className="sticky top-[var(--sticky-top)]">
          <div className="bg-muted/60 space-y-4 rounded-lg p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold">목차</h3>
            <nav className="space-y-3 text-sm">
              {data?.toc?.map((item) => <TableOfContentsLink key={item.id} item={item} />)}
            </nav>
          </div>
        </div>
      </aside>
    </div>
  );
}
