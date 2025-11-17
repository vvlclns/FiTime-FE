import { useNavigate } from 'react-router-dom';
import { useEntryStore } from '@/stores/entryStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@radix-ui/react-label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function EntryRank() {
  const navigate = useNavigate();

  function onSubmit(values: unknown) {
    navigate('../complete');
  }
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
          <Select>
            <Label className="font-medium text-sm text-left" htmlFor="rank1">
              1순위
            </Label>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="1순위를 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col w-full gap-1.5">
          <Select>
            <Label className="font-medium text-sm text-left" htmlFor="rank2">
              2순위
            </Label>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="2순위를 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col w-full gap-1.5">
          <Select>
            <Label className="font-medium text-sm text-left" htmlFor="rank3">
              3순위
            </Label>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="3순위를 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
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
        <Button className="flex-1" onClick={() => onSubmit(undefined)}>
          다음
        </Button>
      </div>
    </>
  );
}
