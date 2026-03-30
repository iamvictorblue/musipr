import { useQuery } from '@tanstack/react-query';
import { api } from './client';

export type CatalogArtist = {
  id: string;
  slug: string;
  name: string;
  town: string | null;
  bio: string | null;
  genre: string;
  genres: string[];
  followerCount: number;
  followerLabel: string;
  monthlyListeners: number;
  monthlyListenersLabel: string;
  merchClicks: number;
  ticketClicks: number;
  trackCount: number;
  merchCount: number;
  eventCount: number;
};

export type CatalogTrack = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  artworkUrl: string | null;
  durationSec: number;
  durationLabel: string;
  playCount: number;
  playsLabel: string;
  likeCount: number;
  commentCount: number;
  genre: string | null;
  tag: string;
  artistName: string;
  artistSlug: string;
  town: string | null;
  createdAt: string;
};

export type CatalogRelease = {
  id: string;
  slug: string;
  title: string;
  artistName: string;
  artistSlug: string;
  releaseAt: string;
  isPublished: boolean;
  notifyCount: number;
  note: string;
};

export type CatalogPlaylist = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  moodTags: string[];
  isEditorial: boolean;
  ownerArtistName: string | null;
  trackCount: number;
  countLabel: string;
};

export type CatalogEvent = {
  id: string;
  title: string;
  venue: string;
  town: string;
  startsAt: string;
  dateLabel: string;
  description: string | null;
  ticketLink: string | null;
  artistName: string;
  artistSlug: string;
};

export type CatalogMerch = {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  priceLabel: string;
  imageUrl: string | null;
  category: string;
  artistName: string;
  artistSlug: string;
};

export type DiscoveryHomeResponse = {
  featuredArtists: CatalogArtist[];
  trendingTracks: CatalogTrack[];
  newReleases: CatalogRelease[];
  playlists: CatalogPlaylist[];
  shows: CatalogEvent[];
  merch: CatalogMerch[];
  genres: string[];
};

export type DiscoverySearchResponse = {
  artists: CatalogArtist[];
  tracks: CatalogTrack[];
  playlists: CatalogPlaylist[];
  shows: CatalogEvent[];
  merch: CatalogMerch[];
};

export type TrackDetailResponse = {
  track: CatalogTrack & {
    comments: Array<{ id: string; body: string; author: string }>;
  };
  relatedTracks: CatalogTrack[];
  featuringPlaylists: CatalogPlaylist[];
};

export type ArtistDetailResponse = {
  artist: CatalogArtist;
  tracks: CatalogTrack[];
  releases: CatalogRelease[];
  shows: CatalogEvent[];
  merch: CatalogMerch[];
};

export type PlaylistDetailResponse = {
  playlist: CatalogPlaylist;
  tracks: CatalogTrack[];
  featuredArtists: CatalogArtist[];
};

async function get<T>(path: string, params?: Record<string, string>) {
  const { data } = await api.get<T>(path, { params });
  return data;
}

export function useDiscoveryHomeQuery() {
  return useQuery({
    queryKey: ['catalog', 'home'],
    queryFn: () => get<DiscoveryHomeResponse>('/discovery/home')
  });
}

export function useDiscoverySearchQuery(query: string) {
  return useQuery({
    queryKey: ['catalog', 'search', query],
    queryFn: () => get<DiscoverySearchResponse>('/discovery/search', { q: query }),
    enabled: query.trim().length > 0
  });
}

export function useTrackDetailQuery(slug: string) {
  return useQuery({
    queryKey: ['catalog', 'track', slug],
    queryFn: () => get<TrackDetailResponse>(`/tracks/${slug}`),
    enabled: slug.length > 0
  });
}

export function useArtistDetailQuery(slug: string) {
  return useQuery({
    queryKey: ['catalog', 'artist', slug],
    queryFn: () => get<ArtistDetailResponse>(`/artists/${slug}`),
    enabled: slug.length > 0
  });
}

export function usePlaylistDetailQuery(slug: string) {
  return useQuery({
    queryKey: ['catalog', 'playlist', slug],
    queryFn: () => get<PlaylistDetailResponse>(`/playlists/${slug}`),
    enabled: slug.length > 0
  });
}

export function usePlaylistsQuery() {
  return useQuery({
    queryKey: ['catalog', 'playlists'],
    queryFn: () => get<CatalogPlaylist[]>('/playlists')
  });
}

export function useReleasesQuery() {
  return useQuery({
    queryKey: ['catalog', 'releases'],
    queryFn: () => get<CatalogRelease[]>('/releases')
  });
}

export function useEventsQuery() {
  return useQuery({
    queryKey: ['catalog', 'events'],
    queryFn: () => get<CatalogEvent[]>('/events')
  });
}

export function useMerchQuery() {
  return useQuery({
    queryKey: ['catalog', 'merch'],
    queryFn: () => get<CatalogMerch[]>('/merch')
  });
}
