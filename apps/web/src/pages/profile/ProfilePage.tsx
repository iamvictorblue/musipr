import { useState } from 'react';

type ProfileTab = 'Playlists' | 'Tracks' | 'Reposts';

type TrackItem = {
  title: string;
  meta: string;
  plays: string;
  length: string;
  note: string;
  accent: string;
};

type TrackGroup = {
  eyebrow: string;
  title: string;
  description: string;
  countLabel: string;
  tracks: TrackItem[];
};

type FavoriteArtist = {
  name: string;
  tint: string;
  glow: string;
  mood: string;
  size: string;
  offset: string;
};

type FavoriteTrack = {
  title: string;
  artist: string;
  plays: string;
};

const tabs: ProfileTab[] = ['Playlists', 'Tracks', 'Reposts'];

const favoriteArtists: FavoriteArtist[] = [
  {
    name: 'Amaarae',
    tint: 'from-rose-300 via-fuchsia-400 to-violet-500',
    glow: 'bg-fuchsia-400/20',
    mood: 'Velvet pop',
    size: 'h-[82px] w-[82px]',
    offset: 'mt-1'
  },
  {
    name: 'Rosalia',
    tint: 'from-orange-200 via-rose-300 to-red-500',
    glow: 'bg-rose-300/20',
    mood: 'Heat',
    size: 'h-[76px] w-[76px]',
    offset: 'mt-4'
  },
  {
    name: 'Bad Bunny',
    tint: 'from-yellow-200 via-amber-300 to-orange-500',
    glow: 'bg-amber-300/20',
    mood: 'Late nights',
    size: 'h-[88px] w-[88px]',
    offset: 'mt-0'
  },
  {
    name: 'FKA twigs',
    tint: 'from-cyan-200 via-sky-400 to-indigo-500',
    glow: 'bg-cyan-300/20',
    mood: 'Future',
    size: 'h-[72px] w-[72px]',
    offset: 'mt-5'
  },
  {
    name: 'Tainy',
    tint: 'from-emerald-200 via-teal-400 to-cyan-500',
    glow: 'bg-emerald-300/20',
    mood: 'Studio',
    size: 'h-[80px] w-[80px]',
    offset: 'mt-2'
  }
];

const favoriteTracks: FavoriteTrack[] = [
  { title: 'RINA', artist: 'Luna Li', plays: '148 plays' },
  { title: 'Tu y Yo', artist: 'Buscabulla', plays: '127 plays' },
  { title: 'telepatia', artist: 'Kali Uchis', plays: '116 plays' },
  { title: 'Despecha', artist: 'Rosalia', plays: '103 plays' },
  { title: 'Pasiempre', artist: 'Tainy, Arcangel', plays: '96 plays' }
];

const trackGroups: Record<ProfileTab, TrackGroup> = {
  Playlists: {
    eyebrow: 'Playlists',
    title: 'Curated sets from Luna Costa',
    description:
      'A public mix of her own releases, mood-built sequencing, and recurring favorites from recent listening.',
    countLabel: '5 tracks',
    tracks: [
      {
        title: 'Late Checkout',
        meta: 'Featured in Late Checkout · 2026',
        plays: '184K',
        length: '3:18',
        note: 'Night-drive opener',
        accent: 'from-fuchsia-500/85 via-rose-300/55 to-orange-200/45'
      },
      {
        title: 'After Santurce',
        meta: 'Curated in Island Loop · 2026',
        plays: '902K',
        length: '3:54',
        note: 'Most replayed in this section',
        accent: 'from-cyan-400/85 via-sky-400/55 to-blue-200/45'
      },
      {
        title: 'Blue Concrete',
        meta: 'From Drafts and Demos · 2025',
        plays: '421K',
        length: '2:49',
        note: 'Demo cut',
        accent: 'from-indigo-500/80 via-violet-300/50 to-zinc-200/40'
      },
      {
        title: 'Velvet Exit',
        meta: 'Saved in Visual Reference · 2025',
        plays: '311K',
        length: '3:06',
        note: 'Visual-led sequence',
        accent: 'from-amber-300/70 via-orange-400/55 to-rose-300/40'
      },
      {
        title: 'Noche de Cristal',
        meta: 'Closing track in Late Checkout · 2025',
        plays: '267K',
        length: '4:11',
        note: 'Late set closer',
        accent: 'from-emerald-300/75 via-teal-400/50 to-cyan-200/40'
      }
    ]
  },
  Tracks: {
    eyebrow: 'Tracks',
    title: 'Recent releases and catalog standouts',
    description:
      'The public tracklist leans toward polished singles, collabs, and the songs listeners keep coming back to.',
    countLabel: '5 tracks',
    tracks: [
      {
        title: 'Mirror Signal',
        meta: 'New single · 2026',
        plays: '184K',
        length: '3:18',
        note: 'Latest upload',
        accent: 'from-zinc-200/75 via-fuchsia-400/45 to-violet-500/60'
      },
      {
        title: 'After Santurce',
        meta: 'Single · 2026',
        plays: '902K',
        length: '3:54',
        note: 'Top performer',
        accent: 'from-cyan-300/80 via-blue-500/50 to-indigo-500/55'
      },
      {
        title: 'Blue Concrete',
        meta: 'Collab · 2025',
        plays: '421K',
        length: '2:49',
        note: 'Featuring Mar Azul',
        accent: 'from-sky-200/75 via-slate-500/45 to-zinc-900/75'
      },
      {
        title: 'Velvet Exit',
        meta: 'Single · 2025',
        plays: '311K',
        length: '3:06',
        note: 'Visual favorite',
        accent: 'from-orange-200/70 via-rose-400/50 to-red-500/50'
      },
      {
        title: 'Noche de Cristal',
        meta: 'EP cut · 2025',
        plays: '267K',
        length: '4:11',
        note: 'Fan save magnet',
        accent: 'from-emerald-200/70 via-teal-500/45 to-cyan-500/45'
      }
    ]
  },
  Reposts: {
    eyebrow: 'Reposts',
    title: 'Reposted moments from the wider scene',
    description:
      'Signals from collaborators, collectives, and community picks that sit naturally alongside her own profile.',
    countLabel: '4 tracks',
    tracks: [
      {
        title: 'Rooftop Set',
        meta: 'Reposted from Mar Azul Colectivo',
        plays: '128K',
        length: '4:22',
        note: 'Collective favorite',
        accent: 'from-amber-200/75 via-orange-500/45 to-rose-500/45'
      },
      {
        title: 'Noche en Rio Piedras',
        meta: 'Boosted from Calle Solar',
        plays: '94K',
        length: '3:33',
        note: 'Shared this month',
        accent: 'from-lime-200/75 via-emerald-400/45 to-cyan-500/45'
      },
      {
        title: 'Bahia en VHS',
        meta: 'Shared from Isla Norte',
        plays: '76K',
        length: '2:58',
        note: 'Moodboard pick',
        accent: 'from-violet-200/75 via-indigo-500/45 to-blue-500/45'
      },
      {
        title: 'Linea Costera',
        meta: 'Community pick · reposted',
        plays: '52K',
        length: '3:41',
        note: 'Scene support',
        accent: 'from-cyan-100/75 via-sky-300/45 to-slate-500/55'
      }
    ]
  }
};

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('Playlists');

  const currentGroup = trackGroups[activeTab];

  return (
    <section className="space-y-3 pb-6">
      <section className="relative overflow-hidden rounded-[28px] px-5 pb-4 pt-4 md:px-7 md:pb-5 md:pt-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_50%_14%,rgba(236,72,153,0.16),transparent_26%),radial-gradient(circle_at_50%_26%,rgba(34,211,238,0.1),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10" />

        <div className="relative flex flex-col items-center text-center">
          <div className="relative h-24 w-24 rounded-full border border-white/12 bg-black/15 p-[2px] shadow-[0_18px_44px_rgba(0,0,0,0.22)] sm:h-28 sm:w-28">
            <div className="absolute inset-0 rounded-full bg-fuchsia-400/12 blur-2xl" />
            <div className="absolute -inset-4 rounded-full bg-cyan-400/8 blur-3xl" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-[#141414] text-3xl font-semibold text-white sm:text-4xl">
              LC
            </div>
          </div>

          <div className="mt-4 max-w-2xl">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-500">Artist profile</span>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                Music
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">Luna Costa</h1>
            <p className="mt-1 text-sm text-zinc-400">@lunacosta</p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-300">
              Writing songs, building worlds, and collecting references between sessions, shoots, and late-night edits.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
              <ProfileStat label="Following" value="248" />
              <ProfileStat label="Followers" value="128.4K" />
              <ProfileStat label="Likes" value="412K" />
            </div>

            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200">
                Follow
              </button>
              <button className="rounded-full border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/8">
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="flex gap-6 overflow-x-auto px-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative px-0.5 pb-3 pt-1 text-sm font-medium tracking-[0.02em] transition ${
                tab === activeTab ? 'text-white' : 'text-zinc-500 hover:text-zinc-200'
              }`}
              aria-label={tab === 'Reposts' ? 'Likes' : tab}
            >
              <span className="inline-flex items-center justify-center">
                {tab === 'Reposts' ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20.5s-6.5-4.35-8.5-7.47C1.7 10.17 2.12 6.9 4.97 5.6c2.1-.96 4.31-.18 5.6 1.52C11.85 5.42 14.06 4.64 16.16 5.6c2.85 1.3 3.27 4.57 1.47 7.43C18.5 16.15 12 20.5 12 20.5Z" />
                  </svg>
                ) : (
                  tab
                )}
              </span>
              <span
                className={`absolute inset-x-0 bottom-0 h-[2px] rounded-full transition ${
                  tab === activeTab ? 'bg-white' : 'bg-transparent'
                }`}
              />
            </button>
          ))}
        </div>
      </section>

      <section className="pb-2 pt-1">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">{currentGroup.eyebrow}</p>
            <h2 className="mt-2 text-xl font-semibold text-white">{currentGroup.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{currentGroup.description}</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-400">
            {currentGroup.countLabel}
          </span>
        </div>
      </section>

      <section className="overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,22,22,0.94),rgba(16,16,16,0.98))]">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
          <span>{currentGroup.eyebrow}</span>
          <span>Plays</span>
          <span>Time</span>
        </div>

        {currentGroup.tracks.map((track, index) => (
          <button
            key={`${activeTab}-${track.title}`}
            type="button"
            className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3.5 text-left text-sm transition hover:bg-white/[0.04]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className={`h-12 w-12 shrink-0 rounded-[18px] bg-gradient-to-br ${track.accent} p-[1px]`}>
                <div className="flex h-full w-full items-end rounded-[17px] bg-[#121212] p-2">
                  <span className="text-[11px] font-semibold text-white/72">{String(index + 1).padStart(2, '0')}</span>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="truncate font-medium text-white">{track.title}</p>
                  <span className="text-xs text-zinc-500">{track.note}</span>
                </div>
                <p className="mt-1 truncate text-zinc-400">{track.meta}</p>
              </div>
            </div>

            <span className="text-zinc-400">{track.plays}</span>
            <span className="text-zinc-400">{track.length}</span>
          </button>
        ))}
      </section>

      {activeTab === 'Reposts' ? (
        <section className="pt-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Listening summary</p>
            <h3 className="mt-2 text-xl font-semibold text-white">The sounds shaping Luna this month</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              A public snapshot of current taste and repeat listens. This is about music identity, not uploaded releases.
            </p>
          </div>

          <div className="mt-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">My top artists this month</p>
              <p className="mt-2 text-sm text-zinc-400">Artists that keep showing up in the rotation.</p>
            </div>

            <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-3 md:-mx-7 md:px-7">
              <div className="flex min-w-max items-start gap-2.5 pr-8">
                {favoriteArtists.map((artist) => (
                  <div key={artist.name} className={`shrink-0 text-center ${artist.offset}`}>
                    <div className={`relative mx-auto ${artist.size}`}>
                      <div className={`absolute -inset-1 rounded-full blur-xl ${artist.glow}`} />
                      <div className={`h-full w-full rounded-full bg-gradient-to-br ${artist.tint} p-[1px] shadow-[0_12px_28px_rgba(0,0,0,0.28)]`}>
                        <div className="relative h-full w-full overflow-hidden rounded-full bg-[#111111]">
                          <div className={`absolute inset-0 bg-[radial-gradient(circle_at_28%_24%,rgba(255,255,255,0.34),transparent_24%),linear-gradient(140deg,rgba(255,255,255,0.08),transparent_38%),linear-gradient(180deg,rgba(10,10,10,0.02),rgba(10,10,10,0.52)),var(--tw-gradient-stops)] ${artist.tint}`} />
                          <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-black/60 via-black/18 to-transparent" />
                          <div className="absolute left-1/2 top-[18%] h-[30%] w-[30%] -translate-x-1/2 rounded-full bg-white/42 blur-[1px]" />
                          <div className="absolute left-1/2 top-[36%] h-[44%] w-[56%] -translate-x-1/2 rounded-[999px] bg-black/30" />
                          <div className="absolute inset-x-[17%] bottom-[17%] h-[28%] rounded-[999px] border border-white/15 bg-white/8" />
                          <div className="absolute right-[16%] top-[22%] h-[10%] w-[10%] rounded-full bg-white/20 blur-[2px]" />
                        </div>
                      </div>
                    </div>
                    <p className="mt-2.5 w-[92px] truncate text-sm font-medium text-white">{artist.name}</p>
                    <p className="mt-0.5 w-[92px] truncate text-[11px] text-zinc-500">{artist.mood}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Top 5 tracks this month</p>
              <p className="mt-2 text-sm text-zinc-400">Favorite sounds in heavy rotation right now.</p>

              <div className="mt-3 space-y-0.5">
                {favoriteTracks.map((track, index) => (
                  <div
                    key={track.title}
                    className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-2 border-b border-white/6 py-1.5 last:border-b-0"
                  >
                    <div className="text-[11px] font-semibold text-zinc-500">{String(index + 1).padStart(2, '0')}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-white">{track.title}</p>
                      <p className="truncate text-[12px] text-zinc-400">{track.artist}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-zinc-500">{track.plays}</span>
                  </div>
                ))}
              </div>
          </div>
        </section>
      ) : null}
    </section>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-[72px] flex-col items-center gap-0.5">
      <span className="font-semibold text-white">{value}</span>
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
  );
}
