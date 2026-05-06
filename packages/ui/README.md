# @bangdori/ui

공유 UI 패키지. 현재는 디자인 토큰 CSS만 포함.

## 디자인 토큰

`tokens.css` — `DESIGN.md`에서 파생된 CSS 변수. light/dark 모드 포함.

```css
/* apps/admin 등 새 앱에서 사용 */
@import "@bangdori/ui/tokens.css";
```

토큰 수정 시 `DESIGN.md` → `tokens.css` → `apps/*/globals.css` 순으로 동기화.
