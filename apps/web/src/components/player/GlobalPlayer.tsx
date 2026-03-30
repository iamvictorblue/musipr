import { usePlayerStore } from '../../store/player';

const meter = [22, 48, 34, 62, 40, 54, 30, 46];

export function GlobalPlayer() {
  const { currentTrack, isPlaying, toggle } = usePlayerStore();
  const initials = currentTrack?.artist
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <footer className="pointer-events-none fixed bottom-0 left-0 right-0 z-50">
      <div className="pointer-events-auto mx-auto max-w-[1240px] px-4 pb-4">
        <div className="player-shell">
          <div className="flex items-center gap-4">
            <div className="player-art">{initials ?? 'PR'}</div>
            <div>
              <p className="eyebrow">Now playing</p>
              <p className="text-base font-semibold text-white">{currentTrack?.title ?? 'Select a track to start the pulse'}</p>
              <p className="text-sm text-[#9db0ba]">{currentTrack?.artist ?? 'Curated across the Puerto Rico scene'}</p>
            </div>
          </div>
          <div className="hidden min-w-[220px] flex-1 items-center gap-2 lg:flex">
            {meter.map((height, index) => (
              <span
                key={`${height}-${index}`}
                className="wave-bar"
                style={{ height: `${isPlaying ? height : Math.max(18, height / 2)}px` }}
              />
            ))}
          </div>
          <div className="player-actions">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium text-white">{isPlaying ? 'Preview playing' : 'Paused'}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-[#9db0ba]">Scene player</p>
            </div>
            <button type="button" onClick={toggle} className="button-primary">
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
