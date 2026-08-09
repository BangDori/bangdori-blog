import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateReadingTime } from './calculateReadingTime';

test('빈 글도 최소 1분으로 표시한다', () => {
  assert.equal(calculateReadingTime(''), 1);
});

test('CJK 문자는 분당 500자를 기준으로 올림한다', () => {
  assert.equal(calculateReadingTime('가'.repeat(500)), 1);
  assert.equal(calculateReadingTime('가'.repeat(501)), 2);
});

test('영문은 분당 265단어를 기준으로 올림한다', () => {
  assert.equal(calculateReadingTime(Array(265).fill('word').join(' ')), 1);
  assert.equal(calculateReadingTime(Array(266).fill('word').join(' ')), 2);
});

test('CJK 문자와 영문 단어의 시간을 함께 계산한다', () => {
  const mixedContent = `${'가'.repeat(250)} ${Array(133).fill('word').join(' ')}`;

  assert.equal(calculateReadingTime(mixedContent), 2);
});

test('이미지 열람 시간을 추가한다', () => {
  const images = Array(7).fill('![설명](https://example.com/image.jpg)').join('\n');

  assert.equal(calculateReadingTime(images), 2);
});

test('Markdown 링크 URL과 문법은 단어 수에서 제외한다', () => {
  const words = Array(264).fill('word').join(' ');

  assert.equal(calculateReadingTime(`${words} [label](https://example.com/very/long/url)`), 1);
});
