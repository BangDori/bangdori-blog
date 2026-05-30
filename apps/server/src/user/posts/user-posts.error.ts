export const UserPostsError = {
  userPostNotFound: (slug: string) => `slug=${slug} 글을 찾을 수 없습니다`,
} as const;
