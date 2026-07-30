import { 
  UserProfile, 
  Exercise, 
  WorkoutSession, 
  LeaderboardEntry, 
  BodyProgressLog,
  AdminStats 
} from '../types';
import { 
  CURRENT_USER_DEFAULT, 
  INITIAL_EXERCISES, 
  SAMPLE_WORKOUT_HISTORY, 
  INITIAL_LEADERBOARD, 
  INITIAL_ADMIN_STATS 
} from '../data/initialData';

const STORAGE_KEYS = {
  USER: 'panglima_user_profile',
  EXERCISES: 'panglima_exercises',
  WORKOUTS: 'panglima_workouts',
  LEADERBOARD: 'panglima_leaderboard',
  ADMIN_STATS: 'panglima_admin_stats',
};

export function loadStoredUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load user from localStorage', e);
  }
  return CURRENT_USER_DEFAULT;
}

export function saveStoredUser(user: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    if (user && user.email) {
      const ACCOUNTS_STORAGE_KEY = 'panglima_user_accounts_v2';
      let accounts: Record<string, any> = {};
      const rawAccounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (rawAccounts) {
        try {
          accounts = JSON.parse(rawAccounts);
        } catch {
          accounts = {};
        }
      }

      const key = user.email.toLowerCase().trim();
      if (!accounts[key]) {
        accounts[key] = {
          name: user.name,
          email: user.email,
          password: '123456',
          role: user.role,
          userProfile: user,
        };
      } else {
        accounts[key].userProfile = user;
      }
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    }
  } catch (e) {
    console.error('Failed to save user', e);
  }
}

export function loadStoredExercises(): Exercise[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load exercises', e);
  }
  return INITIAL_EXERCISES;
}

export function saveStoredExercises(exercises: Exercise[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  } catch (e) {
    console.error('Failed to save exercises', e);
  }
}

export function loadStoredWorkouts(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load workouts', e);
  }
  return SAMPLE_WORKOUT_HISTORY;
}

export function saveStoredWorkouts(workouts: WorkoutSession[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  } catch (e) {
    console.error('Failed to save workouts', e);
  }
}

export function loadStoredLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (raw) {
      const parsed: LeaderboardEntry[] = JSON.parse(raw);
      // Filter out fictional dummy users (usr-lead-* and usr-1)
      const realUsers = parsed.filter(
        (item) => !item.userId.startsWith('usr-lead-') && item.userId !== 'usr-1'
      );
      if (realUsers.length > 0) {
        return realUsers.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
      }
    }
  } catch (e) {
    console.error('Failed to load leaderboard', e);
  }
  return INITIAL_LEADERBOARD;
}

export function saveStoredLeaderboard(leaderboard: LeaderboardEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
  } catch (e) {
    console.error('Failed to save leaderboard', e);
  }
}

export function loadStoredAdminStats(): AdminStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_STATS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load admin stats', e);
  }
  return INITIAL_ADMIN_STATS;
}

export function saveStoredAdminStats(stats: AdminStats) {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save admin stats', e);
  }
}
