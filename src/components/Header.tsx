import React from 'react';
import { Flame, Shield, UserCheck, ShieldAlert, Dumbbell, Sparkles, LogOut, LogIn } from 'lucide-react';
import { UserProfile, Role } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  currentRole: Role;
  onToggleRole?: () => void;
  onOpenAI: () => void;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentRole,
  onToggleRole,
  onOpenAI,
  onLogout,
  onOpenLogin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-md border border-amber-400">
            <Dumbbell className="w-5 h-5 -rotate-12 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-zinc-100">
                PANGLIMA
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                GYM
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 -mt-0.5 font-medium">
              Track Reps • Own Progress
            </p>
          </div>
        </div>

        {/* Quick Stats & Controls */}
        <div className="flex items-center gap-2">
          {/* AI Shortcut Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all active:scale-95 shadow-sm"
            title="Buka PANGLIMA AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>

          {user ? (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-zinc-800/80 transition-colors"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-zinc-950 font-extrabold text-xs shadow hover:bg-amber-400 transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

