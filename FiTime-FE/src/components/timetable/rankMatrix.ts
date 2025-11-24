import type { TimespanSlots } from '@/components/timetable/util.ts';

const DAY_ORDER = ['월', '화', '수', '목', '금', '토', '일'];

export type RankSlots = {
  rank1?: TimespanSlots;
  rank2?: TimespanSlots;
  rank3?: TimespanSlots;
};

function hourToHHMM(h: number) {
  return `${String(h).padStart(2, '0')}:00`;
}

function hhmmToHour(hhmm: string) {
  const [h] = hhmm.split(':').map(Number);
  return h;
}

function hourRange(start: string, end: string) {
  const s = hhmmToHour(start);
  const e = hhmmToHour(end);
  const arr: number[] = [];
  for (let h = s; h < e; h++) arr.push(h);
  return arr;
}

export function buildRankMatrix(
  allSlots: TimespanSlots[],
  ranks: RankSlots,
): number[][] {
  const m: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0),
  );

  // 타임테이블에서 선택된 슬롯 → 기본적으로 4로 지정
  allSlots.forEach((s) => {
    const dayIdx = DAY_ORDER.indexOf(s.day);
    if (dayIdx === -1) return;
    hourRange(s.startTime, s.endTime).forEach((h) => {
      m[dayIdx][h] = 4;
    });
  });

  // 1~3순위로 선택된 슬롯 -> rank 덮어쓰기
  (
    [
      { v: 1, slot: ranks.rank1 },
      { v: 2, slot: ranks.rank2 },
      { v: 3, slot: ranks.rank3 },
    ] as const
  ).forEach(({ v, slot }) => {
    if (!slot) return;

    const dayIdx = DAY_ORDER.indexOf(slot.day);

    if (dayIdx === -1) return;

    hourRange(slot.startTime, slot.endTime).forEach((h) => {
      m[dayIdx][h] = v;
    });
  });

  return m;
}

function extractRankSegment(
  matrix: number[][],
  rank: number,
): TimespanSlots | undefined {
  for (let d = 0; d < 7; d++) {
    const row = matrix[d];
    let start: number | null = null;

    for (let h = 0; h <= 24; h++) {
      const val = h < 24 ? row[h] : 0;
      const isTarget = val === rank;

      if (isTarget && start === null) start = h;

      if ((!isTarget || h === 24) && start !== null) {
        if (h > start) {
          return {
            day: DAY_ORDER[d],
            startTime: hourToHHMM(start),
            endTime: hourToHHMM(h),
          };
        }
        start = null;
      }
    }
  }
  return undefined;
}

export function matrixToRankSlots(matrix: number[][]): RankSlots {
  if (!Array.isArray(matrix) || matrix.length !== 7) return {};
  return {
    rank1: extractRankSegment(matrix, 1),
    rank2: extractRankSegment(matrix, 2),
    rank3: extractRankSegment(matrix, 3),
  };
}
