import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getPostShareImage } from './getPostShareImage.ts';

const post = {
  title: 'Getting Things Done',
  slug: '책 이름/#?',
  createdAt: '2026-10-06',
};

test('cover images take priority without fabricated dimensions or altered signed URLs', () => {
  const coverImage = 'https://example.com/book.jpg?signature=original';
  assert.deepEqual(getPostShareImage({ ...post, coverImage }), {
    url: coverImage,
    alt: 'Getting Things Done 대표 이미지',
  });
});

test('fallback image URLs encode slugs and change when Notion content changes', () => {
  const first = getPostShareImage({ ...post, lastEditedAt: '2026-10-06T01:00:00.000Z' });
  const second = getPostShareImage({ ...post, lastEditedAt: '2026-10-06T02:00:00.000Z' });
  const url = new URL(first.url, 'https://www.bangdori.kr');
  assert.equal(url.pathname, `/blog/${encodeURIComponent(post.slug)}/opengraph-image`);
  assert.equal(url.searchParams.get('v'), '2026-10-06T01:00:00.000Z');
  assert.notEqual(first.url, second.url);
  assert.equal(first.width, 1200);
  assert.equal(first.height, 630);
});

test('fallback version uses modification date, then publication date', () => {
  for (const [data, expected] of [
    [post, post.createdAt],
    [{ ...post, updatedAt: '2026-10-07' }, '2026-10-07'],
  ]) {
    const url = new URL(getPostShareImage(data).url, 'https://www.bangdori.kr');
    assert.equal(url.searchParams.get('v'), expected);
  }
});
