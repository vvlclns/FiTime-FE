import { TimeTable } from '@/components/TimeTable.tsx';

export default function TimetableView() {
  return (
    <div className="flex-box w-full h-full justify-center">
      <div className="flex flex-col justify-center h-[48px]">시간표 데모</div>
      <div className="flex flex-col justify-center w-full h-full">
        <TimeTable />
      </div>
    </div>
  );
}
