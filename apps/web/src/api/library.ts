import { useQuery } from '@tanstack/react-query';
import { api } from './client';
import type { CatalogPlaylist, CatalogTrack } from './catalog';

export type LibraryTrack = CatalogTrack & {
  likedAt: string | null;
  savedAt: string | null;
};

export type LibraryPlaylist = CatalogPlaylist & {
  savedAt: string;
};

export type UserLibraryResponse = {
  likedTracks: LibraryTrack[];
  savedPlaylists: LibraryPlaylist[];
  counts: {
    likedTracks: number;
    savedTracks: number;
    savedPlaylists: number;
  };
};

export function useUserLibraryQuery(enabled = true) {
  return useQuery({
    queryKey: ['library', 'me'],
    queryFn: async () => {
      const { data } = await api.get<UserLibraryResponse>('/users/me/library');
      return data;
    },
    enabled
  });
}

export async function likeTrackRequest(trackId: string) {
  const { data } = await api.post<{ ok: true; liked: boolean }>(`/tracks/${trackId}/like`);
  return data;
}

export async function unlikeTrackRequest(trackId: string) {
  const { data } = await api.delete<{ ok: true; liked: boolean }>(`/tracks/${trackId}/like`);
  return data;
}

export async function saveTrackRequest(trackId: string) {
  const { data } = await api.post<{ ok: true; saved: boolean }>(`/tracks/${trackId}/save`);
  return data;
}

export async function unsaveTrackRequest(trackId: string) {
  const { data } = await api.delete<{ ok: true; saved: boolean }>(`/tracks/${trackId}/save`);
  return data;
}

export async function savePlaylistRequest(playlistId: string) {
  const { data } = await api.post<{ ok: true; saved: boolean }>(`/playlists/${playlistId}/save`);
  return data;
}

export async function unsavePlaylistRequest(playlistId: string) {
  const { data } = await api.delete<{ ok: true; saved: boolean }>(`/playlists/${playlistId}/save`);
  return data;
}
