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
    if (raw) {
      const u: UserProfile = JSON.parse(raw);
      if (u && u.id !== 'usr-1' && u.email !== 'dafin.ramadhan@panglima.id') {
        if (u.name) {
          u.name = u.name.replace(/\s*\(Anda\)$/i, '');
        }
        return u;
      }
    }
  } catch (e) {
    console.error('Failed to load user from localStorage', e);
  }
  return CURRENT_USER_DEFAULT;
}

export interface LocalAccount {
  username: string;
  email: string;
  password: string;
  userProfile: UserProfile;
}

export interface GymAnnouncement {
  id: string;
  title: string;
  message: string;
  date: string;
  active: boolean;
  category: 'info' | 'warning' | 'event';
}

const GYM_ANNOUNCEMENT_KEY = 'panglima_gym_announcement_v1';

export function getGymAnnouncement(): GymAnnouncement {
  try {
    const raw = localStorage.getItem(GYM_ANNOUNCEMENT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get gym announcement', e);
  }
  return {
    id: 'anc-1',
    title: 'Pengumuman Resmi PANGLIMA Gym',
    message: 'Selamat datang di Portal Member PANGLIMA! Gunakan fitur Log Workout untuk mencatat progressive overload & SBD total Anda.',
    date: '2026-08-01',
    active: true,
    category: 'event',
  };
}

export function saveGymAnnouncement(announcement: GymAnnouncement): void {
  try {
    localStorage.setItem(GYM_ANNOUNCEMENT_KEY, JSON.stringify(announcement));
  } catch (e) {
    console.error('Failed to save gym announcement', e);
  }
}

export function getAllRegisteredUsers(): UserProfile[] {
  const localAccounts = getRegisteredAccounts();
  const mergedUsers: UserProfile[] = [];

  localAccounts.forEach((acc) => {
    if (acc.userProfile && acc.userProfile.id) {
      const idx = mergedUsers.findIndex(u => u.id === acc.userProfile.id || u.email === acc.email);
      if (idx >= 0) {
        mergedUsers[idx] = acc.userProfile;
      } else {
        mergedUsers.push(acc.userProfile);
      }
    }
  });

  return mergedUsers;
}

const REGISTERED_ACCOUNTS_KEY = 'panglima_registered_accounts_v3';

export function getRegisteredAccounts(): LocalAccount[] {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    if (raw) {
      const parsed: LocalAccount[] = JSON.parse(raw);
      const MOCK_EMAILS = [
        'dafin.ramadhan@panglima.id',
        'admin@panglima.id',
        'budi.santoso@panglima.id',
        'rian.power@panglima.id',
        'siti.rahma@panglima.id'
      ];
      return parsed.filter(a => !MOCK_EMAILS.includes(a.email.toLowerCase()) && a.userProfile?.id !== 'usr-1');
    }
  } catch (e) {
    console.error('Failed to get registered accounts', e);
  }
  return [];
}

export function saveRegisteredAccount(username: string, email: string, password: string, userProfile: UserProfile): void {
  try {
    const accounts = getRegisteredAccounts();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check if account already exists
    const existingIndex = accounts.findIndex(
      (acc) =>
        acc.email.toLowerCase() === cleanEmail ||
        acc.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    const newAcc: LocalAccount = {
      username: cleanUsername,
      email: cleanEmail,
      password,
      userProfile,
    };

    if (existingIndex >= 0) {
      accounts[existingIndex] = newAcc;
    } else {
      accounts.push(newAcc);
    }

    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save registered account', e);
  }
}

export function removeRegisteredAccount(userIdOrEmail: string): void {
  try {
    const accounts = getRegisteredAccounts();
    const clean = userIdOrEmail.trim().toLowerCase();
    const updated = accounts.filter(
      (acc) =>
        acc.userProfile?.id !== userIdOrEmail &&
        acc.email.toLowerCase() !== clean &&
        acc.username.toLowerCase() !== clean
    );
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to remove registered account', e);
  }
}

export function findRegisteredAccount(identifier: string): LocalAccount | null {
  const cleanId = identifier.trim().toLowerCase();
  if (!cleanId) return null;

  const accounts = getRegisteredAccounts();
  const match = accounts.find(
    (acc) =>
      acc.username.toLowerCase() === cleanId ||
      acc.email.toLowerCase() === cleanId
  );

  return match || null;
}

export function saveStoredUser(user: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    if (user && user.email) {
      saveRegisteredAccount(
        user.name || 'Member',
        user.email,
        '123456',
        user
      );
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
    if (raw) {
      const parsed: WorkoutSession[] = JSON.parse(raw);
      const realWorkouts = parsed.filter(w => w.userId !== 'usr-1' && !['wo-101', 'wo-102', 'wo-103'].includes(w.id));
      return realWorkouts;
    }
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
      if (parsed.length > 0) {
        return parsed.map((entry, idx) => ({ 
          ...entry, 
          userName: entry.userName ? entry.userName.replace(/\s*\(Anda\)$/i, '') : entry.userName,
          rank: idx + 1 
        }));
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
