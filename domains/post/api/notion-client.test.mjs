import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { LogLevel } from '@notionhq/client';
import { RetryingNotionClient } from './notion-client.ts';

function setup(t, statuses, retryAfter) {
  let calls = 0;
  const requests = [];
  t.mock.method(Math, 'random', () => 0);
  const client = new RetryingNotionClient({
    auth: 'test-token',
    logLevel: LogLevel.ERROR,
    fetch: async (url, options) => {
      requests.push({ url, body: options.body });
      const status = statuses[Math.min(calls++, statuses.length - 1)];
      return new Response(
        JSON.stringify(
          status === 200
            ? { results: [] }
            : {
                object: 'error',
                status,
                code: status === 429 ? 'rate_limited' : 'unauthorized',
                message: 'test error',
              }
        ),
        { status, headers: retryAfter === undefined ? {} : { 'retry-after': retryAfter } }
      );
    },
  });
  const query = () =>
    client.databases.query({
      database_id: 'test-database',
      filter: {
        property: 'Slug',
        rich_text: { equals: 'unit-testing' },
      },
    });
  return { client, query, requests, calls: () => calls };
}

test('429 respects Retry-After and preserves the database query on retry', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const s = setup(t, [429, 200], '2');
  const result = s.query();
  await setImmediate();
  t.mock.timers.tick(1999);
  await setImmediate();
  assert.equal(s.calls(), 1);
  t.mock.timers.tick(1);
  assert.deepEqual(await result, { results: [] });
  assert.equal(s.calls(), 2);
  assert.deepEqual(s.requests[0], s.requests[1]);
});

test('persistent 429 stops after three retries and propagates the final error', async (t) => {
  const s = setup(t, [429], '0');
  await assert.rejects(s.query(), { status: 429, code: 'rate_limited' });
  assert.equal(s.calls(), 4);
});

test('non-429 and network errors are not retried', async (t) => {
  const s = setup(t, [401], '0');
  await assert.rejects(s.query(), { status: 401 });
  assert.equal(s.calls(), 1);
  let calls = 0;
  const error = new TypeError('network failure');
  const client = new RetryingNotionClient({
    fetch: async () => {
      calls++;
      throw error;
    },
  });
  await assert.rejects(client.blocks.children.list({ block_id: 'test-block' }), error);
  assert.equal(calls, 1);
});

test('missing or malformed Retry-After uses increasing fallback delays for block reads', async (t) => {
  for (const header of [undefined, 'invalid', '-1']) {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const s = setup(t, [429, 429, 200], header);
    const result = s.client.blocks.children.list({ block_id: 'test-block' });
    await setImmediate();
    t.mock.timers.tick(999);
    await setImmediate();
    assert.equal(s.calls(), 1);
    t.mock.timers.tick(1);
    await setImmediate();
    assert.equal(s.calls(), 2);
    t.mock.timers.tick(1999);
    await setImmediate();
    assert.equal(s.calls(), 2);
    t.mock.timers.tick(1);
    assert.deepEqual(await result, { results: [] });
    assert.equal(s.calls(), 3);
    t.mock.timers.reset();
  }
});
