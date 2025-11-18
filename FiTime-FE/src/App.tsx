import './App.css';
import { Routes, Route } from 'react-router-dom';
import { EntryLayout } from './pages/EntryLayout';
import { EntryUser } from './pages/EntryUser';
import { EntryTimetable } from './pages/EntryTimetable';
import { EntryRank } from './pages/EntryRank';
import { EntryComplete } from './pages/EntryComplete';
import TimetableView from '@/pages/TimetableTest.tsx';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/room/:room_id" element={<EntryLayout />}>
          <Route index element={<EntryUser />} />
          <Route path="timetable" element={<EntryTimetable />} />
          <Route path="rank" element={<EntryRank />} />
          <Route path="complete" element={<EntryComplete />} />
        </Route>
        <Route path="/timetable" element={<TimetableView />} />
      </Routes>
    </>
  );
}
