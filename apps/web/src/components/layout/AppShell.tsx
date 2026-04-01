import { FormEvent, type ReactNode, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom';
import { useArtistDetailQuery, useDiscoveryHomeQuery, useDiscoverySearchQuery, usePlaylistDetailQuery, useTrackDetailQuery } from '../../api/catalog';
import { useUserLibraryQuery } from '../../api/library';
import { buildArtistDetail, buildHomeCatalog, buildPlaylistDetail, buildSearchCatalog, buildTrackDetail } from '../../data/catalog';
import { useEngagementStore } from '../../store/engagement';
import { useAuthStore } from '../../store/auth';
import { type PlayerTrack, usePlayerStore } from '../../store/player';
import { slugify } from '../../utils/slug';
import { GlobalPlayer } from '../player/GlobalPlayer';

const topLinks = [
  ['/', 'For you'],
  ['/discover', 'Discover'],
  ['/playlists', 'Playlists']
];

const libraryFilters = [
  ['all', 'All'],
  ['playlists', 'Playlists'],
  ['artists', 'Artists'],
  ['tracks', 'Tracks'],
  ['saved', 'Saved']
] as const;

const LIBRARY_COLLAPSE_KEY = 'musipr.library.collapsed';
const SEARCH_HISTORY_KEY = 'musipr.search.history';

const fallbackLibraryEntries = [
  {
    id: 'fallback-playlist-radar',
    title: 'Radar boricua',
    subtitle: 'Playlist | editorial pulse',
    to: '/playlists',
    type: 'playlist',
    accentClass: 'from-violet-500 to-sky-300'
  },
  {
    id: 'fallback-artist-luna',
    title: 'Luna Costa',
    subtitle: 'Artist | rising local signal',
    to: '/artists/luna-costa',
    type: 'artist',
    accentClass: 'from-emerald-400 to-cyan-400'
  },
  {
    id: 'fallback-track-brisa',
    title: 'Brisa en Loiza',
    subtitle: 'Track | saved heavily',
    to: '/tracks/brisa-en-loiza',
    type: 'track',
    accentClass: 'from-orange-400 to-rose-500'
  }
] as const;

type LibraryFilter = (typeof libraryFilters)[number][0];
type LibrarySort = 'recent' | 'alpha';

type LibraryEntry = {
  id: string;
  title: string;
  subtitle: string;
  to: string;
  type: 'playlist' | 'artist' | 'track';
  accentClass: string;
  artworkUrl?: string | null;
  trailing?: string;
  playerTrack?: PlayerTrack;
};

type SearchSuggestion = {
  id: string;
  title: string;
  meta: string;
  to: string;
  section: 'Artists' | 'Tracks' | 'Playlists' | 'Shows' | 'Merch';
};

function roleLinksForUser(role?: string | null) {
  if (role === 'ADMIN') {
    return [
      ['/admin', 'Admin'],
      ['/admin/moderation', 'Moderation']
    ] as const;
  }

  if (role === 'ARTIST' || role === 'VERIFIED_ARTIST') {
    return [
      ['/artist/dashboard', 'Studio'],
      ['/artist/upload', 'Upload']
    ] as const;
  }

  return [] as const;
}

function formatSavedDate(value?: string | null) {
  if (!value) return null;

  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
  } catch {
    return null;
  }
}

function initialsFromTitle(value: string) {
  return value
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function buildPlayerTrack(track: {
  id: string;
  title: string;
  artistName: string;
  artworkUrl?: string | null;
  durationSec?: number;
  tag?: string;
  artistSlug?: string;
}): PlayerTrack {
  return {
    id: track.id,
    title: track.title,
    artist: track.artistName,
    artworkUrl: track.artworkUrl ?? undefined,
    durationSec: track.durationSec,
    sourceLabel: track.tag ?? 'Library signal',
    sourceHref: track.artistSlug ? `/artists/${track.artistSlug}` : undefined
  };
}

function buildPlayerTrackFromUiTrack(track: {
  id?: string;
  title: string;
  artist: string;
  imageSrc?: string;
  durationSec?: number;
  tag?: string;
}) {
  return {
    id: track.id ?? slugify(`${track.artist}-${track.title}`),
    title: track.title,
    artist: track.artist,
    artworkUrl: track.imageSrc,
    durationSec: track.durationSec,
    sourceLabel: track.tag ?? 'Route context'
  };
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

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5.5h16" />
      <path d="M4 12h10" />
      <path d="M4 18.5h16" />
    </svg>
  );
}

function ChevronRailIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {collapsed ? <path d="m9 6 6 6-6 6" /> : <path d="m15 6-6 6 6 6" />}
    </svg>
  );
}

function FavoritesNavLink({ compact = false }: { compact?: boolean }) {
  return (
    <NavLink
      to="/liked-songs"
      aria-label="Open liked songs"
      className={({ isActive }) =>
        `inline-flex items-center ${compact ? 'justify-center p-2.5' : 'gap-2 px-3 py-2'} rounded-full border text-sm font-medium transition ${
          isActive
            ? 'border-cyan-300/30 bg-cyan-400/12 text-cyan-200 shadow-[0_0_0_1px_rgba(103,232,249,0.08)]'
            : 'border-white/10 bg-black/20 text-zinc-300 hover:bg-black/35 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <span className="inline-flex items-center gap-2">
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
              isActive ? 'bg-cyan-300/15 text-cyan-200' : 'bg-white/5 text-zinc-300'
            }`}
          >
            <HeartIcon filled={isActive} />
          </span>
          {compact ? null : <span className="whitespace-nowrap">Tus likes</span>}
        </span>
      )}
    </NavLink>
  );
}

function SearchCommandPanel({
  open,
  query,
  isLoading,
  suggestions,
  recentSearches,
  onSearch,
  onNavigate
}: {
  open: boolean;
  query: string;
  isLoading: boolean;
  suggestions: SearchSuggestion[];
  recentSearches: string[];
  onSearch: (query: string) => void;
  onNavigate: (to: string, query: string) => void;
}) {
  if (!open) return null;

  const groupedSuggestions = suggestions.reduce<Record<string, SearchSuggestion[]>>((groups, suggestion) => {
    groups[suggestion.section] ??= [];
    groups[suggestion.section].push(suggestion);
    return groups;
  }, {});

  return (
    <div className="search-command-panel absolute left-0 right-0 top-[calc(100%+0.75rem)] z-50 overflow-hidden rounded-[24px] border border-white/10 bg-[#121212f2] p-3 shadow-[0_28px_70px_rgba(0,0,0,0.4)] backdrop-blur">
      {query ? (
        isLoading ? (
          <div className="search-command-empty px-3 py-4 text-sm text-zinc-400">Searching the catalog...</div>
        ) : suggestions.length ? (
          <div className="space-y-4">
            {Object.entries(groupedSuggestions).map(([section, items]) => (
              <div key={section} className="search-command-section">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{section}</p>
                <div className="mt-2 space-y-1">
                  {items.slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.to, query)}
                      className="search-command-link w-full text-left"
                    >
                      <span className="block truncate text-sm font-semibold text-white">{item.title}</span>
                      <span className="mt-1 block truncate text-xs text-zinc-500">{item.meta}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button type="button" onClick={() => onSearch(query)} className="search-command-link w-full text-left">
              <span className="block text-sm font-semibold text-white">Search everything for "{query}"</span>
              <span className="mt-1 block text-xs text-zinc-500">Open the full discover page with this query.</span>
            </button>
          </div>
        ) : (
          <div className="search-command-empty px-3 py-4 text-sm text-zinc-400">
            No quick matches yet. Press Enter to search the full catalog for "{query}".
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="search-command-section">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Recent searches</p>
            <div className="mt-2 space-y-1">
              {recentSearches.length ? (
                recentSearches.map((item) => (
                  <button key={item} type="button" onClick={() => onSearch(item)} className="search-command-link w-full text-left">
                    <span className="block text-sm font-semibold text-white">{item}</span>
                    <span className="mt-1 block text-xs text-zinc-500">Search the catalog again.</span>
                  </button>
                ))
              ) : (
                <div className="search-command-empty px-3 py-4 text-sm text-zinc-400">Searches you run from the header will show up here.</div>
              )}
            </div>
          </div>
          <div className="search-command-section">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Quick jumps</p>
            <div className="mt-2 space-y-1">
              {[
                { label: 'Browse artists', meta: 'Open discovery filtered around artist worlds.', to: '/discover?q=artist' },
                { label: 'Open playlists', meta: 'Jump straight to editorial and saved mixes.', to: '/playlists' },
                { label: 'See live shows', meta: 'Check upcoming events and reminders.', to: '/shows' }
              ].map((item) => (
                <button key={item.label} type="button" onClick={() => onNavigate(item.to, '')} className="search-command-link w-full text-left">
                  <span className="block text-sm font-semibold text-white">{item.label}</span>
                  <span className="mt-1 block text-xs text-zinc-500">{item.meta}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContextRailCard({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-[#181818] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{eyebrow}</p>
      <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
      {description ? <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  );
}

function RouteContextRail() {
  const setQueue = usePlayerStore((state) => state.setQueue);
  const { isFollowingArtist, isMerchSaved, isShowReminded, toggleArtistFollow, toggleMerchSave, toggleShowReminder } = useEngagementStore((state) => ({
    isFollowingArtist: state.isFollowingArtist,
    isMerchSaved: state.isMerchSaved,
    isShowReminded: state.isShowReminded,
    toggleArtistFollow: state.toggleArtistFollow,
    toggleMerchSave: state.toggleMerchSave,
    toggleShowReminder: state.toggleShowReminder
  }));
  const location = useLocation();
  const trackMatch = useMatch('/tracks/:id');
  const artistMatch = useMatch('/artists/:id');
  const playlistMatch = useMatch('/playlists/:id');
  const homeCatalog = buildHomeCatalog(useDiscoveryHomeQuery().data);
  const trackDetail = buildTrackDetail(useTrackDetailQuery(trackMatch?.params.id ?? '').data);
  const artistDetail = buildArtistDetail(useArtistDetailQuery(artistMatch?.params.id ?? '').data);
  const playlistDetail = buildPlaylistDetail(usePlaylistDetailQuery(playlistMatch?.params.id ?? '').data);

  if (trackMatch) {
    const track = trackDetail.track;
    const relatedTracks = trackDetail.relatedTracks.length ? trackDetail.relatedTracks : homeCatalog.tracks.slice(0, 3);
    const featuredPlaylist = trackDetail.featuringPlaylists[0] ?? homeCatalog.playlists[0];
    const playbackLane = [track, ...relatedTracks].map((item) => buildPlayerTrackFromUiTrack(item));
    const comments = trackDetail.comments.slice(0, 2);

    return (
      <>
        <ContextRailCard
          eyebrow="Track context"
          title={track.title}
          description={track.description ?? `${track.tag} energy with a strong local signal and replay-friendly runtime.`}
        >
          <div className="flex flex-wrap gap-2">
            {[track.tag, track.genre ?? 'Scene signal', track.town ?? 'Puerto Rico'].map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300">
                {item}
              </span>
            ))}
          </div>
        </ContextRailCard>

        {comments.length ? (
          <ContextRailCard eyebrow="Listener notes" title="What people are saying">
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{comment.author}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{comment.body}</p>
                </div>
              ))}
            </div>
          </ContextRailCard>
        ) : null}

        <ContextRailCard eyebrow="Next cues" title="Keep this lane moving">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setQueue(playbackLane, 0, true)}
              className="button-primary w-full justify-center"
            >
              Play related lane
            </button>
            {relatedTracks.slice(0, 2).map((item, index) => (
              <Link
                key={item.title}
                to={`/tracks/${slugify(item.title)}`}
                onClick={() => setQueue(playbackLane, index + 1, true)}
                className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3 transition hover:bg-white/[0.06]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-white">{item.title}</span>
                  <span className="mt-1 block truncate text-xs text-zinc-500">{item.artist}</span>
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">{item.plays}</span>
              </Link>
            ))}
          </div>
        </ContextRailCard>

        {featuredPlaylist ? (
          <ContextRailCard
            eyebrow="Appears in"
            title={featuredPlaylist.title}
            description={featuredPlaylist.description}
          >
            <Link to={`/playlists/${slugify(featuredPlaylist.title)}`} className="inline-flex text-sm font-medium text-cyan-200 transition hover:text-white">
              Open playlist
            </Link>
          </ContextRailCard>
        ) : null}
      </>
    );
  }

  if (artistMatch) {
    const artist = artistDetail.artist;
    const tracks = artistDetail.tracks.length ? artistDetail.tracks : homeCatalog.tracks.filter((item) => item.artist === artist.name).slice(0, 3);
    const release = artistDetail.releases[0] ?? homeCatalog.releaseMoments[0];
    const show = artistDetail.shows[0] ?? homeCatalog.events[0];
    const merch = artistDetail.merch[0] ?? homeCatalog.merch[0];
    const following = isFollowingArtist(artist.name, artist.id);
    const showReminder = show ? isShowReminded(show.title, show.id) : false;
    const merchSaved = merch ? isMerchSaved(merch.title, merch.id) : false;

    return (
      <>
        <ContextRailCard
          eyebrow="Artist briefing"
          title={artist.name}
          description={artist.bio ?? `${artist.genre} rooted in ${artist.town} with growing audience and release momentum.`}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3">
              <p className="text-sm font-semibold text-white">{artist.followerLabel ?? '3.2K'}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">Followers</p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3">
              <p className="text-sm font-semibold text-white">{artist.monthlyListenersLabel ?? '12.4K'}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">Monthly</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void toggleArtistFollow(artist.name, artist.id)}
            className={`mt-4 w-full justify-center rounded-full px-4 py-3 text-sm font-semibold transition ${following ? 'bg-cyan-400/14 text-cyan-200' : 'bg-white/[0.05] text-zinc-200 hover:bg-white/[0.08] hover:text-white'}`}
          >
            {following ? 'Following artist' : 'Follow artist'}
          </button>
        </ContextRailCard>

        <ContextRailCard eyebrow="Artist lane" title="What to open next">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setQueue(tracks.map((item) => buildPlayerTrackFromUiTrack(item)), 0, true)}
              className="button-primary w-full justify-center"
            >
              Play top tracks
            </button>
            {[
              release ? `Release focus: ${release.title}` : null,
              show ? `Next show: ${show.title}` : null,
              merch ? `Merch signal: ${merch.title}` : null
            ]
              .filter(Boolean)
              .map((item) => (
                <div key={item} className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-zinc-300">
                  {item}
                </div>
              ))}
          </div>
        </ContextRailCard>

        {show ? (
          <ContextRailCard
            eyebrow="Next show"
            title={show.title}
            description={`${show.venue} | ${show.date}`}
          >
            <div className="space-y-3">
              <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-zinc-300">
                Ticket interest is live for this artist route, so this event now behaves like a real next-step CTA instead of passive metadata.
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void toggleShowReminder(show.title, show.id)}
                  className={`flex-1 justify-center rounded-full px-4 py-3 text-sm font-semibold transition ${showReminder ? 'bg-cyan-400/14 text-cyan-200' : 'bg-white/[0.05] text-zinc-200 hover:bg-white/[0.08] hover:text-white'}`}
                >
                  {showReminder ? 'Reminder on' : 'Remind me'}
                </button>
                <Link to="/shows" className="button-secondary flex-1 justify-center">
                  View shows
                </Link>
              </div>
            </div>
          </ContextRailCard>
        ) : null}

        {merch ? (
          <ContextRailCard
            eyebrow="Merch availability"
            title={merch.title}
            description={`${merch.price} | ${merch.edition}`}
          >
            <div className="space-y-3">
              <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-zinc-300">
                Available now from the artist surface, with the rail pointing to the exact item instead of a generic merch lane.
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void toggleMerchSave(merch.title, merch.id)}
                  className={`flex-1 justify-center rounded-full px-4 py-3 text-sm font-semibold transition ${merchSaved ? 'bg-cyan-400/14 text-cyan-200' : 'bg-white/[0.05] text-zinc-200 hover:bg-white/[0.08] hover:text-white'}`}
                >
                  {merchSaved ? 'Saved item' : 'Save item'}
                </button>
                <Link to="/merch" className="button-secondary flex-1 justify-center">
                  Browse merch
                </Link>
              </div>
            </div>
          </ContextRailCard>
        ) : null}
      </>
    );
  }

  if (playlistMatch) {
    const playlist = playlistDetail.playlist;
    const tracks = playlistDetail.tracks.length ? playlistDetail.tracks : homeCatalog.tracks.slice(0, 4);
    const featuredArtists = playlistDetail.artists.length ? playlistDetail.artists : homeCatalog.artists.slice(0, 3);
    const tags = playlist.moodTags?.length ? playlist.moodTags : ['mood', 'sequenced', 'editorial'];
    const openingTrack = tracks[0];

    return (
      <>
        <ContextRailCard eyebrow="Mix profile" title={playlist.title} description={playlist.description}>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300">
                {tag}
              </span>
            ))}
          </div>
        </ContextRailCard>

        {openingTrack ? (
          <ContextRailCard
            eyebrow="Opening cue"
            title={openingTrack.title}
            description={`${openingTrack.artist} | ${openingTrack.duration}`}
          >
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setQueue(tracks.map((item) => buildPlayerTrackFromUiTrack(item)), 0, true)}
                className="button-primary w-full justify-center"
              >
                Start from track one
              </button>
              <p className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3 text-sm leading-6 text-zinc-300">
                The first track now gets explicit support in the rail, so the mix has a visible entry point instead of only a playlist-level CTA.
              </p>
            </div>
          </ContextRailCard>
        ) : null}

        <ContextRailCard eyebrow="Playlist lane" title="Play or branch out">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setQueue(tracks.map((item) => buildPlayerTrackFromUiTrack(item)), 0, true)}
              className="button-primary w-full justify-center"
            >
              Play this mix
            </button>
            {featuredArtists.slice(0, 2).map((artist) => (
              <Link
                key={artist.name}
                to={`/artists/${slugify(artist.name)}`}
                className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3 transition hover:bg-white/[0.06]"
              >
                <span className="text-sm font-semibold text-white">{artist.name}</span>
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">{artist.genre}</span>
              </Link>
            ))}
          </div>
        </ContextRailCard>
      </>
    );
  }

  if (location.pathname.startsWith('/admin')) {
    return (
      <>
        <ContextRailCard eyebrow="Ops notes" title="Admin focus">
          <div className="space-y-3">
            {['Verification reviews should stay under 48h.', 'Featured slots should reflect real catalog momentum.', 'Moderation notes belong in the audit trail, not in chat.'].map((item) => (
              <div key={item} className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-zinc-300">
                {item}
              </div>
            ))}
          </div>
        </ContextRailCard>
      </>
    );
  }

  return (
    <>
      <ContextRailCard eyebrow="Scene briefing" title="What is moving this week">
        <div className="space-y-3">
          {[
            homeCatalog.releaseMoments[0] ? `Release radar: ${homeCatalog.releaseMoments[0].title}` : null,
            homeCatalog.events[0] ? `Show pulse: ${homeCatalog.events[0].title}` : null,
            homeCatalog.merch[0] ? `Merch cue: ${homeCatalog.merch[0].title}` : null
          ]
            .filter(Boolean)
            .map((item) => (
              <div key={item} className="rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-zinc-300">
                {item}
              </div>
            ))}
        </div>
      </ContextRailCard>

      <ContextRailCard eyebrow="Discovery cue" title="Open a deeper route">
        <div className="space-y-3">
          {homeCatalog.artists.slice(0, 2).map((artist) => (
            <Link
              key={artist.name}
              to={`/artists/${slugify(artist.name)}`}
              className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3 transition hover:bg-white/[0.06]"
            >
              <span className="text-sm font-semibold text-white">{artist.name}</span>
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">{artist.genre}</span>
            </Link>
          ))}
        </div>
      </ContextRailCard>
    </>
  );
}

export function AppShell() {
  const { user, logout } = useAuthStore();
  const { hydrateFromApi, clearEngagement } = useEngagementStore((state) => ({
    hydrateFromApi: state.hydrateFromApi,
    clearEngagement: state.clear
  }));
  const libraryQuery = useUserLibraryQuery(Boolean(user));
  const location = useLocation();
  const navigate = useNavigate();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const desktopSearchRef = useRef<HTMLInputElement | null>(null);
  const mobileSearchRef = useRef<HTMLInputElement | null>(null);
  const desktopSearchShellRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchShellRef = useRef<HTMLDivElement | null>(null);
  const trackRouteMatch = useMatch('/tracks/:id');
  const artistRouteMatch = useMatch('/artists/:id');
  const playlistRouteMatch = useMatch('/playlists/:id');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>('all');
  const [librarySort, setLibrarySort] = useState<LibrarySort>('recent');
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);
  const [headerScrollY, setHeaderScrollY] = useState(0);
  const { currentTrack, queue, currentIndex, setQueue, setTrack } = usePlayerStore((state) => ({
    currentTrack: state.currentTrack,
    queue: state.queue,
    currentIndex: state.currentIndex,
    setQueue: state.setQueue,
    setTrack: state.setTrack
  }));

  useEffect(() => {
    const nextQuery = location.pathname === '/discover' ? new URLSearchParams(location.search).get('q') ?? '' : '';
    setSearchQuery(nextQuery);
    setSearchPanelOpen(false);
    setMobileSearchExpanded(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    try {
      const storedHistory = JSON.parse(window.localStorage.getItem(SEARCH_HISTORY_KEY) ?? '[]');
      setRecentSearches(Array.isArray(storedHistory) ? storedHistory.filter((value): value is string => typeof value === 'string').slice(0, 6) : []);
    } catch {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    try {
      setIsLibraryCollapsed(window.localStorage.getItem(LIBRARY_COLLAPSE_KEY) === 'true');
    } catch {
      setIsLibraryCollapsed(false);
    }
  }, []);

  const queueSeed = useMemo(
    () => (libraryQuery.data?.likedTracks ?? []).map((track) => buildPlayerTrack(track)),
    [libraryQuery.data?.likedTracks]
  );

  useEffect(() => {
    if (!queue.length && queueSeed.length) {
      setQueue(queueSeed, 0, false);
    }
  }, [queue.length, queueSeed, setQueue]);

  useEffect(() => {
    if (!user) {
      clearEngagement();
      return;
    }

    void hydrateFromApi(user.id);
  }, [clearEngagement, hydrateFromApi, user]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!desktopSearchShellRef.current?.contains(target) && !mobileSearchShellRef.current?.contains(target)) {
        setSearchPanelOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchPanelOpen(false);
        setMobileSearchExpanded(false);
        return;
      }

      if (event.key === '/' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        if (window.innerWidth < 768) {
          setMobileSearchExpanded(true);
        }
        const target = window.innerWidth >= 768 ? desktopSearchRef.current : mobileSearchRef.current;
        target?.focus();
        setSearchPanelOpen(true);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const syncScroll = () => {
      setHeaderScrollY(window.scrollY);
    };

    syncScroll();
    window.addEventListener('scroll', syncScroll, { passive: true });
    return () => window.removeEventListener('scroll', syncScroll);
  }, []);

  useEffect(() => {
    const shellElement = shellRef.current;
    const headerElement = headerRef.current;
    const playerElement = document.querySelector<HTMLElement>('.global-player-shell');

    if (!shellElement || !headerElement) return;

    const syncRailOffsets = () => {
      const headerHeight = headerElement.getBoundingClientRect().height;
      const playerHeight = playerElement?.getBoundingClientRect().height ?? 112;
      shellElement.style.setProperty('--desktop-rail-top', `${Math.round(headerHeight + 24)}px`);
      shellElement.style.setProperty('--desktop-rail-bottom', `${Math.round(playerHeight + 24)}px`);
    };

    syncRailOffsets();

    const resizeObserver = new ResizeObserver(() => {
      syncRailOffsets();
    });

    resizeObserver.observe(headerElement);
    if (playerElement) {
      resizeObserver.observe(playerElement);
    }

    window.addEventListener('resize', syncRailOffsets);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncRailOffsets);
    };
  }, []);

  useEffect(() => {
    if (!mobileSearchExpanded) return;

    const frame = window.requestAnimationFrame(() => {
      mobileSearchRef.current?.focus();
      setSearchPanelOpen(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [mobileSearchExpanded]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LIBRARY_COLLAPSE_KEY, String(isLibraryCollapsed));
    } catch {
      // Ignore persistence issues and keep the in-memory state working.
    }
  }, [isLibraryCollapsed]);

  const libraryEntries = useMemo(() => {
    const playlists: LibraryEntry[] = (libraryQuery.data?.savedPlaylists ?? []).map((playlist, index) => ({
      id: playlist.id,
      title: playlist.title,
      subtitle: `Playlist | ${playlist.countLabel}`,
      to: `/playlists/${playlist.slug}`,
      type: 'playlist',
      accentClass: ['from-violet-500 to-sky-300', 'from-fuchsia-500 to-indigo-500', 'from-yellow-300 to-orange-500'][index % 3],
      artworkUrl: playlist.coverUrl,
      trailing: formatSavedDate(playlist.savedAt) ?? 'Saved'
    }));

    const tracks: LibraryEntry[] = (libraryQuery.data?.likedTracks ?? []).map((track, index) => ({
      id: track.id,
      title: track.title,
      subtitle: `Track | ${track.artistName}`,
      to: `/tracks/${track.slug}`,
      type: 'track',
      accentClass: ['from-orange-400 to-rose-500', 'from-emerald-400 to-cyan-400', 'from-violet-500 to-sky-300'][index % 3],
      artworkUrl: track.artworkUrl,
      trailing: formatSavedDate(track.likedAt ?? track.savedAt) ?? track.playsLabel,
      playerTrack: buildPlayerTrack(track)
    }));

    const artistCounts = new Map<string, LibraryEntry>();

    for (const track of libraryQuery.data?.likedTracks ?? []) {
      const existing = artistCounts.get(track.artistSlug);
      if (existing) {
        const currentCount = Number((existing.trailing ?? '1 saved').replace(/\D/g, '')) || 1;
        existing.trailing = `${currentCount + 1} saved`;
      } else {
        artistCounts.set(track.artistSlug, {
          id: `artist-${track.artistSlug}`,
          title: track.artistName,
          subtitle: `Artist | ${track.town ?? track.genre ?? 'Scene signal'}`,
          to: `/artists/${track.artistSlug}`,
          type: 'artist',
          accentClass: 'from-emerald-400 to-cyan-400',
          trailing: '1 saved',
          artworkUrl: null
        });
      }
    }

    const artists = Array.from(artistCounts.values());

    const allEntries = [...playlists, ...artists, ...tracks];
    const fallbackEntries = fallbackLibraryEntries.filter((entry) => {
      if (libraryFilter === 'all') return true;
      if (libraryFilter === 'saved') return entry.type === 'playlist' || entry.type === 'track';
      return entry.type === libraryFilter.slice(0, -1);
    }) as LibraryEntry[];

    const filteredEntries = allEntries.filter((entry) => {
      if (libraryFilter === 'all') return true;
      if (libraryFilter === 'saved') return entry.type === 'playlist' || entry.type === 'track';
      return entry.type === libraryFilter.slice(0, -1);
    });

    const sortedEntries = [...filteredEntries].sort((left, right) => {
      if (librarySort === 'alpha') {
        return left.title.localeCompare(right.title);
      }

      return 0;
    });

    return sortedEntries.length ? sortedEntries : fallbackEntries;
  }, [libraryFilter, libraryQuery.data, librarySort]);

  const upNext = useMemo(() => queue.slice(currentIndex + 1, currentIndex + 4), [currentIndex, queue]);
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const searchResultsQuery = useDiscoverySearchQuery(searchPanelOpen ? deferredSearchQuery : '');
  const searchCatalog = buildSearchCatalog(searchResultsQuery.data);
  const mobileNavLinks = useMemo(() => {
    const links = topLinks.filter(([to]) => to === '/');

    if (location.pathname.startsWith('/playlists')) {
      links.push(['/playlists', 'Playlists']);
    } else if (location.pathname.startsWith('/liked-songs')) {
      links.push(['/liked-songs', 'Likes']);
    } else if (location.pathname.startsWith('/admin')) {
      links.push(['/admin', 'Admin']);
    } else if (location.pathname.startsWith('/artist')) {
      links.push(['/artist/dashboard', 'Studio']);
    }

    return links;
  }, [location.pathname]);

  const searchSuggestions = useMemo<SearchSuggestion[]>(() => {
    if (!deferredSearchQuery) return [];

    return [
      ...searchCatalog.artists.slice(0, 3).map((artist) => ({
        id: `artist-${artist.id ?? artist.name}`,
        title: artist.name,
        meta: `${artist.genre} | ${artist.town}`,
        to: `/artists/${slugify(artist.name)}`,
        section: 'Artists' as const
      })),
      ...searchCatalog.tracks.slice(0, 4).map((track) => ({
        id: `track-${track.id ?? track.title}`,
        title: track.title,
        meta: `${track.artist} | ${track.plays}`,
        to: `/tracks/${slugify(track.title)}`,
        section: 'Tracks' as const
      })),
      ...searchCatalog.playlists.slice(0, 3).map((playlist) => ({
        id: `playlist-${playlist.id ?? playlist.title}`,
        title: playlist.title,
        meta: playlist.count,
        to: `/playlists/${slugify(playlist.title)}`,
        section: 'Playlists' as const
      })),
      ...searchCatalog.events.slice(0, 2).map((event) => ({
        id: `event-${event.id ?? event.title}`,
        title: event.title,
        meta: `${event.venue} | ${event.date}`,
        to: '/shows',
        section: 'Shows' as const
      })),
      ...searchCatalog.merch.slice(0, 2).map((item) => ({
        id: `merch-${item.id ?? item.title}`,
        title: item.title,
        meta: `${item.price} | ${item.edition}`,
        to: '/merch',
        section: 'Merch' as const
      }))
    ];
  }, [deferredSearchQuery, searchCatalog.artists, searchCatalog.events, searchCatalog.merch, searchCatalog.playlists, searchCatalog.tracks]);

  function pushRecentSearch(query: string) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const nextHistory = [trimmedQuery, ...recentSearches.filter((item) => item.toLowerCase() !== trimmedQuery.toLowerCase())].slice(0, 6);
    setRecentSearches(nextHistory);

    try {
      window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(nextHistory));
    } catch {
      // Ignore persistence failures and keep search usable.
    }
  }

  function openSearchResults(query: string) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchPanelOpen(false);
      void navigate('/discover');
      return;
    }

    pushRecentSearch(trimmedQuery);
    setSearchPanelOpen(false);

    const params = new URLSearchParams();
    params.set('q', trimmedQuery);

    void navigate({
      pathname: '/discover',
      search: `?${params.toString()}`
    });
  }

  function navigateFromSearch(to: string, query: string) {
    if (query.trim()) {
      pushRecentSearch(query);
    }

    setSearchPanelOpen(false);
    void navigate(to);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    openSearchResults(searchQuery);
  }

  const profileInitials = user?.email.slice(0, 2).toUpperCase() ?? 'LC';
  const profileLabel = user ? user.email.split('@')[0] : 'Profile';
  const roleLinks = roleLinksForUser(user?.role);
  const createLink = user?.role === 'ARTIST' || user?.role === 'VERIFIED_ARTIST' ? '/artist/upload' : user ? '/playlists' : '/login';
  const libraryCounts = libraryQuery.data?.counts ?? { likedTracks: 0, savedTracks: 0, savedPlaylists: 0 };
  const isImmersiveRoute = Boolean(trackRouteMatch || artistRouteMatch || playlistRouteMatch);
  const headerProgress = Math.min(headerScrollY / (isImmersiveRoute ? 220 : 96), 1);

  return (
    <div ref={shellRef} className="min-h-screen bg-[#070707] pb-32 text-zinc-100">
      <div className="px-2 py-2 xl:px-3">
        <header
          ref={headerRef}
          className="app-shell-header sticky top-2 z-40 mb-4 rounded-[28px] border border-white/10 px-5 py-4 backdrop-blur md:px-7"
          style={{ ['--header-progress' as string]: headerProgress }}
        >
          <div className="flex items-center justify-between gap-4">
            <nav className="hidden min-w-0 flex-1 items-center gap-4 md:flex">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                {topLinks.map(([to, label]) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `whitespace-nowrap text-sm transition ${
                        isActive ? 'text-white' : 'text-zinc-300 hover:text-white'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
                {roleLinks.map(([to, label]) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `whitespace-nowrap text-sm transition ${
                        isActive ? 'text-white' : 'text-zinc-300 hover:text-white'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
                <FavoritesNavLink />
              </div>
            </nav>

            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <Link
                to="/"
                aria-label="Home"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white transition hover:bg-white/5"
              >
                <HomeIcon />
              </Link>

              <div ref={desktopSearchShellRef} className="search-command-shell relative w-[360px]">
                <form onSubmit={handleSearchSubmit} className="flex items-center rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-zinc-400">
                  <input
                    ref={desktopSearchRef}
                    type="text"
                    value={searchQuery}
                    onFocus={() => setSearchPanelOpen(true)}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="What do you want to play?"
                    className="w-full border-0 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
                  />
                  <span className="search-command-hint ml-3 hidden rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 lg:inline-flex">
                    /
                  </span>
                </form>
                <SearchCommandPanel
                  open={searchPanelOpen}
                  query={searchQuery.trim()}
                  isLoading={searchResultsQuery.isLoading}
                  suggestions={searchSuggestions}
                  recentSearches={recentSearches}
                  onSearch={openSearchResults}
                  onNavigate={navigateFromSearch}
                />
              </div>
            </div>

            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <Link to="/" className="hidden text-lg font-semibold tracking-tight text-white transition hover:text-zinc-200 lg:inline-flex">
                MusiPR
              </Link>
              <Link
                to={user ? '/profile' : '/login'}
                aria-label={user ? 'Open profile' : 'Open login'}
                className="inline-flex shrink-0 items-center gap-3 rounded-full border border-white/10 bg-black/30 p-1.5 pr-4 text-sm font-medium text-white transition hover:bg-black/45"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 via-cyan-400 to-blue-500 text-xs font-semibold text-black">
                  {profileInitials}
                </span>
                <span className="hidden max-w-[120px] truncate sm:inline">{profileLabel}</span>
              </Link>
              {user ? (
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="hidden rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-black/45 hover:text-white lg:inline-flex"
                >
                  Log out
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-2 md:hidden">
            <div className="flex items-center gap-2">
              <Link to="/" className="shrink-0 text-[15px] font-semibold tracking-tight text-white transition hover:text-zinc-200">
                MusiPR
              </Link>
              <nav className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden whitespace-nowrap text-[13px] text-zinc-300">
                {mobileNavLinks.map(([to, label]) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `shrink-0 transition ${
                        isActive ? 'text-white' : 'text-zinc-300 hover:text-white'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
              <div className="flex shrink-0 items-center gap-1.5">
                <FavoritesNavLink compact />
                <button
                  type="button"
                  onClick={() => {
                    setMobileSearchExpanded((value) => !value);
                    if (mobileSearchExpanded) {
                      setSearchPanelOpen(false);
                    }
                  }}
                  aria-label="Open search"
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                    mobileSearchExpanded
                      ? 'border-cyan-300/30 bg-cyan-400/12 text-cyan-200'
                      : 'border-white/10 bg-black/30 text-white hover:bg-white/5'
                  }`}
                >
                  <SearchIcon />
                </button>
                <Link
                  to={user ? '/profile' : '/login'}
                  aria-label={user ? 'Open profile' : 'Open login'}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white transition hover:bg-black/45"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 via-cyan-400 to-blue-500 text-[10px] font-semibold text-black">
                    {profileInitials}
                  </span>
                </Link>
              </div>
            </div>

            {mobileSearchExpanded ? (
              <div ref={mobileSearchShellRef} className="search-command-shell">
                <form onSubmit={handleSearchSubmit} className="flex items-center rounded-full border border-white/10 bg-black/20 px-3.5 py-1.5 text-sm text-zinc-400">
                  <input
                    ref={mobileSearchRef}
                    type="text"
                    value={searchQuery}
                    onFocus={() => setSearchPanelOpen(true)}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search music"
                    className="w-full border-0 bg-transparent text-[13px] text-zinc-200 outline-none placeholder:text-zinc-500"
                  />
                </form>
                <SearchCommandPanel
                  open={searchPanelOpen}
                  query={searchQuery.trim()}
                  isLoading={searchResultsQuery.isLoading}
                  suggestions={searchSuggestions}
                  recentSearches={recentSearches}
                  onSearch={openSearchResults}
                  onNavigate={navigateFromSearch}
                />
              </div>
            ) : null}
          </div>
        </header>

        <div
          className="app-shell-grid min-h-screen gap-3"
          style={{ ['--library-width' as string]: isLibraryCollapsed ? '92px' : '320px' }}
        >
          <aside className="desktop-rail-shell hidden lg:block">
            <section
              className={`library-rail desktop-rail-panel flex min-h-0 flex-1 flex-col rounded-[26px] border border-white/10 bg-[#121212] ${isLibraryCollapsed ? 'p-3' : 'p-4'}`}
              data-collapsed={isLibraryCollapsed ? 'true' : 'false'}
            >
              <div className="flex items-center justify-between gap-3">
                {isLibraryCollapsed ? (
                  <div className="flex w-full flex-col items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-200">
                      <LibraryIcon />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLibraryCollapsed(false)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      <ChevronRailIcon collapsed />
                    </button>
                    <Link
                      to={createLink}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg font-semibold text-white transition hover:bg-white/[0.08]"
                    >
                      +
                    </Link>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Collection</p>
                      <h2 className="mt-1 text-lg font-semibold text-white">Your library</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={createLink}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                      >
                        <span className="text-base leading-none">+</span>
                        <span>Create</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setIsLibraryCollapsed(true)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        <ChevronRailIcon collapsed={false} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {isLibraryCollapsed ? null : (
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {libraryFilters.map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setLibraryFilter(value)}
                        className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                          libraryFilter === value
                            ? 'border-cyan-300/30 bg-cyan-400/12 text-cyan-200'
                            : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-3 py-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                      <span>{libraryEntries.length} items</span>
                    </div>
                    <div className="flex gap-2">
                      {(['recent', 'alpha'] as const).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setLibrarySort(value)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            librarySort === value ? 'bg-white text-black' : 'bg-white/[0.05] text-zinc-300 hover:text-white'
                          }`}
                        >
                          {value === 'recent' ? 'Recent' : 'A-Z'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      ['Liked', String(libraryCounts.likedTracks)],
                      ['Saved', String(libraryCounts.savedTracks)],
                      ['Lists', String(libraryCounts.savedPlaylists)]
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[20px] border border-white/10 bg-white/[0.03] px-3 py-3">
                        <p className="text-lg font-semibold text-white">{value}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className={`mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto ${isLibraryCollapsed ? '' : 'pr-1'}`}>
                {libraryEntries.map((entry, index) => {
                  const isActive = location.pathname === entry.to;

                  return (
                    <Link
                      key={entry.id}
                      to={entry.to}
                      onClick={() => {
                        if (entry.type === 'track') {
                          const queueIndex = queueSeed.findIndex((item) => item.id === entry.id);
                          if (queueSeed.length && queueIndex >= 0) {
                            setQueue(queueSeed, queueIndex, true);
                          } else if (entry.playerTrack) {
                            setTrack(entry.playerTrack);
                          }
                        }
                      }}
                      className={`library-entry group relative flex items-center ${isLibraryCollapsed ? 'justify-center' : 'gap-3'} rounded-[22px] border ${isLibraryCollapsed ? 'px-2 py-3' : 'px-3 py-3'} transition ${
                        isActive
                          ? 'border-cyan-300/30 bg-cyan-400/10'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}
                      title={isLibraryCollapsed ? entry.title : undefined}
                    >
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-br ${entry.accentClass}`}>
                        {entry.artworkUrl ? (
                          <img src={entry.artworkUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold text-black">{initialsFromTitle(entry.title)}</span>
                        )}
                      </div>
                      {isLibraryCollapsed ? null : (
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{entry.title}</p>
                              <p className="mt-1 truncate text-xs text-zinc-500">{entry.subtitle}</p>
                            </div>
                            <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{entry.trailing ?? String(index + 1).padStart(2, '0')}</span>
                          </div>
                        </div>
                      )}
                      {isLibraryCollapsed ? (
                        <div className="library-entry-flyout pointer-events-none absolute left-full top-1/2 z-20 ml-3 w-56 -translate-y-1/2 rounded-[20px] border border-white/10 bg-[#161616f2] p-3 shadow-[0_24px_50px_rgba(0,0,0,0.34)] backdrop-blur">
                          <p className="truncate text-sm font-semibold text-white">{entry.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">{entry.subtitle}</p>
                          <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                            {entry.trailing ?? String(index + 1).padStart(2, '0')}
                          </p>
                        </div>
                      ) : null}
                    </Link>
                  );
                })}
              </div>

              {isLibraryCollapsed ? null : (
                <div className="mt-4 rounded-[22px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(59,130,246,0.08))] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Library tip</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-200">Use likes and playlist saves to shape your queue. The player now pulls from this rail instead of acting like a disconnected demo footer.</p>
                </div>
              )}
            </section>
          </aside>

          <div className="min-w-0">
            <section className="rounded-[30px] border border-white/10 bg-[#121212]">
              <main className="min-w-0 px-4 pb-8 pt-5 md:px-7">
                <Outlet />
              </main>
            </section>
          </div>

          <aside className="desktop-rail-shell hidden xl:block">
            <section className="desktop-rail-scroll space-y-4 rounded-[26px] border border-white/10 bg-[#121212] p-4">
              <article className="rounded-[24px] border border-white/10 bg-[#181818] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Now playing</p>
                    <p className="mt-1 text-lg font-semibold text-white">{currentTrack?.title ?? 'Queue standing by'}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
                    {queue.length ? `${currentIndex + 1}/${queue.length}` : 'Idle'}
                  </span>
                </div>

                <div className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-br from-cyan-300/25 via-slate-700/30 to-slate-900">
                  {currentTrack?.artworkUrl ? (
                    <img src={currentTrack.artworkUrl} alt="" className="aspect-[4/5] w-full object-cover" />
                  ) : (
                    <div className="aspect-[4/5] w-full bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.25),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(14,116,144,0.55))]" />
                  )}
                </div>

                <p className="mt-4 text-base font-medium text-white">{currentTrack?.artist ?? 'Pick a track from your library or discovery.'}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {currentTrack?.sourceLabel ?? 'Queue-aware playback, transport controls, and source context now live in the shell.'}
                </p>
                {currentTrack?.sourceHref ? (
                  <Link to={currentTrack.sourceHref} className="mt-4 inline-flex text-sm font-medium text-cyan-200 transition hover:text-white">
                    Open source page
                  </Link>
                ) : null}
              </article>

              <RouteContextRail />

              <article className="rounded-[24px] border border-white/10 bg-[#181818] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Up next</p>
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">{queue.length} queued</span>
                </div>
                <div className="mt-4 space-y-3">
                  {upNext.length ? (
                    upNext.map((track, index) => (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => setQueue(queue, currentIndex + index + 1, true)}
                        className="flex w-full items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-3 text-left transition hover:bg-white/[0.06]"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-cyan-300 to-blue-500">
                          {track.artworkUrl ? <img src={track.artworkUrl} alt="" className="h-full w-full object-cover" /> : <span className="text-xs font-semibold text-black">{String(currentIndex + index + 2).padStart(2, '0')}</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{track.title}</p>
                          <p className="mt-1 truncate text-xs text-zinc-500">{track.artist}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-[18px] border border-dashed border-white/10 px-4 py-4 text-sm leading-6 text-zinc-400">Choose a track from the library or discovery routes and the queue will start filling in here.</p>
                  )}
                </div>
              </article>
            </section>
          </aside>
        </div>
      </div>

      <GlobalPlayer />
    </div>
  );
}
