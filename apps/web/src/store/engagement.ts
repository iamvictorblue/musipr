import { create } from 'zustand';
import {
  fetchMyEngagementRequest,
  followArtistRequest,
  remindEventRequest,
  saveMerchRequest,
  unfollowArtistRequest,
  unremindEventRequest,
  unsaveMerchRequest,
  type EngagementResponse
} from '../api/engagement';
import { useAuthStore } from './auth';

type EngagementState = {
  hydratedForUserId: string | null;
  loading: boolean;
  followedArtistIds: string[];
  followedArtistNames: string[];
  savedMerchIds: string[];
  savedMerchTitles: string[];
  remindedShowIds: string[];
  remindedShowTitles: string[];
  hydrateFromApi: (userId: string) => Promise<void>;
  clear: () => void;
  isFollowingArtist: (name: string, id?: string | null) => boolean;
  isMerchSaved: (title: string, id?: string | null) => boolean;
  isShowReminded: (title: string, id?: string | null) => boolean;
  toggleArtistFollow: (name: string, id?: string | null) => Promise<void>;
  toggleMerchSave: (title: string, id?: string | null) => Promise<void>;
  toggleShowReminder: (title: string, id?: string | null) => Promise<void>;
};

const initialState = {
  hydratedForUserId: null,
  loading: false,
  followedArtistIds: [] as string[],
  followedArtistNames: [] as string[],
  savedMerchIds: [] as string[],
  savedMerchTitles: [] as string[],
  remindedShowIds: [] as string[],
  remindedShowTitles: [] as string[]
};

function toggleValue(collection: string[], value: string) {
  return collection.includes(value) ? collection.filter((item) => item !== value) : [...collection, value];
}

function applyEngagementPayload(set: (partial: Partial<EngagementState>) => void, userId: string, payload: EngagementResponse) {
  set({
    hydratedForUserId: userId,
    loading: false,
    followedArtistIds: payload.followedArtists.map((item) => item.id),
    followedArtistNames: payload.followedArtists.map((item) => item.name),
    savedMerchIds: payload.savedMerchItems.map((item) => item.id),
    savedMerchTitles: payload.savedMerchItems.map((item) => item.title),
    remindedShowIds: payload.remindedEvents.map((item) => item.id),
    remindedShowTitles: payload.remindedEvents.map((item) => item.title)
  });
}

export const useEngagementStore = create<EngagementState>((set, get) => ({
  ...initialState,
  hydrateFromApi: async (userId) => {
    if (get().hydratedForUserId === userId && !get().loading) {
      return;
    }

    set({ loading: true });

    try {
      const payload = await fetchMyEngagementRequest();
      applyEngagementPayload(set, userId, payload);
    } catch {
      set({ loading: false, hydratedForUserId: userId });
    }
  },
  clear: () => set(initialState),
  isFollowingArtist: (name, id) => (id ? get().followedArtistIds.includes(id) : get().followedArtistNames.includes(name)),
  isMerchSaved: (title, id) => (id ? get().savedMerchIds.includes(id) : get().savedMerchTitles.includes(title)),
  isShowReminded: (title, id) => (id ? get().remindedShowIds.includes(id) : get().remindedShowTitles.includes(title)),
  toggleArtistFollow: async (name, id) => {
    const currentUser = useAuthStore.getState().user;
    const isFollowing = get().isFollowingArtist(name, id);
    const previous = {
      followedArtistIds: get().followedArtistIds,
      followedArtistNames: get().followedArtistNames
    };

    set({
      followedArtistIds: id ? toggleValue(get().followedArtistIds, id) : get().followedArtistIds,
      followedArtistNames: toggleValue(get().followedArtistNames, name)
    });

    if (!currentUser || !id) return;

    try {
      if (isFollowing) {
        await unfollowArtistRequest(id);
      } else {
        await followArtistRequest(id);
      }
    } catch {
      set(previous);
    }
  },
  toggleMerchSave: async (title, id) => {
    const currentUser = useAuthStore.getState().user;
    const isSaved = get().isMerchSaved(title, id);
    const previous = {
      savedMerchIds: get().savedMerchIds,
      savedMerchTitles: get().savedMerchTitles
    };

    set({
      savedMerchIds: id ? toggleValue(get().savedMerchIds, id) : get().savedMerchIds,
      savedMerchTitles: toggleValue(get().savedMerchTitles, title)
    });

    if (!currentUser || !id) return;

    try {
      if (isSaved) {
        await unsaveMerchRequest(id);
      } else {
        await saveMerchRequest(id);
      }
    } catch {
      set(previous);
    }
  },
  toggleShowReminder: async (title, id) => {
    const currentUser = useAuthStore.getState().user;
    const isReminded = get().isShowReminded(title, id);
    const previous = {
      remindedShowIds: get().remindedShowIds,
      remindedShowTitles: get().remindedShowTitles
    };

    set({
      remindedShowIds: id ? toggleValue(get().remindedShowIds, id) : get().remindedShowIds,
      remindedShowTitles: toggleValue(get().remindedShowTitles, title)
    });

    if (!currentUser || !id) return;

    try {
      if (isReminded) {
        await unremindEventRequest(id);
      } else {
        await remindEventRequest(id);
      }
    } catch {
      set(previous);
    }
  }
}));
