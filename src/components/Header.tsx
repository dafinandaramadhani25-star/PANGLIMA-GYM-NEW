import React from 'react';
import { LogOut, LogIn } from 'lucide-react';
import { UserProfile, Role } from '../types';
import { PanglimaLogo } from './PanglimaLogo';

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
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-95 transition-opacity">
          <PanglimaLogo size="md" badge="GYM" />
        </div>

        {/* Quick Stats & Controls */}
        <div className="flex items-center gap-2">
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

