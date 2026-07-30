import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  Exercise, 
  WorkoutSession, 
  LeaderboardEntry, 
  AdminStats, 
  Role, 
  BodyProgressLog 
} from './types';
import { 
  loadStoredUser, 
  saveStoredUser, 
  loadStoredExercises, 
  saveStoredExercises, 
  loadStoredWorkouts, 
  saveStoredWorkouts, 
  loadStoredLeaderboard, 
  saveStoredLeaderboard, 
  loadStoredAdminStats, 
  saveStoredAdminStats 
} from './utils/storage';
import { updateLeaderboardWithPRs } from './utils/sbd';

import { Header } from './components/Header';
import { BottomNavigation, TabType } from './components/BottomNavigation';
import { HomeDashboard } from './components/HomeDashboard';
import { WorkoutTracker } from './components/WorkoutTracker';
import { BodyProgressTracker } from './components/BodyProgressTracker';
import { LeaderboardView } from './components/LeaderboardView';
import { PanglimaAIView } from './components/PanglimaAIView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthView, DEFAULT_MEMBER_USER, DEFAULT_ADMIN_USER } from './components/AuthView';
import { Trophy, Sparkles, X } from 'lucide-react';

import { auth, signOut, onAuthStateChanged } from './lib/firebase';
import { 
  saveUserProfileToFirestore, 
  saveWorkoutSessionToFirestore, 
  saveBodyProgressToFirestore, 
  saveLeaderboardEntryToFirestore, 
  listenToLeaderboard,
  listenToUserWorkouts,
  getUserProfileFromFirestore
} from './services/firebaseService';

const AUTH_STORAGE_KEY = 'panglima_is_authenticated';

export default function App() {
  const [user, setUser] = useState<UserProfile>(loadStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored === 'true';
    } catch {
      return true; // Default to true if already initialized
    }
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const [exercises, setExercises] = useState<Exercise[]>(loadStoredExercises);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(loadStoredWorkouts);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(loadStoredLeaderboard);
  const [adminStats, setAdminStats] = useState<AdminStats>(loadStoredAdminStats);

  const [currentRole, setCurrentRole] = useState<Role>(user.role || 'user');
  const [activeTab, setActiveTab] = useState<TabType | 'body'>('home');

  // PR Celebration Modal
  const [prModalCount, setPrModalCount] = useState<number>(0);
  const [aiPromptForView, setAiPromptForView] = useState<string>('');

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await getUserProfileFromFirestore(fbUser.uid);
        if (profile) {
          setUser(profile);
          setCurrentRole(profile.role);
          setIsAuthenticated(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase Real-time Leaderboard Listener
  useEffect(() => {
    const unsubscribe = listenToLeaderboard((fsLeaderboard) => {
      if (fsLeaderboard && fsLeaderboard.length > 0) {
        setLeaderboard(fsLeaderboard);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase Real-time User Workouts Listener
  useEffect(() => {
    if (user && user.id) {
      const unsubscribe = listenToUserWorkouts(user.id, (fsWorkouts) => {
        if (fsWorkouts && fsWorkouts.length > 0) {
          setWorkouts(fsWorkouts);
        }
      });
      return () => unsubscribe();
    }
  }, [user?.id]);

  // Persist state updates to localStorage & Firestore
  useEffect(() => {
    saveStoredUser(user);
    if (user && user.id) {
      saveUserProfileToFirestore(user);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    saveStoredExercises(exercises);
  }, [exercises]);

  useEffect(() => {
    saveStoredWorkouts(workouts);
  }, [workouts]);

  useEffect(() => {
    saveStoredLeaderboard(leaderboard);
  }, [leaderboard]);

  useEffect(() => {
    saveStoredAdminStats(adminStats);
  }, [adminStats]);

  // Auth Callbacks
  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setCurrentRole(loggedInUser.role);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    saveUserProfileToFirestore(loggedInUser);
  };

  const handleLogout = () => {
    signOut(auth).catch(() => {});
    setIsAuthenticated(false);
    setShowAuthModal(true);
  };

  // Toggle Role between User & Admin
  const handleToggleRole = () => {
    const nextRole: Role = currentRole === 'user' ? 'admin' : 'user';
    setCurrentRole(nextRole);
    setUser((prev) => {
      const updated = { ...prev, role: nextRole };
      saveUserProfileToFirestore(updated);
      return updated;
    });
  };

  // Save Workout Event
  const handleSaveWorkoutSession = (newSession: WorkoutSession, prCount: number) => {
    const updatedWorkouts = [newSession, ...workouts];
    setWorkouts(updatedWorkouts);

    // Save workout session to Firestore
    saveWorkoutSessionToFirestore(newSession);

    // Update PRs in user profile if PR was broken
    let updatedPRs = { ...user.personalRecords };
    let newSquat = updatedPRs['ex-squat']?.maxWeightKg || 0;
    let newBench = updatedPRs['ex-bench']?.maxWeightKg || 0;
    let newDeadlift = updatedPRs['ex-deadlift']?.maxWeightKg || 0;

    newSession.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed) {
          const currentMax = updatedPRs[ex.exerciseId]?.maxWeightKg || 0;
          if (s.weightKg > currentMax) {
            updatedPRs[ex.exerciseId] = {
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              maxWeightKg: s.weightKg,
              maxReps: s.reps,
              estimatedOneRepMaxKg: Math.round(s.weightKg * (1 + s.reps / 30)),
              achievedDate: newSession.date,
            };

            const exNameLower = ex.exerciseName.toLowerCase();
            if (ex.exerciseId === 'ex-squat' || exNameLower.includes('squat')) {
              newSquat = Math.max(newSquat, s.weightKg);
            }
            if (ex.exerciseId === 'ex-bench' || exNameLower.includes('bench')) {
              newBench = Math.max(newBench, s.weightKg);
            }
            if (ex.exerciseId === 'ex-deadlift' || exNameLower.includes('deadlift')) {
              newDeadlift = Math.max(newDeadlift, s.weightKg);
            }
          }
        }
      });
    });

    const newSBDTotal = newSquat + newBench + newDeadlift;

    const updatedUser: UserProfile = {
      ...user,
      totalWorkoutsThisMonth: user.totalWorkoutsThisMonth + 1,
      totalVolumeThisMonthKg: user.totalVolumeThisMonthKg + newSession.totalVolumeKg,
      sbdTotalKg: newSBDTotal,
      personalRecords: updatedPRs,
    };

    setUser(updatedUser);
    saveUserProfileToFirestore(updatedUser);

    // Update Leaderboard & Firestore
    const updatedLeaderboard = updateLeaderboardWithPRs(updatedUser, leaderboard);
    setLeaderboard(updatedLeaderboard);

    const userEntry = updatedLeaderboard.find(e => e.userId === updatedUser.id);
    if (userEntry) {
      saveLeaderboardEntryToFirestore(userEntry);
    }

    // Update Admin Stats
    setAdminStats((prev) => ({
      ...prev,
      totalWorkouts: prev.totalWorkouts + 1,
      totalVolumeLoggedKg: prev.totalVolumeLoggedKg + newSession.totalVolumeKg,
    }));

    if (prCount > 0) {
      setPrModalCount(prCount);
    }
  };

  // Add Body Progress Event
  const handleAddBodyProgressLog = (log: BodyProgressLog) => {
    const updatedHistory = [...(user.bodyProgressHistory || []), log];
    const updatedUser = {
      ...user,
      bodyProgressHistory: updatedHistory,
    };
    setUser(updatedUser);

    // Save to Firestore
    saveBodyProgressToFirestore(log);
    saveUserProfileToFirestore(updatedUser);
  };

  // Admin Actions
  const handleAdminAddExercise = (newEx: Exercise) => {
    const updatedExercises = [...exercises, newEx];
    setExercises(updatedExercises);
    setAdminStats((prev) => ({ ...prev, totalExercises: updatedExercises.length }));
  };

  const handleAdminDeleteExercise = (exId: string) => {
    const updated = exercises.filter((e) => e.id !== exId);
    setExercises(updated);
  };

  const handleAdminDeleteWorkoutLog = (workoutId: string) => {
    const updated = workouts.filter((w) => w.id !== workoutId);
    setWorkouts(updated);
  };

  // Open AI with context
  const handleOpenAIWithPrompt = (promptText: string) => {
    setAiPromptForView(promptText);
    setActiveTab('ai');
  };

  // Update user avatar profile photo
  const handleUpdateAvatar = (newAvatarUrl: string) => {
    setUser((prev) => {
      const updated = { ...prev, avatarUrl: newAvatarUrl };
      saveStoredUser(updated);
      return updated;
    });

    // Sync leaderboard avatar if currentUser is listed
    setLeaderboard((prev) =>
      prev.map((item) =>
        item.userId === user.id ? { ...item, userAvatar: newAvatarUrl } : item
      )
    );
  };

  // Render AuthView if not authenticated or modal active
  if (!isAuthenticated || showAuthModal) {
    return (
      <AuthView
        onLoginSuccess={handleLoginSuccess}
        onCancel={isAuthenticated ? () => setShowAuthModal(false) : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 font-sans antialiased selection:bg-amber-500 selection:text-zinc-950">
      {/* Top Header */}
      <Header
        user={user}
        currentRole={currentRole}
        onToggleRole={handleToggleRole}
        onOpenAI={() => setActiveTab('ai')}
        onLogout={handleLogout}
        onOpenLogin={() => setShowAuthModal(true)}
      />

      {/* Main Content View Container */}
      <main className="max-w-md sm:max-w-xl mx-auto px-4 pt-4">
        {currentRole === 'admin' ? (
          /* Admin Mode Screen */
          <AdminDashboard
            stats={adminStats}
            exercises={exercises}
            users={[user]}
            workouts={workouts}
            onAddExercise={handleAdminAddExercise}
            onDeleteExercise={handleAdminDeleteExercise}
            onDeleteWorkoutLog={handleAdminDeleteWorkoutLog}
          />
        ) : (
          /* User Mode Screens */
          <>
            {activeTab === 'home' && (
              <HomeDashboard
                user={user}
                workouts={workouts}
                onStartNewWorkout={() => setActiveTab('workout')}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'workout' && (
              <WorkoutTracker
                exercises={exercises}
                user={user}
                workoutHistory={workouts.filter((w) => w.userId === user.id)}
                onSaveWorkout={handleSaveWorkoutSession}
                onOpenAIWithContext={handleOpenAIWithPrompt}
              />
            )}

            {activeTab === 'body' && (
              <BodyProgressTracker
                user={user}
                onAddBodyProgress={handleAddBodyProgressLog}
                onOpenAIWithContext={handleOpenAIWithPrompt}
              />
            )}

            {activeTab === 'ranking' && (
              <LeaderboardView
                leaderboard={leaderboard}
                currentUser={user}
                onOpenAIWithContext={handleOpenAIWithPrompt}
              />
            )}

            {activeTab === 'ai' && (
              <PanglimaAIView
                user={user}
                workoutHistory={workouts}
                initialPrompt={aiPromptForView}
                onClearInitialPrompt={() => setAiPromptForView('')}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                currentRole={currentRole}
                onToggleRole={handleToggleRole}
                onNavigateTab={(t) => setActiveTab(t)}
                onLogout={handleLogout}
                onUpdateAvatar={handleUpdateAvatar}
              />
            )}
          </>
        )}
      </main>

      {/* PR Celebration Modal */}
      {prModalCount > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-amber-500/80 rounded-3xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setPrModalCount(0)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-100 p-1 rounded-full bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-zinc-950 mx-auto flex items-center justify-center shadow-lg border border-amber-300">
              <Trophy className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-extrabold uppercase tracking-wider">
                PERSONAL RECORD BARU!
              </span>
              <h2 className="text-lg font-extrabold text-zinc-100 pt-1">Selamat, {user.name.split(' ')[0]}! 🎉</h2>
              <p className="text-xs text-zinc-300">
                Kamu berhasil melampaui rekor beban lama sebanyak <strong className="text-amber-400 font-extrabold">{prModalCount} gerakan</strong> hari ini! Total SBD dan peringkat Papan Skor kamu telah diperbarui.
              </p>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs font-bold text-amber-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Total SBD Baru: {user.sbdTotalKg} kg</span>
            </div>

            <button
              onClick={() => {
                setPrModalCount(0);
                setActiveTab('ranking');
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-extrabold text-xs shadow hover:bg-amber-400 transition-all"
            >
              Lihat Posisi di Leaderboard
            </button>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation (Mobile-First) */}
      <BottomNavigation
        activeTab={activeTab === 'body' ? 'home' : activeTab}
        onChangeTab={(t) => setActiveTab(t)}
        isAdminView={currentRole === 'admin'}
      />
    </div>
  );
}

