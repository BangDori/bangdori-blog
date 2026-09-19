export type AudioEvent = 'audio_start' | 'audio_complete' | 'audio_listen';

// One start/completion per mounted player; replays add listening time only.
export function observeAudio(
  audio: HTMLAudioElement,
  // eslint-disable-next-line no-unused-vars -- Names describe callback parameters, not variables.
  emit: (event: AudioEvent, seconds?: number) => void,
  now: () => number = () => performance.now()
) {
  let started = false;
  let completed = false;
  let active = false;
  let lastTime = now();
  let lastPosition = audio.currentTime;
  let lastRate = audio.playbackRate;
  let pending = 0;

  const anchor = () => {
    lastTime = now();
    lastPosition = audio.currentTime;
    lastRate = audio.playbackRate;
  };
  const sample = () => {
    if (active && !audio.seeking) {
      // Media progress caps wall time so stalled playback isn't counted.
      pending += Math.max(
        0,
        Math.min((now() - lastTime) / 1000, (audio.currentTime - lastPosition) / lastRate)
      );
    }
    anchor();
    if (!started || completed || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    let covered = 0;
    const played = audio.played;
    for (let i = 0; i < played.length; i++) covered += played.end(i) - played.start(i);
    if (covered / audio.duration >= 0.9) {
      completed = true;
      emit('audio_complete');
    }
  };
  const flush = () => {
    sample();
    if (pending <= 0) return;
    const seconds = pending;
    pending = 0;
    emit('audio_listen', seconds);
  };
  const playing = () => {
    if (!started) {
      started = true;
      emit('audio_start');
    }
    active = true;
    anchor();
  };
  const stop = () => {
    flush();
    active = false;
  };
  const seeking = () => {
    // currentTime already jumped; played retains the end of the pre-seek segment.
    if (active) {
      const played = audio.played;
      for (let i = 0; i < played.length; i++) {
        if (played.start(i) <= lastPosition && played.end(i) >= lastPosition) {
          pending += Math.max(
            0,
            Math.min((now() - lastTime) / 1000, (played.end(i) - lastPosition) / lastRate)
          );
          break;
        }
      }
    }
    active = false;
    flush();
  };
  const seeked = () => {
    anchor();
    active = started && !audio.paused && !audio.ended && audio.readyState >= 3;
  };
  const update = () => {
    sample();
    if (pending >= 15) flush();
  };
  const hidden = () => {
    if (document.visibilityState === 'hidden') flush();
  };
  const handlers = {
    playing,
    timeupdate: update,
    pause: stop,
    waiting: stop,
    ended: stop,
    error: stop,
    seeking,
    seeked,
    ratechange: sample,
  };
  for (const [event, handler] of Object.entries(handlers)) audio.addEventListener(event, handler);
  document.addEventListener('visibilitychange', hidden);
  window.addEventListener('pagehide', flush);

  return () => {
    stop();
    for (const [event, handler] of Object.entries(handlers))
      audio.removeEventListener(event, handler);
    document.removeEventListener('visibilitychange', hidden);
    window.removeEventListener('pagehide', flush);
  };
}
