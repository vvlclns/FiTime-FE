import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntryStore } from '@/stores/entryStore';
import { TimeTableController } from '@/components/timetable';
import { matrixToTimespans } from '@/components/timetable/util.ts';
import type { TimespanSlots } from '@/components/timetable/util.ts';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/axios';

export function EntryTimetable() {
  const navigate = useNavigate();

  const user_id = useEntryStore((state) => state.user_id);
  const defaultTimetable = useEntryStore((state) => state.timetable);
  const setTimetableData = useEntryStore((state) => state.setTimetableData);

  const [slotSpans, setSlotSpans] = useState<TimespanSlots[] | undefined>(
    defaultTimetable,
  );

  // useEffect(() => {
  //   const fetchTimetable = async () => {
  //     try {
  //       // 이미 선택된 슬롯이 있으면 return
  //       if (slotSpans && slotSpans.length > 0) return;
  //       if (defaultTimetable && defaultTimetable.length > 0) return;

  //       const availability = [
  //         // [월요일] Rank 2: 19~21시
  //         [
  //           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0,
  //           0,
  //         ],

  //         // [화요일] 선택된 시간 없음
  //         [
  //           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  //           0,
  //         ],

  //         // [수요일] Rank 1: 14~17시
  //         [
  //           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0,
  //           0,
  //         ],

  //         // [목요일] Rank 4: 12~13시, 18~20시
  //         [
  //           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 4, 4, 4, 0, 0,
  //           0,
  //         ],

  //         // [금요일] Rank 3: 20~23시
  //         [
  //           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3,
  //           3,
  //         ],

  //         // [토요일] Rank 4: 14~16시
  //         [
  //           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0,
  //           0,
  //         ],

  //         // [일요일] 선택된 시간 없음
  //         [
  //           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  //           0,
  //         ],
  //       ];

  //       // availability -> TimespanSlots[] 변환
  //       const parsed: TimespanSlots[] = matrixToTimespans(availability);
  //       setTimetableData({ timetable: parsed });
  //       setSlotSpans(parsed);
  //     } catch (err) {
  //       return;
  //     }
  //   };

  //   fetchTimetable();
  // }, [user_id]);

  useEffect(() => {
    if (!user_id) return;

    const fetchTimetable = async () => {
      try {
        // 이미 선택된 슬롯이 있으면 return
        if (slotSpans && slotSpans.length > 0) return;
        if (defaultTimetable && defaultTimetable.length > 0) return;

        const { data } = await api.get<{
          status: string;
          message: string;
          availability: number[][];
        }>(`/user/time/${user_id}`);

        // availability -> TimespanSlots[] 변환
        const parsed: TimespanSlots[] = matrixToTimespans(data.availability);
        setTimetableData({ timetable: parsed });
        setSlotSpans(parsed);
      } catch (err) {
        return;
      }
    };

    fetchTimetable();
  }, [user_id]);

  const onSubmit = () => {
    if (!slotSpans || slotSpans.length === 0) {
      alert(
        '가능한 시간이 선택되지 않았습니다. 타임테이블에서 가능한 시간을 모두 선택해주세요.',
      );
      return;
    }
    setTimetableData({ timetable: slotSpans ?? [] });
    navigate('../rank');
  };

  return (
    <>
      <div className="flex flex-col px-5 py-7.5 gap-6">
        <Progress value={50} />
        <div className="flex flex-col w-full gap-1 text-left">
          <div className="w-full">가능한 시간을 모두 선택해주세요</div>
          <div className="w-full text-xs text-gray-500">
            다음 페이지에서 선호하는 순위를 선택할 수 있습니다
          </div>
        </div>
      </div>

      <div className="flex-box w-full justify-center">
        <div className="flex flex-col justify-center w-full">
          <TimeTableController
            initialData={defaultTimetable}
            onChange={setSlotSpans}
            interval={60}
            startTime="00:00"
            endTime="24:00"
          />
        </div>
      </div>

      <div className="flex w-full px-5 py-8 gap-5">
        <Button className="flex-1" onClick={onSubmit}>
          다음
        </Button>
      </div>
    </>
  );
}
