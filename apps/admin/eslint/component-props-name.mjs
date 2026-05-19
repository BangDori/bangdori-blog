/**
 * 컴포넌트 props 타입 이름은 `{ComponentName}Props` 를 따른다.
 *
 * 검사 대상:
 *   - PascalCase 함수 선언 / 화살표 함수 변수 (React 함수형 컴포넌트로 간주)
 *   - 첫 파라미터의 타입 어노테이션이 단순 TSTypeReference (식별자 참조)
 *
 * 미검사 (룰 외 영역):
 *   - 인라인 객체 타입: `function Foo(props: { a: string })`
 *   - 제네릭/유틸리티 타입: `function Foo(props: Wrap<T>)` 등 비-Identifier
 *   - 첫 글자 소문자 함수 (hook 등 컴포넌트 아님)
 *
 * interface 든 type alias 든 식별자 이름만으로 매칭하므로 둘 다 같은 룰에 걸린다.
 */

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: '컴포넌트 props 타입 이름은 `{ComponentName}Props` 여야 한다.',
    },
    schema: [],
    messages: {
      mismatch:
        '컴포넌트 `{{component}}` 의 props 타입 이름은 `{{expected}}` 여야 합니다. (현재: `{{actual}}`)',
    },
  },
  create(context) {
    function check(funcNode, componentName) {
      if (!componentName || !/^[A-Z]/.test(componentName)) return;

      const first = funcNode.params?.[0];
      if (!first) return;

      const typeAnnotation = first.typeAnnotation?.typeAnnotation;
      if (!typeAnnotation || typeAnnotation.type !== 'TSTypeReference') return;

      const typeName = typeAnnotation.typeName;
      if (typeName.type !== 'Identifier') return;

      const expected = `${componentName}Props`;
      if (typeName.name !== expected) {
        context.report({
          node: typeName,
          messageId: 'mismatch',
          data: { component: componentName, expected, actual: typeName.name },
        });
      }
    }

    return {
      FunctionDeclaration(node) {
        if (node.id) check(node, node.id.name);
      },
      VariableDeclarator(node) {
        if (
          node.id?.type === 'Identifier' &&
          (node.init?.type === 'ArrowFunctionExpression' ||
            node.init?.type === 'FunctionExpression')
        ) {
          check(node.init, node.id.name);
        }
      },
    };
  },
};

export default {
  files: ['src/**/*.tsx'],
  plugins: {
    local: {
      rules: {
        'component-props-name': rule,
      },
    },
  },
  rules: {
    'local/component-props-name': 'error',
  },
};
