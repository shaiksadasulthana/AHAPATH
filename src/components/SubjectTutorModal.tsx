import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  RefreshCw,
  Lightbulb,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Brain,
  Trash2,
  Mic,
  MicOff,
  Languages,
} from 'lucide-react';
import { LanguageMode, SubjectChatMessage } from '../types';
import { SpeechService, VoiceToTextService } from '../services/speech';

interface SubjectTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  languageMode: LanguageMode;
  currentSubject?: string;
  grade?: number;
  onRedirectToConcept: (conceptId: string) => void;
}

export const SubjectTutorModal: React.FC<SubjectTutorModalProps> = ({
  isOpen,
  onClose,
  languageMode,
  currentSubject = 'Mathematics',
  grade = 8,
  onRedirectToConcept,
}) => {
  const [messages, setMessages] = useState<SubjectChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      contentEn:
        'Hello! I am your AhaPath Subject AI Tutor. Ask me any doubt or question about mathematics, science, equations, or homework. I will answer accurately, explain step-by-step, and redirect you to the exact targeted lesson if you need concept mastery!',
      contentTe:
        'నమస్కారం! నేను మీ ఆహా-పాత్ సబ్జెక్ట్ AI ట్యూటర్‌ని. గణితం, సైన్స్ లేదా సమీకరణాల గురించి మీకు ఉన్న ఏ సందేహాన్నైనా అడగండి. నేను కచ్చితమైన సమాధానం, దశల వారీ వివరణ ఇస్తాను మరియు లక్ష్య పాఠానికి మార్గదర్శనం చేస్తాను!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Voice to text states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceLanguage, setVoiceLanguage] = useState<'en' | 'te'>(
    languageMode === 'te' ? 'te' : 'en'
  );
  const [speechError, setSpeechError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    return () => {
      VoiceToTextService.stopListening();
      SpeechService.stop();
    };
  }, []);

  if (!isOpen) return null;

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputQuery).trim();
    if (!textToSend || isLoading) return;

    if (isListening) {
      handleStopVoiceInput();
    }

    const userMsg: SubjectChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      contentEn: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setSpeechError(null);
    setIsLoading(true);

    try {
      const historyPayload = [...messages, userMsg].map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.contentEn,
      }));

      const res = await fetch('/api/ai/subject-tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          subject: currentSubject,
          language: languageMode,
          grade,
        }),
      });

      if (!res.ok) throw new Error('Failed to get answer from tutor');
      const data = await res.json();

      const assistantMsg: SubjectChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        contentEn: data.replyEn,
        contentTe: data.replyTe,
        keySteps: data.keySteps,
        targetedConceptId: data.targetedConceptId,
        targetedConceptTitle: data.targetedConceptTitle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: SubjectChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        contentEn:
          'When transposing terms across an equals sign (=), remember: addition becomes subtraction, and multiplication becomes division. For example, 3x - 5 = 16 => 3x = 21 => x = 7.',
        contentTe:
          'సమానత్వ గుర్తు దాటి పదాలను మార్చినప్పుడు: కూడిక తీసివేతగా, గుణకారం భాగహారంగా మారుతుంది. ఉదాహరణ: 3x - 5 = 16 => 3x = 21 => x = 7.',
        targetedConceptId: 'class8.math.linear-eq.transposition-signs',
        targetedConceptTitle: 'Transposition & Sign Inversion Across Equality',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVoiceOutput = (text: string, lang: 'en' | 'te') => {
    if (isSpeaking) {
      SpeechService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      SpeechService.speak(text, lang, () => setIsSpeaking(false));
    }
  };

  // Voice to text handlers
  const handleStartVoiceInput = () => {
    setSpeechError(null);
    const success = VoiceToTextService.startListening({
      lang: voiceLanguage,
      onStart: () => setIsListening(true),
      onTranscript: (spokenText) => {
        setInputQuery(spokenText);
      },
      onError: (err) => {
        setSpeechError(err);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!success && !VoiceToTextService.isSupported()) {
      setSpeechError('Voice recognition is not supported in this browser.');
    }
  };

  const handleStopVoiceInput = () => {
    VoiceToTextService.stopListening();
    setIsListening(false);
  };

  const quickPrompts = [
    'How do I solve 4x - 7 = 21 step by step?',
    'Why does + change to - when crossing =?',
    'Explain Newton’s Third Law with real examples',
    'How do I clear denominators with LCM in fractions?',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col h-[88vh] animate-in zoom-in-95 duration-200">
        {/* Top Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  Subject AI Tutor & Doubt Solver
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-400 text-slate-950">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Accurate Subject Answers • Voice-to-Text • Telugu & English Bilingual Scaffolding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setMessages([
                  {
                    id: 'reset',
                    role: 'assistant',
                    contentEn: 'Conversation reset. What doubt would you like to solve today?',
                    contentTe: 'సంభాషణ రీసెట్ చేయబడింది. ఈ రోజు మీరు ఏ సందేహాన్ని నివృత్తి చేసుకోవాలనుకుంటున్నారు?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ])
              }
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Clear Chat History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                VoiceToTextService.stopListening();
                SpeechService.stop();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/70">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-4 sm:p-5 rounded-2xl max-w-[92%] sm:max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-br-2xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-2xs shadow-xs'
                  }`}
                >
                  <p className="font-medium whitespace-pre-line">{msg.contentEn}</p>

                  {/* Telugu Translation if applicable */}
                  {msg.contentTe && languageMode !== 'en' && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 font-telugu text-slate-700 leading-relaxed text-xs">
                      {msg.contentTe}
                    </div>
                  )}

                  {/* Key Problem Solving Steps */}
                  {msg.keySteps && msg.keySteps.length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1.5">
                      <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                        Key Steps to Solve (సాధన దశలు):
                      </p>
                      {msg.keySteps.map((step, sIdx) => (
                        <p key={sIdx} className="text-xs text-amber-950 font-medium">
                          • {step}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Targeted Lesson Redirection Card */}
                  {msg.targetedConceptId && msg.targetedConceptTitle && (
                    <div className="mt-3.5 p-3.5 bg-gradient-to-r from-indigo-50 to-amber-50 border border-indigo-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Targeted Concept Identified:</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">
                          {msg.targetedConceptTitle}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onRedirectToConcept(msg.targetedConceptId!);
                          onClose();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 hover:scale-[1.02]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Open Targeted Lesson</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Time & Audio */}
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleVoiceOutput(
                          languageMode === 'te' && msg.contentTe ? msg.contentTe : msg.contentEn,
                          languageMode === 'te' ? 'te' : 'en'
                        )
                      }
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                    >
                      <Volume2 className="w-3 h-3 text-amber-600" />
                      <span>Read aloud (వినండి)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-white p-3.5 rounded-2xl border border-slate-200 w-fit shadow-2xs">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
              <span>Analyzing doubt with Gemini AI & synthesizing accurate step-by-step resolution...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Question Pills */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Try Asking:
            </span>
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="text-[11px] bg-slate-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 text-slate-700 px-3 py-1 rounded-full border border-slate-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Live Voice Recording Status Banner */}
        {isListening && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center justify-between text-xs text-red-700 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="font-bold">
                Listening... Speak your question now in {voiceLanguage === 'te' ? 'Telugu (తెలుగు)' : 'English'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleStopVoiceInput}
              className="text-xs font-bold text-red-800 hover:underline"
            >
              Done Speaking
            </button>
          </div>
        )}

        {/* Voice Error notice */}
        {speechError && (
          <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-200 text-xs text-amber-800 flex items-center justify-between">
            <span>{speechError}</span>
            <button
              type="button"
              onClick={() => setSpeechError(null)}
              className="text-[10px] font-bold text-amber-900 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input Bar with Voice-to-Text */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          {/* Voice Language Selector */}
          <button
            type="button"
            onClick={() => setVoiceLanguage((prev) => (prev === 'en' ? 'te' : 'en'))}
            className="px-2.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center gap-1 shrink-0"
            title="Toggle Voice Input Language (English / Telugu)"
          >
            <Languages className="w-3.5 h-3.5 text-indigo-600" />
            <span>{voiceLanguage === 'en' ? 'EN Mic' : 'తెలుగు Mic'}</span>
          </button>

          {/* Microphone Voice-to-Text Button */}
          <button
            type="button"
            onClick={() => {
              if (isListening) {
                handleStopVoiceInput();
              } else {
                handleStartVoiceInput();
              }
            }}
            className={`p-3 rounded-2xl border transition-all shrink-0 ${
              isListening
                ? 'bg-red-600 text-white border-red-700 shadow-md animate-pulse ring-4 ring-red-200'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            }`}
            title={
              isListening
                ? 'Stop Voice Input'
                : `Voice to Text: Speak in ${voiceLanguage === 'te' ? 'Telugu' : 'English'}`
            }
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-white" />
            ) : (
              <Mic className="w-4 h-4 text-amber-700" />
            )}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : 'Type or click mic to ask (e.g., "Solve 5x - 3 = 2x + 9")...'
            }
            className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
