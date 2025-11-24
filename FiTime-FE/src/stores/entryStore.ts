import { create } from 'zustand';
import type { TimespanSlots } from '@/components/timetable/util.ts';

type EntryStore = {
  username?: string;
  password?: string;
  user_id?: string;
  timetable?: TimespanSlots[];
  rank1?: TimespanSlots;
  rank2?: TimespanSlots;
  rank3?: TimespanSlots;

  setUserData: (data: { username: string; password: string }) => void;
  setUser_id: (data: { user_id: string }) => void;
  setTimetableData: (data: { timetable: TimespanSlots[] }) => void;
  setRankData: (rank: {
    rank1?: TimespanSlots;
    rank2?: TimespanSlots;
    rank3?: TimespanSlots;
  }) => void;
  reset: () => void;
};

const initialState = {
  username: undefined,
  password: undefined,
  user_id: undefined,
  timetable: [],
  rank1: undefined,
  rank2: undefined,
  rank3: undefined,
};

export const useEntryStore = create<EntryStore>((set) => ({
  ...initialState,

  setUserData: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),
  setUser_id: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),
  setTimetableData: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),
  setRankData: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),
  reset: () => set(initialState),
}));
