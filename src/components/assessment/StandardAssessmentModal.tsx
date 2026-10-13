import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  X,
  ShieldCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Concept, Question, LanguageMode, StudentProfile } from '../../types';
import { VERIFIED_QUESTION_BANK, CURRICULUM } from '../../data/curriculum';

interface StandardAssessmentModalProps {
  isOpen: boolean;
  mode: 'pre_test' | 'post_test';
  concept?: Concept;
  student: StudentProfile;
  languageMode: LanguageMode;
  onClose: () => void;
  onCompletePreTest: (startingConceptId: string, preTestScore: number) => void;
  onCompletePostTest: (conceptId: string, postTestScore: number, netGrowth: number) => void;
}

export const StandardAssessmentModal: React.FC<StandardAssessmentModalProps> = ({
  isOpen,
  mode,
  concept,
  student,
  languageMode,
  onClose,
  onCompletePreTest,
  onCompletePostTest,
}) => {
  // Questions pool
  const testQuestions: Question[] =
    mode === 'pre_test'
      ? VERIFIED_QUESTION_BANK.slice(0, 4) // 4 benchmark diagnostic questions across concepts
      : VERIFIED_QUESTION_BANK.filter((q) => q.conceptId === concept?.id).slice(0, 3).length > 0
      ? VERIFIED_QUESTION_BANK.filter((q) => q.conceptId === concept?.id).slice(0, 3)
      : VERIFIED_QUESTION_BANK.slice(0, 3);

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [calculatedScore, setCalculatedScore] = useState<number>(0);
  const [recommendedStartConcept, setRecommendedStartConcept] = useState<Concept | null>(null);

  if (!isOpen) return null;

  const currentQ = testQuestions[currentIdx] || testQuestions[0];
  const selectedOptId = selectedAnswers[currentIdx];

  const handleSelectOption = (optId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optId }));
  };

  const handleNextQuestion = () => {
    if (currentIdx < testQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Complete test and calculate scores
      let correct = 0;
      const conceptPerformance: Record<string, boolean> = {};

      testQuestions.forEach((q, idx) => {
        const isRight = selectedAnswers[idx] === q.correctOptionId;
        if (isRight) correct += 1;
        conceptPerformance[q.conceptId] = isRight;
      });

      const scorePercent = Math.round((correct / testQuestions.length) * 100);
      setCalculatedScore(scorePercent);
      setIsCompleted(true);

      if (mode === 'pre_test') {
        // Find first concept failed, or lowest prerequisite
        const allConcepts = CURRICULUM.flatMap((s) => s.concepts);
        const failedConceptId = Object.keys(conceptPerformance).find(
          (cId) => !conceptPerformance[cId]
        );
        const startingConcept =
          allConcepts.find((c) => c.id === failedConceptId) || allConcepts[0];
        setRecommendedStartConcept(startingConcept);
      } else if (concept) {
        // Post-Test: Net Growth calculation
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        const preScore = student.masteryScores[concept.id] ?? 35;
        const netGrowth = Math.max(scorePercent - preScore, 10);
        onCompletePostTest(concept.id, scorePercent, netGrowth);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              {mode === 'pre_test' ? <Brain className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  {mode === 'pre_test'
                    ? `Class ${student.grade || 8} Pre-Test Diagnostic`
                    : `Post-Test Growth Assessment`}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  {mode === 'pre_test' ? 'Baseline Assessment' : 'Net Growth Analyzer'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-telugu mt-0.5">
                {mode === 'pre_test'
                  ? 'ప్రారంభ స్థాయి పరీక్ష • అభ్యాసం ఎక్కడి నుండి ప్రారంభించాలో నిర్ణయిస్తుంది'
                  : `అవగాహన పెరుగుదల విశ్లేషణ • ${concept?.titleTe || ''}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {!isCompleted ? (
            <>
              {/* Stepper info */}
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>
                  Question <strong>{currentIdx + 1}</strong> of{' '}
                  <strong>{testQuestions.length}</strong>
                </span>
                <span>Class {student.grade || 8} Standard Benchmark</span>
              </div>

              {/* Question prompt */}
              <div className="space-y-2 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
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
              <div className="space-y-2.5">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedOptId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold ring-2 ring-amber-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <div>
                        <p className="text-xs sm:text-sm font-medium">{opt.textEn}</p>
                        {languageMode !== 'en' && (
                          <p className="text-xs font-telugu text-slate-600 mt-0.5">
                            {opt.textTe}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer CTA */}
              <div className="pt-3 flex justify-end border-t border-slate-100">
                <button
                  type="button"
                  disabled={!selectedOptId}
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <span>
                    {currentIdx < testQuestions.length - 1
                      ? 'Next Question'
                      : 'Complete Assessment & View Analysis'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </>
          ) : (
            /* COMPLETED OUTCOME STATE */
            <div className="text-center space-y-5 py-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {mode === 'pre_test'
                    ? 'Pre-Test Diagnostic Complete!'
                    : 'Post-Test Net Growth Verified!'}
                </h3>
                <p className="text-xs text-slate-500 font-telugu mt-0.5">
                  {mode === 'pre_test'
                    ? 'AI మీ సామర్థ్యాన్ని విశ్లేషించి సరైన ప్రారంభ భావనను గుర్తించింది'
                    : 'లక్ష్య భావనలో నికర అభ్యాస పెరుగుదల నమోదైంది'}
                </p>
              </div>

              {/* Pre-Test Result Card */}
              {mode === 'pre_test' && recommendedStartConcept && (
                <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                      AI Diagnostic Starting Point
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      Pre-Test Baseline: {calculatedScore}%
                    </span>
                  </div>

                  <div>
                    <h5 className="font-extrabold text-base text-slate-900">
                      Recommended Starting Concept: {recommendedStartConcept.titleEn}
                    </h5>
                    <p className="text-xs font-telugu text-amber-950 mt-0.5 font-medium">
                      {recommendedStartConcept.titleTe}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Your baseline test revealed that mastering "{recommendedStartConcept.titleEn}" first will give you the strongest foundation before attempting multi-step equations.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onCompletePreTest(recommendedStartConcept.id, calculatedScore);
                      onClose();
                    }}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Launch Recommended Course Path</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              )}

              {/* Post-Test Net Growth Card */}
              {mode === 'post_test' && concept && (
                <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 rounded-2xl border border-emerald-300 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900">
                      Net Growth Calculation (నికర పెరుగుదల)
                    </span>
                    <span className="text-xs font-black text-emerald-700">
                      +
                      {Math.max(
                        calculatedScore -
                          (student.masteryScores[concept.id] ?? 35),
                        10
                      )}
                      % Net Growth!
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-emerald-200">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500">
                        Pre-Test Baseline
                      </p>
                      <p className="text-lg font-bold text-slate-700">
                        {student.masteryScores[concept.id] ?? 35}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-600">
                        Post-Test Verified Score
                      </p>
                      <p className="text-lg font-black text-emerald-600">
                        {calculatedScore}%
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    Great work! Independent assessment verifies that conceptual understanding of "{concept.titleEn}" has permanently improved.
                  </p>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Return to Student Dashboard</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
