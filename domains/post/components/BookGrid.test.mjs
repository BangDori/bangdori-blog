import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { createElement } from 'react';

const require = createRequire(import.meta.url);
const { outputText } = ts.transpileModule(
  readFileSync(new URL('./BookGrid.tsx', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }
);
const compiled = { exports: {} };
const dependencies = {
  'next-themes': { useTheme: () => ({ resolvedTheme: 'light' }) },
  '@/lib/gtag': { trackClick: () => {} },
  '../utils/lightGeometry': {},
  './BookGrid.module.css': { default: {} },
};
// Keep React, Next Image and the actual component; isolate CSS/theme/analytics only.
new Function('require', 'module', 'exports', outputText)(
  (name) => dependencies[name] ?? require(name),
  compiled,
  compiled.exports
);

test('book covers from unlisted domains render their original URLs without the optimizer', () => {
  const coverImage = 'https://example.com/book.jpg?signature=original';
  const html = renderToStaticMarkup(
    createElement(compiled.exports.BookGrid, {
      books: [{ id: 'book', slug: 'book', title: 'Book', coverImage }],
    })
  );
  assert.ok(html.includes(`src="${coverImage}"`));
  assert.ok(!html.includes('/_next/image'));
});
