import { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';

type RoomInfo = {
  title: string;
  descriptions?: string;
};

export function EntryLayout() {
  const navigate = useNavigate();
  const { room_link } = useParams();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);

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

  if (!roomInfo) {
    return (
      <div className="w-full min-h-screen bg-gray-100">
        <div className="w-[375px] mx-auto bg-white min-h-screen">
          <div className="flex justify-center py-20 text-lg text-gray-500">
            방 정보를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="w-[375px] mx-auto bg-white min-h-screen">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
