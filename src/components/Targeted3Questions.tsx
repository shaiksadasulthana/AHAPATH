import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Award,
  Layers,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, LanguageMode } from '../types';

interface Targeted3QuestionsProps {
  conceptTitleEn: string;
  conceptTitleTe: string;
  questions: Question[];
  languageMode: LanguageMode;
  onCompleteSet: (scorePercent: number, correctCount: number) => void;
  onOpenVisualStep?: () => void;
}

export const Targeted3Questions: React.FC<Targeted3QuestionsProps> = ({
  conceptTitleEn,
  conceptTitleTe,
  questions,
  languageMode,
  onCompleteSet,
  onOpenVisualStep,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = (optId: string) => {
    if (isAnswered) return;
    setSelectedOptionId(optId);
  };

  const handleCheckAnswer = () => {
    if (!selectedOptionId || isAnswered) return;
    setIsAnswered(true);

    const isCorrect = selectedOptionId === currentQ.correctOptionId;
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      const finalScore = Math.round(
        ((correctCount + (selectedOptionId === currentQ.correctOptionId ? 0 : 0)) /
          questions.length) *
          100
      );
      setIsFinished(true);
      onCompleteSet(finalScore, correctCount);
    }
  };

  if (isFinished) {
    const scorePct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="p-6 sm:p-7 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-md">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>
        <h4 className="text-lg font-black text-slate-900">
          Targeted Practice Set Completed!
        </h4>
        <p className="text-xs text-slate-500 font-telugu">
          లక్ష్య అభ్యాస ప్రశ్నల సమితి పూర్తయింది
        </p>

        <div className="p-4 bg-slate-50 rounded-2xl max-w-sm mx-auto border border-slate-200">
          <p className="text-2xl font-black text-slate-900">
            {correctCount} / {questions.length} Correct ({scorePct}%)
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Understanding score updated to your academic profile.
          </p>
        </div>
      </div>
    );
  }

  const isSelectedCorrect =
    isAnswered && selectedOptionId === currentQ.correctOptionId;

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-md space-y-5">
      {/* Header with 3 Question Counter */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
              3 Targeted Questions
            </span>
            <span className="text-xs font-bold text-slate-700">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {languageMode === 'te' ? conceptTitleTe : conceptTitleEn}
          </p>
        </div>

        {/* Mini Step Indicator */}
        <div className="flex items-center gap-1.5">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${
                idx === currentIndex
                  ? 'bg-amber-500 text-white shadow-xs'
                  : idx < currentIndex
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Question Prompt */}
      <div className="space-y-1.5 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
          {currentQ.promptEn}
        </h4>
        {languageMode !== 'en' && (
          <h4 className="text-sm font-bold text-amber-950 font-telugu leading-relaxed">
            {currentQ.promptTe}
          </h4>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((opt, i) => {
          const isSelected = selectedOptionId === opt.id;
          const isCorrect = opt.id === currentQ.correctOptionId;

          let style =
            'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';

          if (isAnswered) {
            if (isCorrect) {
              style =
                'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-300';
            } else if (isSelected) {
              style =
                'border-rose-500 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-200';
            } else {
              style = 'border-slate-200 bg-slate-50 opacity-40';
            }
          } else if (isSelected) {
            style =
              'border-amber-500 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-300 shadow-2xs';
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt.id)}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${style}`}
            >
              <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <div>
                <p className="text-xs font-semibold">{opt.textEn}</p>
                {languageMode !== 'en' && (
                  <p className="text-[11px] font-telugu text-slate-600 mt-0.5">
                    {opt.textTe}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Evaluation Feedback */}
      {isAnswered && (
        <div
          className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
            isSelectedCorrect
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              {isSelectedCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Correct Answer! Concept step reinforced.</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Incorrect Answer. Review the step-by-step logic.</span>
                </>
              )}
            </span>

            {onOpenVisualStep && (
              <button
                type="button"
                onClick={onOpenVisualStep}
                className="text-[11px] font-bold text-indigo-700 hover:underline flex items-center gap-1"
              >
                <span>View Visual Balance Model</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <p>{currentQ.explanationEn}</p>
          {languageMode !== 'en' && (
            <p className="font-telugu text-[11px] mt-1">{currentQ.explanationTe}</p>
          )}
        </div>
      )}

      {/* Footer Stepper Action */}
      <div className="flex justify-end pt-2">
        {!isAnswered ? (
          <button
            type="button"
            disabled={!selectedOptionId}
            onClick={handleCheckAnswer}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <span>Verify Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <span>
              {currentIndex < questions.length - 1
                ? 'Next Targeted Question'
                : 'Complete Targeted Set'}
            </span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        )}
      </div>
    </div>
  );
};
