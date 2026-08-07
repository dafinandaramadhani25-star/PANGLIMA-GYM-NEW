import React from 'react';
import { Medal, Trophy } from 'lucide-react';
import { LeaderboardEntry, UserProfile } from '../types';

interface LeaderboardViewProps {
  leaderboard: LeaderboardEntry[];
  currentUser: UserProfile;
  onOpenAIWithContext: (prompt: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  leaderboard,
  currentUser,
}) => {
  const top3 = leaderboard.slice(0, 3);

  if (leaderboard.length === 0) {
    return (
      <div className="space-y-5 pb-24 animate-in fade-in duration-300">
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-8 text-center space-y-3 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Papan Peringkat Masih Kosong</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              Belum ada pengguna yang terdaftar di papan peringkat. Selesaikan latihan SBD (Squat, Bench Press, Deadlift) Anda untuk mencatatkan rekor pertama!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Podium Top 3 Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-2">
        {/* 🥈 Rank 2 */}
        {top3[1] ? (
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-700/80 p-3 text-center space-y-2 shadow-lg relative transform hover:-translate-y-1 transition-all">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-zinc-950 font-black text-xs flex items-center justify-center shadow">
              2
            </div>
            <img
              src={top3[1].userAvatar}
              alt={top3[1].userName}
              className="w-12 h-12 rounded-full object-cover mx-auto border-2 border-slate-300 mt-2"
            />
            <div>
              <h3 className="text-xs font-bold text-zinc-200 line-clamp-1">{top3[1].userName.replace(/\s*\(Anda\)$/i, '')}</h3>
              <p className="text-sm font-black text-slate-300 mt-0.5">{top3[1].sbdTotalKg} kg</p>
            </div>
            <div className="text-[9px] text-zinc-400 bg-zinc-950 py-1 rounded-lg border border-zinc-800">
              S:{top3[1].squatPRKg} B:{top3[1].benchPRKg} D:{top3[1].deadliftPRKg}
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* 🥇 Rank 1 (Tallest - Center) */}
        {top3[0] && (
          <div className="bg-gradient-to-b from-amber-950/80 via-zinc-900 to-zinc-900 rounded-2xl border-2 border-amber-500/80 p-3.5 text-center space-y-2 shadow-2xl relative transform -translate-y-2 hover:-translate-y-3 transition-all">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-amber-400 text-zinc-950 font-black text-xs flex items-center justify-center shadow-lg shadow-amber-500/40 border border-amber-300">
              <Trophy className="w-4 h-4 text-zinc-950 fill-amber-950/20" />
            </div>
            <img
              src={top3[0].userAvatar}
              alt={top3[0].userName}
              className="w-14 h-14 rounded-full object-cover mx-auto border-2 border-amber-400 mt-2 shadow-md shadow-amber-500/30"
            />
            <div>
              <h3 className="text-xs font-extrabold text-amber-300 line-clamp-1">{top3[0].userName.replace(/\s*\(Anda\)$/i, '')}</h3>
              <p className="text-base font-black text-amber-400 mt-0.5">{top3[0].sbdTotalKg} kg</p>
            </div>
            <div className="text-[9px] font-bold text-amber-300 bg-amber-500/10 py-1 rounded-lg border border-amber-500/20">
              S:{top3[0].squatPRKg} B:{top3[0].benchPRKg} D:{top3[0].deadliftPRKg}
            </div>
          </div>
        )}

        {/* 🥉 Rank 3 */}
        {top3[2] ? (
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-3 text-center space-y-2 shadow-lg relative transform hover:-translate-y-1 transition-all">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center shadow">
              3
            </div>
            <img
              src={top3[2].userAvatar}
              alt={top3[2].userName}
              className="w-12 h-12 rounded-full object-cover mx-auto border-2 border-amber-700 mt-2"
            />
            <div>
              <h3 className="text-xs font-bold text-zinc-200 line-clamp-1">{top3[2].userName.replace(/\s*\(Anda\)$/i, '')}</h3>
              <p className="text-sm font-black text-amber-600 mt-0.5">{top3[2].sbdTotalKg} kg</p>
            </div>
            <div className="text-[9px] text-zinc-400 bg-zinc-950 py-1 rounded-lg border border-zinc-800">
              S:{top3[2].squatPRKg} B:{top3[2].benchPRKg} D:{top3[2].deadliftPRKg}
            </div>
          </div>
        ) : (
          <div />
        )}
      </div>

      {/* Full Leaderboard List Table */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 shadow-lg space-y-3">
        <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
          <Medal className="w-4 h-4 text-amber-400" />
          <span>Daftar Peringkat Seluruh Pengguna</span>
        </h2>

        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const isSelf = entry.userId === currentUser.id;

            return (
              <div
                key={entry.userId}
                className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                  isSelf
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                      entry.rank === 1
                        ? 'bg-amber-400 text-zinc-950'
                        : entry.rank === 2
                        ? 'bg-slate-300 text-zinc-950'
                        : entry.rank === 3
                        ? 'bg-amber-700 text-zinc-100'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    #{entry.rank}
                  </span>

                  <img
                    src={entry.userAvatar}
                    alt={entry.userName}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-800 shrink-0"
                  />

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-zinc-100">{entry.userName.replace(/\s*\(Anda\)$/i, '')}</h4>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Squat: <strong className="text-zinc-200">{entry.squatPRKg}kg</strong> • Bench:{' '}
                      <strong className="text-zinc-200">{entry.benchPRKg}kg</strong> • Deadlift:{' '}
                      <strong className="text-zinc-200">{entry.deadliftPRKg}kg</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-amber-400 block">{entry.sbdTotalKg} kg</span>
                  <span className="text-[9px] text-zinc-500">Total SBD</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
