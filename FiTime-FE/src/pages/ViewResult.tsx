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
import { mergeSolutionTimeSlots } from '@/lib/solutionUtils';

type RoomInfo = {
  title: string;
  descriptions?: string;
};

export default function ViewResult() {
  const navigate = useNavigate();
  const { room_link } = useParams();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>();
  const [solutionResponse, setSolutionResponse] = useState<SolutionResponse>();
  const [numUsers, setNumUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const USE_MOCK = false;
  const TOP_N_RESULTS = 3;

  // room_link가 바뀔 때 방 정보 API로 불러오기
  useEffect(() => {
    const fetchRoomInfo = async () => {
      if (!room_link) return;
      try {
        const { data } = await api.get(`/room/${room_link}`);
        setRoomInfo(data);
      } catch (err) {
        alert('존재하지 않는 방입니다.');
        navigate('/', { replace: true });
      }
    };

    fetchRoomInfo();
  }, [room_link, navigate]);

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
          setNumUsers(heatmapMock.num_users);
        } else {
          // Fetch from real API
          const [solutionRes, heatmapRes] = await Promise.all([
            api.get<SolutionResponse>(`/room/solution/${room_link}`),
            api.get<HeatmapResponse>(`/room/heatmap/${room_link}`),
          ]);

          const transformedData = transformHeatmapData(
            heatmapRes.data.num_available,
          );
          setHeatmapData(transformedData);
          setSolutionResponse(solutionRes.data);
          setNumUsers(heatmapRes.data.num_users);
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

  const shareFeature = async () => {
    const shareUrl = window.location.href;
    const shareTitle = roomInfo?.title || '일정 조율 결과';
    const shareText = `${shareTitle} - FiTime에서 확인하세요!`;

    try {
      // Use Web Share API if available (mobile devices)
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('링크가 복사되었습니다!');
      }
    } catch (err) {
      // User cancelled the share or error occurred
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share failed:', err);
        // Try clipboard as final fallback
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert('링크가 복사되었습니다!');
        } catch {
          alert('공유에 실패했습니다. 링크를 복사해주세요.');
        }
      }
    }
  };

  // Loading state
  if (!roomInfo || loading) {
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
                <div className="text-lg/[20px] font-bold">
                  {roomInfo?.title}
                </div>
                <div className="text-sm/[20px] text-gray-500">
                  {roomInfo?.descriptions}
                </div>
              </div>
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
                  results={mergeSolutionTimeSlots(
                    solutionResponse?.solution || [],
                    numUsers,
                  ).slice(0, TOP_N_RESULTS)}
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
                navigate(`/room/${room_link}`);
              }}
            >
              스케줄 수정하기
            </Button>
            <Button className="flex-1" onClick={shareFeature}>
              결과 공유하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
