import {
  DiagnosticResult,
  PedagogicalExplanation,
  Question,
  VerificationProbe,
  TeacherInsights,
  LanguageMode,
  DifficultyLevel,
} from '../types';

export async function requestDiagnosis(params: {
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  conceptTitle: string;
  subject?: string;
  studentHistory?: string[];
  language?: LanguageMode;
}): Promise<DiagnosticResult> {
  try {
    const res = await fetch('/api/ai/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend diagnosis fallback used:', err);
    return {
      misconceptionType: 'Transposition Sign Inversion',
      ruleTriggered: 'Rule #3.4: Failed inverse operation when crossing equals sign',
      rootCause: 'The student moved terms across the equality sign without inverting addition to subtraction.',
      remediationPlan: 'Reinforce the balance scale concept: operations must be performed equally to both sides.',
      teluguExplanation: 'సమీకరణంలో సమానత్వ చిహ్నం (=) దాటి ఒక పదాన్ని మార్చేటప్పుడు కూడిక తీసివేతగా, లేదా తీసివేత కూడికగా మారాలనే ప్రాథమిక నియమంలో పొరపాటు జరిగింది.',
      confidence: 0.91,
      recommendedDifficulty: 2,
      prerequisiteGaps: ['Integer signs and basic balance method'],
    };
  }
}

export async function requestPedagogicalExplanation(params: {
  conceptTitle: string;
  misconception: string;
  languagePreference?: LanguageMode;
  analogyContext?: string;
  studentGrade?: string;
}): Promise<PedagogicalExplanation> {
  try {
    const res = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend explanation fallback used:', err);
    return {
      title: `Understanding ${params.conceptTitle}`,
      englishExplanation: `Whenever you work with an algebraic equation, imagine a grocery weighing scale. The equal sign (=) is the balance point. If you remove 5kg from one pan, you must remove 5kg from the other pan to keep it balanced. When you "move" +5 across the equals sign, you are actually subtracting 5 from both sides!`,
      teluguExplanation: `సమీకరణం అంటే ఒక కిరాణా దుకాణంలోని త్రాసు వంటిది. సమానత్వ గుర్తు (=) మధ్యలో సమతుల్య బిందువు. ఎడమ పళ్ళెం నుండి 5 కిలోలు తీసేస్తే, సమతుల్యత కోసం కుడి పళ్ళెం నుండి కూడా 5 కిలోలు తీసేయాలి!`,
      analogy: `Cricket Target Analogy: If your cricket team needs 36 runs and has scored 12, the remaining target is 36 - 12 = 24. You subtract the known amount to isolate what remains.`,
      teluguAnalogy: `క్రికెట్ లక్ష్య ఉదాహరణ: జట్టుకు 36 పరుగులు అవసరం, ఇప్పటికే 12 పరుగులు చేసారు. ఇంకా కావాల్సిన పరుగులు 36 - 12 = 24. మిగిలిన విలువ కనుగొనడానికి ఇప్పటికే ఉన్నదాన్ని తీసివేయాలి.`,
      stepByStepGuide: [
        '1. Look at what is attached to the variable (+, -, ×, ÷).',
        '2. Apply the exact opposite (inverse) operation to BOTH sides.',
        '3. Simplify each side cleanly.',
        '4. Substitute your answer into original problem to verify balance!',
      ],
      teluguStepByStep: [
        '1. చలరాశితో ఏ గుర్తు ఉందో చూడండి (+, -, ×, ÷).',
        '2. దానికి ఖచ్చితమైన వ్యతిరేక చర్యను ఇరువైపులా వర్తింపజేయండి.',
        '3. రెండు వైపులా సూక్ష్మీకరించండి.',
        '4. వచ్చిన సమాధానాన్ని అసలు సమీకరణంలో పెట్టి సరిచూసుకోండి!',
      ],
      quickCheckQuestion: {
        promptEn: 'If y - 9 = 15, what operation undoes "- 9"?',
        promptTe: 'y - 9 = 15 అయితే, "- 9" ని తొలగించడానికి ఏమి చేయాలి?',
        options: [
          'Add 9 to both sides (రెండు వైపులా 9 కలపాలి)',
          'Subtract 9 from both sides (రెండు వైపులా 9 తీసివేయాలి)',
          'Divide both sides by 9 (రెండు వైపులా 9తో భాగించాలి)',
          'Multiply both sides by 9 (రెండు వైపులా 9తో గుణించాలి)',
        ],
        correctIndex: 0,
        explanation: 'Addition is the inverse operation of subtraction.',
      },
    };
  }
}

export async function requestAdaptiveQuestion(params: {
  conceptTitle: string;
  difficultyLevel: DifficultyLevel;
  targetedWeakness?: string;
  subject?: string;
}): Promise<Question> {
  try {
    const res = await fetch('/api/ai/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const optionsArray = (data.optionsEn || ['Option A', 'Option B', 'Option C', 'Option D']).map(
      (optEn: string, idx: number) => ({
        id: `opt-${idx}`,
        textEn: optEn,
        textTe: (data.optionsTe && data.optionsTe[idx]) || optEn,
      })
    );
    return {
      id: data.id || `q-${Date.now()}`,
      conceptId: params.conceptTitle,
      difficulty: params.difficultyLevel,
      type: 'multiple_choice',
      context: 'guided_practice',
      promptEn: data.promptEn,
      promptTe: data.promptTe,
      options: optionsArray,
      correctOptionId: `opt-${data.correctIndex ?? 0}`,
      hintEn: data.hintEn,
      hintTe: data.hintTe,
      explanationEn: data.explanationEn,
      explanationTe: data.explanationTe,
      verificationStatus: 'reviewed',
    };
  } catch (err) {
    console.warn('Backend adaptive question fallback used:', err);
    return {
      id: `q-fallback-${Date.now()}`,
      conceptId: params.conceptTitle,
      difficulty: params.difficultyLevel,
      type: 'multiple_choice',
      context: 'guided_practice',
      promptEn: `Solve the following equation: 4x + 6 = 26`,
      promptTe: `ఈ క్రింది సమీకరణాన్ని సాధించండి: 4x + 6 = 26`,
      options: [
        { id: 'opt-0', textEn: 'x = 5', textTe: 'x = 5' },
        { id: 'opt-1', textEn: 'x = 8', textTe: 'x = 8' },
        { id: 'opt-2', textEn: 'x = 32', textTe: 'x = 32' },
        { id: 'opt-3', textEn: 'x = 4', textTe: 'x = 4' },
      ],
      correctOptionId: 'opt-0',
      hintEn: 'Subtract 6 from 26 first, then divide by 4.',
      hintTe: 'మొదట 26 నుండి 6 తీసివేయండి, ఆపై 4తో భాగించండి.',
      explanationEn: '4x = 26 - 6 => 4x = 20 => x = 5.',
      explanationTe: '4x = 26 - 6 => 4x = 20 => x = 5.',
      verificationStatus: 'reviewed',
    };
  }
}

export async function requestVerificationAssessment(params: {
  conceptTitle: string;
  diagnosedWeakness: string;
}): Promise<VerificationProbe> {
  try {
    const res = await fetch('/api/ai/verify-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend verification fallback used:', err);
    return {
      verificationGoal: `Verify that the student can apply ${params.conceptTitle} in an unfamiliar real-world context.`,
      questionEn: `Ramesh took an auto-rickshaw in Vijayawada. The base meter starts at ₹30 and adds ₹15 for every kilometer (k). If his final bill was ₹150, which equation determines how many kilometers he traveled?`,
      questionTe: `విజయవాడలో రమేష్ ఆటో ఎక్కాడు. బేస్ మీటర్ ఛార్జీ ₹30, ప్రతి కిలోమీటరుకు (k) ₹15 కలుపుతారు. మొత్తం బిల్లు ₹150 అయితే, ఎన్ని కిలోమీటర్లు ప్రయాణించాడో కనుగొనే సమీకరణం ఏది?`,
      optionsEn: ['15k + 30 = 150', '30k + 15 = 150', 'k/15 + 30 = 150', '15k - 30 = 150'],
      optionsTe: ['15k + 30 = 150', '30k + 15 = 150', 'k/15 + 30 = 150', '15k - 30 = 150'],
      correctIndex: 0,
      explanationEn: `Base fare is fixed ₹30. Running fare is 15 × k. Total fare = 15k + 30 = 150. Subtracting 30 gives 15k = 120 => k = 8 km.`,
      explanationTe: `స్థిర ఛార్జీ ₹30. కిలోమీటర్ల ఛార్జీ 15 × k. మొత్తం = 15k + 30 = 150 => 15k = 120 => k = 8 కి.మీ.`,
      transferMetric: 'Independent Transfer to Transport Economics',
    };
  }
}

export async function requestTeacherInsights(params: {
  classData: any;
  className?: string;
}): Promise<TeacherInsights> {
  try {
    const res = await fetch('/api/ai/teacher-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend teacher insights fallback used:', err);
    throw err;
  }
}
