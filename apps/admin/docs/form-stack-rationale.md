# Form Stack — react-hook-form + zod 도입 배경

`apps/admin`에서 form을 만들 때 표준으로 사용하는 두 라이브러리(`react-hook-form`, `zod`)가 **왜 만들어졌고**, **무엇을 해결하며**, **우리는 어떤 흐름으로 사용하는지**를 정리한다.

## 1. react-hook-form 이전의 React form

처음 React에서 form을 만들 때는 `useState`로 충분하다. 입력값을 state에 들고 `onChange`로 갱신하면 된다. 폼이 작으면 이게 가장 단순한 해법이다.

문제가 시작되는 건 폼이 커질 때 세 가지 압박이 누적되면서다.

1. **모든 입력값을 React state 로 들고 있는 부담**
   - controlled input 패턴은 한 글자 칠 때마다 `setState` → 페이지 전체 리렌더
   - 30개 필드짜리 폼에서는 typing 시 눈에 보이는 지연 발생
2. **validation / touched / dirty / error / submit 상태를 매번 손으로 관리**
   - 모든 폼이 비슷한 로직을 다시 작성 -> boilerplate
3. **라우터·스토어와 폼 상태가 섞임**
   - redux-form은 폼 상태를 아예 Redux store에 박았는데, 그러면 action / reducer / connect까지 끌려 들어와 폼 1개 만드는 데 boilerplate 폭증

이 흐름에서 등장한 도구들:

| 라이브러리 | 특징 | 남은 문제 |
|---|---|---|
| **Redux Form (2015)** | 폼 상태 = global store | boilerplate 폭증, 리렌더 심함 |
| **Formik (2018)** | Redux 없이 React state 로 깔끔히 | 여전히 controlled — 입력 = state 업데이트 = 리렌더. 큰 폼에서 typing 끊김 |
| **Final Form** | subscription 모델로 리렌더 줄임 | API 무겁고 학습 곡선 가파름 |

## 2. react-hook-form 의 해결책

> "리렌더를 안 일으키려면 React state 로 들고 있지 않으면 된다."

rhf는 input을 **uncontrolled**로 처리한다. `register('title')`이 input의 native `ref`를 form 인스턴스에 등록만 해두고, **값은 DOM 의 native value 에서 직접 읽는다**. React state가 없으니 입력 시 컴포넌트 리렌더가 거의 안 일어난다.

부수적으로 따라온 것:

- `useForm` 훅 하나로 끝나는 단순 API (render props / HOC / context 강제 안 함)
- `useWatch`로 "내가 관심 있는 필드만 구독" 하는 subscription 모델 → 글자수 카운터 같은 좁은 영역만 리렌더
- TypeScript generic이 자연스러움 (`useForm<MyType>()`)

즉 rhf는 **"controlled state 가 폼의 본질이 아니다, ref 로도 충분하다"** 는 관점 전환 에서 출발한 라이브러리

## 3. zod 이전의 validation

서버 / 클라 모두에서 흔했던 패턴:

```ts
interface User { name: string; age: number; }

const schema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().min(0),
});
```

문제: **타입 정의와 validation 룰 분산**

interface가 변경되어도 schema는 변경되지 않고, schema 바꿔도 interface는 변경되지 않는다. 즉, 동기화는 사람이 해야 한다 -> 까먹는 순간 런타임 ≠ 컴파일타임 mismatch

이 흐름에서 등장한 도구들:

| 라이브러리 | 특징 | 남은 문제 |
|---|---|---|
| **Joi** (Node 생태계) | 가장 오래된 fluent API | TypeScript-aware 아님 (타입 추론 없음) |
| **Yup** (Formik 과 짝) | 브라우저 친화 | 타입 추론 약함, 복잡한 schema 에서 깨짐 |
| **io-ts** (gcanti) | schema → 타입 추론을 처음 본격 도입 | fp-ts 의존, 함수형 무거움, 학습 곡선 가파름 |
| **class-validator** (NestJS) | 데코레이터로 표현 | 클래스 기반이라 객체 리터럴 / 함수형과 안 어울림. `reflect-metadata` 폴리필 필요 |

## 4. zod 의 해결책

> "schema 한 번 쓰면 타입은 거기서 derive 되어야 한다 (TypeScript-first)"

zod는 schema 자체가 곧 타입의 source of truth

```ts
const userSchema = z.object({
  name: z.string(),
  age: z.number().min(0),
});

type User = z.infer<typeof userSchema>;  // { name: string; age: number }
```

interface를 따로 정의하지 않고 schema에서 추론 -> 한 곳만 바꾸면 양쪽 다 갱신

부수적으로 따라온 것:

- io-ts 같은 fp-ts 의존 없음 → 학습 곡선 낮음
- `.safeParse()`가 discriminated union 반환 (`{ success: true, data } | { success: false, error }`)
  → TypeScript에서 narrowing이 자연스러움
- zero dep, 작고 (v3 ~12KB), tree-shakable
- 데코레이터 / 리플렉션 없음 → 그냥 함수 호출

## 5. 둘이 같이 쓰이는 이유

두 도구가 **서로 다른 문제** 를 풀었기 때문에 자연스럽게 짝이 된다.

- **rhf**: "폼 상태 / 리렌더 / 제출 흐름을 어떻게 가볍게 관리할까"
- **zod**: "validation 룰을 타입과 한 곳에서 어떻게 정의할까"

`@hookform/resolvers` 가 둘 사이의 어댑터다. zod schema를 rhf의 resolver에 연결하면

- rhf 는 "검증 결과만 받아서 `errors` 로 만들어줘" 역할
- zod 는 "검증 로직 + 타입" 역할

책임 분리가 깔끔해서 같이 쓰는 게 흔한 조합이다.