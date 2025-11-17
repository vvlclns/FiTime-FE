import './App.css';
import { Routes, Route } from 'react-router-dom';
import TimetableView from '@/pages/TimetableTest.tsx';

export default function App() {
  return (
    <>
      <Routes>
        <Route path='/timetable' element={<TimetableView />}/>
      </Routes>
    </>
  );
}
