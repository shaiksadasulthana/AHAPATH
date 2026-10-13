import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  TrendingUp,
  Brain,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Languages,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  Award,
  Bell,
  Clock,
  Send,
  Zap,
} from 'lucide-react';
import {
  StudentProfile,
  TeacherInsights,
  LanguageMode,
  EarlyWarningAlert,
} from '../../types';
import { CURRICULUM } from '../../data/curriculum';
import { MOCK_EARLY_WARNING_ALERTS } from '../../data/mockClassroom';
import { requestTeacherInsights } from '../../services/api';

interface TeacherDashboardProps {
  students: StudentProfile[];
  insights: TeacherInsights;
  languageMode: LanguageMode;
  onSelectStudent: (student: StudentProfile) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  insights: initialInsights,
  languageMode,
  onSelectStudent,
}) => {
  const [insights, setInsights] = useState<TeacherInsights>(initialInsights);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedConceptFilter, setSelectedConceptFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'groups' | 'lesson-plan'>('matrix');
  const [alertsList, setAlertsList] = useState<EarlyWarningAlert[]>(MOCK_EARLY_WARNING_ALERTS);
  const [sentAlertToast, setSentAlertToast] = useState<string | null>(null);

  const handleSendWarningToStudent = (alert: EarlyWarningAlert) => {
    setSentAlertToast(
      `AI Inconsistency Warning sent to ${alert.studentName}: Teacher alerted student to review concept "${alert.repeatedErrorConcept || 'equations'}" and maintain daily learning streak.`
    );
    setTimeout(() => setSentAlertToast(null), 5000);
  };

  const handleDismissAlert = (alertId: string) => {
    setAlertsList((prev) => prev.filter((a) => a.id !== alertId));
  };

  // Compute all curriculum concepts
  const allConcepts = CURRICULUM.flatMap((sub) => sub.concepts);

  // Filter students by search
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute stats
  const totalVerified = students.reduce(
    (acc, s) => acc + s.verifiedConceptsCount,
    0
  );
  const classAvgAccuracy = Math.round(
    students.reduce((acc, s) => acc + s.accuracyRate, 0) / (students.length || 1)
  );

  const handleRefreshInsights = async () => {
    setIsRefreshing(true);
    try {
      const data = await requestTeacherInsights({
        classData: {
          studentsCount: students.length,
          avgAccuracy: classAvgAccuracy,
          studentProfiles: students.map((s) => ({
            name: s.name,
            scores: s.masteryScores,
            flags: s.flaggedGaps,
          })),
        },
        className: 'Class 8-A',
      });
      setInsights(data);
    } catch (err) {
      console.error('Failed to refresh insights:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Teacher Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                <LayoutDashboard className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Educator Diagnostic Dashboard
                </h1>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Class 8-A (AP SSC / CBSE) • Mathematics & Physical Science • Real-Time Learning Analytics
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-4 leading-relaxed">
              {insights.summary}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              disabled={isRefreshing}
              onClick={handleRefreshInsights}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 text-slate-950 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span>Synthesize AI Insights</span>
            </button>
          </div>
        </div>

        {/* Decorative background flare */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Class At-a-Glance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{students.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Z.P. High School Model</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Class Accuracy
            </span>
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {classAvgAccuracy}%
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across all difficulty levels</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Verified Transfers
            </span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">
            {totalVerified}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Independent post-tests passed</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Language Preference
            </span>
            <Languages className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
              50% Bilingual
            </span>
            <span className="text-xs font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-md">
              33% తెలుగు
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Adaptive localized delivery</p>
        </div>
      </div>

      {/* Toast notification when warning alert is dispatched */}
      {sentAlertToast && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-xl border border-slate-700 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{sentAlertToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSentAlertToast(null)}
            className="text-[10px] text-slate-400 hover:text-white underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* AI Early Warning & Inconsistent Learner Detection Panel */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border-2 border-amber-300 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/80">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-xs font-black">
              <Bell className="w-5 h-5 animate-bounce" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-950">
                  AI Early Warning Detection: Inconsistent & At-Risk Learners
                </h2>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-wider">
                  {alertsList.length} Active Triggers
                </span>
              </div>
              <p className="text-xs text-amber-950 font-medium mt-0.5">
                AI continuously monitors student telemetry in background: detects app inactivity, learning inconsistency, and repeated incorrect answers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-amber-300 text-[11px] font-bold text-amber-900 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI Background Monitor: Active</span>
            </span>
          </div>
        </div>

        {/* Warning Alert Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {alertsList.map((alert) => {
            const isCritical = alert.severity === 'critical';
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 bg-white shadow-2xs ${
                  isCritical
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : 'border-amber-300 ring-1 ring-amber-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={alert.studentAvatar}
                        alt={alert.studentName}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h3 className="font-extrabold text-xs text-slate-900">
                          {alert.studentName}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold">
                          Roll: {alert.rollNumber}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {alert.type === 'inactivity'
                        ? `${alert.daysInactive}d Inactive`
                        : alert.type === 'repeated_errors'
                        ? 'Error Loop'
                        : 'Accuracy Drop'}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {alert.description}
                    </p>
                  </div>

                  <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                    <strong className="text-slate-900">Action: </strong>
                    {alert.suggestedAction}
                  </div>
                </div>

                {/* Teacher Action Row */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendWarningToStudent(alert)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02]"
                    title="Send warning alert & motivational nudge to student"
                  >
                    <Send className="w-3 h-3 text-slate-950" />
                    <span>Send Warning Alert</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const stu = students.find((s) => s.id === alert.studentId);
                      if (stu) onSelectStudent(stu);
                    }}
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold"
                    title="Inspect student diagnostic logs"
                  >
                    <Users className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDismissAlert(alert.id)}
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700 text-xs"
                    title="Acknowledge / Dismiss alert"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical Learning Gaps Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Identified Concept Learning Gaps (విశ్లేషణాత్మక లోపాలు)
              </h2>
              <p className="text-xs text-slate-500">
                Explainable diagnostic rules flagged across class assessment logs
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            {insights.topLearningGaps.length} Actionable Alerts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {insights.topLearningGaps.map((gap, gIdx) => (
            <div
              key={gIdx}
              className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{gap.concept}</h3>
                  <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full shrink-0">
                    {gap.affectedStudentsPercent}% of class
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                  <strong className="text-slate-900">Remedy: </strong>
                  {gap.pedagogicalRemedy}
                </p>
              </div>

              {gap.affectedStudentNames && gap.affectedStudentNames.length > 0 && (
                <div className="pt-2 border-t border-rose-200/80">
                  <span className="text-[11px] font-semibold text-slate-500 mr-2">
                    Needs support:
                  </span>
                  <div className="inline-flex flex-wrap gap-1 mt-1">
                    {gap.affectedStudentNames.map((name, sIndex) => (
                      <span
                        key={sIndex}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-800 border border-rose-200 shadow-2xs"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs: Class Mastery Matrix / Differentiated Groups / Lesson Plan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 pt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all ${
                activeTab === 'matrix'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Class Mastery Heatmap (తరగతి మ్యాట్రిక్స్)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all ${
                activeTab === 'groups'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Differentiated Groups ({insights.differentiatedGroups.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lesson-plan')}
              className={`px-4 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all ${
                activeTab === 'lesson-plan'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Tomorrow's Action Plan
            </button>
          </div>

          {activeTab === 'matrix' && (
            <div className="hidden sm:flex items-center gap-2 pb-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Real-time Concept Mastery Heatmap Matrix */}
        {activeTab === 'matrix' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 min-w-[180px]">Student</th>
                    <th className="py-3 px-2 text-center">Lang</th>
                    {allConcepts.map((c) => (
                      <th
                        key={c.id}
                        className="py-3 px-3 text-center min-w-[110px]"
                        title={c.titleEn}
                      >
                        <div className="truncate font-semibold text-slate-700">
                          {c.titleEn.split(' ')[0]} {c.titleEn.split(' ')[1] || ''}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          L{c.difficultyFloor}-L{c.difficultyCeiling}
                        </div>
                      </th>
                    ))}
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.map((stu) => {
                    return (
                      <tr
                        key={stu.id}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={stu.avatar}
                              alt={stu.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {stu.name}
                              </span>
                              <span className="block text-[10px] text-slate-400">
                                {stu.rollNumber} • {stu.accuracyRate}% acc
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-2 text-center">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                            {stu.preferredLanguage}
                          </span>
                        </td>

                        {allConcepts.map((c) => {
                          const score = stu.masteryScores[c.id] ?? 40;
                          let cellColor =
                            'bg-amber-100 text-amber-900 border-amber-200';
                          if (score >= 75) {
                            cellColor =
                              'bg-emerald-100 text-emerald-900 border-emerald-200';
                          } else if (score < 50) {
                            cellColor =
                              'bg-rose-100 text-rose-900 border-rose-200 font-bold';
                          }

                          return (
                            <td key={c.id} className="py-3 px-3 text-center">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${cellColor}`}
                              >
                                {score}%
                              </span>
                            </td>
                          );
                        })}

                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => onSelectStudent(stu)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Differentiated Student Groups */}
        {activeTab === 'groups' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {insights.differentiatedGroups.map((group, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                      Tier {idx + 1}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {group.studentCount} Students
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-2">
                    {group.groupName}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {group.keyFocus}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                    Assigned Students:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.studentNames.map((sName, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-xs font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs"
                      >
                        {sName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Actionable Lesson Plan for Tomorrow */}
        {activeTab === 'lesson-plan' && (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-950 text-sm">
                  Recommended Targeted 45-Minute Lesson Adjustments
                </h4>
                <p className="text-xs text-amber-900/90 mt-0.5">
                  Synthesized directly from aggregate student telemetry & verified transfer logs
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {insights.teacherActionPlanTomorrow.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-start gap-3.5"
                >
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                      {step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
