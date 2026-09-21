/* global globalThis */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { audioExists, getAvailablePostAudioUrl, getPostAudioUrl } from './getPostAudioUrl.ts';

test('server audio links require a successful bounded HEAD check and skip missing URLs', async (t) => {
  const src = 'https://audio.example.com/unit-testing.mp3';
  for (const status of [200, 404, 403, 500, 'timeout']) {
    const fetch = t.mock.method(globalThis, 'fetch', async (url, options) => {
      assert.equal(url, src);
      assert.equal(options.method, 'HEAD');
      assert.equal(options.next.revalidate, 3600);
      assert.ok(options.signal instanceof AbortSignal);
      if (status === 'timeout') throw new DOMException('timed out', 'TimeoutError');
      return new Response(null, { status });
    });
    assert.equal(await getAvailablePostAudioUrl(), undefined);
    assert.equal(fetch.mock.callCount(), 0);
    assert.equal(await getAvailablePostAudioUrl(src), status === 200 ? src : undefined);
    assert.equal(fetch.mock.callCount(), 1);
    fetch.mock.restore();
  }
});

test('only successful HEAD responses enable audio; 404 and server failures stay hidden', async (t) => {
  const signal = new AbortController().signal;
  for (const status of [200, 404, 403, 500]) {
    const fetch = t.mock.method(globalThis, 'fetch', async (url, options) => {
      assert.equal(url, 'https://audio.example.com/unit-testing.mp3');
      assert.equal(options.method, 'HEAD');
      assert.equal(options.cache, 'no-store');
      assert.equal(options.signal, signal);
      return new Response(null, { status });
    });
    assert.equal(
      await audioExists('https://audio.example.com/unit-testing.mp3', signal),
      status === 200
    );
    assert.equal(fetch.mock.callCount(), 1);
    fetch.mock.restore();
  }
});

test('network/CORS failure and aborted requests keep audio hidden', async (t) => {
  for (const error of [
    new TypeError('Failed to fetch'),
    new DOMException('aborted', 'AbortError'),
  ]) {
    const fetch = t.mock.method(globalThis, 'fetch', async () => {
      throw error;
    });
    assert.equal(
      await audioExists('https://audio.example.com/unit-testing.mp3', new AbortController().signal),
      false
    );
    fetch.mock.restore();
  }
});

test('audio is hidden without a configured URL', () => {
  assert.equal(getPostAudioUrl('unit-testing'), undefined);
  assert.equal(getPostAudioUrl('unit-testing', '  '), undefined);
});

test('public HTTPS URLs support custom domains, R2 dev hosts, and key prefixes', () => {
  for (const base of ['https://audio.example.com', 'https://audio.example.com/']) {
    assert.equal(
      getPostAudioUrl('unit-testing', base),
      'https://audio.example.com/unit-testing.mp3'
    );
  }
  assert.equal(
    getPostAudioUrl('unit-testing', 'https://pub-example.r2.dev/blog/'),
    'https://pub-example.r2.dev/blog/unit-testing.mp3'
  );
});

test('slugs are encoded as a single object key', () => {
  const slug = '글 이름/#?';
  assert.equal(
    getPostAudioUrl(slug, 'https://audio.example.com'),
    `https://audio.example.com/${encodeURIComponent(slug)}.mp3`
  );
});

test('malformed, non-HTTPS, authenticated, and signed/query URLs are rejected', () => {
  for (const base of [
    'invalid',
    'http://audio.example.com',
    'javascript:alert(1)',
    'https://user:secret@audio.example.com',
    'https://audio.example.com?token=value',
    'https://audio.example.com#fragment',
  ]) {
    assert.equal(getPostAudioUrl('unit-testing', base), undefined);
  }
});
