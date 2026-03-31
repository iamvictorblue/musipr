import { usePlayerStore } from '../../store/player';

export function GlobalPlayer() {
  const { currentTrack, isPlaying, toggle } = usePlayerStore();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 md:grid-cols-[280px_minmax(0,1fr)_220px]">
        <div className="hidden min-w-0 items-center gap-3 md:flex">
          <div className="h-14 w-14 rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{currentTrack?.title ?? 'Brisa en Loiza'}</p>
            <p className="truncate text-xs text-zinc-400">{currentTrack?.artist ?? 'Seleccion local destacada'}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 text-zinc-300">
            <button className="hidden h-9 w-9 rounded-full bg-white/5 text-sm transition hover:bg-white/10 md:inline-flex md:items-center md:justify-center">
              {'<'}
            </button>
            <button
              onClick={toggle}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-black transition hover:scale-105"
            >
              {isPlaying ? 'II' : '>'}
            </button>
            <button className="hidden h-9 w-9 rounded-full bg-white/5 text-sm transition hover:bg-white/10 md:inline-flex md:items-center md:justify-center">
              {'>'}
            </button>
          </div>
          <div className="flex w-full max-w-xl items-center gap-3 text-[11px] text-zinc-500">
            <span>0:00</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 rounded-full bg-white" />
            </div>
            <span>3:16</span>
          </div>
        </div>

        <div className="hidden items-center justify-end gap-3 md:flex">
          <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Vol</span>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-zinc-300" />
          </div>
        </div>
      </div>
    </footer>
  );
}
