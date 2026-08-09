/**
 * GA4 커스텀 이벤트 타입 정의
 *
 * 이벤트는 click, impression, scroll 3종을 사용하고 target으로 행위를 구분한다.
 * page_location과 page_title은 GA4가 자동 수집한다.
 */

type ImpressionTarget = 'post' | 'comment_area';

export interface ImpressionOptions {
  target: ImpressionTarget;
  slug?: string;
}

type ClickTarget =
  | 'post_card'
  | 'external_post_card'
  | 'outbound_link'
  | 'code_copy'
  | 'toc'
  | 'copy_link'
  | 'social'
  | 'nav'
  | 'theme_toggle'
  | 'image'
  | 'book_card';

export interface ClickOptions {
  target: ClickTarget;
  slug?: string;
  url?: string;
  text?: string;
  title?: string;
  source?: string;
}

type ScrollTarget = 'post_content' | 'post_list' | 'book_list';

export interface ScrollOptions {
  target: ScrollTarget;
  percent: number;
  slug?: string;
}
