import React from 'react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-indigo-600 focus:outline-none lg:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div>
          <h1 className="text-xl font-semibold text-indigo-700">სამედიცინო ტრანსკრიფციის სისტემა</h1>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('ka-GE')}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
            დდ
          </div>
          <span className="text-sm font-medium text-gray-700 ml-2">ექიმი დავით</span>
        </div>
      </div>
    </header>
  );
};

export default Header;