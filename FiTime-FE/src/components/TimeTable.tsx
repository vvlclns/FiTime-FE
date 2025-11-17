import { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TimeSlot {
  day: string;
  time: string;
}

export interface TimeTableProps {
  days?: string[];
  startTime?: string;
  endTime?: string;
  interval?: number;
  onSelectionChange?: (selected: TimeSlot[]) => void;
  className?: string;
}

export interface TimeTableRef {
  getSelectedSlots: () => TimeSlot[];
  clearSelection: () => void;
  setSelectedSlots: (slots: TimeSlot[]) => void;
}

const TimeTable = forwardRef<TimeTableRef, TimeTableProps>(
  (
    {
      days = ['월', '화', '수', '목', '금'],
      startTime = '09:00',
      endTime = '21:00',
      interval = 30,
      onSelectionChange,
      className,
    },
    ref
  ) => {
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select');

    // Generate time slots
    const generateTimeSlots = useCallback(() => {
      const slots: string[] = [];
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      let currentTime = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;

      while (currentTime < endTimeMinutes) {
        const hour = Math.floor(currentTime / 60);
        const minute = currentTime % 60;
        slots.push(
          `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        );
        currentTime += interval;
      }

      return slots;
    }, [startTime, endTime, interval]);

    const timeSlots = generateTimeSlots();

    // Create slot key
    const getSlotKey = (day: string, time: string) => `${day}-${time}`;

    // Check if slot is selected
    const isSlotSelected = (day: string, time: string) => {
      return selectedSlots.has(getSlotKey(day, time));
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

        setSelectedSlots(newSelected);

        // Call callback with array of TimeSlot objects
        if (onSelectionChange) {
          const slotsArray = Array.from(newSelected).map((k) => {
            const [day, time] = k.split('-');
            return { day, time };
          });
          onSelectionChange(slotsArray);
        }
      },
      [selectedSlots, onSelectionChange]
    );

    // Handle mouse down - start dragging
    const handleMouseDown = (day: string, time: string) => {
      const isSelected = isSlotSelected(day, time);
      setDragMode(isSelected ? 'deselect' : 'select');
      setIsDragging(true);
      toggleSlot(day, time);
    };

    // Handle mouse enter - continue dragging
    const handleMouseEnter = (day: string, time: string) => {
      if (isDragging) {
        const key = getSlotKey(day, time);
        const newSelected = new Set(selectedSlots);

        if (dragMode === 'select' && !newSelected.has(key)) {
          newSelected.add(key);
        } else if (dragMode === 'deselect' && newSelected.has(key)) {
          newSelected.delete(key);
        }

        setSelectedSlots(newSelected);

        if (onSelectionChange) {
          const slotsArray = Array.from(newSelected).map((k) => {
            const [day, time] = k.split('-');
            return { day, time };
          });
          onSelectionChange(slotsArray);
        }
      }
    };

    // Handle mouse up - stop dragging
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Imperative handle for ref
    useImperativeHandle(ref, () => ({
      getSelectedSlots: () => {
        return Array.from(selectedSlots).map((key) => {
          const [day, time] = key.split('-');
          return { day, time };
        });
      },
      clearSelection: () => {
        setSelectedSlots(new Set());
        if (onSelectionChange) {
          onSelectionChange([]);
        }
      },
      setSelectedSlots: (slots: TimeSlot[]) => {
        const newSelected = new Set(
          slots.map((slot) => getSlotKey(slot.day, slot.time))
        );
        setSelectedSlots(newSelected);
        if (onSelectionChange) {
          onSelectionChange(slots);
        }
      },
    }));

    return (
      <div
        className={cn('select-none', className)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="inline-block border border-gray-200 rounded-lg overflow-hidden">
          {/* Header row with days */}
          <div className="flex bg-gray-50">
            <div className="w-20 h-10 flex items-center justify-center border-b border-r border-gray-200 font-semibold text-sm">
              Time
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="w-16 h-10 flex items-center justify-center border-b border-r last:border-r-0 border-gray-200 font-semibold text-sm"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Time slots grid */}
          {timeSlots.map((time) => (
            <div key={time} className="flex">
              {/* Time label */}
              <div className="w-20 h-10 flex items-center justify-center border-b border-r border-gray-200 text-xs text-gray-600">
                {time}
              </div>

              {/* Day cells */}
              {days.map((day) => {
                const isSelected = isSlotSelected(day, time);
                return (
                  <div
                    key={`${day}-${time}`}
                    className={cn(
                      'w-16 h-10 border-b border-r last:border-r-0 border-gray-200 cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-violet-500 hover:bg-violet-600'
                        : 'bg-white hover:bg-violet-50'
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
  }
);

TimeTable.displayName = 'TimeTable';

export { TimeTable };