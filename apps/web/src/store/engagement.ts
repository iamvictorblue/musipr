import { create } from 'zustand';

type EngagementState = {
  followedArtists: string[];
  savedMerch: string[];
  remindedShows: string[];
  isFollowingArtist: (name: string) => boolean;
  isMerchSaved: (title: string) => boolean;
  isShowReminded: (title: string) => boolean;
  toggleArtistFollow: (name: string) => void;
  toggleMerchSave: (title: string) => void;
  toggleShowReminder: (title: string) => void;
};

function toggleValue(collection: string[], value: string) {
  return collection.includes(value) ? collection.filter((item) => item !== value) : [...collection, value];
}

export const useEngagementStore = create<EngagementState>((set, get) => ({
  followedArtists: ['Luna Costa'],
  savedMerch: ['Brisa Tour Tee'],
  remindedShows: ['Noches en La Respuesta'],
  isFollowingArtist: (name) => get().followedArtists.includes(name),
  isMerchSaved: (title) => get().savedMerch.includes(title),
  isShowReminded: (title) => get().remindedShows.includes(title),
  toggleArtistFollow: (name) =>
    set((state) => ({
      followedArtists: toggleValue(state.followedArtists, name)
    })),
  toggleMerchSave: (title) =>
    set((state) => ({
      savedMerch: toggleValue(state.savedMerch, title)
    })),
  toggleShowReminder: (title) =>
    set((state) => ({
      remindedShows: toggleValue(state.remindedShows, title)
    }))
}));
