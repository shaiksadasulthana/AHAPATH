import React from 'react';
import {
  Sparkles,
  GraduationCap,
  LayoutDashboard,
  Languages,
  Sliders,
  Cpu,
  MessageSquare,
  Award,
} from 'lucide-react';
import { LanguageMode, StudentProfile } from '../types';

interface NavbarProps {
  currentView: 'student' | 'teacher';
  onViewChange: (view: 'student' | 'teacher') => void;
  languageMode: LanguageMode;
  onLanguageChange: (mode: LanguageMode) => void;
  students: StudentProfile[];
  currentStudent: StudentProfile;
  onStudentChange: (student: StudentProfile) => void;
  onOpenOnboarding: () => void;
  onOpenSubjectTutor: () => void;
  onOpenPortfolio?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  languageMode,
  onLanguageChange,
  students,
  currentStudent,
  onStudentChange,
  onOpenOnboarding,
  onOpenSubjectTutor,
  onOpenPortfolio,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  AhaPath
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  ఆహా-పాత్
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Adaptive Learning Companion • {currentStudent.selectedBoardId || 'IN.AP-SSC'} Class {currentStudent.grade || 8}
              </p>
            </div>
          </div>

          {/* Mode Switcher: Student vs Teacher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => onViewChange('student')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'student'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <span>Student Portal</span>
              <span className="hidden md:inline text-[10px] text-slate-400">| విద్యార్థి</span>
            </button>
            <button
              type="button"
              onClick={() => onViewChange('teacher')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'teacher'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-600" />
              <span>Teacher Intelligence</span>
              <span className="hidden md:inline text-[10px] text-slate-400">| ఉపాధ్యాయుడు</span>
            </button>
          </div>

          {/* Controls: Language Selector, Persona, Settings */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  languageMode === 'en'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="English explanations only"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('te')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all font-telugu ${
                  languageMode === 'te'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="తెలుగు వివరణలు మాత్రమే"
              >
                తెలుగు
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('bilingual')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  languageMode === 'bilingual'
                    ? 'bg-amber-500 text-white shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Bilingual: English + Telugu side-by-side"
              >
                <span className="flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Bilingual</span>
                </span>
              </button>
            </div>

            {/* Persona Switcher */}
            {currentView === 'student' && (
              <div className="relative flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="w-8 h-8 rounded-full object-cover border border-amber-300 ring-2 ring-amber-100"
                />
                <select
                  value={currentStudent.id}
                  onChange={(e) => {
                    const found = students.find((s) => s.id === e.target.value);
                    if (found) onStudentChange(found);
                  }}
                  className="text-xs font-semibold text-slate-800 bg-transparent border-0 focus:ring-0 cursor-pointer pr-3"
                  title="Switch student persona"
                >
                  {students.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.name} ({stu.rollNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Student Portfolio Button */}
            {onOpenPortfolio && currentView === 'student' && (
              <button
                type="button"
                onClick={onOpenPortfolio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs shadow-2xs transition-all hover:scale-[1.02]"
                title="Open Student Portfolio & Academic Growth Tracker"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Portfolio (పోర్ట్‌ఫోలియో)</span>
                <span className="md:hidden">Portfolio</span>
              </button>
            )}

            {/* Ask Subject AI Tutor button */}
            <button
              type="button"
              onClick={onOpenSubjectTutor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs shadow-xs transition-all hover:scale-[1.02]"
              title="Ask Subject AI Tutor (ఏదైనా సందేహం అడగండి)"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI Tutor</span>
            </button>

            {/* Settings / Onboarding button */}
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Curriculum & Board Preferences"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
