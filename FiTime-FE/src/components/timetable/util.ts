import type { TimeSlot } from '@/components/timetable/TimeTable.tsx';
import { addMinutesToTime } from '@/lib/utils.ts';

export interface TimeTableJson {
  slots: Array<{ day: string; startTime: string; endTime: string }>;
}

export const jsonToSlots = (data: TimeTableJson): TimeSlot[] => {
  if (!data) return [];
  return data.slots.map((slot) => ({
    day: slot.day,
    time: slot.startTime,
  }));
};

export const slotsToJson = (
  slots: TimeSlot[],
  interval: number,
): TimeTableJson => {
  return {
    slots: slots.map((s) => ({
      day: s.day,
      startTime: s.time,
      endTime: addMinutesToTime(s.time, interval),
    })),
  };
};
