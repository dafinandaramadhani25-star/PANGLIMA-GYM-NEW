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
  Megaphone,
  UserPlus,
  ShieldCheck,
  X,
  Filter,
  Check,
  Info
} from 'lucide-react';
import { 
  AdminStats, 
  Exercise, 
  UserProfile, 
  MuscleCategory, 
  EquipmentType, 
  WorkoutSession 
} from '../types';
import { 
  GymAnnouncement, 
  getGymAnnouncement, 
  saveGymAnnouncement 
} from '../utils/storage';

interface AdminDashboardProps {
  stats: AdminStats;
  exercises: Exercise[];
  users: UserProfile[];
  workouts: WorkoutSession[];
  activeAdminTab?: 'overview' | 'exercises' | 'users' | 'moderation';
  onAddExercise: (ex: Exercise) => void;
  onEditExercise: (ex: Exercise) => void;
  onDeleteExercise: (exId: string) => void;
  onDeleteWorkoutLog: (workoutId: string) => void;
  onToggleUserRole: (userId: string) => void;
  onAddUser: (newUser: UserProfile) => void;
  onDeleteUser?: (userId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  exercises,
  users,
  workouts,
  activeAdminTab: externalAdminTab,
  onAddExercise,
  onEditExercise,
  onDeleteExercise,
  onDeleteWorkoutLog,
  onToggleUserRole,
  onAddUser,
  onDeleteUser,
}) => {
  const [internalAdminTab, setInternalAdminTab] = useState<'overview' | 'exercises' | 'users' | 'moderation'>('overview');
  
  // Tab sync: allow both bottom nav external control or top pill tab control
  const activeTab = externalAdminTab || internalAdminTab;

  // Gym Announcement State
  const [announcement, setAnnouncement] = useState<GymAnnouncement>(getGymAnnouncement);
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [annTitleInput, setAnnTitleInput] = useState(announcement.title);
  const [annMsgInput, setAnnMsgInput] = useState(announcement.message);
  const [annCategoryInput, setAnnCategoryInput] = useState<'info' | 'warning' | 'event'>(announcement.category);
  const [annActiveInput, setAnnActiveInput] = useState(announcement.active);

  // Exercise Modal States
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingEx, setEditingEx] = useState<Exercise | null>(null);
  const [exNameInput, setExNameInput] = useState('');
  const [exCategoryInput, setExCategoryInput] = useState<MuscleCategory>('Dada (Chest)');
  const [exEquipmentInput, setExEquipmentInput] = useState<EquipmentType>('Barbell');
  const [exDescInput, setExDescInput] = useState('');
  const [exIsSBDInput, setExIsSBDInput] = useState(false);

  // User Add Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userNameInput, setUserNameInput] = useState('');
  const [userEmailInput, setUserEmailInput] = useState('');
  const [userRoleInput, setUserRoleInput] = useState<'user' | 'admin'>('user');

  // Search & Filters
  const [exSearchQuery, setExSearchQuery] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [workoutSearchQuery, setWorkoutSearchQuery] = useState('');

  // Confirmation Delete States
  const [deletingExId, setDeletingExId] = useState<string | null>(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Categories & Equipment lists
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

  // Open Add Exercise Modal
  const handleOpenAddExercise = () => {
    setEditingEx(null);
    setExNameInput('');
    setExCategoryInput('Dada (Chest)');
    setExEquipmentInput('Barbell');
    setExDescInput('');
    setExIsSBDInput(false);
    setIsExerciseModalOpen(true);
  };

  // Open Edit Exercise Modal
  const handleOpenEditExercise = (ex: Exercise) => {
    setEditingEx(ex);
    setExNameInput(ex.name);
    setExCategoryInput(ex.category);
    setExEquipmentInput(ex.equipment);
    setExDescInput(ex.description || '');
    setExIsSBDInput(!!ex.isSBD);
    setIsExerciseModalOpen(true);
  };

  // Submit Exercise Form (Add/Edit)
  const handleSaveExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exNameInput.trim()) return;

    if (editingEx) {
      const updatedEx: Exercise = {
        ...editingEx,
        name: exNameInput.trim(),
        category: exCategoryInput,
        equipment: exEquipmentInput,
        description: exDescInput.trim(),
        isSBD: exIsSBDInput,
        sbdType: exIsSBDInput ? (exNameInput.toLowerCase().includes('bench') ? 'bench' : exNameInput.toLowerCase().includes('deadlift') ? 'deadlift' : 'squat') : undefined,
      };
      onEditExercise(updatedEx);
    } else {
      const newEx: Exercise = {
        id: `ex-custom-${Date.now()}`,
        name: exNameInput.trim(),
        category: exCategoryInput,
        equipment: exEquipmentInput,
        description: exDescInput.trim(),
        isSBD: exIsSBDInput,
        sbdType: exIsSBDInput ? (exNameInput.toLowerCase().includes('bench') ? 'bench' : exNameInput.toLowerCase().includes('deadlift') ? 'deadlift' : 'squat') : undefined,
      };
      onAddExercise(newEx);
    }

    setIsExerciseModalOpen(false);
  };

  // Save Announcement Handler
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: GymAnnouncement = {
      id: announcement.id || `anc-${Date.now()}`,
      title: annTitleInput.trim() || 'Pengumuman Gym',
      message: annMsgInput.trim(),
      date: new Date().toISOString().split('T')[0],
      active: annActiveInput,
      category: annCategoryInput,
    };
    setAnnouncement(updated);
    saveGymAnnouncement(updated);
    setIsEditingAnnouncement(false);
  };

  // Add User Form Submit
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNameInput.trim() || !userEmailInput.trim()) return;

    const newUser: UserProfile = {
      id: `usr-reg-${Date.now()}`,
      name: userNameInput.trim(),
      email: userEmailInput.trim().toLowerCase(),
      role: userRoleInput,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      joinedDate: new Date().toISOString().split('T')[0],
      trainingStreakDays: 1,
      totalWorkoutsThisMonth: 0,
      totalVolumeThisMonthKg: 0,
      sbdTotalKg: 0,
      personalRecords: {},
      bodyProgressHistory: [],
    };

    onAddUser(newUser);
    setUserNameInput('');
    setUserEmailInput('');
    setIsUserModalOpen(false);
  };

  // Filters
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(exSearchQuery.toLowerCase()) ||
      ex.category.toLowerCase().includes(exSearchQuery.toLowerCase());
    const matchesCategory = selectedMuscleFilter === 'all' || ex.category === selectedMuscleFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredWorkouts = workouts.filter((w) =>
    w.title.toLowerCase().includes(workoutSearchQuery.toLowerCase()) ||
    w.userName.toLowerCase().includes(workoutSearchQuery.toLowerCase())
  );

  // Category counts
  const categoryCounts = muscleCategories.reduce((acc, cat) => {
    acc[cat] = exercises.filter((e) => e.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      
      {/* Admin Title Header */}
      <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-zinc-950 rounded-2xl border border-red-500/30 p-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 border border-red-500/30 shadow-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-zinc-100 flex items-center gap-2">
              <span>Panel Kontrol Admin PANGLIMA</span>
            </h1>
            <p className="text-[11px] text-zinc-400">Master Data, Member Directory & Log Moderation</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider hidden sm:inline-block">
          ROLE: ADMINISTRATOR
        </span>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          
          {/* Main KPI Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* KPI 1: Registered Users */}
            <div 
              onClick={() => setInternalAdminTab('users')}
              className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:border-red-500/50 transition-all cursor-pointer space-y-1 shadow-md group"
            >
              <div className="flex items-center justify-between">
                <Users className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                  Member System
                </span>
              </div>
              <p className="text-2xl font-black text-zinc-100 pt-1">{users.length}</p>
              <p className="text-[11px] font-semibold text-zinc-400">Total Pengguna Terdaftar</p>
            </div>

            {/* KPI 2: Exercise Types */}
            <div 
              onClick={() => setInternalAdminTab('exercises')}
              className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:border-amber-500/50 transition-all cursor-pointer space-y-1 shadow-md group"
            >
              <div className="flex items-center justify-between">
                <Layers className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Master Library
                </span>
              </div>
              <p className="text-2xl font-black text-zinc-100 pt-1">{exercises.length}</p>
              <p className="text-[11px] font-semibold text-zinc-400">Total Jenis Exercise</p>
            </div>

            {/* KPI 3: Total Workout Sessions */}
            <div 
              onClick={() => setInternalAdminTab('moderation')}
              className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:border-emerald-500/50 transition-all cursor-pointer space-y-1 shadow-md group"
            >
              <div className="flex items-center justify-between">
                <Dumbbell className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Workout Logs
                </span>
              </div>
              <p className="text-2xl font-black text-zinc-100 pt-1">{stats.totalWorkouts || workouts.length}</p>
              <p className="text-[11px] font-semibold text-zinc-400">Total Sesi Workout</p>
            </div>

            {/* KPI 4: Active Users */}
            <div 
              onClick={() => setInternalAdminTab('users')}
              className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:border-cyan-500/50 transition-all cursor-pointer space-y-1 shadow-md group"
            >
              <div className="flex items-center justify-between">
                <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Aktif
                </span>
              </div>
              <p className="text-2xl font-black text-zinc-100 pt-1">
                {stats.activeUsersThisWeek ?? users.length}{' '}
                <span className="text-xs font-bold text-zinc-400">User</span>
              </p>
              <p className="text-[11px] font-semibold text-zinc-400">Pengguna Aktif</p>
            </div>

          </div>

          {/* Quick Admin Actions */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3">
            <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Aksi Cepat Admin</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleOpenAddExercise}
                className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left transition-all flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 group-hover:scale-105">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-200">Tambah Exercise</p>
                  <p className="text-[10px] text-zinc-500">Buat gerakan baru</p>
                </div>
              </button>

              <button
                onClick={() => setIsUserModalOpen(true)}
                className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left transition-all flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-200">Tambah Member</p>
                  <p className="text-[10px] text-zinc-500">Registrasi akun baru</p>
                </div>
              </button>
            </div>
          </div>



        </div>
      )}

      {/* EXERCISES MANAGEMENT TAB */}
      {activeTab === 'exercises' && (
        <div className="space-y-4">
          
          {/* Top Bar: Search & Add */}
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                value={exSearchQuery}
                onChange={(e) => setExSearchQuery(e.target.value)}
                placeholder="Cari jenis exercise..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 font-medium focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              onClick={handleOpenAddExercise}
              className="px-3.5 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-zinc-950 font-extrabold text-xs shadow-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Exercise</span>
            </button>
          </div>

          {/* Muscle Category Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedMuscleFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedMuscleFilter === 'all'
                  ? 'bg-zinc-100 text-zinc-950 shadow'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              Semua ({exercises.length})
            </button>

            {muscleCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedMuscleFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedMuscleFilter === cat
                    ? 'bg-amber-500 text-zinc-950 font-extrabold shadow'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {cat.split(' ')[0]} ({categoryCounts[cat] || 0})
              </button>
            ))}
          </div>

          {/* Exercise List Cards */}
          <div className="space-y-2">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-zinc-500 text-xs font-semibold">
                Tidak ada jenis exercise yang cocok.
              </div>
            ) : (
              filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-zinc-900 rounded-xl border border-zinc-800 p-3.5 flex items-center justify-between hover:border-zinc-700 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1 mr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-zinc-100">{ex.name}</h4>
                      {ex.isSBD && (
                        <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-extrabold rounded uppercase">
                          SBD {ex.sbdType}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Grup Otot: <strong className="text-zinc-200">{ex.category}</strong> • Peralatan:{' '}
                      <strong className="text-zinc-200">{ex.equipment}</strong>
                    </p>
                    {ex.description && (
                      <p className="text-[10px] text-zinc-500 truncate max-w-sm">{ex.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditExercise(ex)}
                      className="p-2 rounded-lg bg-zinc-950 hover:bg-amber-500/10 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-colors cursor-pointer"
                      title="Edit Exercise"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingExId(ex.id)}
                      className="p-2 rounded-lg bg-zinc-950 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer"
                      title="Hapus Exercise"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Cari member (nama atau email)..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 font-medium focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              onClick={() => setIsUserModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs shadow-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Member</span>
            </button>
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-wider">
                Daftar Pengguna Terdaftar ({filteredUsers.length} Akun)
              </h3>
            </div>

            <div className="space-y-2">
              {filteredUsers.map((usr) => (
                <div
                  key={usr.id}
                  className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={usr.avatarUrl}
                      alt={usr.name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-500/50 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-zinc-100 truncate">{usr.name}</h4>
                      <p className="text-[10px] text-zinc-400 truncate">{usr.email}</p>
                      <p className="text-[9px] text-zinc-500 font-medium mt-0.5">
                        Bergabung: {usr.joinedDate || '2026-01-15'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-extrabold text-amber-400">{usr.sbdTotalKg || 0} kg</p>
                      <p className="text-[9px] text-zinc-500">SBD Total</p>
                    </div>

                    <button
                      onClick={() => onToggleUserRole(usr.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                        usr.role === 'admin'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500 hover:text-zinc-950'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                      }`}
                      title="Klik untuk ubah Role User/Admin"
                    >
                      {usr.role.toUpperCase()}
                    </button>

                    <button
                      onClick={() => setDeletingUserId(usr.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-zinc-950 border border-red-500/30 transition-all cursor-pointer"
                      title="Hapus Akun Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODERATION TAB */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              value={workoutSearchQuery}
              onChange={(e) => setWorkoutSearchQuery(e.target.value)}
              placeholder="Cari log workout berdasarkan judul atau nama user..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 font-medium focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3">
            <h3 className="text-xs font-extrabold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Moderasi Log Workout Member ({filteredWorkouts.length} Sesi)</span>
            </h3>

            <div className="space-y-2">
              {filteredWorkouts.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  Tidak ada log workout ditemukan.
                </div>
              ) : (
                filteredWorkouts.map((session) => (
                  <div
                    key={session.id}
                    className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-bold text-zinc-100 truncate">{session.title}</h4>
                      <p className="text-[11px] text-zinc-400">
                        Member: <strong className="text-amber-400">{session.userName}</strong> • Tanggal: {session.date}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Total Volume: <strong className="text-zinc-300">{session.totalVolumeKg} kg</strong> • Durasi: {session.durationMinutes} mnt
                      </p>
                    </div>

                    <button
                      onClick={() => setDeletingWorkoutId(session.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-zinc-950 border border-red-500/30 text-xs font-extrabold transition-all shrink-0 cursor-pointer"
                    >
                      Hapus Log
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* EXERCISE ADD/EDIT MODAL */}
      {isExerciseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveExerciseSubmit}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-extrabold text-zinc-100">
                {editingEx ? 'Edit Master Exercise' : 'Tambah Master Exercise Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsExerciseModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 font-bold p-1 rounded-lg bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Nama Gerakan *</label>
                <input
                  type="text"
                  required
                  value={exNameInput}
                  onChange={(e) => setExNameInput(e.target.value)}
                  placeholder="Misal: Incline Smith Machine Press"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Grup Otot Utama</label>
                <select
                  value={exCategoryInput}
                  onChange={(e) => setExCategoryInput(e.target.value as MuscleCategory)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-100 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  {muscleCategories.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Peralatan</label>
                <select
                  value={exEquipmentInput}
                  onChange={(e) => setExEquipmentInput(e.target.value as EquipmentType)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-100 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  {equipmentTypes.map((eq) => (
                    <option key={eq} value={eq}>{eq}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sbd-chk-modal"
                  checked={exIsSBDInput}
                  onChange={(e) => setExIsSBDInput(e.target.checked)}
                  className="w-4 h-4 rounded accent-red-500 cursor-pointer"
                />
                <label htmlFor="sbd-chk-modal" className="text-xs font-semibold text-zinc-300 cursor-pointer">
                  Masuk Kategori Utama SBD (Squat / Bench / Deadlift)
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Deskripsi & Catatan Form</label>
                <textarea
                  value={exDescInput}
                  onChange={(e) => setExDescInput(e.target.value)}
                  placeholder="Petunjuk eksekusi gerakan secara tepat..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-red-500 h-20 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-500 text-zinc-950 font-extrabold text-xs shadow-lg hover:bg-red-400 transition-colors cursor-pointer"
            >
              {editingEx ? 'Simpan Perubahan' : 'Simpan Master Exercise'}
            </button>
          </form>
        </div>
      )}

      {/* USER ADD MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddUserSubmit}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-extrabold text-zinc-100">Registrasi Member Baru</h3>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 font-bold p-1 rounded-lg bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Email Member *</label>
                <input
                  type="email"
                  required
                  value={userEmailInput}
                  onChange={(e) => setUserEmailInput(e.target.value)}
                  placeholder="budi@panglima.id"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Role Akun</label>
                <select
                  value={userRoleInput}
                  onChange={(e) => setUserRoleInput(e.target.value as 'user' | 'admin')}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="user">Member (User)</option>
                  <option value="admin">Administrator (Admin)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 text-zinc-950 font-extrabold text-xs shadow-lg hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              Daftarkan Member Baru
            </button>
          </form>
        </div>
      )}

      {/* CONFIRM DELETE EXERCISE DIALOG */}
      {deletingExId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/50 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100">Hapus Master Exercise?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Tindakan ini akan menghapus jenis exercise ini dari pustaka utama.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingExId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteExercise(deletingExId);
                  setDeletingExId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-zinc-950 text-xs font-extrabold cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE WORKOUT LOG DIALOG */}
      {deletingWorkoutId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/50 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100">Hapus Log Workout Ini?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Tindakan moderasi ini akan menghapus catatan workout member ini dari sistem.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingWorkoutId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteWorkoutLog(deletingWorkoutId);
                  setDeletingWorkoutId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-zinc-950 text-xs font-extrabold cursor-pointer"
              >
                Ya, Moderasi / Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE USER DIALOG */}
      {deletingUserId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/50 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100">Hapus Akun Member Ini?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Tindakan ini akan menghapus akun member beserta data terkait secara permanen dari sistem.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingUserId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (onDeleteUser) onDeleteUser(deletingUserId);
                  setDeletingUserId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-zinc-950 text-xs font-extrabold cursor-pointer"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
