import {
  AdaptiveDecision,
  Concept,
  StudentProfile,
  StudentAttemptRecord,
} from '../types';

export const ADAPTIVE_POLICY_VERSION = 1;

export interface AdaptiveEvaluationInput {
  concept: Concept;
  student: StudentProfile;
  prerequisites: Concept[];
  recentAttemptsForConcept: StudentAttemptRecord[];
}

/**
 * Deterministic Adaptive Learning Engine
 * Implements rule-based, evidence-backed sequencing without black-box overrides.
 */
export function determineNextAdaptiveAction(
  input: AdaptiveEvaluationInput
): AdaptiveDecision {
  const { concept, student, prerequisites, recentAttemptsForConcept } = input;
  const conceptId = concept.id;
  const mastery = student.masteryScores[conceptId] ?? 20;
  const attempts = recentAttemptsForConcept;
  const attemptIds = attempts.map((a) => a.id);
  const consecutiveCorrect = student.consecutiveCorrect[conceptId] ?? 0;
  const totalAttemptsCount = attempts.length;

  // 1. Check prerequisite health first
  for (const prereq of prerequisites) {
    const prereqMastery = student.masteryScores[prereq.id] ?? 0;
    if (prereqMastery < 50) {
      const recentErrors = attempts.slice(-2).filter((a) => !a.isCorrect);
      if (recentErrors.length > 0) {
        return {
          action: 'prerequisite_review',
          conceptId: concept.id,
          targetPrerequisiteId: prereq.id,
          reasonCodes: ['prerequisite_below_threshold', 'recent_concept_struggle'],
          explanation: `Prerequisite "${prereq.titleEn}" mastery is ${prereqMastery}% (below required 50%). Reviewing foundational concept before continuing.`,
          evidence: {
            attemptIds,
            consecutiveCorrect,
            consecutiveErrors: recentErrors.length,
            masteryScore: mastery,
            identifiedMisconceptionCodes: recentErrors
              .map((e) => e.misconceptionCode || '')
              .filter(Boolean),
          },
          policyVersion: ADAPTIVE_POLICY_VERSION,
        };
      }
    }
  }

  // 2. Initial state: Diagnostic check
  if (totalAttemptsCount < 2) {
    return {
      action: 'diagnostic',
      conceptId: concept.id,
      reasonCodes: ['initial_diagnostic_intake'],
      explanation:
        'Beginning diagnostic baseline assessment to measure current conceptual foundation.',
      evidence: {
        attemptIds,
        consecutiveCorrect,
        consecutiveErrors: 0,
        masteryScore: mastery,
        identifiedMisconceptionCodes: [],
      },
      policyVersion: ADAPTIVE_POLICY_VERSION,
    };
  }

  // 3. Repeated Misconception Pattern Detection
  const recentMisconceptions = attempts
    .slice(-3)
    .map((a) => a.misconceptionCode)
    .filter((c): c is string => Boolean(c));

  const misconceptionCounts: Record<string, number> = {};
  for (const code of recentMisconceptions) {
    misconceptionCounts[code] = (misconceptionCounts[code] || 0) + 1;
  }

  const repeatedCode = Object.keys(misconceptionCounts).find(
    (code) => misconceptionCounts[code] >= 2
  );

  if (repeatedCode) {
    return {
      action: 'targeted_review',
      conceptId: concept.id,
      reasonCodes: ['repeated_misconception_detected', `misconception_${repeatedCode}`],
      explanation: `System detected repeated misconception pattern (${repeatedCode}). Triggering targeted remedial lesson with real-world analogy.`,
      evidence: {
        attemptIds,
        consecutiveCorrect,
        consecutiveErrors: 2,
        masteryScore: mastery,
        identifiedMisconceptionCodes: [repeatedCode],
      },
      policyVersion: ADAPTIVE_POLICY_VERSION,
    };
  }

  // 4. Consecutive Errors -> Step-by-Step Worked Example
  const lastTwoAttempts = attempts.slice(-2);
  const consecutiveFailures =
    lastTwoAttempts.length === 2 && lastTwoAttempts.every((a) => !a.isCorrect);

  if (consecutiveFailures) {
    return {
      action: 'show_example',
      conceptId: concept.id,
      reasonCodes: ['consecutive_errors_remediation'],
      explanation:
        'Student encountered difficulty on two consecutive questions. Providing detailed worked example with step-by-step reasoning.',
      evidence: {
        attemptIds,
        consecutiveCorrect: 0,
        consecutiveErrors: 2,
        masteryScore: mastery,
        identifiedMisconceptionCodes: recentMisconceptions,
      },
      policyVersion: ADAPTIVE_POLICY_VERSION,
    };
  }

  // 5. Transfer & Challenge verification for high mastery
  if (mastery >= 88 && consecutiveCorrect >= 2) {
    const hasTransferAttempt = attempts.some(
      (a) => a.context === 'transfer_question' && a.isCorrect
    );
    if (!hasTransferAttempt) {
      return {
        action: 'transfer_question',
        conceptId: concept.id,
        reasonCodes: ['mastery_high_ready_for_transfer'],
        explanation:
          'High baseline mastery achieved. Administering independent transfer assessment in an unfamiliar real-world domain.',
        evidence: {
          attemptIds,
          consecutiveCorrect,
          consecutiveErrors: 0,
          masteryScore: mastery,
          identifiedMisconceptionCodes: [],
        },
        policyVersion: ADAPTIVE_POLICY_VERSION,
      };
    }

    return {
      action: 'challenge',
      conceptId: concept.id,
      reasonCodes: ['transfer_verified_ready_for_challenge'],
      explanation:
        'Independent transfer verified! Offering advanced Level 5 synthesis challenge.',
      evidence: {
        attemptIds,
        consecutiveCorrect,
        consecutiveErrors: 0,
        masteryScore: mastery,
        identifiedMisconceptionCodes: [],
      },
      policyVersion: ADAPTIVE_POLICY_VERSION,
    };
  }

  // 6. Independent Assessment gating
  if (consecutiveCorrect >= 2 && mastery >= 65) {
    return {
      action: 'independent_assessment',
      conceptId: concept.id,
      reasonCodes: ['consecutive_practice_correct', 'ready_for_independent_test'],
      explanation:
        'Student demonstrated consistent guided practice. Administering independent assessment without answer revelation.',
      evidence: {
        attemptIds,
        consecutiveCorrect,
        consecutiveErrors: 0,
        masteryScore: mastery,
        identifiedMisconceptionCodes: [],
      },
      policyVersion: ADAPTIVE_POLICY_VERSION,
    };
  }

  // 7. Default guided practice
  return {
    action: 'guided_practice',
    conceptId: concept.id,
    reasonCodes: ['in_progress_practice'],
    explanation:
      'Continuing guided practice with progressive hints and difficulty calibration.',
    evidence: {
      attemptIds,
      consecutiveCorrect,
      consecutiveErrors: 0,
      masteryScore: mastery,
      identifiedMisconceptionCodes: recentMisconceptions,
    },
    policyVersion: ADAPTIVE_POLICY_VERSION,
  };
}
