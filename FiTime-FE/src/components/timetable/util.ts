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

// availability (7*24 number[][]) -> TimespanSlots[]
// 0 = 미선택된 슬롯, 1~4 = 선택된 슬롯 (순위는 여기서 반영하지 않음)
export function matrixToTimespans(
  matrix: number[][],
  interval: number = 60,
): TimespanSlots[] {
  const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
  const result: TimespanSlots[] = [];

  if (!Array.isArray(matrix) || matrix.length !== 7) return result;

  matrix.forEach((row, dayIdx) => {
    if (!Array.isArray(row)) return;
    let start: number | null = null;

    for (let h = 0; h <= 24; h++) {
      const val = h < 24 ? row[h] : 0;
      const selected = val > 0;
      if (selected && start === null) start = h;
      if ((!selected || h === 24) && start !== null) {
        if (h > start) {
          const toHHMM = (hourIndex: number) => {
            const totalMinutes = hourIndex * 60;
            const hh = Math.floor(totalMinutes / 60)
              .toString()
              .padStart(2, '0');
            const mm = (totalMinutes % 60).toString().padStart(2, '0');
            return `${hh}:${mm}`;
          };
          result.push({
            day: dayLabels[dayIdx],
            startTime: toHHMM(start),
            endTime: toHHMM(h),
          });
        }
        start = null;
      }
    }
  });

  return result;
}
