import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  ArrowRight,
  Volume2,
  VolumeX,
  CheckCircle2,
  Lightbulb,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { LanguageMode } from '../types';
import { SpeechService } from '../services/speech';

interface VisualStepExplanationProps {
  conceptTitleEn: string;
  conceptTitleTe: string;
  problemStatementEn: string;
  problemStatementTe?: string;
  steps: {
    stepNumber: number;
    equationState: string;
    actionTakenEn: string;
    actionTakenTe: string;
    balanceScaleLHS: string;
    balanceScaleRHS: string;
    whyItMattersEn: string;
    whyItMattersTe: string;
  }[];
  languageMode: LanguageMode;
  finalAnswer: string;
}

export const VisualStepExplanation: React.FC<VisualStepExplanationProps> = ({
  conceptTitleEn,
  conceptTitleTe,
  problemStatementEn,
  problemStatementTe,
  steps,
  languageMode,
  finalAnswer,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const activeStep = steps[activeStepIndex] || steps[0];

  const handleReadAloud = () => {
    if (isSpeaking) {
      SpeechService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const text =
        languageMode === 'te'
          ? `${activeStep.actionTakenTe}. ${activeStep.whyItMattersTe}`
          : `${activeStep.actionTakenEn}. ${activeStep.whyItMattersEn}`;
      SpeechService.speak(text, languageMode === 'te' ? 'te' : 'en', () => {
        setIsSpeaking(false);
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-700 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                Visual Balance Model
              </span>
              <span className="text-xs text-slate-400 font-telugu">
                దృశ్య సంతులన వివరణ
              </span>
            </div>
            <h4 className="text-base font-bold text-white mt-0.5">
              {languageMode === 'te' ? conceptTitleTe : conceptTitleEn}
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReadAloud}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          {isSpeaking ? (
            <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{isSpeaking ? 'Stop Voice' : 'Read Step Aloud (విను)'}</span>
        </button>
      </div>

      {/* Problem Callout */}
      <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-400">
            Target Problem:
          </span>
          <p className="text-sm sm:text-base font-mono font-bold text-amber-300">
            {problemStatementEn}
          </p>
          {problemStatementTe && languageMode !== 'en' && (
            <p className="text-xs font-telugu text-slate-300 mt-0.5">
              {problemStatementTe}
            </p>
          )}
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold text-right shrink-0">
          Result: {finalAnswer}
        </div>
      </div>

      {/* Interactive Visual Weighing Scale Simulation */}
      <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 relative overflow-hidden text-center">
        <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-3">
          Step {activeStep.stepNumber} Dynamic Balance Scale State
        </p>

        {/* Balance Scale SVG Illustration */}
        <div className="max-w-md mx-auto my-3 relative">
          <svg viewBox="0 0 400 140" className="w-full h-auto drop-shadow-md">
            {/* Center Fulcrum Post */}
            <line x1="200" y1="30" x2="200" y2="120" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            <polygon points="175,130 225,130 200,105" fill="#64748b" />

            {/* Level Balance Beam */}
            <line x1="60" y1="30" x2="340" y2="30" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
            <circle cx="200" cy="30" r="8" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />

            {/* Left Pan Strings & Pan */}
            <line x1="70" y1="30" x2="45" y2="70" stroke="#94a3b8" strokeWidth="2" />
            <line x1="70" y1="30" x2="95" y2="70" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 40 70 Q 70 85 100 70" fill="#334155" stroke="#f59e0b" strokeWidth="2" />

            {/* Right Pan Strings & Pan */}
            <line x1="330" y1="30" x2="305" y2="70" stroke="#94a3b8" strokeWidth="2" />
            <line x1="330" y1="30" x2="355" y2="70" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 300 70 Q 330 85 360 70" fill="#334155" stroke="#f59e0b" strokeWidth="2" />
          </svg>

          {/* Overlaid Pan Contents */}
          <div className="absolute top-[32%] left-[4%] w-[32%] text-center">
            <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-500/30 border border-indigo-400 text-indigo-200 font-mono font-bold text-xs shadow-xs">
              {activeStep.balanceScaleLHS}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">Left Hand Side (LHS)</p>
          </div>

          <div className="absolute top-[12%] left-[45%] text-amber-400 font-mono text-xl font-bold">
            =
          </div>

          <div className="absolute top-[32%] right-[4%] w-[32%] text-center">
            <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/30 border border-emerald-400 text-emerald-200 font-mono font-bold text-xs shadow-xs">
              {activeStep.balanceScaleRHS}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">Right Hand Side (RHS)</p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          Balanced state preserved: Whatever operation occurs on LHS must equally happen on RHS.
        </p>
      </div>

      {/* Step Stepper Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {steps.map((st, i) => (
          <button
            key={st.stepNumber}
            type="button"
            onClick={() => setActiveStepIndex(i)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeStepIndex === i
                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span>Step {st.stepNumber}</span>
            <span className="font-mono text-[11px] opacity-80">
              ({st.equationState})
            </span>
          </button>
        ))}
      </div>

      {/* Step Detailed Pedagogical Box */}
      <div className="p-5 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
              {activeStep.stepNumber}
            </span>
            <span className="font-mono text-sm font-bold text-amber-300">
              {activeStep.equationState}
            </span>
          </div>

          <span className="text-[11px] font-semibold text-slate-400">
            Action {activeStepIndex + 1} of {steps.length}
          </span>
        </div>

        {/* Action Taken */}
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-bold text-white">
            {activeStep.actionTakenEn}
          </p>
          {languageMode !== 'en' && (
            <p className="text-xs font-telugu text-amber-200">
              {activeStep.actionTakenTe}
            </p>
          )}
        </div>

        {/* Why this step matters */}
        <div className="p-3 bg-indigo-950/60 rounded-xl border border-indigo-700/60 text-xs text-indigo-200 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-indigo-300">
              Cognitive Insight (ఇలా ఎందుకు చేయాలి?):
            </span>
            <p className="text-slate-300">{activeStep.whyItMattersEn}</p>
            {languageMode !== 'en' && (
              <p className="font-telugu text-amber-100">{activeStep.whyItMattersTe}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
