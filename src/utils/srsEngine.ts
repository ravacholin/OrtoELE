import { UserProfile, SrsItemState, SrsState, OrthoCategory, OrthoWordItem } from '../types';
import { ORTHOGRAPHY_WORD_BANK } from '../data/orthographyBank';
import { storageService, STORAGE_KEYS } from '../services/storageService';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Estudiante ELE',
  level: 'unassigned',
  l1: 'español',
  goal: 'mejorar ortografía general',
  globalPrecision: 82.5,
  streakDays: 1,
  lastActiveDate: new Date().toISOString(),
  sessionsCompleted: 1,
  wordsDominated: 18,
  wordsInTraining: 14,
  errorProfile: {
    accentuation: 74,
    spellings: 81,
    punctuation: 62,
    morphology: 70,
    capitals: 88,
  },
  topErrorPatterns: [
    'Acentuación de hiatos (vocal cerrada tónica)',
    'Alternancia G / J en conjugaciones verbales',
    'Coma en conectores contraargumentativos'
  ],
  onboardingCompleted: false,
  dailyChallengeDoneToday: false,
  escapeRoomsCleared: [],
};

// Initial Seed items for SRS
export function getInitialSrsItems(): Record<string, SrsItemState> {
  const items: Record<string, SrsItemState> = {};
  
  ORTHOGRAPHY_WORD_BANK.forEach((wordItem, idx) => {
    let state: SrsState = 'NUEVO';
    let intervalDays = 1;
    let consecutiveSuccesses = 0;
    let dominated = 0;

    if (idx === 0) {
      state = 'ESTABLE';
      intervalDays = 4;
      consecutiveSuccesses = 3;
      dominated = 85;
    } else if (idx === 1) {
      state = 'APRENDIENDO';
      intervalDays = 2;
      consecutiveSuccesses = 1;
      dominated = 60;
    } else if (idx === 2) {
      state = 'INCIERTO';
      intervalDays = 1;
      consecutiveSuccesses = 0;
      dominated = 45;
    }

    items[wordItem.id] = {
      wordId: wordItem.id,
      word: wordItem.word,
      category: wordItem.category,
      state,
      intervalDays,
      easeFactor: 2.5,
      consecutiveSuccesses,
      totalAttempts: consecutiveSuccesses > 0 ? consecutiveSuccesses + 1 : 0,
      mistakesCount: state === 'INCIERTO' ? 2 : 0,
      lastReviewed: new Date().toISOString(),
      nextReviewDate: new Date(Date.now() + intervalDays * 86400000).toISOString(),
      ruleKnowledgeScore: dominated > 0 ? dominated + 5 : 50,
      automatedSpellingScore: dominated,
      retentionStreak: consecutiveSuccesses,
    };
  });

  return items;
}

export class SrsManager {
  private profile: UserProfile;
  private srsItems: Record<string, SrsItemState>;

  constructor() {
    this.profile = this.loadProfile();
    this.srsItems = this.loadSrsItems();
    this.updateDailyStreak();
  }

  public getProfile(): UserProfile {
    return { ...this.profile };
  }

  public getSrsItems(): Record<string, SrsItemState> {
    return { ...this.srsItems };
  }

  private loadProfile(): UserProfile {
    const saved = storageService.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    if (saved && typeof saved === 'object') {
      return {
        ...DEFAULT_USER_PROFILE,
        ...saved,
        errorProfile: {
          ...DEFAULT_USER_PROFILE.errorProfile,
          ...(saved.errorProfile || {}),
        },
      };
    }
    return DEFAULT_USER_PROFILE;
  }

  private loadSrsItems(): Record<string, SrsItemState> {
    const saved = storageService.getItem<Record<string, SrsItemState>>(STORAGE_KEYS.SRS_ITEMS);
    if (saved && Object.keys(saved).length > 0) {
      return saved;
    }
    const initial = getInitialSrsItems();
    storageService.setItem(STORAGE_KEYS.SRS_ITEMS, initial);
    return initial;
  }

  private updateDailyStreak() {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastActiveStr = (this.profile.lastActiveDate || '').split('T')[0];

    if (!lastActiveStr) {
      this.profile.streakDays = 1;
      this.profile.lastActiveDate = new Date().toISOString();
      this.saveProfile(this.profile);
      return;
    }

    if (todayStr !== lastActiveStr) {
      const todayDate = new Date(todayStr).getTime();
      const lastDate = new Date(lastActiveStr).getTime();
      const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day!
        this.profile.streakDays += 1;
      } else if (diffDays > 1) {
        // Streak broken
        this.profile.streakDays = 1;
      }
      this.profile.lastActiveDate = new Date().toISOString();
      this.profile.dailyChallengeDoneToday = false;
      this.saveProfile(this.profile);
    }
  }

  public saveProfile(newProfile: UserProfile) {
    this.profile = newProfile;
    storageService.setItem(STORAGE_KEYS.USER_PROFILE, newProfile);
  }

  public saveSrsItems(items: Record<string, SrsItemState>) {
    this.srsItems = items;
    storageService.setItem(STORAGE_KEYS.SRS_ITEMS, items);
  }

  public recordAttempt(wordId: string, quality: number, tookHints: number = 0): SrsItemState {
    let item = this.srsItems[wordId];
    if (!item) {
      const bankItem = ORTHOGRAPHY_WORD_BANK.find(w => w.id === wordId);
      item = {
        wordId,
        word: bankItem?.word || wordId,
        category: bankItem?.category || 'spellings',
        state: 'NUEVO',
        intervalDays: 1,
        easeFactor: 2.5,
        consecutiveSuccesses: 0,
        totalAttempts: 0,
        mistakesCount: 0,
        lastReviewed: new Date().toISOString(),
        nextReviewDate: new Date().toISOString(),
        ruleKnowledgeScore: 50,
        automatedSpellingScore: 50,
        retentionStreak: 0,
      };
    }

    item.totalAttempts += 1;
    item.lastReviewed = new Date().toISOString();

    const isSuccess = quality >= 3;

    if (isSuccess) {
      item.consecutiveSuccesses += 1;
      item.retentionStreak += 1;

      // Adjust Ease Factor (SM-2 variant)
      item.easeFactor = Math.max(1.3, item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

      // Calculate new interval
      if (item.consecutiveSuccesses === 1) {
        item.intervalDays = 1;
      } else if (item.consecutiveSuccesses === 2) {
        item.intervalDays = 3;
      } else {
        item.intervalDays = Math.round(item.intervalDays * item.easeFactor);
      }

      // Update dual scores
      item.ruleKnowledgeScore = Math.min(100, item.ruleKnowledgeScore + (tookHints > 0 ? 10 : 15));
      item.automatedSpellingScore = Math.min(100, item.automatedSpellingScore + (quality === 5 ? 20 : 10));

      // Update state
      if (item.consecutiveSuccesses >= 4 && item.automatedSpellingScore >= 85) {
        item.state = 'DOMINADO';
      } else if (item.consecutiveSuccesses >= 2) {
        item.state = 'ESTABLE';
      } else {
        item.state = 'APRENDIENDO';
      }
    } else {
      // Failure / Mistake
      item.mistakesCount += 1;
      item.consecutiveSuccesses = 0;
      item.retentionStreak = 0;
      item.intervalDays = 1;
      item.easeFactor = Math.max(1.3, item.easeFactor - 0.2);
      item.automatedSpellingScore = Math.max(10, item.automatedSpellingScore - 15);
      item.state = 'INCIERTO';
    }

    // Schedule next review
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + item.intervalDays);
    item.nextReviewDate = nextDate.toISOString();

    this.srsItems[wordId] = item;
    this.saveSrsItems(this.srsItems);
    this.recomputeProfileStats();

    return item;
  }

  public recomputeProfileStats() {
    const items = Object.values(this.srsItems);
    if (items.length === 0) return;

    let dominated = 0;
    let inTraining = 0;
    let totalAttempts = 0;
    let totalMistakes = 0;

    const catScores: Record<OrthoCategory, { total: number; count: number }> = {
      accentuation: { total: 0, count: 0 },
      spellings: { total: 0, count: 0 },
      punctuation: { total: 0, count: 0 },
      morphology: { total: 0, count: 0 },
      capitals: { total: 0, count: 0 },
    };

    items.forEach(item => {
      if (item.state === 'DOMINADO') dominated++;
      if (item.state === 'APRENDIENDO' || item.state === 'ESTABLE' || item.state === 'INCIERTO') inTraining++;

      totalAttempts += item.totalAttempts;
      totalMistakes += item.mistakesCount;

      if (catScores[item.category]) {
        catScores[item.category].total += (item.automatedSpellingScore + item.ruleKnowledgeScore) / 2;
        catScores[item.category].count++;
      }
    });

    const newProfile = { ...this.profile };
    newProfile.wordsDominated = dominated;
    newProfile.wordsInTraining = inTraining;

    if (totalAttempts > 0) {
      const precision = Math.max(40, Math.min(100, Math.round(((totalAttempts - totalMistakes) / totalAttempts) * 100 * 10) / 10));
      newProfile.globalPrecision = precision;
    }

    (Object.keys(catScores) as OrthoCategory[]).forEach(cat => {
      const data = catScores[cat];
      if (data.count > 0) {
        newProfile.errorProfile[cat] = Math.round(data.total / data.count);
      }
    });

    this.saveProfile(newProfile);
    this.recordSessionSnapshot();
  }

  public recordSessionSnapshot() {
    const items = Object.values(this.srsItems);
    const dominated = items.filter(i => i.state === 'DOMINADO').length;
    const inTraining = items.filter(i => i.state === 'APRENDIENDO' || i.state === 'ESTABLE').length;
    const uncertain = items.filter(i => i.state === 'INCIERTO').length;
    
    // Average retention rate calculated from ease factors and intervals
    const avgEase = items.reduce((acc, i) => acc + (i.easeFactor || 2.5), 0) / Math.max(1, items.length);
    const retentionRate = Math.min(99, Math.round(70 + (avgEase - 1.3) * 20));

    const todayStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

    storageService.saveSessionSnapshot({
      sessionNumber: this.profile.sessionsCompleted + 1,
      dateLabel: todayStr,
      wordsDominated: dominated,
      wordsInTraining: inTraining,
      wordsUncertain: uncertain,
      globalPrecision: this.profile.globalPrecision,
      retentionRate,
    });
  }

  public getHistoricalProgressData(): {
    sessionLabel: string;
    sessionNumber: number;
    wordsDominated: number;
    wordsInTraining: number;
    wordsUncertain: number;
    globalPrecision: number;
    retentionRate: number;
  }[] {
    const rawSnapshots = storageService.getSessionSnapshots();
    
    if (rawSnapshots.length >= 3) {
      return rawSnapshots.map((s, idx) => ({
        sessionLabel: s.dateLabel || `Sesión ${s.sessionNumber || idx + 1}`,
        sessionNumber: s.sessionNumber || idx + 1,
        wordsDominated: s.wordsDominated,
        wordsInTraining: s.wordsInTraining,
        wordsUncertain: s.wordsUncertain,
        globalPrecision: s.globalPrecision,
        retentionRate: s.retentionRate || 85,
      }));
    }

    // Seed realistic pedagogical progression leading to current profile state
    const currentDominated = this.profile.wordsDominated;
    const currentInTraining = this.profile.wordsInTraining;
    const currentPrecision = this.profile.globalPrecision;
    const currentSession = this.profile.sessionsCompleted + 1;

    const baseData = [
      {
        sessionLabel: 'Sesión 1',
        sessionNumber: Math.max(1, currentSession - 4),
        wordsDominated: Math.max(0, currentDominated - 4),
        wordsInTraining: Math.max(2, currentInTraining - 5),
        wordsUncertain: 4,
        globalPrecision: Math.max(50, currentPrecision - 14),
        retentionRate: 68,
      },
      {
        sessionLabel: 'Sesión 2',
        sessionNumber: Math.max(2, currentSession - 3),
        wordsDominated: Math.max(1, currentDominated - 3),
        wordsInTraining: Math.max(4, currentInTraining - 3),
        wordsUncertain: 3,
        globalPrecision: Math.max(58, currentPrecision - 10),
        retentionRate: 74,
      },
      {
        sessionLabel: 'Sesión 3',
        sessionNumber: Math.max(3, currentSession - 2),
        wordsDominated: Math.max(2, currentDominated - 2),
        wordsInTraining: Math.max(5, currentInTraining - 1),
        wordsUncertain: 3,
        globalPrecision: Math.max(65, currentPrecision - 6),
        retentionRate: 80,
      },
      {
        sessionLabel: 'Sesión 4',
        sessionNumber: Math.max(4, currentSession - 1),
        wordsDominated: Math.max(3, currentDominated - 1),
        wordsInTraining: currentInTraining,
        wordsUncertain: 2,
        globalPrecision: Math.max(70, currentPrecision - 2),
        retentionRate: 85,
      },
      {
        sessionLabel: `Sesión ${currentSession} (Actual)`,
        sessionNumber: currentSession,
        wordsDominated: currentDominated,
        wordsInTraining: currentInTraining,
        wordsUncertain: Object.values(this.srsItems).filter(i => i.state === 'INCIERTO').length,
        globalPrecision: currentPrecision,
        retentionRate: Math.min(96, Math.max(75, Math.round(currentPrecision * 0.95))),
      },
    ];

    return baseData;
  }

  public getForgettingCurveData(): {
    day: number;
    dayLabel: string;
    sinRepaso: number; // Ebbinghaus forgetting curve without SRS: R = e^(-t/S)
    conSRS: number; // Spaced repetition retention with reinforcement intervals
    estadoActualEstudiante: number; // User estimated retention
  }[] {
    const days = [0, 1, 2, 3, 5, 7, 10, 14, 21, 30];
    
    // Average ease factor of student's items
    const items = Object.values(this.srsItems);
    const avgEase = items.reduce((acc, i) => acc + (i.easeFactor || 2.5), 0) / Math.max(1, items.length);

    return days.map(d => {
      // Classical Ebbinghaus curve: R = 100 * e^(-d / 2.2)
      const sinRepaso = Math.max(15, Math.round(100 * Math.exp(-d / 2.5)));

      // SRS curve with active reviews on day 1, 3, 7, 14, 21
      let conSRS = 100;
      if (d === 0) conSRS = 100;
      else if (d === 1) conSRS = 95; // Just reviewed
      else if (d <= 3) conSRS = 92 - (d - 1) * 2;
      else if (d <= 7) conSRS = 94 - (d - 3) * 1.5;
      else if (d <= 14) conSRS = 95 - (d - 7) * 0.8;
      else conSRS = Math.max(86, 96 - (d - 14) * 0.4);

      // Student actual retention based on accuracy and stability
      const studentFactor = (this.profile.globalPrecision / 100) * (avgEase / 2.5);
      const studentRetention = Math.min(99, Math.max(20, Math.round(conSRS * Math.min(1.05, studentFactor))));

      return {
        day: d,
        dayLabel: d === 0 ? 'Día 0 (Estudio)' : `Día ${d}`,
        sinRepaso,
        conSRS: Math.round(conSRS),
        estadoActualEstudiante: studentRetention,
      };
    });
  }

  public getLexiconStateBreakdown(): { state: string; count: number; color: string }[] {
    const items = Object.values(this.srsItems);
    const counts = {
      DOMINADO: 0,
      ESTABLE: 0,
      APRENDIENDO: 0,
      INCIERTO: 0,
      NUEVO: 0,
    };

    items.forEach(i => {
      if (counts[i.state] !== undefined) {
        counts[i.state]++;
      } else {
        counts.NUEVO++;
      }
    });

    return [
      { state: 'Dominadas', count: counts.DOMINADO, color: '#10b981' },
      { state: 'Estables', count: counts.ESTABLE, color: '#3b82f6' },
      { state: 'Aprendiendo', count: counts.APRENDIENDO, color: '#8b5cf6' },
      { state: 'Inciertas / Errores', count: counts.INCIERTO, color: '#f59e0b' },
      { state: 'Nuevas / Pendientes', count: counts.NUEVO, color: '#525252' },
    ];
  }

  public getDueReviewItems(): SrsItemState[] {
    const now = new Date().toISOString();
    return Object.values(this.srsItems).filter(item => item.nextReviewDate <= now || item.state === 'INCIERTO');
  }

  public getRecurrentMistakes(): SrsItemState[] {
    return Object.values(this.srsItems)
      .filter(item => item.mistakesCount > 0 || item.state === 'INCIERTO' || (item.state === 'APRENDIENDO' && item.automatedSpellingScore < 70))
      .sort((a, b) => b.mistakesCount - a.mistakesCount);
  }

  public getDetailedRecurrentMistakes(): { srsItem: SrsItemState; wordItem: OrthoWordItem; mistakeRate: number }[] {
    const srsList = this.getRecurrentMistakes();
    const result: { srsItem: SrsItemState; wordItem: OrthoWordItem; mistakeRate: number }[] = [];

    srsList.forEach(srsItem => {
      let wordItem = ORTHOGRAPHY_WORD_BANK.find(w => w.id === srsItem.wordId);
      if (!wordItem) {
        wordItem = {
          id: srsItem.wordId,
          word: srsItem.word,
          category: srsItem.category,
          subcategory: 'general',
          difficulty: 3,
          level: 'B1',
          syllables: [srsItem.word],
          stressedSyllable: 0,
          rule: 'Atención a la forma ortográfica y el patrón morfológico.',
          semanticField: 'General',
          frequency: 'medium',
          commonErrors: [],
          confusableWith: [],
          examples: [{ sentence: `Palabra en revisión: ${srsItem.word}.` }],
          l1Risk: ['inglés'],
          socraticClues: {
            level1: '¿Dónde está la dificultad ortográfica en esta palabra?',
            level2: 'Comprobá su familia léxica.',
            level3: 'Norma ortográfica específica.',
          },
        };
      }

      const total = srsItem.totalAttempts || 1;
      const rate = Math.round((srsItem.mistakesCount / Math.max(1, total)) * 100);

      result.push({
        srsItem,
        wordItem,
        mistakeRate: rate,
      });
    });

    return result;
  }

  public resetAllProgress() {
    storageService.clearAll();
    const fresh = getInitialSrsItems();
    this.saveSrsItems(fresh);
    const p = { ...DEFAULT_USER_PROFILE, onboardingCompleted: true };
    this.saveProfile(p);
  }
}

export const srsManager = new SrsManager();
