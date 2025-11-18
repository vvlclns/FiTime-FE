import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import StartPage from '@/pages/StartPage';
import CreateRoom from '@/pages/CreateRoom';
import CreateComplete from '@/pages/CreateComplete';

export default function App() {
  return (
    <>
      <Routes>
        {/* 기본 경로 설정 */}
        <Route path="/" element={<Navigate to="/main" replace />} />
        <Route path="/main" element={<StartPage />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/create/complete" element={<CreateComplete />} />
      </Routes>
    </>
  );
}
