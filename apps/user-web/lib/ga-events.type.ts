/**
 * GA4 커스텀 이벤트 타입 정의
 *
 * 이벤트는 3종(click, impression, scroll)을 사용하고, target 파라미터로 행위를 구분한다.
 * 페이지 정보(page_location, page_title)는 GA4가 자동 수집한다.
 */

export type ImpressionTarget =
  | 'post' // 글 상세 진입
  | 'comment_area'; // 댓글 영역 노출

export interface ImpressionOptions {
  target: ImpressionTarget;
  slug?: string; // 글 식별자
}

export type ScrollTarget =
  | 'post_content' // 글 본문 스크롤
  | 'post_list'; // 글 목록 스크롤

export interface ScrollOptions {
  target: ScrollTarget;
  percent: number; // 도달한 스크롤 깊이 (%)
  slug?: string; // 글 식별자
}
