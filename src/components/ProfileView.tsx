import React, { useState, useRef } from 'react';
import { 
  LogOut, 
  Camera, 
  Upload, 
  Check, 
  X, 
  Image as ImageIcon, 
  Link as LinkIcon,
  Sparkles
} from 'lucide-react';
import { UserProfile, Role } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  currentRole?: Role;
  onToggleRole?: () => void;
  onNavigateTab?: (tab: 'workout' | 'ranking') => void;
  onLogout: () => void;
  onUpdateAvatar?: (newAvatarUrl: string) => void;
}

const PRESET_AVATARS = [
  { id: 1, name: 'Cartoon Gym Bro', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GymBro&backgroundColor=ffdfbf,b6e3f4' },
  { id: 2, name: 'Power Lifter', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Powerlifter&backgroundColor=b6e3f4,c0aede' },
  { id: 3, name: 'Cool Athlete', url: 'https://api.dicebear.com/7.x/micah/svg?seed=CoolAthlete&backgroundColor=ffd5dc,d1d4f9' },
  { id: 4, name: 'Iron Beast', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=IronBeast&backgroundColor=c0aede,ffdfbf' },
  { id: 5, name: 'Anime Fighter', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=AnimeFighter&backgroundColor=ffd5dc,ffdfbf' },
  { id: 6, name: 'Happy Lifter', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=HappyLifter&backgroundColor=b6e3f4,ffd5dc' },
  { id: 7, name: 'Super Champion', url: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=SuperChamp&backgroundColor=ffdfbf,c0aede' },
  { id: 8, name: 'Emoji Monster', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=GymMonster&backgroundColor=ffd5dc,b6e3f4' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onLogout,
  onUpdateAvatar,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user.avatarUrl);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenModal = () => {
    setSelectedAvatar(user.avatarUrl);
    setCustomUrl('');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Harap pilih file gambar (JPG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5MB');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyAvatar = () => {
    let finalUrl = selectedAvatar;
    if (activeTab === 'url' && customUrl.trim()) {
      finalUrl = customUrl.trim();
    }

    if (!finalUrl) return;

    if (onUpdateAvatar) {
      onUpdateAvatar(finalUrl);
    }

    setIsModalOpen(false);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Toast Success Notification */}
      {showSuccessToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-zinc-950 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 font-bold text-xs animate-in fade-in slide-in-from-top-3 border border-emerald-300">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Foto profil berhasil diperbarui!</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800/90 p-6 shadow-sm text-center relative overflow-hidden">
        {/* Avatar Container with Camera Overlay */}
        <div className="relative w-24 h-24 mx-auto group">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-amber-500/80 shadow transition-transform group-hover:scale-105"
          />

          <button
            onClick={handleOpenModal}
            title="Ubah Foto Profil"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow border-2 border-zinc-900 transition-all hover:scale-110"
          >
            <Camera className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <button
          onClick={handleOpenModal}
          className="mt-3 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Ganti Foto Profil</span>
        </button>

        <h1 className="text-lg font-extrabold text-zinc-100 mt-3">{user.name}</h1>
        <p className="text-xs text-zinc-400 font-medium">{user.email}</p>

        {/* Account Controls */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80">
          <button
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 text-red-400 text-xs font-extrabold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun (Logout)</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Photo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-zinc-100">Ubah Foto Profil</h2>
            </div>

            {/* Preview Selected Photo */}
            <div className="text-center bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
              <div className="relative w-20 h-20 mx-auto">
                <img
                  src={activeTab === 'url' && customUrl.trim() ? customUrl : selectedAvatar}
                  alt="Pratinjau Foto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = user.avatarUrl;
                  }}
                  className="w-20 h-20 rounded-full object-cover border-2 border-amber-500/80 shadow-md"
                />
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Pratinjau Foto Profil Baru</p>
            </div>

            {/* Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'upload'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>

              <button
                onClick={() => setActiveTab('presets')}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'presets'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Preset</span>
              </button>

              <button
                onClick={() => setActiveTab('url')}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'url'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>URL</span>
              </button>
            </div>

            {/* Tab 1: Upload File */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 hover:border-amber-500/70 bg-zinc-950/60 rounded-xl p-6 text-center cursor-pointer transition-colors space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-200">
                      Klik untuk Pilih Foto dari Perangkat
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Format: PNG, JPG, GIF, WebP (Maksimal 5MB)
                    </p>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-center">
                    {uploadError}
                  </p>
                )}
              </div>
            )}

            {/* Tab 2: Preset Gallery */}
            {activeTab === 'presets' && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">Pilih salah satu avatar standar:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedAvatar(preset.url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all p-2 flex flex-col items-center justify-center text-center group ${
                        selectedAvatar === preset.url
                          ? 'border-amber-500 bg-amber-500/10 scale-105'
                          : 'border-zinc-800 hover:border-zinc-600 bg-zinc-950/80'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-14 h-14 object-contain rounded-full bg-zinc-900/80 p-0.5 border border-zinc-800/80"
                      />
                      <span className="text-[10px] font-bold text-zinc-300 mt-1.5 truncate max-w-full">
                        {preset.name}
                      </span>
                      {selectedAvatar === preset.url && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: URL Link */}
            {activeTab === 'url' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300 block">
                  Tempelkan (Paste) Link URL Gambar:
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://example.com/foto.jpg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-zinc-500">
                  Pastikan link gambar dapat diakses publik.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
              >
                Batal
              </button>

              <button
                onClick={handleApplyAvatar}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Simpan Foto</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


