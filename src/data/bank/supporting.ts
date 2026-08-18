import {
  MinimalContrastSet,
  StructuredInputExercise,
  DictationItem,
  EscapeScenario,
  Level,
} from '../../types';
// Interfaces definidas (por historia del proyecto) en orthographyBank.ts.
// Se importan SOLO como tipos → se borran en compilación, sin ciclo en runtime.
import type { DiscoverySet, WordFamilyItem, DiagnosticQuestion } from '../orthographyBank';

/* =========================================================
 * CONTRASTES MÍNIMOS (§11/§22/§23) — tilde diacrítica,
 * interrogativos y tríadas verbo/sustantivo.
 * ========================================================= */
export const EXTRA_CONTRASTS: MinimalContrastSet[] = [
  {
    id: 'mc-mi-mi', title: 'mi / mí', level: 'A2', category: 'accentuation', subcategory: 'diacritica',
    forms: [
      { word: 'mi', accentType: 'átona', grammaticalFunction: 'posesivo', meaningContext: 'Posesión (mi libro).', exampleSentence: 'Este es mi teléfono.' },
      { word: 'mí', accentType: 'tónica', grammaticalFunction: 'pronombre tras preposición', meaningContext: 'Objeto tras preposición (para mí).', exampleSentence: 'Ese regalo es para mí.' },
    ],
    discoveryQuestion: '¿Cuál va delante de un sustantivo y cuál después de una preposición?',
    targetFocus: 'Tilde diacrítica en monosílabos',
  },
  {
    id: 'mc-se-se', title: 'se / sé', level: 'B1', category: 'accentuation', subcategory: 'diacritica',
    forms: [
      { word: 'se', accentType: 'átona', grammaticalFunction: 'pronombre', meaningContext: 'Pronombre reflexivo/impersonal (se lava).', exampleSentence: 'Se despertó temprano.' },
      { word: 'sé', accentType: 'tónica', grammaticalFunction: 'verbo (saber/ser)', meaningContext: 'Forma verbal: yo sé / sé bueno.', exampleSentence: 'No sé qué decir.' },
    ],
    discoveryQuestion: '¿Cuál es pronombre y cuál es forma del verbo saber o ser?',
    targetFocus: 'Tilde diacrítica en monosílabos',
  },
  {
    id: 'mc-de-de', title: 'de / dé', level: 'B1', category: 'accentuation', subcategory: 'diacritica',
    forms: [
      { word: 'de', accentType: 'átona', grammaticalFunction: 'preposición', meaningContext: 'Relación/posesión (casa de piedra).', exampleSentence: 'Es la casa de mi abuela.' },
      { word: 'dé', accentType: 'tónica', grammaticalFunction: 'verbo dar (subjuntivo)', meaningContext: 'Forma del verbo dar (que le dé).', exampleSentence: 'Espero que te dé el permiso.' },
    ],
    discoveryQuestion: '¿Cuál une palabras y cuál es forma del verbo dar?',
    targetFocus: 'Tilde diacrítica en monosílabos',
  },
  {
    id: 'mc-mas-mas', title: 'mas / más', level: 'B2', category: 'accentuation', subcategory: 'diacritica',
    forms: [
      { word: 'mas', accentType: 'átona', grammaticalFunction: 'conjunción (= pero)', meaningContext: 'Equivale a "pero" (culto).', exampleSentence: 'Lo intentó, mas no lo logró.' },
      { word: 'más', accentType: 'tónica', grammaticalFunction: 'adverbio de cantidad', meaningContext: 'Cantidad/comparación (más pan).', exampleSentence: 'Quiero más tiempo.' },
    ],
    discoveryQuestion: '¿Cuál se puede reemplazar por "pero" y cuál indica cantidad?',
    targetFocus: 'Tilde diacrítica en monosílabos',
  },
  {
    id: 'mc-que-que', title: 'qué / que', level: 'B1', category: 'accentuation', subcategory: 'interrogativos',
    forms: [
      { word: 'qué', accentType: 'tónica', grammaticalFunction: 'interrogativo/exclamativo', meaningContext: 'Introduce pregunta o exclamación (¿qué?).', exampleSentence: '¿Qué querés comer?' },
      { word: 'que', accentType: 'átona', grammaticalFunction: 'relativo/conjunción', meaningContext: 'Enlace relativo o conjunción (el libro que leí).', exampleSentence: 'El libro que leí era largo.' },
    ],
    discoveryQuestion: '¿Cuál introduce una pregunta o exclamación y cuál enlaza oraciones?',
    targetFocus: 'Tilde en interrogativos y exclamativos',
  },
  {
    id: 'mc-como-como', title: 'cómo / como', level: 'B1', category: 'accentuation', subcategory: 'interrogativos',
    forms: [
      { word: 'cómo', accentType: 'tónica', grammaticalFunction: 'interrogativo', meaningContext: 'Pregunta por el modo (¿cómo?).', exampleSentence: 'No sé cómo funciona.' },
      { word: 'como', accentType: 'átona', grammaticalFunction: 'comparativo/conjunción', meaningContext: 'Comparación o causa (blanco como la nieve).', exampleSentence: 'Es blanco como la nieve.' },
    ],
    discoveryQuestion: '¿Cuál pregunta por el modo y cuál compara?',
    targetFocus: 'Tilde en interrogativos indirectos',
  },
  {
    id: 'mc-donde-donde-b', title: 'dónde / donde', level: 'B1', category: 'accentuation', subcategory: 'interrogativos',
    forms: [
      { word: 'dónde', accentType: 'tónica', grammaticalFunction: 'interrogativo de lugar', meaningContext: 'Pregunta por el lugar (¿dónde?).', exampleSentence: 'No sé dónde vive.' },
      { word: 'donde', accentType: 'átona', grammaticalFunction: 'relativo de lugar', meaningContext: 'Introduce lugar conocido (la casa donde vivo).', exampleSentence: 'La casa donde vivo es azul.' },
    ],
    discoveryQuestion: '¿Cuál pregunta por el lugar y cuál lo señala como ya conocido?',
    targetFocus: 'Tilde en interrogativos indirectos',
  },
  {
    id: 'mc-publico', title: 'público / publico / publicó', level: 'B2', category: 'accentuation', subcategory: 'triada_verbal',
    forms: [
      { word: 'público', accentType: 'esdrújula', grammaticalFunction: 'sustantivo/adjetivo', meaningContext: 'La gente o lo relativo al Estado.', exampleSentence: 'El público aplaudió de pie.' },
      { word: 'publico', accentType: 'llana', grammaticalFunction: 'verbo presente (yo)', meaningContext: 'Yo publico algo ahora.', exampleSentence: 'Cada semana publico un artículo.' },
      { word: 'publicó', accentType: 'aguda', grammaticalFunction: 'verbo pretérito (él/ella)', meaningContext: 'Él/ella publicó (pasado).', exampleSentence: 'La revista publicó la noticia ayer.' },
    ],
    discoveryQuestion: '¿Cuál es el sustantivo, cuál el presente y cuál el pasado? Fijate en la tilde.',
    targetFocus: 'Contraste esdrújula/llana/aguda por función',
  },
  {
    id: 'mc-practico', title: 'práctico / practico / practicó', level: 'B2', category: 'accentuation', subcategory: 'triada_verbal',
    forms: [
      { word: 'práctico', accentType: 'esdrújula', grammaticalFunction: 'adjetivo', meaningContext: 'Útil, funcional.', exampleSentence: 'Es un método muy práctico.' },
      { word: 'practico', accentType: 'llana', grammaticalFunction: 'verbo presente (yo)', meaningContext: 'Yo practico un deporte.', exampleSentence: 'Todos los días practico natación.' },
      { word: 'practicó', accentType: 'aguda', grammaticalFunction: 'verbo pretérito (él/ella)', meaningContext: 'Él/ella practicó (pasado).', exampleSentence: 'Ayer practicó durante horas.' },
    ],
    discoveryQuestion: '¿Qué cambia la posición de la tilde en el significado y la función?',
    targetFocus: 'Contraste esdrújula/llana/aguda por función',
  },
  {
    id: 'mc-deposito', title: 'depósito / deposito / depositó', level: 'B2', category: 'accentuation', subcategory: 'triada_verbal',
    forms: [
      { word: 'depósito', accentType: 'esdrújula', grammaticalFunction: 'sustantivo', meaningContext: 'Lugar o acción de depositar.', exampleSentence: 'Guardó las cajas en el depósito.' },
      { word: 'deposito', accentType: 'llana', grammaticalFunction: 'verbo presente (yo)', meaningContext: 'Yo deposito dinero.', exampleSentence: 'Cada mes deposito mis ahorros.' },
      { word: 'depositó', accentType: 'aguda', grammaticalFunction: 'verbo pretérito (él/ella)', meaningContext: 'Él/ella depositó (pasado).', exampleSentence: 'El cliente depositó el cheque.' },
    ],
    discoveryQuestion: '¿Cuál nombra la cosa y cuáles son acciones en distinto tiempo?',
    targetFocus: 'Contraste esdrújula/llana/aguda por función',
  },
  {
    id: 'mc-mas-mas-b', title: 'aun / aún', level: 'B2', category: 'accentuation', subcategory: 'diacritica',
    forms: [
      { word: 'aun', accentType: 'átona', grammaticalFunction: 'conjunción (= incluso)', meaningContext: 'Equivale a "incluso/hasta" (aun así).', exampleSentence: 'Aun sin dinero, viajó.' },
      { word: 'aún', accentType: 'tónica', grammaticalFunction: 'adverbio (= todavía)', meaningContext: 'Equivale a "todavía".', exampleSentence: 'Aún no terminé el trabajo.' },
    ],
    discoveryQuestion: '¿Cuál se puede reemplazar por "todavía" y cuál por "incluso"?',
    targetFocus: 'Tilde diacrítica: aun / aún',
  },
];

/* =========================================================
 * INPUT ESTRUCTURADO (§12) — procesar la ortografía para interpretar.
 * ========================================================= */
export const EXTRA_STRUCTURED_INPUT: StructuredInputExercise[] = [
  {
    id: 'si-publico', level: 'B2', category: 'accentuation',
    sentences: [
      { sentence: 'El público disfrutó el concierto.', highlightWord: 'público', isCorrectMeaning: true },
      { sentence: 'Yo publico mis textos en un blog.', highlightWord: 'publico', isCorrectMeaning: false },
      { sentence: 'La editorial publicó el libro en marzo.', highlightWord: 'publicó', isCorrectMeaning: false },
    ],
    comprehensionQuestion: '¿En cuál "público" se refiere a la gente que asiste a un evento?',
    correctIndex: 0,
    explanation: 'La tilde en la esdrújula "público" marca el sustantivo; sin ella o con tilde final son formas verbales.',
    cognitiveReflection: 'La posición de la tilde cambia por completo la función gramatical de la palabra.',
  },
  {
    id: 'si-tu', level: 'A2', category: 'accentuation',
    sentences: [
      { sentence: 'Tú siempre llegás puntual.', highlightWord: 'Tú', isCorrectMeaning: true },
      { sentence: 'Olvidaste tu paraguas.', highlightWord: 'tu', isCorrectMeaning: false },
    ],
    comprehensionQuestion: '¿En cuál "tú/tu" se habla directamente a la persona?',
    correctIndex: 0,
    explanation: '"Tú" con tilde es el pronombre (la persona); "tu" sin tilde indica posesión.',
    cognitiveReflection: 'La tilde diacrítica distingue palabras que suenan igual pero cumplen funciones distintas.',
  },
  {
    id: 'si-donde', level: 'B1', category: 'accentuation',
    sentences: [
      { sentence: 'No sé dónde dejé las llaves.', highlightWord: 'dónde', isCorrectMeaning: true },
      { sentence: 'Ese es el bar donde nos conocimos.', highlightWord: 'donde', isCorrectMeaning: false },
    ],
    comprehensionQuestion: '¿En cuál se plantea una pregunta (aunque sea indirecta)?',
    correctIndex: 0,
    explanation: '"Dónde" con tilde introduce una interrogación indirecta; "donde" sin tilde señala un lugar ya conocido.',
    cognitiveReflection: 'El valor interrogativo, aunque esté dentro de otra oración, exige tilde.',
  },
];

/* =========================================================
 * DESCUBRIMIENTO (§20) — clasificar antes de recibir la regla.
 * ========================================================= */
export const EXTRA_DISCOVERY: DiscoverySet[] = [
  {
    id: 'disc-agudas-tilde', title: 'Descubrimiento: ¿cuándo la aguda lleva tilde?', level: 'A2',
    groupA: [
      { word: 'canción', stressedIndex: 1, endsWith: 'n' },
      { word: 'café', stressedIndex: 1, endsWith: 'é' },
      { word: 'compás', stressedIndex: 1, endsWith: 's' },
    ],
    groupB: [
      { word: 'reloj', stressedIndex: 1, endsWith: 'j' },
      { word: 'pared', stressedIndex: 1, endsWith: 'd' },
      { word: 'feliz', stressedIndex: 1, endsWith: 'z' },
    ],
    promptQuestion: 'Todas son agudas. ¿Por qué solo las del grupo A llevan tilde?',
    classificationQuestion: '¿En qué letra termina cada palabra de cada grupo?',
    discoveredRule: 'Las agudas llevan tilde solo cuando terminan en n, s o vocal (grupo A). Si terminan en otra consonante (grupo B), no la llevan.',
    targetCategory: 'accentuation',
  },
];

/* =========================================================
 * FAMILIAS DE PALABRAS (§16/§17) — representación morfológica.
 * ========================================================= */
export const EXTRA_FAMILIES: WordFamilyItem[] = [
  {
    root: 'hac', category: 'spellings', level: 'B1',
    coreRule: 'La familia de "hacer" conserva la H en todos sus derivados.',
    baseWord: 'hacer',
    family: [
      { word: 'hacer', suffixOrPrefix: '(base)', partOfSpeech: 'verbo', meaning: 'realizar', criticalLetter: 'H' },
      { word: 'deshacer', suffixOrPrefix: 'des-', partOfSpeech: 'verbo', meaning: 'anular lo hecho', criticalLetter: 'H' },
      { word: 'hecho', suffixOrPrefix: '(participio)', partOfSpeech: 'sustantivo/participio', meaning: 'suceso / realizado', criticalLetter: 'H' },
      { word: 'quehacer', suffixOrPrefix: 'que-', partOfSpeech: 'sustantivo', meaning: 'tarea', criticalLetter: 'H' },
    ],
    discoveryQuestion: '¿Qué letra se mantiene en toda la familia aunque no se pronuncie?',
    reconstruction: {
      instruction: 'Formá el verbo que significa "anular lo hecho" a partir de "hacer" con el prefijo des-.',
      answer: 'deshacer',
      successNote: 'La raíz conserva la H: des + hacer = deshacer.',
      hint: 'Prefijo des- + la raíz completa (con su H).',
    },
  },
  {
    root: 'nacion', category: 'morphology', level: 'B1',
    coreRule: 'La familia de "nación" mantiene la C del sufijo -ción en sus derivados.',
    baseWord: 'nación',
    family: [
      { word: 'nación', suffixOrPrefix: '-ción', partOfSpeech: 'sustantivo', meaning: 'país/pueblo', criticalLetter: 'C' },
      { word: 'nacional', suffixOrPrefix: '-al', partOfSpeech: 'adjetivo', meaning: 'de la nación', criticalLetter: 'C' },
      { word: 'nacionalidad', suffixOrPrefix: '-idad', partOfSpeech: 'sustantivo', meaning: 'condición nacional', criticalLetter: 'C' },
      { word: 'internacional', suffixOrPrefix: 'inter-', partOfSpeech: 'adjetivo', meaning: 'entre naciones', criticalLetter: 'C' },
    ],
    discoveryQuestion: '¿Qué letra se repite en toda la familia y desaparece la tilde al derivar?',
    reconstruction: {
      instruction: 'Formá el sustantivo abstracto "condición de pertenecer a una nación".',
      answer: 'nacionalidad',
      successNote: 'nación → nacional → nacionalidad: la C se mantiene, la tilde se pierde al alargar la palabra.',
      hint: 'nacional + sufijo -idad.',
    },
  },
];

/* =========================================================
 * DICTADOS (§26/§27) — transcodificación audio→texto.
 * ========================================================= */
export const EXTRA_DICTATIONS: DictationItem[] = [
  { id: 'dict-x1', level: 'A1', text: 'Hola, ¿cómo estás?', audioPacing: 'slow', focusCategory: 'punctuation', difficulty: 1, hints: ['Recordá los signos de apertura ¿ ¡', 'La tilde de "cómo" y "estás"'], contextTopic: 'Saludos' },
  { id: 'dict-x2', level: 'A2', text: 'El sábado fuimos al cine con mis amigos.', audioPacing: 'normal', focusCategory: 'accentuation', difficulty: 2, hints: ['"sábado" es esdrújula', 'El día va en minúscula'], contextTopic: 'Ocio' },
  { id: 'dict-x3', level: 'B1', text: 'No sé si mañana habrá clase; te aviso más tarde.', audioPacing: 'normal', focusCategory: 'accentuation', difficulty: 3, hints: ['"sé" con tilde diacrítica', '"habrá" aguda con tilde', 'Punto y coma entre las ideas'], contextTopic: 'Organización' },
  { id: 'dict-x4', level: 'B2', text: 'La decisión fue difícil, sin embargo, la tomamos juntos.', audioPacing: 'normal', focusCategory: 'punctuation', difficulty: 3, hints: ['"decisión" con S y tilde', '"difícil" llana con tilde', 'Comas alrededor de "sin embargo"'], contextTopic: 'Trabajo en equipo' },
  { id: 'dict-x5', level: 'C1', text: 'Aunque el análisis parecía exhaustivo, el régimen de datos exigía mayor precisión.', audioPacing: 'normal', focusCategory: 'accentuation', difficulty: 4, hints: ['"análisis" y "régimen" son esdrújulas', '"exhaustivo" con H intercalada y X'], contextTopic: 'Ciencia' },
  { id: 'dict-x6', level: 'A2', text: 'Mi hermano vive en México y estudia inglés.', audioPacing: 'slow', focusCategory: 'capitals', difficulty: 2, hints: ['"México" con mayúscula y tilde', 'El idioma "inglés" en minúscula'], contextTopic: 'Familia' },
];

/* =========================================================
 * DIAGNÓSTICO (§7) — cada correctAnswer está entre las options.
 * ========================================================= */
export const EXTRA_DIAGNOSTIC: DiagnosticQuestion[] = [
  {
    id: 'diag-x1', category: 'accentuation', subcategory: 'esdrujula', level: 'A2', type: 'spot_error',
    prompt: 'Elegí la forma correcta:', options: ['medico', 'médico', 'medicó'], correctAnswer: 'médico',
    explanation: 'Como sustantivo (profesional de la salud) es esdrújula y lleva tilde.',
    l1CommonInterference: ['inglés', 'francés'],
  },
  {
    id: 'diag-x2', category: 'spellings', subcategory: 'b_v', level: 'A2', type: 'spot_error',
    prompt: 'Elegí la forma correcta del pretérito de "estar":', options: ['estubo', 'estuvo', 'estubó'], correctAnswer: 'estuvo',
    explanation: 'El pretérito de "estar" se escribe con V: estuvo (familia estuve, estuviste).',
    l1CommonInterference: ['inglés', 'portugués'],
  },
  {
    id: 'diag-x3', category: 'accentuation', subcategory: 'diacritica', level: 'B1', type: 'contrast',
    prompt: '"No ___ la respuesta." ¿Qué forma corresponde?', options: ['se', 'sé'], correctAnswer: 'sé',
    explanation: '"Sé" (verbo saber) lleva tilde diacrítica; "se" es pronombre.',
  },
  {
    id: 'diag-x4', category: 'morphology', subcategory: 'sufijos_cion_sion', level: 'B1', type: 'fill_gap',
    prompt: 'Completá: "Tomaron una ___ importante."', options: ['decisión', 'decisión'], correctAnswer: 'decisión',
    sentenceContext: 'Deriva de "decidir": se escribe con S y lleva tilde.',
    explanation: '"Decisión" va con S (familia decidir) y con tilde por aguda en -n.',
  },
  {
    id: 'diag-x5', category: 'punctuation', subcategory: 'conectores', level: 'B2', type: 'punctuation_intent',
    prompt: '¿Cuál está bien puntuada?', options: ['Estudió mucho por lo tanto aprobó.', 'Estudió mucho; por lo tanto, aprobó.'], correctAnswer: 'Estudió mucho; por lo tanto, aprobó.',
    explanation: 'El conector consecutivo "por lo tanto" se aísla con comas y suele ir tras punto y coma.',
  },
  {
    id: 'diag-x6', category: 'capitals', subcategory: 'dias_idiomas', level: 'A2', type: 'spot_error',
    prompt: '¿Cuál es correcta?', options: ['Estudio Inglés los Lunes.', 'Estudio inglés los lunes.'], correctAnswer: 'Estudio inglés los lunes.',
    explanation: 'En español los idiomas y los días de la semana se escriben en minúscula.',
    l1CommonInterference: ['inglés', 'alemán'],
  },
];

/* =========================================================
 * ESCAPE ORTO (§38) — experiencia narrativa minimalista.
 * ========================================================= */
export const EXTRA_ESCAPE: EscapeScenario[] = [
  {
    id: 'esc-x1', codeName: 'ARCHIVO DIACRÍTICO', title: 'El expediente sin tildes',
    description: 'Un documento perdió todas sus tildes diacríticas. Restaurá el sentido para abrir la caja fuerte.',
    difficulty: 'Intermedio (B1-B2)',
    stages: [
      {
        stageNumber: 1, stageTitle: 'Identificar el intruso', briefing: 'Cuatro monosílabos, uno mal acentuado.',
        instruction: 'Marcá la forma que necesita tilde en este contexto: "Espero que él me ___ una respuesta".',
        encryptedSnippet: 'de / dé', interactiveType: 'select_multiple',
        options: ['de', 'dé'], correctAnswers: ['dé'], clueUnlockCode: 'D-01',
        socraticHint: '¿Es la preposición o una forma del verbo dar?',
      },
      {
        stageNumber: 2, stageTitle: 'Descifrar la clave', briefing: 'Ordená la interrogación indirecta.',
        instruction: 'Elegí la forma correcta: "No sé ___ vive." (lugar).',
        encryptedSnippet: 'donde / dónde', interactiveType: 'decode_contrast',
        options: ['donde', 'dónde'], correctAnswers: ['dónde'], clueUnlockCode: 'D-02',
        socraticHint: 'Aunque no haya signos de pregunta, ¿hay valor interrogativo?',
      },
      {
        stageNumber: 3, stageTitle: 'Clave final', briefing: 'Escribí la palabra que abre la caja.',
        instruction: 'Escribí correctamente el verbo saber en 1ª persona: "yo ___".',
        encryptedSnippet: '_ _', interactiveType: 'type_correct_key',
        correctAnswers: ['sé'], clueUnlockCode: 'ABIERTO',
        socraticHint: 'Lleva tilde diacrítica para distinguirse del pronombre "se".',
      },
    ],
  },
];

/* =========================================================
 * ESCRITURA LIBRE (§28) — prompts extra por nivel.
 * ========================================================= */
export const EXTRA_WRITING_PROMPTS: { level: Level; title: string; prompt: string; targetFocus: string }[] = [
  { level: 'A1', title: 'Mi rutina diaria', prompt: 'Escribí tres frases sobre lo que hacés cada día. Usá verbos como "me levanto", "estudio", "como".', targetFocus: 'Mayúscula inicial, punto final, tildes en formas verbales frecuentes.' },
  { level: 'A2', title: 'Una foto especial', prompt: 'Describí una foto importante para vos: quién aparece, dónde y cuándo fue.', targetFocus: 'Interrogativos con tilde (quién, dónde, cuándo), acentuación de pretéritos.' },
  { level: 'B1', title: 'Recomendación de un lugar', prompt: 'Recomendá un lugar de tu ciudad y explicá por qué vale la pena visitarlo.', targetFocus: 'Puntuación de causa/consecuencia, mayúsculas de topónimos, tilde diacrítica.' },
  { level: 'B2', title: 'Carta formal de reclamo', prompt: 'Redactá una carta formal reclamando por un servicio. Cuidá el tono y la estructura.', targetFocus: 'Dos puntos del saludo, comas de vocativo e inciso, mayúsculas institucionales.' },
  { level: 'C1', title: 'Reseña crítica', prompt: 'Escribí una reseña crítica de una película o libro reciente, con argumentos y matices.', targetFocus: 'Punto y coma, incisos, títulos de obras, precisión léxica.' },
];
