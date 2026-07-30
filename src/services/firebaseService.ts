import { 
  db, 
  auth, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  onSnapshot 
} from '../lib/firebase';
import { UserProfile, WorkoutSession, BodyProgressLog, LeaderboardEntry, Exercise } from '../types';

// Users Collection Reference
const USERS_COL = 'users';
const WORKOUTS_COL = 'workouts';
const BODY_PROGRESS_COL = 'bodyProgress';
const LEADERBOARD_COL = 'leaderboard';
const EXERCISES_COL = 'exercises';

/**
 * Save or update user profile document in Firestore
 */
export async function saveUserProfileToFirestore(user: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, USERS_COL, user.id);
    await setDoc(userRef, {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to save user profile to Firestore:', err);
  }
}

/**
 * Fetch user profile from Firestore by ID
 */
export async function getUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, USERS_COL, userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Failed to get user profile from Firestore:', err);
  }
  return null;
}

/**
 * Subscribe to real-time user profile changes
 */
export function listenToUserProfile(userId: string, onUpdate: (user: UserProfile) => void) {
  const userRef = doc(db, USERS_COL, userId);
  return onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as UserProfile);
    }
  }, (err) => {
    console.warn('Error listening to user profile:', err);
  });
}

/**
 * Save a workout session to Firestore
 */
export async function saveWorkoutSessionToFirestore(workout: WorkoutSession): Promise<void> {
  try {
    const workoutRef = doc(db, WORKOUTS_COL, workout.id);
    await setDoc(workoutRef, {
      ...workout,
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to save workout session to Firestore:', err);
  }
}

/**
 * Listen to real-time workout sessions for a user
 */
export function listenToUserWorkouts(userId: string, onUpdate: (workouts: WorkoutSession[]) => void) {
  const q = query(
    collection(db, WORKOUTS_COL),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const list: WorkoutSession[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as WorkoutSession);
    });
    // Sort descending by date
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    onUpdate(list);
  }, (err) => {
    console.warn('Error listening to workouts:', err);
  });
}

/**
 * Save body progress log to Firestore
 */
export async function saveBodyProgressToFirestore(log: BodyProgressLog): Promise<void> {
  try {
    const logRef = doc(db, BODY_PROGRESS_COL, log.id);
    await setDoc(logRef, {
      ...log,
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to save body progress log to Firestore:', err);
  }
}

/**
 * Listen to real-time body progress logs for a user
 */
export function listenToBodyProgress(userId: string, onUpdate: (logs: BodyProgressLog[]) => void) {
  const q = query(
    collection(db, BODY_PROGRESS_COL),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const list: BodyProgressLog[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as BodyProgressLog);
    });
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    onUpdate(list);
  }, (err) => {
    console.warn('Error listening to body progress:', err);
  });
}

/**
 * Save or update leaderboard entry in Firestore
 */
export async function saveLeaderboardEntryToFirestore(entry: LeaderboardEntry): Promise<void> {
  try {
    const entryRef = doc(db, LEADERBOARD_COL, entry.userId);
    await setDoc(entryRef, {
      ...entry,
      lastUpdated: new Date().toISOString().split('T')[0],
    }, { merge: true });
  } catch (err) {
    console.warn('Failed to save leaderboard entry to Firestore:', err);
  }
}

/**
 * Sync entire leaderboard array to Firestore
 */
export async function syncLeaderboardToFirestore(entries: LeaderboardEntry[]): Promise<void> {
  try {
    for (const entry of entries) {
      await saveLeaderboardEntryToFirestore(entry);
    }
  } catch (err) {
    console.warn('Failed to sync leaderboard:', err);
  }
}

/**
 * Listen to real-time Leaderboard updates
 */
export function listenToLeaderboard(onUpdate: (leaderboard: LeaderboardEntry[]) => void) {
  const colRef = collection(db, LEADERBOARD_COL);

  return onSnapshot(colRef, (snapshot) => {
    const list: LeaderboardEntry[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as LeaderboardEntry);
    });
    // Sort by SBD total descending
    list.sort((a, b) => (b.sbdTotalKg || 0) - (a.sbdTotalKg || 0));
    // Assign ranks
    const rankedList = list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
    onUpdate(rankedList);
  }, (err) => {
    console.warn('Error listening to leaderboard:', err);
  });
}
