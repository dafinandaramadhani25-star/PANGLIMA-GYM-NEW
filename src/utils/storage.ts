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
import {
  SEED_MEMBER_USERS,
  SEED_MEMBER_ACCOUNTS,
  SEED_MEMBER_WORKOUTS,
  SEED_MEMBER_LEADERBOARD,
  SEED_ADMIN_STATS
} from '../data/seed50Members';

const STORAGE_KEYS = {
  USER: 'panglima_user_profile',
  EXERCISES: 'panglima_exercises',
  WORKOUTS: 'panglima_workouts',
  LEADERBOARD: 'panglima_leaderboard',
  ADMIN_STATS: 'panglima_admin_stats',
};

export function loadStoredUser(): UserProfile {
  try {
    const isAuth = localStorage.getItem('panglima_is_authenticated');
    if (isAuth !== 'true') {
      return CURRENT_USER_DEFAULT;
    }
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) {
      const u: UserProfile = JSON.parse(raw);
      if (
        u && 
        u.id && 
        u.id !== 'usr-1' && 
        u.id !== 'usr-guest' &&
        u.id !== 'usr-member-default' &&
        u.email !== 'dafin.ramadhan@panglima.id' && 
        u.email !== 'member@panglima.id'
      ) {
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
    message: '',
    date: '2026-08-01',
    active: false,
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
  const userMap = new Map<string, UserProfile>();

  SEED_MEMBER_USERS.forEach((u) => userMap.set(u.id, u));

  localAccounts.forEach((acc) => {
    if (acc.userProfile && acc.userProfile.id) {
      userMap.set(acc.userProfile.id, acc.userProfile);
    }
  });

  return Array.from(userMap.values());
}

const REGISTERED_ACCOUNTS_KEY = 'panglima_registered_accounts_v4';

export function clearAllRegisteredAccounts(): void {
  try {
    localStorage.removeItem(REGISTERED_ACCOUNTS_KEY);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
  } catch (e) {
    console.error('Failed to clear registered accounts', e);
  }
}

export function getRegisteredAccounts(): LocalAccount[] {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    if (raw) {
      const parsed: LocalAccount[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const accMap = new Map<string, LocalAccount>();
        SEED_MEMBER_ACCOUNTS.forEach((a) => accMap.set(a.userProfile.id, a));
        parsed.forEach((a) => {
          if (a && a.userProfile?.id && a.userProfile.id !== 'usr-1') {
            accMap.set(a.userProfile.id, a);
          }
        });
        return Array.from(accMap.values());
      }
    }
  } catch (e) {
    console.error('Failed to get registered accounts', e);
  }
  return SEED_MEMBER_ACCOUNTS;
}

export function saveRegisteredAccount(username: string, email: string, password: string, userProfile: UserProfile): void {
  try {
    const accounts = getRegisteredAccounts();
    const cleanUsername = (username || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    // Check if account already exists
    const existingIndex = accounts.findIndex(
      (acc) =>
        (userProfile.id && acc.userProfile?.id === userProfile.id) ||
        (cleanUsername && acc.username && acc.username.trim().toLowerCase() === cleanUsername.toLowerCase()) ||
        (cleanEmail && acc.email && acc.email.trim().toLowerCase() === cleanEmail)
    );

    const newAcc: LocalAccount = {
      username: cleanUsername,
      email: cleanEmail,
      password: password || '123456',
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
    const clean = (userIdOrEmail || '').trim().toLowerCase();
    if (!clean) return;

    const updated = accounts.filter(
      (acc) =>
        acc.userProfile?.id !== userIdOrEmail &&
        (acc.email || '').toLowerCase() !== clean &&
        (acc.username || '').toLowerCase() !== clean
    );
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to remove registered account', e);
  }
}

export function findRegisteredAccount(identifier: string): LocalAccount | null {
  const cleanId = (identifier || '').trim().toLowerCase();
  if (!cleanId) return null;

  const accounts = getRegisteredAccounts();
  const match = accounts.find(
    (acc) =>
      (acc.username && acc.username.toLowerCase() === cleanId) ||
      (acc.email && acc.email.toLowerCase() === cleanId)
  );

  return match || null;
}

export function saveStoredUser(user: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    if (user && (user.name || user.email)) {
      const accounts = getRegisteredAccounts();
      const existing = accounts.find((a) =>
        (user.id && a.userProfile?.id === user.id) ||
        (user.name && a.username && a.username.trim().toLowerCase() === user.name.trim().toLowerCase()) ||
        (user.email && a.email && a.email.trim().toLowerCase() === user.email.trim().toLowerCase())
      );

      if (existing) {
        saveRegisteredAccount(
          user.name || existing.username,
          user.email || existing.email,
          existing.password, // Preserve existing password!
          user
        );
      }
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
      const woMap = new Map<string, WorkoutSession>();
      SEED_MEMBER_WORKOUTS.forEach((w) => woMap.set(w.id, w));
      realWorkouts.forEach((w) => woMap.set(w.id, w));
      return Array.from(woMap.values());
    }
  } catch (e) {
    console.error('Failed to load workouts', e);
  }
  return SEED_MEMBER_WORKOUTS;
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
      const MOCK_IDS = ['usr-1', 'usr-2', 'usr-3', 'usr-4', 'usr-admin-1', 'usr-guest', 'usr-member-default'];
      const MOCK_EMAILS = [
        'dafin.ramadhan@panglima.id',
        'admin@panglima.id',
        'budi.santoso@panglima.id',
        'rian.power@panglima.id',
        'siti.rahma@panglima.id',
        'member@panglima.id'
      ];
      const realEntries = parsed.filter(e => 
        !MOCK_IDS.includes(e.userId) && 
        !e.userId.startsWith('usr-lead-') &&
        !MOCK_EMAILS.includes((e.userName || '').toLowerCase()) &&
        (e.sbdTotalKg > 0)
      );

      const lbMap = new Map<string, LeaderboardEntry>();
      SEED_MEMBER_LEADERBOARD.forEach((e) => lbMap.set(e.userId, e));
      realEntries.forEach((e) => lbMap.set(e.userId, e));

      const mergedList = Array.from(lbMap.values());
      mergedList.sort((a, b) => (b.sbdTotalKg || 0) - (a.sbdTotalKg || 0));

      return mergedList.map((entry, idx) => ({ 
        ...entry, 
        userName: entry.userName ? entry.userName.replace(/\s*\(Anda\)$/i, '') : entry.userName,
        rank: idx + 1 
      }));
    }
  } catch (e) {
    console.error('Failed to load leaderboard', e);
  }
  return SEED_MEMBER_LEADERBOARD;
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
    if (raw) {
      const parsed: AdminStats = JSON.parse(raw);
      if (parsed.totalUsers < 50) {
        return SEED_ADMIN_STATS;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load admin stats', e);
  }
  return SEED_ADMIN_STATS;
}

export function saveStoredAdminStats(stats: AdminStats) {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save admin stats', e);
  }
}
