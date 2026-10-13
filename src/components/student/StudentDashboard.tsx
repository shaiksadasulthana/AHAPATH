import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import { StudentProfile, Subject, Concept, LanguageMode } from '../../types';
import { CURRICULUM, CURRICULUM_BOARDS } from '../../data/curriculum';
import { ConceptMasteryMap } from './ConceptMasteryMap';

interface StudentDashboardProps {
  student: StudentProfile;
  languageMode: LanguageMode;
  onSelectConcept: (concept: Concept) => void;
  onLaunchVerification: (concept: Concept) => void;
  onOpenPortfolio?: () => void;
  onOpenPreTest?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  languageMode,
  onSelectConcept,
  onLaunchVerification,
  onOpenPortfolio,
  onOpenPreTest,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('math');

  const activeSubject =
    CURRICULUM.find((s) => s.id === selectedSubjectId) || CURRICULUM[0];

  const currentBoard =
    CURRICULUM_BOARDS.find((b) => b.id === student.selectedBoardId) ||
    CURRICULUM_BOARDS[0];

  // Calculate overall mastery
  const totalConceptsCount = Object.keys(student.masteryScores).length;
  const avgMastery = Math.round(
    Object.values(student.masteryScores).reduce((a, b) => a + b, 0) /
      (totalConceptsCount || 1)
  );

  // Recommended next concept: lowest score or first unverified
  const recommendedConcept =
    activeSubject.concepts.find(
      (c) => (student.masteryScores[c.id] ?? 0) < 60
    ) || activeSubject.concepts[0];

  return (
    <div className="space-y-6">
      {/* Student Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 ring-4 ring-amber-400/20 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {student.name}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                  Roll: {student.rollNumber}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {currentBoard.nameEn} • Class {student.grade || 8}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-300">
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  {student.currentStreakDays} Day Streak
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  {student.verifiedConceptsCount} Concepts Verified
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">
                  {student.totalQuestionsSolved} Questions Solved
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Pill */}
          <div className="grid grid-cols-2 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 min-w-[240px]">
            <div>
              <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">
                Overall Mastery
              </p>
              <p className="text-2xl font-black text-amber-400">{avgMastery}%</p>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{ width: `${avgMastery}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">
                Accuracy Rate
              </p>
              <p className="text-2xl font-black text-emerald-400">
                {student.accuracyRate}%
              </p>
              <p className="text-[10px] text-slate-300 mt-1">Adaptive Gating Active</p>
            </div>
          </div>
        </div>

        {/* Portfolio & Diagnostic Pre-test Action Row */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Net Growth: +{student.overallNetGrowthPercent || 44}%</span>
            </span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              Pre-Test to Post-Test Mastery Gain
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenPreTest && (
              <button
                type="button"
                onClick={onOpenPreTest}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
                title="Take baseline test to diagnose where to start learning"
              >
                <Brain className="w-3.5 h-3.5 text-amber-400" />
                <span>Class Pre-Test (ప్రారంభ పరీక్ష)</span>
              </button>
            )}

            {onOpenPortfolio && (
              <button
                type="button"
                onClick={onOpenPortfolio}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 hover:scale-[1.02]"
                title="Open comprehensive academic progress portfolio"
              >
                <Award className="w-3.5 h-3.5 text-slate-950" />
                <span>Student Portfolio (పోర్ట్‌ఫోలియో)</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Recommended Next Action with Reason Code & Evidence */}
      {recommendedConcept && (
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-indigo-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                    Recommended Next Concept
                  </span>
                  <span className="text-xs text-indigo-200">
                    Rule Code: #PREREQ-REINFORCE
                  </span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-white mt-1">
                  {languageMode === 'te'
                    ? recommendedConcept.titleTe
                    : recommendedConcept.titleEn}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  {languageMode === 'te'
                    ? 'ఈ భావనలో అవగాహనను మరింత బలోపేతం చేసుకోవడానికి అడాప్టివ్ లెసన్ మరియు ప్రాక్టీస్ ప్రారంభించండి.'
                    : `Based on your recent assessment patterns, strengthening this concept will unlock Level 4 applications and quadratic equation foundations.`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectConcept(recommendedConcept)}
              className="shrink-0 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Start Recommended Path</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      )}

      {/* Flagged Diagnostic Gap Callout */}
      {student.flaggedGaps.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border border-rose-200/90 rounded-3xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Diagnostic Alert: Concept Friction Detected
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  AhaPath detected recurring sign errors in algebraic transposition. Let's fix this with a bilingual visual balance guide.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {student.flaggedGaps.map((gap, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-semibold bg-white text-rose-800 px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs"
                    >
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const targetConcept =
                  activeSubject.concepts.find(
                    (c) => c.id === 'class8.math.linear-eq.transposition-signs'
                  ) || activeSubject.concepts[0];
                onSelectConcept(targetConcept);
              }}
              className="shrink-0 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Fix Concept Gap Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Subject Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {CURRICULUM.map((sub) => {
          const isSelected = sub.id === selectedSubjectId;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shadow-2xs ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <BookOpen
                className={`w-4 h-4 ${
                  isSelected ? 'text-amber-400' : 'text-slate-500'
                }`}
              />
              <span>{languageMode === 'te' ? sub.nameTe : sub.nameEn}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {sub.concepts.length} Concepts
              </span>
            </button>
          );
        })}
      </div>

      {/* Chapters Preview Bar */}
      {activeSubject.chapters && activeSubject.chapters.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <FolderOpen className="w-4 h-4 text-indigo-600" />
            <span>Chapters in {activeSubject.nameEn.split(' ')[0]}:</span>
          </div>
          {activeSubject.chapters.map((ch) => (
            <span
              key={ch.id}
              className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800"
            >
              {ch.titleEn}
            </span>
          ))}
        </div>
      )}

      {/* Concept Mastery Radar & Interactive Grid */}
      <ConceptMasteryMap
        subject={activeSubject}
        student={student}
        languageMode={languageMode}
        onSelectConcept={onSelectConcept}
        onLaunchVerification={onLaunchVerification}
      />
    </div>
  );
};
