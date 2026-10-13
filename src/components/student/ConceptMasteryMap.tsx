import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  TrendingUp,
  Brain,
  Sparkles,
  ShieldCheck,
  FileCheck,
  BookOpen,
} from 'lucide-react';
import { Concept, Subject, StudentProfile, LanguageMode } from '../../types';

interface ConceptMasteryMapProps {
  subject: Subject;
  student: StudentProfile;
  languageMode: LanguageMode;
  onSelectConcept: (concept: Concept) => void;
  onLaunchVerification: (concept: Concept) => void;
}

export const ConceptMasteryMap: React.FC<ConceptMasteryMapProps> = ({
  subject,
  student,
  languageMode,
  onSelectConcept,
  onLaunchVerification,
}) => {
  const getCoverageBadge = (status: string) => {
    switch (status) {
      case 'reviewed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <FileCheck className="w-3 h-3 text-emerald-600" />
            ✓ Reviewed Pack
          </span>
        );
      case 'lesson_ready':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            Lesson Ready
          </span>
        );
      case 'assessment_ready':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            Assessment Ready
          </span>
        );
      case 'catalog_only':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Catalog Only
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60">
              <Brain className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {languageMode === 'te' ? subject.nameTe : subject.nameEn}
              </h2>
              <p className="text-xs text-slate-500">
                {languageMode === 'te' ? subject.descriptionTe : subject.descriptionEn}
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Mastered (&gt;75%)
          </span>
          <span className="flex items-center gap-1 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> In Progress (50-74%)
          </span>
          <span className="flex items-center gap-1 text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Diagnostic Gap (&lt;50%)
          </span>
        </div>
      </div>

      {/* Grid of Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {subject.concepts.map((concept) => {
          const score = student.masteryScores[concept.id] ?? 45;
          const isGap = score < 50;
          const isMastered = score >= 75;
          const isInProgress = score >= 50 && score < 75;

          return (
            <div
              key={concept.id}
              className={`group relative rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                isGap
                  ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300 hover:shadow-md'
                  : isMastered
                  ? 'bg-emerald-50/25 border-emerald-200 hover:border-emerald-300 hover:shadow-md'
                  : 'bg-amber-50/25 border-amber-200 hover:border-amber-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* Header: Grade & Coverage Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shadow-2xs">
                      Class {concept.grade}
                    </span>
                    {getCoverageBadge(concept.coverageStatus)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isMastered ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mastered
                      </span>
                    ) : isGap ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Gap Flagged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3.5 h-3.5" />
                        In Progress
                      </span>
                    )}
                  </div>
                </div>

                {/* Concept Title */}
                <h3 className="font-bold text-slate-900 group-hover:text-amber-800 transition-colors text-base leading-snug">
                  {languageMode === 'te' ? concept.titleTe : concept.titleEn}
                </h3>
                {languageMode === 'bilingual' && (
                  <p className="text-xs font-medium text-amber-900/80 font-telugu mt-0.5">
                    {concept.titleTe}
                  </p>
                )}

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {languageMode === 'te' ? concept.descriptionTe : concept.descriptionEn}
                </p>

                {/* Source Attribution Note */}
                {concept.sourceAttribution && (
                  <p className="text-[10px] text-slate-400 mt-2 italic">
                    Source: {concept.sourceAttribution}
                  </p>
                )}

                {/* Mastery Progress Bar */}
                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-500">Mastery Index:</span>
                    <span
                      className={`font-bold ${
                        isMastered
                          ? 'text-emerald-700'
                          : isGap
                          ? 'text-rose-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isMastered
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : isGap
                          ? 'bg-gradient-to-r from-rose-500 to-red-500'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                      style={{ width: `${Math.max(score, 6)}%` }}
                    />
                  </div>
                </div>

                {/* Prerequisites note if any */}
                {concept.prerequisiteIds.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Prerequisite required for next tier</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectConcept(concept)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 px-3 rounded-xl shadow-2xs transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isGap
                      ? 'Diagnose & Practice'
                      : isMastered
                      ? 'Challenge Mode'
                      : 'Adaptive Practice'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {score >= 60 && (
                  <button
                    type="button"
                    onClick={() => onLaunchVerification(concept)}
                    className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs py-2 px-2.5 rounded-xl shadow-2xs transition-colors"
                    title="Verify independent transfer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">Transfer</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
