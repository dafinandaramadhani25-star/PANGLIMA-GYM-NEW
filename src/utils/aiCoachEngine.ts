// PANGLIMA Smart Contextual AI Coach Engine v3.8
// Comprehensive Multi-Domain Fitness, Powerlifting (SBD), Bodybuilding, Nutrition & Recovery Intelligence

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

// Helper to normalize search query
function matchAny(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw.toLowerCase()));
}

export function generateSmartAIResponse(
  query: string,
  actionTitle?: string,
  context?: UserContextData | null
): string {
  const name = context?.name && context.name.trim() ? context.name.trim() : 'Kawan Gym';
  const squat = context?.squatPR && context.squatPR > 0 ? context.squatPR : 140;
  const bench = context?.benchPR && context.benchPR > 0 ? context.benchPR : 95;
  const deadlift = context?.deadliftPR && context.deadliftPR > 0 ? context.deadliftPR : 165;
  const ohp = context?.ohpPR && context.ohpPR > 0 ? context.ohpPR : 60;
  const sbd = context?.sbdTotal && context.sbdTotal > 0 ? context.sbdTotal : (squat + bench + deadlift);
  const streak = context?.streakDays || 5;
  const weight = context?.weightKg && context.weightKg > 0 ? context.weightKg : 72;
  const bodyFat = context?.bodyFat && context.bodyFat > 0 ? context.bodyFat : 15;
  const muscleMass = context?.muscleMass && context.muscleMass > 0 ? context.muscleMass : 35;
  const recentTitle = context?.recentWorkoutTitle || 'Latihan Compound SBD';
  const recentVol = context?.recentWorkoutVolume || 8200;

  const rawText = `${query} ${actionTitle || ''}`.toLowerCase();

  // ==========================================
  // 1. QUICK ACTIONS / TOP LEVEL ACTIONS
  // ==========================================
  if (matchAny(rawText, ['analisis progress saya', 'analisis progress', 'perkembangan fisik', 'analisis performa'])) {
    const sbdRatioSquat = Math.round((squat / (sbd || 1)) * 100);
    const sbdRatioBench = Math.round((bench / (sbd || 1)) * 100);
    const sbdRatioDeadlift = Math.round((deadlift / (sbd || 1)) * 100);

    return `📈 Analisis Komprehensif Performa & SBD ${name}

Halo ${name}! Berikut ringkasan performa dan rasio kekuatan fisikmu saat ini:
• SBD Total: ${sbd} kg (Squat ${squat}kg, Bench ${bench}kg, Deadlift ${deadlift}kg)
• Distribusi Beban: Squat ${sbdRatioSquat}%, Bench Press ${sbdRatioBench}%, Deadlift ${sbdRatioDeadlift}%
• Konsistensi: ${streak} hari streak dengan ${context?.totalWorkoutsThisMonth || 12} sesi latihan bulan ini
• Komposisi Tubuh: Berat ${weight}kg | Body Fat ${bodyFat}% | Massa Otot ${muscleMass}kg

Rekomendasi Utama:
1. Rasio kekuatanmu sangat solid untuk kategori intermediate powerbuilding.
2. Fokus jangka pendek: tingkatkan Bench Press ke ${bench + 2.5}kg dengan memperkuat jeda (pause) di dada.
3. Jaga asupan protein harian di kisaran ${Math.round(weight * 1.8)}g untuk mempertahankan progressive overload.`;
  }

  if (matchAny(rawText, ['evaluasi workout hari ini', 'evaluasi sesi', 'sesi latihan terbaru'])) {
    return `💪 Evaluasi Sesi Latihan: ${recentTitle}

Analisis sesi latihan terbaru untuk ${name}:
• Total Volume Beban: ${recentVol.toLocaleString('id-ID')} kg
• Estimasi RPE Sesi: 7.5 - 8.5 (Rentang ideal untuk stimulus hipertrofi dan kekuatan)
• Status Kesiapan Otot: Sangat baik, progressive overload tercapai dengan efektif.

Panduan Pemulihan Pasca Sesi:
1. Rehidrasi dengan 1 - 1.5 Liter air mineral atau elektrolit dalam 2 jam ke depan.
2. Konsumsi 30-40g protein (seperti dada ayam atau whey) untuk perbaikan jaringan myofibril otot.
3. Berikan jeda istirahat minimal 48 jam sebelum melatih grup otot yang sama dengan intensitas tinggi.`;
  }

  // ==========================================
  // 2. SUPLEMEN (CREATINE, WHEY, PRE-WORKOUT)
  // ==========================================
  if (matchAny(rawText, ['creatine', 'kreatin', 'monohydrate'])) {
    return `⚡ Panduan Lengkap Suplementasi Creatine

Halo ${name}, creatine monohydrate adalah suplemen paling terbukti secara ilmiah untuk meningkatkan kekuatan SBD dan volume otot:
• Dosis Ideal: 3 - 5 gram per hari setiap hari (bisa langsung tanpa fase loading 20g).
• Waktu Konsumsi: Bebas (paling optimal pasca latihan bersama karbohidrat untuk penyerapan maksimal).
• Cara Kerja: Meningkatkan simpanan phosphocreatine di sel otot untuk regenerasi ATP cepat saat angkat beban berat.
• Hal Penting: Minum air putih minimal 3.5 - 4 Liter sehari karena creatine menarik air ke dalam sel otot (intracellular hydration), bukan lemak.`;
  }

  if (matchAny(rawText, ['whey', 'protein powder', 'isolate', 'suplemen protein'])) {
    return `🥛 Panduan Konsumsi Whey Protein

Untuk target berat badanmu (${weight} kg):
• Fungsi Utama: Membantu mencapai target protein harian (${Math.round(weight * 1.8)} - ${Math.round(weight * 2.0)}g/hari) secara praktis.
• Waktu Terbaik: Pasca latihan (1 scoop ~24-27g protein) atau di sela jam makan sebagai snack tinggi protein.
• Whey Concentrate vs Isolate: Whey Concentrate sudah sangat bagus dan ekonomis; pilih Isolate jika kamu memiliki intoleransi laktosa ringan.`;
  }

  if (matchAny(rawText, ['pre workout', 'pre-workout', 'kafein', 'kopi sebelum gym', 'energi sebelum gym'])) {
    return `🔥 Panduan Penggunaan Pre-Workout & Kafein

Tips memaksimalkan fokus latihan ${name}:
• Waktu Minum: 30 - 45 menit sebelum sesi latihan dimulai agar kadar kafein mencapai puncaknya di darah.
• Dosis Aman: 150 - 250 mg kafein (setara 1 scoop pre-workout standar atau 1-2 cangkir kopi hitam tanpa gula).
• Tips Siklus (Cycling): Istirahatkan penggunaan selama 1 minggu setiap 6-8 minggu untuk menjaga sensitivitas reseptor adenosin otak.
• Hindari: Mengonsumsi pre-workout kurang dari 6 jam sebelum waktu tidur malam agar kualitas tidur dan regenerasi otot tidak terganggu.`;
  }

  // ==========================================
  // 3. ANATOMI & SPESIFIKASI OTOT
  // ==========================================
  // DADA (CHEST)
  if (matchAny(rawText, ['dada', 'chest', 'pectoral', 'incline bench', 'dada atas', 'dada bawah', 'push up', 'flyes'])) {
    return `🏋 Panduan Optimalisasi Otot Dada (Pectoralis Major & Minor)

Untuk membangun ketebalan dada yang proporsional bagi ${name}:
1. Dada Atas (Clavicular Head): Prioritaskan Incline Dumbbell Press (sudut bangku 30 derajat) 3-4 set x 6-10 repetisi.
2. Dada Tengah & Keseluruhan: Barbell Flat Bench Press (${bench} kg) dengan teknik tuck siku 45-60 derajat dan retraksi skapula.
3. Dada Bawah & Kontraksi Akhir: Cable Crossover atau Dips dengan condong badan ke depan 3 set x 10-15 repetisi.
• Tips Form: Kunci belikat (retract & depress scapula) ke belakang bangku agar beban sepenuhnya ditanggung otot dada, bukan sendi bahu depan.`;
  }

  // PUNGGUNG (BACK & LATS)
  if (matchAny(rawText, ['punggung', 'back', 'lats', 'sayap', 'pull up', 'lat pulldown', 'barbell row', 'traps', 'belikat'])) {
    return `🦅 Blueprint Membangun Punggung Lebar & Tebal (V-Taper)

Rekomendasi latihan punggung untuk menopang Deadlift (${deadlift} kg) milikmu:
1. Lebar Punggung (Lat Width): Lat Pulldown atau Weighted Pull-Ups 3-4 set x 6-10 reps (fokus tarik siku ke arah saku celana).
2. Ketebalan Punggung (Back Thickness): Chest-Supported T-Bar Row atau Barbell Row 3-4 set x 8-12 reps dengan jeda kontraksi 1 detik.
3. Punggung Bawah & Upper Traps: Deadlift compound dan Dumbbell Shrugs untuk kepadatan trap atas.
• Kunci Utama: Gunakan lifting straps jika genggaman tanganmu habis terlebih dahulu, agar otot lats bisa dilatih sampai failure.`;
  }

  // BAHU (SHOULDERS / DELTOIDS)
  if (matchAny(rawText, ['bahu', 'shoulder', 'deltoid', 'lateral raise', 'ohp', 'overhead press', 'rear delt', 'face pull'])) {
    return `🛡 Panduan Membentuk Bahu Bulat 3D & Sehat

Strategi latihan deltoid terstruktur untuk ${name}:
1. Bahu Depan (Anterior): Sudah terlatih kuat dari Overhead Press (${ohp} kg) dan Bench Press. Cukup 3 set OHP per sesi push.
2. Bahu Samping (Lateral - Kunci Bahu Lebar): Dumbbell Lateral Raise atau Cable Lateral Raise 4 set x 12-15 reps dengan kontrol eksentrik 2 detik.
3. Bahu Belakang & Rotator Cuff: Face Pulls dan Rear Delt Flyes 3-4 set x 15 reps untuk mencegah cedera bahu dan memperbaiki postur bungkuk.`;
  }

  // LENGAN (BICEPS, TRICEPS, FOREARMS)
  if (matchAny(rawText, ['bicep', 'tricep', 'lengan', 'tangan', 'arm', 'biceps', 'triceps', 'forearm', 'curls', 'skull crusher'])) {
    return `💪 Panduan Hipertrofi Lengan (Biceps & Triceps)

Tips menambah ukuran lingkar lengan:
1. Triceps (Menyumbang 60% Volume Lengan): Prioritaskan Overhead Cable Tricep Extension (melatih Long Head) dan Close-Grip Bench / Pushdowns 3-4 set x 8-12 reps.
2. Biceps (Peak & Ketebalan): Incline Dumbbell Curl (rentangan maksimal) dikombinasikan dengan Hammer Curl (melatih Brachialis & Brachioradialis) 3-4 set x 8-12 reps.
3. Forearms & Grip Strength: Farmer's Walk atau Wrist Curls untuk memperkuat pegangan Deadlift tanpa mudah lepas.`;
  }

  // KAKI (LEGS / QUADS / HAMSTRINGS / CALVES)
  if (matchAny(rawText, ['kaki', 'leg', 'legs', 'quads', 'hamstring', 'paha', 'betis', 'calves', 'leg press', 'bulgarian', 'rdl'])) {
    return `🦵 Blueprint Latihan Kaki Maksimal & Seimbang

Panduan latihan Lower Body untuk memaksimalkan Squat (${squat} kg):
1. Quadriceps Primer: Barbell Back Squat (fokus kedalaman parallel atau di bawahnya) ditambah Leg Press atau Bulgarian Split Squat (3 set x 8-10 reps per kaki).
2. Hamstrings & Glutes: Romanian Deadlift (RDL) 3-4 set x 8-10 reps (fokus dorong pinggul ke belakang/hip hinge) dan Lying Leg Curl.
3. Betis (Calves): Standing Calf Raise dengan pause 2 detik di posisi stretch bawah 4 set x 12-15 reps.`;
  }

  // PERUT & CORE
  if (matchAny(rawText, ['perut', 'abs', 'sixpack', 'core', 'plank', 'hanging leg raise', 'buncit', 'lemak perut'])) {
    return `🎯 Strategi Membentuk Otot Perut (Abs & Core)

Prinsip dasar otot perut untuk ${name}:
1. Otot Perut Dibuat di Dapur (Kalori): Otot abs akan terlihat jelas saat Body Fat turun di kisaran 10 - 14% melalui defisit kalori teratur.
2. Latihan Beban Core (Hypertrophy Abs): Latih abs seperti otot lain dengan beban, contohnya Cable Crunch (3 set x 12-15 reps) dan Hanging Leg Raise.
3. Fungsi Stabilitas SBD: Latih teknik Bracing (pernapasan diafragma intra-abdominal) untuk melindungi tulang belakang saat mengangkat beban berat.`;
  }

  // ==========================================
  // 4. POWERLIFTING & SBD KHUSUS
  // ==========================================
  if (matchAny(rawText, ['squat', 'jongkok', 'high bar', 'low bar', 'kedalaman squat', 'ankle'])) {
    return `🏋 Optimasi Teknik Squat (${squat} kg)

Tips menyempurnakan angkatan Squat ${name}:
1. High Bar vs Low Bar: Low bar menempatkan barbel di atas posterior deltoid, memendekkan moment arm pinggul sehingga biasanya memungkinkan angkatan 5-10% lebih berat.
2. Bracing & Nafas: Ambil nafas dalam ke dalam perut (bukan dada), kunci otot perut seperti akan dipukul sebelum memulai turunan (Valsalva Maneuver).
3. Jalur Lutut: Buka lutut searah dengan jari kaki dan dorong lantai secara merata dengan tiga titik tumpu kaki (tumit, jempol, kelingking).`;
  }

  if (matchAny(rawText, ['bench press', 'bench', 'arch bench', 'leg drive', 'sticking point bench'])) {
    return `🏋 Optimasi Teknik Bench Press (${bench} kg)

Tips mendobrak rekor Bench Press:
1. Leg Drive Aktif: Tancapkan telapak kaki kokoh ke lantai dan dorong ke arah kepala (tanpa mengangkat pantat dari bangku) saat barbel mulai didorong dari dada.
2. Posisi Siku & Dada: Sentuhkan barbel di area bawah dada (sternum) dengan siku membentuk sudut 45-60 derajat, jangan biarkan siku melebar 90 derajat (flaring) untuk melindungi sendi bahu.
3. Kunci Punggung: Pertahankan retraksi belikat selama seluruh repetisi berlangsung.`;
  }

  if (matchAny(rawText, ['deadlift', 'tarik beban', 'sumo', 'conventional', 'hook grip', 'pinggang deadlift'])) {
    return `🏋 Optimasi Teknik Deadlift (${deadlift} kg)

Tips memaksimalkan Deadlift ${name}:
1. Posisi Awal: Barbel harus menempel di tulang kering, posisi bahu sedikit di depan barbel, dan lats dikunci ke bawah seperti menjepit kertas di ketiak.
2. Push The Floor: Bayangkan kamu sedang melakukan leg press pada lantai di fase pertama tarikan, bukan hanya menarik beban dengan pinggang.
3. Lockout Sempurna: Di puncak gerakan, kencangkan glutes (pantat) dan kunci pinggul tanpa perlu membungkukkan pinggang ke belakang secara berlebihan (hyperextension).`;
  }

  if (matchAny(rawText, ['sbd', 'powerlifting', 'total angkatan', '1rm', 'one rep max'])) {
    return `🏆 Analisis & Target SBD Total (${sbd} kg)

Halo ${name}, profil kekuatan SBD-mu saat ini:
• Squat: ${squat} kg | Bench: ${bench} kg | Deadlift: ${deadlift} kg (Total: ${sbd} kg)
• Wilks/DOTS Score Indicator: Kategori Kuat & Terlatih (Intermediate - Advanced Lifter).

Strategi Menuju Rekor Baru (+10-20kg):
1. Terapkan periodisasi gelombang (Wave Loading): Latih intensitas 80-85% 1RM selama 3 minggu, lalu deload di minggu ke-4.
2. Perkuat otot aksesori titik lemah (Weak Points): Spoto Press untuk Bench, Pause Squat untuk Squat, dan Deficit Deadlift untuk tarikan bawah.`;
  }

  if (matchAny(rawText, ['belt', 'sabuk gym', 'knee sleeves', 'wrist wrap', 'straps', 'sepatu gym'])) {
    return `🥋 Panduan Perlengkapan Latihan (Gym Gear)

Panduan memilih peralatan pendukung SBD:
• Lifting Belt (10mm/13mm): Membantu meningkatkan tekanan intra-abdominal saat Squat & Deadlift di atas 80% 1RM.
• Knee Sleeves (7mm Neoprene): Menjaga kehangatan sendi lutut dan memberikan kompresi stabil saat bottom position Squat.
• Wrist Wraps: Menjaga pergelangan tangan tetap tegak lurus saat Bench Press dan Overhead Press berat.
• Sepatu: Gunakan sepatu beralas datar dan keras (seperti Converse, barefoot shoes, atau sepatu squat ber-heel) agar transfer tenaga dari lantai tidak terbuang oleh sol empuk.`;
  }

  // ==========================================
  // 5. NUTRISI, DIET, BULKING & CUTTING
  // ==========================================
  if (matchAny(rawText, ['bulking', 'bulk', 'naikin berat', 'tambah massa otot', 'surplus kalori'])) {
    const surplusCalories = Math.round(weight * 33 + 350);
    const targetProtein = Math.round(weight * 1.8);

    return `🥩 Panduan Lean Bulking (Tambah Otot Minim Lemak)

Panduan nutrisi bulking untuk ${name} (${weight} kg):
• Target Kalori Harian: ~${surplusCalories} kkal/hari (Surplus moderat +300-400 kkal dari kebutuhan harian).
• Target Protein: ~${targetProtein} gram/hari (Dada ayam, daging sapi, telur, tempe, susu).
• Laju Kenaikan Ideal: 1 - 1.5 kg per bulan agar mayoritas kenaikan adalah jaringan otot murni, bukan timbunan lemak.
• Waktu Makan: Bagi menjadi 3-4 kali makan besar dengan porsi karbohidrat kompleks sebelum dan sesudah latihan.`;
  }

  if (matchAny(rawText, ['cutting', 'cut', 'turunkan berat', 'bakar lemak', 'fat loss', 'defisit kalori'])) {
    const deficitCalories = Math.round(weight * 33 - 400);
    const targetProtein = Math.round(weight * 2.0);

    return `🔥 Panduan Cutting (Bakar Lemak Pertahankan Otot)

Strategi defisit kalori terukur untuk ${name}:
• Target Kalori Harian: ~${deficitCalories} kkal/hari (Defisit aman -350 sampai -500 kkal/hari).
• Target Protein Tinggi: ~${targetProtein} gram/hari (Protein tinggi wajib untuk mencegah katabolisme otot saat defisit).
• Prinsip Beban di Gym: Tetap angkat beban seberat mungkin (jangan turunkan beban secara drastis) agar tubuh mendapat sinyal untuk mempertahankan jaringan otot.
• Kardio Pendukung: Lakukan jalan cepat (Incline Treadmill Walk) 20-30 menit 3x seminggu setelah angkat beban.`;
  }

  if (matchAny(rawText, ['makanan', 'menu diet', 'protein harian', 'makanan tinggi protein', 'dada ayam', 'telur'])) {
    return `🍗 Sumber Makanan Tinggi Protein & Ekonomis

Panduan takaran protein harian untukmu (${weight} kg):
• 100g Dada Ayam Fillet: ~31g protein (120 kkal)
• 1 Butir Telur Utuh: ~6-7g protein (70 kkal)
• 100g Tempe: ~19g protein
• 100g Ikan Kembung / Tuna: ~20-25g protein + Omega 3 sehat
• 1 Scoop Whey Protein: ~24-27g protein

Target harianmu adalah ~${Math.round(weight * 1.8)}g protein, setara dengan 300g dada ayam + 3 butir telur utuh sepanjang hari.`;
  }

  // ==========================================
  // 6. PROGRAM & POLA LATIHAN
  // ==========================================
  if (matchAny(rawText, ['program', 'split', 'jadwal latihan', 'ppl', 'upper lower', 'full body', 'bro split'])) {
    return `📋 Rekomendasi Split Program Latihan

Pilihan split program terbaik berdasarkan frekuensi mingguan ${name}:

1. Push - Pull - Legs (PPL) - 4-6 Hari/Minggu (Sangat Direkomendasikan)
• Hari 1 (Push): Dada, Bahu Depan/Samping, Triceps (Bench Press Focus)
• Hari 2 (Pull): Punggung, Bahu Belakang, Biceps (Deadlift/Row Focus)
• Hari 3 (Legs): Quads, Hamstrings, Glutes, Calves (Squat Focus)
• Hari 4: Rest / Ulangi siklus

2. Upper / Lower Split - 4 Hari/Minggu
• Sangat cocok untuk memadukan volume hipertrofi dan angkatan compound 2x seminggu secara efisien.`;
  }

  if (matchAny(rawText, ['progressive overload', 'beban naik', 'reps', 'set', 'rpe', 'rir'])) {
    return `📈 Panduan Penerapan Progressive Overload

Kunci utama pertumbuhan otot dan kekuatan:
1. Tambah Beban (Weight): Jika sudah mampu mencapai batas atas rentang repetisi (misal 3 set x 10 reps dengan form bersih), tambahkan beban 1.25 - 2.5 kg di sesi berikutnya.
2. Tambah Repetisi (Reps): Pertahankan beban yang sama dan coba raih 1-2 repetisi tambahan per set.
3. Perbaiki Tempo & Kontrol: Lakukan fase turun (eksentrik) selama 3 detik terkontrol dan hilangkan momentum ayunan badan.
4. Jaga RPE di 7.5 - 9: Sisakan 1-2 repetisi sebelum failure (RIR 1-2) pada gerakan compound berat demi keamanan sendi.`;
  }

  if (matchAny(rawText, ['plateau', 'angkatan mentok', 'beban macet', 'stuck'])) {
    return `🧱 Cara Menembus Plateau & Angkatan Mentok

Langkah praktis mendobrak kebuntuan angkatan:
1. Lakukan Deload Week: Istirahatkan sistem saraf pusat dengan memangkas volume latihan sebesar 50% selama 1 minggu.
2. Ganti Variasi Gerakan (Secondary Movements): Jika Bench mentok, gunakan Dumbbell Press atau Spoto Press selama 3-4 minggu.
3. Evaluasi Kalori & Tidur: Pastikan tidur cukup 7-8 jam dan konsumsi karbohidrat memadai sebelum sesi latihan berat.
4. Gunakan Micro-loading: Gunakan fractional plate (0.5kg atau 1.25kg) daripada langsung memaksakan naik 5kg.`;
  }

  if (matchAny(rawText, ['kardio', 'cardio', 'treadmill', 'lari', 'sepeda', 'fat burn'])) {
    return `🏃 Panduan Kardio Tanpa Mengikis Massa Otot

Cara menggabungkan kardio dengan latihan beban bagi ${name}:
• Waktu Terbaik: Lakukan kardio SETELAH selesai sesi angkat beban, bukan sebelumnya (agar energi glikogen untuk compound SBD tetap 100%).
• Jenis Terbaik (LISS): Incline Treadmill Walking (Speed 4.5-5.5 km/jam, Incline 8-12%) selama 20-30 menit.
• Keunggulan: Membakar kalori lemak secara efektif tanpa membebani sendi lutut atau mengganggu pemulihan kekuatan otot.`;
  }

  // ==========================================
  // 7. PEMULIHAN, CEDERA & GAYA HIDUP
  // ==========================================
  if (matchAny(rawText, ['doms', 'pegal', 'nyeri otot', 'sakit setelah latihan', 'kram'])) {
    return `🩹 Panduan Mengatasi Nyeri Otot & DOMS

Nyeri otot pasca latihan adalah respon adaptasi wajar:
• Penyebab: Micro-tears (robekan mikro) pada serat otot akibat stimulus gerakan baru atau beban yang meningkat.
• Solusi Pemulihan Cepat:
  1. Active Recovery: Jalan santai atau peregangan ringan 15 menit untuk melancarkan sirkulasi darah.
  2. Mandi Air Hangat / Kompres: Membantu relaksasi otot yang tegang.
  3. Cukupi Cairan & Elektrolit: Mencegah kekakuan dan kram otot.
• Catatan: Kamu tetap boleh latihan jika DOMS ringan, namun istirahatkan grup otot yang bersangkutan jika rasa sakit masih intens.`;
  }

  if (matchAny(rawText, ['istirahat', 'rest day', 'berapa hari latihan', 'overtraining', 'tidur', 'sleep'])) {
    return `😴 Pentingnya Hari Istirahat & Waktu Tidur

Otot tumbuh saat kamu beristirahat, bukan saat di gym:
• Frekuensi Istirahat: Minimal 1 - 2 hari libur per minggu dari latihan beban intensif.
• Kebutuhan Tidur: 7 - 9 jam tidur berkualitas per malam (fase Deep Sleep adalah saat tubuh memproduksi Hormon Pertumbuhan HGH secara optimal).
• Tanda Overtraining: Denyut jantung istirahat meningkat, motivasi turun drastis, angkatan terasa jauh lebih berat dari biasanya, dan gangguan tidur.`;
  }

  if (matchAny(rawText, ['cedera', 'sakit pinggang', 'sakit bahu', 'sakit lutut', 'nyeri sendi', 'injury'])) {
    return `⚠️ Penanganan Nyeri Sendi & Pencegahan Cedera

Panduan keselamatan latihan untuk ${name}:
1. Hentikan Gerakan Pemicu Nyeri: Jangan paksakan mengangkat beban jika terasa nyeri tajam pada sendi (bahu, lutut, atau pinggang bawah).
2. Evaluasi Form & Teknik: Periksa apakah ada arch berlebihan pada pinggang saat Deadlift, atau siku membuka 90 derajat saat Bench Press.
3. Hangatkan Rotator Cuff & Sendi: Lakukan dynamic warm-up 5-10 menit sebelum masuk ke working set beban berat.
4. Jika nyeri berlanjut lebih dari 5-7 hari, konsultasikan dengan fisioterapis olahraga.`;
  }

  if (matchAny(rawText, ['pemanasan', 'warm up', 'stretching', 'peregangan', 'mobilitas'])) {
    return `🔥 Panduan Pemanasan & Mobilitas yang Tepat

Protokol pemanasan sebelum sesi SBD:
1. Dynamic Warmup (5 Menit): Arm circles, leg swings, cat-cow stretch, dan bodyweight squat (jangan lakukan static stretching tahan lama sebelum angkat beban karena bisa menurunkan tenaga otot).
2. Warmup Sets Piramida:
   • Set 1: Barbel Kosong x 10 reps
   • Set 2: 50% Beban Target x 5 reps
   • Set 3: 70% Beban Target x 3 reps
   • Set 4: 85% Beban Target x 1 rep
   • Working Set Utama: Beban penuh.`;
  }

  if (matchAny(rawText, ['pemula', 'baru mulai gym', 'hari pertama', 'tips pemula', 'beginner'])) {
    return `🔰 Panduan Emas untuk Pemula Gym

Selamat memulai perjalanan fitness, ${name}! Berikut 3 fondasi terpenting:
1. Prioritaskan Teknik Compound: Kuasai gerakan dasar (Squat, Bench, Deadlift, Overhead Press, Lat Pulldown) dengan beban ringan terlebih dahulu.
2. Catat Setiap Sesi Latihan: Gunakan fitur Workout Tracker di aplikasi PANGLIMA untuk mendokumentasikan beban dan repetisimu.
3. Konsistensi di Atas Intensitas: Latihan 3-4 kali seminggu secara konsisten selama 6 bulan jauh lebih berdampak daripada latihan habis-habisan setiap hari lalu berhenti.`;
  }

  // ==========================================
  // 8. DYNAMIC DIVERSE FALLBACK FOR ANY TOPIC
  // ==========================================
  // If the query contains custom words, parse the core topic dynamically
  const cleanedQueryTitle = query.trim().length > 0 ? query.trim() : 'Konsultasi Latihan';
  
  return `🤖 Rekomendasi Khusus PANGLIMA AI untuk ${name}

Menanggapi pertanyaanmu mengenai: "${cleanedQueryTitle}"

Berikut analisis terstruktur dan langkah aksi terbaik:
1. Penyesuaian Program: Sesuaikan intensitas dengan kondisi fisik saat ini (SBD Total: ${sbd} kg, Berat: ${weight} kg). Prioritaskan form gerak yang stabil dan aman bagi persendian.
2. Progressive Overload Terukur: Fokus pada penambahan mikro beban atau perbaikan kontrol tempo eksentrik (2-3 detik) di setiap repetisi.
3. Nutrisi & Pemulihan: Pastikan target protein harian (~${Math.round(weight * 1.8)}g) dan hidrasi (${(weight * 0.04).toFixed(1)}L air) terpenuhi untuk mendukung adaptasi otot.

Apakah kamu ingin penjelasan lebih mendalam mengenai rincian set, variasi gerakan, atau pengaturan nutrisi terkait topik ini?`;
}
