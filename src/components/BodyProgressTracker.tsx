import React, { useState } from 'react';
import { 
  Scale, 
  Percent, 
  BicepsFlexed, 
  Upload, 
  Plus, 
  TrendingDown, 
  Calendar, 
  Camera, 
  Sparkles,
  ArrowRightLeft,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { BodyProgressLog, UserProfile } from '../types';

interface BodyProgressTrackerProps {
  user: UserProfile;
  onAddBodyProgress: (log: BodyProgressLog) => void;
  onOpenAIWithContext: (prompt: string) => void;
}

export const BodyProgressTracker: React.FC<BodyProgressTrackerProps> = ({
  user,
  onAddBodyProgress,
  onOpenAIWithContext,
}) => {
  const [weightInput, setWeightInput] = useState<string>('');
  const [bodyFatInput, setBodyFatInput] = useState<string>('');
  const [muscleMassInput, setMuscleMassInput] = useState<string>('');
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // Side by Side comparison state
  const [compareLogBefore, setCompareLogBefore] = useState<BodyProgressLog | null>(null);
  const [compareLogAfter, setCompareLogAfter] = useState<BodyProgressLog | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  const rawHistory = user.bodyProgressHistory || [];
  const sortedHistory = [...rawHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightInput) return;

    const newLog: BodyProgressLog = {
      id: `bp-${Date.now()}`,
      userId: user.id,
      date: new Date().toISOString().split('T')[0],
      weightKg: parseFloat(weightInput),
      bodyFatPercentage: bodyFatInput ? parseFloat(bodyFatInput) : undefined,
      muscleMassKg: muscleMassInput ? parseFloat(muscleMassInput) : undefined,
      photoUrl: photoPreviewUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400',
      notes: notesInput,
    };

    onAddBodyProgress(newLog);

    // Reset form
    setWeightInput('');
    setBodyFatInput('');
    setMuscleMassInput('');
    setPhotoPreviewUrl('');
    setNotesInput('');
    setIsFormOpen(false);
  };

  const dateCounts: Record<string, number> = {};
  sortedHistory.forEach((log) => {
    dateCounts[log.date] = (dateCounts[log.date] || 0) + 1;
  });

  const currentCounts: Record<string, number> = {};

  const chartData = sortedHistory.map((log, index) => {
    const prevWeightLog = index > 0 ? sortedHistory[index - 1] : null;
    const weightDiff = prevWeightLog ? Number((log.weightKg - prevWeightLog.weightKg).toFixed(1)) : 0;

    let prevBfLog: BodyProgressLog | null = null;
    for (let i = index - 1; i >= 0; i--) {
      if (sortedHistory[i].bodyFatPercentage !== undefined && sortedHistory[i].bodyFatPercentage !== null) {
        prevBfLog = sortedHistory[i];
        break;
      }
    }

    const hasBf = log.bodyFatPercentage !== undefined && log.bodyFatPercentage !== null;
    const bfDiff = (hasBf && prevBfLog && prevBfLog.bodyFatPercentage !== undefined)
      ? Number((log.bodyFatPercentage! - prevBfLog.bodyFatPercentage!).toFixed(1))
      : 0;

    const dateStr = log.date;
    currentCounts[dateStr] = (currentCounts[dateStr] || 0) + 1;
    const countOnDate = currentCounts[dateStr];
    const totalOnDate = dateCounts[dateStr];

    const dateObj = new Date(log.date);
    const formattedShortDate = isNaN(dateObj.getTime())
      ? log.date
      : dateObj.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
    let formattedFullDate = isNaN(dateObj.getTime())
      ? log.date
      : dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    if (totalOnDate > 1) {
      formattedFullDate += ` (Catatan #${countOnDate})`;
    }

    const prevWeightDate = prevWeightLog && !isNaN(new Date(prevWeightLog.date).getTime())
      ? new Date(prevWeightLog.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      : prevWeightLog?.date || '';

    const prevBfDate = prevBfLog && !isNaN(new Date(prevBfLog.date).getTime())
      ? new Date(prevBfLog.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      : prevBfLog?.date || '';

    return {
      chartKey: log.id || `bp-log-${index}`,
      date: formattedShortDate,
      fullDate: formattedFullDate,
      weight: log.weightKg,
      hasPrevWeight: Boolean(prevWeightLog),
      prevWeight: prevWeightLog?.weightKg || null,
      prevWeightDate,
      weightDiff,
      bodyFat: hasBf ? log.bodyFatPercentage : null,
      hasPrevBf: Boolean(prevBfLog),
      prevBf: prevBfLog?.bodyFatPercentage || null,
      prevBfDate,
      bfDiff,
      muscleMass: log.muscleMassKg || null,
    };
  });

  const latest = sortedHistory[sortedHistory.length - 1];
  const earliest = sortedHistory[0];

  const weightChange = latest && earliest ? (latest.weightKg - earliest.weightKg).toFixed(1) : '0';
  const bfChange = latest?.bodyFatPercentage && earliest?.bodyFatPercentage
    ? (latest.bodyFatPercentage - earliest.bodyFatPercentage).toFixed(1)
    : '0';

  const CustomWeightTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hasPrev = data.hasPrevWeight;
      const diff = data.weightDiff;
      return (
        <div className="bg-zinc-950 border-2 border-emerald-500 rounded-xl p-3 shadow-2xl space-y-1.5 min-w-[200px]">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide border-b border-zinc-800/80 pb-1">
            {data.fullDate || data.date}
          </p>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-zinc-400 font-medium">Berat Badan:</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-emerald-400">{data.weight}</span>
              <span className="text-xs font-bold text-zinc-300">kg</span>
            </div>
          </div>

          {hasPrev ? (
            <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">vs {data.prevWeightDate} ({data.prevWeight}kg):</span>
              <span className={`font-bold ${diff > 0 ? "text-amber-400" : diff < 0 ? "text-emerald-400" : "text-zinc-400"}`}>
                {diff > 0 ? `+${diff} kg` : diff < 0 ? `${diff} kg` : '0 kg (Tetap)'}
              </span>
            </div>
          ) : (
            <div className="pt-1 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-semibold italic">
              Catatan berat badan pertama
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomBodyFatTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hasPrev = data.hasPrevBf;
      const diff = data.bfDiff;
      if (data.bodyFat === null || data.bodyFat === undefined) return null;

      return (
        <div className="bg-zinc-950 border-2 border-cyan-500 rounded-xl p-3 shadow-2xl space-y-1.5 min-w-[200px]">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide border-b border-zinc-800/80 pb-1">
            {data.fullDate || data.date}
          </p>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-zinc-400 font-medium">Body Fat:</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-cyan-400">{data.bodyFat}</span>
              <span className="text-xs font-bold text-zinc-300">%</span>
            </div>
          </div>

          {hasPrev ? (
            <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">vs {data.prevBfDate} ({data.prevBf}%):</span>
              <span className={`font-bold ${diff > 0 ? "text-amber-400" : diff < 0 ? "text-cyan-400" : "text-zinc-400"}`}>
                {diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : '0% (Tetap)'}
              </span>
            </div>
          ) : (
            <div className="pt-1 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-semibold italic">
              Catatan body fat pertama
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800 p-4 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <span>Body Progress & Composition</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitor berat badan, persentase body fat, massa otot & foto perkembangan
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-3.5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{isFormOpen ? 'Tutup Form' : 'Catat Baru'}</span>
        </button>
      </div>

      {/* Logging Form Drawer / Card */}
      {isFormOpen && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-zinc-900 rounded-2xl border border-emerald-500/40 p-4 space-y-4 shadow-xl animate-in zoom-in-95 duration-200"
        >
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Form Catatan Body Progress Baru</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Berat Badan (kg) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="75.0"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-[11px] text-zinc-500 font-medium">kg</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Persentase Body Fat (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={bodyFatInput}
                  onChange={(e) => setBodyFatInput(e.target.value)}
                  placeholder="16.5"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-[11px] text-zinc-500 font-medium">%</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Massa Otot / Muscle Mass (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={muscleMassInput}
                  onChange={(e) => setMuscleMassInput(e.target.value)}
                  placeholder="36.0"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-[11px] text-zinc-500 font-medium">kg</span>
              </div>
            </div>
          </div>

          {/* Photo Upload Area */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
              Foto Progress (Opsional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 font-medium cursor-pointer transition-colors">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Unggah Foto Progress</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {photoPreviewUrl && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-emerald-500">
                  <img src={photoPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
              Catatan Perkembangan
            </label>
            <input
              type="text"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Catatan kondisi badan (misal: perut lebih ramping, lingkar lengan bertambah)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-500 text-zinc-950 font-extrabold text-xs shadow-lg hover:bg-emerald-400 transition-colors"
          >
            Simpan Catatan Body Progress
          </button>
        </form>
      )}

      {/* Progress Metrics Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-3.5 text-center shadow-md">
          <span className="text-[11px] text-zinc-400 font-medium flex items-center justify-center gap-1">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span>Berat</span>
          </span>
          <p className="text-lg font-black text-zinc-100 mt-1">
            {latest?.weightKg || '-'} <span className="text-xs font-normal text-zinc-400">kg</span>
          </p>
          <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
            {Number(weightChange) <= 0 ? `${weightChange} kg` : `+${weightChange} kg`}
          </span>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-3.5 text-center shadow-md">
          <span className="text-[11px] text-zinc-400 font-medium flex items-center justify-center gap-1">
            <Percent className="w-3.5 h-3.5 text-cyan-400" />
            <span>Body Fat</span>
          </span>
          <p className="text-lg font-black text-zinc-100 mt-1">
            {latest?.bodyFatPercentage || '-'} <span className="text-xs font-normal text-zinc-400">%</span>
          </p>
          <span className="text-[10px] text-cyan-400 font-bold block mt-0.5">
            {Number(bfChange) <= 0 ? `${bfChange}%` : `+${bfChange}%`}
          </span>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-3.5 text-center shadow-md">
          <span className="text-[11px] text-zinc-400 font-medium flex items-center justify-center gap-1">
            <BicepsFlexed className="w-3.5 h-3.5 text-orange-400" />
            <span>Massa Otot</span>
          </span>
          <p className="text-lg font-black text-zinc-100 mt-1">
            {latest?.muscleMassKg || '-'} <span className="text-xs font-normal text-zinc-400">kg</span>
          </p>
          <span className="text-[10px] text-orange-400 font-bold block mt-0.5">
            Target Hipertrofi
          </span>
        </div>
      </div>

      {/* Interactive Recharts Graph - Separated into Weight & Body Fat */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 shadow-lg space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span>Grafik Perkembangan Komposisi Tubuh</span>
            </h2>
            <p className="text-[11px] text-zinc-400">Terpisah untuk pembacaan angka &amp; selisih yang lebih jelas saat disentuh</p>
          </div>
        </div>

        {/* 1. GRAFIK BERAT BADAN (ATAS) */}
        <div className="bg-zinc-950/70 rounded-xl border border-zinc-800/80 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              <span>1. Grafik Berat Badan (kg)</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">
              Sentuh titik untuk lihat detail &amp; selisih
            </span>
          </div>

          <div className="h-44 w-full pt-1">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="chartKey" 
                    tickFormatter={(val) => chartData.find((d) => d.chartKey === val)?.date || val} 
                    stroke="#71717a" 
                    fontSize={11} 
                    tickLine={false} 
                  />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    content={<CustomWeightTooltip />} 
                    cursor={{ stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    name="Berat Badan (kg)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#10b981', stroke: '#042f2e', strokeWidth: 2 }}
                    activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 3, fill: '#18181b' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full bg-zinc-950/70 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center p-4 text-center space-y-2">
                <Scale className="w-8 h-8 text-zinc-600" />
                <p className="text-xs font-semibold text-zinc-300">Belum Ada Data Berat Badan</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. GRAFIK BODY FAT (BAWAH) */}
        <div className="bg-zinc-950/70 rounded-xl border border-zinc-800/80 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Percent className="w-4 h-4" />
              <span>2. Grafik Persentase Body Fat (%)</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">
              Sentuh titik untuk lihat detail &amp; selisih
            </span>
          </div>

          <div className="h-44 w-full pt-1">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="chartKey" 
                    tickFormatter={(val) => chartData.find((d) => d.chartKey === val)?.date || val} 
                    stroke="#71717a" 
                    fontSize={11} 
                    tickLine={false} 
                  />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    content={<CustomBodyFatTooltip />} 
                    cursor={{ stroke: '#06b6d4', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bodyFat"
                    name="Body Fat (%)"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#06b6d4', stroke: '#083344', strokeWidth: 2 }}
                    activeDot={{ r: 8, stroke: '#06b6d4', strokeWidth: 3, fill: '#18181b' }}
                    connectNulls
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full bg-zinc-950/70 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center p-4 text-center space-y-2">
                <Percent className="w-8 h-8 text-zinc-600" />
                <p className="text-xs font-semibold text-zinc-300">Belum Ada Data Body Fat</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Comparison Action Button */}
      {sortedHistory.length >= 2 && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-zinc-950 border border-emerald-800/60 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Komparasi Foto Progress (Sebelum vs Sesudah)
            </h3>
            <p className="text-xs text-zinc-300 mt-0.5">
              Bandingkan bentuk fisik dari dua tanggal berbeda secara berdampingan.
            </p>
          </div>
          <button
            onClick={() => {
              setCompareLogBefore(sortedHistory[0]);
              setCompareLogAfter(sortedHistory[sortedHistory.length - 1]);
              setIsCompareModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs shadow hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Bandingkan Foto</span>
          </button>
        </div>
      )}

      {/* History Log Timeline Gallery */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 shadow-lg space-y-3">
        <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Riwayat Log & Galeri Foto Progress</span>
        </h2>

        <div className="space-y-3">
          {sortedHistory.slice().reverse().map((log) => (
            <div
              key={log.id}
              className="bg-zinc-950 rounded-xl p-3 border border-zinc-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                {log.photoUrl ? (
                  <img
                    src={log.photoUrl}
                    alt="Progress"
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-800 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                    <Camera className="w-6 h-6" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-100">{log.weightKg} kg</span>
                    {log.bodyFatPercentage && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {log.bodyFatPercentage}% BF
                      </span>
                    )}
                    {log.muscleMassKg && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {log.muscleMassKg}kg Muscle
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {new Date(log.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  {log.notes && <p className="text-[11px] text-zinc-500 italic mt-0.5">"{log.notes}"</p>}
                </div>
              </div>

              <button
                onClick={() => {
                  const promptText = `Analisis perubahan body progress saya: Berat ${log.weightKg}kg, Body Fat ${log.bodyFatPercentage || 'N/A'}%, Massa Otot ${log.muscleMassKg || 'N/A'}kg. Apakah tren perubahan fisik saya sudah bagus?`;
                  onOpenAIWithContext(promptText);
                }}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-cyan-500/20 text-zinc-400 hover:text-cyan-400 border border-zinc-800 transition-colors shrink-0"
                title="Minta Evaluasi AI untuk Log Ini"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SIDE BY SIDE PHOTO COMPARISON MODAL */}
      {isCompareModalOpen && compareLogBefore && compareLogAfter && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Komparasi Visual (Sebelum vs Sesudah)</h3>
                <p className="text-[11px] text-zinc-400">Melihat transformasi fisik dari waktu ke waktu</p>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Before Photo */}
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-center space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Awal ({compareLogBefore.date})
                </span>
                <img
                  src={compareLogBefore.photoUrl || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=400'}
                  alt="Awal"
                  className="w-full h-48 object-cover rounded-lg border border-zinc-800"
                />
                <p className="text-xs font-bold text-zinc-200">{compareLogBefore.weightKg} kg</p>
                <p className="text-[10px] text-zinc-400">{compareLogBefore.bodyFatPercentage || '-'}% Body Fat</p>
              </div>

              {/* After Photo */}
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-center space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Terbaru ({compareLogAfter.date})
                </span>
                <img
                  src={compareLogAfter.photoUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400'}
                  alt="Terbaru"
                  className="w-full h-48 object-cover rounded-lg border border-zinc-800"
                />
                <p className="text-xs font-bold text-zinc-200">{compareLogAfter.weightKg} kg</p>
                <p className="text-[10px] text-zinc-400">{compareLogAfter.bodyFatPercentage || '-'}% Body Fat</p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCompareModalOpen(false);
                onOpenAIWithContext(
                  `Evaluasi perbandingan body progress saya dari ${compareLogBefore.weightKg}kg (${compareLogBefore.date}) ke ${compareLogAfter.weightKg}kg (${compareLogAfter.date}). Berikan feedback apresiatif & saran pemeliharaan.`
                );
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-zinc-950 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Minta Analisis Perubahan Fisik dari PANGLIMA AI</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
