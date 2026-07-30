import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'PANGLIMA Gym & Workout Progress Tracker',
    aiEnabled: Boolean(apiKey),
  });
});

// PANGLIMA AI Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt, quickAction, userContext } = req.body;

    if (!prompt && !quickAction) {
      return res.status(400).json({ error: 'Prompt atau quick action diperlukan.' });
    }

    if (!process.env.GEMINI_API_KEY || !aiClient) {
      // Fallback structured simulation response if key is missing in dev mode
      const mockReply = getFallbackAIResponse(quickAction || prompt, userContext);
      return res.json({ text: mockReply });
    }

    // Build rich context prompt for Gemini
    const contextText = userContext ? `
[DATA USER PANGLIMA saat ini]:
- Nama User: ${userContext.name || 'Pengguna PANGLIMA'}
- Streak Latihan: ${userContext.streakDays || 0} hari
- Total Workout Bulan Ini: ${userContext.totalWorkoutsThisMonth || 0} sesi
- SBD Total: ${userContext.sbdTotal || 0} kg
- Personal Records (PR):
  * Squat: ${userContext.squatPR || 'Belum tercatat'} kg
  * Bench Press: ${userContext.benchPR || 'Belum tercatat'} kg
  * Deadlift: ${userContext.deadliftPR || 'Belum tercatat'} kg
  * OHP: ${userContext.ohpPR || 'Belum tercatat'} kg
- Body Progress Terakhir:
  * Berat Badan: ${userContext.weightKg || 'Belum tercatat'} kg
  * Body Fat: ${userContext.bodyFat || 'Belum tercatat'} %
  * Massa Otot: ${userContext.muscleMass || 'Belum tercatat'} kg
- Workout Terbaru: ${userContext.recentWorkoutTitle || 'Belum ada'} (${userContext.recentWorkoutVolume || 0} kg volume, ${userContext.recentWorkoutDate || 'N/A'})
` : 'Data user tidak dilampirkan.';

    const systemInstruction = `
Kamu adalah PANGLIMA AI, Asisten & Pakar Latihan Gym Senior dari aplikasi "PANGLIMA" (Website Progress Tracker Gym).
Tujuanmu adalah mendampingi pengguna gym pemula hingga menengah secara obyektif, komunikatif, motivatif, ilmiah, dan berbasis data.

Aturan Utama:
1. Analisis data latihan user jika tersedia, berikan masukan konkrit berbasis ilmu hipertrofi dan strength training (progressive overload, rest, rpe, form).
2. Jika menjawab seputar SBD (Squat, Bench Press, Deadlift), berikan tips teknik biomekanik yang aman.
3. Hindari topik kalkulator BMI/BMR/TDEE karena fokus aplikasi PANGLIMA adalah pemantauan perkembangan beban latihan & komposisi tubuh.
4. Gunakan bahasa Indonesia yang profesional, ramah, dan bersemangat. Format jawaban menggunakan Markdown rapi dengan poin, cetak tebal (bold), dan emoji yang relevan.
`;

    const userPromptText = `
${contextText}

[PERTANYAAN / PERMINTAAN USER]:
${prompt}
${quickAction ? `(Quick Action: ${quickAction})` : ''}
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPromptText,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const aiText = response.text || 'Maaf, PANGLIMA AI belum dapat menghasilkan analisis saat ini. Silakan coba lagi.';
    return res.json({ text: aiText });

  } catch (error: any) {
    console.error('Error calling PANGLIMA AI:', error);
    return res.status(500).json({ 
      error: 'Gagal terhubung dengan PANGLIMA AI.',
      details: error?.message || 'Server error'
    });
  }
});

function getFallbackAIResponse(prompt: string, context: any): string {
  const name = context?.name || 'Kawan Gym';
  const squat = context?.squatPR || 150;
  const bench = context?.benchPR || 110;
  const deadlift = context?.deadliftPR || 170;
  const sbd = context?.sbdTotal || (squat + bench + deadlift);

  if (prompt.includes('Analisis Progress') || prompt.includes('Progress Saya')) {
    return `### 📈 Analisis Progress Latihan **PANGLIMA AI** untuk ${name}

Halo **${name}**! Berdasarkan log aktivitas latihanmu di PANGLIMA:

🔥 **Ringkasan Performa Saat Ini:**
- **Total SBD:** **${sbd} kg** (Squat: ${squat}kg | Bench: ${bench}kg | Deadlift: ${deadlift}kg)
- **Training Streak:** **${context?.streakDays || 12} Hari Berturut-turut**

💪 **Evaluasi Progressive Overload:**
1. **Rasio Kekuatan SBD:** Proporsi SBD kamu tergolong sangat solid! Rasio Bench/Squat/Deadlift berada di angka yang seimbang untuk tingkatan Intermediate.
2. **Body Composition:** Penurunan kadar lemak ke **${context?.bodyFat || 15.6}%** menunjukkan rekosisi tubuh yang sangat efektif tanpa kehilangan massa otot.

🎯 **Rekomendasi Langkah Selanjutnya:**
- Tambahkan 2.5 kg pada sesi Squat minggu depan dengan skema 3 set x 5 repetisi (RPE 8).
- Istirahat antar set heavy compound selama 3-4 menit untuk pemulihan ATP maksimal.`;
  }

  if (prompt.includes('Evaluasi Workout Hari Ini') || prompt.includes('Evaluasi')) {
    return `### 💪 Evaluasi Workout Hari Ini

Sesi **${context?.recentWorkoutTitle || 'Chest & Triceps Hypertrophy'}** berjalan sangat impresif!

✨ **Highlight Utama:**
- Total Volume Latihan: **${context?.recentWorkoutVolume || 9450} kg**
- Rekor Baru (PR): Terdeteksi peningkatan beban pada **Bench Press (110kg)**!

💡 **Saran Pemulihan PANGLIMA AI:**
1. **Hidrasi:** Konsumsi minimal 1-1.5 Liter air dalam 2 jam pasca latihan.
2. **Intake Protein:** Targetkan 25-35g protein berkualitas tinggi dalam waktu dekat untuk mempercepat sintesis protein otot (MPS).
3. **Kualitas Tidur:** Usahakan tidur 7-8 jam malam ini agar regenerasi sistem saraf pusat (CNS) optimal.`;
  }

  if (prompt.includes('Rekomendasi Program') || prompt.includes('Program Latihan')) {
    return `### 🏋 Rekomendasi Program Latihan PANGLIMA (Push-Pull-Legs 6-Day)

Berdasarkan pencapaian SBD kamu saat ini (**${sbd} kg**), berikut rancangan pembagian program yang optimal:

📅 **Jadwal Mingguan:**
- **Senin (Push A):** Barbell Bench Press (Heavy), Incline DB Press, OHP, Cable Fly, Tricep Rope.
- **Selasa (Pull A):** Conventional Deadlift (Heavy), Barbell Row, Lat Pulldown, Facepull, Bicep Curl.
- **Rabu (Legs A):** Barbell Back Squat (Heavy), RDL, Leg Press, Calf Raise, Plank.
- **Kamis (Rest / Light Cardio)**
- **Jumat (Push B - Hypertrophy Focus)**
- **Sabtu (Pull B & Legs B)**

📌 *Prinsip Utama:* Selalu catat setiap set & reps di **PANGLIMA Workout Tracker** untuk menjaga *Progressive Overload*.`;
  }

  return `### 🤖 **PANGLIMA AI Fitness Assistant**

Halo **${name}**! Saya telah menganalisis data latihanmu.

- **Status SBD:** Squat ${squat}kg | Bench ${bench}kg | Deadlift ${deadlift}kg (Total: **${sbd} kg**)
- **Kondisi Tubuh:** Berat ${context?.weightKg || 74.5} kg dengan kadar lemak ${context?.bodyFat || 15.6}%.

Ada yang bisa saya bantu lebih lanjut seputar teknik latihan, pemilihan variasi exercise, atau strategi *Progressive Overload*? Silakan pilih dari Quick Action di bawah atau tuliskan pertanyaan spesifikmu!`;
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PANGLIMA Gym Tracker Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
