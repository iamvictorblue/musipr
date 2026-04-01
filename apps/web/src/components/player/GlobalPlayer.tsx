import { useEffect } from 'react';
import { usePlayerStore } from '../../store/player';

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function ShuffleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3h5v5" />
      <path d="M4 20 21 3" />
      <path d="M21 16v5h-5" />
      <path d="m15 15 6 6" />
      <path d="M4 4l5 5" />
    </svg>
  );
}

function PreviousIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M6 5h2v14H6zM18 6.2v11.6c0 .8-.9 1.3-1.6.8L9 12.8a1 1 0 0 1 0-1.6l7.4-5.8c.7-.5 1.6 0 1.6.8Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M8 5.5v13c0 .8.9 1.3 1.6.8l9-6.5a1 1 0 0 0 0-1.6l-9-6.5c-.7-.5-1.6 0-1.6.8Z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M16 5h2v14h-2zM6 6.2v11.6c0 .8.9 1.3 1.6.8l7.4-5.8a1 1 0 0 0 0-1.6L7.6 5.4C6.9 4.9 6 5.4 6 6.2Z" />
    </svg>
  );
}

function QueueIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 6h12" />
      <path d="M4 12h12" />
      <path d="M4 18h8" />
      <path d="m18 15 3 3-3 3" />
    </svg>
  );
}

function VolumeIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d="m17 9 4 6" />
      <path d="m21 9-4 6" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

export function GlobalPlayer() {
  const {
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    progressSec,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    toggle,
    next,
    previous,
    seek,
    tick,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat
  } = usePlayerStore();

  useEffect(() => {
    if (!isPlaying || !currentTrack) return;

    const interval = window.setInterval(() => {
      tick();
    }, 1000);

    return () => window.clearInterval(interval);
  }, [currentTrack, isPlaying, tick]);

  const durationSec = Math.max(30, currentTrack?.durationSec ?? 210);
  const progressValue = Math.min(progressSec, durationSec);
  const queueLabel = queue.length ? `${currentIndex + 1} of ${queue.length}` : 'Queue empty';

  return (
    <footer className="pointer-events-none fixed bottom-0 left-0 right-0 z-50">
      <div className="pointer-events-auto mx-auto max-w-[1600px] px-3 pb-3">
        <div className="grid gap-4 rounded-[24px] border border-white/10 bg-[#0b0b0be6] px-4 py-3 shadow-[0_16px_44px_rgba(0,0,0,0.34)] backdrop-blur lg:grid-cols-[minmax(0,1fr)_minmax(340px,520px)_minmax(0,1fr)] lg:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-cyan-300 via-blue-500 to-slate-900">
              {currentTrack?.artworkUrl ? (
                <img src={currentTrack.artworkUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-black">
                  {currentTrack?.artist
                    ?.split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() ?? 'PR'}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{currentTrack?.title ?? 'Choose a track to start your queue'}</p>
              <p className="mt-1 truncate text-xs text-zinc-400">{currentTrack?.artist ?? 'MusiPR playback now supports real queue and transport state.'}</p>
              <p className="mt-1 truncate text-[11px] uppercase tracking-[0.18em] text-zinc-500">{currentTrack?.sourceLabel ?? 'Scene player'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={toggleShuffle}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
                  shuffle ? 'bg-cyan-400/14 text-cyan-200' : 'bg-white/[0.05] text-zinc-400 hover:text-white'
                }`}
              >
                <ShuffleIcon />
              </button>
              <button type="button" onClick={previous} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white">
                <PreviousIcon />
              </button>
              <button type="button" onClick={toggle} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:scale-[1.02]">
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button type="button" onClick={next} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white">
                <NextIcon />
              </button>
              <button
                type="button"
                onClick={cycleRepeat}
                className={`inline-flex min-w-[54px] items-center justify-center rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                  repeatMode === 'off' ? 'bg-white/[0.05] text-zinc-400 hover:text-white' : 'bg-cyan-400/14 text-cyan-200'
                }`}
              >
                {repeatMode === 'one' ? 'One' : repeatMode}
              </button>
            </div>
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <span className="text-[11px] font-medium text-zinc-500">{formatDuration(progressValue)}</span>
              <input
                type="range"
                min={0}
                max={durationSec}
                value={progressValue}
                onChange={(event) => seek(Number(event.target.value))}
                className="h-1 w-full cursor-pointer accent-cyan-300"
              />
              <span className="text-[11px] font-medium text-zinc-500">{formatDuration(durationSec)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-400 md:inline-flex">
              <QueueIcon />
              <span>{queueLabel}</span>
            </div>
            <button
              type="button"
              onClick={toggleMute}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <VolumeIcon muted={isMuted} />
            </button>
            <div className="hidden min-w-[140px] items-center gap-3 md:flex">
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="h-1 w-full cursor-pointer accent-cyan-300"
              />
              <span className="w-8 text-right text-xs font-medium text-zinc-500">{volume}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
