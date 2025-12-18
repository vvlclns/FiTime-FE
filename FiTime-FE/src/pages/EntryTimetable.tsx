import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntryStore } from '@/stores/entryStore';
import { TimeTableController } from '@/components/timetable';
import { matrixToTimespans } from '@/components/timetable/util.ts';
import type { TimespanSlots } from '@/components/timetable/util.ts';
import { matrixToRankSlots } from '@/components/timetable/rankMatrix';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/axios';

export function EntryTimetable() {
  const navigate = useNavigate();

  const reset = useEntryStore((state) => state.reset);
  const user_id = useEntryStore((state) => state.user_id);
  const defaultTimetable = useEntryStore((state) => state.timetable);
  const setTimetableData = useEntryStore((state) => state.setTimetableData);
  const setRankData = useEntryStore((state) => state.setRankData);

  const [slotSpans, setSlotSpans] = useState<TimespanSlots[] | undefined>(
    defaultTimetable,
  );

  useEffect(() => {
    if (!user_id) {
      // 로그인 체크: user_id가 없으면 EntryUser로 리다이렉트
      navigate('../', { replace: true });
    }

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

        if (data.availability.length === 0) return;
        else {
          // availability -> TimespanSlots[] 변환 + 순위 적용
          const parsed: TimespanSlots[] = matrixToTimespans(data.availability);
          const rankSlots = matrixToRankSlots(data.availability);

          setTimetableData({ timetable: parsed });
          setSlotSpans(parsed);
          setRankData(rankSlots);
        }
      } catch (err) {
        return;
      }
    };

    fetchTimetable();
  }, [user_id, navigate]);

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

  const onDeleteUser = async () => {
    try {
      await api.delete<{ status: string; message: string }>(
        `/user/delete/${user_id}`,
      );
      reset();
      navigate('/', { replace: true });
    } catch (err) {
      alert('방 나가기에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
      <div className="flex flex-col px-5 py-7.5 gap-6">
        <Progress value={50} />

        <div className="flex flex-col w-full gap-1 text-left">
          <div className="flex w-full justify-between">
            <div>가능한 시간을 모두 선택해주세요</div>
            <Button
              className="text-xs h-6 px-2 bg-gray-100 text-red-600 hover:bg-red-50 hover:text-red-600"
              variant={'ghost'}
              onClick={onDeleteUser}
            >
              방 나가기
            </Button>
          </div>
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
