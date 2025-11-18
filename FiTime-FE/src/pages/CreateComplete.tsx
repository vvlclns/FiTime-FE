import { useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';

export default function CreateComplete() {
  const location = useLocation();
  const link = location.state?.link || null;

  if (!link) {
    return (
      <div className="relative w-full min-h-screen bg-gray-100">
        <div className="w-[375px] mx-auto bg-white min-h-screen">
          <Header />

          <div className="absolute flex flex-col top-[150px] mx-auto w-[375px] gap-1">
            <div className="text-lg">방 생성 중 오류가 발생했습니다</div>
            <div className="text-xs text-gray-500">다시 시도해주세요</div>
          </div>
          <div className="absolute flex w-[375px] top-[320px] px-5 py-9 gap-2.5">
            <Button disabled className="w-full">
              링크 복사하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          <Button
            disabled={!link}
            className="w-full"
            onClick={() => {
              if (!link) return;

              navigator.clipboard.writeText(link);
              alert('링크가 복사되었습니다.');
            }}
          >
            링크 복사하기
          </Button>
        </div>
      </div>
    </div>
  );
}
