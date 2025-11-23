import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useEntryStore } from '@/stores/entryStore';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@radix-ui/react-label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TimespanSlots } from '@/components/timetable/util.ts';
import { buildRankMatrix } from '@/components/timetable/rankMatrix';

export function EntryRank() {
  const navigate = useNavigate();

  const user_id = useEntryStore((state) => state.user_id);
  const timetableResult = useEntryStore((state) => state.timetable);

  type Option = { key: string; label: string };

  const [rank1, setRank1] = useState<string>('');
  const [rank2, setRank2] = useState<string>('');
  const [rank3, setRank3] = useState<string>('');

  useEffect(() => {
    if (!timetableResult || timetableResult.length === 0) {
      alert(
        '선택된 시간이 없습니다. 타임테이블에서 가능한 시간을 모두 선택해주세요.',
      );
      navigate('../timetable', { replace: true });
    }
  }, [timetableResult, navigate]);

  const DAY_ORDER = ['월', '화', '수', '목', '금', '토', '일'];
  const dayIndex = (d: string) => {
    const i = DAY_ORDER.indexOf(d);
    return i === -1 ? 7 : i; // 알 수 없는 요일은 뒤로
  };
  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  // 정렬 + 옵션 변환
  const timeOptions = (): Option[] => {
    const list = timetableResult ?? [];
    const sorted = [...list].sort((a, b) => {
      const d = dayIndex(a.day) - dayIndex(b.day);
      if (d !== 0) return d;
      const s = toMinutes(a.startTime) - toMinutes(b.startTime);
      if (s !== 0) return s;
      return toMinutes(a.endTime) - toMinutes(b.endTime);
    });
    return sorted.map(({ day, startTime, endTime }) => ({
      key: `${day}|${startTime}|${endTime}`,
      label: `${day} ${startTime}~${endTime}`,
    }));
  };

  const parseKey = (k: string): TimespanSlots | undefined => {
    if (!k) return;
    const [day, startTime, endTime] = k.split('|');
    if (!day || !startTime || !endTime) return;
    return { day, startTime, endTime };
  };

  const onSubmit = async () => {
    const ranks = {
      rank1: parseKey(rank1),
      rank2: parseKey(rank2),
      rank3: parseKey(rank3),
    };
    const availability = buildRankMatrix(timetableResult ?? [], ranks);

    // 유저 일정 등록
    try {
      await api.post<{ status: string; message: string }>('/user/time', {
        user_id,
        availability,
      });

      navigate('../complete', { replace: true });
    } catch (err) {
      alert('일정 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const options = timeOptions();

  return (
    <>
      <div className="flex flex-col px-5 py-7.5 gap-6">
        <Progress value={75} />
        <div className="flex flex-col w-full gap-1 text-left">
          <div className="w-full">선호하는 1~3순위를 선택해주세요</div>
          <div className="w-full text-xs text-gray-500">
            순위 지정이 불필요하다면 건너뛰셔도 되며, 선택되지 않은 시간은 모두
            4순위로 자동 지정됩니다
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full px-5 py-4 gap-6">
        <div className="flex flex-col w-full gap-1.5">
          <Select value={rank1} onValueChange={setRank1}>
            <Label className="font-medium text-sm text-left" htmlFor="rank1">
              1순위
            </Label>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="1순위를 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem
                  key={o.key}
                  value={o.key}
                  disabled={o.key === rank2 || o.key === rank3}
                >
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col w-full gap-1.5">
          <Select value={rank2} onValueChange={setRank2} disabled={!rank1}>
            <Label className="font-medium text-sm text-left" htmlFor="rank2">
              2순위
            </Label>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  rank1
                    ? '2순위를 선택해주세요'
                    : '앞 순위부터 차례대로 선택해주세요'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem
                  key={o.key}
                  value={o.key}
                  disabled={o.key === rank1 || o.key === rank3}
                >
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col w-full gap-1.5">
          <Select value={rank3} onValueChange={setRank3} disabled={!rank2}>
            <Label className="font-medium text-sm text-left" htmlFor="rank3">
              3순위
            </Label>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  rank2
                    ? '3순위를 선택해주세요'
                    : '앞 순위부터 차례대로 선택해주세요'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem
                  key={o.key}
                  value={o.key}
                  disabled={o.key === rank1 || o.key === rank2}
                >
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex w-full px-5 py-8 gap-5">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate('../timetable')}
        >
          이전
        </Button>
        <Button className="flex-1" onClick={onSubmit}>
          다음
        </Button>
      </div>
    </>
  );
}
