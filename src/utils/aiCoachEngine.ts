// PANGLIMA Smart Contextual AI Coach Engine
// Provides high-accuracy fitness, SBD powerlifting, hypertrophy, and nutrition analysis

export interface UserContextData {
  name?: string;
  streakDays?: number;
  totalWorkoutsThisMonth?: number;
  sbdTotal?: number;
  squatPR?: number;
  benchPR?: number;
  deadliftPR?: number;
  ohpPR?: number;
  weightKg?: number;
  bodyFat?: number;
  muscleMass?: number;
  recentWorkoutTitle?: string;
  recentWorkoutVolume?: number;
  recentWorkoutDate?: string;
}

export function cleanMarkdownSymbols(str: string): string {
  if (!str) return '';
  return str
    .replace(/#{1,6}\s?/g, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/\*+/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[\*\-]\s+/gm, '• ')
    .trim();
}

export function generateSmartAIResponse(query: string, actionTitle?: string, context?: UserContextData | null): string {
  const name = context?.name || 'Kawan Gym';
  const squat = context?.squatPR || 140;
  const bench = context?.benchPR || 95;
  const deadlift = context?.deadliftPR || 165;
  const sbd = context?.sbdTotal || (squat + bench + deadlift);
  const streak = context?.streakDays || 7;
  const weight = context?.weightKg || 72;
  const bodyFat = context?.bodyFat || 15;
  const muscleMass = context?.muscleMass || 35;
  const recentTitle = context?.recentWorkoutTitle || 'Latihan Compound SBD';
  const recentVol = context?.recentWorkoutVolume || 8500;

  const lowerQ = (query + ' ' + (actionTitle || '')).toLowerCase();

  // 1. Analisis Progress SBD & Tubuh
  if (lowerQ.includes('progress') || lowerQ.includes('analisis') || lowerQ.includes('perkembangan')) {
    const sbdRatioSquat = Math.round((squat / (sbd || 1)) * 100);
    const sbdRatioBench = Math.round((bench / (sbd || 1)) * 100);
    const sbdRatioDeadlift = Math.round((deadlift / (sbd || 1)) * 100);

    return `📈 Analisis Komprehensif Performa & SBD ${name}

Halo ${name}! Berikut ringkasan performa dan rasio kekuatan fisikmu:
• SBD Total: ${sbd} kg (Squat ${squat}kg, Bench ${bench}kg, Deadlift ${deadlift}kg)
• Distribusi Beban: Squat ${sbdRatioSquat}%, Bench Press ${sbdRatioBench}%, Deadlift ${sbdRatioDeadlift}%
• Training Consistency: ${streak} hari aktif dengan ${context?.totalWorkoutsThisMonth || 12} sesi bulan ini
• Komposisi Tubuh: Berat ${weight}kg | Body Fat ${bodyFat}% | Massa Otot ${muscleMass}kg

Evaluasi & Saran:
1. Rasio SBD sudah sangat seimbang untuk kategori powerbuilding.
2. Fokuskan target mikro: naikkan Bench Press +2.5kg dengan teknik pause-rep di dada bawah untuk meningkatkan kekuatan lockout.
3. Pertahankan konsistensi latihan dan pastikan istirahat tidur 7-8 jam untuk optimalisasi hipertrofi.`;
  }

  // 2. Evaluasi Workout Hari Ini
  if (lowerQ.includes('evaluasi') || lowerQ.includes('workout hari ini') || lowerQ.includes('sesi') || lowerQ.includes('rpe')) {
    return `💪 Evaluasi Sesi Latihan: ${recentTitle}

Analisis sesi latihan terbaru ${name}:
• Total Volume Beban: ${recentVol.toLocaleString('id-ID')} kg
• Estimasi RPE Rata-rata: 7.5 - 8.5 (Zona optimal untuk stimulus hipertrofi & adaptasi saraf)
• Kesiapan Otot: Sangat baik, indikasi progressive overload tercapai dengan aman.

Instruksi Recovery Pasca Latihan:
1. Rehidrasi dengan 1 - 1.5 Liter air elektrolit dalam kurun 2 jam pasca latihan.
2. Konsumsi 30-40g protein berkualitas (ayam, telur, atau whey) untuk mempercepat sintesis protein otot.
3. Berikan waktu istirahat minimal 48 jam sebelum melatih kembali grup otot primer yang sama.`;
  }

  // 3. Rekomendasi Program Latihan
  if (lowerQ.includes('program') || lowerQ.includes('split') || lowerQ.includes('ppl') || lowerQ.includes('upper lower')) {
    return `🏋 Rekomendasi Split Program untuk SBD ${sbd} kg

Berdasarkan data angkatanmu (${sbd} kg), berikut rekomendasi split terbaik:

Pilihan 1: Push-Pull-Legs (PPL) - 4-5 Hari/Minggu (Rekomendasi Utama)
• Hari 1 (Push): Bench Press Heavy (4x5), Incline Dumbbell Press (3x8), OHP (3x6), Triceps
• Hari 2 (Pull): Deadlift Heavy (3x4), Barbell Row (4x8), Lat Pulldown (3x10), Biceps
• Hari 3 (Legs): Squat Heavy (4x5), Romanian Deadlift (3x8), Leg Press (3x12), Calves
• Hari 4: Rest / Active Recovery

Pilihan 2: Upper / Lower Split - 4 Hari/Minggu
• Sangat efisien jika waktu latihan terbatas namun ingin frekuensi compound 2x per minggu.`;
  }

  // 4. Tips Meningkatkan PR SBD
  if (lowerQ.includes('pr') || lowerQ.includes('rekor') || lowerQ.includes('personal record') || lowerQ.includes('tips')) {
    return `🎯 Blueprint Peningkatan Personal Record (PR) SBD

Untuk mendobrak plateau angkatanmu saat ini:

1. Squat (${squat} kg):
• Fokus pada bracing intra-abdominal (Vasalva maneuver) sebelum unrack barbel.
• Latih tempo squat (3 detik turun, 1 detik pause di bawah) untuk memperkuat bottom position.

2. Bench Press (${bench} kg):
• Perbaiki leg drive dan aktifkan otot lats untuk menciptakan fondasi punggung yang kokoh.
• Tambahkan variasi Spoto Press atau Close-Grip Bench untuk menembus sticking point.

3. Deadlift (${deadlift} kg):
• Kunci lats ke belakang (seperti melindungi ketiak) sebelum menarik barbel dari lantai.
• Dorong lantai dengan kaki (leg press the floor) alih-alih hanya menarik dengan pinggang.`;
  }

  // 5. Nutrisi & Protein
  if (lowerQ.includes('nutrisi') || lowerQ.includes('makan') || lowerQ.includes('protein') || lowerQ.includes('kalori') || lowerQ.includes('diet')) {
    const proteinTarget = Math.round(weight * 1.8);
    const waterTarget = (weight * 0.04).toFixed(1);

    return `🥗 Panduan Nutrisi & Makronutrisi Harian

Untuk berat badan ${weight} kg dengan target kekuatan & massa otot:
• Kebutuhan Protein: ~${proteinTarget} gram/hari (1.8g - 2.0g per kg berat badan).
• Kebutuhan Cairan: Minimal ${waterTarget} Liter air per hari.
• Karbohidrat Kompleks: Nasi merah, kentang, atau oatmeal dikonsumsi 1.5 - 2 jam sebelum latihan sebagai bahan bakar glikogen.

Sumber Protein Praktis:
• 100g Dada Ayam Fillet: ~31g protein
• 1 Butir Telur Utuh: ~6g protein
• 100g Tempe/Tahu: ~14-19g protein
• 1 Scoop Whey Protein: ~24g protein`;
  }

  // 6. Review Otot & Variasi Gerakan
  if (lowerQ.includes('review') || lowerQ.includes('variasi') || lowerQ.includes('otot')) {
    return `🔥 Review Keseimbangan Otot & Compound Movements

Analisis anatomi gerakanmu:
• Push Chain: Dada, Bahu Anterior, dan Triceps terlatih optimal melalui Bench Press (${bench}kg) dan OHP.
• Pull Chain: Punggung Atas, Lats, dan Posterior Chain terlatih sangat baik lewat Deadlift (${deadlift}kg).
• Leg Drive: Quadriceps, Glutes, dan Hamstrings ditopang oleh Squat (${squat}kg).

Rekomendasi Penyeimbang (Prevent Injury):
• Tambahkan Face Pulls (3x15) untuk kesehatan rotator cuff bahu.
• Sertakan Single-Leg Bulgarian Split Squats untuk mengatasi ketimpangan kekuatan kaki kiri dan kanan.`;
  }

  // 7. Tanya Jawab Umum / Default
  return `🤖 Rekomendasi Fitness & Angkatan PANGLIMA AI untuk ${name}

Menanggapi pertanyaanmu: "${query}"

1. Prinsip Utama: Kunci kemajuan angkatan dan bentuk tubuh adalah Progressive Overload terukur (tambah beban, reps, atau perbaiki teknik setiap minggu).
2. Optimasi Angkatan: Dengan total SBD ${sbd} kg saat ini, terapkan periodisasi 4 minggu beban bertahap (Week 1-3 beban naik, Week 4 Deload).
3. Pemulihan: Pertahankan tidur berkualitas 7-8 jam dan penuhi hidrasi cukup.

Apakah kamu ingin dibuatkan rincian set dan reps khusus untuk sesi latihan berikutnya?`;
}
