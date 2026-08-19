/**
 * Alineación de dictado por distancia de edición (Fase 2)
 * =======================================================
 *
 * El dictado ya no se evalúa como una comparación tolerante de la cadena
 * completa (que solo distinguía "igual / solo tilde / distinto"): ahora se
 * alinea la transcripción del estudiante con el texto correcto **token a
 * token** usando programación dinámica (Needleman–Wunsch sobre secuencias de
 * palabras y signos). Así el motor puede decir con precisión qué palabra se
 * **omitió**, cuál **sobra**, cuál está bien salvo la **tilde** y cuál tiene
 * un **error de grafía** —distinguiéndolos entre sí—, todo de forma 100 %
 * procedural y determinista (mismas entradas → mismo resultado).
 *
 * Sigue el principio rector de honestidad procedural: solo compara contra la
 * forma canónica del ítem de dictado; no "adivina" intención.
 */

import { foldAccents, AnswerVerdict } from './proceduralEngine';

export type DictationTokenStatus =
  | 'correct'   // idéntico (salvo mayúsculas)
  | 'accent'    // mismas letras, falta/sobra tilde
  | 'grapheme'  // error de grafía cercano (b/v, s/c/z, h…)
  | 'wrong'     // palabra sustituida por otra no relacionada
  | 'missing'   // palabra del dictado que el estudiante omitió
  | 'extra';    // palabra que el estudiante agregó de más

export interface DictationDiffToken {
  status: DictationTokenStatus;
  typed?: string;    // lo que escribió el estudiante (ausente si 'missing')
  expected?: string; // forma correcta del dictado (ausente si 'extra')
  isPunct: boolean;  // el token es un signo de puntuación, no una palabra
}

export interface DictationAlignment {
  tokens: DictationDiffToken[];
  counts: {
    correct: number;
    accent: number;
    grapheme: number;
    wrong: number;
    missing: number;
    extra: number;
  };
  expectedWords: number;   // nº de palabras (sin puntuación) del dictado
  accuracy: number;        // 0–1, ponderado por tipo de acierto
  verdict: AnswerVerdict;  // correct | accent-only | wrong
  quality: number;         // 1–5 para srsManager.recordAttempt
  summary: string;         // mensaje humano listo para mostrar
}

interface Tok {
  raw: string;    // texto tal cual se muestra
  norm: string;   // normalizado para comparar (minúsculas)
  isPunct: boolean;
}

// Signos de puntuación relevantes en español que se cuentan como tokens propios.
const PUNCT_RE = /[¿?¡!,;:.«»"“”()—–-]/;
const TOKEN_RE = /[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+|[¿?¡!,;:.«»"“”()—–-]/g;

function tokenize(text: string): Tok[] {
  const matches = text.match(TOKEN_RE) || [];
  return matches.map((m) => {
    const isPunct = PUNCT_RE.test(m) && m.length === 1;
    return { raw: m, norm: m.toLowerCase(), isPunct };
  });
}

/** Distancia de edición de Levenshtein sobre caracteres (para "cercanía" de grafía). */
function charDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array<number>(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * Clasifica la relación entre un token esperado y uno escrito, devolviendo
 * su estado y el coste de sustitución para la alineación (menor = más parecido).
 */
function classifyPair(exp: Tok, got: Tok): { status: DictationTokenStatus; cost: number } {
  if (exp.isPunct || got.isPunct) {
    // Comparación exacta de signos (o palabra frente a signo → sustitución cara).
    if (exp.isPunct && got.isPunct) {
      return exp.norm === got.norm
        ? { status: 'correct', cost: 0 }
        : { status: 'wrong', cost: 2 };
    }
    return { status: 'wrong', cost: 3 };
  }

  if (exp.norm === got.norm) return { status: 'correct', cost: 0 };

  if (foldAccents(exp.norm) === foldAccents(got.norm)) {
    return { status: 'accent', cost: 1 };
  }

  const dist = charDistance(foldAccents(exp.norm), foldAccents(got.norm));
  const threshold = Math.max(1, Math.floor(Math.max(exp.norm.length, got.norm.length) / 3));
  if (dist <= threshold) return { status: 'grapheme', cost: 2 };

  return { status: 'wrong', cost: 3 };
}

const GAP_COST = 2; // coste de omitir o agregar un token

/**
 * Alinea la transcripción `input` con el texto `expected` del dictado y
 * devuelve el diff token a token más el veredicto/calidad para el SRS.
 */
export function alignDictation(input: string, expected: string): DictationAlignment {
  const exp = tokenize(expected);
  const got = tokenize(input);
  const m = exp.length;
  const n = got.length;

  // DP de Needleman–Wunsch minimizando el coste total de edición.
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 1; i <= m; i++) dp[i][0] = i * GAP_COST;
  for (let j = 1; j <= n; j++) dp[0][j] = j * GAP_COST;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const sub = dp[i - 1][j - 1] + classifyPair(exp[i - 1], got[j - 1]).cost;
      const del = dp[i - 1][j] + GAP_COST; // token esperado omitido
      const ins = dp[i][j - 1] + GAP_COST; // token de más
      dp[i][j] = Math.min(sub, del, ins);
    }
  }

  // Backtracking para reconstruir la alineación.
  const tokens: DictationDiffToken[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const pair = classifyPair(exp[i - 1], got[j - 1]);
      if (dp[i][j] === dp[i - 1][j - 1] + pair.cost) {
        tokens.push({
          status: pair.status,
          typed: got[j - 1].raw,
          expected: exp[i - 1].raw,
          isPunct: exp[i - 1].isPunct && got[j - 1].isPunct,
        });
        i--; j--;
        continue;
      }
    }
    if (i > 0 && dp[i][j] === dp[i - 1][j] + GAP_COST) {
      tokens.push({ status: 'missing', expected: exp[i - 1].raw, isPunct: exp[i - 1].isPunct });
      i--;
      continue;
    }
    // inserción
    tokens.push({ status: 'extra', typed: got[j - 1].raw, isPunct: got[j - 1].isPunct });
    j--;
  }
  tokens.reverse();

  const counts = { correct: 0, accent: 0, grapheme: 0, wrong: 0, missing: 0, extra: 0 };
  for (const t of tokens) counts[t.status]++;

  const expectedWords = exp.filter((t) => !t.isPunct).length || 1;

  // Precisión ponderada: la tilde penaliza poco; la grafía, a medias; omitir
  // o cambiar la palabra, del todo. Los tokens de más también restan.
  const points =
    counts.correct * 1 + counts.accent * 0.85 + counts.grapheme * 0.4;
  const denom = exp.length + counts.extra || 1;
  const accuracy = Math.max(0, Math.min(1, points / denom));

  const onlyAccentIssues =
    counts.grapheme === 0 && counts.wrong === 0 && counts.missing === 0 && counts.extra === 0;
  let verdict: AnswerVerdict;
  if (counts.accent === 0 && onlyAccentIssues) verdict = 'correct';
  else if (onlyAccentIssues && counts.accent > 0) verdict = 'accent-only';
  else verdict = 'wrong';

  let quality: number;
  if (verdict === 'correct') quality = 5;
  else if (verdict === 'accent-only') quality = accuracy >= 0.95 ? 4 : 3;
  else if (accuracy >= 0.85) quality = 3;
  else if (accuracy >= 0.6) quality = 2;
  else quality = 1;

  const summary = buildSummary(verdict, counts, accuracy);

  return { tokens, counts, expectedWords, accuracy, verdict, quality, summary };
}

function buildSummary(
  verdict: AnswerVerdict,
  counts: DictationAlignment['counts'],
  accuracy: number,
): string {
  if (verdict === 'correct') return '¡Perfecto! Transcripción exacta, con tildes y puntuación.';
  if (verdict === 'accent-only') {
    const n = counts.accent;
    return n === 1
      ? 'Casi: las letras están bien, pero falta una tilde.'
      : `Casi: las letras están bien, pero faltan ${n} tildes.`;
  }
  const parts: string[] = [];
  if (counts.grapheme) parts.push(`${counts.grapheme} de grafía`);
  if (counts.wrong) parts.push(`${counts.wrong} de palabra`);
  if (counts.missing) parts.push(`${counts.missing} omitida${counts.missing > 1 ? 's' : ''}`);
  if (counts.extra) parts.push(`${counts.extra} de más`);
  if (counts.accent) parts.push(`${counts.accent} de tilde`);
  const detail = parts.length ? ` (${parts.join(', ')})` : '';
  return `Precisión ${Math.round(accuracy * 100)} %${detail}. Compará palabra por palabra abajo.`;
}
