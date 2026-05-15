export const ExternalPostsError = {
  externalPostNotFound: (id: string) => `${id}번 외부 글을 찾을 수 없습니다.`,
  externalPostUrlConflict: (url: string) => `이미 등록된 외부 글 URL입니다: ${url}`,
  updateFieldRequired: '수정할 필드를 하나 이상 입력해 주세요.',
} as const;
