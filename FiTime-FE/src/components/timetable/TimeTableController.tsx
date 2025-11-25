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
  extends Omit<
    TimeTableProps,
    | 'selectedSlots'
    | 'heatmapData'
    | 'onCellMouseDown'
    | 'onCellMouseEnter'
    | 'onCellMouseUp'
  > {
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select');

  // initialData/interval 변경 시 내부 상태 동기화 + 초기 onChange 전파
  useEffect(() => {
    if (initialData) {
      setSelectedSlots(timespanToSlots(initialData, interval));
      onChange?.(initialData);
    }
  }, [initialData, interval, onChange]);

  // Helper: Check if slot is selected
  const isSlotSelected = (day: string, time: string) => {
    return selectedSlots.some((slot) => slot.day === day && slot.time === time);
  };

  // Update selection and notify parent
  const updateSelection = (newSlots: TimeSlot[]) => {
    setSelectedSlots(newSlots);
    const timespanSlots = mergeSlots(newSlots, interval);
    onChange?.(timespanSlots);
  };

  // Toggle a single slot
  const toggleSlot = (day: string, time: string) => {
    const isSelected = isSlotSelected(day, time);
    let newSlots: TimeSlot[];

    if (isSelected) {
      newSlots = selectedSlots.filter(
        (slot) => !(slot.day === day && slot.time === time),
      );
    } else {
      newSlots = [...selectedSlots, { day, time }];
    }

    updateSelection(newSlots);
  };

  // Handle mouse down - start dragging
  const handleMouseDown = (day: string, time: string) => {
    const isSelected = isSlotSelected(day, time);
    setDragMode(isSelected ? 'deselect' : 'select');
    setIsDragging(true);
    toggleSlot(day, time);
  };

  // Handle mouse enter - continue dragging
  const handleMouseEnter = (day: string, time: string) => {
    if (!isDragging) return;

    const isSelected = isSlotSelected(day, time);

    if (dragMode === 'select' && !isSelected) {
      updateSelection([...selectedSlots, { day, time }]);
    } else if (dragMode === 'deselect' && isSelected) {
      updateSelection(
        selectedSlots.filter(
          (slot) => !(slot.day === day && slot.time === time),
        ),
      );
    }
  };

  // Handle mouse up - stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div>
      <TimeTable
        selectedSlots={selectedSlots}
        onCellMouseDown={handleMouseDown}
        onCellMouseEnter={handleMouseEnter}
        onCellMouseUp={handleMouseUp}
        interval={interval}
        {...props}
      />
    </div>
  );
};
