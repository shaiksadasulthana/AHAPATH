import React from 'react';
import {
  X,
  UserCheck,
  Brain,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Send,
  BookOpen,
} from 'lucide-react';
import { StudentProfile, LanguageMode } from '../../types';
import { CURRICULUM } from '../../data/curriculum';

interface StudentDetailModalProps {
  student: StudentProfile;
  languageMode: LanguageMode;
  onClose: () => void;
  onAssignRemediation: (studentId: string, conceptId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  languageMode,
  onClose,
  onAssignRemediation,
}) => {
  const allConcepts = CURRICULUM.flatMap((sub) => sub.concepts);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{student.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {student.rollNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Preferred Mode: {student.preferredLanguage.toUpperCase()} • Streak:{' '}
                {student.currentStreakDays} days
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

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">
                Accuracy
              </p>
              <p className="text-lg font-black text-slate-900">{student.accuracyRate}%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">
                Questions
              </p>
              <p className="text-lg font-black text-indigo-600">
                {student.totalQuestionsSolved}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">
                Verified Mastery
              </p>
              <p className="text-lg font-black text-emerald-600">
                {student.verifiedConceptsCount}
              </p>
            </div>
          </div>

          {/* Diagnostic Flags */}
          {student.flaggedGaps.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Explainable Diagnostic Rules Flagged:</span>
              </div>
              <div className="space-y-1">
                {student.flaggedGaps.map((gap, i) => (
                  <p key={i} className="text-xs text-rose-800 font-medium">
                    • {gap}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Concept Mastery Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Concept Mastery Levels
            </h4>
            <div className="space-y-2">
              {allConcepts.map((concept) => {
                const score = student.masteryScores[concept.id] ?? 40;
                return (
                  <div
                    key={concept.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-bold text-slate-800">{concept.titleEn}</p>
                        <p className="text-[11px] text-slate-400 font-telugu">
                          {concept.titleTe}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`font-black text-xs px-2 py-0.5 rounded-md ${
                          score >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : score < 50
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {score}%
                      </span>

                      {score < 60 && (
                        <button
                          type="button"
                          onClick={() => onAssignRemediation(student.id, concept.id)}
                          className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Assign Remedial</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Adaptive Log */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recent Adaptive Session Logs
            </h4>
            <div className="space-y-1.5">
              {(student.recentActivity || []).map((act: any, idx: number) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 rounded-lg text-xs flex items-center justify-between text-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Concept: {act.conceptId}</span>
                    <span className="text-slate-400">({act.timestamp})</span>
                  </div>
                  <span
                    className={`font-semibold capitalize text-[11px] ${
                      act.result === 'verified'
                        ? 'text-emerald-700'
                        : act.result === 'struggling'
                        ? 'text-rose-700'
                        : 'text-indigo-700'
                    }`}
                  >
                    Level {act.difficulty} • {act.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Close Drill-Down
          </button>
        </div>
      </div>
    </div>
  );
};
