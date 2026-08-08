import React, { useState } from 'react';
import { 
  ShieldAlert, 
  User, 
  Mail,
  CheckCircle2, 
  ArrowRight,
  Loader2,
  Check,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  auth, 
  googleProvider, 
  signInWithPopup 
} from '../lib/firebase';
import { saveUserProfileToFirestore, getUserProfileFromFirestore } from '../services/firebaseService';
import { saveRegisteredAccount } from '../utils/storage';
import { PanglimaLogo } from './PanglimaLogo';

interface AuthViewProps {
  onLoginSuccess: (user: UserProfile) => void;
  onCancel?: () => void;
  initialMode?: 'login' | 'register';
}

export const DEFAULT_MEMBER_USER: UserProfile = {
  id: 'usr-member-default',
  name: 'Member PANGLIMA',
  email: 'member@panglima.id',
  role: 'user',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  joinedDate: new Date().toISOString().split('T')[0],
  trainingStreakDays: 0,
  totalWorkoutsThisMonth: 0,
  totalVolumeThisMonthKg: 0,
  sbdTotalKg: 0,
  personalRecords: {},
  bodyProgressHistory: []
};

export const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'usr-admin-1',
  name: 'Administrator Gym PANGLIMA',
  email: 'admin@panglima.id',
  role: 'admin',
  avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
  joinedDate: new Date().toISOString().split('T')[0],
  trainingStreakDays: 0,
  totalWorkoutsThisMonth: 0,
  totalVolumeThisMonthKg: 0,
  sbdTotalKg: 0,
  personalRecords: {},
  bodyProgressHistory: []
};

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onCancel,
}) => {
  // Step state: 'google' -> 'username'
  const [step, setStep] = useState<'google' | 'username'>('google');
  
  // Pending profile after Google auth
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Direct Admin Login Handler
  const handleAdminSignIn = () => {
    setIsSubmitting(true);
    setSuccessMessage('Login Administrator Berhasil! Mengalihkan ke Dashboard Admin...');
    setTimeout(() => {
      onLoginSuccess(DEFAULT_ADMIN_USER);
    }, 500);
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      let existingProfile = await getUserProfileFromFirestore(fbUser.uid);

      if (!existingProfile) {
        const isAdminEmail = fbUser.email?.toLowerCase().includes('admin');
        existingProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || (isAdminEmail ? 'Administrator Gym' : 'Member PANGLIMA'),
          email: fbUser.email || '',
          role: isAdminEmail ? 'admin' : 'user',
          avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          joinedDate: new Date().toISOString().split('T')[0],
          trainingStreakDays: 1,
          totalWorkoutsThisMonth: 0,
          totalVolumeThisMonthKg: 0,
          sbdTotalKg: 0,
          personalRecords: {},
          bodyProgressHistory: [],
        };
      } else {
        if (fbUser.email) existingProfile.email = fbUser.email;
        if (fbUser.displayName) existingProfile.name = fbUser.displayName;
        if (fbUser.photoURL) existingProfile.avatarUrl = fbUser.photoURL;
      }

      // Save to Firestore and local storage
      try {
        await saveUserProfileToFirestore(existingProfile);
      } catch (e) {
        console.warn('Firestore save notice:', e);
      }
      saveRegisteredAccount(existingProfile.name, existingProfile.email || 'google-user', 'google-auth', existingProfile);

      setSuccessMessage(`Berhasil masuk sebagai ${existingProfile.email || existingProfile.name}!`);
      setIsSubmitting(false);

      setTimeout(() => {
        onLoginSuccess(existingProfile);
      }, 500);

    } catch (err: any) {
      console.warn('Google sign in notice:', err);

      // If user closed popup or popup was blocked, offer manual entry fallback
      const googleFallbackUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: 'Member PANGLIMA',
        email: '',
        role: 'user',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        joinedDate: new Date().toISOString().split('T')[0],
        trainingStreakDays: 0,
        totalWorkoutsThisMonth: 0,
        totalVolumeThisMonthKg: 0,
        sbdTotalKg: 0,
        personalRecords: {},
        bodyProgressHistory: [],
      };

      setPendingProfile(googleFallbackUser);
      setEmailInput('');
      setUsernameInput(googleFallbackUser.name);
      setStep('username');
      setIsSubmitting(false);
      setSuccessMessage('Popup Google ditutup. Silakan lengkapi email & username Anda di bawah.');
    }
  };

  // Submit Username Step
  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingProfile) return;

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanUsername = usernameInput.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Harap masukkan email pribadi yang valid.');
      return;
    }

    if (!cleanUsername) {
      setErrorMessage('Username tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const finalProfile: UserProfile = {
      ...pendingProfile,
      email: cleanEmail,
      name: cleanUsername,
    };

    try {
      await saveUserProfileToFirestore(finalProfile);
    } catch (err) {
      console.warn('Firestore profile save notice:', err);
    }

    saveRegisteredAccount(cleanUsername, cleanEmail, 'google-auth', finalProfile);

    setSuccessMessage('Data akun berhasil disimpan! Mengalihkan...');
    setTimeout(() => {
      onLoginSuccess(finalProfile);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-zinc-950 relative overflow-hidden">
      {/* Background Gym Image with Dark Gradients */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-referrer filter brightness-[0.35] contrast-125 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1920')`
        }}
      />
      
      {/* Dark Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-[#09090b]/60" />
      
      <div className="w-full max-w-sm space-y-6 relative z-10">
        
        {/* Minimalist Brand Header */}
        <div className="text-center flex flex-col items-center">
          <PanglimaLogo size="lg" badge="GYM" />
        </div>

        {/* Clean Auth Card */}
        <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 space-y-5 shadow-xl backdrop-blur-md">
          
          {/* STEP 1: GOOGLE ONLY LOGIN & ADMIN LINK */}
          {step === 'google' ? (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-sm font-bold text-zinc-200">
                  Masuk Akun
                </h2>
                <p className="text-xs text-zinc-400">
                  Gunakan Akun Google untuk melanjutkan
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs transition-colors flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                )}
                <span>{isSubmitting ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
              </button>

              {/* Divider & Admin / Manual Access Option */}
              <div className="pt-2 border-t border-zinc-800/80 flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    const manualUser: UserProfile = {
                      id: `usr-${Date.now()}`,
                      name: 'Member PANGLIMA',
                      email: '',
                      role: 'user',
                      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
                      joinedDate: new Date().toISOString().split('T')[0],
                      trainingStreakDays: 0,
                      totalWorkoutsThisMonth: 0,
                      totalVolumeThisMonthKg: 0,
                      sbdTotalKg: 0,
                      personalRecords: {},
                      bodyProgressHistory: [],
                    };
                    setPendingProfile(manualUser);
                    setEmailInput('');
                    setUsernameInput('Member PANGLIMA');
                    setStep('username');
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors py-1 px-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Atau Masuk dengan Email Manual</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleAdminSignIn}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 hover:text-amber-400 transition-colors py-1 px-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Masuk sebagai Admin Gym</span>
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: USERNAME & EMAIL SETUP */
            <form onSubmit={handleSaveUsername} noValidate className="space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold mb-1">
                  <Check className="w-3 h-3" /> Konfirmasi Akun
                </div>
                <h2 className="text-sm font-bold text-zinc-200">
                  Lengkapi Data Akun
                </h2>
                <p className="text-xs text-zinc-400">
                  Masukkan email pribadi & nama tampilan Anda
                </p>
              </div>

              {pendingProfile && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <img 
                    src={pendingProfile.avatarUrl} 
                    alt={pendingProfile.name}
                    className="w-9 h-9 rounded-full object-cover border border-amber-500/50 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{emailInput || pendingProfile.email || 'Email Pribadi'}</p>
                    <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                      {pendingProfile.role === 'admin' ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Admin Account
                        </span>
                      ) : (
                        'Akun Member Terverifikasi'
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-zinc-300">
                  Email Pribadi
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 font-medium placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-zinc-300">
                  Username / Nama Tampilan
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 font-medium placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('google')}
                  disabled={isSubmitting}
                  className="px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Lanjutkan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            Batal
          </button>
        )}
      </div>
    </div>
  );
};

