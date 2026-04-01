import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { type CSSProperties, FormEvent, ReactNode, startTransition, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  useArtistDetailQuery,
  useDiscoveryHomeQuery,
  useDiscoverySearchQuery,
  useEventsQuery,
  useMerchQuery,
  usePlaylistDetailQuery,
  usePlaylistsQuery,
  useReleasesQuery,
  useTrackDetailQuery
} from '../api/catalog';
import { extractApiErrorMessage, type Role } from '../api/client';
import {
  likeTrackRequest,
  savePlaylistRequest,
  saveTrackRequest,
  unlikeTrackRequest,
  unsavePlaylistRequest,
  unsaveTrackRequest,
  useUserLibraryQuery
} from '../api/library';
import { ArtistCard, EventCard, MerchCard, PlaylistCard, TrackCard } from '../components/cards/Cards';
import {
  activityFeed,
  buildArtistDetail,
  buildHomeCatalog,
  buildPlaylistDetail,
  buildSearchCatalog,
  buildTrackDetail,
  cityScenes,
  fallbackArtists,
  fallbackEvents,
  fallbackMerch,
  fallbackPlaylists,
  fallbackReleaseMoments,
  fallbackTracks,
  mapPlaylist,
  mapTrack,
  merchForArtistFallback,
  sceneTags as defaultSceneTags,
  tagsForPlaylist,
  tracksForPlaylistFallback,
  type UiArtist,
  type UiEvent,
  type UiMerch,
  type UiPlaylist,
  type UiReleaseMoment,
  type UiTrack
} from '../data/catalog';
import { useAuthStore } from '../store/auth';
import { useEngagementStore } from '../store/engagement';
import { usePlayerStore } from '../store/player';
import { slugify } from '../utils/slug';

const roleOptions: { label: string; value: Role }[] = [
  { label: 'Listener', value: 'LISTENER' },
  { label: 'Artist', value: 'ARTIST' }
];

function routeForRole(role: Role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'ARTIST') return '/artist/onboarding';
  if (role === 'VERIFIED_ARTIST') return '/artist/dashboard';
  return '/discover';
}

function matchesQuery(query: string, ...values: Array<string | null | undefined>) {
  if (!query) return true;

  const normalizedQuery = query.toLowerCase();
  return values.some((value) => (value ?? '').toLowerCase().includes(normalizedQuery));
}

function formatLibraryStamp(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[#9db0ba] md:text-base">{description}</p>
    </div>
  );
}

function MetricTile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="card p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-5 text-4xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm text-[#9db0ba]">{note}</p>
    </article>
  );
}

function ChipRow({ items, strong = false }: { items: string[]; strong?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={clsx('chip', strong && 'chip-strong')}>
          {item}
        </span>
      ))}
    </div>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20.5c-4.7-3.1-7.8-6-7.8-10.1A4.3 4.3 0 0 1 8.5 6c1.5 0 2.8.7 3.5 1.9A4.14 4.14 0 0 1 15.5 6a4.3 4.3 0 0 1 4.3 4.4c0 4.1-3.1 7-7.8 10.1Z" />
    </svg>
  );
}

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4.5h12a1 1 0 0 1 1 1v14.5l-7-4.3-7 4.3V5.5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function LibraryPillButton({
  active,
  label,
  icon,
  pending,
  onClick
}: {
  active: boolean;
  label: string;
  icon: ReactNode;
  pending?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={clsx('library-pill', active && 'library-pill-active', pending && 'library-pill-pending')}
    >
      <span className="library-pill-icon">{icon}</span>
      <span>{pending ? 'Saving...' : label}</span>
    </button>
  );
}

function TrackLibraryControls({
  trackId,
  liked,
  saved
}: {
  trackId?: string;
  liked: boolean;
  saved: boolean;
}) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!trackId) return;
      return liked ? unlikeTrackRequest(trackId) : likeTrackRequest(trackId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['library', 'me'] });
      void queryClient.invalidateQueries({ queryKey: ['catalog'] });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!trackId) return;
      return saved ? unsaveTrackRequest(trackId) : saveTrackRequest(trackId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['library', 'me'] });
      void queryClient.invalidateQueries({ queryKey: ['catalog'] });
    }
  });

  return (
    <div className="flex flex-wrap gap-2">
      <LibraryPillButton
        active={liked}
        label={liked ? 'Liked' : 'Like'}
        icon={<HeartIcon filled={liked} />}
        pending={likeMutation.isPending}
        onClick={() => likeMutation.mutate()}
      />
      <LibraryPillButton
        active={saved}
        label={saved ? 'Saved' : 'Save'}
        icon={<BookmarkIcon filled={saved} />}
        pending={saveMutation.isPending}
        onClick={() => saveMutation.mutate()}
      />
    </div>
  );
}

function PlaylistSaveControl({ playlistId, saved }: { playlistId?: string; saved: boolean }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!playlistId) return;
      return saved ? unsavePlaylistRequest(playlistId) : savePlaylistRequest(playlistId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['library', 'me'] });
      void queryClient.invalidateQueries({ queryKey: ['catalog'] });
    }
  });

  return (
    <LibraryPillButton
      active={saved}
      label={saved ? 'Saved playlist' : 'Save playlist'}
      icon={<BookmarkIcon filled={saved} />}
      pending={mutation.isPending}
      onClick={() => mutation.mutate()}
    />
  );
}

function LibraryTrackRow({
  index,
  track,
  liked,
  saved,
  stamp
}: {
  index: number;
  track: UiTrack;
  liked: boolean;
  saved: boolean;
  stamp?: string | null;
}) {
  const setTrack = usePlayerStore((state) => state.setTrack);

  return (
    <article className="library-track-row">
      <div className="library-track-main">
        <Link
          to={`/tracks/${slugify(track.title)}`}
          onClick={() =>
            setTrack({
              id: track.id ?? slugify(`${track.artist}-${track.title}`),
              title: track.title,
              artist: track.artist,
              artworkUrl: track.imageSrc,
              sourceLabel: track.tag
            })
          }
          className="library-track-cover"
        >
          {track.imageSrc ? <img src={track.imageSrc} alt="" className="artwork-photo" /> : <div className={`h-full w-full artwork-${track.accent}`} aria-hidden="true" />}
          <div className="library-track-cover-wash" aria-hidden="true" />
          <span className="library-track-index">{String(index + 1).padStart(2, '0')}</span>
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/tracks/${slugify(track.title)}`}
              onClick={() =>
                setTrack({
                  id: track.id ?? slugify(`${track.artist}-${track.title}`),
                  title: track.title,
                  artist: track.artist,
                  artworkUrl: track.imageSrc,
                  sourceLabel: track.tag
                })
              }
              className="library-track-link"
            >
              {track.title}
            </Link>
            {liked ? <span className="library-stamp">Liked</span> : null}
            {saved ? <span className="library-stamp">Saved</span> : null}
          </div>
          <p className="mt-2 text-sm text-[#5c7180]">
            {track.artist}
            {track.genre ? ` | ${track.genre}` : ''}
            {track.town ? ` | ${track.town}` : ''}
          </p>
          <div className="meta-list mt-3">
            <span>{track.plays}</span>
            <span>{track.duration}</span>
            <span>{track.tag}</span>
            {stamp ? <span>Updated {stamp}</span> : null}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <TrackLibraryControls trackId={track.id} liked={liked} saved={saved} />
      </div>
    </article>
  );
}

function MiniTrackRow({
  index,
  title,
  artist,
  plays,
  accent,
  imageSrc
}: {
  index: number;
  title: string;
  artist: string;
  plays: string;
  accent: 'ember' | 'tide' | 'gold';
  imageSrc?: string;
}) {
  const setTrack = usePlayerStore((state) => state.setTrack);

  return (
    <Link
      to={`/tracks/${slugify(title)}`}
      onClick={() =>
        setTrack({
          id: slugify(`${artist}-${title}`),
          title,
          artist,
          artworkUrl: imageSrc,
          sourceLabel: 'Queue pick'
        })
      }
      className="list-card block transition duration-300 hover:-translate-y-1"
    >
      <div className="list-row">
        <div
          className={clsx('mini-cover', !imageSrc && `artwork-${accent}`, imageSrc && 'mini-cover-photo')}
          style={imageSrc ? { backgroundImage: `url(${imageSrc})` } : undefined}
        />
        <div>
          <p className="text-sm text-[#9db0ba]">#{index + 1}</p>
          <p className="mt-1 text-lg font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm text-[#cfd8dc]">{artist}</p>
          <div className="meta-list mt-3">
            <span>{plays}</span>
            <span>saved heavily</span>
          </div>
        </div>
        <span className="button-ghost hidden md:inline-flex">Queue</span>
      </div>
    </Link>
  );
}

function buildPlayerTrackFromUiTrack(track: UiTrack) {
  return {
    id: track.id ?? slugify(`${track.artist}-${track.title}`),
    title: track.title,
    artist: track.artist,
    artworkUrl: track.imageSrc,
    sourceLabel: track.tag
  };
}

function useWindowScrollProgress(limit = 240) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const syncScroll = () => {
      setProgress(Math.min(window.scrollY / limit, 1));
    };

    syncScroll();
    window.addEventListener('scroll', syncScroll, { passive: true });
    return () => window.removeEventListener('scroll', syncScroll);
  }, [limit]);

  return progress;
}

function PlayableTrackTable({
  eyebrow,
  title,
  note,
  tracks
}: {
  eyebrow: string;
  title: string;
  note: string;
  tracks: UiTrack[];
}) {
  const { currentTrack, currentIndex, queue, setQueue } = usePlayerStore((state) => ({
    currentTrack: state.currentTrack,
    currentIndex: state.currentIndex,
    queue: state.queue,
    setQueue: state.setQueue
  }));

  const playerQueue = tracks.map((track) => buildPlayerTrackFromUiTrack(track));

  return (
    <article className="card p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm text-zinc-400">{note}</p>
        </div>
        <span className="button-ghost">{tracks.length} queued</span>
      </div>

      <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
        <div className="grid grid-cols-[40px_minmax(0,1fr)_auto_auto] gap-3 border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
          <span>#</span>
          <span>Title</span>
          <span className="hidden md:block">Plays</span>
          <span>Time</span>
        </div>
        <div className="divide-y divide-white/10">
          {tracks.map((track, index) => {
            const playerTrack = playerQueue[index];
            const isCurrent = currentTrack?.id === playerTrack.id;
            const isQueued = queue.some((item) => item.id === playerTrack.id);

            return (
              <Link
                key={playerTrack.id}
                to={`/tracks/${slugify(track.title)}`}
                onClick={() => setQueue(playerQueue, index, true)}
                className={`track-table-row group grid grid-cols-[40px_minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-3 transition ${
                  isCurrent ? 'bg-cyan-400/[0.08]' : 'hover:bg-white/[0.04]'
                }`}
              >
                <div className="track-row-index flex items-center justify-center text-sm font-semibold text-zinc-400">
                  {isCurrent ? (
                    <span className="track-row-wave text-cyan-200" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                  ) : (
                    <>
                      <span className="track-row-number">{String(index + 1).padStart(2, '0')}</span>
                      <span className="track-row-play" aria-hidden="true">
                        ▶
                      </span>
                    </>
                  )}
                </div>
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={clsx(
                      'track-row-art h-12 w-12 shrink-0 rounded-[14px]',
                      !track.imageSrc && `artwork-${track.accent}`,
                      track.imageSrc && 'mini-cover-photo'
                    )}
                    style={track.imageSrc ? { backgroundImage: `url(${track.imageSrc})` } : undefined}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`truncate text-sm font-semibold ${isCurrent ? 'text-cyan-100' : 'text-white'}`}>{track.title}</p>
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        {isQueued ? 'In queue' : track.tag}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-zinc-400">{track.artist}</p>
                  </div>
                </div>
                <span className="hidden text-sm text-zinc-400 md:block">{track.plays}</span>
                <span className="text-sm text-zinc-400">{track.duration}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function SceneCard({
  city,
  mood,
  accent,
  imageSrc
}: {
  city: string;
  mood: string;
  accent: 'ember' | 'tide' | 'gold';
  imageSrc?: string;
}) {
  return (
    <Link to={`/discover?q=${encodeURIComponent(city)}`} className="spotlight-cell transition duration-300 hover:-translate-y-1">
      <div className={clsx('artwork-shell min-h-[140px]', !imageSrc && `artwork-${accent}`)}>
        {imageSrc ? <img src={imageSrc} alt="" className="artwork-photo" /> : <div className="artwork-grid" aria-hidden="true" />}
        {imageSrc ? <div className="artwork-photo-wash" aria-hidden="true" /> : null}
        <span className="artwork-label">{city}</span>
      </div>
      <div>
        <p className="eyebrow">Scene focus</p>
        <p className="mt-3 text-lg font-semibold text-white">{city}</p>
        <p className="mt-2 text-sm leading-7 text-[#9db0ba]">{mood}</p>
      </div>
    </Link>
  );
}

function ReleaseMoment({
  title,
  artist,
  note,
  accent,
  imageSrc
}: {
  title: string;
  artist: string;
  note: string;
  accent: 'ember' | 'tide' | 'gold';
  imageSrc?: string;
}) {
  return (
    <Link to={`/artists/${slugify(artist)}`} className="card block p-5 transition duration-300 hover:-translate-y-1">
      <div className={clsx('artwork-shell', !imageSrc && `artwork-${accent}`)}>
        {imageSrc ? <img src={imageSrc} alt="" className="artwork-photo" /> : <div className="artwork-grid" aria-hidden="true" />}
        {imageSrc ? <div className="artwork-photo-wash" aria-hidden="true" /> : null}
        <span className="artwork-label">{title}</span>
      </div>
      <div className="mt-4">
        <p className="text-xl font-semibold text-white">{artist}</p>
        <p className="mt-2 text-sm text-[#9db0ba]">{note}</p>
        <div className="mt-4 tiny-stat">
          <span>Campaign ready</span>
          <span className="text-[#f7c66d]">High priority</span>
        </div>
      </div>
    </Link>
  );
}

function FeatureLink({
  to,
  accent,
  eyebrow,
  title,
  note,
  imageSrc
}: {
  to: string;
  accent: 'ember' | 'tide' | 'gold';
  eyebrow: string;
  title: string;
  note: string;
  imageSrc?: string;
}) {
  return (
    <Link to={to} className="cover-link">
      <div className={clsx('cover-link-art', !imageSrc && `artwork-${accent}`)} aria-hidden="true">
        {imageSrc ? <img src={imageSrc} alt="" className="cover-link-photo" /> : null}
      </div>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <p className="mt-2 text-lg font-semibold text-white">{title}</p>
        <p className="mt-2 text-sm leading-6 text-[#9db0ba]">{note}</p>
      </div>
    </Link>
  );
}

function DetailBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300">
      {label}
    </span>
  );
}

function DetailMetric({
  label,
  value,
  note
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{note}</p>
    </article>
  );
}

function SimplePage({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="space-y-8">
      <div className="hero-panel">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display-title mt-4">{title}</h1>
        <p className="section-copy mt-4 max-w-2xl">{description}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <MetricTile label="Signal" value="High" note="The page now shares the same premium visual language as the rest of the app." />
        <MetricTile label="Focus" value="Clear" note="Hierarchy is stronger, so the surface feels intentional instead of placeholder-heavy." />
        <MetricTile label="Next" value="Ready" note="This scaffold can grow into a real workflow without another redesign pass." />
      </div>
    </section>
  );
}

function QuickPickTile({
  to,
  title,
  meta,
  accent
}: {
  to: string;
  title: string;
  meta: string;
  accent: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 overflow-hidden rounded-[20px] border border-white/10 bg-[#1b1b1b] transition hover:bg-[#252525]"
    >
      <div className={`h-20 w-20 shrink-0 bg-gradient-to-br ${accent}`} />
      <div className="min-w-0 pr-4">
        <p className="truncate text-base font-semibold text-white">{title}</p>
        <p className="mt-1 truncate text-sm text-zinc-400">{meta}</p>
      </div>
    </Link>
  );
}

function LandingPageLegacy() {
  const homeQuery = useDiscoveryHomeQuery();
  const { artists, tracks, playlists, events, merch, releaseMoments, sceneTags } = buildHomeCatalog(homeQuery.data);
  const leadArtist = artists[0] ?? fallbackArtists[0];
  const leadPlaylist = playlists[0] ?? fallbackPlaylists[0];
  const leadMerch = merch[0] ?? fallbackMerch[0];
  const leadEvent = events[0] ?? fallbackEvents[0];
  const featuredTracks = tracks.slice(0, 4);
  const featuredArtists = artists.slice(0, 3);
  const featuredEvents = events.slice(0, 2);
  const featuredMerch = merch.slice(0, 2);
  const releaseBoard = releaseMoments.slice(0, 2);

  return (
    <section className="space-y-8">
      <div className="home-ledger">
        {activityFeed.slice(0, 4).map((item) => (
          <div key={item} className="ledger-item">
            <span className="ledger-kicker">Selling now</span>
            <span className="ledger-copy">{item}</span>
          </div>
        ))}
      </div>

      <div className="home-hero-grid">
        <div className="hero-panel home-feature">
          <p className="eyebrow">Puerto Rico music daily</p>
          <div className="hero-rule mt-5" aria-hidden="true" />
          <h1 className="display-title mt-4 max-w-4xl">A brighter, more editorial front page for Puerto Rican music, artist worlds, and scene momentum.</h1>
          <p className="section-copy mt-5 max-w-2xl">
            MusiPR now follows the strongest patterns from Bandcamp, Spotify, and SoundCloud without copying them outright: cleaner
            hierarchy, faster browsing, stronger creator emphasis, and a homepage that feels published instead of assembled.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/discover" className="button-primary">
              Explore the catalog
            </Link>
            <Link to={`/artists/${slugify(leadArtist.name)}`} className="button-secondary">
              Read the lead artist story
            </Link>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="hero-stat">
              <span className="hero-stat-value">12.4K</span>
              <span className="hero-stat-label">monthly listeners in the {leadArtist.name} orbit</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">76</span>
              <span className="hero-stat-label">fresh releases, shows, and merch moments on deck this week</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">1</span>
              <span className="hero-stat-label">connected surface for listening, discovery, tickets, and artist support</span>
            </div>
          </div>
          <div className="mt-8">
            <p className="eyebrow">Scenes moving now</p>
            <div className="mt-3">
              <ChipRow items={sceneTags} strong />
            </div>
          </div>
        </div>

        <div className="home-side-stack">
          <article className="card editorial-card feature-story-card p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">Lead story</p>
              <Link to={`/artists/${slugify(leadArtist.name)}`} className="button-ghost">
                Artist profile
              </Link>
            </div>
            <div className="feature-story-media mt-5">
              <div className={clsx('artwork-shell feature-story-art', !leadArtist.imageSrc && `artwork-${leadArtist.accent}`)}>
                {leadArtist.imageSrc ? <img src={leadArtist.imageSrc} alt="" className="artwork-photo" /> : null}
                <div className="artwork-photo-wash" aria-hidden="true" />
                <span className="artwork-label">{leadArtist.name}</span>
              </div>
              <div className="feature-story-copy">
                <p className="eyebrow">Release week dispatch</p>
                <p className="mt-3 text-3xl font-semibold text-white">{leadArtist.name} is turning a release cycle into a full artist world.</p>
                <p className="mt-3 text-sm leading-7 text-[#9db0ba]">
                  {leadArtist.bio ??
                    'The homepage gives the lead story more room to hold music, identity, merch, and live momentum in one authored frame.'}
                </p>
              </div>
            </div>
          </article>

          <article className="card sidebar-note p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">Start here</p>
              <Link to="/discover" className="button-ghost">
                Open discovery
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {[
                'Search artists, songs, playlists, scenes, and merch from one header.',
                `${leadPlaylist.title} keeps the editorial side of the catalog feeling human and sequence-aware.`,
                `${leadEvent.title} shows how release, community, and ticketing now live in one flow.`
              ].map((item) => (
                <div key={item} className="feed-row">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5">
              <ChipRow items={['search-first', 'artist-friendly', 'scene coverage', 'merch + tickets']} />
            </div>
          </article>
        </div>
      </div>
      <section className="section-frame">
        <div className="section-frame-head">
          <SectionHeading
            eyebrow="New and notable"
            title="A home screen with clearer rails, stronger hierarchy, and more reasons to keep browsing."
            description="Bandcamp brings editorial warmth, Spotify brings scanning speed, and SoundCloud brings creator utility. This front page now combines those strengths into one local music system."
          />
          <Link to="/releases" className="button-secondary">
            View release board
          </Link>
        </div>
        <div className="catalog-matrix">
          <article className="card track-chart p-6">
            <div className="chart-header">
              <div>
                <p className="eyebrow">Trending tracks</p>
                <p className="mt-3 text-2xl font-semibold text-white">The local chart right now</p>
              </div>
              <Link to="/discover?q=trending" className="button-ghost">
                Browse all
              </Link>
            </div>
            <div className="chart-list mt-5">
              {featuredTracks.map((track, index) => (
                <MiniTrackRow
                  key={track.title}
                  index={index}
                  title={track.title}
                  artist={track.artist}
                  plays={track.plays}
                  accent={track.accent}
                  imageSrc={track.imageSrc}
                />
              ))}
            </div>
          </article>

          <div className="grid gap-5 md:grid-cols-2">
            {featuredTracks.slice(0, 2).map((track) => (
              <TrackCard key={track.title} {...track} />
            ))}
            {releaseBoard.map((release) => (
              <ReleaseMoment key={release.title} {...release} />
            ))}
          </div>

          <div className="home-side-stack">
            <article className="card release-note-card p-6">
              <p className="eyebrow">Release board</p>
              <div className="mt-5 space-y-4">
                {releaseBoard.map((release) => (
                  <Link key={release.title} to={`/artists/${slugify(release.artist)}`} className="cover-link">
                    <div className={clsx('cover-link-art', !release.imageSrc && `artwork-${release.accent}`)} aria-hidden="true">
                      {release.imageSrc ? <img src={release.imageSrc} alt="" className="cover-link-photo" /> : null}
                    </div>
                    <div>
                      <p className="eyebrow">Upcoming moment</p>
                      <p className="mt-2 text-lg font-semibold text-white">{release.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[#9db0ba]">{release.note}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </article>

            <FeatureLink
              to="/merch"
              accent={leadMerch.accent}
              eyebrow="Merch focus"
              title={leadMerch.title}
              note={`${leadMerch.price} - ${leadMerch.edition}`}
              imageSrc={leadMerch.imageSrc}
            />
            <FeatureLink
              to="/shows"
              accent={leadEvent.accent}
              eyebrow="Live focus"
              title={leadEvent.title}
              note={`${leadEvent.venue} - ${leadEvent.date}`}
              imageSrc={leadEvent.imageSrc}
            />
          </div>
        </div>
      </section>
      <div className="section-grid xl:grid-cols-[0.92fr_1.08fr]">
        <article className="card scene-file p-6">
          <SectionHeading
            eyebrow="Scene file"
            title="What the local feed is saying right now."
            description="The strongest music front pages read like dispatches from an active culture. MusiPR now gives those shifts a proper place to live."
          />
          {false && (
        <SectionHeading eyebrow="Scene briefing" title="What the local feed is saying right now." description="Bandcamp’s strongest front page moments feel like dispatches. This section now does more of that work for MusiPR." />
          )}
          <div className="story-copy-list mt-5 space-y-3">
            {[
            'Santurce listeners are pushing synth-forward records back into the front page.',
            'Merch movement is strongest when a release story and a live date land in the same week.',
            'Editorial playlist placement is shaping saves faster than a plain release grid.',
            'Search is no longer a utility corner; it is part of the main music browsing loop.'
          ].map((item) => (
            <div key={item} className="feed-row">
              {item}
            </div>
          ))}
        </div>
      </article>
      <div className="scene-city-grid">
        {cityScenes.map((scene) => (
          <SceneCard key={scene.city} {...scene} />
        ))}
      </div>
    </div>
    <div className="section-grid xl:grid-cols-[1.05fr_0.95fr]">
      <article className="card p-6">
        <SectionHeading
          eyebrow="Artist spotlight"
          title="Local voices deserve a homepage that feels authored, not autogenerated."
          description="Artist cards now sit beside playlists and scene notes so music discovery feels closer to a living publication than a grid of interchangeable modules."
        />
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {featuredArtists.map((artist) => (
            <ArtistCard key={artist.name} {...artist} />
          ))}
        </div>
      </article>
      <article className="card playlist-notebook p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Playlist notebook</p>
            <p className="mt-3 text-2xl font-semibold text-white">{leadPlaylist.title}</p>
          </div>
          <Link to={`/playlists/${slugify(leadPlaylist.title)}`} className="button-ghost">
            Open mix
          </Link>
        </div>
        <div className="mt-5">
          <PlaylistCard {...leadPlaylist} />
        </div>
        <div className="mt-5 space-y-3">
          {[
            'Curator voice and mood should matter as much as utility.',
            'Playlists need enough visual weight to feel like destinations.',
            'This mix now anchors the softer, more human side of discovery.'
          ].map((item) => (
            <div key={item} className="feed-row">
              {item}
            </div>
          ))}
        </div>
      </article>
    </div>

    <div className="section-grid xl:grid-cols-[1.02fr_0.98fr]">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Live and merch"
          title="Shows and physical goods now sit in the same visual language as the music."
          description="That makes artist support feel native to the product instead of bolted on after the fact."
        />
        <div className="grid gap-5">
          {featuredEvents.map((event) => (
            <EventCard key={event.title} {...event} />
          ))}
        </div>
      </div>
      <div className="grid gap-5">
        {featuredMerch.map((item) => (
          <MerchCard key={item.title} {...item} />
        ))}
      </div>
    </div>
    </section>
  );
}

function DiscoverPageLegacy() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const homeCatalog = buildHomeCatalog(useDiscoveryHomeQuery().data);
  const searchCatalog = buildSearchCatalog(useDiscoverySearchQuery(query).data);
  const catalogArtists = query ? searchCatalog.artists : homeCatalog.artists;
  const catalogTracks = query ? searchCatalog.tracks : homeCatalog.tracks;
  const catalogPlaylists = query ? searchCatalog.playlists : homeCatalog.playlists;
  const catalogEvents = query ? searchCatalog.events : homeCatalog.events;
  const catalogMerch = query ? searchCatalog.merch : homeCatalog.merch;
  const filteredArtists = catalogArtists.filter((artist) => matchesQuery(query, artist.name, artist.town, artist.genre));
  const filteredTracks = catalogTracks.filter((track) => matchesQuery(query, track.title, track.artist, track.tag, track.plays));
  const filteredPlaylists = catalogPlaylists.filter((playlist) => matchesQuery(query, playlist.title, playlist.description, playlist.count));
  const filteredEvents = catalogEvents.filter((event) => matchesQuery(query, event.title, event.venue, event.date));
  const filteredMerch = catalogMerch.filter((item) => matchesQuery(query, item.title, item.price, item.edition));
  const filteredReleaseMoments = homeCatalog.releaseMoments.filter((release) => matchesQuery(query, release.title, release.artist, release.note));
  const filteredCityScenes = cityScenes.filter((scene) => matchesQuery(query, scene.city, scene.mood));
  const filteredSceneTags = homeCatalog.sceneTags.filter((item) => matchesQuery(query, item));
  const filteredActivityFeed = activityFeed.filter((item) => matchesQuery(query, item));
  const resultCount =
    filteredArtists.length +
    filteredTracks.length +
    filteredPlaylists.length +
    filteredEvents.length +
    filteredMerch.length +
    filteredReleaseMoments.length +
    filteredCityScenes.length +
    filteredActivityFeed.length;

  return (
    <section className="space-y-8">
      <SectionHeading
        eyebrow={query ? 'Search results' : 'Discover'}
        title={query ? `Results for "${query}"` : 'A browse flow designed like a music magazine with a pulse.'}
        description={
          query
            ? `${resultCount} catalog signals matched your search across tracks, artists, playlists, shows, merch, and release moments.`
            : 'Collections, releases, and live events now sit in the same visual language so discovery feels curated instead of accidental.'
        }
      />
      <ChipRow
        items={(query ? filteredSceneTags : ['new and notable', 'selling now', 'editorial picks', 'live this week', 'vinyl + merch', 'by location']).slice(0, 6)}
        strong
      />
      {query ? (
        <article className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Connected search</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#9db0ba]">
              The global header search now routes here and filters the catalog in-place, so the discovery surface finally behaves like a real product.
            </p>
          </div>
          <Link to="/discover" className="button-secondary">
            Clear search
          </Link>
        </article>
      ) : null}
      {resultCount === 0 ? (
        <article className="card p-6">
          <p className="eyebrow">No matches yet</p>
          <h3 className="mt-4 text-3xl font-semibold text-white">Nothing in the catalog matched that search.</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#9db0ba]">
            Try an artist like Luna Costa, a city like Santurce, or a format like merch or live.
          </p>
          <div className="mt-6">
            <Link to="/discover" className="button-primary">
              Reset browse
            </Link>
          </div>
        </article>
      ) : (
        <>
          {filteredArtists.length ? (
            <>
              <SectionHeading
                eyebrow="Artists"
                title={query ? 'Artists matching your search' : 'Voices shaping the catalog right now.'}
                description="Artist cards now link directly into richer profile worlds, so discovery can keep flowing deeper."
              />
              <div className="grid gap-5 md:grid-cols-3">{filteredArtists.map((artist) => <ArtistCard key={artist.name} {...artist} />)}</div>
            </>
          ) : null}
          {filteredTracks.length ? (
            <div className="section-grid xl:grid-cols-[1.05fr_0.95fr]">
              <article className="card p-6">
                <p className="eyebrow">{query ? 'Matching tracks' : 'New and notable'}</p>
                <div className="mt-4 space-y-4">
                  {filteredTracks.map((track, index) => (
                    <MiniTrackRow key={track.title} index={index} title={track.title} artist={track.artist} plays={track.plays} accent={track.accent} imageSrc={track.imageSrc} />
                  ))}
                </div>
              </article>
              <div className="grid gap-5 md:grid-cols-2">
                {filteredTracks.map((track) => <TrackCard key={track.title} {...track} />)}
              </div>
            </div>
          ) : null}
          {filteredPlaylists.length ? <div className="grid gap-5 xl:grid-cols-3">{filteredPlaylists.map((playlist) => <PlaylistCard key={playlist.title} {...playlist} />)}</div> : null}
          {(filteredCityScenes.length || filteredEvents.length) ? (
            <div className="section-grid xl:grid-cols-[0.95fr_1.05fr]">
              <div className="spotlight-rail md:grid-cols-3 xl:grid-cols-1">
                {filteredCityScenes.map((scene) => (
                  <SceneCard key={scene.city} {...scene} />
                ))}
              </div>
              <div className="grid gap-5 md:grid-cols-2">{filteredEvents.map((event) => <EventCard key={event.title} {...event} />)}</div>
            </div>
          ) : null}
          {(filteredReleaseMoments.length || filteredActivityFeed.length) ? (
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-5 md:grid-cols-3">
                {filteredReleaseMoments.map((release) => (
                  <ReleaseMoment key={release.title} {...release} />
                ))}
              </div>
              <article className="card p-6">
                <p className="eyebrow">Selling and resonating</p>
                <div className="mt-4 space-y-3">
                  {filteredActivityFeed.map((item) => (
                    <div key={item} className="feed-row">{item}</div>
                  ))}
                </div>
              </article>
            </div>
          ) : null}
          {filteredMerch.length ? (
            <>
              <SectionHeading eyebrow="Merch" title="Artist-linked drops with stronger product gravity." description="Search can now surface commerce alongside music and events, which makes the platform feel much more complete." />
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredMerch.map((item) => <MerchCard key={item.title} {...item} />)}</div>
            </>
          ) : null}
        </>
      )}
    </section>
  );
}

export function LandingPage() {
  const homeQuery = useDiscoveryHomeQuery();
  const { artists, tracks, playlists, events, merch, releaseMoments } = buildHomeCatalog(homeQuery.data);
  const featuredTracks = (tracks.length ? tracks : fallbackTracks).slice(0, 4);
  const featuredArtists = (artists.length ? artists : fallbackArtists).slice(0, 3);
  const featuredPlaylists = (playlists.length ? playlists : fallbackPlaylists).slice(0, 2);
  const featuredEvents = (events.length ? events : fallbackEvents).slice(0, 2);
  const featuredMerch = (merch.length ? merch : fallbackMerch).slice(0, 2);
  const releaseBoard = (releaseMoments.length ? releaseMoments : fallbackReleaseMoments).slice(0, 2);

  const quickPicks = [
    {
      title: featuredPlaylists[0]?.title ?? 'Mix de madrugada',
      meta: featuredPlaylists[0]?.description ?? 'Indie + electronica suave',
      accent: 'from-fuchsia-500 to-orange-400',
      to: `/playlists/${slugify(featuredPlaylists[0]?.title ?? 'Mix de madrugada')}`
    },
    {
      title: 'Radar de Santurce',
      meta: 'Escena local en movimiento',
      accent: 'from-cyan-400 to-blue-500',
      to: '/discover?q=Santurce'
    },
    {
      title: featuredTracks[0]?.title ?? 'Sesion Alt Caribe',
      meta: featuredTracks[0]?.artist ?? 'Seleccion curada',
      accent: 'from-emerald-400 to-teal-500',
      to: `/tracks/${slugify(featuredTracks[0]?.title ?? 'Sesion Alt Caribe')}`
    },
    {
      title: releaseBoard[0]?.title ?? 'Nuevos estrenos',
      meta: releaseBoard[0]?.note ?? 'Lo que acaba de caer',
      accent: 'from-violet-500 to-indigo-500',
      to: '/releases'
    },
    {
      title: featuredEvents[0]?.title ?? 'Shows de la semana',
      meta: featuredEvents[0]?.venue ?? 'En vivo por toda la isla',
      accent: 'from-amber-300 to-orange-500',
      to: '/shows'
    },
    {
      title: featuredMerch[0]?.title ?? 'Merch y vinilos',
      meta: featuredMerch[0]?.price ?? 'Drops limitados',
      accent: 'from-zinc-500 to-zinc-800',
      to: '/merch'
    }
  ];

  return (
    <section className="space-y-10">
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-400">Hecho para ti</p>
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Buenas noches</h1>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {quickPicks.map((item) => (
          <QuickPickTile key={item.title} {...item} />
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Quick picks</h2>
            <p className="mt-1 text-sm text-zinc-400">Tus accesos rapidos para volver a lo que ya te estaba gustando.</p>
          </div>
          <Link to="/discover" className="text-sm font-medium text-zinc-400 hover:text-white">
            Ver todo
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featuredTracks.slice(0, 2).map((track) => (
            <TrackCard key={track.title} {...track} />
          ))}
          {featuredPlaylists.map((playlist) => (
            <PlaylistCard key={playlist.title} {...playlist} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Artistas destacados</h2>
            <p className="mt-1 text-sm text-zinc-400">Voces y proyectos que estan empujando la escena local.</p>
          </div>
          <Link to="/discover?q=artists" className="text-sm font-medium text-zinc-400 hover:text-white">
            Ver todo
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featuredArtists.map((artist) => (
            <ArtistCard key={artist.name} {...artist} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Nuevos drops</h2>
            <p className="mt-1 text-sm text-zinc-400">Estrenos, playlists y fechas para seguir explorando sin salir de portada.</p>
          </div>
          <Link to="/releases" className="text-sm font-medium text-zinc-400 hover:text-white">
            Ver todo
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featuredTracks.slice(2, 4).map((track) => (
            <TrackCard key={track.title} {...track} />
          ))}
          {releaseBoard.map((release) => (
            <PlaylistCard
              key={release.title}
              title={release.title}
              description={`${release.artist} | ${release.note}`}
              count="Release moment"
              accent={release.accent}
              imageSrc={release.imageSrc}
            />
          ))}
          {featuredEvents.slice(0, 1).map((event) => (
            <EventCard key={event.title} {...event} />
          ))}
          {featuredMerch.slice(0, 1).map((item) => (
            <MerchCard key={item.title} {...item} />
          ))}
        </div>
      </section>
    </section>
  );
}

export function DiscoverPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const homeCatalog = buildHomeCatalog(useDiscoveryHomeQuery().data);
  const searchCatalog = buildSearchCatalog(useDiscoverySearchQuery(query).data);
  const catalogArtists = query ? searchCatalog.artists : homeCatalog.artists;
  const catalogTracks = query ? searchCatalog.tracks : homeCatalog.tracks;
  const catalogPlaylists = query ? searchCatalog.playlists : homeCatalog.playlists;
  const catalogEvents = query ? searchCatalog.events : homeCatalog.events;
  const catalogMerch = query ? searchCatalog.merch : homeCatalog.merch;
  const filteredArtists = catalogArtists.filter((artist) => matchesQuery(query, artist.name, artist.town, artist.genre));
  const filteredTracks = catalogTracks.filter((track) => matchesQuery(query, track.title, track.artist, track.tag, track.plays));
  const filteredPlaylists = catalogPlaylists.filter((playlist) => matchesQuery(query, playlist.title, playlist.description, playlist.count));
  const filteredEvents = catalogEvents.filter((event) => matchesQuery(query, event.title, event.venue, event.date));
  const filteredMerch = catalogMerch.filter((item) => matchesQuery(query, item.title, item.price, item.edition));
  const filteredReleaseMoments = homeCatalog.releaseMoments.filter((release) => matchesQuery(query, release.title, release.artist, release.note));
  const resultCount =
    filteredArtists.length +
    filteredTracks.length +
    filteredPlaylists.length +
    filteredEvents.length +
    filteredMerch.length +
    filteredReleaseMoments.length;

  return (
    <section className="page-stagger space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-400">{query ? 'Search results' : 'Descubrimiento'}</p>
        <h2 className="text-2xl font-semibold text-white">{query ? `Resultados para "${query}"` : 'Descubrimiento'}</h2>
        <p className="max-w-3xl text-sm text-zinc-400">
          {query
            ? `${resultCount} resultados entre tracks, artistas, playlists, shows, merch y estrenos.`
            : 'Un browse surface mas cercano a la rama de tu buddy: rapido de escanear, oscuro, y enfocado en volver a poner musica.'}
        </p>
      </div>

      {query ? (
        <article className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Connected search</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
              The global search in the new shell still routes here, but the results now sit in a simpler, branch-like browse layout.
            </p>
          </div>
          <Link to="/discover" className="button-secondary">
            Clear search
          </Link>
        </article>
      ) : null}

      {resultCount === 0 ? (
        <article className="card p-6">
          <p className="eyebrow">No matches yet</p>
          <h3 className="mt-4 text-3xl font-semibold text-white">Nothing in the catalog matched that search.</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            Try an artist like Luna Costa, a city like Santurce, or a format like merch or live.
          </p>
          <div className="mt-6">
            <Link to="/discover" className="button-primary">
              Reset browse
            </Link>
          </div>
        </article>
      ) : (
        <>
          {filteredTracks.length ? (
            <>
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-white">{query ? 'Matching tracks' : 'Tracks'}</h3>
                  <p className="mt-1 text-sm text-zinc-400">Lo mas facil para volver a poner ahora mismo.</p>
                </div>
                <Link to="/liked-songs" className="text-sm font-medium text-zinc-400 hover:text-white">
                  Tus likes
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {filteredTracks.slice(0, 8).map((track) => (
                  <TrackCard key={track.title} {...track} />
                ))}
              </div>
              <article className="card p-6">
                <p className="eyebrow">{query ? 'Queue from results' : 'Queue from discovery'}</p>
                <div className="mt-4 space-y-4">
                  {filteredTracks.slice(0, 5).map((track, index) => (
                    <MiniTrackRow key={track.title} index={index} title={track.title} artist={track.artist} plays={track.plays} accent={track.accent} imageSrc={track.imageSrc} />
                  ))}
                </div>
              </article>
            </>
          ) : null}

          {filteredPlaylists.length ? (
            <section className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-white">Playlists</h3>
                  <p className="mt-1 text-sm text-zinc-400">Curated rows and mood-built sequences.</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {filteredPlaylists.slice(0, 8).map((playlist) => <PlaylistCard key={playlist.title} {...playlist} />)}
              </div>
            </section>
          ) : null}

          {filteredArtists.length ? (
            <section className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-white">Artists</h3>
                  <p className="mt-1 text-sm text-zinc-400">Voices shaping the scene right now.</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {filteredArtists.slice(0, 6).map((artist) => <ArtistCard key={artist.name} {...artist} />)}
              </div>
            </section>
          ) : null}

          {(filteredEvents.length || filteredMerch.length) ? (
            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-white">Shows</h3>
                <div className="grid gap-4">
                  {filteredEvents.slice(0, 2).map((event) => <EventCard key={event.title} {...event} />)}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-white">Merch</h3>
                <div className="grid gap-4">
                  {filteredMerch.slice(0, 2).map((item) => <MerchCard key={item.title} {...item} />)}
                </div>
              </div>
            </section>
          ) : null}

          {filteredReleaseMoments.length ? (
            <section className="space-y-4">
              <h3 className="text-2xl font-semibold text-white">Upcoming moments</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {filteredReleaseMoments.slice(0, 4).map((release) => (
                  <PlaylistCard
                    key={release.title}
                    title={release.title}
                    description={`${release.artist} | ${release.note}`}
                    count="Release moment"
                    accent={release.accent}
                    imageSrc={release.imageSrc}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </section>
  );
}

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout, signup } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('admin@musipr.local');
  const [password, setPassword] = useState('AdminPass123!');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('LISTENER');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectPath =
    typeof location.state === 'object' &&
    location.state &&
    'from' in location.state &&
    typeof (location.state as { from?: unknown }).from === 'string'
      ? (location.state as { from: string }).from
      : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (mode === 'signup' && password !== confirmPassword) return setError('Passwords must match.');
    if (mode === 'signup' && !termsAccepted) return setError('Please accept the terms to create your account.');
    setIsSubmitting(true);
    try {
      const session = mode === 'login' ? await login({ email, password }) : await signup({ email, password, role, termsAccepted });
      const nextPath = redirectPath && redirectPath !== '/login' ? redirectPath : routeForRole(session.user.role);
      startTransition(() => navigate(nextPath, { replace: true }));
    } catch (requestError) {
      setError(extractApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-stagger space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,31,56,0.92),rgba(11,11,11,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
        <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-8">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Session entry</p>
              <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">
                Log in with the same darker shell and product tone as the rest of MusiPR.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                The flow is fully wired to the API now, including role-aware redirects, protected routes, and token refresh. This pass just makes the entry route feel like it belongs in the same app.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Role redirects', 'Token refresh', 'Seeded demos', 'Live auth API'].map((item) => (
                <DetailBadge key={item} label={item} />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Admin demo', 'admin@musipr.local', 'AdminPass123!', 'Open the ops and moderation side quickly.'],
                ['Artist demo', 'luna.costa@musipr.local', 'ArtistPass123!', 'Jump straight into the creator workflow routes.']
              ].map(([label, demoEmail, demoPassword, note]) => (
                <button
                  key={demoEmail}
                  type="button"
                  className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-left transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
                  onClick={() => {
                    setMode('login');
                    setEmail(demoEmail);
                    setPassword(demoPassword);
                    setConfirmPassword(demoPassword);
                  }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{label}</p>
                  <p className="mt-4 text-lg font-semibold text-white">{demoEmail}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{note}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <DetailMetric label="Protected routes" value="7" note="Library, artist, and admin paths now gate by session and role." />
            <DetailMetric label="Refresh path" value="Live" note="Expired access tokens retry through the refresh endpoint automatically." />
            <DetailMetric label="Login state" value={user ? 'Active' : 'Guest'} note={user ? user.email : 'Use the demo accounts or create a new profile.'} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="card p-6 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Session</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">{mode === 'login' ? 'Log in' : 'Create account'}</h2>
            </div>
            <div className="flex gap-2 rounded-full border border-white/10 bg-black/20 p-1">
              {(['login', 'signup'] as const).map((tab) => (
                <button key={tab} type="button" onClick={() => { setMode(tab); setError(null); }} className={clsx('auth-tab', mode === tab && 'auth-tab-active')}>
                  {tab === 'login' ? 'Login' : 'Signup'}
                </button>
              ))}
            </div>
          </div>
          {user ? (
            <div className="mt-6 rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/80">Signed in</p>
              <p className="mt-3 text-lg font-semibold text-white">{user.email}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to={routeForRole(user.role)} className="button-primary">Continue</Link>
                <button type="button" onClick={() => void logout()} className="button-secondary">Switch account</button>
              </div>
            </div>
          ) : null}
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="field-group"><span className="field-label">Email</span><input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
            <label className="field-group"><span className="field-label">Password</span><input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label>
            {mode === 'signup' ? (
              <>
                <label className="field-group"><span className="field-label">Confirm password</span><input className="field" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
                <label className="field-group"><span className="field-label">Account type</span><select className="field" value={role} onChange={(event) => setRole(event.target.value as Role)}>{roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                <label className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300"><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-[#1db954]" /><span>I agree to the platform terms and confirm I have the rights required to upload and distribute my work.</span></label>
              </>
            ) : null}
            {error ? <p className="rounded-[18px] border border-[#ff8f70]/30 bg-[#ff8f70]/10 px-4 py-3 text-sm text-[#ffe2d9]">{error}</p> : null}
            <button type="submit" className="button-primary w-full justify-center" disabled={isSubmitting}>{isSubmitting ? 'Working...' : mode === 'login' ? 'Log in to MusiPR' : 'Create my account'}</button>
          </form>
        </article>

        <article className="card p-6 md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">What happens next</p>
          <div className="mt-5 space-y-3">
            {[
              ['Listeners land in the home feed', 'Use the main shell, liked songs, playlists, and profile routes.'],
              ['Artists continue into their workflow', 'Verification, dashboard, and upload surfaces are all role-protected now.'],
              ['Admins go straight to ops', 'Moderation and dashboard routes open with the same branch-style navigation.']
            ].map(([title, note]) => (
              <div key={title} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-base font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{note}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <DetailMetric label="Fallback" value={redirectPath ?? '/'} note="Users return to the page they originally requested when possible." />
            <DetailMetric label="Session retry" value="401" note="Unauthorized responses attempt refresh once before clearing local auth state." />
          </div>
        </article>
      </section>
    </section>
  );
}

function LikedSongsPageLegacy() {
  const { user } = useAuthStore();
  const libraryQuery = useUserLibraryQuery(Boolean(user));

  if (!user) {
    return (
      <section className="space-y-8">
        <div className="hero-panel">
          <p className="eyebrow">Tus likes</p>
          <h1 className="display-title mt-4">Save tracks, keep playlists close, and build a listening memory that follows you.</h1>
          <p className="section-copy mt-5 max-w-2xl">
            The branch idea your buddy built is now wired into the real session flow. Log in and this route will pull your liked tracks, saved tracks, and saved playlists from the API.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/login" className="button-primary">
              Log in to view your library
            </Link>
            <Link to="/discover" className="button-secondary">
              Keep browsing
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (libraryQuery.isLoading) {
    return (
      <section className="space-y-8">
        <div className="hero-panel">
          <p className="eyebrow">Tus likes</p>
          <h1 className="display-title mt-4">Loading your library.</h1>
          <p className="section-copy mt-5 max-w-2xl">Pulling your liked tracks, saved tracks, and saved playlists from the API.</p>
        </div>
      </section>
    );
  }

  const library = libraryQuery.data;
  const likedEntries = library?.likedTracks.filter((track) => Boolean(track.likedAt)) ?? [];
  const savedOnlyEntries = library?.likedTracks.filter((track) => !track.likedAt && Boolean(track.savedAt)) ?? [];
  const savedPlaylistEntries = library?.savedPlaylists ?? [];
  const likedTracks = likedEntries.map(mapTrack);
  const savedTracks = savedOnlyEntries.map(mapTrack);
  const savedPlaylists = savedPlaylistEntries.map(mapPlaylist);
  const counts = library?.counts ?? {
    likedTracks: likedEntries.length,
    savedTracks: savedOnlyEntries.length,
    savedPlaylists: savedPlaylistEntries.length
  };

  const topArtists = Array.from(
    likedEntries.reduce(
      (artistMap, track) => {
        const next = artistMap.get(track.artistName) ?? { name: track.artistName, count: 0, slug: slugify(track.artistName) };
        next.count += 1;
        artistMap.set(track.artistName, next);
        return artistMap;
      },
      new Map<string, { name: string; count: number; slug: string }>()
    ).values()
  )
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, 4);

  const isEmpty = !likedEntries.length && !savedOnlyEntries.length && !savedPlaylistEntries.length;

  return (
    <section className="space-y-8">
      <div className="hero-panel">
        <p className="eyebrow">Tus likes</p>
        <h1 className="display-title mt-4">A real library view for the songs and mixes you want to keep close.</h1>
        <p className="section-copy mt-5 max-w-2xl">
          This page now sits on top of the live API, so the heart button in the header and the save controls on detail pages all resolve into one shared library.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <MetricTile label="Liked tracks" value={String(counts.likedTracks)} note="Songs you explicitly hearted from the product." />
          <MetricTile label="Saved tracks" value={String(counts.savedTracks)} note="Cuts you bookmarked to revisit later." />
          <MetricTile label="Saved playlists" value={String(counts.savedPlaylists)} note="Editorial or artist-made sequences you kept nearby." />
        </div>
      </div>

      {isEmpty ? (
        <article className="card p-6">
          <p className="eyebrow">Library is empty</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">Like a few tracks and save a playlist to get this page moving.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5c7180]">
            The route is live. It just needs a little listening history. Open a track or playlist and use the new buttons to build your library.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/discover" className="button-primary">
              Find tracks to like
            </Link>
            <Link to="/playlists" className="button-secondary">
              Browse playlists
            </Link>
          </div>
        </article>
      ) : (
        <>
          <div className="section-grid xl:grid-cols-[1.08fr_0.92fr]">
            <article className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Liked songs</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">The tracks you marked as worth coming back to.</h2>
                </div>
                <span className="button-ghost">{counts.likedTracks} liked</span>
              </div>
              <div className="mt-5 space-y-3">
                {likedTracks.length ? (
                  likedTracks.map((track, index) => (
                    <LibraryTrackRow
                      key={track.id ?? `${track.artist}-${track.title}`}
                      index={index}
                      track={track}
                      liked
                      saved={Boolean(likedEntries[index]?.savedAt)}
                      stamp={formatLibraryStamp(likedEntries[index]?.likedAt ?? likedEntries[index]?.savedAt)}
                    />
                  ))
                ) : (
                  <div className="library-empty-state">
                    <p className="text-lg font-semibold text-white">No liked songs yet.</p>
                    <p className="mt-2 text-sm leading-7 text-[#5c7180]">Saved tracks and playlists are still here, but your hearted songs section is waiting for its first pick.</p>
                  </div>
                )}
              </div>
            </article>

            <div className="grid gap-5">
              <article className="card p-6">
                <p className="eyebrow">Top artists in your likes</p>
                <div className="library-artist-grid mt-5">
                  {topArtists.length ? (
                    topArtists.map((artist) => (
                      <Link key={artist.slug} to={`/artists/${artist.slug}`} className="library-artist-chip">
                        <span className="library-artist-avatar">{artist.name.slice(0, 2).toUpperCase()}</span>
                        <span className="library-artist-name">{artist.name}</span>
                        <span className="library-artist-meta">{artist.count} liked track{artist.count === 1 ? '' : 's'}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="library-empty-state">
                      <p className="text-sm leading-7 text-[#5c7180]">Once you like a few songs, your favorite artists will show up here.</p>
                    </div>
                  )}
                </div>
              </article>

              <article className="card p-6">
                <p className="eyebrow">Saved for later</p>
                <div className="mt-4 space-y-3">
                  {savedTracks.length ? (
                    savedTracks.map((track, index) => (
                      <LibraryTrackRow
                        key={track.id ?? `${track.artist}-${track.title}`}
                        index={index}
                        track={track}
                        liked={false}
                        saved
                        stamp={formatLibraryStamp(savedOnlyEntries[index]?.savedAt)}
                      />
                    ))
                  ) : (
                    <div className="library-empty-state">
                      <p className="text-sm leading-7 text-[#5c7180]">No saved-only tracks yet. When you bookmark tracks without liking them, they will show up here.</p>
                    </div>
                  )}
                </div>
              </article>
            </div>
          </div>

          {savedPlaylists.length ? (
            <>
              <SectionHeading
                eyebrow="Saved playlists"
                title="Playlists you kept in orbit."
                description="These saves now come from the API too, so the library page can act like a real front door back into your listening habits."
              />
              <div className="grid gap-5 xl:grid-cols-3">
                {savedPlaylists.map((playlist, index) => (
                  <div key={playlist.id ?? playlist.title} className="space-y-3">
                    <PlaylistCard {...playlist} />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="library-stamp">Saved {formatLibraryStamp(savedPlaylistEntries[index]?.savedAt) ?? 'recently'}</span>
                      <PlaylistSaveControl playlistId={playlist.id} saved />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </>
      )}
    </section>
  );
}

export function LikedSongsPage() {
  const { user } = useAuthStore();
  const libraryQuery = useUserLibraryQuery(Boolean(user));

  if (!user) {
    return (
      <section className="space-y-6 pb-4">
        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,34,66,0.92),rgba(15,15,15,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.26),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] px-6 py-7 md:px-8 md:py-9">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Playlist</p>
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">Liked Songs</h1>
              <p className="max-w-3xl text-sm leading-6 text-zinc-300 md:text-base">
                Log in to load your real likes and saved playlists from the API. This keeps the branch-style library page, but makes it actually useful.
              </p>
            </div>
            <div className="mt-7 flex items-center gap-3">
              <Link to="/login" className="inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
                Log in
              </Link>
              <Link to="/discover" className="inline-flex rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/5">
                Keep browsing
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (libraryQuery.isLoading) {
    return (
      <section className="space-y-6 pb-4">
        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,34,66,0.92),rgba(15,15,15,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.34)] px-6 py-7 md:px-8 md:py-9">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Playlist</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white md:text-6xl">Liked Songs</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-300 md:text-base">Loading your library from the API.</p>
        </div>
      </section>
    );
  }

  const library = libraryQuery.data;
  const libraryTracks = library?.likedTracks ?? [];
  const savedPlaylists = library?.savedPlaylists ?? [];
  const counts = library?.counts ?? {
    likedTracks: libraryTracks.filter((track) => track.likedAt).length,
    savedTracks: libraryTracks.filter((track) => track.savedAt).length,
    savedPlaylists: savedPlaylists.length
  };

  const rows = libraryTracks.map((track) => ({
    track: mapTrack(track),
    added: formatLibraryStamp(track.savedAt ?? track.likedAt) ?? 'Recently',
    liked: Boolean(track.likedAt),
    saved: Boolean(track.savedAt)
  }));

  return (
    <section className="space-y-6 pb-4">
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,34,66,0.92),rgba(15,15,15,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
        <div className="bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.26),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] px-6 py-7 md:px-8 md:py-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-700 text-slate-950 shadow-[0_16px_40px_rgba(59,130,246,0.24)]">
                <HeartIcon filled />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Playlist</p>
                <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">Liked Songs</h1>
                <p className="max-w-3xl text-sm leading-6 text-zinc-300 md:text-base">
                  A long-form library view for every track you have kept close. It now uses the real API instead of a static mock.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium text-zinc-300">
                {rows.length} songs
              </span>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100">
                {counts.savedPlaylists} saved playlists
              </span>
            </div>
          </div>

          <div className="mt-7 flex items-center gap-3">
            <Link to="/discover" className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-300 text-slate-950 shadow-[0_16px_30px_rgba(34,211,238,0.28)] transition hover:scale-[1.02] hover:bg-cyan-200">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor">
                <path d="M8 6.5v11l9-5.5-9-5.5Z" />
              </svg>
            </Link>
            <Link to="/profile" className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-black/20 px-4 text-cyan-200 transition hover:bg-white/5">
              Open profile
            </Link>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#121212]">
        <div className="grid grid-cols-[56px_minmax(0,2.4fr)_minmax(0,1.2fr)_minmax(0,1fr)_88px] items-center gap-4 border-b border-white/10 px-5 py-4 text-[11px] uppercase tracking-[0.26em] text-zinc-500 max-lg:hidden">
          <span>#</span>
          <span>Title</span>
          <span>Status</span>
          <span>Date added</span>
          <span className="text-right">Time</span>
        </div>

        {rows.length ? (
          <div className="max-h-[calc(100vh-310px)] overflow-y-auto">
            <div className="divide-y divide-white/[0.04]">
              {rows.map(({ track, added, liked, saved }, index) => (
                <div
                  key={track.id ?? `${track.artist}-${track.title}`}
                  className="grid grid-cols-[56px_minmax(0,2.4fr)_minmax(0,1.2fr)_minmax(0,1fr)_88px] items-center gap-4 px-5 py-3 text-sm transition hover:bg-white/[0.035]"
                >
                  <div className="flex items-center gap-3 text-zinc-500">
                    <span className="w-5 text-right text-xs">{index + 1}</span>
                  </div>

                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`h-11 w-11 shrink-0 rounded-[10px] bg-gradient-to-br ${track.accent === 'ember' ? 'from-violet-500 to-sky-300' : track.accent === 'tide' ? 'from-cyan-400 to-blue-600' : 'from-orange-400 to-amber-300'}`} />
                    <div className="min-w-0">
                      <Link to={`/tracks/${slugify(track.title)}`} className="truncate font-medium text-white hover:text-cyan-200">
                        {track.title}
                      </Link>
                      <p className="truncate text-sm text-zinc-400">{track.artist}</p>
                    </div>
                  </div>

                  <div className="min-w-0 max-lg:hidden">
                    <p className="truncate text-zinc-300">
                      {liked ? 'Liked' : 'Saved'}
                      {saved && liked ? ' + Saved' : ''}
                    </p>
                  </div>

                  <div className="min-w-0 text-zinc-500">
                    <p className="truncate">{added}</p>
                  </div>

                  <div className="text-right text-zinc-400">{track.duration}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-5 py-8">
            <p className="text-lg font-semibold text-white">Your library is still empty.</p>
            <p className="mt-2 text-sm text-zinc-400">Like a few songs or save a playlist and this page will fill in right away.</p>
          </div>
        )}
      </section>

      {savedPlaylists.length ? (
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Saved playlists</h2>
              <p className="mt-1 text-sm text-zinc-400">Still connected to the real API, just styled closer to the branch you liked.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {savedPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} {...mapPlaylist(playlist)} />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

export function ProfilePage() {
  const { user } = useAuthStore();
  const libraryQuery = useUserLibraryQuery(Boolean(user));
  const [activeTab, setActiveTab] = useState<'Playlists' | 'Tracks' | 'Reposts'>('Playlists');

  if (!user) {
    return (
      <section className="card p-6">
        <h2 className="text-2xl font-semibold text-white">Profile</h2>
        <p className="mt-2 text-sm text-zinc-400">Log in to open your profile and library summary.</p>
      </section>
    );
  }

  const library = libraryQuery.data;
  const likedTracks = library?.likedTracks ?? [];
  const savedPlaylists = library?.savedPlaylists ?? [];
  const tabs = ['Playlists', 'Tracks', 'Reposts'] as const;

  const trackRows =
    activeTab === 'Playlists'
      ? savedPlaylists.slice(0, 5).map((playlist, index) => ({
          title: playlist.title,
          meta: `Saved playlist · ${playlist.countLabel}`,
          plays: `${index + 1} save`,
          length: `${playlist.trackCount ?? 0} tracks`,
          note: 'Collection favorite',
          accent: 'from-fuchsia-500/85 via-rose-300/55 to-orange-200/45'
        }))
      : likedTracks.slice(0, 5).map((track, index) => ({
          title: track.title,
          meta: `${track.artistName} · ${track.playsLabel}`,
          plays: `${track.likeCount} likes`,
          length: track.durationLabel,
          note: activeTab === 'Tracks' ? 'Library pick' : 'Repeat rotation',
          accent: index % 2 === 0 ? 'from-cyan-400/85 via-sky-400/55 to-blue-200/45' : 'from-emerald-300/75 via-teal-400/50 to-cyan-200/40'
        }));

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
              {user.email.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="mt-4 max-w-2xl">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-500">Artist profile</span>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                {user.role}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">{user.email.split('@')[0]}</h1>
            <p className="mt-1 text-sm text-zinc-400">@{slugify(user.email.split('@')[0])}</p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-300">
              A profile surface styled like the `codex/like-button-top` branch, but fed by your real MusiPR session and library data.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
              <ProfileStat label="Saved playlists" value={String(savedPlaylists.length)} />
              <ProfileStat label="Library tracks" value={String(likedTracks.length)} />
              <ProfileStat label="Likes" value={String(likedTracks.filter((track) => track.likedAt).length)} />
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
            >
              <span className="inline-flex items-center justify-center">{tab === 'Reposts' ? 'Likes' : tab}</span>
              <span className={`absolute inset-x-0 bottom-0 h-[2px] rounded-full transition ${tab === activeTab ? 'bg-white' : 'bg-transparent'}`} />
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,22,22,0.94),rgba(16,16,16,0.98))]">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
          <span>{activeTab}</span>
          <span>Signal</span>
          <span>Time</span>
        </div>

        {trackRows.length ? (
          trackRows.map((track, index) => (
            <div
              key={`${activeTab}-${track.title}`}
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
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-sm text-zinc-400">No items in this tab yet.</div>
        )}
      </section>
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

export const ArtistOnboardingPage = () => (
  <section className="space-y-6">
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,34,62,0.94),rgba(13,13,13,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
      <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-8">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Artist onboarding</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">Build the artist world fans will step into first.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
              This route now reads like a real creator launch flow: identity, trust, catalog setup, and monetization all framed before the first release goes live.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Identity', 'Verification', 'Catalog setup', 'Monetization'].map((item) => (
              <DetailBadge key={item} label={item} />
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <DetailMetric label="Profile setup" value="80%" note="Enough structure to launch with a polished public face." />
          <DetailMetric label="Trust checks" value="4" note="The main verification milestones are visible from the start." />
          <DetailMetric label="Launch lane" value="Ready" note="Everything points naturally toward dashboard and upload next." />
        </div>
      </div>
    </section>

    <section className="grid gap-4 md:grid-cols-3">
      {[
        ['Identity', 'Profile image, cover art, town, and story'],
        ['Proof', 'Verification, rights confirmation, and release readiness'],
        ['Monetize', 'Merch, shows, and campaign hooks from day one']
      ].map(([title, note], index) => (
        <article key={title} className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Step 0{index + 1}</p>
          <p className="mt-4 text-2xl font-semibold text-white">{title}</p>
          <p className="mt-3 text-sm leading-7 text-zinc-400">{note}</p>
        </article>
      ))}
    </section>
  </section>
);

export const VerificationPage = () => (
  <section className="space-y-6">
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,27,49,0.94),rgba(12,12,12,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
      <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-8">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Verification</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">Trust-building now feels like a creator milestone, not a dead-end form.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
              Identity, rights, and admin review are presented as one clear sequence so artists know what is done, what is pending, and what unlocks next.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['ID uploaded', 'Rights confirmed', 'Selfie pending', 'Admin review'].map((item) => (
              <DetailBadge key={item} label={item} />
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <DetailMetric label="Status" value="In review" note="The current package is almost complete and ready for final review." />
          <DetailMetric label="Unlocks" value="4" note="Public releases, stronger discovery, merch, and verified profile state." />
          <DetailMetric label="Response lane" value="<48h" note="The review surface is shaped to support faster admin turnaround." />
        </div>
      </div>
    </section>

    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <article className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Checklist</p>
          <span className="button-ghost">3 of 4 complete</span>
        </div>
        <div className="mt-5 space-y-3">
          {[
            ['Government ID uploaded', 'Complete'],
            ['Selfie confirmation pending', 'Pending'],
            ['Rights confirmation completed', 'Complete'],
            ['Admin review scheduled', 'Queued']
          ].map(([item, status]) => (
            <div key={item} className="flex items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-sm font-medium text-white">{item}</span>
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">{status}</span>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-4">
        <article className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Why it matters</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <DetailMetric label="Catalog trust" value="High" note="Fans see the platform as a credible place for local releases." />
            <DetailMetric label="Profile signal" value="Verified" note="The artist surface reads more clearly once trust is explicit." />
          </div>
        </article>
        <article className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Next after approval</p>
          <div className="mt-4 space-y-3">
            {['Upload public releases', 'Appear in discovery with stronger trust markers', 'Connect merch to artist profile', 'Open campaign and release scheduling flows'].map((item) => (
              <div key={item} className="feed-row">
                {item}
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  </section>
);

export const ArtistDashboardPage = () => (
  <ArtistDashboardContent />
);

function ArtistDashboardContent() {
  const homeCatalog = buildHomeCatalog(useDiscoveryHomeQuery().data);
  const leadArtist = homeCatalog.artists[0] ?? fallbackArtists[0];
  const leadTrack = homeCatalog.tracks[0] ?? fallbackTracks[0];
  const launchMoments = homeCatalog.releaseMoments.slice(0, 3);
  const showMoments = homeCatalog.events.slice(0, 2);

  return (
    <section className="page-stagger space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,29,54,0.94),rgba(12,12,12,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
        <div className="grid gap-6 px-6 py-7 lg:grid-cols-[140px_minmax(0,1fr)_300px] md:px-8 md:py-8">
          <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#181818]">
            {leadArtist.imageSrc ? <img src={leadArtist.imageSrc} alt="" className="aspect-square h-full w-full object-cover" /> : <div className={`aspect-square artwork-${leadArtist.accent}`} />}
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Artist dashboard</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-white md:text-6xl">{leadArtist.name}</h1>
              <p className="mt-2 text-base text-zinc-300">{leadArtist.genre} | {leadArtist.town}</p>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-zinc-300 md:text-base">
              Streaming momentum, merch interest, and live demand now sit inside one creator operating surface instead of scattered placeholder cards.
            </p>
            <div className="flex flex-wrap gap-2">
              {[leadTrack.title, leadArtist.monthlyListenersLabel ?? '12.4K monthly', 'Merch live', 'Release runway'].map((item) => (
                <DetailBadge key={item} label={item} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/artist/upload" className="button-primary">
                Upload next release
              </Link>
              <Link to="/artist/verification" className="button-secondary">
                Review verification
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <DetailMetric label="Monthly listeners" value={leadArtist.monthlyListenersLabel ?? '12.4K'} note="Momentum is strongest after editorial placement and playlist saves." />
            <DetailMetric label="Merch clicks" value="312" note="Poster and tee demand spikes after live moments and fresh releases." />
            <DetailMetric label="Show intent" value="68%" note="Ticket click-through in Santurce is above the recent baseline." />
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="card p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Catalog pulse</p>
            <span className="button-ghost">{homeCatalog.tracks.length} tracks in play</span>
          </div>
          <div className="mt-5 space-y-4">
            {homeCatalog.tracks.map((track, index) => (
              <MiniTrackRow key={track.title} index={index} title={track.title} artist={track.artist} plays={track.plays} accent={track.accent} imageSrc={track.imageSrc} />
            ))}
          </div>
        </article>

        <div className="grid gap-4">
          <article className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Launch runway</p>
            <div className="mt-5 space-y-4">
              {launchMoments.map((release) => <ReleaseMoment key={release.title} {...release} />)}
            </div>
          </article>
          <article className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Live and merch pressure</p>
            <div className="mt-4 space-y-3">
              {[
                `Best selling item: ${homeCatalog.merch[0]?.title ?? 'Signed poster drop'}`,
                `Next show lane: ${showMoments[0]?.title ?? 'Santurce showcase'}`,
                'Fan DMs and saves are strongest within 24 hours of a new release',
                'Merch conversion is healthiest when tied to a playlist or show moment'
              ].map((item) => (
                <div key={item} className="feed-row">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export const UploadTrackPage = () => (
  <section className="space-y-6">
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,34,62,0.94),rgba(12,12,12,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
      <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-8">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Upload</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">Treat every upload like the start of a release campaign.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
              Metadata, timing, processing, and promotional framing all sit inside one launch surface so the page feels like a real release desk instead of a checklist stub.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Audio upload', 'Artwork', 'Credits', 'Release timing'].map((item) => (
              <DetailBadge key={item} label={item} />
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <DetailMetric label="Metadata" value="93%" note="Core release copy, imagery, and credits are almost complete." />
          <DetailMetric label="Processing" value="72%" note="Audio pipeline and artwork validation are still running." />
          <DetailMetric label="Window" value="Friday" note="The next strong drop slot is already being planned." />
        </div>
      </div>
    </section>

    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <article className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Release builder</p>
          <span className="button-ghost">Draft</span>
        </div>
        <div className="mt-5 space-y-3">
          {[
            ['Track title and cover art', 'Complete the public-facing packaging first.'],
            ['Description, credits, and rights', 'Clarify authorship, collaborators, and ownership.'],
            ['Release timing and visibility', 'Choose draft, scheduled, or public launch timing.'],
            ['Upload and audio processing status', 'Track the file pipeline before the release goes live.']
          ].map(([item, note]) => (
            <div key={item} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-base font-semibold text-white">{item}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{note}</p>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-4">
        <article className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Readiness lane</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <DetailMetric label="Artwork fit" value="Strong" note="Imagery is already aligned with the darker branch-style product shell." />
            <DetailMetric label="Credits" value="Ready" note="The release page can tell a cleaner story once collaborator metadata is complete." />
          </div>
        </article>
        <article className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Recommended next moves</p>
          <div className="mt-4 space-y-3">
            {['Schedule a release date before publishing publicly', 'Pair the drop with a playlist placement or show announcement', 'Prepare one merch tie-in while attention is highest', 'Recheck rights and ownership metadata before final submission'].map((item) => (
              <div key={item} className="feed-row">
                {item}
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  </section>
);

export function TrackDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const setQueue = usePlayerStore((state) => state.setQueue);
  const heroProgress = useWindowScrollProgress();
  const detail = buildTrackDetail(useTrackDetailQuery(id ?? '').data);
  const libraryQuery = useUserLibraryQuery(Boolean(user));
  const track = detail.track;
  const artist = fallbackArtists.find((item) => item.name === track.artist);
  const relatedTracks = detail.relatedTracks.length ? detail.relatedTracks : fallbackTracks.filter((item) => item.title !== track.title).slice(0, 3);
  const featuredPlaylist = detail.featuringPlaylists[0] ?? fallbackPlaylists[0];
  const libraryTrack = libraryQuery.data?.likedTracks.find((item) => item.id === track.id);
  const playbackLane = [track, ...relatedTracks];

  return (
    <section className="space-y-6">
      <section
        className="route-hero overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,25,42,0.96),rgba(15,15,15,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.34)]"
        style={{ ['--hero-progress' as string]: heroProgress } as CSSProperties}
      >
        <div className="grid gap-6 px-6 py-7 lg:grid-cols-[180px_minmax(0,1fr)_280px] md:px-8 md:py-8">
          <div className="route-hero-media overflow-hidden rounded-[24px] border border-white/10 bg-[#181818]">
            {track.imageSrc ? <img src={track.imageSrc} alt="" className="aspect-square h-full w-full object-cover" /> : <div className={`aspect-square artwork-${track.accent}`} />}
          </div>
          <div className="route-hero-copy space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Track</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-white md:text-6xl">{track.title}</h1>
              <Link to={`/artists/${slugify(track.artist)}`} className="mt-2 inline-block text-base text-zinc-300 hover:text-white">
                {track.artist}
              </Link>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-zinc-300 md:text-base">
              {track.description ?? `${track.tag} energy anchored by ${track.artist} and shaped for replay-friendly discovery.`}
            </p>
            <div className="flex flex-wrap gap-2">
              {[track.tag, artist?.town ?? 'Puerto Rico', track.duration, track.plays].map((item) => (
                <DetailBadge key={item} label={item} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setQueue(playbackLane.map((item) => buildPlayerTrackFromUiTrack(item)), 0, true)}
                className="button-primary"
              >
                Play now
              </button>
              <Link to={`/playlists/${slugify(featuredPlaylist.title)}`} className="button-secondary">
                Open playlist lane
              </Link>
              <Link to={`/discover?q=${encodeURIComponent(track.artist)}`} className="button-secondary">
                More from this artist
              </Link>
              {user && track.id ? (
                <TrackLibraryControls trackId={track.id} liked={Boolean(libraryTrack?.likedAt)} saved={Boolean(libraryTrack?.savedAt)} />
              ) : null}
            </div>
          </div>
          <div className="route-hero-metrics grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <DetailMetric label="Queue lane" value={`${playbackLane.length} tracks`} note="Start with the single and keep moving through related cuts." />
            <DetailMetric label="Source" value={featuredPlaylist.title} note="This track is still surfacing strongly inside playlist-driven discovery." />
            <DetailMetric label="Comments" value={String(track.commentCount ?? detail.comments.length)} note="Conversation is active enough to deserve its own context panel." />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailMetric label="Momentum" value={track.plays} note="Strong listener attention in the current browse cycle." />
        <DetailMetric label="Comments" value={String(track.commentCount ?? detail.comments.length)} note="Conversation is building around the record." />
        <DetailMetric label="Duration" value={track.duration} note="Fast replay-friendly runtime." />
        <DetailMetric label="Best paired with" value={featuredPlaylist.title} note="Still showing up inside connected playlist flows." />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <PlayableTrackTable
          eyebrow="Playback lane"
          title="Start here, then keep the room moving."
          note="The track route now shares the same dense queue pattern as the shell and player."
          tracks={playbackLane}
        />

        <article className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">About the record</p>
          <p className="mt-4 text-lg font-semibold text-white">
            {track.tag} energy anchored by {track.artist}.
          </p>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            This is the supporting rail for the track route now: story, credits, and discovery context instead of a generic second card.
          </p>
          <div className="mt-5 space-y-3">
            {[
              `Written by ${track.artist}`,
              `Scene anchor: ${artist?.town ?? 'Puerto Rico'}`,
              `Current signal: ${track.tag}`,
              `Playlist lane: ${featuredPlaylist.title}`
            ].map((item) => (
              <div key={item} className="feed-row">
                {item}
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Comments</p>
          <div className="mt-4 space-y-3">
            {detail.comments.map((comment) => (
              <div key={comment.id} className="feed-row">{`"${comment.body}"`}</div>
            ))}
          </div>
        </article>

        <article className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Appears in</p>
          <div className="mt-4">
            <PlaylistCard {...featuredPlaylist} />
          </div>
        </article>
      </div>
    </section>
  );
}

export function ArtistProfilePage() {
  const { id } = useParams();
  const setQueue = usePlayerStore((state) => state.setQueue);
  const isFollowingArtist = useEngagementStore((state) => state.isFollowingArtist);
  const toggleArtistFollow = useEngagementStore((state) => state.toggleArtistFollow);
  const heroProgress = useWindowScrollProgress();
  const detail = buildArtistDetail(useArtistDetailQuery(id ?? '').data);
  const artist = detail.artist;
  const featuredTracks = detail.tracks.length ? detail.tracks : fallbackTracks.filter((item) => item.artist === artist.name).slice(0, 2);
  const featuredReleases = detail.releases.length ? detail.releases : fallbackReleaseMoments.filter((item) => item.artist === artist.name);
  const featuredEvents = detail.shows.length ? detail.shows : fallbackEvents.filter((item) => item.venue === artist.town);
  const featuredMerch = detail.merch.length ? detail.merch : merchForArtistFallback(artist.name);
  const signatureTrack = featuredTracks[0] ?? fallbackTracks[0];
  const following = isFollowingArtist(artist.name, artist.id);

  return (
    <section className="space-y-6">
      <section
        className="route-hero overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,17,17,0.96),rgba(12,12,12,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.34)]"
        style={{ ['--hero-progress' as string]: heroProgress } as CSSProperties}
      >
        <div className="grid gap-6 px-6 py-7 lg:grid-cols-[220px_minmax(0,1fr)_280px] md:px-8 md:py-8">
          <div className="route-hero-media overflow-hidden rounded-[28px] border border-white/10 bg-[#181818]">
            {artist.imageSrc ? <img src={artist.imageSrc} alt="" className="aspect-square h-full w-full object-cover" /> : <div className={`aspect-square artwork-${artist.accent}`} />}
          </div>
          <div className="route-hero-copy space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Artist profile</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-white md:text-6xl">{artist.name}</h1>
              <p className="mt-2 text-base text-zinc-300">
                {artist.genre} | {artist.town}
              </p>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-zinc-300 md:text-base">
              {artist.bio ?? `${artist.name} now has tracks, release moments, merch, and local demand signals in one darker, branch-style artist surface.`}
            </p>
            <div className="flex flex-wrap gap-2">
              {[artist.genre, artist.town, 'verified artist', 'merch active'].map((item) => (
                <DetailBadge key={item} label={item} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setQueue(featuredTracks.map((item) => buildPlayerTrackFromUiTrack(item)), 0, true)}
                className="button-primary"
              >
                Play top tracks
              </button>
              <button
                type="button"
                onClick={() => void toggleArtistFollow(artist.name, artist.id)}
                className="button-secondary"
              >
                {following ? 'Following' : 'Follow artist'}
              </button>
              <Link to="/shows" className="button-secondary">
                Upcoming shows
              </Link>
              <Link to={`/discover?q=${encodeURIComponent(artist.name)}`} className="button-secondary">
                Browse artist lane
              </Link>
            </div>
          </div>
          <div className="route-hero-metrics grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <DetailMetric label="Top track" value={signatureTrack.title} note="The route opens with the artist's strongest current entry point." />
            <DetailMetric label="Release focus" value={(featuredReleases[0] ?? fallbackReleaseMoments[0]).title} note="New campaign context stays close to the hero instead of falling below the fold." />
            <DetailMetric label="Next live moment" value={featuredEvents[0]?.date ?? 'Fri 8PM'} note="Shows stay visible as part of the same artist world." />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailMetric label="Followers" value={artist.followerLabel ?? '3.2K'} note="Audience keeps growing after release week." />
        <DetailMetric label="Monthly listeners" value={artist.monthlyListenersLabel ?? '12.4K'} note="Homepage placements are compounding." />
        <DetailMetric label="Merch lane" value={String(artist.merchCount ?? featuredMerch.length)} note="High intent from returning fans." />
        <DetailMetric label="Upcoming shows" value={String(Math.max(featuredEvents.length, 1))} note="Local demand is visible inside the profile world." />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <PlayableTrackTable
          eyebrow="Top tracks"
          title="The fastest way into this artist world."
          note="This table now matches the same queue-first interaction pattern as the shell."
          tracks={featuredTracks}
        />

        <article className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">About this artist</p>
          <p className="mt-4 text-lg font-semibold text-white">{artist.name} is moving with clear momentum.</p>
          <div className="mt-5 space-y-3">
            {[
              `Core scene: ${artist.town}`,
              `Lead signal: ${signatureTrack.title}`,
              `Merch lane: ${featuredMerch[0]?.title ?? 'Poster pack'}`,
              `Current release focus: ${(featuredReleases[0] ?? fallbackReleaseMoments[0]).title}`
            ].map((item) => (
              <div key={item} className="feed-row">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Featured this week</p>
          <div className="mt-4">
            <TrackCard {...signatureTrack} />
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Release moments</p>
          <div className="mt-4 space-y-4">
            {(featuredReleases.length ? featuredReleases : fallbackReleaseMoments.slice(0, 2)).map((release) => <ReleaseMoment key={release.title} {...release} />)}
          </div>
        </article>
        <article className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Shows and merch</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(featuredEvents.length ? featuredEvents : fallbackEvents.slice(0, 2)).map((event) => <EventCard key={event.title} {...event} />)}
            {featuredMerch.map((item) => <MerchCard key={item.title} {...item} />)}
          </div>
        </article>
      </div>
    </section>
  );
}

export function PlaylistDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const setQueue = usePlayerStore((state) => state.setQueue);
  const heroProgress = useWindowScrollProgress();
  const detail = buildPlaylistDetail(usePlaylistDetailQuery(id ?? '').data);
  const libraryQuery = useUserLibraryQuery(Boolean(user));
  const playlist = detail.playlist;
  const playlistTracks = detail.tracks.length ? detail.tracks : tracksForPlaylistFallback(playlist.title);
  const playlistArtists = detail.artists.length ? detail.artists : fallbackArtists.filter((item) => playlistTracks.some((track) => track.artist === item.name)).slice(0, 2);
  const playlistTags = playlist.moodTags?.length ? playlist.moodTags : tagsForPlaylist(playlist.title);
  const savedPlaylist = libraryQuery.data?.savedPlaylists.find((item) => item.id === playlist.id);

  return (
    <section className="space-y-6">
      <section
        className="route-hero overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,15,15,0.96),rgba(10,10,10,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.34)]"
        style={{ ['--hero-progress' as string]: heroProgress } as CSSProperties}
      >
        <div className="grid gap-6 px-6 py-7 lg:grid-cols-[200px_minmax(0,1fr)_280px] md:px-8 md:py-8">
          <div className="route-hero-media overflow-hidden rounded-[26px] border border-white/10 bg-[#181818]">
            {playlist.imageSrc ? <img src={playlist.imageSrc} alt="" className="aspect-square h-full w-full object-cover" /> : <div className={`aspect-square artwork-${playlist.accent}`} />}
          </div>
          <div className="route-hero-copy space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Playlist</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-white md:text-6xl">{playlist.title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300 md:text-base">
                {playlist.description} This route now shares the same action-row and playable table system as the rest of the app.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[playlist.count, ...playlistTags.slice(0, 3)].map((item) => (
                <DetailBadge key={item} label={item} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setQueue(playlistTracks.map((item) => buildPlayerTrackFromUiTrack(item)), 0, true)}
                className="button-primary"
              >
                Play playlist
              </button>
              <Link to={`/discover?q=${encodeURIComponent(playlist.title)}`} className="button-secondary">
                Similar moods
              </Link>
              <Link to="/discover" className="button-secondary">
                Keep browsing
              </Link>
              {user && playlist.id ? <PlaylistSaveControl playlistId={playlist.id} saved={Boolean(savedPlaylist)} /> : null}
            </div>
          </div>
          <div className="route-hero-metrics grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <DetailMetric label="Opening cue" value={playlistTracks[0]?.title ?? 'Brisa en Loiza'} note="The mix opens with a clear first-track invitation." />
            <DetailMetric label="Mood anchor" value={playlistTags[0]} note="Tags now support the hero rather than living only in a lower card." />
            <DetailMetric label="Save state" value={savedPlaylist ? 'Saved' : 'Not saved'} note="Your library connection is visible at the top of the route." />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailMetric label="Track count" value={playlist.count} note="A sequenced set built to run front to back." />
        <DetailMetric label="Mood center" value={playlistTags[0]} note="The tone that anchors the mix." />
        <DetailMetric label="Opening cue" value={playlistTracks[0]?.title ?? 'Brisa en Loiza'} note="The first song setting the room." />
        <DetailMetric label="Saved" value={savedPlaylist ? 'Yes' : 'No'} note="Connected to your real library state." />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <PlayableTrackTable
          eyebrow="Track order"
          title="A sequenced lane built to run front to back."
          note="Dense, queueable rows now match the same playback behavior used on the shell and artist routes."
          tracks={playlistTracks}
        />

        <div className="grid gap-4">
          <article className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Mix notes</p>
            <div className="mt-4 space-y-3">
              {[
                `Opening cue: ${playlistTracks[0]?.title ?? 'Brisa en Loiza'}`,
                `Mood center: ${playlistTags[0]}`,
                `Primary energy: ${playlist.count}`,
                `Saved state: ${savedPlaylist ? 'in your library' : 'not saved yet'}`
              ].map((item) => (
                <div key={item} className="feed-row">
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Mood tags</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {playlistTags.map((tag) => (
                <DetailBadge key={tag} label={tag} />
              ))}
            </div>
          </article>
        </div>
      </div>

      {playlistArtists.length ? (
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Featured artists</h2>
              <p className="mt-1 text-sm text-zinc-400">The artists carrying the tone of this sequence.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {playlistArtists.map((artist) => <ArtistCard key={artist.name} {...artist} />)}
          </div>
        </section>
      ) : null}
    </section>
  );
}

export function ReleasesPage() {
  const releases = useReleasesQuery().data?.map((release) => buildHomeCatalog({ featuredArtists: [], trendingTracks: [], playlists: [], shows: [], merch: [], genres: [], newReleases: [release] }).releaseMoments[0]).filter(Boolean) ?? fallbackReleaseMoments;

  return (
    <section className="space-y-8">
      <div className="hero-panel">
        <p className="eyebrow">Releases</p>
        <h1 className="display-title mt-4">Launch moments with real visual weight.</h1>
        <p className="section-copy mt-4 max-w-2xl">Release surfaces now feel closer to campaigns than placeholders, with enough structure to support teasers, reminders, and artist context.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">{releases.map((release) => <ReleaseMoment key={release.title} {...release} />)}</div>
    </section>
  );
}

export const AdminDashboardPage = () => (
  <section className="space-y-6">
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(21,34,59,0.94),rgba(12,12,12,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
      <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-8">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Admin</p>
            <h1 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-white md:text-3xl">Moderation and ops now live in a proper control room.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
              The admin side is now laid out like the rest of the branch-style shell: faster scanning, clearer priority, and less placeholder energy.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Verification', 'Reports', 'Featured planning', 'Audit trail'].map((item) => (
              <DetailBadge key={item} label={item} />
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <DetailMetric label="Verification queue" value="14" note="Artists waiting on review this week." />
          <DetailMetric label="Open reports" value="3" note="Triage volume is compact and visible." />
          <DetailMetric label="Audit actions" value="29" note="Moderation decisions remain traceable across the week." />
        </div>
      </div>
    </section>

    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <article className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Priority queue</p>
          <span className="button-ghost">6 featured slots</span>
        </div>
        <div className="mt-5 space-y-3">
          {[
            ['Review Luna Costa verification refresh', 'Verification'],
            ['Investigate merch trademark notice', 'Merch'],
            ['Approve featured placement changes', 'Editorial'],
            ['Finalize takedown follow-up for archived upload', 'Legal']
          ].map(([item, lane]) => (
            <div key={item} className="flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-sm font-medium text-white">{item}</span>
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">{lane}</span>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-4">
        <article className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">System pulse</p>
          <div className="mt-4 space-y-3">
            {activityFeed.map((item) => (
              <div key={item} className="feed-row">
                {item}
              </div>
            ))}
          </div>
        </article>
        <article className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Admin rhythm</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <DetailMetric label="Featured planning" value="Active" note="Homepage and discovery slots are being shaped against live catalog momentum." />
            <DetailMetric label="Report SLA" value="<24h" note="The queue is compact enough to resolve the sharpest issues quickly." />
          </div>
        </article>
      </div>
    </div>
  </section>
);

export const ModerationPage = () => (
  <section className="space-y-6">
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(19,31,56,0.94),rgba(12,12,12,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
      <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-8">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Moderation</p>
            <h1 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-white md:text-3xl">A queue designed for decisions, not confusion.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
              Moderation work needs signal, context, and actionability. This route now matches the darker shell while making the queue read like a real triage lane.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Ownership disputes', 'Trademark flags', 'Repeat offenders', 'Escalations'].map((item) => (
              <DetailBadge key={item} label={item} />
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <DetailMetric label="Open cases" value="3" note="The current queue is compact enough to evaluate carefully." />
          <DetailMetric label="High risk" value="1" note="One issue has potential rights or ownership consequences." />
          <DetailMetric label="Resolved today" value="2" note="Most of the recent queue was cleared without backlog growth." />
        </div>
      </div>
    </section>

    <div className="grid gap-4">
      {[
        ['Potential ownership dispute on Brisa en Loiza', 'Open', 'Claims from a collaborator need rights review before the track stays public.'],
        ['Trademark flag on merch artwork', 'Under review', 'The art is being checked against a brand complaint before the item is featured again.'],
        ['Repeat infringer check on archived release', 'Resolved', 'A prior issue was reviewed and archived with the correct audit trail.']
      ].map(([item, status, note]) => (
        <article key={item} className="card flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-lg font-semibold text-white">{item}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{note}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="button-ghost">{status}</span>
            <button type="button" className="button-secondary">Review case</button>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export const SettingsPage = () => (
  <section className="space-y-6">
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,30,53,0.94),rgba(12,12,12,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
      <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-8">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Settings</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">Account settings that feel native to the product instead of bolted on.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
              Profile, security, and notification preferences now share the same branch-style tone as the rest of the signed-in experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Profile', 'Security', 'Notifications', 'Connected identity'].map((item) => (
              <DetailBadge key={item} label={item} />
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <DetailMetric label="Profile" value="Ready" note="Identity, bio, and media positioning are in sync." />
          <DetailMetric label="Security" value="JWT" note="Session structure is working end to end with refresh." />
          <DetailMetric label="Alerts" value="Soon" note="Release, merch, and live notifications can grow here." />
        </div>
      </div>
    </section>

    <div className="grid gap-4 xl:grid-cols-3">
      {[
        ['Profile details', 'Edit your display, story, and public-facing identity surfaces.'],
        ['Security', 'Password changes, session checks, and account safeguards can live here next.'],
        ['Notifications', 'Release reminders, merch updates, and show alerts belong in this lane.']
      ].map(([title, note]) => (
        <article key={title} className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">{title}</p>
          <p className="mt-4 text-xl font-semibold text-white">{title}</p>
          <p className="mt-3 text-sm leading-7 text-zinc-400">{note}</p>
        </article>
      ))}
    </div>
  </section>
);

export function PlaylistsPage() {
  const playlists = usePlaylistsQuery().data?.map((playlist) => buildHomeCatalog({ featuredArtists: [], trendingTracks: [], shows: [], merch: [], genres: [], newReleases: [], playlists: [playlist] }).playlists[0]).filter(Boolean) ?? fallbackPlaylists;

  return (
    <section className="space-y-8">
      <SectionHeading eyebrow="Playlists" title="Editorial collections with stronger personality." description="These rows now feel more like active curation than a generic content grid." />
      <div className="grid gap-5 xl:grid-cols-3">{playlists.map((playlist) => <PlaylistCard key={playlist.title} {...playlist} />)}</div>
    </section>
  );
}

export function ShowsPage() {
  const events = useEventsQuery().data?.map((event) => buildHomeCatalog({ featuredArtists: [], trendingTracks: [], playlists: [], merch: [], genres: [], newReleases: [], shows: [event] }).events[0]).filter(Boolean) ?? fallbackEvents;

  return (
    <section className="space-y-8">
      <SectionHeading eyebrow="Shows" title="Live discovery belongs in the same product rhythm." description="Show cards now feel like real event modules that can sit beside tracks and merch naturally." />
      <div className="grid gap-5 md:grid-cols-2">{events.map((event) => <EventCard key={event.title} {...event} />)}</div>
    </section>
  );
}

export function MerchPage() {
  const merch = useMerchQuery().data?.map((item) => buildHomeCatalog({ featuredArtists: [], trendingTracks: [], playlists: [], shows: [], genres: [], newReleases: [], merch: [item] }).merch[0]).filter(Boolean) ?? fallbackMerch;

  return (
    <section className="space-y-8">
      <SectionHeading eyebrow="Merch" title="Commerce surfaces with more visual presence." description="Merch now feels boutique and artist-linked rather than bolted onto the side of the app." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{merch.map((item) => <MerchCard key={item.title} {...item} />)}</div>
    </section>
  );
}
