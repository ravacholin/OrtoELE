import { UserProfile, SrsItemState, TextEvaluationResult } from '../types';

export const STORAGE_SCHEMA_VERSION = 1;

export const STORAGE_KEYS = {
  SCHEMA_VERSION: 'orto_lab_schema_v1',
  USER_PROFILE: 'orto_lab_user_profile_v1',
  SRS_ITEMS: 'orto_lab_srs_items_v1',
  WRITING_HISTORY: 'orto_lab_writing_history_v1',
  DIAGNOSTIC_RESULTS: 'orto_lab_diagnostic_results_v1',
  SESSION_LOGS: 'orto_lab_session_logs_v1',
} as const;

export interface WritingSubmission {
  id: string;
  timestamp: string;
  promptTitle: string;
  level: string;
  text: string;
  result: TextEvaluationResult;
}

export interface DiagnosticRecord {
  id: string;
  timestamp: string;
  score: number;
  total: number;
  levelAssigned: string;
  mistakesByCategory: Record<string, number>;
}

export interface SessionSnapshot {
  id: string;
  timestamp: string;
  sessionNumber: number;
  dateLabel: string;
  wordsDominated: number;
  wordsInTraining: number;
  wordsUncertain: number;
  globalPrecision: number;
  retentionRate: number;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  profile: UserProfile;
  srsItems: Record<string, SrsItemState>;
  writingHistory: WritingSubmission[];
  diagnosticHistory: DiagnosticRecord[];
  sessionSnapshots?: SessionSnapshot[];
}

type StorageListener = (key: string, data: any) => void;

class LocalStorageService {
  private isAvailable: boolean;
  private listeners: Set<StorageListener> = new Set();

  constructor() {
    this.isAvailable = this.checkAvailability();
    this.ensureSchemaVersion();
  }

  private checkAvailability(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      const testKey = '__orto_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('[StorageService] LocalStorage is not available or quota exceeded.', e);
      return false;
    }
  }

  private ensureSchemaVersion() {
    if (!this.isAvailable) return;
    try {
      const existingVersion = this.getItem<number>(STORAGE_KEYS.SCHEMA_VERSION);
      if (!existingVersion) {
        this.setItem(STORAGE_KEYS.SCHEMA_VERSION, STORAGE_SCHEMA_VERSION);
      }
    } catch (e) {
      console.warn('[StorageService] Error checking schema version:', e);
    }
  }

  public getItem<T>(key: string, defaultValue: T | null = null): T | null {
    if (!this.isAvailable) return defaultValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null || raw === undefined) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (e) {
      console.error(`[StorageService] Failed to read or parse key "${key}":`, e);
      return defaultValue;
    }
  }

  public setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable) return false;
    try {
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      this.notifyListeners(key, value);
      return true;
    } catch (e) {
      console.error(`[StorageService] Failed to save key "${key}":`, e);
      return false;
    }
  }

  public removeItem(key: string): boolean {
    if (!this.isAvailable) return false;
    try {
      window.localStorage.removeItem(key);
      this.notifyListeners(key, null);
      return true;
    } catch (e) {
      console.error(`[StorageService] Failed to remove key "${key}":`, e);
      return false;
    }
  }

  public clearAll(): boolean {
    if (!this.isAvailable) return false;
    try {
      Object.values(STORAGE_KEYS).forEach((k) => {
        window.localStorage.removeItem(k);
      });
      return true;
    } catch (e) {
      console.error('[StorageService] Failed to clear storage:', e);
      return false;
    }
  }

  // Reactive subscription
  public subscribe(listener: StorageListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(key: string, data: any) {
    this.listeners.forEach((listener) => {
      try {
        listener(key, data);
      } catch (err) {
        console.error('[StorageService] Error in storage listener callback:', err);
      }
    });
  }

  // Writing history management
  public saveWritingSubmission(submission: Omit<WritingSubmission, 'id' | 'timestamp'>): WritingSubmission {
    const history = this.getItem<WritingSubmission[]>(STORAGE_KEYS.WRITING_HISTORY, []) || [];
    const newEntry: WritingSubmission = {
      ...submission,
      id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...history].slice(0, 50); // Keep last 50
    this.setItem(STORAGE_KEYS.WRITING_HISTORY, updated);
    return newEntry;
  }

  public getWritingHistory(): WritingSubmission[] {
    return this.getItem<WritingSubmission[]>(STORAGE_KEYS.WRITING_HISTORY, []) || [];
  }

  // Diagnostic history management
  public saveDiagnosticRecord(record: Omit<DiagnosticRecord, 'id' | 'timestamp'>): DiagnosticRecord {
    const history = this.getItem<DiagnosticRecord[]>(STORAGE_KEYS.DIAGNOSTIC_RESULTS, []) || [];
    const newEntry: DiagnosticRecord = {
      ...record,
      id: `diag-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...history].slice(0, 20);
    this.setItem(STORAGE_KEYS.DIAGNOSTIC_RESULTS, updated);
    return newEntry;
  }

  public getDiagnosticHistory(): DiagnosticRecord[] {
    return this.getItem<DiagnosticRecord[]>(STORAGE_KEYS.DIAGNOSTIC_RESULTS, []) || [];
  }

  // Session Snapshots for data visualization (Over-time progress & Forgetting curve)
  public saveSessionSnapshot(snapshot: Omit<SessionSnapshot, 'id' | 'timestamp'>): SessionSnapshot {
    const history = this.getItem<SessionSnapshot[]>(STORAGE_KEYS.SESSION_LOGS, []) || [];
    const newEntry: SessionSnapshot = {
      ...snapshot,
      id: `snap-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [...history, newEntry].slice(-30); // Keep last 30 sessions
    this.setItem(STORAGE_KEYS.SESSION_LOGS, updated);
    return newEntry;
  }

  public getSessionSnapshots(): SessionSnapshot[] {
    return this.getItem<SessionSnapshot[]>(STORAGE_KEYS.SESSION_LOGS, []) || [];
  }

  // Export full backup
  public exportBackupJSON(profile: UserProfile, srsItems: Record<string, SrsItemState>): string {
    const backup: BackupData = {
      version: STORAGE_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      profile,
      srsItems,
      writingHistory: this.getWritingHistory(),
      diagnosticHistory: this.getDiagnosticHistory(),
      sessionSnapshots: this.getSessionSnapshots(),
    };
    return JSON.stringify(backup, null, 2);
  }

  // Import full backup
  public importBackupJSON(jsonString: string): { success: boolean; message: string; data?: BackupData } {
    try {
      const parsed = JSON.parse(jsonString) as BackupData;
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'El archivo no contiene un formato JSON válido.' };
      }
      if (!parsed.profile || !parsed.srsItems) {
        return { success: false, message: 'El archivo de respaldo carece de estructura de perfil o SRS.' };
      }

      this.setItem(STORAGE_KEYS.USER_PROFILE, parsed.profile);
      this.setItem(STORAGE_KEYS.SRS_ITEMS, parsed.srsItems);
      if (Array.isArray(parsed.writingHistory)) {
        this.setItem(STORAGE_KEYS.WRITING_HISTORY, parsed.writingHistory);
      }
      if (Array.isArray(parsed.diagnosticHistory)) {
        this.setItem(STORAGE_KEYS.DIAGNOSTIC_RESULTS, parsed.diagnosticHistory);
      }
      if (Array.isArray(parsed.sessionSnapshots)) {
        this.setItem(STORAGE_KEYS.SESSION_LOGS, parsed.sessionSnapshots);
      }

      return { success: true, message: 'Datos y progreso restaurados exitosamente.', data: parsed };
    } catch (e: any) {
      return { success: false, message: `Error al procesar el archivo de respaldo: ${e.message || 'Desconocido'}` };
    }
  }
}

export const storageService = new LocalStorageService();
