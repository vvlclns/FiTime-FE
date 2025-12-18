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

  const reset = useEntryStore((state) => state.reset);
  const user_id = useEntryStore((state) => state.user_id);
  const timetableResult = useEntryStore((state) => state.timetable);
  const rankStore1 = useEntryStore((state) => state.rank1);
  const rankStore2 = useEntryStore((state) => state.rank2);
  const rankStore3 = useEntryStore((state) => state.rank3);
  const setRankData = useEntryStore((state) => state.setRankData);

  const DAY_ORDER = ['월', '화', '수', '목', '금', '토', '일'];
  type Option = { key: string; label: string };
  const buildKey = (s: TimespanSlots) => `${s.day}|${s.startTime}|${s.endTime}`;

  // 최초 렌더 시 rankStore 값이 있으면 그 값으로 초기화, 없으면 빈 문자열
  const [rank1, setRank1] = useState<string>(() =>
    rankStore1 ? buildKey(rankStore1) : '',
  );
  const [rank2, setRank2] = useState<string>(() =>
    rankStore2 ? buildKey(rankStore2) : '',
  );
  const [rank3, setRank3] = useState<string>(() =>
    rankStore3 ? buildKey(rankStore3) : '',
  );

  // 로그인 체크: user_id가 없으면 EntryUser로 리다이렉트
  useEffect(() => {
    if (!user_id) {
      navigate('../', { replace: true });
    }
  }, [user_id, navigate]);

  useEffect(() => {
    if (!timetableResult || timetableResult.length === 0) {
      alert(
        '선택된 시간이 없습니다. 타임테이블에서 가능한 시간을 모두 선택해주세요.',
      );
      navigate('../timetable', { replace: true });
    }
  }, [timetableResult, navigate]);

  const dayIndex = (d: string) => {
    const i = DAY_ORDER.indexOf(d);
    return i === -1 ? 7 : i; // 알 수 없는 요일은 뒤로
  };

  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  // 정렬 + 옵션 변환
  const options: Option[] = (() => {
    const list = timetableResult ?? [];

    const sorted = [...list].sort((a, b) => {
      const d = dayIndex(a.day) - dayIndex(b.day);
      if (d !== 0) return d;
      const s = toMinutes(a.startTime) - toMinutes(b.startTime);
      if (s !== 0) return s;
      return toMinutes(a.endTime) - toMinutes(b.endTime);
    });

    return sorted.map((t) => ({
      key: buildKey(t),
      label: `${t.day} ${t.startTime}~${t.endTime}`,
    }));
  })();

  // options(timetableResult) 변경 시 현재 선택값이 목록에 없으면 초기화
  useEffect(() => {
    const keys = new Set(options.map((o) => o.key));

    if (rank1 && !keys.has(rank1)) setRank1('');
    if (rank2 && !keys.has(rank2)) setRank2('');
    if (rank3 && !keys.has(rank3)) setRank3('');

    // 순차 제약 (앞순위가 초기화되면 뒷순위도 함께 초기화)
    if (!rank1 && rank2) setRank2('');
    if (!rank2 && rank3) setRank3('');
  }, [options]);

  useEffect(() => {
    if (!user_id) return;

    if (rankStore1 && !rank1) setRank1(buildKey(rankStore1));
    if (rankStore2 && !rank2) setRank2(buildKey(rankStore2));
    if (rankStore3 && !rank3) setRank3(buildKey(rankStore3));
  }, [user_id, rankStore1, rankStore2, rankStore3]);

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
    setRankData(ranks);
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
        <Progress value={75} />

        <div className="flex flex-col w-full gap-1 text-left">
          <div className="flex w-full justify-between">
            <div>선호하는 1~3순위를 선택해주세요</div>
            <Button
              className="text-xs h-6 px-2 bg-gray-100 text-red-600 hover:bg-red-50 hover:text-red-600"
              variant={'ghost'}
              onClick={onDeleteUser}
            >
              방 나가기
            </Button>
          </div>
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
