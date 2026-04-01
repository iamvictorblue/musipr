import { api } from './client';

export type EngagementArtist = {
  id: string;
  slug: string;
  name: string;
  followedAt: string;
};

export type EngagementEvent = {
  id: string;
  title: string;
  remindedAt: string;
};

export type EngagementMerch = {
  id: string;
  title: string;
  savedAt: string;
};

export type EngagementResponse = {
  followedArtists: EngagementArtist[];
  remindedEvents: EngagementEvent[];
  savedMerchItems: EngagementMerch[];
  counts: {
    followedArtists: number;
    remindedEvents: number;
    savedMerchItems: number;
  };
};

export async function fetchMyEngagementRequest() {
  const { data } = await api.get<EngagementResponse>('/users/me/engagement');
  return data;
}

export async function followArtistRequest(artistId: string) {
  const { data } = await api.post<{ ok: true; following: boolean }>(`/users/me/follows/artists/${artistId}`);
  return data;
}

export async function unfollowArtistRequest(artistId: string) {
  const { data } = await api.delete<{ ok: true; following: boolean }>(`/users/me/follows/artists/${artistId}`);
  return data;
}

export async function remindEventRequest(eventId: string) {
  const { data } = await api.post<{ ok: true; reminded: boolean }>(`/users/me/reminders/events/${eventId}`);
  return data;
}

export async function unremindEventRequest(eventId: string) {
  const { data } = await api.delete<{ ok: true; reminded: boolean }>(`/users/me/reminders/events/${eventId}`);
  return data;
}

export async function saveMerchRequest(merchId: string) {
  const { data } = await api.post<{ ok: true; saved: boolean }>(`/users/me/saved-merch/${merchId}`);
  return data;
}

export async function unsaveMerchRequest(merchId: string) {
  const { data } = await api.delete<{ ok: true; saved: boolean }>(`/users/me/saved-merch/${merchId}`);
  return data;
}
