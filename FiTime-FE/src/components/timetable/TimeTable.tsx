import { useState, useCallback, useEffect, useMemo } from 'react';
import { cn, parseTimeToMinutes, formatMinutesToTime } from '@/lib/utils.ts';

export interface TimeSlot {
  day: string;
  time: string;
}

export interface TimeTableProps {
  days?: string[];
  startTime?: string;
  endTime?: string;
  interval?: number;
  selectedSlots?: TimeSlot[];
  onSelectionChange?: (selected: TimeSlot[]) => void;
  className?: string;
  readOnly?: boolean;
}

const TimeTable = ({
  days = ['월', '화', '수', '목', '금', '토', '일'],
  startTime = '09:00',
  endTime = '21:00',
  interval = 30,
  selectedSlots: externalSelectedSlots = [],
  onSelectionChange,
  className,
  readOnly = false,
}: TimeTableProps) => {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select');

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = [];

    let currentTime = parseTimeToMinutes(startTime);
    const endTimeMinutes = parseTimeToMinutes(endTime);

    while (currentTime < endTimeMinutes) {
      slots.push(formatMinutesToTime(currentTime));
      currentTime += interval;
    }

    return slots;
  }, [startTime, endTime, interval]);

  // Create slot key
  const getSlotKey = (day: string, time: string) => `${day}-${time}`;

  useEffect(() => {
    const updatedSlot = new Set(
      externalSelectedSlots?.map((slot) => getSlotKey(slot.day, slot.time)),
    );
    setSelectedSlots(updatedSlot);
  }, [externalSelectedSlots]);

  // Check if slot is selected
  const isSlotSelected = (day: string, time: string) => {
    return selectedSlots.has(getSlotKey(day, time));
  };

  const notifySelection = (newSelection: Set<string>) => {
    setSelectedSlots(newSelection);
    if (onSelectionChange) {
      const slotsArray = Array.from(newSelection).map((t) => {
        const [day, time] = t.split('-');
        return { day, time };
      });
      onSelectionChange(slotsArray);
    }
  };

  // Toggle slot selection
  const toggleSlot = useCallback(
    (day: string, time: string) => {
      const key = getSlotKey(day, time);
      const newSelected = new Set(selectedSlots);

      if (newSelected.has(key)) {
        newSelected.delete(key);
      } else {
        newSelected.add(key);
      }

      notifySelection(newSelected);
    },
    [selectedSlots, onSelectionChange],
  );

  // Handle mouse down - start dragging
  const handleMouseDown = (day: string, time: string) => {
    if (readOnly) return;
    const isSelected = isSlotSelected(day, time);
    setDragMode(isSelected ? 'deselect' : 'select');
    setIsDragging(true);
    toggleSlot(day, time);
  };

  // Handle mouse enter - continue dragging
  const handleMouseEnter = (day: string, time: string) => {
    if (readOnly) return;
    if (isDragging) {
      const key = getSlotKey(day, time);
      const newSelected = new Set(selectedSlots);

      if (dragMode === 'select' && !newSelected.has(key)) {
        newSelected.add(key);
        notifySelection(newSelected);
      } else if (dragMode === 'deselect' && newSelected.has(key)) {
        newSelected.delete(key);
        notifySelection(newSelected);
      }
    }
  };

  // Handle mouse up - stop dragging
  const handleMouseUp = () => {
    if (readOnly) return;
    setIsDragging(false);
  };

  return (
    <div
      className={cn('select-none', className)}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="inline-block border border-gray-200 rounded-lg overflow-hidden">
        {/* Header row with days */}
        <div className="flex bg-gray-50">
          <div className="w-10 h-9 flex items-center justify-center border-b border-r border-gray-200 font-semibold text-sm">
            Time
          </div>
          {days.map((day) => (
            <div
              key={day}
              className="w-10 h-9 flex items-center justify-center border-b border-r last:border-r-0 border-gray-200 font-semibold text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        {timeSlots.map((time) => (
          <div key={time} className="flex">
            {/* Time label */}
            <div className="w-10 h-9 flex items-center justify-center border-b border-r border-gray-200 text-xs text-gray-600">
              {time}
            </div>

            {/* Day cells */}
            {days.map((day) => {
              const isSelected = isSlotSelected(day, time);
              return (
                <div
                  key={`${day}-${time}`}
                  className={cn(
                    'w-10 h-9 border-b border-r last:border-r-0 border-gray-200 transition-colors',
                    isSelected ? 'bg-violet-500' : 'bg-white',
                    readOnly ? 'cursor-pointer' : 'cursor-default',
                    !readOnly && !isSelected && 'hover:bg-violet-50',
                    !readOnly && isSelected && 'hover:bg-violet-600',
                  )}
                  onMouseDown={() => handleMouseDown(day, time)}
                  onMouseEnter={() => handleMouseEnter(day, time)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

TimeTable.displayName = 'TimeTable';

export { TimeTable };
