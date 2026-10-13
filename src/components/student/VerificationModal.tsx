import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Award,
  X,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Concept, LanguageMode, VerificationProbe } from '../../types';
import { requestVerificationAssessment } from '../../services/api';
import { SpeechService } from '../../services/speech';

interface VerificationModalProps {
  concept: Concept;
  diagnosedWeakness?: string;
  languageMode: LanguageMode;
  onClose: () => void;
  onVerificationSuccess: (conceptId: string) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  concept,
  diagnosedWeakness,
  languageMode,
  onClose,
  onVerificationSuccess,
}) => {
  const [probe, setProbe] = useState<VerificationProbe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isPassed, setIsPassed] = useState<boolean>(false);

  useEffect(() => {
    async function loadProbe() {
      setIsLoading(true);
      try {
        const data = await requestVerificationAssessment({
          conceptTitle: concept.titleEn,
          diagnosedWeakness: diagnosedWeakness || 'Sign inversion during transposition',
        });
        setProbe(data);
      } catch (err) {
        console.error('Failed to load verification assessment:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProbe();
  }, [concept, diagnosedWeakness]);

  const handleSubmit = () => {
    if (selectedIdx === null || !probe) return;
    setIsSubmitted(true);
    const passed = selectedIdx === probe.correctIndex;
    setIsPassed(passed);

    if (passed) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
      onVerificationSuccess(concept.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  Independent Verification Assessment
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                  Transfer Probe
                </span>
              </div>
              <p className="text-xs text-indigo-200 font-telugu mt-0.5">
                స్వతంత్ర బదిలీ పరీక్ష • {concept.titleTe}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-indigo-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                Generating novel real-world transfer problem...
              </p>
              <p className="text-xs text-slate-400">
                Verifying genuine conceptual mastery beyond rote repetition
              </p>
            </div>
          ) : probe ? (
            <>
              {/* Verification Objective */}
              <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-200 text-xs text-indigo-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-indigo-800">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Cognitive Transfer Metric:</span>
                </div>
                <p className="text-slate-700">{probe.verificationGoal}</p>
              </div>

              {/* Transfer Question Prompt */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {(languageMode === 'en' || languageMode === 'bilingual') && (
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    {probe.questionEn}
                  </p>
                )}
                {(languageMode === 'te' || languageMode === 'bilingual') && (
                  <p className="text-sm font-semibold text-amber-950 font-telugu leading-relaxed">
                    {probe.questionTe}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {probe.optionsEn.map((optEn: string, idx: number) => {
                  const optTe = probe.optionsTe[idx] || optEn;
                  const isSelected = selectedIdx === idx;
                  const isCorrect = idx === probe.correctIndex;

                  let style =
                    'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';

                  if (isSubmitted) {
                    if (isCorrect) {
                      style =
                        'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-300 font-bold';
                    } else if (isSelected) {
                      style =
                        'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-200';
                    } else {
                      style = 'border-slate-200 bg-slate-50 opacity-50';
                    }
                  } else if (isSelected) {
                    style =
                      'border-indigo-500 bg-indigo-50 text-indigo-950 font-bold ring-2 ring-indigo-300';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => setSelectedIdx(idx)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${style}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <div>
                          <div className="text-sm font-medium">{optEn}</div>
                          {languageMode !== 'en' && optTe !== optEn && (
                            <div className="text-xs font-telugu text-slate-600">{optTe}</div>
                          )}
                        </div>
                      </div>

                      {isSubmitted && isCorrect && (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      )}
                      {isSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Verification Outcome */}
              {isSubmitted && (
                <div
                  className={`p-4 rounded-xl border ${
                    isPassed
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    {isPassed ? (
                      <>
                        <Award className="w-5 h-5 text-emerald-600" />
                        <span>Concept Verified! Conceptual Transfer Proven.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-amber-600" />
                        <span>Transfer Not Fully Verified Yet</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed">
                    {isPassed
                      ? probe.explanationEn
                      : `The diagnosed misconception recurred in this novel context. Let's do another remedial practice set with a different analogy.`}
                  </p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                {!isSubmitted ? (
                  <button
                    type="button"
                    disabled={selectedIdx === null}
                    onClick={handleSubmit}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    <span>Submit Verification Answer</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all"
                  >
                    {isPassed ? 'Continue Learning' : 'Return to Practice'}
                  </button>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
