import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  Dumbbell, 
  Target, 
  Utensils, 
  Flame, 
  HelpCircle, 
  FileCheck, 
  RefreshCw,
  Lock,
  Unlock,
  Copy,
  Check
} from 'lucide-react';
import { AIChatMessage, UserProfile, WorkoutSession } from '../types';
import { generateSmartAIResponse, cleanMarkdownSymbols, UserContextData } from '../utils/aiCoachEngine';

interface PanglimaAIViewProps {
  user: UserProfile;
  workoutHistory: WorkoutSession[];
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const PanglimaAIView: React.FC<PanglimaAIViewProps> = ({
  user,
  workoutHistory,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const cleanText = (raw: string): string => {
    if (!raw) return '';
    return raw
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
      .replace(/\*+/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^\s*[\*\-]\s+/gm, '• ')
      .trim();
  };

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `🤖 Halo! Saya PANGLIMA AI, Asisten Fitness & Pakar Latihan Personalmu.

Saya dapat menganalisis data Personal Record (SBD), riwayat volume latihan, dan perkembangan komposisi tubuhmu secara otomatis.

Silakan pilih salah satu Quick Action di bawah ini atau tuliskan pertanyaan seputar program latihanmu!`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shareDataContext, setShareDataContext] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const quickActions = [
    {
      id: 'qa-progress',
      title: '📈 Analisis Progress Saya',
      query: 'Analisis perkembangan volume latihan, PR SBD, dan komposisi tubuh saya.',
      icon: TrendingUp,
    },
    {
      id: 'qa-workout-today',
      title: '💪 Evaluasi Workout Hari Ini',
      query: 'Evaluasi sesi latihan terbaru saya, RPE, serta efektivitas progressive overload.',
      icon: Dumbbell,
    },
    {
      id: 'qa-program-rec',
      title: '🏋 Rekomendasi Program Latihan',
      query: 'Rekomendasikan pembagian program latihan (PPL / Upper Lower / Fullbody) sesuai SBD saya.',
      icon: FileCheck,
    },
    {
      id: 'qa-pr-tips',
      title: '🎯 Tips Meningkatkan Personal Record',
      query: 'Berikan tips biomekanik dan periodisasi untuk melampaui rekor Squat, Bench Press, & Deadlift saya.',
      icon: Target,
    },
    {
      id: 'qa-nutrition',
      title: '🥗 Konsultasi Nutrisi',
      query: 'Berikan panduan asupan protein & nutrisi pendukung hipertrofi tanpa menghitung kalori berlebih.',
      icon: Utensils,
    },
    {
      id: 'qa-program-review',
      title: '🔥 Review Program Latihan',
      query: 'Review variasi exercise yang saya lakukan apakah sudah seimbang untuk semua grup otot.',
      icon: Flame,
    },
    {
      id: 'qa-faq',
      title: '❓ Tanya Seputar Fitness',
      query: 'Apa perbedaan antara RPE vs RIR dan mana yang lebih cocok untuk pemula-menengah?',
      icon: HelpCircle,
    },
  ];

  const handleSendMessage = async (textToSend: string, actionTitle?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `msg-usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      quickActionTitle: actionTitle,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const recentWorkout = workoutHistory[0];
      const squatPR = user.personalRecords['ex-squat']?.maxWeightKg || 0;
      const benchPR = user.personalRecords['ex-bench']?.maxWeightKg || 0;
      const deadliftPR = user.personalRecords['ex-deadlift']?.maxWeightKg || 0;
      const ohpPR = user.personalRecords['ex-ohp']?.maxWeightKg || 0;
      const latestBody = user.bodyProgressHistory[user.bodyProgressHistory.length - 1];

      const userContextPayload: UserContextData | null = shareDataContext
        ? {
            name: user.name,
            streakDays: user.trainingStreakDays,
            totalWorkoutsThisMonth: user.totalWorkoutsThisMonth,
            sbdTotal: user.sbdTotalKg || (squatPR + benchPR + deadliftPR),
            squatPR,
            benchPR,
            deadliftPR,
            ohpPR,
            weightKg: latestBody?.weightKg,
            bodyFat: latestBody?.bodyFatPercentage,
            muscleMass: latestBody?.muscleMassKg,
            recentWorkoutTitle: recentWorkout?.title,
            recentWorkoutVolume: recentWorkout?.totalVolumeKg,
            recentWorkoutDate: recentWorkout?.date,
          }
        : null;

      let replyText = '';

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: query,
            quickAction: actionTitle,
            userContext: userContextPayload,
          }),
        });

        // Check if response is valid JSON and not HTML from SPA redirect
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.text) {
            replyText = cleanMarkdownSymbols(data.text);
          }
        }
      } catch (networkErr) {
        console.warn('Network call to backend /api/ai/chat failed, activating smart local engine:', networkErr);
      }

      // If backend was unreachable or returned non-JSON (e.g. static hosting on Netlify), generate smart contextual response
      if (!replyText) {
        replyText = generateSmartAIResponse(query, actionTitle, userContextPayload);
      }

      const aiMsg: AIChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error('AI error', e);
      const fallbackMsg = generateSmartAIResponse(query, actionTitle, null);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          text: fallbackMsg,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto pb-20 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-cyan-950 via-zinc-900 to-zinc-950 p-3.5 rounded-2xl border border-cyan-800/50 flex items-center justify-between shadow-lg shrink-0 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-cyan-100" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-zinc-100 flex items-center gap-1.5">
              <span>PANGLIMA AI Fitness Assistant</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold">
                Gemini 3.7 Flash
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400">Analisis data latihan & konsultasi personal</p>
          </div>
        </div>

        {/* Data Sharing Toggle */}
        <button
          onClick={() => setShareDataContext(!shareDataContext)}
          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1 transition-all ${
            shareDataContext
              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}
          title="Sertakan konteks data SBD & Body Progress dalam percakapan AI"
        >
          {shareDataContext ? (
            <>
              <Unlock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Data Sync On</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Data Sync Off</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Action Chips Carousel */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0 mb-2">
        {quickActions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => handleSendMessage(act.query, act.title)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/60 text-zinc-200 text-xs font-semibold whitespace-nowrap hover:bg-zinc-800/80 transition-all shrink-0 active:scale-95 shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 text-cyan-400" />
              <span>{act.title}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 shadow-md relative group ${
                  isUser
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-zinc-950 font-medium rounded-tr-none'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-none'
                }`}
              >
                {msg.quickActionTitle && (
                  <span className="inline-block px-2 py-0.5 rounded bg-zinc-950/40 text-zinc-900 font-bold text-[10px] uppercase tracking-wider mb-1">
                    {msg.quickActionTitle}
                  </span>
                )}

                <div className="whitespace-pre-wrap font-sans">
                  {cleanText(msg.text)}
                </div>

                <div
                  className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                    isUser ? 'border-zinc-950/20 text-zinc-900/80' : 'border-zinc-800 text-zinc-500'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className="text-zinc-400 hover:text-cyan-400 p-0.5"
                      title="Salin jawaban AI"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold p-3 bg-zinc-900/60 rounded-xl border border-cyan-500/30 w-fit animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>PANGLIMA AI sedang menganalisis data latihan...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputQuery);
        }}
        className="pt-2 shrink-0"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Tanyakan analisis SBD, program latihan, atau nutrisi..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-4 pr-12 py-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 shadow-xl"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="absolute right-2 p-2 rounded-xl bg-cyan-500 text-zinc-950 disabled:opacity-40 hover:bg-cyan-400 transition-colors shadow-md"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </form>
    </div>
  );
};
