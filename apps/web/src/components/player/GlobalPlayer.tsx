import { useEffect } from 'react';
import { useState } from 'react';
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

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export function GlobalPlayer() {
  const [queueDrawerOpen, setQueueDrawerOpen] = useState(false);
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
    cycleRepeat,
    playAtIndex,
    removeFromQueue,
    clearQueue
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
  const progressPercent = durationSec ? (progressValue / durationSec) * 100 : 0;

  return (
    <footer className="global-player-shell pointer-events-none fixed bottom-0 left-0 right-0 z-50">
      <div className="pointer-events-auto px-2 pb-2 xl:px-3 xl:pb-3">
        {queueDrawerOpen ? (
          <section className="queue-drawer mb-3 ml-auto max-w-[420px] rounded-[24px] border border-white/10 bg-[#121212f2] p-4 shadow-[0_28px_70px_rgba(0,0,0,0.4)] backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Queue</p>
                <h2 className="mt-2 text-lg font-semibold text-white">{queue.length ? queueLabel : 'Nothing queued yet'}</h2>
                <p className="mt-1 text-sm text-zinc-400">Jump around the queue or trim tracks before the next handoff.</p>
              </div>
              <div className="flex items-center gap-2">
                {queue.length ? (
                  <button type="button" onClick={clearQueue} className="queue-drawer-action">
                    Clear
                  </button>
                ) : null}
                <button type="button" onClick={() => setQueueDrawerOpen(false)} className="queue-drawer-icon" aria-label="Close queue">
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {queue.length ? (
                queue.map((track, index) => {
                  const isCurrent = index === currentIndex;

                  return (
                    <div key={`${track.id}-${index}`} className={`queue-row ${isCurrent ? 'queue-row-current' : ''}`}>
                      <button type="button" onClick={() => playAtIndex(index)} className="queue-row-main">
                        <div className="queue-row-art">
                          {track.artworkUrl ? <img src={track.artworkUrl} alt="" className="h-full w-full object-cover" /> : <span>{track.artist.slice(0, 2).toUpperCase()}</span>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{track.title}</p>
                          <p className="mt-1 truncate text-xs text-zinc-500">{track.artist}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{isCurrent ? 'Now' : String(index + 1).padStart(2, '0')}</p>
                          <p className="mt-1 text-xs text-zinc-400">{formatDuration(Math.max(30, track.durationSec ?? 210))}</p>
                        </div>
                      </button>
                      <button type="button" onClick={() => removeFromQueue(index)} className="queue-row-remove" aria-label={`Remove ${track.title} from queue`}>
                        <CloseIcon />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="search-command-empty px-3 py-4 text-sm text-zinc-400">Play a track, playlist, or artist lane to build your queue here.</div>
              )}
            </div>
          </section>
        ) : null}

        <div className={`player-shell grid gap-4 rounded-[24px] px-4 py-3 lg:grid-cols-[minmax(0,1fr)_minmax(340px,520px)_minmax(0,1fr)] lg:items-center ${currentTrack ? 'player-shell-active' : ''}`}>
          <div className="grid gap-3 sm:hidden">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3">
              <div className={`player-art-ring flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-gradient-to-br from-cyan-300 via-blue-500 to-slate-900 ${isPlaying ? 'player-art-ring-active' : ''}`}>
                {currentTrack?.artworkUrl ? (
                  <img src={currentTrack.artworkUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-black">
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
                <p className="mt-1 truncate text-xs text-zinc-400">{currentTrack?.artist ?? 'Start playback to build your queue.'}</p>
              </div>
              <button
                type="button"
                onClick={() => setQueueDrawerOpen((value) => !value)}
                className={`player-queue-badge inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-zinc-400 ${isPlaying ? 'player-queue-badge-active' : ''}`}
                aria-label="Open queue"
              >
                <QueueIcon />
              </button>
              <button
                type="button"
                onClick={toggleMute}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <VolumeIcon muted={isMuted} />
              </button>
            </div>

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
              <button type="button" onClick={toggle} className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition hover:scale-[1.02]">
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button type="button" onClick={next} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white">
                <NextIcon />
              </button>
              <button
                type="button"
                onClick={cycleRepeat}
                className={`inline-flex min-w-[52px] items-center justify-center rounded-full px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                  repeatMode === 'off' ? 'bg-white/[0.05] text-zinc-400 hover:text-white' : 'bg-cyan-400/14 text-cyan-200'
                }`}
              >
                {repeatMode === 'one' ? '1' : repeatMode === 'all' ? 'ALL' : 'OFF'}
              </button>
            </div>

            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
              <span className="text-[11px] font-medium text-zinc-500">{formatDuration(progressValue)}</span>
              <div className="player-progress-shell">
                <div className="player-progress-track" aria-hidden="true" />
                <div className="player-progress-fill" aria-hidden="true" style={{ width: `${progressPercent}%` }} />
                <input
                  type="range"
                  min={0}
                  max={durationSec}
                  value={progressValue}
                  onChange={(event) => seek(Number(event.target.value))}
                  className="player-progress-input"
                />
              </div>
              <span className="text-[11px] font-medium text-zinc-500">{formatDuration(durationSec)}</span>
            </div>
          </div>

          <div className="hidden min-w-0 items-center gap-3 sm:flex">
            <div className={`player-art-ring flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-cyan-300 via-blue-500 to-slate-900 ${isPlaying ? 'player-art-ring-active' : ''}`}>
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

          <div className="hidden space-y-3 sm:block">
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
              <div className="player-progress-shell">
                <div className="player-progress-track" aria-hidden="true" />
                <div className="player-progress-fill" aria-hidden="true" style={{ width: `${progressPercent}%` }} />
                <input
                  type="range"
                  min={0}
                  max={durationSec}
                  value={progressValue}
                  onChange={(event) => seek(Number(event.target.value))}
                  className="player-progress-input"
                />
              </div>
              <span className="text-[11px] font-medium text-zinc-500">{formatDuration(durationSec)}</span>
            </div>
          </div>

          <div className="hidden flex-wrap items-center justify-end gap-3 sm:flex">
            <button
              type="button"
              onClick={() => setQueueDrawerOpen((value) => !value)}
              className={`player-queue-badge inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-zinc-400 md:h-auto md:w-auto md:gap-2 md:px-3 md:py-2 ${isPlaying ? 'player-queue-badge-active' : ''}`}
              aria-label="Open queue"
            >
              <QueueIcon />
              <span className="hidden md:inline">{queueLabel}</span>
            </button>
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
