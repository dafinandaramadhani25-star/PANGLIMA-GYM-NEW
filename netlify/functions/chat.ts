import { GoogleGenAI } from '@google/genai';
import { generateSmartAIResponse, cleanMarkdownSymbols, UserContextData } from '../../src/utils/aiCoachEngine';

export const handler = async (event: any) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    let body: any = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      body = {};
    }

    const { prompt, quickAction, userContext } = body;

    if (!prompt && !quickAction) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt atau quick action diperlukan.' }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

    // If API key is available in Netlify environment variables, call Gemini 3.7 Flash
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const ctx: UserContextData = userContext || {};
        const contextText = userContext
          ? `
[DATA USER PANGLIMA saat ini]:
- Nama User: ${ctx.name || 'Pengguna PANGLIMA'}
- Streak Latihan: ${ctx.streakDays || 0} hari
- Total Workout Bulan Ini: ${ctx.totalWorkoutsThisMonth || 0} sesi
- SBD Total: ${ctx.sbdTotal || 0} kg
- Personal Records (PR):
  * Squat: ${ctx.squatPR || 'Belum tercatat'} kg
  * Bench Press: ${ctx.benchPR || 'Belum tercatat'} kg
  * Deadlift: ${ctx.deadliftPR || 'Belum tercatat'} kg
  * OHP: ${ctx.ohpPR || 'Belum tercatat'} kg
- Body Progress Terakhir:
  * Berat Badan: ${ctx.weightKg || 'Belum tercatat'} kg
  * Body Fat: ${ctx.bodyFat || 'Belum tercatat'} %
  * Massa Otot: ${ctx.muscleMass || 'Belum tercatat'} kg
- Workout Terbaru: ${ctx.recentWorkoutTitle || 'Belum ada'} (${ctx.recentWorkoutVolume || 0} kg volume, ${ctx.recentWorkoutDate || 'N/A'})
`
          : 'Data user tidak dilampirkan.';

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

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: userPromptText,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const textOutput = response.text || '';
        const cleanedText = cleanMarkdownSymbols(textOutput);

        if (cleanedText && cleanedText.length > 5) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ text: cleanedText, engine: 'gemini-3.7-flash' }),
          };
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call warning in Netlify Function, falling back to smart engine:', geminiError);
      }
    }

    // High quality contextual smart engine fallback
    const fallbackAnswer = generateSmartAIResponse(prompt || '', quickAction, userContext);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: fallbackAnswer, engine: 'panglima-coach-v3' }),
    };
  } catch (err: any) {
    console.error('Error in Netlify function:', err);
    const fallbackAnswer = generateSmartAIResponse('Panduan Latihan', undefined, undefined);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: fallbackAnswer, engine: 'fallback' }),
    };
  }
};
