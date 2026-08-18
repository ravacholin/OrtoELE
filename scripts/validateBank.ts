/**
 * ORTOGRAFÍA LAB — Validador de datos del banco (SOLO desarrollo / CI).
 * ------------------------------------------------------------------
 * NO forma parte del runtime de la app. La aplicación sigue siendo 100%
 * curada y estática: este script únicamente comprueba, en tiempo de
 * autoría, que los metadatos escritos a mano sean coherentes con las
 * reglas del español (silabación vs. palabra, índice de sílaba tónica en
 * rango, esdrújulas/sobresdrújulas con tilde escrita, ids únicos, etc.).
 *
 * Se ejecuta desde `npm run lint`:  tsx scripts/validateBank.ts
 * Sale con código 1 si encuentra inconsistencias.
 */

import {
  ORTHOGRAPHY_WORD_BANK,
  MINIMAL_CONTRASTS,
  STRUCTURED_INPUT_EXERCISES,
  DISCOVERY_SETS,
  WORD_FAMILIES,
  DICTATION_ITEMS,
  INITIAL_DIAGNOSTIC_QUESTIONS,
  ESCAPE_SCENARIOS,
  PUNCTUATION_EXERCISES,
  CAPITALS_EXERCISES,
} from '../src/data/orthographyBank';
import { foldAccents, hasWrittenAccent, classifyAccent } from '../src/utils/proceduralEngine';

const VALID_CATEGORIES = new Set([
  'accentuation',
  'spellings',
  'punctuation',
  'morphology',
  'capitals',
]);

const errors: string[] = [];
const warnings: string[] = [];

function err(msg: string) {
  errors.push(msg);
}
function warn(msg: string) {
  warnings.push(msg);
}

function assertUniqueIds(name: string, ids: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) err(`[${name}] id duplicado: "${id}"`);
    seen.add(id);
  }
}

/* -------------------- ORTHOGRAPHY_WORD_BANK -------------------- */
assertUniqueIds('WORD_BANK', ORTHOGRAPHY_WORD_BANK.map((w) => w.id));

for (const item of ORTHOGRAPHY_WORD_BANK) {
  const tag = `WORD_BANK/${item.id} («${item.word}»)`;

  if (!VALID_CATEGORIES.has(item.category)) {
    err(`${tag}: category inválida "${item.category}"`);
  }

  // La palabra del banco es de una sola palabra: la silabación debe reconstruirla.
  // Se omite en formas con paréntesis u otros signos (p. ej. "rebelar(se)").
  const isPlainWord = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+$/.test(item.word);
  if (isPlainWord) {
    const joined = item.syllables.join('');
    if (joined !== item.word) {
      // permitir diferencia solo de mayúsculas
      if (joined.toLowerCase() !== item.word.toLowerCase()) {
        err(`${tag}: syllables.join()="${joined}" ≠ word="${item.word}"`);
      }
    }
  }

  // stressedSyllable en rango.
  if (
    item.stressedSyllable < 0 ||
    item.stressedSyllable >= item.syllables.length
  ) {
    err(
      `${tag}: stressedSyllable=${item.stressedSyllable} fuera de rango (0..${item.syllables.length - 1})`
    );
  } else if (isPlainWord) {
    // Coherencia acentuación ↔ tilde escrita.
    const cls = classifyAccent(item);
    if ((cls === 'esdrújula' || cls === 'sobresdrújula') && !hasWrittenAccent(item.word)) {
      err(`${tag}: clasificada ${cls} pero no lleva tilde escrita`);
    }
  }

  // commonErrors no deben ser idénticos (exactamente) a la forma correcta.
  // Se permite la variante en minúscula como distractor legítimo en topónimos
  // (p. ej. "españa" para "España"), que es justamente el error de mayúscula.
  for (const ce of item.commonErrors) {
    if (ce === item.word) {
      err(`${tag}: commonError "${ce}" es idéntico a la palabra correcta`);
    }
  }

  // socraticClues completas.
  if (!item.socraticClues?.level1 || !item.socraticClues?.level2 || !item.socraticClues?.level3) {
    err(`${tag}: socraticClues incompletas (se requieren level1/2/3)`);
  }
  if (item.examples.length === 0) {
    warn(`${tag}: sin examples`);
  }
}

/* -------------------- Otros datasets: ids únicos -------------------- */
assertUniqueIds('MINIMAL_CONTRASTS', MINIMAL_CONTRASTS.map((c) => c.id));
assertUniqueIds('STRUCTURED_INPUT', STRUCTURED_INPUT_EXERCISES.map((s) => s.id));
assertUniqueIds('DISCOVERY_SETS', DISCOVERY_SETS.map((d) => d.id));
assertUniqueIds('DICTATION_ITEMS', DICTATION_ITEMS.map((d) => d.id));
assertUniqueIds('DIAGNOSTIC', INITIAL_DIAGNOSTIC_QUESTIONS.map((q) => q.id));
assertUniqueIds('ESCAPE', ESCAPE_SCENARIOS.map((e) => e.id));
assertUniqueIds('PUNCTUATION', PUNCTUATION_EXERCISES.map((p) => p.id));
assertUniqueIds('CAPITALS', CAPITALS_EXERCISES.map((c) => c.id));

/* -------------------- Contrastes mínimos: coherencia por tilde -------------------- */
for (const c of MINIMAL_CONTRASTS) {
  const folded = c.forms.map((f) => foldAccents(f.word));
  const uniqueFolded = new Set(folded);
  if (uniqueFolded.size !== 1 && c.subcategory !== 'homofonos') {
    warn(
      `MINIMAL_CONTRASTS/${c.id}: las formas no comparten base sin tilde (${c.forms
        .map((f) => f.word)
        .join(', ')}) — verificá que sea un contraste válido`
    );
  }
}

/* -------------------- Diagnóstico: la respuesta correcta está entre las opciones -------------------- */
for (const q of INITIAL_DIAGNOSTIC_QUESTIONS) {
  if (q.options.length > 0 && !q.options.includes(q.correctAnswer)) {
    err(`DIAGNOSTIC/${q.id}: correctAnswer "${q.correctAnswer}" no está en options`);
  }
}

/* -------------------- Puntuación / Mayúsculas: campos mínimos por tipo -------------------- */
for (const p of PUNCTUATION_EXERCISES) {
  if (p.type === 'punctuate' && (!p.rawText || !p.canonical)) {
    err(`PUNCTUATION/${p.id}: tipo "punctuate" requiere rawText y canonical`);
  }
  if (p.type === 'compare' && (!p.options || p.options.length < 2)) {
    err(`PUNCTUATION/${p.id}: tipo "compare" requiere al menos 2 options`);
  }
  if (p.type === 'compare' && p.options && p.options.filter((o) => o.isBest).length !== 1) {
    err(`PUNCTUATION/${p.id}: tipo "compare" requiere exactamente 1 opción isBest`);
  }
  if (p.type === 'edit' && (!p.brokenText || !p.fixedText)) {
    err(`PUNCTUATION/${p.id}: tipo "edit" requiere brokenText y fixedText`);
  }
}

for (const c of CAPITALS_EXERCISES) {
  if (foldAccents(c.rawText).replace(/\s+/g, ' ').trim() !== foldAccents(c.correctedText).replace(/\s+/g, ' ').trim()) {
    // rawText y correctedText deben diferir SOLO en mayúsculas/minúsculas (y tildes que folding ignora).
    err(`CAPITALS/${c.id}: rawText y correctedText difieren en algo más que mayúsculas`);
  }
  if (c.targets.length === 0) {
    warn(`CAPITALS/${c.id}: sin targets declarados`);
  }
}

/* -------------------- Reporte -------------------- */
const totalWords = ORTHOGRAPHY_WORD_BANK.length;
console.log(`\n[validateBank] Banco léxico: ${totalWords} ítems`);
console.log(
  `[validateBank] Contrastes: ${MINIMAL_CONTRASTS.length} · Discovery: ${DISCOVERY_SETS.length} · Familias: ${WORD_FAMILIES.length} · Dictados: ${DICTATION_ITEMS.length} · Diagnóstico: ${INITIAL_DIAGNOSTIC_QUESTIONS.length}`
);
console.log(
  `[validateBank] Puntuación: ${PUNCTUATION_EXERCISES.length} · Mayúsculas: ${CAPITALS_EXERCISES.length} · Escape: ${ESCAPE_SCENARIOS.length} · Input estructurado: ${STRUCTURED_INPUT_EXERCISES.length}`
);

if (warnings.length) {
  console.log(`\n[validateBank] ⚠︎ ${warnings.length} avisos:`);
  warnings.forEach((w) => console.log('  - ' + w));
}

if (errors.length) {
  console.error(`\n[validateBank] ✗ ${errors.length} errores de datos:`);
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

console.log('\n[validateBank] ✓ Datos del banco consistentes.\n');
