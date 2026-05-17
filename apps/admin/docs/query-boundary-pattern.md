# Query Boundary Pattern

`apps/admin` 의 도메인 컨테이너에서 useQuery 결과의 `loading` / `error` / `empty` / `data` 분기를 선언적으로 표현하는 방법을 명시한다.

## 옵션 A: QueryBoundary (slot props 패턴)

`shared/ui/query-boundary.tsx` 의 generic 컴포넌트가 useQuery 결과를 받아 분기한다. children 은 data 를 받는 render prop.

```ts
<QueryBoundary
  query={query}
  loading={<Notice>불러오는 중…</Notice>}
  error={(err) => <ErrorAlert>{err.message}</ErrorAlert>}
  isEmpty={(data) => data.length === 0}
  empty={<Notice>글이 없습니다.</Notice>}
>
  {(data) => <PostsTable rows={data} ... />}
</QueryBoundary>
```

- 외부 패키지 추가 없음 (react-query 타입만 사용)
- 컨테이너 안에서 if-else 가 사라지고 "어떤 상태에 무엇을 보여줄지" 가 props 로 선언됨
- 다른 도메인 컨테이너에도 동일 패턴 재사용

## 옵션 B: Suspense + ErrorBoundary

React 표준 메커니즘. TanStack Query 의 `useSuspenseQuery` 와 통합.

```ts
<ErrorBoundary fallback={(err) => <ErrorAlert>{err.message}</ErrorAlert>}>
  <Suspense fallback={<Notice>불러오는 중…</Notice>}>
    <PostsListContent filter={filter} onRowClick={onRowClick} />
  </Suspense>
</ErrorBoundary>
```

- 외부 ErrorBoundary 컴포넌트 작성 또는 라이브러리 추가 필요
- 다중 비동기 통합 boundary · code split + 데이터 페칭 코디네이션 · waterfall 방지 · streaming SSR 지원

## 옵션 A 선택 이유

CMS에서 사용되는 도메인 컨테이너는 다음 조건이다.

- 단일 query 사용 (`useListPosts`, `useGetPost` 단독)
- 라우트 단위 code splitting 없음 (`React.lazy` 미사용)
- 다중 비동기 통합이 필요한 view 없음
- streaming SSR 없음
- 헤더·필터는 유지하고 본문만 로딩 표시 → 통합 fallback 이 오히려 방해

Suspense 의 핵심 가치(통합 boundary · code split + 페칭 코디네이션 · waterfall 방지)가 발휘되는 상황이 아니다. 추상화 비용(useSuspenseQuery 교체, ErrorBoundary 컴포넌트 도입, throw 메커니즘 디버깅 부담) 대비 이득이 없다.

옵션 A 는 `shared/ui/query-boundary.tsx` 한 파일(약 25줄) 로 끝나고, 도메인 컨테이너의 if-else 분기를 props 선언으로 바꿔준다.

## 옵션 B 로 전환 고려 조건

다음 중 하나라도 해당되면 Suspense + ErrorBoundary 도입을 검토

1. **다중 비동기 통합 boundary 필요** — 글 본문 + 댓글 + 작성자 같이 한 view 에서 여러 비동기가 ready 되어야 하는 경우
2. **라우트 단위 code splitting** — `React.lazy` 와 데이터 페칭을 한 boundary 로 묶어야 할 때
3. **streaming SSR / RSC 도입**
4. **waterfall 발생** — 자식 컴포넌트가 mount 후 fetch 시작하는 패턴이 누적될 때
5. **에러 boundary 가 트리 위 영역에 필요** — 페이지 단위 통합 에러 처리