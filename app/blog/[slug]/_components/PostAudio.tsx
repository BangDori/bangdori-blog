'use client';

import { Check, LoaderCircle, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { observeAudio } from '@/lib/audio-analytics';
import { trackAudio } from '@/lib/gtag';

function formatTime(seconds: number) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}

export function PostAudio({ slug }: { slug: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const playbackId = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    // Metadata can load before React hydrates the server-rendered audio element.
    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    playbackId.current ??= crypto.randomUUID();
    const id = playbackId.current;
    return observeAudio(audio, (event, seconds) => trackAudio(event, slug, id, seconds));
  }, [slug]);

  async function togglePlayback() {
    const audio = ref.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    setFailed(false);
    try {
      if (audio.error) audio.load();
      await audio.play();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setFailed(true);
      setLoading(false);
      setPlaying(false);
    }
  }

  const progress = duration ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0;

  return (
    <section aria-label="이 글을 음성으로 듣기" className="space-y-3">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={playing ? '녹음 일시정지' : failed ? '녹음 다시 재생' : '녹음 재생'}
          className="hover:bg-muted focus-visible:ring-ring flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {loading ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-3.5 animate-spin motion-reduce:animate-none"
            />
          ) : playing ? (
            <Pause aria-hidden="true" className="size-3.5" fill="currentColor" />
          ) : (
            <Play aria-hidden="true" className="ml-0.5 size-3.5" fill="currentColor" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(position, duration)}
            disabled={!duration || failed}
            aria-label="재생 위치"
            aria-valuetext={`${formatTime(position)} / ${formatTime(duration)}`}
            onChange={(event) => {
              const audio = ref.current;
              if (!audio || !duration) return;
              const value = Number(event.target.value);
              audio.currentTime = value;
              setPosition(value);
            }}
            style={{
              backgroundImage: `linear-gradient(to right, currentColor ${progress}%, var(--border) ${progress}%)`,
              backgroundSize: 'calc(100% - 10px) 2px',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            className="accent-foreground focus-visible:outline-ring block h-6 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-40 [&::-moz-range-thumb]:size-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-current [&::-moz-range-track]:h-0.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:size-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-current"
          />
        </div>
        <span
          aria-hidden="true"
          className="text-muted-foreground shrink-0 text-[11px] whitespace-nowrap tabular-nums"
        >
          {formatTime(position)} / {formatTime(duration)}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`재생 속도 ${rate}배, 변경`}
              className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-ring h-8 w-10 shrink-0 cursor-pointer rounded-md text-xs font-medium tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {rate}×
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={6} className="w-24 min-w-0 rounded-lg p-1">
            <DropdownMenuRadioGroup
              aria-label="재생 속도"
              value={String(rate)}
              onValueChange={(value) => {
                if (ref.current) ref.current.playbackRate = Number(value);
              }}
            >
              {[0.75, 1, 1.25, 1.5, 2].map((value) => (
                <DropdownMenuRadioItem
                  key={value}
                  value={String(value)}
                  className="cursor-pointer justify-between rounded-md px-2 py-2 text-xs tabular-nums [&>span]:hidden"
                >
                  {value}×{rate === value && <Check aria-hidden="true" className="size-3" />}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* biome-ignore lint/a11y/useMediaCaption: 글 본문을 그대로 낭독하며, 같은 페이지의 본문이 동등한 대체 텍스트를 제공합니다. */}
      <audio
        ref={ref}
        preload="metadata"
        src={`/audio/${encodeURIComponent(slug)}.mp3`}
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration;
          setDuration(Number.isFinite(value) ? value : 0);
        }}
        onDurationChange={(event) => {
          const value = event.currentTarget.duration;
          setDuration(Number.isFinite(value) ? value : 0);
        }}
        onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPlaying={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onPause={() => {
          setPlaying(false);
          setLoading(false);
        }}
        onEnded={() => {
          setPlaying(false);
          setLoading(false);
        }}
        onRateChange={(event) => setRate(event.currentTarget.playbackRate)}
        onError={() => {
          setFailed(true);
          setPlaying(false);
          setLoading(false);
        }}
      />
      {failed && (
        <p role="status" className="text-muted-foreground text-sm">
          녹음을 불러오지 못했어요. 재생 버튼을 눌러 다시 시도해 주세요.
        </p>
      )}
    </section>
  );
}
