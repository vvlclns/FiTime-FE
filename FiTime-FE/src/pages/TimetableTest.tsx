import { Button } from '@/components/ui/button.tsx';
import { useState } from 'react';
import { TimeTableController } from '@/components/timetable';
import type { TimeTableJson } from '@/components/timetable/util.ts';

export default function TimetableView() {
  const [slotJson, setSlotJson] = useState<TimeTableJson>();
  return (
    <div className="flex-box w-full max-h-screen justify-center">
      <div className="flex flex-col justify-center h-[48px]">시간표 데모</div>
      <div className="flex flex-col justify-center w-full">
        <TimeTableController
          onChange={setSlotJson}
          interval={60}
          startTime="00:00"
          endTime="24:00"
        />
        <Button onClick={() => alert(JSON.stringify(slotJson))}>
          Get Data
        </Button>
      </div>
    </div>
  );
}
