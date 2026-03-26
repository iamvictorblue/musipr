import { create } from 'zustand';

type PlayerState = {
  currentTrack?: { id: string; title: string; artist: string; artworkUrl?: string; streamUrl?: string };
  isPlaying: boolean;
  setTrack: (track: PlayerState['currentTrack']) => void;
  toggle: () => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: undefined,
  isPlaying: false,
  setTrack: (currentTrack) => set({ currentTrack, isPlaying: true }),
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying }))
}));
