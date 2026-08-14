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
Kamu adalah PANGLIMA AI, Asisten & Pakar Latihan Gym Senior dari aplikasi "PANGLIMA".

Aturan Komunikasi Wajib:
1. JAWABAN HARUS SINGKAT, PADAT, DAN LANGSUNG KE INTI (Maksimal 2-3 poin pendek atau 2 paragraf ringkas).
2. DILARANG KERAS MENGGUNAKAN SIMBOL MARKDOWN: Jangan gunakan simbol pagar (#, ##, ###), bintang (*, **), atau backtick (\`). Tuliskan teks secara bersih tanpa karakter bintang atau pagar.
3. Gunakan bahasa Indonesia yang ramah, profesional, dan bersemangat. Boleh gunakan emoji yang relevan untuk poin-poin.
4. Fokus pada analisis data latihan, teknik SBD, dan progressive overload yang praktis.
`;

    const userPromptText = `
${contextText}

[PERTANYAAN / PERMINTAAN USER]:
${prompt}
${quickAction ? `(Quick Action: ${quickAction})` : ''}
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPromptText,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const aiText = cleanMarkdownSymbols(response.text || 'Maaf, PANGLIMA AI belum dapat menghasilkan analisis saat ini. Silakan coba lagi.');
    return res.json({ text: aiText });

  } catch (error: any) {
    console.error('Error calling PANGLIMA AI:', error);
    return res.status(500).json({ 
      error: 'Gagal terhubung dengan PANGLIMA AI.',
      details: error?.message || 'Server error'
    });
  }
});

function cleanMarkdownSymbols(str: string): string {
  if (!str) return '';
  return str
    .replace(/#{1,6}\s?/g, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/\*+/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[\*\-]\s+/gm, '• ')
    .trim();
}

function getFallbackAIResponse(prompt: string, context: any): string {
  const name = context?.name || 'Kawan Gym';
  const squat = context?.squatPR || 150;
  const bench = context?.benchPR || 110;
  const deadlift = context?.deadliftPR || 170;
  const sbd = context?.sbdTotal || (squat + bench + deadlift);

  if (prompt.includes('Analisis Progress') || prompt.includes('Progress Saya')) {
    return `📈 Analisis Progress Latihan PANGLIMA AI untuk ${name}

Halo ${name}! Ringkasan performa latihanmu saat ini:
• Total SBD: ${sbd} kg (Squat: ${squat}kg | Bench: ${bench}kg | Deadlift: ${deadlift}kg)
• Training Streak: ${context?.streakDays || 12} Hari Berturut-turut

Rekomendasi Singkat:
1. Tambahkan 2.5 kg pada sesi Squat berikutnya (3 set x 5 reps).
2. Istirahat 3-4 menit antar set heavy compound untuk pemulihan optimal.`;
  }

  if (prompt.includes('Evaluasi Workout Hari Ini') || prompt.includes('Evaluasi')) {
    return `💪 Evaluasi Workout Hari Ini

Sesi ${context?.recentWorkoutTitle || 'Chest & Triceps'} berjalan sangat impresif!
• Total Volume: ${context?.recentWorkoutVolume || 9450} kg
• Rekor Baru: Terdeteksi peningkatan pada Bench Press (${bench}kg).

Saran Pemulihan:
1. Minum 1-1.5L air dalam 2 jam pasca latihan.
2. Cukupi 25-35g protein untuk pemulihan otot.
3. Istirahat tidur 7-8 jam malam ini.`;
  }

  if (prompt.includes('Rekomendasi Program') || prompt.includes('Program Latihan')) {
    return `🏋 Rekomendasi Program Latihan PANGLIMA (Push-Pull-Legs)

Dengan SBD Total ${sbd} kg, berikut pembagian latihan mingguanmu:
• Senin: Push (Bench Press, OHP, Incline DB)
• Selasa: Pull (Deadlift, Barbell Row, Lat Pulldown)
• Rabu: Legs (Squat, RDL, Leg Press)
• Kamis: Istirahat / Light Cardio
• Jumat: Push Hypertrophy
• Sabtu: Pull & Legs Hypertrophy

Pastikan selalu mencatat beban di Workout Tracker untuk progressive overload!`;
  }

  return `🤖 PANGLIMA AI Fitness Assistant

Halo ${name}! Data latihanmu saat ini:
• Status SBD: Squat ${squat}kg | Bench ${bench}kg | Deadlift ${deadlift}kg (Total: ${sbd} kg)
• Kondisi: Berat ${context?.weightKg || 74.5} kg dengan body fat ${context?.bodyFat || 15.6}%.

Ada yang ingin ditanyakan seputar teknik latihan atau variasi gerakan hari ini?`;
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
