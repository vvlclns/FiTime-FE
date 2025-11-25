import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { TimeTable } from '@/components/timetable/TimeTable';
import { Button } from '@/components/ui/button';
import { TimeSlotCardContainer } from '@/components/result/TimeSlotCardContainer.tsx';
import { useEffect, useState } from 'react';
import type { SolutionResponse, HeatmapResponse } from '@/types/api.ts';
import { api } from '@/lib/axios';
import mockHeatmapData from '@/mocks/heatmapData.json';
import mockSolutionData from '@/mocks/solutionData.json';

export default function ViewResult() {
  const navigate = useNavigate();

  const { room_link } = useParams();

  const [heatmapData, setHeatmapData] = useState<Record<string, number>>();
  const [solutionResponse, setSolutionResponse] = useState<SolutionResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const USE_MOCK = false;

  // Fetch all data (heatmap + solution)
  useEffect(() => {
    const fetchData = async () => {
      if (!room_link) return;

      try {
        setLoading(true);

        if (USE_MOCK) {
          // Use mock data
          const heatmapMock = mockHeatmapData as HeatmapResponse;
          const solutionMock = mockSolutionData as SolutionResponse;

          const transformedData = transformHeatmapData(
            heatmapMock.num_available,
          );
          setHeatmapData(transformedData);
          setSolutionResponse(solutionMock);
        } else {
          // Fetch from real API
          const [heatmapRes, solutionRes] = await Promise.all([
            api.get<HeatmapResponse>(`/room/heatmap/${room_link}`),
            api.get<SolutionResponse>(`/room/solution/${room_link}`),
          ]);

          const transformedData = transformHeatmapData(
            heatmapRes.data.num_available,
          );
          setHeatmapData(transformedData);
          setSolutionResponse(solutionRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('데이터를 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [room_link]);

  // Helper function to transform 2D array to heatmap format
  const transformHeatmapData = (
    numAvailable: number[][],
  ): Record<string, number> => {
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    const heatmap: Record<string, number> = {};

    numAvailable.forEach((dayData, dayIndex) => {
      dayData.forEach((count, hourIndex) => {
        if (count > 0) {
          const key = `${days[dayIndex]}-${hourIndex.toString().padStart(2, '0')}:00`;
          heatmap[key] = count;
        }
      });
    });

    return heatmap;
  };

  // Loading state
  if (loading) {
    return (
      <div className="relative w-full min-h-screen bg-gray-100">
        <div className="w-[375px] mx-auto bg-white min-h-screen">
          <Header />
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative w-full min-h-screen bg-gray-100">
        <div className="w-[375px] mx-auto bg-white min-h-screen">
          <Header />
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="text-red-600">{error}</div>
            <Button onClick={() => window.location.reload()}>다시 시도</Button>
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-9 px-5 py-4">
            {/* 약속 헤더 */}
            <div className="flex justify-between content-center pt-4">
              {/* 제목 섹션 */}
              <div className="flex flex-col top-[80px] mx-auto w-[375px] gap-y-1.5 text-left">
                <div className="text-lg/[20px] font-bold">약속 제목</div>
                <div className="text-sm/[20px] text-gray-500">약속 설명</div>
              </div>
              {/* 방 나가기 버튼*/}
              <Button
                className="bg-gray-100 text-red-600 hover:bg-red-50 hover:text-red-600 "
                variant={'ghost'}
              >
                방 나가기
              </Button>
            </div>
            {/* 일정 추천 */}
            <div className="flex flex-col gap-y-3">
              <div className="flex flex-col text-left gap-y-1">
                <div className="text-sm font-bold">만남 일정 추천</div>
                <div className="text-sm text-gray-500">
                  참여자들의 가능한 스케줄과 선호 순위를 종합하여 도출된 최적의
                  일정이에요
                </div>
              </div>
              {/* Cards */}
              <div className="flex flex-col">
                <TimeSlotCardContainer
                  results={solutionResponse?.solutions || []}
                />
              </div>
            </div>
          </div>

          {/* Heatmap TimeTable */}
          <div className="flex justify-center px-5 pb-5">
            <TimeTable
              heatmapData={heatmapData}
              startTime="00:00"
              endTime="24:00"
              interval={60}
            />
          </div>

          {/* Action Button (optional) */}
          <div className="flex justify-stretch w-[375px] gap-x-5 px-5 pb-8">
            <Button
              variant={'outline'}
              className="flex-1"
              onClick={() => {
                navigate(`/room/${room_link}/timetable`);
              }}
            >
              스케줄 수정하기
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                alert('기능 구현 예정');
              }}
            >
              결과 공유하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
