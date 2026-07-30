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
  id: 'usr-1',
  name: 'Dafin Ramadhan',
  email: 'dafin.ramadhan@panglima.id',
  role: 'user',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  joinedDate: '2026-01-15',
  trainingStreakDays: 12,
  totalWorkoutsThisMonth: 16,
  totalVolumeThisMonthKg: 42800,
  sbdTotalKg: 430, // 150 Squat + 110 Bench + 170 Deadlift
  personalRecords: {
    'ex-squat': {
      exerciseId: 'ex-squat',
      exerciseName: 'Barbell Back Squat',
      maxWeightKg: 150,
      maxReps: 3,
      estimatedOneRepMaxKg: 165,
      achievedDate: '2026-07-18',
    },
    'ex-bench': {
      exerciseId: 'ex-bench',
      exerciseName: 'Barbell Bench Press',
      maxWeightKg: 110,
      maxReps: 5,
      estimatedOneRepMaxKg: 128,
      achievedDate: '2026-07-20',
    },
    'ex-deadlift': {
      exerciseId: 'ex-deadlift',
      exerciseName: 'Conventional Deadlift',
      maxWeightKg: 170,
      maxReps: 2,
      estimatedOneRepMaxKg: 181,
      achievedDate: '2026-07-15',
    },
    'ex-ohp': {
      exerciseId: 'ex-ohp',
      exerciseName: 'Barbell Overhead Press (OHP)',
      maxWeightKg: 70,
      maxReps: 5,
      estimatedOneRepMaxKg: 81,
      achievedDate: '2026-07-10',
    },
    'ex-barbell-row': {
      exerciseId: 'ex-barbell-row',
      exerciseName: 'Barbell Bent-Over Row',
      maxWeightKg: 95,
      maxReps: 8,
      estimatedOneRepMaxKg: 120,
      achievedDate: '2026-07-12',
    }
  },
  bodyProgressHistory: [
    {
      id: 'bp-1',
      userId: 'usr-1',
      date: '2026-05-01',
      weightKg: 78.5,
      bodyFatPercentage: 20.2,
      muscleMassKg: 34.1,
      photoUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=400',
      notes: 'Awal program hipertrofi PANGLIMA.',
    },
    {
      id: 'bp-2',
      userId: 'usr-1',
      date: '2026-06-01',
      weightKg: 76.8,
      bodyFatPercentage: 18.5,
      muscleMassKg: 35.0,
      photoUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=400',
      notes: 'Progress rekosisi badan berjalan baik.',
    },
    {
      id: 'bp-3',
      userId: 'usr-1',
      date: '2026-07-01',
      weightKg: 75.2,
      bodyFatPercentage: 16.8,
      muscleMassKg: 35.8,
      photoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=400',
      notes: 'Otot perut mulai terlihat lebih terdefinisi.',
    },
    {
      id: 'bp-4',
      userId: 'usr-1',
      date: '2026-07-20',
      weightKg: 74.5,
      bodyFatPercentage: 15.6,
      muscleMassKg: 36.2,
      photoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400',
      notes: 'Mencapai target kadar lemak dibawah 16%.',
    }
  ]
};

export const SAMPLE_WORKOUT_HISTORY: WorkoutSession[] = [
  {
    id: 'wo-101',
    userId: 'usr-1',
    userName: 'Dafin Ramadhan',
    title: 'Chest & Triceps Hypertrophy',
    date: '2026-07-22',
    durationMinutes: 65,
    totalVolumeKg: 9450,
    notes: 'Sesi latihan dada sangat kuat hari ini. Terasa pump maksimal pada bench press.',
    prCount: 1,
    exercises: [
      {
        id: 'we-1',
        exerciseId: 'ex-bench',
        exerciseName: 'Barbell Bench Press',
        category: 'Dada (Chest)',
        sets: [
          { id: 's1', setNumber: 1, reps: 10, weightKg: 80, completed: true },
          { id: 's2', setNumber: 2, reps: 8, weightKg: 90, completed: true },
          { id: 's3', setNumber: 3, reps: 5, weightKg: 100, completed: true },
          { id: 's4', setNumber: 4, reps: 5, weightKg: 110, completed: true, isPR: true },
        ],
      },
      {
        id: 'we-2',
        exerciseId: 'ex-incline-db-press',
        exerciseName: 'Incline Dumbbell Press',
        category: 'Dada (Chest)',
        sets: [
          { id: 's5', setNumber: 1, reps: 12, weightKg: 30, completed: true },
          { id: 's6', setNumber: 2, reps: 10, weightKg: 34, completed: true },
          { id: 's7', setNumber: 3, reps: 10, weightKg: 34, completed: true },
        ],
      },
      {
        id: 'we-3',
        exerciseId: 'ex-tricep-pushdown',
        exerciseName: 'Tricep Rope Pushdown',
        category: 'Lengan (Arms)',
        sets: [
          { id: 's8', setNumber: 1, reps: 15, weightKg: 25, completed: true },
          { id: 's9', setNumber: 2, reps: 12, weightKg: 30, completed: true },
          { id: 's10', setNumber: 3, reps: 12, weightKg: 30, completed: true },
        ]
      }
    ]
  },
  {
    id: 'wo-102',
    userId: 'usr-1',
    userName: 'Dafin Ramadhan',
    title: 'Leg Day SBD Focus',
    date: '2026-07-20',
    durationMinutes: 75,
    totalVolumeKg: 12800,
    notes: 'Kekuatan Squat stabil. Berhasil melampaui rekor lama 145kg.',
    prCount: 1,
    exercises: [
      {
        id: 'we-4',
        exerciseId: 'ex-squat',
        exerciseName: 'Barbell Back Squat',
        category: 'Kaki (Legs)',
        sets: [
          { id: 's11', setNumber: 1, reps: 8, weightKg: 100, completed: true },
          { id: 's12', setNumber: 2, reps: 5, weightKg: 130, completed: true },
          { id: 's13', setNumber: 3, reps: 3, weightKg: 150, completed: true, isPR: true },
        ]
      },
      {
        id: 'we-5',
        exerciseId: 'ex-rdl',
        exerciseName: 'Romanian Deadlift (RDL)',
        category: 'Kaki (Legs)',
        sets: [
          { id: 's14', setNumber: 1, reps: 10, weightKg: 90, completed: true },
          { id: 's15', setNumber: 2, reps: 10, weightKg: 100, completed: true },
          { id: 's16', setNumber: 3, reps: 8, weightKg: 110, completed: true },
        ]
      }
    ]
  },
  {
    id: 'wo-103',
    userId: 'usr-1',
    userName: 'Dafin Ramadhan',
    title: 'Back & Biceps Power',
    date: '2026-07-18',
    durationMinutes: 60,
    totalVolumeKg: 10550,
    notes: 'Deadlift terasa ringan di 170kg.',
    prCount: 0,
    exercises: [
      {
        id: 'we-6',
        exerciseId: 'ex-deadlift',
        exerciseName: 'Conventional Deadlift',
        category: 'Punggung (Back)',
        sets: [
          { id: 's17', setNumber: 1, reps: 5, weightKg: 120, completed: true },
          { id: 's18', setNumber: 2, reps: 3, weightKg: 150, completed: true },
          { id: 's19', setNumber: 3, reps: 2, weightKg: 170, completed: true },
        ]
      },
      {
        id: 'we-7',
        exerciseId: 'ex-lat-pulldown',
        exerciseName: 'Lat Pulldown',
        category: 'Punggung (Back)',
        sets: [
          { id: 's20', setNumber: 1, reps: 12, weightKg: 60, completed: true },
          { id: 's21', setNumber: 2, reps: 10, weightKg: 70, completed: true },
          { id: 's22', setNumber: 3, reps: 10, weightKg: 70, completed: true },
        ]
      }
    ]
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [];

export const INITIAL_ADMIN_STATS: AdminStats = {
  totalUsers: 1,
  totalWorkouts: 3,
  totalExercises: 17,
  activeUsersThisWeek: 1,
  totalVolumeLoggedKg: 32800,
  aiQueriesAnswered: 0,
};
