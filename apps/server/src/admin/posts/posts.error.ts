export const PostsError = {
  postNotFound: (id: string) => `${id}번 게시글을 찾을 수 없습니다.`,
  postSlugConflict: (slug: string) => `이미 사용 중인 slug 입니다: ${slug}`,
  updateFieldRequired: '수정할 필드를 하나 이상 입력해 주세요.',
} as const;
