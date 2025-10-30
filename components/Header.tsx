
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 p-4 shadow-md sticky top-0 z-10 flex items-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <i className="fa-solid fa-lightbulb text-2xl text-yellow-300"></i>
        </div>
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full"></div>
      </div>
      <div className="ml-4">
        <h1 className="text-xl font-bold text-white">Opal AI Tutor</h1>
        <p className="text-sm text-green-400">Online</p>
      </div>
    </header>
  );
};

export default Header;
