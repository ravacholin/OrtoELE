export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'unassigned';

export type L1Language = 
  | 'español'
  | 'inglés'
  | 'portugués'
  | 'francés'
  | 'italiano'
  | 'alemán'
  | 'chino'
  | 'japonés'
  | 'coreano'
  | 'árabe'
  | 'ruso'
  | 'otra';

export type OrthoCategory = 
  | 'accentuation' 
  | 'spellings' 
  | 'punctuation' 
  | 'morphology' 
  | 'capitals';

export type ErrorCode = '[ORT]' | '[TIL]' | '[PUN]' | '[MA]' | '[SEG]';

export type SrsState = 'NUEVO' | 'APRENDIENDO' | 'INCIERTO' | 'ESTABLE' | 'DOMINADO';

export interface OrthoWordItem {
  id: string;
  word: string;
  level: Level;
  category: OrthoCategory;
  subcategory: string;
  difficulty: number; // 1 - 5
  phonology?: string;
  syllables: string[];
  stressedSyllable: number; // 0-indexed
  rule: string;
  ruleCategoryName?: string;
  semanticField: string;
  meaning?: string;
  exampleSentence?: string;
  accentType?: 'aguda' | 'llana' | 'esdrújula' | 'sobresdrújula' | string;
  frequency: 'high' | 'medium' | 'low';
  commonErrors: string[];
  confusableWith: string[];
  examples: {
    sentence: string;
    translation?: string;
    role?: string;
  }[];
  l1Risk: L1Language[];
  visualAnchor?: {
    letterToHighlight: string;
    description: string;
    mnemonicGraphic?: string;
    soundClue?: string;
  };
  socraticClues: {
    level1: string; // Pregunta conceptual
    level2: string; // Ayuda contextual / morfológica
    level3: string; // Ayuda explícita
  };
}

export interface MinimalContrastSet {
  id: string;
  title: string;
  level: Level;
  category: OrthoCategory;
  subcategory: string;
  forms: {
    word: string;
    accentType: string;
    grammaticalFunction: string;
    meaningContext: string;
    exampleSentence: string;
  }[];
  discoveryQuestion: string;
  targetFocus: string;
}

export interface StructuredInputExercise {
  id: string;
  level: Level;
  category: OrthoCategory;
  sentences: {
    sentence: string;
    highlightWord: string;
    isCorrectMeaning: boolean;
  }[];
  comprehensionQuestion: string;
  correctIndex: number;
  explanation: string;
  cognitiveReflection: string;
}

export interface DictationItem {
  id: string;
  level: Level;
  text: string;
  audioPacing: 'normal' | 'slow' | 'syllabic';
  focusCategory: OrthoCategory;
  difficulty: number;
  hints: string[];
  contextTopic: string;
}

export interface SrsItemState {
  wordId: string;
  word: string;
  category: OrthoCategory;
  state: SrsState;
  intervalDays: number;
  easeFactor: number;
  consecutiveSuccesses: number;
  totalAttempts: number;
  mistakesCount: number;
  lastReviewed: string; // ISO String
  nextReviewDate: string; // ISO String
  ruleKnowledgeScore: number; // 0 - 100
  automatedSpellingScore: number; // 0 - 100
  retentionStreak: number;
}

export interface ErrorProfile {
  accentuation: number; // 0 - 100 %
  spellings: number;
  punctuation: number;
  morphology: number;
  capitals: number;
}

export interface UserProfile {
  name: string;
  level: Level;
  l1: L1Language;
  goal: string;
  globalPrecision: number; // 0 - 100
  streakDays: number;
  lastActiveDate: string;
  sessionsCompleted: number;
  wordsDominated: number;
  wordsInTraining: number;
  errorProfile: ErrorProfile;
  topErrorPatterns: string[];
  onboardingCompleted: boolean;
  dailyChallengeDoneToday: boolean;
  escapeRoomsCleared: string[];
}

export interface SocraticFeedback {
  code: ErrorCode;
  markedText: string;
  question: string;
  clue?: string;
  category: OrthoCategory;
}

export interface TextEvaluationResult {
  score?: number;
  annotatedText: string;
  feedbackItems: {
    code: string;
    word: string;
    suggestion: string;
    socraticQuestion?: string;
  }[];
  socraticAdvice?: string;
  isOffline?: boolean;
}

export interface EscapeRoomStage {
  stageNumber: number;
  stageTitle: string;
  briefing: string;
  instruction: string;
  encryptedSnippet: string;
  interactiveType: 'select_multiple' | 'order_syllables' | 'spot_odd_one' | 'type_correct_key' | 'decode_contrast';
  options?: string[];
  correctAnswers: string[];
  clueUnlockCode: string;
  socraticHint: string;
}

export interface EscapeScenario {
  id: string;
  codeName: string;
  title: string;
  description: string;
  difficulty: 'Intermedio (B1-B2)' | 'Avanzado (C1-C2)' | 'Fundamental (A1-A2)' | string;
  stages: EscapeRoomStage[];
}
