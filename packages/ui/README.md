# @bangdori/ui

공유 UI 패키지. 현재는 디자인 토큰 CSS와 본문 prose 오버라이드만 포함.

## 디자인 토큰

`css/tokens.css` — `DESIGN.md`에서 파생된 CSS 변수. light/dark 모드 포함.

```css
/* apps/admin 등 새 앱에서 사용 */
@import "@bangdori/ui/css/tokens.css";
```

토큰 수정 시 `DESIGN.md` → `css/tokens.css` → `apps/*/globals.css` 순으로 동기화.

## prose 오버라이드

`css/prose.css` — Tailwind Typography(`@tailwindcss/typography`) 위에 입히는 본문 룩 (inline code 색, blockquote, img/video 등). user-web 글 본문과 admin 미리보기가 같은 룩을 갖도록 단일 정의로 관리.

```css
/* 호스트 앱 globals.css 예시 */
@import "tailwindcss";
@import "@bangdori/ui/css/tokens.css";
@plugin "@tailwindcss/typography";
@custom-variant dark (&:is(.dark *));
@import "@bangdori/ui/css/prose.css";
```

본문 룩을 수정하려면 이 파일 한 곳만 고치면 양쪽 앱에 반영된다.
