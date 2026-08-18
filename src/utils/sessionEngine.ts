/**
 * ORTOGRAFÍA LAB — Motor de Sesión
 * ------------------------------------------------------------------
 * Reemplaza los bucles infinitos `item[i % length]` por SESIONES
 * finitas y adaptativas. La selección de ítems es determinista por
 * semilla y prioriza pedagógicamente:
 *   1) repasos vencidos (SRS),
 *   2) errores recurrentes,
 *   3) ítems nuevos apropiados al nivel MCER del estudiante.
 * Además interleava categorías y formatos para que la sesión no sea
 * monótona. No usa IA: solo el banco léxico, el PRNG sembrado y el SRS.
 */

import { ORTHOGRAPHY_WORD_BANK, MINIMAL_CONTRASTS, DICTATION_ITEMS } from '../data/orthographyBank';
import {
  Level,
  OrthoWordItem,
  OrthoCategory,
  SessionPlan,
  SessionStep,
  SessionOrigin,
  DailyChallenge,
  StepReason,
} from '../types';
import { srsManager } from './srsEngine';
import { seededShuffle, pickExerciseKind } from './proceduralEngine';

const LEVEL_ORDER: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** Rango numérico del nivel (unassigned se trata como B1). */
function levelRank(level: Level): number {
  const i = LEVEL_ORDER.indexOf(level);
  return i < 0 ? 2 : i; // 'unassigned' → rango de B1
}

export type SessionFocus = OrthoCategory | 'grafias' | 'mixed';

function matchesFocus(item: OrthoWordItem, focus?: SessionFocus): boolean {
  if (!focus || focus === 'mixed') return true;
  if (focus === 'grafias') return item.category === 'spellings' || item.category === 'morphology';
  return item.category === focus;
}

const bankById = new Map(ORTHOGRAPHY_WORD_BANK.map((w) => [w.id, w]));

/** Reordena para que no salgan varias palabras de la misma categoría
 *  seguidas: round-robin estable sobre buckets por categoría. */
function interleaveByCategory(items: OrthoWordItem[]): OrthoWordItem[] {
  const buckets = new Map<OrthoCategory, OrthoWordItem[]>();
  for (const it of items) {
    if (!buckets.has(it.category)) buckets.set(it.category, []);
    buckets.get(it.category)!.push(it);
  }
  const queues = Array.from(buckets.values());
  const out: OrthoWordItem[] = [];
  let remaining = items.length;
  while (remaining > 0) {
    for (const q of queues) {
      const next = q.shift();
      if (next) {
        out.push(next);
        remaining--;
      }
    }
  }
  return out;
}

interface BuildOptions {
  origin: SessionOrigin;
  focus?: SessionFocus;
  size?: number;
  seed?: string;
}

const TITLES: Record<SessionOrigin, string> = {
  recommended: 'Sesión recomendada',
  daily: 'Desafío del día',
  focus: 'Práctica enfocada',
  mistakes: 'Repaso de errores',
};

function makeStep(item: OrthoWordItem, reason: StepReason, seed: string): SessionStep {
  return {
    id: `${seed}-${item.id}`,
    kind: pickExerciseKind(item, seed),
    reason,
    category: item.category,
    wordId: item.id,
    label: item.word,
  };
}

/**
 * Construye una sesión adaptativa a partir del estado real del SRS y del
 * nivel del estudiante. Determinista para una misma semilla.
 */
export function buildSession(opts: BuildOptions): SessionPlan {
  const seed = opts.seed || `${opts.origin}-${Date.now()}`;
  const size = opts.size ?? 10;
  const profile = srsManager.getProfile();
  const userRank = levelRank(profile.level);

  const seen = new Set<string>();
  const ordered: { item: OrthoWordItem; reason: StepReason }[] = [];

  const pushItem = (item: OrthoWordItem | undefined, reason: StepReason) => {
    if (!item || seen.has(item.id)) return;
    if (!matchesFocus(item, opts.focus)) return;
    seen.add(item.id);
    ordered.push({ item, reason });
  };

  // 1) Repasos vencidos (SRS) — máxima prioridad.
  srsManager
    .getDueReviewItems()
    .forEach((s) => pushItem(bankById.get(s.wordId), 'due'));

  // 2) Errores recurrentes.
  srsManager
    .getRecurrentMistakes()
    .forEach((s) => pushItem(bankById.get(s.wordId), 'mistake'));

  // 3) Ítems nuevos apropiados al nivel (rango del usuario + 1 de estiramiento),
  //    excluyendo lo ya dominado. Barajado de forma determinista.
  const srsItems = srsManager.getSrsItems();
  const newPool = ORTHOGRAPHY_WORD_BANK.filter((item) => {
    if (!matchesFocus(item, opts.focus)) return false;
    const st = srsItems[item.id];
    if (st && st.state !== 'NUEVO') return false; // ya en progreso o dominado
    return levelRank(item.level) <= userRank + 1;
  });
  seededShuffle(newPool, `${seed}-new`).forEach((item) => pushItem(item, 'new'));

  // Respaldo: si el nivel deja pocos ítems, ampliar a todo el banco.
  if (ordered.length < size) {
    const broadPool = ORTHOGRAPHY_WORD_BANK.filter(
      (item) => matchesFocus(item, opts.focus) && (srsItems[item.id]?.state ?? 'NUEVO') !== 'DOMINADO'
    );
    seededShuffle(broadPool, `${seed}-broad`).forEach((item) => pushItem(item, 'new'));
  }

  const selected = ordered.slice(0, size);

  // Interleave por categoría, preservando el orden dentro de cada una.
  const interleaved = interleaveByCategory(selected.map((s) => s.item));
  const reasonById = new Map(selected.map((s) => [s.item.id, s.reason]));

  const steps: SessionStep[] = interleaved.map((item) =>
    makeStep(item, reasonById.get(item.id) || 'new', seed)
  );

  return {
    id: seed,
    seed,
    origin: opts.origin,
    focus: opts.focus,
    title: TITLES[opts.origin],
    steps,
  };
}

/** Sesión de repaso a partir de una lista concreta de wordIds (p. ej. los
 *  fallos de una sesión previa). */
export function buildMistakeSession(wordIds: string[], seed?: string): SessionPlan {
  const s = seed || `mistakes-${Date.now()}`;
  const steps: SessionStep[] = [];
  const seen = new Set<string>();
  for (const id of wordIds) {
    if (seen.has(id)) continue;
    const item = bankById.get(id);
    if (!item) continue;
    seen.add(id);
    steps.push(makeStep(item, 'mistake', s));
  }
  return { id: s, seed: s, origin: 'mistakes', title: 'Repaso de errores', steps };
}

/**
 * Convierte el "Desafío del día" (ensamblado determinista por fecha) en una
 * sesión ejecutable: cada segmento pasa a ser un paso real con su formato.
 */
export function buildSessionFromDaily(daily: DailyChallenge): SessionPlan {
  const seed = daily.seed;
  const steps: SessionStep[] = [];

  daily.segments.forEach((seg, i) => {
    if (seg.kind === 'contrast') {
      const c = MINIMAL_CONTRASTS.find((x) => x.id === seg.refId);
      if (c) {
        steps.push({
          id: `${seed}-c-${i}`,
          kind: 'contrast',
          reason: 'challenge',
          category: c.category,
          contrastId: c.id,
          label: c.title,
        });
      }
    } else if (seg.kind === 'dictation') {
      const d = DICTATION_ITEMS.find((x) => x.id === seg.refId);
      if (d) {
        steps.push({
          id: `${seed}-d-${i}`,
          kind: 'dictation',
          reason: 'challenge',
          category: d.focusCategory,
          dictationId: d.id,
          label: d.contextTopic,
        });
      }
    } else {
      // 'spelling' y 'miniText' → paso basado en una palabra del banco.
      const item = bankById.get(seg.refId);
      if (item) {
        const step = makeStep(item, 'challenge', seed);
        step.id = `${seed}-w-${i}`;
        steps.push(step);
      }
    }
  });

  return { id: seed, seed, origin: 'daily', title: 'Desafío del día', steps };
}
