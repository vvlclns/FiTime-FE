import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';

export default function CreateSuccess() {
  return (
    // 바깥 프레임
    <div className="relative w-full min-h-screen bg-gray-100">
      {/* 중앙 컨텐츠 프레임 */}
      <div className="w-[375px] mx-auto bg-white min-h-screen">
        <Header />

        <div className="absolute flex flex-col top-[150px] mx-auto w-[375px] gap-1">
          <div className="text-lg">방 생성이 완료되었습니다!</div>
          <div className="text-xs text-gray-500">
            링크를 공유해 친구들을 초대해보세요
          </div>
        </div>

        <div className="absolute flex w-[375px] top-[320px] px-5 py-9 gap-2.5">
          <Button className="w-full">링크 복사하기</Button>
        </div>
      </div>
    </div>
  );
}
