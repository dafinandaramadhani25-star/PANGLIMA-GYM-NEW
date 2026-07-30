import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  Sparkles, 
  Trophy, 
  Search, 
  ChevronRight, 
  AlertCircle, 
  History, 
  BookOpen, 
  Play, 
  Pause, 
  RotateCcw, 
  Info,
  Flame,
  CheckCircle2,
  X
} from 'lucide-react';
import { 
  Exercise, 
  WorkoutSet, 
  WorkoutExerciseLog, 
  WorkoutSession, 
  UserProfile, 
  MuscleCategory 
} from '../types';
import { calculateEstimated1RM, checkIsPersonalRecord } from '../utils/sbd';

interface WorkoutTrackerProps {
  exercises: Exercise[];
  user: UserProfile;
  workoutHistory: WorkoutSession[];
  onSaveWorkout: (session: WorkoutSession, newPRsCount: number) => void;
  onOpenAIWithContext: (prompt: string) => void;
}

export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({
  exercises,
  user,
  workoutHistory,
  onSaveWorkout,
  onOpenAIWithContext,
}) => {
  const [activeTabMode, setActiveTabMode] = useState<'active' | 'history' | 'library'>('active');

  // Active workout state
  const [workoutTitle, setWorkoutTitle] = useState('Latihan Hari Ini');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [activeExercises, setActiveExercises] = useState<WorkoutExerciseLog[]>([]);
  const [sessionStartTime] = useState<number>(Date.now());
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);

  // Exercise selection modal
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('All');

  // Rest timer state
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState<boolean>(false);

  // Selected history session detail modal
  const [selectedHistorySession, setSelectedHistorySession] = useState<WorkoutSession | null>(null);

  // Cute PR celebration toast state
  interface PRNotification {
    exerciseName: string;
    weightKg: number;
    reps: number;
    message: string;
  }
  const [prNotification, setPrNotification] = useState<PRNotification | null>(null);

  // Auto-dismiss PR toast after 5 seconds
  useEffect(() => {
    if (prNotification) {
      const timer = setTimeout(() => {
        setPrNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [prNotification]);

  // Timer interval effect for elapsed duration
  useEffect(() => {
    const timer = setInterval(() => {
      const mins = Math.max(1, Math.floor((Date.now() - sessionStartTime) / 60000));
      setElapsedMinutes(mins);
    }, 30000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  // Rest timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isRestTimerRunning && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRestTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestTimerRunning, restSecondsLeft]);

  const startRestTimer = (seconds: number) => {
    setRestSecondsLeft(seconds);
    setIsRestTimerRunning(true);
  };

  const handleAddExerciseToWorkout = (ex: Exercise) => {
    const newExLog: WorkoutExerciseLog = {
      id: `active-ex-${Date.now()}`,
      exerciseId: ex.id,
      exerciseName: ex.name,
      category: ex.category,
      sets: [],
    };
    setActiveExercises([...activeExercises, newExLog]);
    setIsAddingExercise(false);
  };

  const handleRemoveExercise = (exLogId: string) => {
    setActiveExercises(activeExercises.filter((e) => e.id !== exLogId));
  };

  const handleAddSet = (exLogId: string) => {
    setActiveExercises(
      activeExercises.map((e) => {
        if (e.id === exLogId) {
          const lastSet = e.sets[e.sets.length - 1];
          const newSetNumber = e.sets.length + 1;
          return {
            ...e,
            sets: [
              ...e.sets,
              {
                id: `set-${Date.now()}`,
                setNumber: newSetNumber,
                reps: lastSet ? lastSet.reps : 10,
                weightKg: lastSet ? lastSet.weightKg : 0,
                completed: false,
              },
            ],
          };
        }
        return e;
      })
    );
  };

  const handleRemoveSet = (exLogId: string, setId: string) => {
    setActiveExercises(
      activeExercises.map((e) => {
        if (e.id === exLogId) {
          const updatedSets = e.sets
            .filter((s) => s.id !== setId)
            .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
          return { ...e, sets: updatedSets };
        }
        return e;
      })
    );
  };

  // Helper function to accurately check if completing a set breaks a real PR
  const checkIfSetIsNewPR = (
    exerciseId: string,
    exerciseName: string,
    currentWeightKg: number,
    currentSetId?: string
  ): boolean => {
    if (!currentWeightKg || currentWeightKg <= 0) return false;

    let maxPreviousWeight = 0;

    // 1. Check user.personalRecords
    if (user.personalRecords) {
      if (user.personalRecords[exerciseId]?.maxWeightKg) {
        maxPreviousWeight = Math.max(maxPreviousWeight, user.personalRecords[exerciseId].maxWeightKg);
      }
      const nameLower = exerciseName.toLowerCase();
      if (exerciseId === 'ex-squat' || nameLower.includes('squat')) {
        if (user.personalRecords['ex-squat']?.maxWeightKg) {
          maxPreviousWeight = Math.max(maxPreviousWeight, user.personalRecords['ex-squat'].maxWeightKg);
        }
      } else if (exerciseId === 'ex-bench' || nameLower.includes('bench')) {
        if (user.personalRecords['ex-bench']?.maxWeightKg) {
          maxPreviousWeight = Math.max(maxPreviousWeight, user.personalRecords['ex-bench'].maxWeightKg);
        }
      } else if (exerciseId === 'ex-deadlift' || nameLower.includes('deadlift')) {
        if (user.personalRecords['ex-deadlift']?.maxWeightKg) {
          maxPreviousWeight = Math.max(maxPreviousWeight, user.personalRecords['ex-deadlift'].maxWeightKg);
        }
      }
    }

    // 2. Check workoutHistory for this user
    if (workoutHistory && workoutHistory.length > 0) {
      const nameLower = exerciseName.toLowerCase();
      workoutHistory.forEach((session) => {
        if (session.userId === user.id) {
          session.exercises.forEach((ex) => {
            const exNameLower = ex.exerciseName.toLowerCase();
            if (ex.exerciseId === exerciseId || exNameLower === nameLower || (nameLower.length > 3 && exNameLower.includes(nameLower))) {
              ex.sets.forEach((s) => {
                if (s.completed && s.weightKg > 0) {
                  maxPreviousWeight = Math.max(maxPreviousWeight, s.weightKg);
                }
              });
            }
          });
        }
      });
    }

    // 3. Check all OTHER completed sets in activeExercises
    const nameLower = exerciseName.toLowerCase();
    activeExercises.forEach((ex) => {
      const exNameLower = ex.exerciseName.toLowerCase();
      if (ex.exerciseId === exerciseId || exNameLower === nameLower || (nameLower.length > 3 && exNameLower.includes(nameLower))) {
        ex.sets.forEach((s) => {
          if ((!currentSetId || s.id !== currentSetId) && s.completed && s.weightKg > 0) {
            maxPreviousWeight = Math.max(maxPreviousWeight, s.weightKg);
          }
        });
      }
    });

    // Only return true if there was a previous weight (>0) and current set strictly exceeds it
    return maxPreviousWeight > 0 && currentWeightKg > maxPreviousWeight;
  };

  const handleUpdateSet = (
    exLogId: string,
    setId: string,
    field: 'weightKg' | 'reps' | 'completed',
    value: any
  ) => {
    setActiveExercises(
      activeExercises.map((e) => {
        if (e.id === exLogId) {
          return {
            ...e,
            sets: e.sets.map((s) => {
              if (s.id === setId) {
                const updated = { ...s, [field]: value };
                // Check PR if completing or changing weight
                if (field === 'completed' && value === true) {
                  // Trigger 90s rest timer on set completion
                  startRestTimer(90);

                  // Check if this completed set breaks a Personal Record
                  if (updated.weightKg > 0 && checkIfSetIsNewPR(e.exerciseId, e.exerciseName, updated.weightKg, s.id)) {
                    const cutePhrases = [
                      "WAWW REKOR BARU DONG! PECAH BANGET! 🔥🏆",
                      "GOKIL PISAN! BEBAN PR BARU TERANGKAT! 💪✨",
                      "MENYALA ABANGKU! OTOT POWER MAXIMUM! 🚀⚡",
                      "ANJAY BEBAN REKOR BARU TERTULIS! MANTAP POL! 🎉🥳",
                      "LUAR BIASA! OTOT BESI TERLATIH SEMPURNA! 💥🦾"
                    ];
                    const randomPhrase = cutePhrases[Math.floor(Math.random() * cutePhrases.length)];
                    setPrNotification({
                      exerciseName: e.exerciseName,
                      weightKg: updated.weightKg,
                      reps: updated.reps,
                      message: randomPhrase,
                    });
                  }
                }
                return updated;
              }
              return s;
            }),
          };
        }
        return e;
      })
    );
  };

  // Calculate Total Volume for active session
  const totalActiveVolume = activeExercises.reduce((acc, ex) => {
    const exVol = ex.sets.reduce((sAcc, s) => {
      return s.completed ? sAcc + (s.weightKg * s.reps) : sAcc;
    }, 0);
    return acc + exVol;
  }, 0);

  // Check how many PRs broken in current session
  let prBrokenCount = 0;
  activeExercises.forEach((ex) => {
    ex.sets.forEach((s) => {
      if (s.completed && checkIfSetIsNewPR(ex.exerciseId, ex.exerciseName, s.weightKg, s.id)) {
        prBrokenCount++;
        s.isPR = true;
      }
    });
  });

  const handleFinishWorkout = () => {
    if (activeExercises.length === 0) return;

    const newSession: WorkoutSession = {
      id: `wo-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      title: workoutTitle || 'Workout Sesi PANGLIMA',
      date: new Date().toISOString().split('T')[0],
      durationMinutes: elapsedMinutes || 45,
      totalVolumeKg: totalActiveVolume,
      notes: workoutNotes,
      prCount: prBrokenCount,
      exercises: activeExercises,
    };

    onSaveWorkout(newSession, prBrokenCount);

    // Reset active form
    setWorkoutTitle('Latihan Hari Ini');
    setWorkoutNotes('');
    setActiveExercises([]);
  };

  const muscleCategories: MuscleCategory[] = [
    'Dada (Chest)',
    'Punggung (Back)',
    'Kaki (Legs)',
    'Bahu (Shoulders)',
    'Lengan (Arms)',
    'Inti (Core)',
  ];

  const filteredExercisesForModal = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.category.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesCategory = selectedMuscleFilter === 'All' || ex.category === selectedMuscleFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300 relative">
      {/* Cute PR Celebration Toast Notification */}
      {prNotification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm animate-in zoom-in-95 slide-in-from-top-4 duration-300">
          <div className="relative p-0.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 shadow-[0_0_25px_rgba(245,158,11,0.5)]">
            <div className="bg-zinc-950/95 backdrop-blur-md rounded-[14px] p-4 text-center relative overflow-hidden">
              {/* Decorative Blur Backdrops */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-orange-500/20 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-xl animate-bounce">🥳</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> REKOR BARU!
                </span>
                <span className="text-xl animate-bounce">🎉</span>
              </div>

              <h3 className="text-sm font-black text-white mt-1 leading-snug">
                {prNotification.message}
              </h3>

              <div className="my-2.5 py-2 px-3 rounded-xl bg-zinc-900/90 border border-amber-500/30 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 truncate max-w-[170px]">
                  {prNotification.exerciseName}
                </span>
                <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  {prNotification.weightKg} kg
                  <span className="text-[10px] text-zinc-400 font-medium">({prNotification.reps}x)</span>
                </span>
              </div>

              <button
                onClick={() => setPrNotification(null)}
                className="w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 text-xs font-black shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Siap Pertahankan!</span> 💪
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
        <button
          onClick={() => setActiveTabMode('active')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTabMode === 'active'
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Sesi Aktif</span>
        </button>

        <button
          onClick={() => setActiveTabMode('history')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTabMode === 'history'
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Riwayat ({workoutHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTabMode('library')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTabMode === 'library'
              ? 'bg-amber-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Exercise</span>
        </button>
      </div>

      {/* MODE 1: ACTIVE WORKOUT TRACKER */}
      {activeTabMode === 'active' && (
        <div className="space-y-4">
          {/* Active Session Header Card */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <input
                type="text"
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                placeholder="Nama Sesi Workout..."
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-base font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 w-full sm:w-auto flex-1"
              />

              <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-zinc-400">
                <div className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{elapsedMinutes} Menit</span>
                </div>
                <div className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                  <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-amber-400">{totalActiveVolume} kg</span>
                </div>
              </div>
            </div>

            {/* Rest Timer Dock */}
            {restSecondsLeft > 0 && (
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-xl p-2.5 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-200">Rest Timer (Istirahat Set):</span>
                  <span className="text-sm font-black text-amber-400">
                    {Math.floor(restSecondsLeft / 60)}:{(restSecondsLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRestSecondsLeft((prev) => prev + 30)}
                    className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-amber-300 hover:bg-zinc-700"
                  >
                    +30s
                  </button>
                  <button
                    onClick={() => {
                      setRestSecondsLeft(0);
                      setIsRestTimerRunning(false);
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-400 hover:bg-zinc-700"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Exercise Log Cards */}
          {activeExercises.length === 0 ? (
            <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-8 text-center space-y-3">
              <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-300">Sesi Workout Masih Kosong</h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Pilih gerakan exercise dari perpustakaan untuk mulai mencatat set, repetisi, dan beban.
              </p>
              <button
                onClick={() => setIsAddingExercise(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold shadow hover:bg-amber-400 transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Pilih Exercise</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeExercises.map((exLog, exIdx) => {
                const exMaster = exercises.find((e) => e.id === exLog.exerciseId);
                const prevPR = user.personalRecords[exLog.exerciseId]?.maxWeightKg || 0;

                return (
                  <div
                    key={exLog.id}
                    className="bg-zinc-900 rounded-2xl border border-zinc-800/90 p-4 space-y-3 shadow-md"
                  >
                    {/* Exercise Card Title Bar */}
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-100">{exLog.exerciseName}</h3>
                          {exMaster?.isSBD && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                              SBD
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {exLog.category} • Record Sebelumnya: <span className="text-zinc-200 font-semibold">{prevPR ? `${prevPR} kg` : 'Belum ada'}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveExercise(exLog.id)}
                        className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg transition-colors"
                        title="Hapus Exercise"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Set Input Table */}
                    {exLog.sets.length === 0 ? (
                      <div className="py-3.5 text-center rounded-xl bg-zinc-950/40 border border-dashed border-zinc-800/80 text-zinc-500 text-xs font-medium">
                        Belum ada set yang ditambahkan.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-zinc-500 uppercase px-1">
                          <span className="col-span-2 text-center">Set</span>
                          <span className="col-span-4 text-center">Beban (kg)</span>
                          <span className="col-span-3 text-center">Reps</span>
                          <span className="col-span-3 text-center">Done</span>
                        </div>

                        {exLog.sets.map((setItem) => {
                          const isSetPR = setItem.completed && checkIfSetIsNewPR(exLog.exerciseId, exLog.exerciseName, setItem.weightKg, setItem.id);

                          return (
                            <div
                              key={setItem.id}
                              className={`grid grid-cols-12 gap-2 items-center p-1.5 rounded-xl transition-colors ${
                                setItem.completed
                                  ? 'bg-zinc-950/80 border border-emerald-500/30'
                                  : 'bg-zinc-950/40 border border-zinc-800/60'
                              }`}
                            >
                              {/* Set Number & PR Indicator */}
                              <div className="col-span-2 flex items-center justify-center gap-1">
                                <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-bold text-xs flex items-center justify-center">
                                  {setItem.setNumber}
                                </span>
                                {isSetPR && (
                                  <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce" title="Record Baru! (PR)" />
                                )}
                              </div>

                              {/* Weight Input */}
                              <div className="col-span-4">
                                <input
                                  type="number"
                                  value={setItem.weightKg || ''}
                                  onChange={(e) =>
                                    handleUpdateSet(
                                      exLog.id,
                                      setItem.id,
                                      'weightKg',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  placeholder="0"
                                  className="w-full bg-zinc-900 border border-zinc-800 text-center text-zinc-100 font-bold text-sm rounded-lg py-1.5 focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              {/* Reps Input */}
                              <div className="col-span-3">
                                <input
                                  type="number"
                                  value={setItem.reps || ''}
                                  onChange={(e) =>
                                    handleUpdateSet(
                                      exLog.id,
                                      setItem.id,
                                      'reps',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  placeholder="0"
                                  className="w-full bg-zinc-900 border border-zinc-800 text-center text-zinc-100 font-bold text-sm rounded-lg py-1.5 focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              {/* Complete Checkbox & Delete Set */}
                              <div className="col-span-3 flex items-center justify-center gap-1">
                                <button
                                  onClick={() =>
                                    handleUpdateSet(exLog.id, setItem.id, 'completed', !setItem.completed)
                                  }
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                    setItem.completed
                                      ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                                      : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                                  }`}
                                  title="Tandai Selesai"
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </button>
                                <button
                                  onClick={() => handleRemoveSet(exLog.id, setItem.id)}
                                  className="w-7 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                                  title="Hapus Set"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Set Controls */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleAddSet(exLog.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Set</span>
                      </button>

                      <span className="text-[11px] text-zinc-500">
                        Estimated 1RM:{' '}
                        <strong className="text-zinc-300">
                          {(() => {
                            const maxCompletedSet = exLog.sets
                              .filter((s) => s.completed && s.weightKg > 0)
                              .sort((a, b) => b.weightKg - a.weightKg)[0] || exLog.sets[0];
                            return maxCompletedSet
                              ? calculateEstimated1RM(maxCompletedSet.weightKg || 0, maxCompletedSet.reps || 0)
                              : 0;
                          })()}{' '}
                          kg
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Add Exercise & Complete Session Actions */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setIsAddingExercise(true)}
                  className="w-full py-3 rounded-xl border border-dashed border-zinc-700 hover:border-amber-500/60 bg-zinc-900/50 hover:bg-zinc-900 text-amber-400 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Exercise Lain</span>
                </button>

                {/* Session Notes Input */}
                <textarea
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  placeholder="Catatan latihan hari ini (misal: RPE, rasional beban, pompa otot, evaluasi form)..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 h-20 resize-none"
                />

                <button
                  onClick={handleFinishWorkout}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-zinc-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>Selesaikan & Simpan Workout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: WORKOUT HISTORY */}
      {activeTabMode === 'history' && (
        <div className="space-y-3">
          {workoutHistory.length === 0 ? (
            <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800 p-8 text-center text-xs text-zinc-500">
              Belum ada riwayat workout yang tercatat.
            </div>
          ) : (
            workoutHistory.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedHistorySession(session)}
                className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3 hover:border-amber-500/40 cursor-pointer transition-all shadow-md group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                        {session.title}
                      </h3>
                      {session.prCount && session.prCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          <span>{session.prCount} PR Baru!</span>
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {new Date(session.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })} • {session.durationMinutes} Menit
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-zinc-950 text-amber-400 border border-zinc-800 text-xs font-extrabold">
                    {session.totalVolumeKg.toLocaleString('id-ID')} kg
                  </span>
                </div>

                {/* Exercises summary list */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                  {session.exercises.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium">{ex.exerciseName}</span>
                      <span className="text-zinc-500 text-[11px]">
                        {ex.sets.length} Set ({ex.sets.map((s) => `${s.weightKg}kg`).join(', ')})
                      </span>
                    </div>
                  ))}
                </div>

                {session.notes && (
                  <p className="text-[11px] text-zinc-400 italic bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60">
                    "{session.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* MODE 3: EXERCISE LIBRARY */}
      {activeTabMode === 'library' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                placeholder="Cari nama gerakan (Bench, Squat, Lat Pulldown)..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Muscle Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedMuscleFilter('All')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border transition-all ${
                  selectedMuscleFilter === 'All'
                    ? 'bg-amber-500 text-zinc-950 border-amber-400'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                Semua Otot
              </button>
              {muscleCategories.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMuscleFilter(m)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border transition-all ${
                    selectedMuscleFilter === m
                      ? 'bg-amber-500 text-zinc-950 border-amber-400'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {m.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {filteredExercisesForModal.map((ex) => (
              <div
                key={ex.id}
                className="bg-zinc-900 rounded-xl border border-zinc-800 p-3.5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-zinc-100">{ex.name}</h4>
                    {ex.isSBD && (
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded">
                        SBD
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {ex.category} • <span className="text-zinc-300">{ex.equipment}</span>
                  </p>
                  {ex.description && (
                    <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">{ex.description}</p>
                  )}
                </div>

                <button
                  onClick={() => {
                    handleAddExerciseToWorkout(ex);
                    setActiveTabMode('active');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 border border-amber-500/30 text-xs font-bold transition-all shrink-0"
                >
                  + Tambah
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXERCISE SELECTION MODAL */}
      {isAddingExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Pilih Gerakan Exercise</h3>
                <p className="text-[11px] text-zinc-400">Tambahkan gerakan ke sesi latihanmu</p>
              </div>
              <button
                onClick={() => setIsAddingExercise(false)}
                className="text-zinc-400 hover:text-zinc-100 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <input
                type="text"
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                placeholder="Cari exercise..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />

              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedMuscleFilter('All')}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border ${
                    selectedMuscleFilter === 'All'
                      ? 'bg-amber-500 text-zinc-950 border-amber-400'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  Semua
                </button>
                {muscleCategories.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMuscleFilter(m)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border ${
                      selectedMuscleFilter === m
                        ? 'bg-amber-500 text-zinc-950 border-amber-400'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {m.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 pt-0 space-y-2 overflow-y-auto flex-1">
              {filteredExercisesForModal.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToWorkout(ex)}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-amber-500/60 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-100">{ex.name}</span>
                      {ex.isSBD && (
                        <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded">
                          SBD
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {ex.category} • {ex.equipment}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HISTORICAL DETAIL MODAL */}
      {selectedHistorySession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-100">{selectedHistorySession.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {selectedHistorySession.date} • {selectedHistorySession.durationMinutes} Menit
                </p>
              </div>
              <button
                onClick={() => setSelectedHistorySession(null)}
                className="text-zinc-400 hover:text-zinc-100 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Total Volume Latihan:</span>
              <span className="text-sm font-extrabold text-amber-400">
                {selectedHistorySession.totalVolumeKg.toLocaleString('id-ID')} kg
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-300">Rincian Gerakan & Set:</h4>
              {selectedHistorySession.exercises.map((ex) => (
                <div key={ex.id} className="bg-zinc-950/80 rounded-xl p-3 border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200">{ex.exerciseName}</span>
                    <span className="text-[10px] text-zinc-500">{ex.category}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    {ex.sets.map((s) => (
                      <div key={s.id} className="bg-zinc-900 p-1.5 rounded border border-zinc-800 text-[11px]">
                        <span className="text-zinc-400">Set {s.setNumber}:</span>{' '}
                        <strong className="text-amber-400">{s.weightKg}kg</strong> x {s.reps}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const promptMsg = `Evaluasi workout ${selectedHistorySession.title} tanggal ${selectedHistorySession.date} dengan total volume ${selectedHistorySession.totalVolumeKg}kg. Berikan analisis progressive overload & saran pemulihan.`;
                setSelectedHistorySession(null);
                onOpenAIWithContext(promptMsg);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Analisis Workout Ini Dengan PANGLIMA AI</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
