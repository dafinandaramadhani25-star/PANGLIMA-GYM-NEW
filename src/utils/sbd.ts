import { PersonalRecord, UserProfile, LeaderboardEntry } from '../types';

/**
 * Calculates estimated 1 Rep Max using Epley Formula:
 * 1RM = Weight * (1 + Reps / 30)
 */
export function calculateEstimated1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30));
}

/**
 * Calculates SBD Total (Squat PR + Bench Press PR + Deadlift PR)
 */
export function calculateSBDTotal(
  squatKg: number = 0,
  benchKg: number = 0,
  deadliftKg: number = 0
): number {
  return (squatKg || 0) + (benchKg || 0) + (deadliftKg || 0);
}

/**
 * Checks whether a new set breaks an existing Personal Record for an exercise.
 * Return true if weight is greater than current max weight for that exercise.
 */
export function checkIsPersonalRecord(
  exerciseId: string,
  weightKg: number,
  currentPRs: Record<string, PersonalRecord>
): boolean {
  if (!weightKg || weightKg <= 0) return false;
  const existingPR = currentPRs[exerciseId];
  if (!existingPR) return false;
  return weightKg > existingPR.maxWeightKg;
}

/**
 * Updates user SBD Total and Leaderboard entry if SBD PR changed.
 */
export function updateLeaderboardWithPRs(
  user: UserProfile,
  leaderboardList: LeaderboardEntry[]
): LeaderboardEntry[] {
  const squatPR = user.personalRecords['ex-squat']?.maxWeightKg || 0;
  const benchPR = user.personalRecords['ex-bench']?.maxWeightKg || 0;
  const deadliftPR = user.personalRecords['ex-deadlift']?.maxWeightKg || 0;
  const sbdTotal = squatPR + benchPR + deadliftPR;

  const existingIndex = leaderboardList.findIndex((item) => item.userId === user.id);
  let updatedList = [...leaderboardList];

  const userEntry: LeaderboardEntry = {
    rank: 0, // recalculated below
    userId: user.id,
    userName: `${user.name} (Anda)`,
    userAvatar: user.avatarUrl,
    squatPRKg: squatPR,
    benchPRKg: benchPR,
    deadliftPRKg: deadliftPR,
    sbdTotalKg: sbdTotal,
    lastUpdated: new Date().toISOString().split('T')[0],
  };

  if (existingIndex >= 0) {
    updatedList[existingIndex] = userEntry;
  } else {
    updatedList.push(userEntry);
  }

  // Sort descending by total SBD
  updatedList.sort((a, b) => b.sbdTotalKg - a.sbdTotalKg);

  // Re-assign rank numbers 1, 2, 3...
  return updatedList.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}
