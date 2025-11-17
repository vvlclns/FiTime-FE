import { create } from 'zustand';

type EntryStore = {
  username?: string;
  password?: string;
  timetable?: unknown;
  rank?: unknown;

  setUserData: (data: { username: string; password: string }) => void;
  setTimetableData: (data: { timetable: unknown }) => void;
  setRankData: (data: { rank: unknown }) => void;
  reset: () => void;
};

const initialState = {
  username: undefined,
  password: undefined,
  timetable: undefined,
  rank: undefined,
};

export const useEntryStore = create<EntryStore>((set) => ({
  setUserData: (data) => set(data),
  setTimetableData: (data) => set(data),
  setRankData: (data) => set(data),
  reset: () => set(initialState),
}));
