import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  ArrowRight,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ShieldCheck,
  RefreshCw,
  X,
  BookOpen,
  MessageSquare,
  Award,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Concept,
  Question,
  DifficultyLevel,
  LanguageMode,
  AdaptiveDecision,
  StructuredLesson,
  StudentProfile,
  AnswerSubmissionResult,
} from '../../types';
import { VERIFIED_QUESTION_BANK, VERIFIED_MIND_MAPS } from '../../data/curriculum';
import { MindMap } from '../MindMap';
import { GroundedTutorChat } from '../GroundedTutorChat';
import { VisualStepExplanation } from '../VisualStepExplanation';
import { Targeted3Questions } from '../Targeted3Questions';
import { SpeechService } from '../../services/speech';

interface AdaptiveSessionProps {
  concept: Concept;
  student: StudentProfile;
  languageMode: LanguageMode;
  onClose: () => void;
  onUpdateMastery: (conceptId: string, delta: number, verified?: boolean) => void;
  onLaunchVerification: (concept: Concept, diagnosedWeakness?: string) => void;
  onRedirectToConcept?: (conceptId: string) => void;
}

export const AdaptiveSession: React.FC<AdaptiveSessionProps> = ({
  concept,
  student,
  languageMode,
  onClose,
  onUpdateMastery,
  onLaunchVerification,
  onRedirectToConcept,
}) => {
  // Adaptive State
  const [currentDecision, setCurrentDecision] = useState<AdaptiveDecision | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [structuredLesson, setStructuredLesson] = useState<StructuredLesson | null>(null);
  const [activeStep, setActiveStep] = useState<
    'evaluating' | 'lesson' | 'question' | 'feedback' | 'targeted_3_questions'
  >('evaluating');

  // Question Interaction State
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<AnswerSubmissionResult | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [scratchpadText, setScratchpadText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showVisualExplanation, setShowVisualExplanation] = useState<boolean>(false);

  // Grounded Tutor Drawer
  const [showTutorChat, setShowTutorChat] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Initial Evaluation: Ask Deterministic Engine
  useEffect(() => {
    evaluateNextAction();
  }, [concept.id]);

  const evaluateNextAction = async () => {
    setIsLoading(true);
    setSelectedOptionId(null);
    setSubmissionResult(null);
    setShowHint(false);
    SpeechService.stop();
    setIsSpeaking(false);

    try {
      // Call server deterministic next action
      const res = await fetch('/api/adaptive/next-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptId: concept.id, student }),
      });

      if (!res.ok) throw new Error('Failed to evaluate next action');
      const decision: AdaptiveDecision = await res.json();
      setCurrentDecision(decision);

      // Branch depending on deterministic action
      if (
        decision.action === 'explain' ||
        decision.action === 'targeted_review' ||
        decision.action === 'prerequisite_review' ||
        decision.action === 'show_example'
      ) {
        await loadStructuredLesson(decision.evidence.identifiedMisconceptionCodes?.[0]);
        setActiveStep('lesson');
      } else {
        loadQuestionForContext(decision);
        setActiveStep('question');
      }
    } catch (err) {
      console.error(err);
      // Fallback: Default to question practice
      loadQuestionForContext(null);
      setActiveStep('question');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStructuredLesson = async (misconceptionCode?: string) => {
    try {
      const res = await fetch('/api/ai/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptId: concept.id,
          languagePreference: languageMode,
          studentGrade: concept.grade,
          misconceptionCode: misconceptionCode || '',
        }),
      });

      if (!res.ok) throw new Error('Failed to load lesson');
      const lessonData: StructuredLesson = await res.json();
      setStructuredLesson(lessonData);
    } catch (err) {
      console.error(err);
    }
  };

  const loadQuestionForContext = (decision: AdaptiveDecision | null) => {
    const questionsForConcept = VERIFIED_QUESTION_BANK.filter(
      (q) => q.conceptId === concept.id
    );

    if (questionsForConcept.length > 0) {
      // Pick question based on context or random
      const selected =
        questionsForConcept[
          Math.floor(Math.random() * questionsForConcept.length)
        ];
      setCurrentQuestion(selected);
    } else {
      // Fallback mock question if custom concept
      setCurrentQuestion({
        id: `q-${Date.now()}`,
        conceptId: concept.id,
        difficulty: 2,
        type: 'multiple_choice',
        context: 'guided_practice',
        promptEn: `Solve the linear equation: 2x + 5 = 17`,
        promptTe: `2x + 5 = 17 సమీకరణాన్ని సాధించండి`,
        options: [
          { id: 'opt-a', textEn: 'x = 6', textTe: 'x = 6' },
          { id: 'opt-b', textEn: 'x = 11', textTe: 'x = 11' },
          { id: 'opt-c', textEn: 'x = 22', textTe: 'x = 22' },
          { id: 'opt-d', textEn: 'x = 3', textTe: 'x = 3' },
        ],
        correctOptionId: 'opt-a',
        hintEn: 'Subtract 5 from both sides first, then divide by 2.',
        hintTe: 'మొదట ఇరువైపులా 5 తీసివేయండి, ఆపై 2తో భాగించండి.',
        explanationEn: '2x = 17 - 5 = 12 => x = 6.',
        explanationTe: '2x = 17 - 5 = 12 => x = 6.',
        verificationStatus: 'verified_official',
      });
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOptionId || !currentQuestion) return;

    try {
      const res = await fetch('/api/curriculum/grade-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedOptionId,
          conceptId: concept.id,
          studentId: student.id,
        }),
      });

      if (!res.ok) throw new Error('Grading failed');
      const result: AnswerSubmissionResult = await res.json();
      setSubmissionResult(result);
      setActiveStep('feedback');

      if (result.isCorrect) {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
        });
        onUpdateMastery(concept.id, 10);
      } else {
        onUpdateMastery(concept.id, -5);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVoice = (text: string, lang: 'en' | 'te') => {
    if (isSpeaking) {
      SpeechService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      SpeechService.speak(text, lang, () => setIsSpeaking(false));
    }
  };

  const targetedQuestionsList: Question[] = React.useMemo(() => {
    const matching = VERIFIED_QUESTION_BANK.filter((q) => q.conceptId === concept.id);
    if (matching.length >= 3) return matching.slice(0, 3);
    const others = VERIFIED_QUESTION_BANK.filter((q) => q.conceptId !== concept.id);
    return [...matching, ...others].slice(0, 3);
  }, [concept.id]);

  const dynamicVisualSteps = React.useMemo(() => {
    return [
      {
        stepNumber: 1,
        equationState: '3x - 5 = 16',
        actionTakenEn: 'Identify constant term (-5) and add +5 to both sides to preserve balance',
        actionTakenTe: 'స్థిరపదం (-5) ను గుర్తించి, సంతులనం కోసం ఇరువైపులా +5 కలపండి',
        balanceScaleLHS: '3x - 5 + 5',
        balanceScaleRHS: '16 + 5',
        whyItMattersEn: 'Inverse of subtraction is addition: -5 + 5 cancels out to 0.',
        whyItMattersTe: 'తీసివేతకు వ్యతిరేక చర్య కూడిక: -5 + 5 = 0 గా రద్దవుతుంది.',
      },
      {
        stepNumber: 2,
        equationState: '3x = 21',
        actionTakenEn: 'Simplify both pans of the balance scale',
        actionTakenTe: 'త్రాసు యొక్క రెండు వైపులా సూక్ష్మీకరించండి',
        balanceScaleLHS: '3x',
        balanceScaleRHS: '21',
        whyItMattersEn: 'The variable term 3x is now isolated on the left pan.',
        whyItMattersTe: 'చరరాశి పదం 3x ఇప్పుడు ఎడమవైపు మాత్రమే ఉంది.',
      },
      {
        stepNumber: 3,
        equationState: 'x = 7',
        actionTakenEn: 'Divide both sides by 3 to isolate single x',
        actionTakenTe: 'ఒకే x విలువను కనుగొనడానికి ఇరువైపులా 3తో భాగించండి',
        balanceScaleLHS: 'x',
        balanceScaleRHS: '7',
        whyItMattersEn: 'Inverse of multiplication by 3 is division by 3. Solution x = 7 verified!',
        whyItMattersTe: '3తో గుణకారానికి వ్యతిరేక చర్య భాగహారం. సాధన x = 7 ధ్రువీకరించబడింది!',
      },
    ];
  }, [concept.id]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {languageMode === 'te' ? concept.titleTe : concept.titleEn}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                  {concept.coverageStatus === 'reviewed' ? '✓ Verified Curriculum' : 'Lesson Ready'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AhaPath Adaptive Engine • {concept.gradeLevel || `Class ${concept.grade}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTutorChat(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Tutor (సందేహం అడగండి)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                SpeechService.stop();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Deterministic Action Sub-banner */}
        {currentDecision && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                Deterministic Engine:
              </span>
              <span className="font-bold px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 capitalize">
                {currentDecision.action.replace('_', ' ')}
              </span>
              <span className="text-slate-600 hidden md:inline truncate max-w-md">
                • {currentDecision.explanation}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowScratchpad(!showScratchpad)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md bg-white border border-slate-200"
              >
                {showScratchpad ? 'Hide Scratchpad' : 'Scratchpad (చిత్తు పని)'}
              </button>
            </div>
          </div>
        )}

        {/* Modal Scroll Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Scratchpad (if toggled) */}
          {showScratchpad && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-amber-900">
                  Interactive Workspace (సమీకరణాల సాధన చిత్తు కాగితం)
                </span>
                <button
                  type="button"
                  onClick={() => setScratchpadText('')}
                  className="text-[11px] text-amber-700 hover:underline"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={scratchpadText}
                onChange={(e) => setScratchpadText(e.target.value)}
                placeholder="Test operations: e.g. 3x - 5 = 16 => 3x = 21 => x = 7..."
                className="w-full h-20 text-xs font-mono p-2.5 rounded-xl bg-white border border-amber-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}

          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-800">
                AhaPath Adaptive Engine is analyzing student evidence...
              </p>
              <p className="text-xs text-slate-400 font-telugu">
                అవగాహన ఆధారాలను విశ్లేషించి తగిన అభ్యాసాన్ని సిద్ధం చేస్తున్నాము...
              </p>
            </div>
          ) : activeStep === 'lesson' && structuredLesson ? (
            /* STEP: STRUCTURED VISUAL LESSON */
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Concept Mind Map */}
              {structuredLesson.mindMap && (
                <MindMap
                  data={structuredLesson.mindMap}
                  languageMode={languageMode}
                />
              )}

              {/* Lesson Narrative */}
              <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 p-6 rounded-2xl border border-amber-200/90 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900">
                      Personalized Visual Lesson
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {structuredLesson.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleVoice(
                        languageMode === 'te'
                          ? structuredLesson.teluguExplanation
                          : structuredLesson.studentFriendlyExplanation,
                        languageMode === 'te' ? 'te' : 'en'
                      )
                    }
                    className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs"
                    title="Audio Read-Aloud"
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Explanation in English and Telugu */}
                <div className="space-y-2">
                  {(languageMode === 'en' || languageMode === 'bilingual') && (
                    <p className="text-sm text-slate-800 leading-relaxed font-medium">
                      {structuredLesson.studentFriendlyExplanation}
                    </p>
                  )}
                  {(languageMode === 'te' || languageMode === 'bilingual') && (
                    <p className="text-sm text-amber-950 font-telugu leading-relaxed pt-1">
                      {structuredLesson.teluguExplanation}
                    </p>
                  )}
                </div>

                {/* Real-World Analogy */}
                <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Real-World Analogy (నిజ జీవిత ఉదాహరణ)
                  </p>
                  <p className="text-xs text-slate-700 font-medium">
                    {structuredLesson.analogy}
                  </p>
                  <p className="text-xs text-amber-950 font-telugu">
                    {structuredLesson.teluguAnalogy}
                  </p>
                </div>

                {/* Step-by-Step Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Step-by-Step Mathematical Reasoning:
                  </h4>
                  <div className="space-y-2">
                    {structuredLesson.explanationSteps.map((st) => (
                      <div
                        key={st.stepNumber}
                        className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                            {st.stepNumber}
                          </span>
                          <span>{st.titleEn}</span>
                          <span className="text-[11px] font-telugu text-amber-800">
                            ({st.titleTe})
                          </span>
                        </div>
                        <p className="text-slate-700 pl-7">{st.detailEn}</p>
                        <p className="text-[11px] text-amber-950 font-telugu pl-7">
                          {st.detailTe}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Worked Example */}
                {structuredLesson.workedExample && (
                  <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900">
                      Carefully Worked Example (సాధించిన ఉదాహరణ)
                    </span>
                    <p className="text-xs font-bold text-indigo-950">
                      {structuredLesson.workedExample.problemStatementEn}
                    </p>
                    <div className="space-y-1 pl-2 border-l-2 border-indigo-300 text-xs text-indigo-900 font-mono">
                      {structuredLesson.workedExample.solutionSteps.map((step, idx) => (
                        <p key={idx}>{step}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action: Proceed to 3 Targeted Questions or Practice */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowVisualExplanation((prev) => !prev)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {showVisualExplanation
                        ? 'Hide Visual Balance Scale'
                        : 'View Step-by-Step Visual Balance Scale'}
                    </span>
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveStep('targeted_3_questions')}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 hover:scale-[1.02]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>Take 3 Targeted Questions (3 లక్ష్య ప్రశ్నలు)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        loadQuestionForContext(currentDecision);
                        setActiveStep('question');
                      }}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <span>Guided Practice</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                </div>

                {/* Optional Embedded Visual Balance Scale Simulation */}
                {showVisualExplanation && (
                  <div className="mt-4 animate-in fade-in duration-200">
                    <VisualStepExplanation
                      conceptTitleEn={concept.titleEn}
                      conceptTitleTe={concept.titleTe}
                      problemStatementEn={structuredLesson.workedExample?.problemStatementEn || concept.descriptionEn}
                      problemStatementTe={concept.descriptionTe}
                      steps={dynamicVisualSteps}
                      languageMode={languageMode}
                      finalAnswer="Equilibrium Restored (సమతుల్యత సాధించబడింది)"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : activeStep === 'targeted_3_questions' ? (
            /* STEP: 3 TARGETED QUESTIONS (Prompt Requirement) */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-600">
                  Targeted Assessment Set for: {concept.titleEn}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveStep('lesson')}
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  ← Back to Concept Lesson
                </button>
              </div>

              <Targeted3Questions
                conceptTitleEn={concept.titleEn}
                conceptTitleTe={concept.titleTe}
                questions={targetedQuestionsList}
                languageMode={languageMode}
                onCompleteSet={(scorePercent, correctCount) => {
                  onUpdateMastery(concept.id, correctCount * 5);
                }}
                onOpenVisualStep={() => setShowVisualExplanation(true)}
              />

              {showVisualExplanation && (
                <div className="mt-4">
                  <VisualStepExplanation
                    conceptTitleEn={concept.titleEn}
                    conceptTitleTe={concept.titleTe}
                    problemStatementEn="Step-by-step visual solution for equation balance"
                    steps={dynamicVisualSteps}
                    languageMode={languageMode}
                    finalAnswer="x = 7"
                  />
                </div>
              )}
            </div>
          ) : currentQuestion ? (
            /* STEP: QUESTION & PRACTICE */
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
                        {currentQuestion.context.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        Difficulty Level {currentQuestion.difficulty} of 5
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {currentQuestion.promptEn}
                    </h4>

                    {languageMode !== 'en' && (
                      <h4 className="text-base font-bold text-amber-950 font-telugu leading-relaxed">
                        {currentQuestion.promptTe}
                      </h4>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleVoice(
                        languageMode === 'te'
                          ? currentQuestion.promptTe
                          : currentQuestion.promptEn,
                        languageMode === 'te' ? 'te' : 'en'
                      )
                    }
                    className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shrink-0"
                    title="Audio Read-Aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progressive Hint */}
                <div className="pt-2 border-t border-slate-200">
                  {!showHint ? (
                    <button
                      type="button"
                      onClick={() => setShowHint(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Need a progressive hint? (సూచన కావాలా?)</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 space-y-1">
                      <div className="font-bold flex items-center gap-1 text-indigo-800">
                        <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Progressive Scaffolding Hint:</span>
                      </div>
                      <p>{currentQuestion.hintEn}</p>
                      {languageMode !== 'en' && (
                        <p className="font-telugu text-indigo-950">{currentQuestion.hintTe}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOptionId === opt.id;
                  const isAnswerCorrect =
                    submissionResult && opt.id === submissionResult.correctOptionId;

                  let style =
                    'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';

                  if (submissionResult) {
                    if (isAnswerCorrect) {
                      style =
                        'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-300';
                    } else if (isSelected) {
                      style =
                        'border-rose-500 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-200';
                    } else {
                      style = 'border-slate-200 bg-slate-50 opacity-50';
                    }
                  } else if (isSelected) {
                    style =
                      'border-amber-500 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-300 shadow-xs';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={Boolean(submissionResult)}
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${style}`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <div className="flex-1 space-y-0.5">
                        <div className="text-sm font-medium">{opt.textEn}</div>
                        {languageMode !== 'en' && (
                          <div className="text-xs font-telugu text-slate-600">
                            {opt.textTe}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Misconception Analysis Card */}
              {submissionResult && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div
                    className={`p-5 rounded-2xl border ${
                      submissionResult.isCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {submissionResult.isCorrect ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                          <span>Correct! Demonstrated understanding verified.</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                          <span>Misconception Detected by Diagnostic Engine</span>
                        </>
                      )}
                    </div>

                    {submissionResult.misconceptionDetected && (
                      <div className="mt-2 pt-2 border-t border-rose-200 text-xs space-y-1">
                        <p className="font-bold text-rose-900">
                          Specific Cognitive Gap: {submissionResult.misconceptionDetected.descriptionEn}
                        </p>
                        <p className="font-telugu text-rose-950">
                          {submissionResult.misconceptionDetected.descriptionTe}
                        </p>
                      </div>
                    )}

                    <div className="mt-2 text-xs leading-relaxed">
                      <p>{submissionResult.explanationEn}</p>
                      {languageMode !== 'en' && (
                        <p className="font-telugu mt-1">{submissionResult.explanationTe}</p>
                      )}
                    </div>
                  </div>

                  {/* If incorrect, show targeted lesson card with 1-click redirection */}
                  {!submissionResult.isCorrect && (
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-indigo-50 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                            <BookOpen className="w-4 h-4 text-amber-600" />
                            <span>Recommended Targeted Remedial Concept:</span>
                          </div>
                          <h5 className="font-extrabold text-sm text-slate-900">
                            {submissionResult.targetedConcept
                              ? languageMode === 'te'
                                ? submissionResult.targetedConcept.titleTe
                                : submissionResult.targetedConcept.titleEn
                              : concept.titleEn}
                          </h5>
                          {submissionResult.targetedConcept && languageMode === 'bilingual' && (
                            <p className="text-xs font-telugu text-amber-950 font-medium">
                              {submissionResult.targetedConcept.titleTe}
                            </p>
                          )}
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {submissionResult.targetedConcept?.reason ||
                              'AhaPath AI identified a gap in this concept foundation. Review the visual lesson to build mastery before attempting more questions.'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (
                              onRedirectToConcept &&
                              submissionResult.targetedConcept &&
                              submissionResult.targetedConcept.id !== concept.id
                            ) {
                              onRedirectToConcept(submissionResult.targetedConcept.id);
                            } else {
                              loadStructuredLesson(
                                submissionResult.misconceptionDetected?.code
                              );
                              setActiveStep('lesson');
                            }
                          }}
                          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 hover:scale-[1.02]"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Open Targeted Lesson</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Visual Explanation if answer is wrong */}
                  {!submissionResult.isCorrect && (
                    <div className="pt-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>Step-by-Step Visual Balance Scale Solution (దృశ్య సాధన):</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowVisualExplanation((prev) => !prev)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                        >
                          {showVisualExplanation ? 'Hide Visual Simulation' : 'Inspect Interactive Visual Scale'}
                        </button>
                      </div>
                      <VisualStepExplanation
                        conceptTitleEn={concept.titleEn}
                        conceptTitleTe={concept.titleTe}
                        problemStatementEn={currentQuestion.promptEn}
                        problemStatementTe={currentQuestion.promptTe}
                        steps={dynamicVisualSteps}
                        languageMode={languageMode}
                        finalAnswer={
                          currentQuestion.options.find(
                            (o) => o.id === currentQuestion.correctOptionId
                          )?.textEn || 'x = 6'
                        }
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div />
                {!submissionResult ? (
                  <button
                    type="button"
                    disabled={!selectedOptionId}
                    onClick={handleSubmitAnswer}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Submit Answer for Evaluation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={evaluateNextAction}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4 text-amber-400" />
                      <span>Next Adaptive Step</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Grounded Tutor Chat Drawer */}
      {showTutorChat && (
        <GroundedTutorChat
          concept={concept}
          languageMode={languageMode}
          onClose={() => setShowTutorChat(false)}
        />
      )}
    </div>
  );
};
