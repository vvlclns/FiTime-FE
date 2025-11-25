import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import StartPage from '@/pages/StartPage';
import CreateRoom from '@/pages/CreateRoom';
import CreateComplete from '@/pages/CreateComplete';
import { EntryLayout } from './pages/EntryLayout';
import { EntryUser } from './pages/EntryUser';
import { EntryTimetable } from './pages/EntryTimetable';
import { EntryRank } from './pages/EntryRank';
import { EntryComplete } from './pages/EntryComplete';
import ViewResult from '@/pages/ViewResult.tsx';

export default function App() {
  return (
    <>
      <Routes>
        {/* 기본 경로 설정 */}
        <Route path="/" element={<Navigate to="/main" replace />} />
        <Route path="/main" element={<StartPage />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/create/complete" element={<CreateComplete />} />

        <Route path="/room/:room_link" element={<EntryLayout />}>
          <Route index element={<EntryUser />} />
          <Route path="timetable" element={<EntryTimetable />} />
          <Route path="rank" element={<EntryRank />} />
          <Route path="complete" element={<EntryComplete />} />
          <Route path="result" element={<ViewResult />} />
        </Route>
      </Routes>
    </>
  );
}
