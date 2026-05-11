export const PostsError = {
  postNotFound: (id: string) => `${id}번 게시글을 찾을 수 없습니다.`,
  postDeleteTargetNotFound: (id: string) => `${id}번 게시글을 찾을 수 없어 삭제할 수 없습니다.`,
  updateFieldRequired: '수정할 필드를 하나 이상 입력해 주세요.',
} as const;
