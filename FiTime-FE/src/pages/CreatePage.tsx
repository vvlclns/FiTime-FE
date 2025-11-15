import { Header } from '../components/Header';
import { Button } from '@/components/ui/button';

export default function CreatePage() {
  return (
    // 바깥 프레임
    <div className="relative w-full min-h-screen bg-gray-100">
      {/* 중앙 컨텐츠 프레임 */}
      <div className="w-[375px] mx-auto bg-white min-h-screen">
        <Header />

        <div className="absolute top-[150px] mx-auto w-[375px] h-[48px] text-center text-base">
          링크 공유 한 번으로 모두의 선호 순위를 반영한
          <br />
          가장 적합한 만남 일정을 추천받아보세요!
        </div>

        <div className="absolute flex w-[375px] top-[320px] px-5 py-9 gap-2.5">
          <Button className="w-full">시작하기</Button>
        </div>
      </div>
    </div>
  );
}
