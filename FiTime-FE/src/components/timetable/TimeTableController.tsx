import { useState } from 'react';
import {
  type TimeSlot,
  TimeTable,
  type TimeTableProps,
} from '@/components/timetable/TimeTable.tsx';
import {
  slotsToJson,
  type TimeTableJson,
} from '@/components/timetable/util.ts';

interface TimeTableControllerProps
  extends Omit<TimeTableProps, 'selectedSlots' | 'onSelectionChange'> {
  initialData?: TimeTableJson;
  onChange?: (data: TimeTableJson) => void;
}

export const TimeTableController = ({
  initialData,
  onChange,
  interval = 60,
  ...props
}: TimeTableControllerProps) => {
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);

  const handleChange = (slots: TimeSlot[]) => {
    setSelectedSlots(slots);
    const json = slotsToJson(selectedSlots, interval);
    if (onChange) {
      onChange(json);
    }
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
