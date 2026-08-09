import { UserProfile, LeaderboardEntry, WorkoutSession, AdminStats } from '../types';
import { LocalAccount } from '../utils/storage';

const SINGLE_WORD_NAMES = [
  { name: 'Aetheris', gender: 'm' },
  { name: 'Rizky', gender: 'm' },
  { name: 'Titan', gender: 'm' },
  { name: 'Bayu', gender: 'm' },
  { name: 'Vortex', gender: 'm' },
  { name: 'Dimas', gender: 'm' },
  { name: 'Ignis', gender: 'm' },
  { name: 'Fajar', gender: 'm' },
  { name: 'Valkyrie', gender: 'f' },
  { name: 'Gilang', gender: 'm' },
  { name: 'Draco', gender: 'm' },
  { name: 'Hendra', gender: 'm' },
  { name: 'Hyperion', gender: 'm' },
  { name: 'Eko', gender: 'm' },
  { name: 'Zephyr', gender: 'm' },
  { name: 'Agung', gender: 'm' },
  { name: 'Orion', gender: 'm' },
  { name: 'Irfan', gender: 'm' },
  { name: 'Ragnar', gender: 'm' },
  { name: 'Rendy', gender: 'm' },
  { name: 'Zenith', gender: 'm' },
  { name: 'Kevin', gender: 'm' },
  { name: 'Lyra', gender: 'f' },
  { name: 'Aldi', gender: 'm' },
  { name: 'Atlas', gender: 'm' },
  { name: 'Arya', gender: 'm' },
  { name: 'Seraph', gender: 'f' },
  { name: 'Fahmi', gender: 'm' },
  { name: 'Vespera', gender: 'f' },
  { name: 'Taufik', gender: 'm' },
  { name: 'Obsidian', gender: 'm' },
  { name: 'Satria', gender: 'm' },
  { name: 'Phoenix', gender: 'f' },
  { name: 'Doni', gender: 'm' },
  { name: 'Freya', gender: 'f' },
  { name: 'Yoga', gender: 'm' },
  { name: 'Azura', gender: 'f' },
  { name: 'Anton', gender: 'm' },
  { name: 'Magnus', gender: 'm' },
  { name: 'Rio', gender: 'm' },
  { name: 'Maya', gender: 'f' },
  { name: 'Annisa', gender: 'f' },
  { name: 'Rina', gender: 'f' },
  { name: 'Dian', gender: 'f' },
  { name: 'Intan', gender: 'f' },
  { name: 'Siska', gender: 'f' },
  { name: 'Melati', gender: 'f' },
  { name: 'Nadia', gender: 'f' },
  { name: 'Ratna', gender: 'f' },
  { name: 'Wulan', gender: 'f' }
];

const DICEBEAR_STYLES = ['adventurer', 'avataaars', 'bottts', 'micah', 'lorelei', 'big-smile', 'open-peeps', 'fun-emoji'];

function generate50MembersData(): {
  users: UserProfile[];
  accounts: LocalAccount[];
  workouts: WorkoutSession[];
  leaderboard: LeaderboardEntry[];
  stats: AdminStats;
} {
  const users: UserProfile[] = [];
  const accounts: LocalAccount[] = [];
  const workouts: WorkoutSession[] = [];

  // Generate 50 members with realistic decreasing SBD totals
  SINGLE_WORD_NAMES.forEach((item, index) => {
    const userId = `usr-member-${index + 1}`;
    const cleanName = item.name;
    const emailName = cleanName.toLowerCase().replace(/\s+/g, '.');
    const email = `${emailName}@panglima.fit`;
    
    const style = DICEBEAR_STYLES[index % DICEBEAR_STYLES.length];
    const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=ffdfbf,b6e3f4,ffd5dc,c0aede`;

    // SBD Strength Curve (Rank 1: ~540kg down to Rank 50: ~180kg)
    const basePower = 540 - Math.floor(index * 7.2);
    const squatPR = Math.max(50, Math.floor(basePower * 0.35));
    const benchPR = Math.max(35, Math.floor(basePower * 0.24));
    const deadliftPR = Math.max(60, Math.floor(basePower * 0.41));
    const sbdTotal = squatPR + benchPR + deadliftPR;
    const ohpPR = Math.max(25, Math.floor(benchPR * 0.65));

    // Body weight and composition
    const isFemale = item.gender === 'f';
    const baseWeight = isFemale ? Math.floor(52 + (50 - index) * 0.3) : Math.floor(65 + (50 - index) * 0.4);
    const bodyFat = isFemale ? Math.floor(18 + (index % 7)) : Math.floor(12 + (index % 9));
    const muscleMass = Math.floor(baseWeight * (isFemale ? 0.42 : 0.52));

    const joinedDaysAgo = 10 + index * 2;
    const joinedDateObj = new Date();
    joinedDateObj.setDate(joinedDateObj.getDate() - joinedDaysAgo);
    const joinedDate = joinedDateObj.toISOString().split('T')[0];

    const userProfile: UserProfile = {
      id: userId,
      name: cleanName,
      email: email,
      role: 'user',
      avatarUrl: avatarUrl,
      joinedDate: joinedDate,
      trainingStreakDays: (index % 15) + 1,
      totalWorkoutsThisMonth: Math.floor(8 + (index % 12)),
      totalVolumeThisMonthKg: Math.floor(sbdTotal * 45 + (index * 120)),
      sbdTotalKg: sbdTotal,
      personalRecords: {
        'ex-squat': {
          exerciseId: 'ex-squat',
          exerciseName: 'Barbell Back Squat',
          maxWeightKg: squatPR,
          maxReps: 1,
          estimatedOneRepMaxKg: squatPR,
          achievedDate: '2026-08-02'
        },
        'ex-bench': {
          exerciseId: 'ex-bench',
          exerciseName: 'Barbell Bench Press',
          maxWeightKg: benchPR,
          maxReps: 1,
          estimatedOneRepMaxKg: benchPR,
          achievedDate: '2026-08-04'
        },
        'ex-deadlift': {
          exerciseId: 'ex-deadlift',
          exerciseName: 'Conventional Deadlift',
          maxWeightKg: deadliftPR,
          maxReps: 1,
          estimatedOneRepMaxKg: deadliftPR,
          achievedDate: '2026-08-05'
        },
        'ex-ohp': {
          exerciseId: 'ex-ohp',
          exerciseName: 'Barbell Overhead Press (OHP)',
          maxWeightKg: ohpPR,
          maxReps: 3,
          estimatedOneRepMaxKg: Math.floor(ohpPR * 1.08),
          achievedDate: '2026-07-28'
        }
      },
      bodyProgressHistory: [
        {
          id: `bpl-1-${userId}`,
          userId: userId,
          date: '2026-07-01',
          weightKg: baseWeight - 2,
          bodyFatPercentage: bodyFat + 1.5,
          muscleMassKg: muscleMass - 1,
          notes: 'Awal program latihan di PANGLIMA Gym.'
        },
        {
          id: `bpl-2-${userId}`,
          userId: userId,
          date: '2026-07-20',
          weightKg: baseWeight - 1,
          bodyFatPercentage: bodyFat + 0.5,
          muscleMassKg: muscleMass - 0.5,
          notes: 'Progres progresif, hipertrofi berjalan baik.'
        },
        {
          id: `bpl-3-${userId}`,
          userId: userId,
          date: '2026-08-05',
          weightKg: baseWeight,
          bodyFatPercentage: bodyFat,
          muscleMassKg: muscleMass,
          notes: 'Massa otot meningkat, kadar lemak stabil.'
        }
      ]
    };

    users.push(userProfile);

    // Account login entry
    accounts.push({
      username: cleanName,
      email: email,
      password: '123456',
      userProfile: userProfile
    });

    // Generate 2 sample workout sessions per user
    const wo1Date = '2026-08-06';
    const wo2Date = '2026-08-08';

    const wo1: WorkoutSession = {
      id: `wo-1-${userId}`,
      userId: userId,
      userName: cleanName,
      title: 'Latihan Compound SBD & Upper Body',
      date: wo1Date,
      durationMinutes: 75,
      totalVolumeKg: Math.floor(squatPR * 12 + benchPR * 15 + 1200),
      notes: 'Sesi latihan SBD hari ini terasa sangat solid dan power melimpah.',
      exercises: [
        {
          id: `log-s-1-${userId}`,
          exerciseId: 'ex-squat',
          exerciseName: 'Barbell Back Squat',
          category: 'Kaki (Legs)',
          sets: [
            { id: 'set-1', setNumber: 1, reps: 5, weightKg: Math.floor(squatPR * 0.75), completed: true },
            { id: 'set-2', setNumber: 2, reps: 3, weightKg: Math.floor(squatPR * 0.85), completed: true },
            { id: 'set-3', setNumber: 3, reps: 1, weightKg: squatPR, completed: true, isPR: true }
          ]
        },
        {
          id: `log-b-1-${userId}`,
          exerciseId: 'ex-bench',
          exerciseName: 'Barbell Bench Press',
          category: 'Dada (Chest)',
          sets: [
            { id: 'set-1', setNumber: 1, reps: 5, weightKg: Math.floor(benchPR * 0.8), completed: true },
            { id: 'set-2', setNumber: 2, reps: 3, weightKg: Math.floor(benchPR * 0.9), completed: true },
            { id: 'set-3', setNumber: 3, reps: 1, weightKg: benchPR, completed: true, isPR: true }
          ]
        }
      ],
      prCount: 2
    };

    const wo2: WorkoutSession = {
      id: `wo-2-${userId}`,
      userId: userId,
      userName: cleanName,
      title: 'Latihan Deadlift & Back Heavy',
      date: wo2Date,
      durationMinutes: 65,
      totalVolumeKg: Math.floor(deadliftPR * 10 + 1500),
      notes: 'Fokus teknik deadlift & posterior chain.',
      exercises: [
        {
          id: `log-d-1-${userId}`,
          exerciseId: 'ex-deadlift',
          exerciseName: 'Conventional Deadlift',
          category: 'Punggung (Back)',
          sets: [
            { id: 'set-1', setNumber: 1, reps: 5, weightKg: Math.floor(deadliftPR * 0.75), completed: true },
            { id: 'set-2', setNumber: 2, reps: 3, weightKg: Math.floor(deadliftPR * 0.88), completed: true },
            { id: 'set-3', setNumber: 3, reps: 1, weightKg: deadliftPR, completed: true, isPR: true }
          ]
        }
      ],
      prCount: 1
    };

    workouts.push(wo1, wo2);
  });

  // Sort users by SBD total descending to construct leaderboard
  const sortedUsers = [...users].sort((a, b) => b.sbdTotalKg - a.sbdTotalKg);

  const leaderboard: LeaderboardEntry[] = sortedUsers.map((u, idx) => {
    const squatPR = u.personalRecords['ex-squat']?.maxWeightKg || 0;
    const benchPR = u.personalRecords['ex-bench']?.maxWeightKg || 0;
    const deadliftPR = u.personalRecords['ex-deadlift']?.maxWeightKg || 0;

    return {
      rank: idx + 1,
      userId: u.id,
      userName: u.name,
      userAvatar: u.avatarUrl,
      squatPRKg: squatPR,
      benchPRKg: benchPR,
      deadliftPRKg: deadliftPR,
      sbdTotalKg: u.sbdTotalKg,
      lastUpdated: u.joinedDate || '2026-08-08'
    };
  });

  const totalVol = workouts.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0);

  const stats: AdminStats = {
    totalUsers: users.length,
    totalWorkouts: workouts.length,
    totalExercises: 17,
    activeUsersThisWeek: 42,
    totalVolumeLoggedKg: totalVol,
    aiQueriesAnswered: 128
  };

  return { users, accounts, workouts, leaderboard, stats };
}

const seedData = generate50MembersData();

export const SEED_MEMBER_USERS: UserProfile[] = seedData.users;
export const SEED_MEMBER_ACCOUNTS: LocalAccount[] = seedData.accounts;
export const SEED_MEMBER_WORKOUTS: WorkoutSession[] = seedData.workouts;
export const SEED_MEMBER_LEADERBOARD: LeaderboardEntry[] = seedData.leaderboard;
export const SEED_ADMIN_STATS: AdminStats = seedData.stats;
