import { OrthoWordItem } from '../../types';

/**
 * Tercer lote curado del banco léxico (Fase 3 — ampliación B2/C1/C2).
 * Mismos criterios que words.ts / words2.ts: silabación y sílaba tónica
 * escritas y verificadas a mano (scripts/validateBank.ts comprueba la
 * coherencia). Foco en el tramo alto del MCER:
 *   - Esdrújulas cultas y tecnicismos (análisis, hipótesis, parámetro…).
 *   - Cambios de acentuación en el plural (examen → exámenes, joven →
 *     jóvenes, régimen → regímenes).
 *   - Hiatos cultos (continúa, garantía).
 *   - H intercalada/muda en cultismos (vehículo, cohesión, exhaustivo).
 *   - Grupo -x- y diéresis -gü- (contexto, bilingüe, vergüenza).
 *   - Tríadas verbo/sustantivo homógrafas (público/publico/publicó).
 *   - Adverbios en -mente (con y sin tilde heredada).
 *   - Homófonos cultos (haber/a ver, rebelar/revelar, halla/haya).
 *
 * Las formas homógrafas ambiguas (que SÍ son palabras válidas del español,
 * como «publico», «revelar», «haya») se declaran en `confusableWith`: así el
 * corrector procedural las reconoce como válidas (regla de oro
 * anti-falsos-positivos en getMisspellingIndex) y a la vez sirven de
 * distractores en los ejercicios de elección de forma.
 */

/* ---------- Helper de autoría compacto (solo tipado, sin lógica) ---------- */
type Clue = { level1: string; level2: string; level3: string };
function w(
  id: string, word: string, level: OrthoWordItem['level'], category: OrthoWordItem['category'],
  subcategory: string, difficulty: number, syllables: string[], stressedSyllable: number,
  rule: string, ruleCategoryName: string, semanticField: string,
  frequency: OrthoWordItem['frequency'], commonErrors: string[], confusableWith: string[],
  example: string, exampleRole: string, l1Risk: OrthoWordItem['l1Risk'],
  anchorLetter: string, anchorDesc: string, clues: Clue,
  accentType?: OrthoWordItem['accentType'],
): OrthoWordItem {
  return {
    id, word, level, category, subcategory, difficulty, syllables, stressedSyllable,
    rule, ruleCategoryName, semanticField, frequency, commonErrors, confusableWith,
    examples: [{ sentence: example, role: exampleRole }], l1Risk,
    visualAnchor: { letterToHighlight: anchorLetter, description: anchorDesc },
    socraticClues: clues, accentType,
  };
}

const ESDRU = 'Acentuación esdrújula';
const HIATO = 'Hiato con tilde';
const HMUDA = 'H intercalada muda';
const DIERESIS = 'Diéresis (gü)';
const TRIADA = 'Tríada verbo/sustantivo';

export const EXTRA_WORDS_3: OrthoWordItem[] = [
  /* ===== C1 · Esdrújulas cultas y tecnicismos ===== */
  w('w3-analisis', 'análisis', 'C1', 'accentuation', 'esdrujula', 4, ['a', 'ná', 'li', 'sis'], 1,
    'Esdrújula: siempre lleva tilde (a-NÁ-li-sis). Invariable en plural (los análisis).', ESDRU, 'Academia', 'medium',
    ['analisis'], ['análisis'], 'El análisis de datos fue exhaustivo.', 'Sustantivo', ['inglés', 'francés'],
    'Á', 'Esdrújula: tilde obligatoria en la antepenúltima.',
    { level1: '¿Cuántas sílabas contás desde el final hasta el golpe de voz?', level2: 'Antepenúltima tónica → esdrújula → tilde obligatoria.', level3: 'Se escribe "análisis".' }, 'esdrújula'),
  w('w3-hipotesis', 'hipótesis', 'C1', 'accentuation', 'esdrujula', 4, ['hi', 'pó', 'te', 'sis'], 1,
    'Esdrújula: siempre lleva tilde (hi-PÓ-te-sis).', ESDRU, 'Ciencia', 'medium',
    ['hipotesis'], ['hipótesis'], 'Planteamos una hipótesis verificable.', 'Sustantivo', ['inglés', 'francés'],
    'Ó', 'Esdrújula culta con tilde.',
    { level1: '¿La fuerza cae tres sílabas antes del final?', level2: 'Esdrújula → tilde sí o sí.', level3: 'Se escribe "hipótesis".' }, 'esdrújula'),
  w('w3-parametro', 'parámetro', 'C1', 'accentuation', 'esdrujula', 4, ['pa', 'rá', 'me', 'tro'], 1,
    'Esdrújula: siempre lleva tilde (pa-RÁ-me-tro).', ESDRU, 'Ciencia', 'medium',
    ['parametro'], ['parámetro'], 'Ajustamos cada parámetro del modelo.', 'Sustantivo', ['inglés'],
    'Á', 'Esdrújula técnica con tilde.',
    { level1: '¿Dónde está el golpe de voz?', level2: 'Antepenúltima tónica → esdrújula.', level3: 'Se escribe "parámetro".' }, 'esdrújula'),
  w('w3-sintesis', 'síntesis', 'C1', 'accentuation', 'esdrujula', 3, ['sín', 'te', 'sis'], 0,
    'Esdrújula: siempre lleva tilde (SÍN-te-sis). Invariable en plural.', ESDRU, 'Academia', 'medium',
    ['sintesis'], ['síntesis'], 'La síntesis final aclaró el debate.', 'Sustantivo', ['inglés', 'francés'],
    'Í', 'Esdrújula con tilde en la primera sílaba.',
    { level1: '¿La sílaba fuerte es SÍN o te?', level2: 'Esdrújula → tilde obligatoria.', level3: 'Se escribe "síntesis".' }, 'esdrújula'),
  w('w3-ambito', 'ámbito', 'C1', 'accentuation', 'esdrujula', 3, ['ám', 'bi', 'to'], 0,
    'Esdrújula: siempre lleva tilde (ÁM-bi-to).', ESDRU, 'Academia', 'medium',
    ['ambito'], ['ámbito'], 'Trabaja en el ámbito educativo.', 'Sustantivo', ['inglés'],
    'Á', 'Esdrújula con tilde inicial.',
    { level1: '¿Contás tres sílabas desde el final?', level2: 'Esdrújula → tilde.', level3: 'Se escribe "ámbito".' }, 'esdrújula'),

  /* ===== C1 · Cambio de acentuación en el plural ===== */
  w('w3-examenes', 'exámenes', 'C1', 'accentuation', 'plural-acento', 3, ['e', 'xá', 'me', 'nes'], 1,
    'El singular "examen" es llano y sin tilde; el plural suma una sílaba y pasa a esdrújula, por eso lleva tilde (e-XÁ-me-nes).', ESDRU, 'Educación', 'high',
    ['examenes'], ['examen', 'exámen'], 'Rendí todos los exámenes finales.', 'Sustantivo (plural)', ['inglés', 'francés'],
    'Á', 'El plural se vuelve esdrújula y gana tilde.',
    { level1: '¿Cambia la sílaba tónica al pasar a plural?', level2: 'Examen (llana) → exámenes (esdrújula, con tilde).', level3: 'Se escribe "exámenes".' }, 'esdrújula'),
  w('w3-jovenes', 'jóvenes', 'B2', 'accentuation', 'plural-acento', 3, ['jó', 've', 'nes'], 0,
    'El plural de "joven" es esdrújulo y lleva tilde (JÓ-ve-nes), aunque el singular no la lleve.', ESDRU, 'Sociedad', 'high',
    ['jovenes'], ['joven'], 'Los jóvenes participaron del taller.', 'Sustantivo (plural)', ['inglés', 'portugués'],
    'Ó', 'El plural pasa a esdrújula: tilde.',
    { level1: '¿Joven lleva tilde? ¿Y jóvenes?', level2: 'Singular llano sin tilde → plural esdrújulo con tilde.', level3: 'Se escribe "jóvenes".' }, 'esdrújula'),
  w('w3-regimenes', 'regímenes', 'C1', 'accentuation', 'plural-acento', 4, ['re', 'gí', 'me', 'nes'], 1,
    'Caso especial: "régimen" (esdrújula) desplaza el acento al formar el plural "regímenes" (RE-gí-me-nes), que sigue siendo esdrújula.', ESDRU, 'Política', 'low',
    ['regimenes', 'régimenes'], ['régimen'], 'Compararon distintos regímenes políticos.', 'Sustantivo (plural)', ['inglés', 'francés'],
    'Í', 'El acento se desplaza pero la tilde se mantiene.',
    { level1: '¿La sílaba tónica de régimen y regímenes es la misma?', level2: 'El acento se corre una sílaba, pero sigue siendo esdrújula: tilde.', level3: 'Se escribe "regímenes".' }, 'esdrújula'),

  /* ===== C1 · Hiatos cultos ===== */
  w('w3-continua', 'continúa', 'C1', 'accentuation', 'hiato', 3, ['con', 'ti', 'nú', 'a'], 2,
    'Hiato: la vocal cerrada tónica (ú) rompe el diptongo y lleva tilde (con-ti-NÚ-a), a diferencia del adjetivo "continua" (con-TI-nua).', HIATO, 'Verbos', 'medium',
    ['continua'], ['continua'], 'El proceso continúa sin pausas.', 'Verbo (3.ª persona)', ['inglés', 'italiano'],
    'Ú', 'Vocal cerrada tónica: rompe el diptongo con tilde.',
    { level1: '¿Se pronuncia "continua" o "continúa"?', level2: 'Si la u es tónica, hay hiato y lleva tilde.', level3: 'El verbo se escribe "continúa".' }, 'llana'),
  w('w3-garantia', 'garantía', 'B2', 'accentuation', 'hiato', 3, ['ga', 'ran', 'tí', 'a'], 2,
    'Hiato: la í tónica rompe el diptongo y lleva tilde (ga-ran-TÍ-a).', HIATO, 'Economía', 'high',
    ['garantia'], ['garantías'], 'El producto tiene garantía de dos años.', 'Sustantivo', ['inglés', 'portugués'],
    'Í', 'Hiato -ía: tilde en la i.',
    { level1: '¿La i forma diptongo o hiato con la a?', level2: 'Vocal cerrada tónica (í) → hiato → tilde.', level3: 'Se escribe "garantía".' }, 'llana'),

  /* ===== C1 · H intercalada / muda en cultismos ===== */
  w('w3-vehiculo', 'vehículo', 'B2', 'spellings', 'h_intercalada', 3, ['ve', 'hí', 'cu', 'lo'], 1,
    'Lleva H intercalada muda entre vocales y es esdrújula (ve-HÍ-cu-lo): la H no se pronuncia pero se escribe.', HMUDA, 'Transporte', 'high',
    ['veiculo', 'vehiculo'], ['vehículos'], 'Estacioné el vehículo en la esquina.', 'Sustantivo', ['inglés', 'italiano'],
    'H', 'H muda intercalada + tilde de esdrújula.',
    { level1: '¿Se oye la h, pero se escribe igual?', level2: 'H intercalada muda entre e-í; además es esdrújula (tilde).', level3: 'Se escribe "vehículo".' }, 'esdrújula'),
  w('w3-cohesion', 'cohesión', 'C1', 'spellings', 'h_intercalada', 3, ['co', 'he', 'sión'], 2,
    'H intercalada muda (co-he-SIÓN) y aguda en -n con tilde por el sufijo -sión.', HMUDA, 'Lingüística', 'medium',
    ['coesion', 'cohesion'], ['cohesión'], 'El texto gana cohesión con buenos conectores.', 'Sustantivo', ['inglés', 'francés'],
    'H', 'H muda intercalada + tilde de -sión.',
    { level1: '¿Hay una consonante muda entre las vocales?', level2: 'H intercalada muda; además -sión lleva tilde.', level3: 'Se escribe "cohesión".' }, 'aguda'),
  w('w3-exhaustivo', 'exhaustivo', 'C1', 'spellings', 'h_intercalada', 4, ['ex', 'haus', 'ti', 'vo'], 2,
    'Lleva H intercalada muda tras la x (ex-haus-TI-vo). Es llana terminada en vocal: sin tilde.', HMUDA, 'Academia', 'medium',
    ['exaustivo', 'exhaustibo'], ['exhausto'], 'Hizo un repaso exhaustivo del temario.', 'Adjetivo', ['inglés'],
    'H', 'H muda intercalada tras la x.',
    { level1: '¿Qué consonante muda esconde entre la x y la vocal?', level2: 'H intercalada muda; llana en vocal, sin tilde.', level3: 'Se escribe "exhaustivo".' }),
  w('w3-prohibir', 'prohibir', 'B2', 'spellings', 'h_intercalada', 3, ['pro', 'hi', 'bir'], 2,
    'H intercalada muda entre vocales (pro-hi-BIR) y con B; aguda en -r, sin tilde.', HMUDA, 'Normas', 'high',
    ['proivir', 'prohivir'], ['prohíbe'], 'Está terminantemente prohibido fumar acá.', 'Verbo', ['inglés', 'portugués'],
    'H', 'H muda intercalada + B.',
    { level1: '¿Se escribe una h aunque no se oiga?', level2: 'H intercalada muda entre o-i; además con B.', level3: 'Se escribe "prohibir".' }),

  /* ===== C1 · Grupo consonántico -x- vs -s- ===== */
  w('w3-contexto', 'contexto', 'B2', 'spellings', 'grupo_x', 3, ['con', 'tex', 'to'], 1,
    'Se escribe con X (con-TEX-to), no con S: el grupo -xt- es habitual en cultismos.', 'Grafía X', 'Lingüística', 'high',
    ['contesto'], ['contento', 'contesto'], 'Hay que leer la palabra en su contexto.', 'Sustantivo', ['inglés', 'portugués'],
    'X', 'Grupo -xt- con X.',
    { level1: '¿Suena /ks/ o /s/ en el grupo central?', level2: 'El grupo -xt- se escribe con X.', level3: 'Se escribe "contexto".' }),
  w('w3-exquisito', 'exquisito', 'C1', 'spellings', 'grupo_x', 4, ['ex', 'qui', 'si', 'to'], 2,
    'Se escribe con X inicial ante -qui (ex-qui-SI-to), aunque suene suave.', 'Grafía X', 'Gastronomía', 'medium',
    ['esquisito'], ['exquisitos'], 'El postre estaba exquisito.', 'Adjetivo', ['inglés', 'italiano'],
    'X', 'X ante -qui, aunque suene suave.',
    { level1: '¿La primera sílaba lleva x o s?', level2: 'Cultismo con X ante -qui.', level3: 'Se escribe "exquisito".' }),

  /* ===== C1 · Diéresis (gü) ===== */
  w('w3-bilingue', 'bilingüe', 'B2', 'spellings', 'dieresis', 3, ['bi', 'lin', 'güe'], 1,
    'Lleva diéresis sobre la u (bi-lin-GÜE) para que se pronuncie en el grupo güe.', DIERESIS, 'Idiomas', 'high',
    ['bilingue'], ['bilingües'], 'Es un colegio bilingüe español-inglés.', 'Adjetivo', ['inglés', 'francés'],
    'Ü', 'Diéresis: la u sí se pronuncia.',
    { level1: '¿Se oye la u en "güe"?', level2: 'Si la u suena en güe/güi, lleva diéresis.', level3: 'Se escribe "bilingüe".' }),
  w('w3-verguenza', 'vergüenza', 'B2', 'spellings', 'dieresis', 3, ['ver', 'güen', 'za'], 1,
    'Lleva diéresis sobre la u (ver-GÜEN-za): en güe la u se pronuncia.', DIERESIS, 'Emociones', 'high',
    ['verguenza', 'vergwenza'], ['vergüenzas'], 'Sintió vergüenza por el error.', 'Sustantivo', ['inglés', 'portugués'],
    'Ü', 'Diéresis en el grupo güe.',
    { level1: '¿Suena la u en "güen"?', level2: 'La u audible en güe/güi lleva diéresis.', level3: 'Se escribe "vergüenza".' }),

  /* ===== B2 · Tríadas verbo/sustantivo homógrafas ===== */
  w('w3-publico', 'público', 'B2', 'accentuation', 'triada', 3, ['pú', 'bli', 'co'], 0,
    'Tríada acentual: "público" (sustantivo/adjetivo, esdrújula con tilde) ≠ "publico" (yo publico, presente) ≠ "publicó" (él publicó, pretérito).', TRIADA, 'Medios', 'high',
    ['publico', 'publicó'], ['publico', 'publicó'], 'El público aplaudió de pie.', 'Sustantivo', ['inglés', 'francés'],
    'Ú', 'Esdrújula con tilde: distingue del verbo.',
    { level1: '¿Hablás del público, de "yo publico" o de "él publicó"?', level2: 'Sustantivo esdrújulo → tilde en la primera sílaba.', level3: 'El sustantivo se escribe "público".' }, 'esdrújula'),
  w('w3-practico', 'práctico', 'B2', 'accentuation', 'triada', 3, ['prác', 'ti', 'co'], 0,
    'Tríada acentual: "práctico" (adjetivo, esdrújula con tilde) ≠ "practico" (yo practico) ≠ "practicó" (él practicó).', TRIADA, 'Cualidades', 'high',
    ['practico', 'practicó'], ['practico', 'practicó'], 'Es un método muy práctico.', 'Adjetivo', ['inglés', 'italiano'],
    'Á', 'Esdrújula con tilde: distingue del verbo.',
    { level1: '¿Es el adjetivo o una forma del verbo practicar?', level2: 'Adjetivo esdrújulo → tilde.', level3: 'El adjetivo se escribe "práctico".' }, 'esdrújula'),

  /* ===== B2 · Adverbios en -mente ===== */
  w('w3-claramente', 'claramente', 'B2', 'morphology', 'adverbio-mente', 2, ['cla', 'ra', 'men', 'te'], 2,
    'El adverbio en -mente conserva la ortografía del adjetivo base: "claro" no lleva tilde, así que "claramente" tampoco.', 'Adverbio en -mente', 'Discurso', 'high',
    ['claramnete'], ['claro'], 'Explicó claramente el procedimiento.', 'Adverbio', ['inglés', 'portugués'],
    'E', 'Sin tilde: el adjetivo base tampoco la tiene.',
    { level1: '¿"Claro" lleva tilde? Entonces, ¿"claramente"?', level2: '-mente hereda la tilde solo si el adjetivo la tiene.', level3: 'Se escribe "claramente" (sin tilde).' }),
  w('w3-cortesmente', 'cortésmente', 'C1', 'morphology', 'adverbio-mente', 3, ['cor', 'tés', 'men', 'te'], 1,
    'El adverbio en -mente conserva la tilde del adjetivo base: "cortés" la lleva, así que "cortésmente" también.', 'Adverbio en -mente', 'Discurso', 'medium',
    ['cortesmente'], ['cortés'], 'Respondió cortésmente a la crítica.', 'Adverbio', ['inglés', 'francés'],
    'É', 'Mantiene la tilde del adjetivo "cortés".',
    { level1: '¿"Cortés" lleva tilde? Entonces, ¿"cortésmente"?', level2: '-mente conserva la tilde del adjetivo base.', level3: 'Se escribe "cortésmente".' }, 'esdrújula'),

  /* ===== B2 · Prefijación culta ===== */
  w('w3-subrayar', 'subrayar', 'B2', 'spellings', 'prefijo', 3, ['sub', 'ra', 'yar'], 2,
    'El prefijo "sub-" se mantiene intacto ante "rayar": se escribe con B (sub-ra-YAR), no "surrayar".', 'Prefijación (sub-)', 'Estudio', 'medium',
    ['surrayar', 'subrallar'], ['subraya'], 'Conviene subrayar las ideas clave.', 'Verbo', ['inglés'],
    'B', 'El prefijo sub- conserva la B.',
    { level1: '¿Qué prefijo se une a "rayar"?', level2: 'sub- + rayar; la b del prefijo se mantiene.', level3: 'Se escribe "subrayar".' }),

  /* ===== C2 · Homófonos cultos ===== */
  w('w3-haber', 'haber', 'C2', 'spellings', 'homofono', 3, ['ha', 'ber'], 1,
    'Homófono: "haber" (verbo auxiliar, con H y B) ≠ "a ver" (preposición + verbo ver). "Va a haber problemas" vs. "Vamos a ver".', 'Homófono h/b', 'Gramática', 'high',
    ['aver', 'haver'], ['a ver'], 'Va a haber una reunión mañana.', 'Verbo auxiliar', ['inglés', 'portugués'],
    'H', 'Verbo con H y B; no confundir con "a ver".',
    { level1: '¿Es el verbo auxiliar o "a ver" (mirar)?', level2: 'Auxiliar → una palabra con H y B: haber.', level3: 'El verbo se escribe "haber".' }),
  w('w3-rebelar', 'rebelar', 'C2', 'spellings', 'homofono', 3, ['re', 'be', 'lar'], 2,
    'Homófono: "rebelar(se)" (sublevarse, con B) ≠ "revelar" (descubrir o revelar una foto, con V).', 'Homófono b/v', 'Gramática', 'medium',
    ['rrebelar'], ['revelar'], 'El pueblo decidió rebelarse contra el abuso.', 'Verbo', ['inglés', 'italiano'],
    'B', 'Sublevarse se escribe con B (rebelar).',
    { level1: '¿Sublevarse o descubrir algo?', level2: 'Sublevarse → con B (rebelar); descubrir → con V (revelar).', level3: 'Sublevarse se escribe "rebelar".' }),
  w('w3-halla', 'halla', 'C2', 'spellings', 'homofono', 3, ['ha', 'lla'], 0,
    'Homófono: "halla" (del verbo hallar = encontrar, con H y LL) ≠ "haya" (verbo haber / árbol, con Y) ≠ "aya" (niñera).', 'Homófono ll/y', 'Gramática', 'low',
    ['haya', 'aya'], ['haya', 'aya'], 'Quien busca, a veces halla lo que no esperaba.', 'Verbo (hallar)', ['inglés', 'francés'],
    'H', 'Encontrar → hallar → "halla" con H y LL.',
    { level1: '¿Es del verbo hallar, del verbo haber o "aya" (niñera)?', level2: 'Encontrar → hallar → "halla" (H + LL).', level3: 'Del verbo hallar se escribe "halla".' }),
];
