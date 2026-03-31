function Cover({
  title,
  accent
}: {
  title: string;
  accent: string;
}) {
  return (
    <div
      className={`aspect-square rounded-2xl border border-white/10 bg-gradient-to-br ${accent} p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}
    >
      <div className="flex h-full items-end">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
          {title.slice(0, 2)}
        </span>
      </div>
    </div>
  );
}

export function ArtistCard({ name, town }: { name: string; town: string }) {
  return (
    <div className="group rounded-[24px] border border-white/10 bg-[#181818] p-4 transition hover:bg-[#202020]">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-300 via-cyan-400 to-blue-500 p-[1px]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#141414] text-xl font-semibold text-white">
            {name.charAt(0)}
          </div>
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-white">{name}</p>
          <p className="mt-1 text-sm text-zinc-400">{town}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-300/80">Artista verificado</p>
        </div>
      </div>
    </div>
  );
}

export function TrackCard({ title, artist }: { title: string; artist: string }) {
  return (
    <div className="group rounded-[24px] border border-white/10 bg-[#181818] p-4 transition hover:bg-[#202020]">
      <Cover title={title} accent="from-fuchsia-500/90 via-orange-400/90 to-yellow-300/90" />
      <p className="mt-4 truncate text-base font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-zinc-400">{artist}</p>
    </div>
  );
}

export function PlaylistCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="group rounded-[24px] border border-white/10 bg-[#181818] p-4 transition hover:bg-[#202020]">
      <Cover title={title} accent="from-indigo-500/90 via-sky-500/80 to-emerald-300/80" />
      <p className="mt-4 truncate text-base font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  );
}

export function EventCard({ title, venue }: { title: string; venue: string }) {
  return (
    <div className="group rounded-[24px] border border-white/10 bg-[#181818] p-4 transition hover:bg-[#202020]">
      <div className="flex aspect-square items-end rounded-2xl border border-white/10 bg-gradient-to-br from-amber-300/80 via-orange-500/70 to-rose-500/70 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-black/70">Live</p>
          <p className="mt-2 text-lg font-semibold text-black">{venue}</p>
        </div>
      </div>
      <p className="mt-4 text-base font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-zinc-400">{venue}</p>
    </div>
  );
}

export function MerchCard({ title, price }: { title: string; price: string }) {
  return (
    <div className="group rounded-[24px] border border-white/10 bg-[#181818] p-4 transition hover:bg-[#202020]">
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-700 via-zinc-900 to-black">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
          Merch
        </div>
      </div>
      <p className="mt-4 text-base font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-zinc-400">{price}</p>
    </div>
  );
}
