/* global globalThis */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { observeAudio } from './audio-analytics.ts';

function setup() {
  globalThis.document = new EventTarget();
  globalThis.window = new EventTarget();
  const audio = Object.assign(new EventTarget(), {
    currentTime: 0,
    duration: 100,
    playbackRate: 1,
    paused: false,
    seeking: false,
    ended: false,
    readyState: 4,
    played: { length: 0, start: () => 0, end: () => 0 },
  });
  let time = 0;
  const events = [];
  const cleanup = observeAudio(
    audio,
    (event, seconds) => events.push({ event, seconds }),
    () => time
  );
  const fire = (event) => audio.dispatchEvent(new Event(event));
  const advance = (
    seconds,
    position = audio.currentTime + seconds * audio.playbackRate,
    update = true
  ) => {
    time += seconds * 1000;
    audio.currentTime = position;
    if (update) fire('timeupdate');
  };
  const ranges = (...pairs) => {
    audio.played = { length: pairs.length, start: (i) => pairs[i][0], end: (i) => pairs[i][1] };
  };
  const count = (name) => events.filter(({ event }) => event === name).length;
  const listened = () => events.reduce((sum, entry) => sum + (entry.seconds ?? 0), 0);
  return { audio, events, fire, advance, ranges, count, listened, cleanup };
}

test('pause, buffering, replay and repeated flush do not inflate counts', () => {
  const s = setup();
  s.fire('playing');
  s.advance(10);
  s.fire('pause');
  s.advance(20, 10);
  s.fire('playing');
  s.advance(5);
  s.fire('waiting');
  s.advance(30, 15);
  s.fire('playing');
  s.advance(5);
  s.fire('pause');
  window.dispatchEvent(new Event('pagehide'));
  s.cleanup();
  assert.equal(s.count('audio_start'), 1);
  assert.equal(s.listened(), 20);
  assert.equal(s.count('audio_complete'), 0);
});

test('2x playback counts wall seconds and completion uses unique played ranges', () => {
  const s = setup();
  s.audio.playbackRate = 2;
  s.fire('playing');
  s.ranges([0, 90]);
  s.advance(45);
  s.fire('pause');
  s.fire('playing');
  s.ranges([0, 100]);
  s.advance(5);
  s.fire('ended');
  s.cleanup();
  assert.equal(s.listened(), 50);
  assert.equal(s.count('audio_complete'), 1);
  assert.equal(s.count('audio_start'), 1);
});

test('seeking to the end is not completion or listening time', () => {
  const s = setup();
  s.fire('playing');
  s.ranges([0, 10]);
  s.advance(10);
  s.audio.seeking = true;
  s.audio.currentTime = 95;
  s.fire('seeking');
  s.advance(20, 95);
  s.audio.seeking = false;
  s.fire('seeked');
  s.ranges([0, 10], [95, 100]);
  s.advance(5);
  s.fire('ended');
  s.cleanup();
  assert.equal(s.listened(), 15);
  assert.equal(s.count('audio_complete'), 0);
});

test('seeking preserves the unsampled tail without counting the jump', () => {
  const s = setup();
  s.fire('playing');
  s.advance(0.5, 0.5, false);
  s.ranges([0, 0.5]);
  s.audio.seeking = true;
  s.audio.currentTime = 95;
  s.fire('seeking');
  s.cleanup();
  assert.equal(s.listened(), 0.5);
  assert.equal(s.count('audio_complete'), 0);
});

test('rate changes, stalls, visibility flush and cleanup preserve only unsent time', () => {
  const s = setup();
  s.fire('playing');
  s.advance(10);
  s.audio.playbackRate = 2;
  s.fire('ratechange');
  s.advance(10);
  s.advance(30, 30);
  document.visibilityState = 'hidden';
  document.dispatchEvent(new Event('visibilitychange'));
  s.advance(5);
  s.cleanup();
  assert.equal(s.listened(), 25);
  assert.equal(s.count('audio_start'), 1);
  s.fire('playing');
  s.advance(20);
  assert.equal(s.listened(), 25);
});
