import type { SolutionEntry, SolutionUserEntry } from '@/types/api';

interface TimeSlotCardProps {
  results: SolutionEntry[];
}
// TODO Extract this to util.ts?
const DAY_ORDER = ['월', '화', '수', '목', '금', '토', '일'];

const serializeTimes = (startHour: number, endHour: number) =>
  `${startHour}:00~${endHour}:00`;

const joinUserNames = (users: SolutionUserEntry[]) =>
  users
    .map((it) => `${it.username}님`)
    .join(', ')
    .concat(' ', '불가능');

export function TimeSlotCardContainer({ results = [] }: TimeSlotCardProps) {
  return (
    <div className="flex flex-col gap-y-1">
      {results.map((it, index) => (
        <div
          key={index}
          className={`flex flex-col border p-4 gap-y-1 rounded-sm border-violet-400 shadow-sm`}
        >
          <div className="flex flex-col text-left gap-y-1">
            {/* 시간 표시 (요일 시간)*/}
            <div className={'font-semibold text-sm/[20px]'}>
              <span className="mr-1">{DAY_ORDER[it.day]}</span>
              <span>{serializeTimes(it.start_hour, it.end_hour)}</span>
            </div>
            {/* 불가능한 유저 */}
            <div className={'text-gray-500 text-sm/[20px]'}>
              {it.unavailableUsers.length > 0
                ? joinUserNames(it.unavailableUsers)
                : '모두 참석 가능!'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
