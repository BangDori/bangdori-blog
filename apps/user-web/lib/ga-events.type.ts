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

export type ClickTarget =
  | 'post_card' // 글 카드 클릭
  | 'outbound_link' // 외부 링크 클릭
  | 'code_copy' // 코드 블록 복사
  | 'toc' // 목차 항목 클릭
  | 'bookmark' // 북마크 카드 클릭
  | 'copy_link' // 글 링크 복사
  | 'social' // 소셜 링크 클릭
  | 'nav' // 네비게이션 클릭
  | 'theme_toggle' // 테마 토글
  | 'image'; // 이미지 클릭

export interface ClickOptions {
  target: ClickTarget;
  slug?: string; // 글 식별자
  url?: string; // 대상 URL
  text?: string; // 사람이 읽을 수 있는 라벨
}

export type ScrollTarget =
  | 'post_content' // 글 본문 스크롤
  | 'post_list'; // 글 목록 스크롤

export interface ScrollOptions {
  target: ScrollTarget;
  percent: number; // 도달한 스크롤 깊이 (%)
  slug?: string; // 글 식별자
}
