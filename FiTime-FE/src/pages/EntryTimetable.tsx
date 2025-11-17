import { useNavigate } from 'react-router-dom';
import { useEntryStore } from '@/stores/entryStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function EntryTimetable() {
  const navigate = useNavigate();

  function onSubmit(values: unknown) {
    navigate('../rank');
  }

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

      <div className="flex w-full px-5 py-8 gap-5">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate('..')}
        >
          이전
        </Button>
        <Button className="flex-1" onClick={() => onSubmit(undefined)}>
          다음
        </Button>
      </div>
    </>
  );
}
