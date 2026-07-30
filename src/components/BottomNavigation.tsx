import React from 'react';
import { Home, Dumbbell, Sparkles, Trophy, User } from 'lucide-react';

export type TabType = 'home' | 'workout' | 'ai' | 'ranking' | 'profile';

interface BottomNavigationProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  isAdminView?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onChangeTab,
  isAdminView,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0c0c0e]/95 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-2 pb-safe">
      <div className="max-w-md mx-auto relative flex items-center justify-between px-2">
        {/* 🏠 Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-zinc-400 font-medium hover:text-zinc-200'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">Home</span>
        </button>

        {/* 🏋 Workout */}
        <button
          onClick={() => onChangeTab('workout')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'workout'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-zinc-400 font-medium hover:text-zinc-200'
          }`}
        >
          <Dumbbell className={`w-5 h-5 ${activeTab === 'workout' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">Workout</span>
        </button>

        {/* 🤖 PANGLIMA AI - Clean Center Action Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={() => onChangeTab('ai')}
            className={`relative flex items-center justify-center w-13 h-13 rounded-2xl bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 border-2 border-amber-400 transition-all transform hover:scale-105 active:scale-95 ${
              activeTab === 'ai' ? 'ring-4 ring-amber-500/20 scale-105 bg-amber-400' : ''
            }`}
            title="PANGLIMA AI Fitness Assistant"
          >
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
            <span className="sr-only">PANGLIMA AI</span>
          </button>
        </div>

        {/* 🏆 Ranking */}
        <button
          onClick={() => onChangeTab('ranking')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'ranking'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-zinc-400 font-medium hover:text-zinc-200'
          }`}
        >
          <Trophy className={`w-5 h-5 ${activeTab === 'ranking' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">Ranking</span>
        </button>

        {/* 👤 Profile */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-zinc-400 font-medium hover:text-zinc-200'
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[11px] mt-1 tracking-tight">
            {isAdminView ? 'Admin' : 'Profile'}
          </span>
        </button>
      </div>
    </nav>
  );
};
