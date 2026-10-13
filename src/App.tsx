import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/student/StudentDashboard';
import { AdaptiveSession } from './components/student/AdaptiveSession';
import { VerificationModal } from './components/student/VerificationModal';
import { StudentPortfolioModal } from './components/student/StudentPortfolioModal';
import { StandardAssessmentModal } from './components/assessment/StandardAssessmentModal';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDetailModal } from './components/teacher/StudentDetailModal';
import { OnboardingModal } from './components/OnboardingModal';
import { SubjectTutorModal } from './components/SubjectTutorModal';
import { MessageSquare, Sparkles } from 'lucide-react';
import {
  StudentProfile,
  Concept,
  LanguageMode,
  TeacherInsights,
} from './types';
import { MOCK_STUDENTS, INITIAL_TEACHER_INSIGHTS } from './data/mockClassroom';
import { CURRICULUM } from './data/curriculum';

export default function App() {
  const [currentView, setCurrentView] = useState<'student' | 'teacher'>('student');
  const [languageMode, setLanguageMode] = useState<LanguageMode>('bilingual');
  const [students, setStudents] = useState<StudentProfile[]>(MOCK_STUDENTS);
  const [currentStudent, setCurrentStudent] = useState<StudentProfile>(MOCK_STUDENTS[0]);

  // Session & Modal States
  const [activeConceptForSession, setActiveConceptForSession] = useState<Concept | null>(null);
  const [verificationModalState, setVerificationModalState] = useState<{
    concept: Concept;
    weakness?: string;
  } | null>(null);
  const [inspectedStudent, setInspectedStudent] = useState<StudentProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showSubjectTutor, setShowSubjectTutor] = useState<boolean>(false);
  const [showStudentPortfolio, setShowStudentPortfolio] = useState<boolean>(false);
  const [assessmentModalState, setAssessmentModalState] = useState<{
    isOpen: boolean;
    mode: 'pre_test' | 'post_test';
    concept?: Concept;
  } | null>(null);

  const [insights, setInsights] = useState<TeacherInsights>(INITIAL_TEACHER_INSIGHTS);

  // Success toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Redirect smoothly to a targeted concept (called from wrong answers, portfolio, or AI tutor chat)
  const handleRedirectToConcept = (conceptId: string) => {
    const allConcepts = CURRICULUM.flatMap((sub) => sub.concepts);
    const target = allConcepts.find((c) => c.id === conceptId);
    if (target) {
      // Close open modals and launch targeted concept
      setVerificationModalState(null);
      setShowStudentPortfolio(false);
      setAssessmentModalState(null);
      setActiveConceptForSession(target);
      showToast(
        `Redirected to targeted concept: "${target.titleEn}". Opening personalized visual lesson.`
      );
    } else {
      showToast(`Targeted concept identified: ${conceptId}`);
    }
  };

  // Update mastery scores in state
  const handleUpdateMastery = (conceptId: string, delta: number, verified = false) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== currentStudent.id) return s;
        const currentScore = s.masteryScores[conceptId] ?? 50;
        const newScore = Math.min(Math.max(currentScore + delta, 10), 100);
        const updatedScores = { ...s.masteryScores, [conceptId]: newScore };

        const updatedStudent: StudentProfile = {
          ...s,
          masteryScores: updatedScores,
          totalQuestionsSolved: s.totalQuestionsSolved + 1,
          accuracyRate:
            delta > 0
              ? Math.min(s.accuracyRate + 1, 98)
              : Math.max(s.accuracyRate - 1, 40),
          verifiedConceptsCount: verified
            ? s.verifiedConceptsCount + 1
            : s.verifiedConceptsCount,
        };

        setCurrentStudent(updatedStudent);
        return updatedStudent;
      })
    );
  };

  // Pre-test completion handler
  const handleCompletePreTest = (startingConceptId: string, preTestScore: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== currentStudent.id) return s;
        const updatedStudent: StudentProfile = {
          ...s,
          accuracyRate: Math.round((s.accuracyRate + preTestScore) / 2),
        };
        setCurrentStudent(updatedStudent);
        return updatedStudent;
      })
    );

    const allConcepts = CURRICULUM.flatMap((sub) => sub.concepts);
    const startConcept = allConcepts.find((c) => c.id === startingConceptId) || allConcepts[0];

    showToast(
      `Class Pre-Test Diagnostic Complete (${preTestScore}%). AI has calibrated your learning path to start at: "${startConcept.titleEn}".`
    );

    // Launch into starting concept after slight delay
    setTimeout(() => {
      setAssessmentModalState(null);
      setActiveConceptForSession(startConcept);
    }, 1200);
  };

  // Post-test completion handler
  const handleCompletePostTest = (
    conceptId: string,
    postTestScore: number,
    netGrowth: number
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== currentStudent.id) return s;
        const currentScore = s.masteryScores[conceptId] ?? 40;
        const newScore = Math.max(currentScore, postTestScore);
        const updatedScores = { ...s.masteryScores, [conceptId]: newScore };

        const updatedGrowth = Math.max(s.overallNetGrowthPercent || 35, netGrowth);

        const updatedStudent: StudentProfile = {
          ...s,
          masteryScores: updatedScores,
          overallNetGrowthPercent: updatedGrowth,
          verifiedConceptsCount: s.verifiedConceptsCount + 1,
        };
        setCurrentStudent(updatedStudent);
        return updatedStudent;
      })
    );

    showToast(
      `Post-test complete! Demonstrated Net Growth: +${netGrowth}%. Concept verified on your academic portfolio!`
    );
  };

  // On independent transfer verification pass
  const handleVerificationSuccess = (conceptId: string) => {
    handleUpdateMastery(conceptId, 15, true);
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== currentStudent.id) return s;
        // Clear flagged gap if resolved
        const updatedGaps = s.flaggedGaps.filter(
          (g) => !g.toLowerCase().includes(conceptId.toLowerCase())
        );
        const updated: StudentProfile = {
          ...s,
          flaggedGaps: updatedGaps,
          verifiedConceptsCount: s.verifiedConceptsCount + 1,
        };
        setCurrentStudent(updated);
        return updated;
      })
    );
    showToast(`Concept mastery verified by independent transfer assessment! Seal awarded.`);
  };

  // Teacher assigns targeted remedial session
  const handleAssignRemediation = (studentId: string, conceptId: string) => {
    const studentObj = students.find((s) => s.id === studentId);
    const conceptObj = CURRICULUM.flatMap((sub) => sub.concepts).find(
      (c) => c.id === conceptId
    );
    if (studentObj && conceptObj) {
      showToast(
        `Assigned personalized remedial set for "${conceptObj.titleEn}" to ${studentObj.name} with bilingual scaffolding.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        languageMode={languageMode}
        onLanguageChange={setLanguageMode}
        students={students}
        currentStudent={currentStudent}
        onStudentChange={setCurrentStudent}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onOpenSubjectTutor={() => setShowSubjectTutor(true)}
        onOpenPortfolio={() => setShowStudentPortfolio(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'student' ? (
          <StudentDashboard
            student={currentStudent}
            languageMode={languageMode}
            onSelectConcept={(concept) => setActiveConceptForSession(concept)}
            onLaunchVerification={(concept) =>
              setVerificationModalState({ concept })
            }
            onOpenPortfolio={() => setShowStudentPortfolio(true)}
            onOpenPreTest={() =>
              setAssessmentModalState({ isOpen: true, mode: 'pre_test' })
            }
          />
        ) : (
          <TeacherDashboard
            students={students}
            insights={insights}
            languageMode={languageMode}
            onSelectStudent={(stu) => setInspectedStudent(stu)}
          />
        )}
      </main>

      {/* Active Adaptive Learning Session Modal */}
      {activeConceptForSession && (
        <AdaptiveSession
          concept={activeConceptForSession}
          student={currentStudent}
          languageMode={languageMode}
          onClose={() => setActiveConceptForSession(null)}
          onUpdateMastery={handleUpdateMastery}
          onLaunchVerification={(concept, weakness) => {
            setActiveConceptForSession(null);
            setVerificationModalState({ concept, weakness });
          }}
          onRedirectToConcept={handleRedirectToConcept}
        />
      )}

      {/* Independent Verification Modal */}
      {verificationModalState && (
        <VerificationModal
          concept={verificationModalState.concept}
          diagnosedWeakness={verificationModalState.weakness}
          languageMode={languageMode}
          onClose={() => setVerificationModalState(null)}
          onVerificationSuccess={handleVerificationSuccess}
        />
      )}

      {/* Student Academic Progress Portfolio Modal */}
      <StudentPortfolioModal
        isOpen={showStudentPortfolio}
        onClose={() => setShowStudentPortfolio(false)}
        student={currentStudent}
        languageMode={languageMode}
        onLaunchPreTest={() => {
          setShowStudentPortfolio(false);
          setAssessmentModalState({ isOpen: true, mode: 'pre_test' });
        }}
        onRedirectToConcept={handleRedirectToConcept}
      />

      {/* Standard / Class Baseline Pre-Test and Post-Test Growth Modal */}
      {assessmentModalState && (
        <StandardAssessmentModal
          isOpen={assessmentModalState.isOpen}
          mode={assessmentModalState.mode}
          concept={assessmentModalState.concept}
          student={currentStudent}
          languageMode={languageMode}
          onClose={() => setAssessmentModalState(null)}
          onCompletePreTest={handleCompletePreTest}
          onCompletePostTest={handleCompletePostTest}
        />
      )}

      {/* Teacher Student Detail Modal */}
      {inspectedStudent && (
        <StudentDetailModal
          student={inspectedStudent}
          languageMode={languageMode}
          onClose={() => setInspectedStudent(null)}
          onAssignRemediation={handleAssignRemediation}
        />
      )}

      {/* Onboarding & Board Switcher Modal */}
      {showOnboarding && (
        <OnboardingModal
          currentStudent={currentStudent}
          onSelectPersona={(stu) => setCurrentStudent(stu)}
          onSelectBoard={(boardId) => {
            setCurrentStudent((prev) => ({ ...prev, selectedBoardId: boardId }));
            showToast(`Switched curriculum to ${boardId}`);
          }}
          onSelectGrade={(grade) => {
            setCurrentStudent((prev) => ({ ...prev, grade }));
          }}
          onSelectLanguage={(lang) => setLanguageMode(lang)}
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      {/* Multi-Turn Subject AI Tutor Modal */}
      <SubjectTutorModal
        isOpen={showSubjectTutor}
        onClose={() => setShowSubjectTutor(false)}
        languageMode={languageMode}
        currentSubject="Mathematics & Science"
        grade={currentStudent.grade}
        onRedirectToConcept={handleRedirectToConcept}
      />

      {/* Floating Action Button for Instant Subject AI Doubts */}
      <button
        type="button"
        onClick={() => setShowSubjectTutor(true)}
        className="fixed bottom-6 left-6 z-40 px-4 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl border border-amber-300 transition-all hover:scale-105 flex items-center gap-2 group cursor-pointer"
        title="Ask any question to Subject AI Tutor with voice-to-text"
      >
        <span className="w-6 h-6 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5" />
        </span>
        <span className="tracking-wide">Ask Subject AI Tutor (సందేహం అడగండి)</span>
      </button>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          AhaPath (ఆహా-పాత్) • Curriculum-Aware AI Learning Companion
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Deterministic Adaptive Sequencing • Grounded Bilingual Pedagogy (English & తెలుగు) • Real-Time Teacher Analytics
        </p>
      </footer>
    </div>
  );
}
