import { Exercise, UserProfile, LeaderboardEntry, WorkoutSession, AdminStats } from '../types';

export const INITIAL_EXERCISES: Exercise[] = [
  // SBD Exercises
  {
    id: 'ex-squat',
    name: 'Barbell Back Squat',
    category: 'Kaki (Legs)',
    equipment: 'Barbell',
    isSBD: true,
    sbdType: 'squat',
    description: 'Latihan utama kekuatan kaki, paha depan, dan glutes.',
    instructions: ['Letakkan barbell di atas trapezius', 'Buka kaki selebar bahu', 'Jaga dada tetap tegak', 'Turun hingga paha sejajar lantai'],
  },
  {
    id: 'ex-bench',
    name: 'Barbell Bench Press',
    category: 'Dada (Chest)',
    equipment: 'Barbell',
    isSBD: true,
    sbdType: 'bench',
    description: 'Latihan compound standar emas untuk membangun otot dada.',
    instructions: ['Berbaring di bench dengan foot drive mantap', 'Pegang bar sedikit lebih lebar dari bahu', 'Turunkan bar ke bagian tengah dada', 'Dorong kuat ke atas'],
  },
  {
    id: 'ex-deadlift',
    name: 'Conventional Deadlift',
    category: 'Punggung (Back)',
    equipment: 'Barbell',
    isSBD: true,
    sbdType: 'deadlift',
    description: 'Latihan paling komprehensif untuk posterior chain.',
    instructions: ['Berdiri dengan tulang kering dekat bar', 'Pegang bar erat dengan kencangkan lats', 'Tarik napas ke dalam abdomen', 'Tarik beban sambil mengunci hip extension'],
  },
  // Other Chest
  {
    id: 'ex-incline-db-press',
    name: 'Incline Dumbbell Press',
    category: 'Dada (Chest)',
    equipment: 'Dumbbell',
    description: 'Fokus pada otot dada bagian atas (upper chest).',
  },
  {
    id: 'ex-cable-fly',
    name: 'Cable Chest Fly',
    category: 'Dada (Chest)',
    equipment: 'Cable',
    description: 'Isolasi otot dada dengan ketegangan konstan.',
  },
  // Back
  {
    id: 'ex-barbell-row',
    name: 'Barbell Bent-Over Row',
    category: 'Punggung (Back)',
    equipment: 'Barbell',
    description: 'Membangun ketebalan otot punggung dan lats.',
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Lat Pulldown',
    category: 'Punggung (Back)',
    equipment: 'Cable',
    description: 'Melebarkan otot lats untuk bentuk V-Taper.',
  },
  {
    id: 'ex-pullup',
    name: 'Pull Up',
    category: 'Punggung (Back)',
    equipment: 'Bodyweight',
    description: 'Latihan beban tubuh terbaik untuk punggung.',
  },
  // Legs
  {
    id: 'ex-leg-press',
    name: 'Leg Press',
    category: 'Kaki (Legs)',
    equipment: 'Machine',
    description: 'Isolasi quadriceps tanpa tekanan berlebih pada tulang belakang.',
  },
  {
    id: 'ex-rdl',
    name: 'Romanian Deadlift (RDL)',
    category: 'Kaki (Legs)',
    equipment: 'Barbell',
    description: 'Target khusus hamstrings dan glutes.',
  },
  // Shoulders
  {
    id: 'ex-ohp',
    name: 'Barbell Overhead Press (OHP)',
    category: 'Bahu (Shoulders)',
    equipment: 'Barbell',
    description: 'Membangun kekuatan dan ukuran bahu secara menyeluruh.',
  },
  {
    id: 'ex-lat-raise',
    name: 'Dumbbell Lateral Raise',
    category: 'Bahu (Shoulders)',
    equipment: 'Dumbbell',
    description: 'Membangun bahu bagian samping (side delts).',
  },
  {
    id: 'ex-facepull',
    name: 'Cable Face Pull',
    category: 'Bahu (Shoulders)',
    equipment: 'Cable',
    description: 'Sangat baik untuk kesehatan bahu dan rear delts.',
  },
  // Arms
  {
    id: 'ex-bicep-curl',
    name: 'Barbell Bicep Curl',
    category: 'Lengan (Arms)',
    equipment: 'Barbell',
    description: 'Latihan klasik pembentuk otot bicep.',
  },
  {
    id: 'ex-tricep-pushdown',
    name: 'Tricep Rope Pushdown',
    category: 'Lengan (Arms)',
    equipment: 'Cable',
    description: 'Isolasi tricep head bagian luar.',
  },
  // Core
  {
    id: 'ex-hanging-leg-raise',
    name: 'Hanging Leg Raise',
    category: 'Inti (Core)',
    equipment: 'Bodyweight',
    description: 'Latihan otot perut bawah dan hip flexor.',
  },
  {
    id: 'ex-plank',
    name: 'Weighted Plank',
    category: 'Inti (Core)',
    equipment: 'Bodyweight',
    description: 'Melatih stabilitas kores dan daya tahan otot perut.',
  },
];

export const CURRENT_USER_DEFAULT: UserProfile = {
  id: 'usr-guest',
  name: 'Member PANGLIMA',
  email: '',
  role: 'user',
  avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GymBro&backgroundColor=ffdfbf,b6e3f4',
  joinedDate: new Date().toISOString().split('T')[0],
  trainingStreakDays: 0,
  totalWorkoutsThisMonth: 0,
  totalVolumeThisMonthKg: 0,
  sbdTotalKg: 0,
  personalRecords: {},
  bodyProgressHistory: []
};

export const SAMPLE_WORKOUT_HISTORY: WorkoutSession[] = [];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [];

export const INITIAL_ADMIN_STATS: AdminStats = {
  totalUsers: 0,
  totalWorkouts: 0,
  totalExercises: 17,
  activeUsersThisWeek: 0,
  totalVolumeLoggedKg: 0,
  aiQueriesAnswered: 0,
};
