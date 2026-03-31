import { create } from 'zustand';
export const usePlayerStore = create((set) => ({
    currentTrack: undefined,
    isPlaying: false,
    setTrack: (currentTrack) => set({ currentTrack, isPlaying: true }),
    toggle: () => set((s) => ({ isPlaying: !s.isPlaying }))
}));
