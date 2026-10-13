import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  HelpCircle,
  X,
  Volume2,
  RefreshCw,
  BookOpen,
  Lightbulb,
  Mic,
} from 'lucide-react';
import { Concept, LanguageMode, GroundedQAResponse } from '../types';
import { SpeechService, VoiceToTextService } from '../services/speech';

interface GroundedTutorChatProps {
  concept: Concept;
  languageMode: LanguageMode;
  onClose: () => void;
}

export const GroundedTutorChat: React.FC<GroundedTutorChatProps> = ({
  concept,
  languageMode,
  onClose,
}) => {
  const [questionInput, setQuestionInput] = useState<string>('');
  const [messages, setMessages] = useState<
    {
      sender: 'student' | 'tutor';
      textEn: string;
      textTe?: string;
      socraticPrompt?: string;
      groundedFacts?: string[];
    }[]
  >([
    {
      sender: 'tutor',
      textEn: `Hello! I am your AhaPath tutor for "${concept.titleEn}". Ask me any doubt about this topic, or request a simpler explanation!`,
      textTe: `నమస్కారం! "${concept.titleTe}" పాఠంలో మీకు ఉన్న సందేహాన్ని అడగండి. సరళమైన ఉదాహరణతో వివరిస్తాను.`,
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!questionInput.trim() || isLoading) return;

    const userText = questionInput.trim();
    setQuestionInput('');
    setMessages((prev) => [...prev, { sender: 'student', textEn: userText }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptId: concept.id,
          questionText: userText,
          studentGrade: concept.grade,
        }),
      });

      if (!res.ok) throw new Error('Failed to ask tutor');
      const data: GroundedQAResponse = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: 'tutor',
          textEn: data.answerEn,
          textTe: data.answerTe,
          socraticPrompt: data.socraticPrompt,
          groundedFacts: data.groundedFactsUsed,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'tutor',
          textEn:
            'Remember: Equations are balanced like weighing scales. Performing identical inverse operations on both sides preserves mathematical equality.',
          textTe:
            'గుర్తుంచుకోండి: సమీకరణాలు త్రాసుల వంటివి. ఇరువైపులా ఒకే విధమైన వ్యతిరేక ప్రక్రియలు చేస్తే సమతుల్యత మారదు.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'Why does a plus sign become minus across the equals sign?',
    'Can you give me a simple cricket run-rate example?',
    'What is the first step when x appears on both sides?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-bold text-sm text-white">AhaPath AI Tutor</h3>
            <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
              Grounded in: {concept.titleEn}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60">
        {messages.map((m, idx) => {
          const isStudent = m.sender === 'student';
          return (
            <div
              key={idx}
              className={`flex flex-col ${
                isStudent ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl max-w-[90%] text-xs leading-relaxed ${
                  isStudent
                    ? 'bg-amber-500 text-white rounded-br-2xs font-medium shadow-2xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-2xs shadow-2xs'
                }`}
              >
                <p>{m.textEn}</p>
                {m.textTe && languageMode !== 'en' && (
                  <p className="mt-1.5 pt-1.5 border-t border-slate-100 font-telugu text-slate-700">
                    {m.textTe}
                  </p>
                )}

                {/* Socratic Prompt */}
                {m.socraticPrompt && (
                  <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200/80 rounded-lg text-amber-950 font-semibold flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{m.socraticPrompt}</span>
                  </div>
                )}

                {/* Grounded Facts Attribution */}
                {m.groundedFacts && m.groundedFacts.length > 0 && (
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-slate-400" />
                    <span>Grounded in approved SCERT/NCERT curriculum principles</span>
                  </div>
                )}
              </div>

              {!isStudent && (
                <button
                  type="button"
                  onClick={() =>
                    SpeechService.speak(
                      languageMode === 'te' && m.textTe ? m.textTe : m.textEn,
                      languageMode === 'te' ? 'te' : 'en'
                    )
                  }
                  className="mt-1 text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 pl-1"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Listen</span>
                </button>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
            <span>Consulting approved syllabus facts...</span>
          </div>
        )}
      </div>

      {/* Suggested Starter Questions */}
      <div className="p-3 bg-white border-t border-slate-200 overflow-x-auto whitespace-nowrap">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Quick Questions:
        </p>
        <div className="flex gap-1.5">
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuestionInput(sq);
              }}
              className="text-[11px] bg-slate-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input with Voice-to-Text */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => {
            if (VoiceToTextService.isListening()) {
              VoiceToTextService.stopListening();
            } else {
              VoiceToTextService.startListening({
                lang: languageMode === 'te' ? 'te' : 'en',
                onTranscript: (txt) => setQuestionInput(txt),
              });
            }
          }}
          className="p-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors"
          title="Voice-to-Text: Speak your doubt"
        >
          <Mic className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          placeholder="Ask a doubt or click mic to speak..."
          className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-slate-50"
        />
        <button
          type="submit"
          disabled={!questionInput.trim() || isLoading}
          className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
