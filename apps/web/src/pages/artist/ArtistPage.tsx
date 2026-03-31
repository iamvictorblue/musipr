import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

type ArtistTab = 'Playlists' | 'Tracks' | 'Activity' | 'Likes';

type ArtistProfile = {
  name: string;
  tagline: string;
  followers: string;
  totalPlays: string;
  likes: string;
  verified: boolean;
  gradient: string;
  playlists: Array<{
    title: string;
    description: string;
    trackCount: number;
    accent: string;
  }>;
  tracks: Array<{
    title: string;
    meta: string;
    plays: string;
    length: string;
  }>;
  activity: Array<{
    title: string;
    detail: string;
  }>;
  likedTracks: Array<{
    title: string;
    artist: string;
    savedAt: string;
  }>;
};

const tabs: ArtistTab[] = ['Playlists', 'Tracks', 'Activity', 'Likes'];

const artistProfiles: Record<string, ArtistProfile> = {
  'luna-costa': {
    name: 'Luna Costa',
    tagline: 'Alt-pop caribeno, sesiones nocturnas y una identidad visual que cruza escenario y social.',
    followers: '128.4K',
    totalPlays: '9.8M',
    likes: '412K',
    verified: true,
    gradient: 'from-cyan-400/40 via-sky-500/25 to-fuchsia-500/20',
    playlists: [
      {
        title: 'Velvet Coast',
        description: 'Selecciones para arrancar la noche con texturas suaves y energia elegante.',
        trackCount: 18,
        accent: 'from-cyan-300 via-sky-500 to-indigo-600'
      },
      {
        title: 'Afterglow PR',
        description: 'Colaboraciones, demos y cortes que muestran la faceta mas social del proyecto.',
        trackCount: 12,
        accent: 'from-fuchsia-400 via-rose-500 to-orange-400'
      },
      {
        title: 'Casa Norte Sessions',
        description: 'Playlists curadas alrededor de shows, ensayo y favoritos recientes.',
        trackCount: 24,
        accent: 'from-emerald-300 via-teal-400 to-cyan-600'
      }
    ],
    tracks: [
      { title: 'Brisa en Loiza', meta: 'Single · 2026', plays: '2.4M', length: '3:41' },
      { title: 'Cenizas del mar', meta: 'EP · 2025', plays: '1.6M', length: '4:02' },
      { title: 'Mareas de neon', meta: 'Single · 2025', plays: '980K', length: '3:27' },
      { title: 'Postales tarde', meta: 'Collab · 2024', plays: '712K', length: '2:58' }
    ],
    activity: [
      { title: 'Repost reciente', detail: 'Destaco la sesion acustica de Mar Azul Colectivo.' },
      { title: 'Colaboracion', detail: 'Anuncio un live set visual con Calle Solar para abril.' },
      { title: 'Behind the scenes', detail: 'Compartio clips de ensayo y direccion creativa del nuevo drop.' }
    ],
    likedTracks: [
      { title: 'Noche en Rio Piedras', artist: 'Calle Solar', savedAt: 'Guardado esta semana' },
      { title: 'Bahia en VHS', artist: 'Mar Azul Colectivo', savedAt: 'Guardado ayer' },
      { title: 'Arena roja', artist: 'Isla Norte', savedAt: 'Guardado este mes' }
    ]
  }
};

const fallbackArtist = artistProfiles['luna-costa'];

export function ArtistPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<ArtistTab>('Playlists');

  const artist = useMemo(() => {
    if (!id) {
      return fallbackArtist;
    }

    return artistProfiles[id] ?? {
      ...fallbackArtist,
      name: id
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    };
  }, [id]);

  return (
    <section className="space-y-6 pb-6">
      <section
        className={`overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br ${artist.gradient}`}
      >
        <div className="bg-[linear-gradient(180deg,rgba(8,8,8,0.08)_0%,rgba(8,8,8,0.68)_55%,rgba(8,8,8,0.96)_100%)] px-5 py-6 md:px-7 md:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="h-28 w-28 rounded-full border border-white/15 bg-black/35 p-[2px] shadow-[0_18px_60px_rgba(0,0,0,0.35)] sm:h-36 sm:w-36">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#151515] text-4xl font-semibold text-white sm:text-5xl">
                  {artist.name.charAt(0)}
                </div>
              </div>

              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  {artist.verified ? (
                    <span className="inline-flex items-center rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200">
                      Verificado
                    </span>
                  ) : null}
                  <span className="text-xs font-medium uppercase tracking-[0.24em] text-white/60">
                    Artist profile
                  </span>
                </div>

                <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-6xl">{artist.name}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-200/80 md:text-base">{artist.tagline}</p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <StatPill label="Followers" value={artist.followers} />
                  <StatPill label="Total plays" value={artist.totalPlays} />
                  <StatPill label="Likes" value={artist.likes} />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200">
                Follow
              </button>
              <button className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10">
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111111]/90 p-2 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = tab === activeTab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-white text-black' : 'bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        {activeTab === 'Playlists' ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {artist.playlists.map((playlist) => (
              <article
                key={playlist.title}
                className="rounded-[26px] border border-white/10 bg-[#181818] p-4 transition hover:bg-[#202020]"
              >
                <div className={`aspect-[5/4] rounded-[22px] bg-gradient-to-br ${playlist.accent}`} />
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{playlist.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{playlist.description}</p>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                    {playlist.trackCount} tracks
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {activeTab === 'Tracks' ? (
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#161616]">
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.24em] text-zinc-500">
              <span>#</span>
              <span>Track</span>
              <span>Plays</span>
              <span>Length</span>
            </div>

            {artist.tracks.map((track, index) => (
              <div
                key={track.title}
                className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-4 py-4 text-sm transition hover:bg-white/5"
              >
                <span className="w-5 text-zinc-500">{index + 1}</span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{track.title}</p>
                  <p className="mt-1 truncate text-zinc-400">{track.meta}</p>
                </div>
                <span className="text-zinc-400">{track.plays}</span>
                <span className="text-zinc-400">{track.length}</span>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === 'Activity' ? (
          <div className="grid gap-4">
            {artist.activity.map((item) => (
              <article key={item.title} className="rounded-[26px] border border-white/10 bg-[#181818] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Activity</p>
                <h2 className="mt-3 text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{item.detail}</p>
              </article>
            ))}
          </div>
        ) : null}

        {activeTab === 'Likes' ? (
          <div className="grid gap-4">
            {artist.likedTracks.map((track) => (
              <article
                key={`${track.title}-${track.artist}`}
                className="flex items-center justify-between gap-4 rounded-[26px] border border-white/10 bg-[#181818] p-4"
              >
                <div>
                  <p className="text-base font-semibold text-white">{track.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{track.artist}</p>
                </div>
                <span className="text-sm text-zinc-500">{track.savedAt}</span>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
