import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function CreateRoom() {
  const navigate = useNavigate();

  return (
    // 바깥 프레임
    <div className="relative w-full min-h-screen bg-gray-100">
      {/* 중앙 컨텐츠 프레임 */}
      <div className="w-[375px] mx-auto bg-white min-h-screen">
        <Header />

        <div className="absolute flex flex-col w-[375px] top-[90px] px-5 py-4 gap-8">
          <div className="flex flex-col w-full gap-2">
            <Label htmlFor="title">약속 제목</Label>
            <Input
              type="text"
              id="title"
              placeholder="약속의 제목을 입력해주세요"
            />
          </div>
          <div className="flex flex-col w-full gap-2">
            <Label htmlFor="description">약속 설명 (선택)</Label>
            <Input
              type="text"
              id="description"
              placeholder="약속의 설명을 입력해주세요"
            />
          </div>
        </div>

        <div className="absolute flex w-[375px] top-[320px] px-5 py-9 gap-2.5">
          <Button
            className="w-full"
            onClick={() => navigate('/create/success')}
          >
            약속 생성하기
          </Button>
        </div>
      </div>
    </div>
  );
}
