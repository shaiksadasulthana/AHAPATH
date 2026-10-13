export type LanguageMode = 'en' | 'te' | 'bilingual';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export type ContentCoverageStatus =
  | 'catalog_only'
  | 'lesson_ready'
  | 'assessment_ready'
  | 'reviewed'
  | 'retired';

export type QuestionType = 'multiple_choice' | 'numerical' | 'short_answer';

export type AssessmentContext =
  | 'diagnostic'
  | 'guided_practice'
  | 'independent_assessment'
  | 'transfer_question'
  | 'challenge'
  | 'remediation';

export type AdaptiveAction =
  | 'diagnostic'
  | 'explain'
  | 'prerequisite_review'
  | 'targeted_review'
  | 'show_example'
  | 'guided_practice'
  | 'independent_assessment'
  | 'transfer_question'
  | 'challenge'
  | 'advance'
  | 'complete';

export type MindMapNodeState =
  | 'not_started'
  | 'available'
  | 'learning'
  | 'needs_review'
  | 'mastered';

export interface MindMapNode {
  id: string;
  labelEn: string;
  labelTe: string;
  state: MindMapNodeState;
  masteryPercent: number;
  isCurrent?: boolean;
}

export interface MindMapEdge {
  from: string;
  to: string;
  relationship: 'prerequisite_of' | 'builds_on' | 'related_to';
}

export interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export type LearningPace = 'fast' | 'standard' | 'foundation';

export interface PersonalizedLearningPath {
  pace: LearningPace;
  titleEn: string;
  titleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  recommendedSteps: {
    order: number;
    titleEn: string;
    titleTe: string;
    type:
      | 'concept_mindmap'
      | 'decision_flowchart'
      | 'visual_manipulative'
      | 'guided_practice'
      | 'transfer_challenge';
    status: 'current' | 'upcoming' | 'completed';
  }[];
  scaffoldingLevel: 'minimal' | 'moderate' | 'intensive';
  estimatedMinutes: number;
}

export interface FlowchartStep {
  id: string;
  stepNumber: number;
  labelEn: string;
  labelTe: string;
  decisionRuleEn?: string;
  decisionRuleTe?: string;
  actionEn: string;
  actionTe: string;
  mathExampleEn?: string;
  mathExampleTe?: string;
  visualIcon?: string;
}

export interface FlowchartData {
  conceptId: string;
  titleEn: string;
  titleTe: string;
  steps: FlowchartStep[];
}

export interface Concept {
  id: string; // e.g. 'class8.math.linear-eq.balance'
  curriculumId: string; // 'IN.AP-SSC' | 'IN.CBSE'
  grade: number; // 8, 9, 10
  gradeLevel?: string;
  subjectId: string;
  chapterId: string;
  titleEn: string;
  titleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  learningObjectives: string[];
  prerequisiteIds: string[];
  difficultyFloor: DifficultyLevel;
  difficultyCeiling: DifficultyLevel;
  coverageStatus: ContentCoverageStatus;
  contentVersion: number;
  sourceAttribution?: string;
  iconName?: string;
}

export interface Chapter {
  id: string;
  titleEn: string;
  titleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  conceptIds: string[];
  coverageStatus: ContentCoverageStatus;
}

export interface Subject {
  id: string;
  nameEn: string;
  nameTe: string;
  descriptionEn: string;
  descriptionTe: string;
  themeColor: string;
  icon: string;
  chapters: Chapter[];
  concepts: Concept[];
}

export interface CurriculumBoard {
  id: string;
  nameEn: string;
  nameTe: string;
  country: string;
  supportedGrades: number[];
}

export interface QuestionOption {
  id: string;
  textEn: string;
  textTe: string;
  revealsMisconceptionCode?: string;
  revealsMisconceptionEn?: string;
  revealsMisconceptionTe?: string;
}

export interface Question {
  id: string;
  conceptId: string;
  learningObjective?: string;
  difficulty: DifficultyLevel;
  type: QuestionType;
  context: AssessmentContext;
  promptEn: string;
  promptTe: string;
  options: QuestionOption[];
  correctOptionId: string;
  hintEn: string;
  hintTe: string;
  explanationEn: string;
  explanationTe: string;
  sourceAttribution?: string;
  verificationStatus: 'verified_official' | 'reviewed' | 'draft';
}

export interface AnswerSubmissionResult {
  isCorrect: boolean;
  selectedOptionId: string;
  correctOptionId: string;
  explanationEn: string;
  explanationTe: string;
  misconceptionDetected?: {
    code: string;
    descriptionEn: string;
    descriptionTe: string;
    suggestedRemediation: string;
  };
  targetedConcept?: {
    id: string;
    titleEn: string;
    titleTe: string;
    reason: string;
  };
}

export interface SubjectChatMessage {
  id: string;
  role: 'user' | 'assistant';
  contentEn: string;
  contentTe?: string;
  keySteps?: string[];
  targetedConceptId?: string;
  targetedConceptTitle?: string;
  timestamp: string;
}

export interface AdaptiveDecision {
  action: AdaptiveAction;
  conceptId: string;
  targetPrerequisiteId?: string;
  reasonCodes: string[];
  explanation: string;
  evidence: {
    attemptIds: string[];
    consecutiveCorrect: number;
    consecutiveErrors: number;
    masteryScore: number;
    identifiedMisconceptionCodes: string[];
  };
  policyVersion: number;
}

export interface StructuredLesson {
  conceptId: string;
  lessonType: 'interactive_visual' | 'prerequisite_review' | 'worked_example_focus';
  title: string;
  learningObjective: string;
  studentFriendlyExplanation: string;
  teluguExplanation: string;
  analogy: string;
  teluguAnalogy: string;
  mindMap: MindMapData;
  explanationSteps: {
    stepNumber: number;
    titleEn: string;
    titleTe: string;
    detailEn: string;
    detailTe: string;
    whyItMatters: string;
  }[];
  workedExample: {
    problemStatementEn: string;
    problemStatementTe: string;
    solutionSteps: string[];
    teluguSolutionSteps: string[];
    finalAnswer: string;
  };
  hint: string;
  teluguHint: string;
  checkForUnderstanding: {
    promptEn: string;
    promptTe: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  sourceIds: string[];
  contentVersion: number;
}

export interface GroundedQAResponse {
  conceptId: string;
  studentQuestion: string;
  answerEn: string;
  answerTe: string;
  socraticPrompt: string;
  groundedFactsUsed: string[];
  relatedConceptSuggestion?: string;
}

export interface StudentAttemptRecord {
  id: string;
  timestamp: string;
  questionId: string;
  conceptId: string;
  context: AssessmentContext;
  isCorrect: boolean;
  selectedOptionId: string;
  misconceptionCode?: string;
  timeSpentSeconds: number;
}

export interface PrePostGrowthRecord {
  conceptId: string;
  conceptTitleEn: string;
  conceptTitleTe: string;
  preTestScore: number; // 0-100
  postTestScore: number; // 0-100
  netGrowthPercent: number; // e.g. +45%
  dateCompleted: string;
  status: 'verified_growth' | 'needs_practice' | 'in_progress';
}

export interface EarlyWarningAlert {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  rollNumber: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'inactivity' | 'repeated_errors' | 'accuracy_drop' | 'disengaged';
  title: string;
  description: string;
  daysInactive?: number;
  repeatedErrorConcept?: string;
  suggestedAction: string;
  timestamp: string;
  isDismissed?: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  avatar: string;
  selectedBoardId: string;
  grade: number;
  preferredLanguage: LanguageMode;
  masteryScores: Record<string, number>; // conceptId -> score (0-100)
  conceptAttempts: Record<string, number>; // conceptId -> count
  consecutiveCorrect: Record<string, number>;
  repeatedMisconceptions: Record<string, string[]>; // conceptId -> codes
  verifiedConceptsCount: number;
  currentStreakDays: number;
  totalQuestionsSolved: number;
  accuracyRate: number;
  attemptHistory: StudentAttemptRecord[];
  recentActivity?: {
    conceptId: string;
    timestamp: string;
    result: string;
    difficulty: number;
  }[];
  flaggedGaps: string[];
  prePostGrowthHistory: PrePostGrowthRecord[];
  daysInactive: number;
  inconsistencyFlag: boolean;
  overallNetGrowthPercent: number;
  learningVelocity: 'accelerated' | 'steady' | 'remedial_required';
  academicAttendanceDays: number;
}

export interface DiagnosticResult {
  misconceptionType: string;
  ruleTriggered: string;
  rootCause: string;
  remediationPlan: string;
  teluguExplanation: string;
  confidence: number;
  recommendedDifficulty: DifficultyLevel;
  prerequisiteGaps: string[];
}

export interface PedagogicalExplanation {
  title: string;
  englishExplanation: string;
  teluguExplanation: string;
  analogy: string;
  teluguAnalogy: string;
  stepByStepGuide: string[];
  teluguStepByStep: string[];
  quickCheckQuestion?: {
    promptEn: string;
    promptTe: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface VerificationProbe {
  verificationGoal: string;
  questionEn: string;
  questionTe: string;
  optionsEn: string[];
  optionsTe: string[];
  correctIndex: number;
  explanationEn: string;
  explanationTe: string;
  transferMetric: string;
}

export interface LearningGap {
  concept: string;
  conceptId: string;
  affectedStudentsPercent: number;
  affectedStudentNames: string[];
  pedagogicalRemedy: string;
}

export interface DifferentiatedGroup {
  groupName: string;
  studentCount: number;
  keyFocus: string;
  studentNames: string[];
}

export interface TeacherInsights {
  summary: string;
  urgencyLevel: string;
  topLearningGaps: LearningGap[];
  differentiatedGroups: DifferentiatedGroup[];
  teacherActionPlanTomorrow: string[];
}
