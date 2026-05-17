/**
 * admin SPA 라우트 경로 상수.
 *
 * - page 컴포넌트를 다른 파일이 import 하지 않는다 (§5 P3 정책).
 * - 경로 변경 시 이 파일만 갱신하면 사용처 전체 반영된다.
 */
export const ROUTES = {
  dashboard: '/',
  posts: '/posts',
  postsNew: '/posts/new',
  postEdit: (id: string) => `/posts/${id}/edit`,
} as const;
