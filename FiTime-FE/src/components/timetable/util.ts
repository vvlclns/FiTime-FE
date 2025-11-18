import type { TimeSlot } from '@/components/timetable/TimeTable.tsx';
import {
  addMinutesToTime,
  parseTimeToMinutes,
  formatMinutesToTime,
} from '@/lib/utils.ts';

export interface TimeTableJson {
  slots: Array<{ day: string; startTime: string; endTime: string }>;
}

export interface TimespanSlots {
  day: string;
  startTime: string;
  endTime: string;
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

export const timespanToSlots = (
  slots: TimespanSlots[],
  interval: number,
): TimeSlot[] => {
  return slots.flatMap((slot) => {
    const startTime = parseTimeToMinutes(slot.startTime);
    const endTime = parseTimeToMinutes(slot.endTime);
    const resultSlots: TimeSlot[] = [];
    for (
      let currentTime = startTime;
      currentTime < endTime;
      currentTime += interval
    ) {
      resultSlots.push({
        day: slot.day,
        time: formatMinutesToTime(currentTime),
      });
    }
    return resultSlots;
  });
};

export const mergeSlots = (
  slots: TimeSlot[],
  interval: number,
): TimespanSlots[] => {
  const groupedByDay: Record<string, number[]> = {};
  slots.forEach((slot) => {
    if (!groupedByDay[slot.day]) groupedByDay[slot.day] = [];
    groupedByDay[slot.day].push(parseTimeToMinutes(slot.time));
  });

  const result: TimespanSlots[] = [];
  Object.keys(groupedByDay).forEach((day) => {
    const times = groupedByDay[day];
    let startTime = times[0];
    let endTime = times[0] + interval;
    for (let i = 1; i < times.length; i++) {
      const currentTime = times[i];
      if (currentTime == endTime) {
        endTime += interval;
      } else {
        result.push({
          day,
          startTime: formatMinutesToTime(startTime),
          endTime: formatMinutesToTime(endTime),
        });
        startTime = currentTime;
        endTime = currentTime + interval;
      }
    }
    result.push({
      day,
      startTime: formatMinutesToTime(startTime),
      endTime: formatMinutesToTime(endTime),
    });
  });
  return result;
};
