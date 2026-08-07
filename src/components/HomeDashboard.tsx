import React, { useState } from 'react';
import { 
  Dumbbell, 
  Trophy, 
  PlusCircle, 
  Scale,
  Percent,
  BicepsFlexed,
  ChevronRight,
  Megaphone,
  X
} from 'lucide-react';
import { UserProfile, WorkoutSession } from '../types';
import { getGymAnnouncement } from '../utils/storage';

interface HomeDashboardProps {
  user: UserProfile;
  workouts: WorkoutSession[];
  onStartNewWorkout: () => void;
  onNavigateTab: (tab: 'workout' | 'body' | 'ranking' | 'ai') => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  user,
  workouts,
  onStartNewWorkout,
  onNavigateTab,
}) => {
  const [announcement, setAnnouncement] = useState(getGymAnnouncement);
  const [dismissAnnouncement, setDismissAnnouncement] = useState(false);
  const latestBody = user.bodyProgressHistory && user.bodyProgressHistory.length > 0 
    ? user.bodyProgressHistory[user.bodyProgressHistory.length - 1] 
    : null;

  const userWorkouts = workouts.filter((w) => w.userId === user.id);

  let squatPR = user.personalRecords?.['ex-squat']?.maxWeightKg || 0;
  let benchPR = user.personalRecords?.['ex-bench']?.maxWeightKg || 0;
  let deadliftPR = user.personalRecords?.['ex-deadlift']?.maxWeightKg || 0;

  // Scan userWorkouts for any logged SBD PRs
  userWorkouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed && s.weightKg > 0) {
          const nameLower = ex.exerciseName.toLowerCase();
          if (ex.exerciseId === 'ex-squat' || nameLower.includes('squat')) {
            if (s.weightKg > squatPR) squatPR = s.weightKg;
          } else if (ex.exerciseId === 'ex-bench' || nameLower.includes('bench')) {
            if (s.weightKg > benchPR) benchPR = s.weightKg;
          } else if (ex.exerciseId === 'ex-deadlift' || nameLower.includes('deadlift')) {
            if (s.weightKg > deadliftPR) deadliftPR = s.weightKg;
          }
        }
      });
    });
  });

  const sbdTotal = Math.max(user.sbdTotalKg || 0, squatPR + benchPR + deadliftPR);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Official Gym Broadcast Announcement Banner */}
      {announcement && announcement.active && !dismissAnnouncement && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-zinc-900 border border-amber-500/40 rounded-2xl p-4 relative shadow-md">
          <button
            onClick={() => setDismissAnnouncement(true)}
            className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-100 p-1 rounded-lg bg-zinc-900/60"
            title="Tutup Pengumuman"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0 shadow mt-0.5">
              <Megaphone className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                PENGUMUMAN GYM • {announcement.date}
              </span>
              <h3 className="text-xs font-extrabold text-zinc-100">{announcement.title}</h3>
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                {announcement.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800/90 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-13 h-13 rounded-full object-cover border-2 border-amber-500/80 shadow"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-zinc-100 tracking-tight">
                  Halo, {user.name.split(' ')[0]} 👋
                </h1>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Siap tingkatkan progressive overload hari ini?
              </p>
            </div>
          </div>

          <button
            onClick={onStartNewWorkout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-extrabold text-xs shadow-md hover:bg-amber-400 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Mulai Workout Baru</span>
          </button>
        </div>
      </div>

      {/* SBD Personal Record Card */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800/90 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Trophy className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-zinc-100">Total SBD (Power Score)</h2>
              <p className="text-[11px] text-zinc-400">Squat + Bench Press + Deadlift</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('ranking')}
            className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>Leaderboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {sbdTotal > 0 ? (
          <>
            <div className="bg-zinc-950/90 rounded-xl p-3.5 border border-zinc-800/80 mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-zinc-400">Total SBD Saat Ini</p>
                <p className="text-2xl font-black text-amber-400 tracking-tight">{sbdTotal} <span className="text-xs font-bold text-zinc-300">kg</span></p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-extrabold inline-block">
                  SBD Member
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60">
                <p className="text-[11px] font-semibold text-zinc-400">Squat</p>
                <p className="text-base font-extrabold text-zinc-100 mt-0.5">{squatPR} <span className="text-[10px] text-zinc-500">kg</span></p>
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60">
                <p className="text-[11px] font-semibold text-zinc-400">Bench Press</p>
                <p className="text-base font-extrabold text-zinc-100 mt-0.5">{benchPR} <span className="text-[10px] text-zinc-500">kg</span></p>
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60">
                <p className="text-[11px] font-semibold text-zinc-400">Deadlift</p>
                <p className="text-base font-extrabold text-zinc-100 mt-0.5">{deadliftPR} <span className="text-[10px] text-zinc-500">kg</span></p>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-zinc-950/80 rounded-xl p-4 border border-zinc-800/80 text-center space-y-2">
            <p className="text-xs font-medium text-zinc-400">
              Belum ada data Personal Record (PR) Squat, Bench, atau Deadlift.
            </p>
            <button
              onClick={onStartNewWorkout}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold hover:bg-amber-500/20 transition-all inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Input PR Latihan Pertama</span>
            </button>
          </div>
        )}
      </div>

      {/* Body Progress Summary */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800/90 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 border border-zinc-700/80">
              <Scale className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-zinc-100">Body Progress</h2>
              <p className="text-[11px] text-zinc-400">Catatan komposisi tubuh terbaru</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('body')}
            className="flex items-center gap-1 text-xs font-bold text-zinc-300 hover:text-amber-400 transition-colors"
          >
            <span>Detail & Grafik</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {latestBody ? (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 text-center">
              <div className="flex items-center justify-center gap-1 text-zinc-400 text-[11px] font-medium">
                <Scale className="w-3 h-3 text-zinc-300" />
                <span>Berat</span>
              </div>
              <p className="text-base font-black text-zinc-100 mt-1">
                {latestBody.weightKg} <span className="text-xs text-zinc-500 font-medium">kg</span>
              </p>
            </div>

            <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 text-center">
              <div className="flex items-center justify-center gap-1 text-zinc-400 text-[11px] font-medium">
                <Percent className="w-3 h-3 text-zinc-300" />
                <span>Body Fat</span>
              </div>
              <p className="text-base font-black text-zinc-100 mt-1">
                {latestBody.bodyFatPercentage || '-'} <span className="text-xs text-zinc-500 font-medium">%</span>
              </p>
            </div>

            <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 text-center">
              <div className="flex items-center justify-center gap-1 text-zinc-400 text-[11px] font-medium">
                <BicepsFlexed className="w-3 h-3 text-zinc-300" />
                <span>Otot</span>
              </div>
              <p className="text-base font-black text-zinc-100 mt-1">
                {latestBody.muscleMassKg || '-'} <span className="text-xs text-zinc-500 font-medium">kg</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-950/80 rounded-xl p-4 border border-zinc-800/80 text-center space-y-2">
            <p className="text-xs font-medium text-zinc-400">
              Belum ada data body progress. Silakan input data terlebih dahulu.
            </p>
            <button
              onClick={() => onNavigateTab('body')}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold hover:bg-zinc-700 transition-all inline-flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Input Data Body Progress</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
