import React, { useState } from 'react';
import { 
  Users, 
  Dumbbell, 
  Activity, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  BarChart3, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { 
  AdminStats, 
  Exercise, 
  UserProfile, 
  MuscleCategory, 
  EquipmentType, 
  WorkoutSession 
} from '../types';

interface AdminDashboardProps {
  stats: AdminStats;
  exercises: Exercise[];
  users: UserProfile[];
  workouts: WorkoutSession[];
  onAddExercise: (ex: Exercise) => void;
  onDeleteExercise: (exId: string) => void;
  onDeleteWorkoutLog: (workoutId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  exercises,
  users,
  workouts,
  onAddExercise,
  onDeleteExercise,
  onDeleteWorkoutLog,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'exercises' | 'users' | 'moderation'>('overview');

  // Exercise Form State
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState<MuscleCategory>('Dada (Chest)');
  const [newExEquipment, setNewExEquipment] = useState<EquipmentType>('Barbell');
  const [newExDescription, setNewExDescription] = useState('');
  const [newExIsSBD, setNewExIsSBD] = useState(false);

  // Search filter states
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName) return;

    const newEx: Exercise = {
      id: `ex-custom-${Date.now()}`,
      name: newExName,
      category: newExCategory,
      equipment: newExEquipment,
      description: newExDescription,
      isSBD: newExIsSBD,
      sbdType: newExIsSBD ? 'squat' : undefined,
    };

    onAddExercise(newEx);

    setNewExName('');
    setNewExDescription('');
    setIsExerciseModalOpen(false);
  };

  const muscleCategories: MuscleCategory[] = [
    'Dada (Chest)',
    'Punggung (Back)',
    'Kaki (Legs)',
    'Bahu (Shoulders)',
    'Lengan (Arms)',
    'Inti (Core)',
  ];

  const equipmentTypes: EquipmentType[] = [
    'Barbell',
    'Dumbbell',
    'Machine',
    'Cable',
    'Bodyweight',
    'Lainnya',
  ];

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Admin Title Header */}
      <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-zinc-950 rounded-2xl border border-red-500/30 p-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 border border-red-500/30 shadow-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
              <span>Panel Kontrol Administrator PANGLIMA</span>
            </h1>
            <p className="text-xs text-zinc-400">Pengelolaan Master Data, User, Exercise & Moderation System</p>
          </div>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeAdminTab === 'overview'
              ? 'bg-red-500 text-zinc-950 shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Overview Statistik
        </button>

        <button
          onClick={() => setActiveAdminTab('exercises')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeAdminTab === 'exercises'
              ? 'bg-red-500 text-zinc-950 shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Kelola Exercise ({exercises.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeAdminTab === 'users'
              ? 'bg-red-500 text-zinc-950 shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Kelola User ({stats.totalUsers})
        </button>

        <button
          onClick={() => setActiveAdminTab('moderation')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeAdminTab === 'moderation'
              ? 'bg-red-500 text-zinc-950 shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Moderasi Data ({workouts.length})
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-center shadow-md">
              <Users className="w-5 h-5 text-red-400 mx-auto" />
              <p className="text-xl font-black text-zinc-100 mt-2">{stats.totalUsers}</p>
              <p className="text-[11px] text-zinc-400">Total Pengguna Terdaftar</p>
            </div>

            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-center shadow-md">
              <Dumbbell className="w-5 h-5 text-amber-400 mx-auto" />
              <p className="text-xl font-black text-zinc-100 mt-2">{stats.totalWorkouts}</p>
              <p className="text-[11px] text-zinc-400">Total Sesi Workout Logged</p>
            </div>

            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-center shadow-md">
              <Layers className="w-5 h-5 text-emerald-400 mx-auto" />
              <p className="text-xl font-black text-zinc-100 mt-2">{exercises.length}</p>
              <p className="text-[11px] text-zinc-400">Master Exercise Library</p>
            </div>

            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-center shadow-md">
              <Activity className="w-5 h-5 text-cyan-400 mx-auto" />
              <p className="text-xl font-black text-zinc-100 mt-2">{stats.activeUsersThisWeek}</p>
              <p className="text-[11px] text-zinc-400">Pengguna Aktif Minggu Ini</p>
            </div>

            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-center shadow-md">
              <BarChart3 className="w-5 h-5 text-orange-400 mx-auto" />
              <p className="text-xl font-black text-zinc-100 mt-2">
                {(stats.totalVolumeLoggedKg / 1000).toFixed(0)}k <span className="text-xs">kg</span>
              </p>
              <p className="text-[11px] text-zinc-400">Total Volume Latihan</p>
            </div>

            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 text-center shadow-md">
              <Sparkles className="w-5 h-5 text-indigo-400 mx-auto" />
              <p className="text-xl font-black text-zinc-100 mt-2">{stats.aiQueriesAnswered}</p>
              <p className="text-[11px] text-zinc-400">Query AI PANGLIMA Dijawab</p>
            </div>
          </div>
        </div>
      )}

      {/* EXERCISES MANAGEMENT TAB */}
      {activeAdminTab === 'exercises' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 mr-2">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari master exercise..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              onClick={() => setIsExerciseModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-red-500 text-zinc-950 font-bold text-xs shadow hover:bg-red-400 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Exercise</span>
            </button>
          </div>

          <div className="space-y-2">
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                className="bg-zinc-900 rounded-xl border border-zinc-800 p-3.5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-zinc-100">{ex.name}</h4>
                    {ex.isSBD && (
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded">
                        SBD
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Grup Otot: <strong className="text-zinc-200">{ex.category}</strong> • Peralatan:{' '}
                    <strong className="text-zinc-200">{ex.equipment}</strong>
                  </p>
                </div>

                <button
                  onClick={() => onDeleteExercise(ex.id)}
                  className="text-zinc-500 hover:text-red-400 p-2 rounded-lg transition-colors"
                  title="Hapus Master Exercise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS MANAGEMENT TAB */}
      {activeAdminTab === 'users' && (
        <div className="space-y-3">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Daftar Pengguna Sistem PANGLIMA
            </h3>

            <div className="space-y-2">
              {users.map((usr) => (
                <div
                  key={usr.id}
                  className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={usr.avatarUrl}
                      alt={usr.name}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-100">{usr.name}</h4>
                      <p className="text-[10px] text-zinc-400">{usr.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold">
                      {usr.sbdTotalKg}kg SBD
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {usr.role.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODERATION TAB */}
      {activeAdminTab === 'moderation' && (
        <div className="space-y-3">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Moderasi Log Workout System</span>
            </h3>

            <div className="space-y-2">
              {workouts.map((session) => (
                <div
                  key={session.id}
                  className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">{session.title}</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      User: {session.userName} • Tanggal: {session.date} • Volume: {session.totalVolumeKg} kg
                    </p>
                  </div>

                  <button
                    onClick={() => onDeleteWorkoutLog(session.id)}
                    className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-zinc-950 border border-red-500/30 text-xs font-bold transition-all"
                  >
                    Hapus Log
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD EXERCISE MODAL */}
      {isExerciseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateExerciseSubmit}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100">Tambah Master Exercise Baru</h3>
              <button
                type="button"
                onClick={() => setIsExerciseModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Nama Gerakan *</label>
                <input
                  type="text"
                  required
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  placeholder="Misal: Incline Smith Machine Press"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Grup Otot Utama</label>
                <select
                  value={newExCategory}
                  onChange={(e) => setNewExCategory(e.target.value as MuscleCategory)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-100 focus:outline-none focus:border-red-500"
                >
                  {muscleCategories.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Peralatan</label>
                <select
                  value={newExEquipment}
                  onChange={(e) => setNewExEquipment(e.target.value as EquipmentType)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-100 focus:outline-none focus:border-red-500"
                >
                  {equipmentTypes.map((eq) => (
                    <option key={eq} value={eq}>{eq}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sbd-chk"
                  checked={newExIsSBD}
                  onChange={(e) => setNewExIsSBD(e.target.checked)}
                  className="w-4 h-4 rounded accent-red-500"
                />
                <label htmlFor="sbd-chk" className="text-xs font-semibold text-zinc-300">
                  Kategori Utama SBD (Squat / Bench / Deadlift)
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Deskripsi & Panduan Form</label>
                <textarea
                  value={newExDescription}
                  onChange={(e) => setNewExDescription(e.target.value)}
                  placeholder="Petunjuk eksekusi gerakan secara aman..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-red-500 h-20 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-500 text-zinc-950 font-extrabold text-xs shadow-lg hover:bg-red-400 transition-colors"
            >
              Simpan Master Exercise
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
