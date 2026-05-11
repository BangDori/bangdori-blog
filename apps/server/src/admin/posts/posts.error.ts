export const PostsError = {
  postNotFound: (id: string) => `게시글을 찾을 수 없습니다. id: ${id}`,
  postDeleteTargetNotFound: (id: string) => `삭제할 게시글을 찾을 수 없습니다. id: ${id}`,
  updateFieldRequired: '수정할 필드를 하나 이상 입력해 주세요.',
} as const;
