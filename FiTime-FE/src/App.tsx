import './App.css';
import { Routes, Route } from 'react-router-dom';
import CreatePage from './pages/CreatePage';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/create" element={<CreatePage />} />
      </Routes>
    </>
  );
}
