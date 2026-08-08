import React, { useState } from 'react';
import { 
  ShieldAlert, 
  User, 
  Lock,
  CheckCircle2, 
  ArrowRight,
  Loader2,
  KeyRound,
  UserPlus,
  LogIn,
  X,
  ShieldCheck,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserProfile } from '../types';
import { saveUserProfileToFirestore } from '../services/firebaseService';
import { saveRegisteredAccount, getRegisteredAccounts } from '../utils/storage';
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
  email: '',
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
  initialMode = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);
  
  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Admin Code Modal State
  const [showAdminCodeModal, setShowAdminCodeModal] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [adminCodeError, setAdminCodeError] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Switch Tab Handler
  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Open Admin Modal
  const handleOpenAdminModal = () => {
    setAdminCodeInput('');
    setAdminCodeError('');
    setShowAdminCodeModal(true);
  };

  // Verify Admin Code
  const handleVerifyAdminCode = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCodeError('');

    if (!adminCodeInput.trim()) {
      setAdminCodeError('Harap masukkan kode admin.');
      return;
    }

    if (adminCodeInput.trim().toLowerCase() === 'panglima') {
      setIsSubmitting(true);
      setShowAdminCodeModal(false);
      setSuccessMessage('Kode Admin Terverifikasi! Mengalihkan ke Dashboard Admin...');
      setTimeout(() => {
        onLoginSuccess(DEFAULT_ADMIN_USER);
      }, 400);
    } else {
      setAdminCodeError('Kode Admin salah! Silakan periksa kembali.');
    }
  };

  // Login Submit Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanUsername = loginUsername.trim();
    const cleanPassword = loginPassword;

    if (!cleanUsername) {
      setErrorMessage('Silakan masukkan username Anda.');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Silakan masukkan password Anda.');
      return;
    }

    // Admin shortcut login -> trigger admin code verification modal
    if (cleanUsername.toLowerCase() === 'admin') {
      handleOpenAdminModal();
      return;
    }

    setIsSubmitting(true);

    // Check registered accounts in local storage
    const registered = getRegisteredAccounts();
    const foundAcc = registered.find(
      (acc) =>
        (acc.username && acc.username.trim().toLowerCase() === cleanUsername.toLowerCase()) ||
        (acc.email && acc.email.trim().toLowerCase() === cleanUsername.toLowerCase())
    );

    if (foundAcc && foundAcc.userProfile) {
      // Check if password matches OR if account was affected by password overwrite ('123456')
      if (foundAcc.password === cleanPassword) {
        setSuccessMessage(`Selamat datang kembali, ${foundAcc.userProfile.name}!`);
        setTimeout(() => {
          onLoginSuccess(foundAcc.userProfile);
        }, 400);
        return;
      } else if (foundAcc.password === '123456') {
        // Auto-repair password update
        saveRegisteredAccount(
          foundAcc.username,
          foundAcc.email,
          cleanPassword,
          foundAcc.userProfile
        );
        setSuccessMessage(`Selamat datang kembali, ${foundAcc.userProfile.name}!`);
        setTimeout(() => {
          onLoginSuccess(foundAcc.userProfile);
        }, 400);
        return;
      }
    }

    // If account not found or wrong password
    setIsSubmitting(false);
    setErrorMessage('Username atau password salah. Jika belum punya akun, klik "Daftar Akun".');
  };

  // Register Submit Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanUsername = regUsername.trim();
    const password = regPassword;
    const confirmPassword = regConfirmPassword;

    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage('Username minimal harus 3 karakter.');
      return;
    }

    if (!password || password.length < 3) {
      setErrorMessage('Password minimal harus 3 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password & Konfirmasi Password tidak cocok.');
      return;
    }

    setIsSubmitting(true);

    // Check if username already exists
    const registered = getRegisteredAccounts();
    const isTaken = registered.some(
      (acc) => acc.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (isTaken || cleanUsername.toLowerCase() === 'admin') {
      setIsSubmitting(false);
      setErrorMessage('Username sudah terdaftar. Gunakan username lain atau lakukan Login.');
      return;
    }

    // Create new User Profile
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: cleanUsername,
      email: `${cleanUsername.toLowerCase().replace(/\s+/g, '')}@panglima.local`,
      role: 'user',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      joinedDate: new Date().toISOString().split('T')[0],
      trainingStreakDays: 1,
      totalWorkoutsThisMonth: 0,
      totalVolumeThisMonthKg: 0,
      sbdTotalKg: 0,
      personalRecords: {},
      bodyProgressHistory: [],
    };

    // Save to Firestore and Local Account Storage
    try {
      await saveUserProfileToFirestore(newUser);
    } catch (e) {
      console.warn('Firestore profile save notice:', e);
    }

    saveRegisteredAccount(cleanUsername, newUser.email, password, newUser);

    setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke dashboard...');
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-zinc-950 relative overflow-hidden">
      {/* Background Gym Image with Dark Gradients */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-referrer filter brightness-[0.3] contrast-125 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1920')`
        }}
      />
      
      {/* Dark Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/85 to-[#09090b]/70" />
      
      <div className="w-full max-w-sm space-y-5 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center">
          <PanglimaLogo size="lg" badge="GYM" />
        </div>

        {/* Clean Auth Card */}
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 space-y-4 shadow-2xl backdrop-blur-md">
          
          {/* Navigation Tabs: Login Akun / Daftar Akun */}
          <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800/80">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login Akun</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} noValidate className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-zinc-300">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Masukkan username Anda"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 font-medium placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-zinc-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-zinc-100 font-medium placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 p-0.5 transition-colors cursor-pointer"
                    title={showLoginPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                ) : (
                  <>
                    <span>Masuk Akun</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Admin Quick Login Shortcut */}
              <div className="pt-2 border-t border-zinc-800/80 flex justify-center">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleOpenAdminModal}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 hover:text-amber-400 transition-colors py-1 px-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Masuk sebagai Admin Gym</span>
                </button>
              </div>
            </form>
          ) : (
            /* TAB 2: REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-zinc-300">
                  Username / Nama Tampilan
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 font-medium placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-zinc-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Buat password akun"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-zinc-100 font-medium placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 p-0.5 transition-colors cursor-pointer"
                    title={showRegPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-zinc-300">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi password di atas"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-zinc-100 font-medium placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 p-0.5 transition-colors cursor-pointer"
                    title={showRegConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                ) : (
                  <>
                    <span>Daftar & Masuk</span>
                    <ArrowRight className="w-4 h-4" />
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
            className="w-full py-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Kembali ke Aplikasi</span>
          </button>
        )}
      </div>

      {/* ADMIN CODE VERIFICATION MODAL */}
      {showAdminCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-amber-500/40 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Verifikasi Kode Admin</h3>
                <p className="text-[11px] text-zinc-400">Akses khusus Administrator Gym</p>
              </div>
            </div>

            <form onSubmit={handleVerifyAdminCode} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Masukkan Kode Keamanan Admin:
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
                  <input
                    type={showAdminCode ? 'text' : 'password'}
                    autoFocus
                    required
                    value={adminCodeInput}
                    onChange={(e) => setAdminCodeInput(e.target.value)}
                    placeholder="Kode Admin"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-zinc-100 font-medium placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminCode(!showAdminCode)}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 p-0.5 transition-colors cursor-pointer"
                    title={showAdminCode ? 'Sembunyikan kode' : 'Tampilkan kode'}
                  >
                    {showAdminCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {adminCodeError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{adminCodeError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminCodeModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verifikasi & Masuk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



