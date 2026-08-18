/**
 * ORTOGRAFÍA LAB — Motor Ortográfico Procedural
 * ------------------------------------------------------------------
 * Núcleo 100% determinista y local. No usa ningún motor de IA ni
 * llamadas externas: toda la lógica (clasificación de acentuación,
 * índice de errores, análisis de texto y generación de ejercicios)
 * se deriva de reglas del español y de los metadatos del banco léxico.
 *
 * Objetivo pedagógico: que el contenido sea reutilizable y recombinable
 * (generación procedural) manteniendo la honestidad del feedback —
 * sólo se señala aquello que puede verificarse con reglas, nunca se
 * "adivina" la intención del estudiante.
 */

import {
  ORTHOGRAPHY_WORD_BANK,
  MINIMAL_CONTRASTS,
  STRUCTURED_INPUT_EXERCISES,
  DICTATION_ITEMS,
} from '../data/orthographyBank';
import {
  OrthoWordItem,
  MinimalContrastSet,
  TextEvaluationResult,
  ErrorCode,
  OrthoCategory,
  ErrorProfile,
  DailyChallenge,
  DailyChallengeSegment,
} from '../types';

/* ============================================================
 * 1. UTILIDADES FONO-ORTOGRÁFICAS DETERMINISTAS
 * ============================================================ */

const LETTER_CLASS = 'A-Za-zÁÉÍÓÚáéíóúÑñÜü';
const WORD_RE = new RegExp(`[${LETTER_CLASS}]+`, 'g');

/**
 * Quita las tildes de acentuación (á→a, é→e...) pero conserva la ñ.
 * Se apoya en la descomposición NFD y elimina las marcas combinantes
 * (U+0300–U+036F) salvo la virgulilla (U+0303) que forma la ñ.
 */
// Marcas combinantes de acentuación (U+0300–U+036F) EXCEPTO la virgulilla
// U+0303 que forma la ñ. Se construye vía RegExp para no incrustar
// caracteres combinantes literales en el código fuente.
const COMBINING_ACCENTS = new RegExp('[\\u0300-\\u0302\\u0304-\\u036f]', 'gu');

export function foldAccents(input: string): string {
  return input
    .normalize('NFD')
    .replace(COMBINING_ACCENTS, '') // elimina tildes; conserva U+0303 (ñ)
    .normalize('NFC')
    .toLowerCase();
}

export function hasWrittenAccent(word: string): boolean {
  return /[áéíóúÁÉÍÓÚ]/.test(word);
}

export type AccentClass = 'aguda' | 'llana' | 'esdrújula' | 'sobresdrújula';

/**
 * Clasifica una palabra por la posición de su sílaba tónica.
 * Usa los metadatos del banco (syllables + stressedSyllable), que son
 * la fuente de verdad prosódica; no intenta re-silabificar heurísticamente.
 */
export function classifyAccent(item: Pick<OrthoWordItem, 'syllables' | 'stressedSyllable'>): AccentClass {
  const n = item.syllables.length;
  const fromEnd = n - 1 - item.stressedSyllable; // 0 = última, 1 = penúltima...
  if (fromEnd <= 0) return 'aguda';
  if (fromEnd === 1) return 'llana';
  if (fromEnd === 2) return 'esdrújula';
  return 'sobresdrújula';
}

/* ============================================================
 * 2. PRNG DETERMINISTA (para ejercicios reutilizables y estables)
 * ============================================================ */

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Baraja de forma determinista a partir de una semilla textual. */
export function seededShuffle<T>(arr: T[], seedKey: string): T[] {
  const rng = mulberry32(hashSeed(seedKey));
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ============================================================
 * 3. ÍNDICE DE ERRORES ORTOGRÁFICOS (a partir del banco)
 * ============================================================ */

export interface MisspellingEntry {
  correct: string;
  code: ErrorCode;
  category: OrthoWordItem['category'];
  rule: string;
  socraticQuestion: string;
  wordId?: string;
}

/**
 * Conjunto de formas válidas del español presentes en el banco. Se usa
 * como guarda para NO marcar como error una forma que en realidad es una
 * palabra correcta en otro contexto (p. ej. "medico" = yo medico, o
 * "revelar" = descubrir). Esto evita falsos positivos en el corrector.
 */
function buildValidWordSet(): Set<string> {
  const valid = new Set<string>();
  const add = (w?: string) => {
    if (!w) return;
    const matches = w.match(WORD_RE);
    if (matches) matches.forEach((tok) => valid.add(tok.toLowerCase()));
  };

  ORTHOGRAPHY_WORD_BANK.forEach((item) => {
    add(item.word);
    item.confusableWith.forEach(add);
    item.examples.forEach((ex) => add(ex.sentence));
    add(item.exampleSentence);
  });
  MINIMAL_CONTRASTS.forEach((mc) => {
    mc.forms.forEach((f) => {
      add(f.word);
      add(f.exampleSentence);
    });
  });
  STRUCTURED_INPUT_EXERCISES.forEach((si) => {
    si.sentences.forEach((s) => add(s.sentence));
  });
  return valid;
}

function classifyMisspelling(
  miss: string,
  correct: string,
  category: OrthoWordItem['category']
): ErrorCode {
  const missFold = foldAccents(miss);
  const correctFold = foldAccents(correct);
  // Sólo difieren tildes -> problema de acentuación
  if (missFold === correctFold && miss.toLowerCase() !== correct.toLowerCase()) {
    return '[TIL]';
  }
  // La forma correcta lleva espacio pero el error los une -> segmentación
  if (!miss.includes(' ') && correct.includes(' ')) return '[SEG]';
  if (category === 'punctuation') return '[PUN]';
  if (category === 'capitals') return '[MA]';
  return '[ORT]';
}

/**
 * Lista curada de errores ELE MUY frecuentes, independiente del banco.
 * REGLA DE ORO: sólo se incluyen formas cuya versión "sin corregir" NO es
 * una palabra válida del español, para evitar falsos positivos. Por eso se
 * excluyen homógrafos verbales como «numero» (yo numero), «publico»,
 * «practico», «ultimo» (yo ultimo), «medico», etc.
 */
const RULE_TILDE_AGUDA_CION =
  'Los sustantivos terminados en -ción/-sión son agudos y llevan tilde en la última sílaba.';
const RULE_TILDE_GEN =
  'Revisá la sílaba tónica: agudas (tilde si terminan en n, s o vocal), llanas, esdrújulas (siempre) e hiatos.';
const Q_TILDE = '¿En qué sílaba recae el golpe de voz y qué regla de acentuación se aplica?';

const EXTRA_MISSPELLINGS: Array<[string, string, ErrorCode, string]> = [
  // -ción / -sión (agudas)
  ['confirmacion', 'confirmación', '[TIL]', RULE_TILDE_AGUDA_CION],
  ['opinion', 'opinión', '[TIL]', RULE_TILDE_AGUDA_CION],
  ['informacion', 'información', '[TIL]', RULE_TILDE_AGUDA_CION],
  ['educacion', 'educación', '[TIL]', RULE_TILDE_AGUDA_CION],
  ['situacion', 'situación', '[TIL]', RULE_TILDE_AGUDA_CION],
  ['cancion', 'canción', '[TIL]', RULE_TILDE_AGUDA_CION],
  ['television', 'televisión', '[TIL]', RULE_TILDE_AGUDA_CION],
  ['tradicion', 'tradición', '[TIL]', RULE_TILDE_AGUDA_CION],
  ['atencion', 'atención', '[TIL]', RULE_TILDE_AGUDA_CION],
  ['revolucion', 'revolución', '[TIL]', RULE_TILDE_AGUDA_CION],
  // agudas terminadas en -n / -s / vocal
  ['tambien', 'también', '[TIL]', RULE_TILDE_GEN],
  ['despues', 'después', '[TIL]', RULE_TILDE_GEN],
  ['ademas', 'además', '[TIL]', RULE_TILDE_GEN],
  ['corazon', 'corazón', '[TIL]', RULE_TILDE_GEN],
  ['razon', 'razón', '[TIL]', RULE_TILDE_GEN],
  ['avion', 'avión', '[TIL]', RULE_TILDE_GEN],
  ['aqui', 'aquí', '[TIL]', RULE_TILDE_GEN],
  ['asi', 'así', '[TIL]', RULE_TILDE_GEN],
  ['proximo', 'próximo', '[TIL]', 'Esdrújula: siempre lleva tilde (PRÓ-xi-mo).'],
  // gentilicios (formas cuya versión sin tilde no es palabra válida)
  ['aleman', 'alemán', '[TIL]', RULE_TILDE_GEN],
  ['frances', 'francés', '[TIL]', RULE_TILDE_GEN],
  // hiatos
  ['dia', 'día', '[TIL]', 'Hiato: la vocal cerrada tónica (í) rompe el diptongo y lleva tilde: dí-a.'],
  ['dias', 'días', '[TIL]', 'Hiato: la vocal cerrada tónica (í) rompe el diptongo y lleva tilde: dí-as.'],
  ['queria', 'quería', '[TIL]', 'Hiato en el imperfecto (-ía): que-rí-a lleva tilde en la í.'],
  ['recibi', 'recibí', '[TIL]', 'Pretérito agudo terminado en vocal: reci-BÍ lleva tilde.'],
  // esdrújulas / llanas con tilde
  ['telefono', 'teléfono', '[TIL]', 'Esdrújula: siempre lleva tilde (te-LÉ-fo-no).'],
  ['pagina', 'página', '[TIL]', 'Esdrújula: siempre lleva tilde (PÁ-gi-na).'],
  ['jovenes', 'jóvenes', '[TIL]', 'Esdrújula: siempre lleva tilde (JÓ-ve-nes).'],
  ['facil', 'fácil', '[TIL]', 'Llana terminada en consonante distinta de n/s: lleva tilde (FÁ-cil).'],
  ['dificil', 'difícil', '[TIL]', 'Llana terminada en consonante distinta de n/s: lleva tilde (di-FÍ-cil).'],
  ['arbol', 'árbol', '[TIL]', 'Llana terminada en consonante distinta de n/s: lleva tilde (ÁR-bol).'],
  // grafías b/v verificables (sólo formas cuyo error NO es palabra válida;
  // «tubo» no se incluye porque es una palabra correcta)
  ['estubo', 'estuvo', '[ORT]', 'El pretérito de «estar» se escribe con V: estuvo (familia de «estuve, estuviste»).'],
  ['estube', 'estuve', '[ORT]', 'El pretérito de «estar» (1ª persona) se escribe con V: estuve.'],
  // grafías g/j (formas cuya versión sin corregir NO es palabra válida)
  ['garage', 'garaje', '[ORT]', 'El sufijo -aje se escribe siempre con J: garaje.'],
  ['mensage', 'mensaje', '[ORT]', 'El sufijo -aje se escribe siempre con J: mensaje.'],
  ['viage', 'viaje', '[ORT]', 'El sufijo -aje se escribe siempre con J: viaje.'],
  ['cojer', 'coger', '[ORT]', 'Los verbos en -ger se escriben con G: coger (como proteger, recoger).'],
  ['dijieron', 'dijeron', '[ORT]', 'Pretérito de «decir»: dijeron (sin i intermedia).'],
  // grafías h (formas no válidas del español)
  ['aser', 'hacer', '[ORT]', 'El verbo «hacer» lleva H inicial muda y C.'],
  ['iso', 'hizo', '[ORT]', 'El pretérito de «hacer» lleva H y Z: hizo.'],
  // segmentación / no-palabras frecuentes
  ['nadien', 'nadie', '[ORT]', '«nadie» no lleva n final: es un indefinido invariable.'],
  ['haiga', 'haya', '[ORT]', 'La forma correcta del subjuntivo de haber es «haya», no «haiga».'],
];

let _misspellingIndex: Map<string, MisspellingEntry> | null = null;

/**
 * Índice reutilizable: forma incorrecta (una sola palabra) -> corrección.
 * Se construye una vez a partir de `commonErrors` de todo el banco,
 * excluyendo formas ambiguas que sean palabras válidas.
 */
export function getMisspellingIndex(): Map<string, MisspellingEntry> {
  if (_misspellingIndex) return _misspellingIndex;
  const valid = buildValidWordSet();
  const index = new Map<string, MisspellingEntry>();

  ORTHOGRAPHY_WORD_BANK.forEach((item) => {
    item.commonErrors.forEach((rawMiss) => {
      const miss = rawMiss.trim();
      // Sólo tokens de una sola palabra (los multi-palabra son ambiguos)
      if (!miss || /\s/.test(miss)) return;
      const key = miss.toLowerCase();
      // Guarda anti-falsos-positivos: no marcar palabras válidas
      if (valid.has(key)) return;
      if (index.has(key)) return;
      const cleanCorrect = (item.word.match(WORD_RE)?.[0]) || item.word;
      index.set(key, {
        correct: cleanCorrect,
        code: classifyMisspelling(miss, cleanCorrect, item.category),
        category: item.category,
        rule: item.rule,
        socraticQuestion: item.socraticClues.level1,
        wordId: item.id,
      });
    });
  });

  // Lista curada complementaria (no derivada del banco)
  EXTRA_MISSPELLINGS.forEach(([miss, correct, code, rule]) => {
    const key = miss.toLowerCase();
    if (valid.has(key) || index.has(key)) return;
    index.set(key, {
      correct,
      code,
      category: code === '[ORT]' ? 'spellings' : 'accentuation',
      rule,
      socraticQuestion: code === '[ORT]'
        ? '¿Qué otra palabra de la misma familia léxica conocés para decidir la grafía?'
        : Q_TILDE,
    });
  });

  _misspellingIndex = index;
  return index;
}

/* ============================================================
 * 4. REGLAS ORTOGRÁFICAS INDEPENDIENTES DEL BANCO
 * ============================================================ */

// Palabras que se escriben en minúscula en español (error típico por
// interferencia con el inglés/alemán): días, meses, idiomas y gentilicios.
const LOWERCASE_WORDS = new Set(
  [
    'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo',
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
    'septiembre', 'setiembre', 'octubre', 'noviembre', 'diciembre',
    'español', 'inglés', 'francés', 'italiano', 'alemán', 'portugués',
    'chino', 'japonés', 'coreano', 'ruso', 'árabe',
    'lunes', 'primavera', 'verano', 'otoño', 'invierno',
  ].map((w) => w.toLowerCase())
);

// Nombres propios frecuentes (países, ciudades) que suelen escribirse por
// error en minúscula. Mapea forma en minúscula -> forma correcta. Solo se
// incluyen los que NO son también palabra común (evita falsos positivos).
const PROPER_NOUNS = new Map<string, string>([
  ['españa', 'España'],
  ['méxico', 'México'],
  ['argentina', 'Argentina'],
  ['perú', 'Perú'],
  ['colombia', 'Colombia'],
  ['chile', 'Chile'],
  ['madrid', 'Madrid'],
  ['barcelona', 'Barcelona'],
  ['bogotá', 'Bogotá'],
  ['montevideo', 'Montevideo'],
  ['europa', 'Europa'],
  ['américa', 'América'],
]);

function capitalizeFirst(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Conectores discursivos que exigen coma delimitadora tras ellos.
const CONNECTORS: string[][] = [
  ['sin', 'embargo'],
  ['no', 'obstante'],
  ['por', 'lo', 'tanto'],
  ['por', 'consiguiente'],
  ['es', 'decir'],
  ['por', 'ejemplo'],
  ['en', 'cambio'],
  ['por', 'último'],
  ['en', 'conclusión'],
  ['en', 'resumen'],
  ['además'],
  ['asimismo'],
];

// Uniones indebidas frecuentes -> forma segmentada correcta.
const JOINED_WORDS: Record<string, string> = {
  sinembargo: 'sin embargo',
  osea: 'o sea',
  aveces: 'a veces',
  porfavor: 'por favor',
  porfin: 'por fin',
  deacuerdo: 'de acuerdo',
  amenudo: 'a menudo',
  apartir: 'a partir',
  alrededor: 'alrededor', // válida (no marcar) — placeholder de referencia
};
delete JOINED_WORDS.alrededor;

const SENTENCE_BOUNDARY = new Set(['.', '!', '?', '¡', '¿', ':', ';', '\n', '\r', '»', '"', '“']);

/* ============================================================
 * 5. ANÁLISIS DE TEXTO DETERMINISTA (reemplazo del evaluador IA)
 * ============================================================ */

interface RawFinding {
  start: number; // offset donde termina el token (para insertar el código)
  code: ErrorCode;
  token: string;
  correct: string;
  suggestion: string;
  socraticQuestion?: string;
}

interface TokenPos {
  text: string;
  start: number;
  end: number;
}

function tokenize(text: string): TokenPos[] {
  const toks: TokenPos[] = [];
  const re = new RegExp(`[${LETTER_CLASS}]+`, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    toks.push({ text: m[0], start: m.index, end: m.index + m[0].length });
  }
  return toks;
}

function isSentenceStart(text: string, tokenStart: number): boolean {
  let i = tokenStart - 1;
  while (i >= 0 && /\s/.test(text[i])) i--;
  if (i < 0) return true;
  return SENTENCE_BOUNDARY.has(text[i]);
}

const CODE_META: Record<ErrorCode, { label: string; advice: string }> = {
  '[ORT]': { label: 'Grafía', advice: 'Revisá las grafías dudosas (b/v, g/j, h muda, c/s/z).' },
  '[TIL]': { label: 'Tilde', advice: 'Revisá la acentuación: sílaba tónica, hiatos y tilde diacrítica.' },
  '[PUN]': { label: 'Puntuación', advice: 'Los conectores discursivos van delimitados por comas.' },
  '[MA]': { label: 'Mayúscula', advice: 'Días, meses, idiomas y gentilicios se escriben en minúscula.' },
  '[SEG]': { label: 'Segmentación', advice: 'Revisá la separación o unión indebida de palabras.' },
};

export interface ProceduralAnalysis extends TextEvaluationResult {
  stats: Record<ErrorCode, number>;
  totalWords: number;
}

/**
 * Analiza un texto y devuelve marcas indirectas ([ORT], [TIL], [PUN],
 * [MA], [SEG]) de forma completamente determinista.
 *
 * IMPORTANTE (honestidad pedagógica): detecta trampas ortográficas
 * VERIFICABLES por regla (formas mal escritas conocidas, mayúsculas de
 * días/meses/idiomas, comas de conectores, uniones indebidas). No evalúa
 * gramática ni estilo ni "adivina" errores fuera de su cobertura.
 */
export function analyzeText(text: string): ProceduralAnalysis {
  const index = getMisspellingIndex();
  const tokens = tokenize(text);
  const findings: RawFinding[] = [];
  const stats: Record<ErrorCode, number> = { '[ORT]': 0, '[TIL]': 0, '[PUN]': 0, '[MA]': 0, '[SEG]': 0 };

  const lowered = tokens.map((t) => t.text.toLowerCase());

  tokens.forEach((tok, i) => {
    const lower = lowered[i];

    // (a) Índice de formas mal escritas conocidas
    const hit = index.get(lower);
    if (hit) {
      findings.push({
        start: tok.end,
        code: hit.code,
        token: tok.text,
        correct: hit.correct,
        suggestion: `«${tok.text}» → «${hit.correct}». ${hit.rule}`,
        socraticQuestion: hit.socraticQuestion,
      });
      return;
    }

    // (b) Uniones indebidas -> segmentación
    if (JOINED_WORDS[lower]) {
      findings.push({
        start: tok.end,
        code: '[SEG]',
        token: tok.text,
        correct: JOINED_WORDS[lower],
        suggestion: `«${tok.text}» debe escribirse separado: «${JOINED_WORDS[lower]}».`,
        socraticQuestion: '¿Es una sola palabra o una locución de varias palabras?',
      });
      return;
    }

    // (c) Mayúscula indebida en días, meses, idiomas y gentilicios
    if (LOWERCASE_WORDS.has(lower) && /^[A-ZÁÉÍÓÚÑ]/.test(tok.text) && !isSentenceStart(text, tok.start)) {
      findings.push({
        start: tok.end,
        code: '[MA]',
        token: tok.text,
        correct: lower,
        suggestion: `En español, «${tok.text}» va en minúscula salvo a comienzo de oración.`,
        socraticQuestion: '¿Los días, meses e idiomas se escriben con mayúscula inicial en español?',
      });
      return;
    }

    // (e) Nombre propio (país/ciudad) escrito en minúscula
    const proper = PROPER_NOUNS.get(lower);
    if (proper && tok.text !== proper) {
      findings.push({
        start: tok.end,
        code: '[MA]',
        token: tok.text,
        correct: proper,
        suggestion: `«${tok.text}» es un nombre propio: se escribe «${proper}».`,
        socraticQuestion: '¿Los nombres de países y ciudades llevan mayúscula inicial?',
      });
      return;
    }

    // (f) Falta de mayúscula inicial de oración
    if (
      isSentenceStart(text, tok.start) &&
      tok.text.length > 1 &&
      /^[a-záéíóúñü]/.test(tok.text)
    ) {
      findings.push({
        start: tok.end,
        code: '[MA]',
        token: tok.text,
        correct: capitalizeFirst(tok.text),
        suggestion: `Toda oración empieza con mayúscula: «${capitalizeFirst(tok.text)}».`,
        socraticQuestion: '¿Con qué letra debe empezar una oración?',
      });
      return;
    }
  });

  // (d) Conectores discursivos sin coma delimitadora
  for (let i = 0; i < tokens.length; i++) {
    for (const phrase of CONNECTORS) {
      if (lowered[i] !== phrase[0]) continue;
      let ok = true;
      for (let k = 1; k < phrase.length; k++) {
        if (lowered[i + k] !== phrase[k]) { ok = false; break; }
      }
      if (!ok) continue;
      const endTok = tokens[i + phrase.length - 1];
      // ¿Qué carácter sigue inmediatamente al conector?
      const after = text.slice(endTok.end);
      const nextNonSpace = after.match(/^\s*(\S)/);
      // Si sigue una palabra (letra) sin coma/;/: previa -> falta coma
      if (nextNonSpace && new RegExp(`[${LETTER_CLASS}]`).test(nextNonSpace[1])) {
        findings.push({
          start: endTok.end,
          code: '[PUN]',
          token: phrase.join(' '),
          correct: `${phrase.join(' ')},`,
          suggestion: `El conector «${phrase.join(' ')}» debe ir seguido de coma.`,
          socraticQuestion: '¿Qué pausa hacés al pronunciar el conector en voz alta?',
        });
      }
      break;
    }
  }

  // (g) Signos de interrogación/exclamación sin su apertura (¿ / ¡)
  const countQ = (text.match(/\?/g) || []).length;
  const countOpenQ = (text.match(/¿/g) || []).length;
  if (countQ > countOpenQ) {
    const pos = text.lastIndexOf('?');
    findings.push({
      start: pos >= 0 ? pos : text.length,
      code: '[PUN]',
      token: '?',
      correct: '¿…?',
      suggestion: 'Toda pregunta en español se abre con «¿» y se cierra con «?».',
      socraticQuestion: '¿Qué signo marca el comienzo de una pregunta en español?',
    });
  }
  const countE = (text.match(/!/g) || []).length;
  const countOpenE = (text.match(/¡/g) || []).length;
  if (countE > countOpenE) {
    const pos = text.lastIndexOf('!');
    findings.push({
      start: pos >= 0 ? pos : text.length,
      code: '[PUN]',
      token: '!',
      correct: '¡…!',
      suggestion: 'Toda exclamación en español se abre con «¡» y se cierra con «!».',
      socraticQuestion: '¿Qué signo marca el comienzo de una exclamación en español?',
    });
  }

  // Ordenar por posición e insertar los códigos en el texto anotado
  findings.sort((a, b) => a.start - b.start);
  findings.forEach((f) => { stats[f.code]++; });

  let annotated = '';
  let cursor = 0;
  // Evitar códigos duplicados en la misma posición
  const seenPos = new Set<string>();
  for (const f of findings) {
    const posKey = `${f.start}:${f.code}`;
    if (seenPos.has(posKey)) continue;
    seenPos.add(posKey);
    annotated += text.slice(cursor, f.start) + ` ${f.code}`;
    cursor = f.start;
  }
  annotated += text.slice(cursor);

  const totalErrors = findings.length;
  const totalWords = tokens.length || 1;
  const score = Math.max(0, Math.round(100 * (totalWords - totalErrors) / totalWords));

  // Consolidar feedbackItems por código (una tarjeta por tipo de error)
  const byCode = new Map<ErrorCode, RawFinding[]>();
  findings.forEach((f) => {
    if (!byCode.has(f.code)) byCode.set(f.code, []);
    byCode.get(f.code)!.push(f);
  });

  const feedbackItems = Array.from(byCode.entries()).map(([code, list]) => {
    const words = Array.from(new Set(list.map((l) => l.token))).join(' · ');
    return {
      code,
      word: words,
      suggestion: list.length === 1 ? list[0].suggestion : `${CODE_META[code].advice} Formas señaladas: ${words}.`,
      socraticQuestion: list[0].socraticQuestion,
    };
  });

  const adviceParts: string[] = [];
  (Object.keys(stats) as ErrorCode[]).forEach((code) => {
    if (stats[code] > 0) adviceParts.push(CODE_META[code].advice);
  });
  const socraticAdvice = totalErrors === 0
    ? 'No se detectaron trampas ortográficas verificables por regla. Revisá igualmente concordancia y estilo, que este corrector no evalúa.'
    : adviceParts.join(' ');

  return {
    score,
    annotatedText: annotated,
    feedbackItems,
    socraticAdvice,
    stats,
    totalWords: tokens.length,
    isOffline: false,
  };
}

/* ============================================================
 * 6. GENERACIÓN PROCEDURAL DE EJERCICIOS (reutilizables)
 * ============================================================ */

export interface GeneratedChoiceExercise {
  id: string;
  word: string;
  prompt: string;
  contextSentence: string;
  options: string[];
  correct: string;
  code: ErrorCode;
  explanation: string;
  socraticClue: string;
}

/**
 * A partir de CUALQUIER ítem del banco genera un ejercicio de elección de
 * forma correcta, usando sus `commonErrors` como distractores. Determinista
 * y reutilizable: mismas opciones para el mismo ítem.
 */
export function generateSpellingChoice(item: OrthoWordItem): GeneratedChoiceExercise {
  const cleanWord = (item.word.match(WORD_RE)?.[0]) || item.word;
  const distractors = item.commonErrors
    .filter((e) => !/\s/.test(e))
    .slice(0, 3);
  const pool = Array.from(new Set([cleanWord, ...distractors]));
  const options = pool.length > 1 ? seededShuffle(pool, `choice-${item.id}`) : pool;
  const example = item.examples[0]?.sentence || item.exampleSentence || '';
  const blanked = example
    ? example.replace(new RegExp(cleanWord, 'i'), '_____')
    : '';
  const code = distractors.length
    ? classifyMisspelling(distractors[0], cleanWord, item.category)
    : '[ORT]';

  return {
    id: `gen-choice-${item.id}`,
    word: cleanWord,
    prompt: '¿Cuál es la forma ortográficamente correcta?',
    contextSentence: blanked,
    options,
    correct: cleanWord,
    code,
    explanation: item.rule,
    socraticClue: item.socraticClues.level1,
  };
}

export interface GeneratedContrastChallenge {
  question: string;
  correct: string;
  options: string[];
  explanation: string;
}

/**
 * Construye, de forma determinista y coherente con los datos, el desafío
 * de discriminación de un contraste mínimo. Elige una de las formas del
 * conjunto y pregunta por su FUNCIÓN gramatical real (no por una regla
 * hardcodeada), de modo que sirve para cualquier tríada o par.
 */
export function buildContrastChallenge(contrast: MinimalContrastSet): GeneratedContrastChallenge {
  const rng = mulberry32(hashSeed(`contrast-${contrast.id}`));
  const targetIdx = Math.floor(rng() * contrast.forms.length);
  const target = contrast.forms[targetIdx];
  return {
    question: `¿Cuál de estas formas funciona como «${target.grammaticalFunction}»?`,
    correct: target.word,
    options: contrast.forms.map((f) => f.word),
    explanation: `«${target.word}» — ${target.accentType}. ${target.meaningContext} Ej.: ${target.exampleSentence}`,
  };
}

/**
 * Genera un lote reutilizable de ejercicios de elección a partir del banco,
 * opcionalmente filtrando por categoría y nivel. Permite que el laboratorio
 * no dependa de un puñado de ítems escritos a mano.
 */
export function generateExerciseBatch(opts?: {
  category?: OrthoWordItem['category'];
  count?: number;
}): GeneratedChoiceExercise[] {
  const pool = ORTHOGRAPHY_WORD_BANK.filter(
    (i) => (!opts?.category || i.category === opts.category) && i.commonErrors.some((e) => !/\s/.test(e))
  );
  const ordered = seededShuffle(pool, `batch-${opts?.category || 'all'}`);
  const count = opts?.count ?? ordered.length;
  return ordered.slice(0, count).map(generateSpellingChoice);
}

/* ============================================================
 * 7. DESAFÍO DEL DÍA (§37) — ensamblado determinista por fecha
 * ============================================================
 * Selecciona de forma reproducible (misma fecha → mismo desafío) un
 * conjunto de segmentos, priorizando las categorías más débiles del
 * perfil de error del estudiante. No usa IA: solo el PRNG sembrado por
 * la fecha y los metadatos del banco.
 */

const CATEGORY_LABELS: Record<OrthoCategory, string> = {
  accentuation: 'Acentuación',
  spellings: 'Grafías',
  punctuation: 'Puntuación',
  morphology: 'Morfología',
  capitals: 'Mayúsculas',
};

/** Devuelve las categorías ordenadas de más débil a más fuerte. */
export function weakestCategories(profile: ErrorProfile, take = 2): OrthoCategory[] {
  const entries = (Object.keys(profile) as OrthoCategory[])
    .map((cat) => ({ cat, score: profile[cat] ?? 100 }))
    .sort((a, b) => a.score - b.score);
  return entries.slice(0, take).map((e) => e.cat);
}

export function assembleDailyChallenge(dateKey: string, profile: ErrorProfile): DailyChallenge {
  const seed = `daily-${dateKey}`;
  const focusCategories = weakestCategories(profile, 2);
  const segments: DailyChallengeSegment[] = [];

  // 3 contrastes (priorizando los de las categorías débiles cuando existan)
  const contrastPool = MINIMAL_CONTRASTS.slice();
  const contrastWeak = contrastPool.filter((c) => focusCategories.includes(c.category));
  const contrastOrdered = seededShuffle(
    contrastWeak.length >= 3 ? contrastWeak : contrastPool,
    `${seed}-contrast`
  );
  contrastOrdered.slice(0, 3).forEach((c) =>
    segments.push({ kind: 'contrast', refId: c.id, label: `Contraste: ${c.title}` })
  );

  // 4 palabras (priorizando categorías débiles)
  const wordWeak = ORTHOGRAPHY_WORD_BANK.filter((w) => focusCategories.includes(w.category));
  const wordOrdered = seededShuffle(
    wordWeak.length >= 4 ? wordWeak : ORTHOGRAPHY_WORD_BANK.slice(),
    `${seed}-word`
  );
  wordOrdered.slice(0, 4).forEach((w) =>
    segments.push({ kind: 'spelling', refId: w.id, label: `Palabra: ${w.word}` })
  );

  // 1 dictado
  const dict = seededShuffle(DICTATION_ITEMS.slice(), `${seed}-dict`)[0];
  if (dict) segments.push({ kind: 'dictation', refId: dict.id, label: `Dictado: ${dict.contextTopic}` });

  // 1 mini-texto (input estructurado)
  const mini = seededShuffle(STRUCTURED_INPUT_EXERCISES.slice(), `${seed}-mini`)[0];
  if (mini) segments.push({ kind: 'miniText', refId: mini.id, label: `Mini-texto: ${CATEGORY_LABELS[mini.category]}` });

  return {
    dateKey,
    seed,
    estimatedMinutes: Math.max(6, Math.round(segments.length * 1.1)),
    focusCategories,
    segments,
  };
}

/** Clave de fecha local (YYYY-MM-DD) para sembrar el desafío del día. */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
