import { useState, useEffect } from 'react';
import {
  type TimeSlot,
  TimeTable,
  type TimeTableProps,
} from '@/components/timetable/TimeTable.tsx';
import {
  mergeSlots,
  type TimespanSlots,
  timespanToSlots,
} from '@/components/timetable/util.ts';

interface TimeTableControllerProps
  extends Omit<TimeTableProps, 'selectedSlots' | 'onSelectionChange'> {
  initialData?: TimespanSlots[];
  onChange?: (data: TimespanSlots[]) => void;
}

export const TimeTableController = ({
  initialData,
  onChange,
  interval = 60,
  ...props
}: TimeTableControllerProps) => {
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>(
    initialData ? timespanToSlots(initialData, interval) : [],
  );

  // initialData/interval 변경 시 내부 상태 동기화 + 초기 onChange 전파
  useEffect(() => {
    if (initialData) {
      setSelectedSlots(timespanToSlots(initialData, interval));
      onChange?.(initialData);
    }
  }, [initialData, interval, onChange]);

  const handleChange = (slots: TimeSlot[]) => {
    setSelectedSlots(slots);
    const timespanSlots = mergeSlots(slots, interval);
    onChange?.(timespanSlots);
  };

  return (
    <div>
      <TimeTable
        selectedSlots={selectedSlots}
        onSelectionChange={handleChange}
        interval={interval}
        {...props}
      />
    </div>
  );
};
