import { useMemo } from 'react';
import { cn, parseTimeToMinutes, formatMinutesToTime } from '@/lib/utils.ts';

export interface TimeSlot {
  day: string;
  time: string;
}

export interface TimeTableProps {
  // Grid configuration
  days?: string[];
  startTime?: string;
  endTime?: string;
  interval?: number;

  // Display data - use ONE of these:
  selectedSlots?: TimeSlot[]; // For selection mode
  heatmapData?: Record<string, number>; // For heatmap mode: "day-time" -> priority

  // Interaction callbacks (optional, for interactive mode)
  onCellMouseDown?: (day: string, time: string) => void;
  onCellMouseEnter?: (day: string, time: string) => void;
  onCellMouseUp?: () => void;

  className?: string;
}

const TimeTable = ({
  days = ['월', '화', '수', '목', '금', '토', '일'],
  startTime = '09:00',
  endTime = '21:00',
  interval = 30,
  selectedSlots = [],
  heatmapData,
  onCellMouseDown,
  onCellMouseEnter,
  onCellMouseUp,
  className,
}: TimeTableProps) => {
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

  // Convert selectedSlots array to Set for O(1) lookup
  const selectedSlotsSet = useMemo(
    () => new Set(selectedSlots.map((slot) => getSlotKey(slot.day, slot.time))),
    [selectedSlots],
  );

  // Check if slot is selected
  const isSlotSelected = (day: string, time: string) => {
    return selectedSlotsSet.has(getSlotKey(day, time));
  };

  // Get heatmap priority for a slot
  const getHeatmapPriority = (day: string, time: string): number | null => {
    if (!heatmapData) return null;
    return heatmapData[getSlotKey(day, time)] ?? null;
  };

  // Get cell styling based on mode
  const getCellStyle = (day: string, time: string) => {
    const isInteractive = !!onCellMouseDown;

    // Heatmap mode (Not interactive)
    if (heatmapData) {
      const priority = getHeatmapPriority(day, time);
      if (priority === null) {
        return 'bg-white';
      }

      // Color based on priority (1 = highest priority)
      const heatmapColors = [
        'bg-violet-700', // priority 1
        'bg-violet-500', // priority 2
        'bg-violet-300', // priority 3
        'bg-violet-100', // priority 4+
      ];

      // Find color index of matching priority
      const colorIndex = Math.min(priority - 1, heatmapColors.length - 1);
      return heatmapColors[colorIndex];
    }

    // Selection mode (On/Off)
    const isSelected = isSlotSelected(day, time);
    return cn(
      isSelected ? 'bg-violet-500' : 'bg-white',
      isInteractive && !isSelected && 'hover:bg-violet-50',
      isInteractive && isSelected && 'hover:bg-violet-600',
    );
  };

  // Get cursor style
  const getCursorStyle = () => {
    return onCellMouseDown ? 'cursor-pointer' : 'cursor-default';
  };

  return (
    <div
      className={cn('select-none', className)}
      onMouseUp={onCellMouseUp}
      onMouseLeave={onCellMouseUp}
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
            {days.map((day) => (
              <div
                key={`${day}-${time}`}
                className={cn(
                  'w-10 h-9 border-b border-r last:border-r-0 border-gray-200 transition-colors',
                  getCellStyle(day, time),
                  getCursorStyle(),
                )}
                onMouseDown={() => onCellMouseDown?.(day, time)}
                onMouseEnter={() => onCellMouseEnter?.(day, time)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

TimeTable.displayName = 'TimeTable';

export { TimeTable };
