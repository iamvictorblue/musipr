import type {
  ArtistDetailResponse,
  CatalogArtist,
  CatalogEvent,
  CatalogMerch,
  CatalogPlaylist,
  CatalogRelease,
  CatalogTrack,
  DiscoveryHomeResponse,
  DiscoverySearchResponse,
  PlaylistDetailResponse,
  TrackDetailResponse
} from '../api/catalog';
import bandPortrait from '../assets/editorial/band-portrait.jpg';
import liveCrowd from '../assets/editorial/live-crowd.jpg';
import lunaPortrait from '../assets/editorial/luna-portrait.jpg';
import turntableGreen from '../assets/editorial/turntable-green.jpg';
import turntableWarm from '../assets/editorial/turntable-warm.jpg';

export type AccentTone = 'ember' | 'tide' | 'gold';

export type UiArtist = {
  name: string;
  town: string;
  genre: string;
  accent: AccentTone;
  imageSrc?: string;
  followerLabel?: string;
  monthlyListenersLabel?: string;
  bio?: string | null;
  merchCount?: number;
  eventCount?: number;
};

export type UiTrack = {
  title: string;
  artist: string;
  tag: string;
  plays: string;
  duration: string;
  accent: AccentTone;
  imageSrc?: string;
  description?: string | null;
  commentCount?: number;
  genre?: string | null;
  town?: string | null;
};

export type UiPlaylist = {
  title: string;
  description: string;
  count: string;
  accent: AccentTone;
  imageSrc?: string;
  moodTags?: string[];
  trackCount?: number;
};

export type UiEvent = {
  title: string;
  venue: string;
  date: string;
  accent: AccentTone;
  imageSrc?: string;
  town?: string;
  artist?: string;
};

export type UiMerch = {
  title: string;
  price: string;
  edition: string;
  accent: AccentTone;
  imageSrc?: string;
  artist?: string;
};

export type UiReleaseMoment = {
  title: string;
  artist: string;
  note: string;
  accent: AccentTone;
  imageSrc?: string;
};

export const sceneTags = ['electro caribe', 'santurce afterhours', 'indie boricua', 'afro-house', 'trap isle', 'live sessions'];

export const activityFeed = [
  'Luna Costa sold 14 poster packs in the last 24h',
  'Calle Solar added a new live date in Ponce',
  'Mar Azul Colectivo broke into 12K weekly plays',
  'Brisa en Loiza is trending in Santurce right now'
];

export const cityScenes = [
  { city: 'Santurce', mood: 'Late-night synths, pop-ups, listening rooms', accent: 'ember' as const, imageSrc: liveCrowd },
  { city: 'Ponce', mood: 'Gritty alt urbano and guitar-forward releases', accent: 'tide' as const, imageSrc: bandPortrait },
  { city: 'Mayaguez', mood: 'Caribbean soul, indie collectives, warm electronics', accent: 'gold' as const, imageSrc: turntableGreen }
];

export const fallbackArtists: UiArtist[] = [
  { name: 'Luna Costa', town: 'Santurce', genre: 'Electro indie', accent: 'ember', imageSrc: lunaPortrait },
  { name: 'Mar Azul Colectivo', town: 'Mayaguez', genre: 'Caribbean soul', accent: 'tide', imageSrc: bandPortrait },
  { name: 'Calle Solar', town: 'Ponce', genre: 'Alt urbano', accent: 'gold', imageSrc: bandPortrait }
];

export const fallbackTracks: UiTrack[] = [
  { title: 'Brisa en Loiza', artist: 'Luna Costa', tag: 'Rising now', plays: '8.4K plays', duration: '3:18', accent: 'ember', imageSrc: turntableWarm },
  { title: 'Noche en Rio Piedras', artist: 'Calle Solar', tag: 'Hot in Santurce', plays: '5.1K plays', duration: '2:58', accent: 'tide', imageSrc: liveCrowd },
  { title: 'Marea Lenta', artist: 'Mar Azul Colectivo', tag: 'Editorial pick', plays: '12K plays', duration: '4:06', accent: 'gold', imageSrc: turntableGreen },
  { title: 'Postal de Isabela', artist: 'Mar de Fondo', tag: 'Fresh upload', plays: '1.9K plays', duration: '3:41', accent: 'ember', imageSrc: lunaPortrait }
];

export const fallbackPlaylists: UiPlaylist[] = [
  { title: 'Indie Boricua', description: 'Textured guitars, humid synths, and coastal melancholy.', count: '18 tracks', accent: 'gold', imageSrc: turntableGreen },
  { title: 'Trap y Calle', description: 'Hard drums, sharp hooks, and late-night momentum.', count: '24 tracks', accent: 'ember', imageSrc: liveCrowd },
  { title: 'Alt Caribe', description: 'Forward-thinking releases shaped by island rhythm.', count: '15 tracks', accent: 'tide', imageSrc: bandPortrait }
];

export const fallbackEvents: UiEvent[] = [
  { title: 'Noches en La Respuesta', venue: 'Santurce', date: 'Fri 8PM', accent: 'tide', imageSrc: liveCrowd },
  { title: 'Atardecer en Ponce', venue: 'Ponce', date: 'Sat 6PM', accent: 'gold', imageSrc: liveCrowd }
];

export const fallbackMerch: UiMerch[] = [
  { title: 'Brisa Tour Tee', price: '$30', edition: '100-piece screenprint run', accent: 'ember', imageSrc: lunaPortrait },
  { title: 'Alt Caribe Vinyl', price: '$40', edition: 'Pressed in smoky amber', accent: 'gold', imageSrc: turntableGreen },
  { title: 'Santurce Poster Pack', price: '$18', edition: 'Signed by featured artists', accent: 'tide', imageSrc: bandPortrait }
];

export const fallbackReleaseMoments: UiReleaseMoment[] = [
  { title: 'Costa Norte EP', artist: 'Luna Costa', note: '3 days to release', accent: 'ember', imageSrc: lunaPortrait },
  { title: 'Asfalto Humedo', artist: 'Calle Solar', note: '8 days to release', accent: 'tide', imageSrc: liveCrowd },
  { title: 'Sal en la Piel', artist: 'Mar Azul Colectivo', note: '12 days to release', accent: 'gold', imageSrc: turntableGreen }
];

function accentForValue(value?: string | null): AccentTone {
  const normalized = (value ?? 'musipr').toLowerCase();
  const total = normalized.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const tones: AccentTone[] = ['ember', 'tide', 'gold'];
  return tones[total % tones.length];
}

function imageForValue(value?: string | null) {
  const normalized = (value ?? '').toLowerCase();

  if (normalized.includes('luna') || normalized.includes('poster')) return lunaPortrait;
  if (normalized.includes('mar azul') || normalized.includes('alt caribe') || normalized.includes('marea')) return turntableGreen;
  if (normalized.includes('playlists') || normalized.includes('trap') || normalized.includes('rio piedras') || normalized.includes('show')) return liveCrowd;
  if (normalized.includes('calle') || normalized.includes('ponce') || normalized.includes('merch')) return bandPortrait;
  if (normalized.includes('brisa') || normalized.includes('release')) return turntableWarm;
  return accentForValue(value) === 'gold' ? turntableGreen : accentForValue(value) === 'tide' ? liveCrowd : bandPortrait;
}

function compactLabel(value?: number | null, suffix?: string) {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  const amount = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
  return suffix ? `${amount} ${suffix}` : amount;
}

function formatDuration(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '3:24';
  const minutes = Math.floor(value / 60);
  const seconds = Math.max(0, value % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatEventDate(value?: string | Date | null) {
  if (!value) return 'Fri 8PM';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fri 8PM';
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', hour: 'numeric' }).format(date);
}

function formatReleaseNote(value?: string | Date | null) {
  if (!value) return '3 days to release';

  const isDateString = typeof value === 'string' && !Number.isNaN(Date.parse(value));
  if (typeof value === 'string' && value.trim() && !isDateString) return value;

  const releaseDate = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(releaseDate.getTime())) return '3 days to release';

  const diffDays = Math.max(0, Math.ceil((releaseDate.getTime() - Date.now()) / 86400000));
  if (diffDays <= 1) return 'Tomorrow';
  return `${diffDays} days to release`;
}

function formatPrice(value?: number | string | null) {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && !Number.isNaN(value)) return `$${Math.round(value / 100)}`;
  return '$30';
}

export function tagsForPlaylist(title: string) {
  switch (title) {
    case 'Trap y Calle':
      return ['hard drums', 'midnight hooks', 'club pressure', 'new in rotation'];
    case 'Alt Caribe':
      return ['island rhythms', 'warm electronics', 'editorial pick', 'hybrid pop'];
    default:
      return ['humid guitars', 'late-night synths', 'coastal melancholy', 'editorial pick'];
  }
}

export function tracksForPlaylistFallback(title: string) {
  switch (title) {
    case 'Trap y Calle':
      return [fallbackTracks[1], fallbackTracks[0], fallbackTracks[3]];
    case 'Alt Caribe':
      return [fallbackTracks[2], fallbackTracks[0], fallbackTracks[3]];
    default:
      return [fallbackTracks[0], fallbackTracks[2], fallbackTracks[3]];
  }
}

export function merchForArtistFallback(name: string) {
  switch (name) {
    case 'Calle Solar':
      return [fallbackMerch[1], fallbackMerch[2]];
    case 'Mar Azul Colectivo':
      return [fallbackMerch[0], fallbackMerch[1]];
    default:
      return [fallbackMerch[0], fallbackMerch[2]];
  }
}

export function mapArtist(artist: CatalogArtist): UiArtist {
  const source = artist as CatalogArtist & {
    artistName?: string;
    monthlyListeners?: number;
    followerCount?: number;
    merchClicks?: number;
    ticketClicks?: number;
    genres?: Array<string | { name?: string }>;
  };
  const name = source.name ?? source.artistName ?? 'Featured artist';
  const genreList = (source.genres ?? [])
    .map((genre) =>
      typeof genre === 'string' ? genre : typeof genre === 'object' && genre ? ((genre as { name?: string }).name ?? '') : ''
    )
    .filter(Boolean);

  return {
    name,
    town: source.town ?? 'Puerto Rico',
    genre: source.genre ?? genreList[0] ?? 'Featured artist',
    accent: accentForValue(source.slug ?? name),
    imageSrc: imageForValue(source.slug ?? name),
    followerLabel: source.followerLabel ?? compactLabel(source.followerCount),
    monthlyListenersLabel: source.monthlyListenersLabel ?? compactLabel(source.monthlyListeners),
    bio: source.bio,
    merchCount: source.merchCount,
    eventCount: source.eventCount
  };
}

export function mapTrack(track: CatalogTrack): UiTrack {
  const source = track as CatalogTrack & {
    artistProfile?: { artistName?: string; town?: string | null };
    playCount?: number;
    durationSec?: number;
    genre?: string | { name?: string } | null;
  };
  const title = source.title ?? 'Untitled track';
  const artist = source.artistName ?? source.artistProfile?.artistName ?? 'Featured artist';
  const genre =
    typeof source.genre === 'string'
      ? source.genre
      : typeof source.genre === 'object' && source.genre
        ? ((source.genre as { name?: string }).name ?? null)
        : null;
  const slugSource = source.slug ?? title;

  return {
    title,
    artist,
    tag: source.tag ?? 'Featured track',
    plays: source.playsLabel ?? compactLabel(source.playCount, 'plays') ?? '6.2K plays',
    duration: source.durationLabel ?? formatDuration(source.durationSec),
    accent: accentForValue(slugSource),
    imageSrc: imageForValue(slugSource),
    description: source.description,
    commentCount: source.commentCount,
    genre,
    town: source.town ?? source.artistProfile?.town ?? null
  };
}

export function mapPlaylist(playlist: CatalogPlaylist): UiPlaylist {
  const source = playlist as CatalogPlaylist & {
    _count?: { tracks?: number };
  };
  const title = source.title ?? 'Editorial playlist';
  const trackCount = source.trackCount ?? source._count?.tracks;

  return {
    title,
    description: source.description ?? 'Editorial sequencing with a clear mood and point of view.',
    count: source.countLabel ?? `${trackCount ?? 18} tracks`,
    accent: accentForValue(source.slug ?? title),
    imageSrc: imageForValue(source.slug ?? title),
    moodTags: source.moodTags,
    trackCount
  };
}

export function mapRelease(release: CatalogRelease): UiReleaseMoment {
  const source = release as CatalogRelease & {
    track?: { title?: string };
    artistProfile?: { artistName?: string };
  };
  const title = source.title ?? source.track?.title ?? 'Upcoming release';
  const artist = source.artistName ?? source.artistProfile?.artistName ?? 'Featured artist';

  return {
    title,
    artist,
    note: formatReleaseNote(source.note ?? source.releaseAt),
    accent: accentForValue(source.slug ?? title),
    imageSrc: imageForValue(source.slug ?? title)
  };
}

export function mapEvent(event: CatalogEvent): UiEvent {
  const source = event as CatalogEvent & {
    startsAt?: string | Date;
    artistProfile?: { artistName?: string };
  };
  const venue = source.venue ?? source.town ?? 'Puerto Rico';

  return {
    title: source.title ?? 'Live event',
    venue,
    date: source.dateLabel ?? formatEventDate(source.startsAt),
    accent: accentForValue(source.artistSlug ?? source.artistName ?? source.title),
    imageSrc: imageForValue(source.artistSlug ?? source.artistName ?? source.title),
    town: source.town,
    artist: source.artistName ?? source.artistProfile?.artistName
  };
}

export function mapMerch(item: CatalogMerch): UiMerch {
  const source = item as CatalogMerch & {
    artistProfile?: { artistName?: string };
  };
  const title = source.title ?? 'Artist merch';

  return {
    title,
    price: formatPrice(source.priceLabel ?? source.priceCents),
    edition: source.description ?? source.category ?? 'Limited run',
    accent: accentForValue(source.artistSlug ?? source.artistName ?? title),
    imageSrc: imageForValue(source.artistSlug ?? source.artistName ?? title),
    artist: source.artistName ?? source.artistProfile?.artistName
  };
}

export function buildHomeCatalog(home?: DiscoveryHomeResponse | null) {
  return {
    artists: home?.featuredArtists?.map(mapArtist) ?? fallbackArtists,
    tracks: home?.trendingTracks?.map(mapTrack) ?? fallbackTracks,
    playlists: home?.playlists?.map(mapPlaylist) ?? fallbackPlaylists,
    events: home?.shows?.map(mapEvent) ?? fallbackEvents,
    merch: home?.merch?.map(mapMerch) ?? fallbackMerch,
    releaseMoments: home?.newReleases?.map(mapRelease) ?? fallbackReleaseMoments,
    sceneTags: home?.genres?.length
      ? home.genres
          .map((genre) => (typeof genre === 'string' ? genre : String((genre as { name?: string })?.name ?? '')))
          .map((genre) => genre.toLowerCase())
          .filter(Boolean)
      : sceneTags
  };
}

export function buildSearchCatalog(search?: DiscoverySearchResponse | null) {
  return {
    artists: search?.artists?.map(mapArtist) ?? fallbackArtists,
    tracks: search?.tracks?.map(mapTrack) ?? fallbackTracks,
    playlists: search?.playlists?.map(mapPlaylist) ?? fallbackPlaylists,
    events: search?.shows?.map(mapEvent) ?? fallbackEvents,
    merch: search?.merch?.map(mapMerch) ?? fallbackMerch
  };
}

export function buildTrackDetail(detail?: TrackDetailResponse | null) {
  if (!detail) {
    return {
      track: fallbackTracks[0],
      relatedTracks: fallbackTracks.slice(1, 4),
      comments: [
        { id: 'fallback-1', body: '"Brisa en Loiza" has the exact kind of atmosphere I want more of.', author: 'listener' },
        { id: 'fallback-2', body: '"Luna Costa" should bring this one into the next live set.', author: 'listener' }
      ],
      featuringPlaylists: fallbackPlaylists.slice(0, 1)
    };
  }

  return {
    track: mapTrack(detail.track),
    relatedTracks: detail.relatedTracks.map(mapTrack),
    comments: detail.track.comments,
    featuringPlaylists: detail.featuringPlaylists.map(mapPlaylist)
  };
}

export function buildArtistDetail(detail?: ArtistDetailResponse | null) {
  if (!detail) {
    return {
      artist: fallbackArtists[0],
      tracks: fallbackTracks.filter((track) => track.artist === fallbackArtists[0].name),
      releases: fallbackReleaseMoments.filter((release) => release.artist === fallbackArtists[0].name),
      shows: fallbackEvents,
      merch: merchForArtistFallback(fallbackArtists[0].name)
    };
  }

  return {
    artist: mapArtist(detail.artist),
    tracks: detail.tracks.map(mapTrack),
    releases: detail.releases.map(mapRelease),
    shows: detail.shows.map(mapEvent),
    merch: detail.merch.map(mapMerch)
  };
}

export function buildPlaylistDetail(detail?: PlaylistDetailResponse | null) {
  if (!detail) {
    return {
      playlist: fallbackPlaylists[0],
      tracks: tracksForPlaylistFallback(fallbackPlaylists[0].title),
      artists: fallbackArtists.slice(0, 2)
    };
  }

  return {
    playlist: mapPlaylist(detail.playlist),
    tracks: detail.tracks.map(mapTrack),
    artists: detail.featuredArtists.map(mapArtist)
  };
}
