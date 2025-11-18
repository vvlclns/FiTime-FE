import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center w-[375px] h-[60px] px-5 gap-2.5 border-b border-b-gray-200">
      <div
        className="text-violet-700 text-xl font-semibold cursor-pointer"
        onClick={() => navigate('/')}
      >
        FiTime
      </div>
    </div>
  );
};
