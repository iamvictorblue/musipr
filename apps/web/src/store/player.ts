import { create } from 'zustand';

export type PlayerTrack = {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  streamUrl?: string;
  durationSec?: number;
  sourceLabel?: string;
  sourceHref?: string;
};

type RepeatMode = 'off' | 'all' | 'one';

type PlayerState = {
  currentTrack?: PlayerTrack;
  queue: PlayerTrack[];
  currentIndex: number;
  isPlaying: boolean;
  progressSec: number;
  volume: number;
  previousVolume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  setTrack: (track?: PlayerTrack, queue?: PlayerTrack[]) => void;
  setQueue: (queue: PlayerTrack[], startIndex?: number, autoplay?: boolean) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  tick: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  playAtIndex: (index: number) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getDuration(track?: PlayerTrack) {
  return Math.max(30, track?.durationSec ?? 210);
}

function pickNextIndex(state: Pick<PlayerState, 'queue' | 'currentIndex' | 'shuffle' | 'repeatMode'>) {
  if (!state.queue.length) return -1;

  if (state.shuffle && state.queue.length > 1) {
    const available = state.queue.map((_, index) => index).filter((index) => index !== state.currentIndex);
    return available[Math.floor(Math.random() * available.length)] ?? state.currentIndex;
  }

  const linearNext = state.currentIndex + 1;
  if (linearNext < state.queue.length) {
    return linearNext;
  }

  if (state.repeatMode === 'all') {
    return 0;
  }

  return -1;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: undefined,
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  progressSec: 0,
  volume: 72,
  previousVolume: 72,
  isMuted: false,
  shuffle: false,
  repeatMode: 'off',
  setTrack: (track, queueArg) =>
    set(() => {
      const queue = queueArg?.length ? queueArg : track ? [track] : [];
      const queueIndex = track ? Math.max(0, queue.findIndex((item) => item.id === track.id)) : 0;
      const currentTrack = track ?? queue[queueIndex];

      return {
        currentTrack,
        queue,
        currentIndex: queue.length ? queueIndex : 0,
        isPlaying: Boolean(currentTrack),
        progressSec: 0
      };
    }),
  setQueue: (queue, startIndex = 0, autoplay = false) =>
    set((state) => {
      if (!queue.length) {
        return {
          queue: [],
          currentTrack: undefined,
          currentIndex: 0,
          isPlaying: false,
          progressSec: 0
        };
      }

      const nextIndex = clamp(startIndex, 0, queue.length - 1);

      return {
        queue,
        currentIndex: nextIndex,
        currentTrack: queue[nextIndex],
        isPlaying: autoplay ? true : state.isPlaying,
        progressSec: 0
      };
    }),
  toggle: () =>
    set((state) => {
      if (!state.currentTrack && state.queue.length) {
        return { currentTrack: state.queue[state.currentIndex] ?? state.queue[0], isPlaying: true };
      }

      return { isPlaying: !state.isPlaying };
    }),
  next: () =>
    set((state) => {
      const nextIndex = pickNextIndex(state);
      if (nextIndex === -1) {
        return {
          isPlaying: false,
          progressSec: getDuration(state.currentTrack)
        };
      }

      return {
        currentIndex: nextIndex,
        currentTrack: state.queue[nextIndex],
        isPlaying: true,
        progressSec: 0
      };
    }),
  previous: () =>
    set((state) => {
      if (!state.queue.length) return state;

      if (state.progressSec > 3) {
        return { progressSec: 0 };
      }

      const previousIndex = state.currentIndex > 0 ? state.currentIndex - 1 : state.repeatMode !== 'off' ? state.queue.length - 1 : 0;

      return {
        currentIndex: previousIndex,
        currentTrack: state.queue[previousIndex],
        isPlaying: true,
        progressSec: 0
      };
    }),
  seek: (seconds) =>
    set((state) => ({
      progressSec: clamp(seconds, 0, getDuration(state.currentTrack))
    })),
  tick: () =>
    set((state) => {
      if (!state.isPlaying || !state.currentTrack) return state;

      const duration = getDuration(state.currentTrack);
      const nextProgress = state.progressSec + 1;

      if (nextProgress < duration) {
        return { progressSec: nextProgress };
      }

      if (state.repeatMode === 'one') {
        return { progressSec: 0 };
      }

      const nextIndex = pickNextIndex(state);
      if (nextIndex === -1) {
        return {
          isPlaying: false,
          progressSec: duration
        };
      }

      return {
        currentIndex: nextIndex,
        currentTrack: state.queue[nextIndex],
        isPlaying: true,
        progressSec: 0
      };
    }),
  setVolume: (volume) =>
    set(() => {
      const nextVolume = clamp(volume, 0, 100);

      return {
        volume: nextVolume,
        previousVolume: nextVolume === 0 ? 72 : nextVolume,
        isMuted: nextVolume === 0
      };
    }),
  toggleMute: () =>
    set((state) => {
      if (state.isMuted || state.volume === 0) {
        return {
          isMuted: false,
          volume: state.previousVolume || 72
        };
      }

      return {
        isMuted: true,
        previousVolume: state.volume,
        volume: 0
      };
    }),
  toggleShuffle: () =>
    set((state) => ({
      shuffle: !state.shuffle
    })),
  cycleRepeat: () =>
    set((state) => ({
      repeatMode: state.repeatMode === 'off' ? 'all' : state.repeatMode === 'all' ? 'one' : 'off'
    })),
  playAtIndex: (index) =>
    set((state) => {
      if (!state.queue.length) return state;

      const nextIndex = clamp(index, 0, state.queue.length - 1);
      return {
        currentIndex: nextIndex,
        currentTrack: state.queue[nextIndex],
        isPlaying: true,
        progressSec: 0
      };
    }),
  removeFromQueue: (index) =>
    set((state) => {
      if (index < 0 || index >= state.queue.length) {
        return state;
      }

      const nextQueue = state.queue.filter((_, queueIndex) => queueIndex !== index);

      if (!nextQueue.length) {
        return {
          queue: [],
          currentTrack: undefined,
          currentIndex: 0,
          isPlaying: false,
          progressSec: 0
        };
      }

      if (index === state.currentIndex) {
        const nextIndex = Math.min(index, nextQueue.length - 1);
        return {
          queue: nextQueue,
          currentIndex: nextIndex,
          currentTrack: nextQueue[nextIndex],
          isPlaying: true,
          progressSec: 0
        };
      }

      const nextIndex = index < state.currentIndex ? state.currentIndex - 1 : state.currentIndex;

      return {
        queue: nextQueue,
        currentIndex: nextIndex,
        currentTrack: nextQueue[nextIndex]
      };
    }),
  clearQueue: () =>
    set(() => ({
      currentTrack: undefined,
      queue: [],
      currentIndex: 0,
      isPlaying: false,
      progressSec: 0
    }))
}));
