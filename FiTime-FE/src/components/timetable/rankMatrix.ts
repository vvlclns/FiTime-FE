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

// 백엔드 순위 알고리즘(1순위=4, 2순위=3, 3순위=2, 4순위(기본)=1)에 맞게 변환
const VALUE_FROM_RANK: Record<number, number> = {
  1: 4,
  2: 3,
  3: 2,
  4: 1,
};

export function buildRankMatrix(
  allSlots: TimespanSlots[],
  ranks: RankSlots,
): number[][] {
  const m: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0),
  );

  // 타임테이블에서 선택된 슬롯 → 기본적으로 4순위 값(=1)으로 지정
  allSlots.forEach((s) => {
    const dayIdx = DAY_ORDER.indexOf(s.day);
    if (dayIdx === -1) return;
    hourRange(s.startTime, s.endTime).forEach((h) => {
      m[dayIdx][h] = VALUE_FROM_RANK[4];
    });
  });

  // 1~3순위로 선택된 슬롯 -> rank 덮어쓰기
  (
    [
      { rank: 1, slot: ranks.rank1 },
      { rank: 2, slot: ranks.rank2 },
      { rank: 3, slot: ranks.rank3 },
    ] as const
  ).forEach(({ rank, slot }) => {
    if (!slot) return;

    const dayIdx = DAY_ORDER.indexOf(slot.day);

    if (dayIdx === -1) return;

    hourRange(slot.startTime, slot.endTime).forEach((h) => {
      m[dayIdx][h] = VALUE_FROM_RANK[rank];
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
      const isTarget = val === VALUE_FROM_RANK[rank];

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
