import React, { useState } from 'react';
import { 
  Dumbbell, 
  ShieldAlert, 
  User, 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { UserProfile, Role } from '../types';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from '../lib/firebase';
import { saveUserProfileToFirestore, getUserProfileFromFirestore } from '../services/firebaseService';

interface AuthViewProps {
  onLoginSuccess: (user: UserProfile) => void;
  onCancel?: () => void;
  initialMode?: 'login' | 'register';
}

export const DEFAULT_MEMBER_USER: UserProfile = {
  id: 'usr-1',
  name: 'Dafin Ramadhan',
  email: 'dafin.ramadhan@panglima.id',
  role: 'user',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  joinedDate: '2026-01-15',
  trainingStreakDays: 12,
  totalWorkoutsThisMonth: 16,
  totalVolumeThisMonthKg: 42800,
  sbdTotalKg: 430,
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

export const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'usr-admin-1',
  name: 'Administrator Gym PANGLIMA',
  email: 'admin@panglima.id',
  role: 'admin',
  avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
  joinedDate: '2025-11-01',
  trainingStreakDays: 30,
  totalWorkoutsThisMonth: 25,
  totalVolumeThisMonthKg: 75000,
  sbdTotalKg: 550,
  personalRecords: {},
  bodyProgressHistory: []
};

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onCancel,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      // Check if user profile already exists in Firestore
      let existingProfile = await getUserProfileFromFirestore(fbUser.uid);

      if (!existingProfile) {
        existingProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Member PANGLIMA',
          email: fbUser.email || '',
          role: 'user',
          avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          joinedDate: new Date().toISOString().split('T')[0],
          trainingStreakDays: 1,
          totalWorkoutsThisMonth: 0,
          totalVolumeThisMonthKg: 0,
          sbdTotalKg: 0,
          personalRecords: {},
          bodyProgressHistory: [],
        };
        await saveUserProfileToFirestore(existingProfile);
      }

      setSuccessMessage('Login Google berhasil!');
      setTimeout(() => {
        onLoginSuccess(existingProfile!);
      }, 500);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setErrorMessage(err.message || 'Gagal login dengan Google. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail || !loginPassword) {
      setErrorMessage('Silakan isi email dan password.');
      return;
    }

    setIsSubmitting(true);
    const cleanEmail = loginEmail.trim();

    try {
      const creds = await signInWithEmailAndPassword(auth, cleanEmail, loginPassword);
      const fbUser = creds.user;

      let profile = await getUserProfileFromFirestore(fbUser.uid);
      if (!profile) {
        const isAdmin = cleanEmail.toLowerCase().includes('admin');
        profile = {
          id: fbUser.uid,
          name: fbUser.displayName || (isAdmin ? 'Admin PANGLIMA' : 'Member PANGLIMA'),
          email: cleanEmail,
          role: isAdmin ? 'admin' : 'user',
          avatarUrl: isAdmin 
            ? 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          joinedDate: new Date().toISOString().split('T')[0],
          trainingStreakDays: 1,
          totalWorkoutsThisMonth: 0,
          totalVolumeThisMonthKg: 0,
          sbdTotalKg: 0,
          personalRecords: {},
          bodyProgressHistory: [],
        };
        await saveUserProfileToFirestore(profile);
      }

      setSuccessMessage('Login berhasil! Mengalihkan...');
      setTimeout(() => {
        onLoginSuccess(profile!);
      }, 600);
    } catch (err: any) {
      console.warn('Firebase login fallback check:', err);
      // Fallback local check for default accounts if auth user not created yet
      if (cleanEmail.toLowerCase() === 'admin@panglima.id' && loginPassword === 'adminpanglima') {
        setSuccessMessage('Login Admin berhasil!');
        setTimeout(() => {
          onLoginSuccess(DEFAULT_ADMIN_USER);
        }, 500);
        return;
      }

      if (cleanEmail.toLowerCase() === 'dafin.ramadhan@panglima.id' && loginPassword === '123456') {
        setSuccessMessage('Login Member berhasil!');
        setTimeout(() => {
          onLoginSuccess(DEFAULT_MEMBER_USER);
        }, 500);
        return;
      }

      setErrorMessage('Login gagal: ' + (err.message || 'Email atau password salah.'));
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName || !regEmail || !regPassword) {
      setErrorMessage('Semua bidang pendaftaran wajib diisi.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    const cleanEmail = regEmail.trim();

    try {
      const creds = await createUserWithEmailAndPassword(auth, cleanEmail, regPassword);
      const fbUser = creds.user;
      const detectedRole: Role = regPassword === 'adminpanglima' ? 'admin' : 'user';

      const newUser: UserProfile = {
        id: fbUser.uid,
        name: regName.trim(),
        email: cleanEmail,
        role: detectedRole,
        avatarUrl: detectedRole === 'admin' 
          ? 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        joinedDate: new Date().toISOString().split('T')[0],
        trainingStreakDays: 1,
        totalWorkoutsThisMonth: 0,
        totalVolumeThisMonthKg: 0,
        sbdTotalKg: 0,
        personalRecords: {},
        bodyProgressHistory: [],
      };

      await saveUserProfileToFirestore(newUser);
      setSuccessMessage('Akun Firebase berhasil dibuat!');

      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 800);
    } catch (err: any) {
      console.error('Firebase register error:', err);
      setErrorMessage('Gagal membuat akun: ' + (err.message || 'Email mungkin sudah digunakan.'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-zinc-950">
      <div className="w-full max-w-md space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-zinc-950 mx-auto flex items-center justify-center shadow-lg border border-amber-400">
            <Dumbbell className="w-7 h-7 stroke-[2.5] -rotate-12" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="font-extrabold text-2xl tracking-tight text-zinc-100">
                PANGLIMA
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                FIREBASE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              Gym Progress Tracker & Powerlifting Overload
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-4 shadow-sm">
          {/* Google Quick Login Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-700 text-zinc-100 font-bold text-xs transition-colors flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            <span>Masuk Cepat dengan Google</span>
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="h-px bg-zinc-800 flex-1" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              atau via Email
            </span>
            <div className="h-px bg-zinc-800 flex-1" />
          </div>

          {/* Tab Switcher: Login vs Register */}
          <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-amber-500 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk (Login)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-amber-500 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 animate-pulse" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleManualLogin} noValidate className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Email Terdaftar
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Akun PANGLIMA</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="budi@gmail.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Kata Sandi (Password minimal 6 karakter) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Daftar & Buat Akun Firebase</span>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Tutup / Batal
          </button>
        )}
      </div>
    </div>
  );
};

