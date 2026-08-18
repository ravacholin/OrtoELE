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

/* ============================================================
 * MÓDULO PUNTUACIÓN (§24) — 100% procedural, verificable por regla
 * ============================================================ */

export type PunctuationExerciseType = 'punctuate' | 'compare' | 'edit';

export interface PunctuationExercise {
  id: string;
  level: Level;
  type: PunctuationExerciseType;
  focus: string; // p. ej. "coma con conector", "signos de interrogación"
  instruction: string;
  // PUNTUAR: texto sin (o con poca) puntuación que el estudiante debe puntuar.
  rawText?: string;
  // Forma canónica de referencia (se compara normalizando).
  canonical?: string;
  // COMPARAR: dos versiones; el estudiante elige la mejor.
  options?: { text: string; isBest: boolean; note: string }[];
  // EDICIÓN: texto con errores inyectados + versión corregida de referencia.
  brokenText?: string;
  fixedText?: string;
  explanation: string;
  socraticClue: string;
}

/* ============================================================
 * MÓDULO MAYÚSCULAS (§25) — corrección determinista por tramos MCER
 * ============================================================ */

export interface CapitalsExercise {
  id: string;
  level: Level;
  tier: 'A1-A2' | 'B1-B2' | 'C1-C2';
  focus: string; // "nombres propios", "instituciones", "títulos"...
  instruction: string;
  // Texto tal como lo escribiría un estudiante con errores de mayúsculas.
  rawText: string;
  // Versión correcta de referencia (misma cadena salvo mayúsculas/minúsculas).
  correctedText: string;
  // Palabras concretas cuya capitalización cambia (para feedback token a token).
  targets: { wrong: string; right: string; reason: string }[];
  explanation: string;
  socraticClue: string;
}

/* ============================================================
 * DESAFÍO DEL DÍA (§37) — ensamblado determinista por fecha
 * ============================================================ */

export type DailyChallengeSegmentKind =
  | 'contrast'
  | 'spelling'
  | 'dictation'
  | 'miniText';

export interface DailyChallengeSegment {
  kind: DailyChallengeSegmentKind;
  refId: string;
  label: string;
}

export interface DailyChallenge {
  dateKey: string; // YYYY-MM-DD
  seed: string;
  estimatedMinutes: number;
  focusCategories: OrthoCategory[];
  segments: DailyChallengeSegment[];
}

/* ============================================================
 * MOTOR DE SESIÓN — sesiones finitas, adaptativas y con resultados
 * ============================================================
 * Reemplaza los bucles infinitos `item[i % length]` por una sesión
 * con principio, medio y fin: se seleccionan ítems de forma
 * adaptativa (repasos vencidos → errores → nuevos al nivel) y cada
 * paso alimenta el motor SRS con un intento real.
 */

// Formatos de ejercicio que puede generar el motor procedural.
export type ExerciseKind =
  | 'spelling-choice'   // elegir la forma correcta de la palabra
  | 'fill-grapheme'     // completar la letra dudosa (b/v, g/j, h, c/s/z…)
  | 'error-spotting'    // detectar la palabra mal escrita en una oración
  | 'accent-placement'  // marcar la sílaba tónica / decidir la tilde
  | 'contrast'          // discriminar un contraste mínimo
  | 'dictation';        // escuchar y transcribir

// Por qué se eligió este paso (para priorizar y para el feedback final).
export type StepReason = 'due' | 'mistake' | 'new' | 'challenge';

export type SessionOrigin = 'recommended' | 'daily' | 'focus' | 'mistakes';

export interface SessionStep {
  id: string;             // id único del paso (incluye semilla)
  kind: ExerciseKind;
  reason: StepReason;
  category: OrthoCategory;
  wordId?: string;        // ref a un ítem del banco léxico
  contrastId?: string;    // ref a un contraste mínimo
  dictationId?: string;   // ref a un ítem de dictado
  label: string;          // etiqueta legible (palabra o tema)
}

export interface StepResult {
  stepId: string;
  wordId?: string;
  category: OrthoCategory;
  label: string;
  correct: boolean;
  hints: number;
  quality: number; // 1-5, alimenta srsManager.recordAttempt
}

export interface SessionPlan {
  id: string;
  seed: string;
  origin: SessionOrigin;
  focus?: OrthoCategory | 'grafias' | 'mixed';
  title: string;
  steps: SessionStep[];
}
