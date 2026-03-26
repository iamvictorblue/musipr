import { usePlayerStore } from '../../store/player';

export function GlobalPlayer() {
  const { currentTrack, isPlaying, toggle } = usePlayerStore();
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-medium">{currentTrack?.title ?? 'Selecciona un track'}</p>
          <p className="text-xs text-zinc-400">{currentTrack?.artist ?? 'Descubre música puertorriqueña'}</p>
        </div>
        <button onClick={toggle} className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold hover:bg-brand-600">
          {isPlaying ? 'Pausar' : 'Play'}
        </button>
      </div>
    </footer>
  );
}
