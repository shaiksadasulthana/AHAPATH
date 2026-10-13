import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Brain,
  ShieldCheck,
  Calendar,
  Clock,
  Printer,
  Sparkles,
  ArrowRight,
  X,
  BookOpen,
  Zap,
} from 'lucide-react';
import { StudentProfile, LanguageMode } from '../../types';
import { CURRICULUM } from '../../data/curriculum';

interface StudentPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  languageMode: LanguageMode;
  onLaunchPreTest: () => void;
  onRedirectToConcept: (conceptId: string) => void;
}

export const StudentPortfolioModal: React.FC<StudentPortfolioModalProps> = ({
  isOpen,
  onClose,
  student,
  languageMode,
  onLaunchPreTest,
  onRedirectToConcept,
}) => {
  if (!isOpen) return null;

  const allConcepts = CURRICULUM.flatMap((sub) => sub.concepts);

  // Group into strong vs weak concepts
  const strongConcepts: { concept: typeof allConcepts[0]; score: number }[] = [];
  const inProgressConcepts: { concept: typeof allConcepts[0]; score: number }[] = [];
  const weakConcepts: { concept: typeof allConcepts[0]; score: number }[] = [];

  allConcepts.forEach((c) => {
    const score = student.masteryScores[c.id] ?? 40;
    if (score >= 75) {
      strongConcepts.push({ concept: c, score });
    } else if (score < 50) {
      weakConcepts.push({ concept: c, score });
    } else {
      inProgressConcepts.push({ concept: c, score });
    }
  });

  const avgMastery = Math.round(
    Object.values(student.masteryScores).reduce((a, b) => a + b, 0) /
      (Object.keys(student.masteryScores).length || 1)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-amber-400 ring-4 ring-amber-400/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {student.name}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-400 text-slate-950">
                  Roll: {student.rollNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Comprehensive Academic Progress & Concept Mastery Portfolio • Class {student.grade || 8}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Portfolio Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* Quick Academic Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Overall Mastery
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1">{avgMastery}%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Across syllabus standards</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Avg Net Growth
              </span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                +{student.overallNetGrowthPercent || 44}%
              </p>
              <p className="text-[10px] text-emerald-700 mt-0.5">Pre-Test to Post-Test Gain</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Accuracy Rate
              </span>
              <p className="text-2xl font-black text-indigo-600 mt-1">
                {student.accuracyRate}%
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {student.totalQuestionsSolved} solved questions
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Consistency Monitor
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    student.daysInactive > 2
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {student.daysInactive > 2
                    ? `${student.daysInactive}d Inactive`
                    : 'Consistent'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {student.currentStreakDays} day active streak
              </p>
            </div>
          </div>

          {/* Action Callout: Retake / Take Pre-Test Diagnostic */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold">
                <Brain className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Standard Pre-Test Diagnostic Baseline
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  AI uses this assessment to determine where to start the course for you.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onLaunchPreTest();
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>Take Pre-Test Diagnostic</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>

          {/* Strong vs Weak Concepts Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Strong Concepts (Mastered >= 75%) */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-sm text-emerald-950">
                    Strong Concepts (బలమైన భావనలు)
                  </h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {strongConcepts.length} Mastered
                </span>
              </div>

              <div className="space-y-2">
                {strongConcepts.map(({ concept, score }) => (
                  <div
                    key={concept.id}
                    className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {languageMode === 'te' ? concept.titleTe : concept.titleEn}
                      </p>
                      <p className="text-[10px] text-slate-500 font-telugu">
                        Class {concept.grade} • {concept.titleTe}
                      </p>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      {score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Weak Concepts & Gaps (<50%) */}
            <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h4 className="font-bold text-sm text-rose-950">
                    Concepts Needing Attention (బలహీన భావనలు)
                  </h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {weakConcepts.length} Flags
                </span>
              </div>

              <div className="space-y-2">
                {weakConcepts.map(({ concept, score }) => (
                  <div
                    key={concept.id}
                    className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {languageMode === 'te' ? concept.titleTe : concept.titleEn}
                      </p>
                      <p className="text-[10px] text-rose-700 font-medium">
                        Concept Understanding: {score}%
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onRedirectToConcept(concept.id);
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <span>Fix Gap</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pre-Test vs Post-Test Net Growth Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  Pre-Test vs Post-Test Net Cognitive Growth Tracker
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Verified Learning Gain Analytics
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Curriculum Concept</th>
                    <th className="py-2.5 px-3 text-center">Pre-Test Baseline</th>
                    <th className="py-2.5 px-3 text-center">Post-Test Verified</th>
                    <th className="py-2.5 px-3 text-center">Net Growth</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(student.prePostGrowthHistory || []).map((rec, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800">
                          {languageMode === 'te' ? rec.conceptTitleTe : rec.conceptTitleEn}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {rec.dateCompleted}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-600">
                        {rec.preTestScore}%
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">
                        {rec.postTestScore}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-black text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          +{rec.netGrowthPercent}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          Verified Growth
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
          >
            Close Portfolio
          </button>
        </div>
      </div>
    </div>
  );
};
