export type Role = 'user' | 'admin';

export type MuscleCategory = 
  | 'Dada (Chest)'
  | 'Punggung (Back)'
  | 'Kaki (Legs)'
  | 'Bahu (Shoulders)'
  | 'Lengan (Arms)'
  | 'Inti (Core)';

export type EquipmentType = 
  | 'Barbell'
  | 'Dumbbell'
  | 'Machine'
  | 'Cable'
  | 'Bodyweight'
  | 'Lainnya';

export interface Exercise {
  id: string;
  name: string;
  category: MuscleCategory;
  equipment: EquipmentType;
  isSBD?: boolean; // Indicates if it's Squat, Bench Press, or Deadlift
  sbdType?: 'squat' | 'bench' | 'deadlift';
  description?: string;
  instructions?: string[];
  imageUrl?: string;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
  isPR?: boolean;
}

export interface WorkoutExerciseLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category: MuscleCategory;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  userName: string;
  title: string;
  date: string; // ISO date string YYYY-MM-DD
  durationMinutes: number;
  totalVolumeKg: number;
  notes?: string;
  exercises: WorkoutExerciseLog[];
  prCount?: number;
}

export interface BodyProgressLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  photoUrl?: string;
  notes?: string;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeightKg: number;
  maxReps: number;
  estimatedOneRepMaxKg: number;
  achievedDate: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
  joinedDate: string;
  trainingStreakDays: number;
  totalWorkoutsThisMonth: number;
  totalVolumeThisMonthKg: number;
  personalRecords: Record<string, PersonalRecord>; // key: exerciseId or exerciseName
  bodyProgressHistory: BodyProgressLog[];
  sbdTotalKg: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  squatPRKg: number;
  benchPRKg: number;
  deadliftPRKg: number;
  sbdTotalKg: number;
  lastUpdated: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickActionTitle?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalWorkouts: number;
  totalExercises: number;
  activeUsersThisWeek: number;
  totalVolumeLoggedKg: number;
  aiQueriesAnswered: number;
}
