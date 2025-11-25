import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntryStore } from '@/stores/entryStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function EntryComplete() {
  const navigate = useNavigate();
  const reset = useEntryStore((state) => state.reset);

  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <>
      <div className="flex flex-col px-5 py-7.5 gap-12">
        <Progress value={100} />
        <div className="flex flex-col w-full gap-1">
          <div className="w-full">스케줄 입력이 완료되었습니다!</div>
          <div className="w-full text-xs text-gray-500">
            참여 결과를 실시간으로 확인해보세요
          </div>
        </div>
      </div>

      <div className="flex w-full px-5 pb-4 pt-15 gap-5">
        <Button className="flex-1" onClick={() => navigate('/')}>
          결과 확인하기
        </Button>
      </div>
    </>
  );
}
