import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Languages,
  CheckCircle2,
  ArrowRight,
  User,
  ShieldCheck,
  Brain,
} from 'lucide-react';
import { CURRICULUM_BOARDS } from '../data/curriculum';
import { MOCK_STUDENTS } from '../data/mockClassroom';
import { StudentProfile, LanguageMode } from '../types';

interface OnboardingModalProps {
  currentStudent: StudentProfile;
  onSelectPersona: (student: StudentProfile) => void;
  onSelectBoard: (boardId: string) => void;
  onSelectGrade: (grade: number) => void;
  onSelectLanguage: (lang: LanguageMode) => void;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  currentStudent,
  onSelectPersona,
  onSelectBoard,
  onSelectGrade,
  onSelectLanguage,
  onComplete,
}) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(
    currentStudent.id
  );
  const [selectedBoard, setSelectedBoard] = useState<string>(
    currentStudent.selectedBoardId || 'IN.AP-SSC'
  );
  const [selectedGrade, setSelectedGrade] = useState<number>(
    currentStudent.grade || 8
  );
  const [selectedLang, setSelectedLang] = useState<LanguageMode>(
    currentStudent.preferredLanguage || 'bilingual'
  );

  const personas = [
    {
      id: 'stu-1',
      profile: MOCK_STUDENTS[0], // Sai Teja
      headline: 'Student A (Remedial Adaptive Journey)',
      personaDescription:
        'Diagnosed with sign inversion errors when transposing terms across equality. Needs bilingual Telugu visual balance scaffolding.',
      badge: 'Misconception Flagged',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    {
      id: 'stu-2',
      profile: MOCK_STUDENTS[1], // Ananya Sharma
      headline: 'Student B (Mastery & Acceleration Journey)',
      personaDescription:
        'Demonstrates consistent procedural arithmetic (92% accuracy). Ready for transfer challenges and real-world modeling.',
      badge: 'Fast-Track Mastery',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
  ];

  const handleApply = () => {
    const chosen =
      MOCK_STUDENTS.find((s) => s.id === selectedPersonaId) || MOCK_STUDENTS[0];
    const updated: StudentProfile = {
      ...chosen,
      selectedBoardId: selectedBoard,
      grade: selectedGrade,
      preferredLanguage: selectedLang,
    };
    onSelectPersona(updated);
    onSelectBoard(selectedBoard);
    onSelectGrade(selectedGrade);
    onSelectLanguage(selectedLang);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-7 relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  Welcome to AhaPath
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  AI + Deterministic Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Adaptive Personalized Learning Companion for School Curricula
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* 1. Verified Demo Personas */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              1. Choose Demo Learner Persona (A/B Test Adaptive Paths):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {personas.map((p) => {
                const isSelected = selectedPersonaId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPersonaId(p.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-300 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={p.profile.avatar}
                          alt={p.profile.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-300"
                        />
                        <span className="font-bold text-xs text-slate-900">
                          {p.profile.name}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${p.badgeColor}`}
                      >
                        {p.badge}
                      </span>
                    </div>

                    <p className="text-[11px] font-bold text-slate-700">
                      {p.headline}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {p.personaDescription}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Curriculum Board & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                2. Education Board:
              </label>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              >
                {CURRICULUM_BOARDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                3. Class / Grade:
              </label>
              <div className="flex gap-2">
                {[8, 9, 10].map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setSelectedGrade(grade)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedGrade === grade
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Class {grade}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Language Delivery Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              4. Language & Pedagogical Scaffolding:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'en', label: 'English Only', sub: 'Standard terminology' },
                { id: 'te', label: 'తెలుగు (Telugu)', sub: 'పూర్తి తెలుగు వివరణ' },
                { id: 'bilingual', label: 'Bilingual (ద్విభాషా)', sub: 'English + తెలుగు Side-by-Side' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setSelectedLang(lang.id as LanguageMode)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedLang === lang.id
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold ring-2 ring-amber-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs">{lang.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{lang.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleApply}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Begin Personalized Learning Journey</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
