import { Suspense } from 'react';
import ContactSection from '@/app/_components/ContactSection';
import ProfileSection from '@/app/_components/ProfileSection';
// import TagSection from '@/app/_components/TagSection';
import PostListSkeleton from '@/components/features/blog/PostListSkeleton';
import PostListSuspense from '@/components/features/blog/PostListSuspense';
import { getPublishedPosts, getTags } from '@/lib/notion';
import HeaderSection from './_components/HeaderSection';
import TagSectionClient from './_components/TagSection.client';
import TagSectionSkeleton from './_components/TagSectionSkeleton';

interface HomeProps {
  searchParams: Promise<{ tag?: string; sort?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { tag, sort } = await searchParams;
  const selectedTag = tag || '전체';
  const selectedSort = sort || 'latest';
  // const [posts, tags] = await Promise.all([
  //   getPublishedPosts(selectedTag, selectedSort),
  //   getTags(),
  // ]);

  const tags = getTags();
  const postPromise = getPublishedPosts({ tag: selectedTag, sort: selectedSort });

  return (
    <div className="container py-8">
      <div className="grid grid-cols-[200px_1fr_220px] gap-6">
        {/* 좌측 사이드바 */}
        <aside>
          <Suspense fallback={<TagSectionSkeleton />}>
            <TagSectionClient tags={tags} selectedTag={selectedTag} />
          </Suspense>
          {/* <TagSection tags={tags} selectedTag={selectedTag} /> */}
        </aside>
        <div className="space-y-8">
          {/* 섹션 제목 */}
          <HeaderSection selectedTag={selectedTag} />

          {/* 블로그 카드 그리드 */}
          {/* <PostList posts={posts} /> */}
          <Suspense fallback={<PostListSkeleton />}>
            <PostListSuspense postsPromise={postPromise} />
          </Suspense>
        </div>
        {/* 우측 사이드바 */}
        <aside className="flex flex-col gap-6">
          <ProfileSection />
          <ContactSection />
        </aside>
      </div>
    </div>
  );
}
