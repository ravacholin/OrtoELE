import { OrthoWordItem, MinimalContrastSet, StructuredInputExercise, DictationItem, Level, OrthoCategory, L1Language, EscapeScenario, EscapeRoomStage } from '../types';
import { EXTRA_WORDS } from './bank/words';
import { EXTRA_WORDS_2 } from './bank/words2';
import { EXTRA_WORDS_3 } from './bank/words3';
import {
  EXTRA_CONTRASTS,
  EXTRA_STRUCTURED_INPUT,
  EXTRA_DISCOVERY,
  EXTRA_FAMILIES,
  EXTRA_DICTATIONS,
  EXTRA_DIAGNOSTIC,
  EXTRA_ESCAPE,
  EXTRA_WRITING_PROMPTS,
} from './bank/supporting';

// Re-exportados desde módulos dedicados (§24 Puntuación, §25 Mayúsculas).
export { PUNCTUATION_EXERCISES } from './bank/punctuation';
export { CAPITALS_EXERCISES } from './bank/capitals';

export interface WordFamilyItem {
  root: string;
  category: OrthoCategory;
  level: Level;
  coreRule: string;
  baseWord: string;
  family: {
    word: string;
    suffixOrPrefix: string;
    partOfSpeech: string;
    meaning: string;
    criticalLetter: string;
  }[];
  discoveryQuestion: string;
  // Tarea de reconstrucción morfológica (data-driven, específica de la raíz)
  reconstruction: {
    instruction: string;
    answer: string;
    successNote: string;
    hint: string;
  };
}

export interface DiscoverySet {
  id: string;
  title: string;
  level: Level;
  groupA: { word: string; stressedIndex: number; endsWith: string }[];
  groupB: { word: string; stressedIndex: number; endsWith: string }[];
  promptQuestion: string;
  classificationQuestion: string;
  discoveredRule: string;
  targetCategory: string;
}

export interface DiagnosticQuestion {
  id: string;
  category: OrthoCategory;
  subcategory: string;
  level: Level;
  type: 'spot_error' | 'contrast' | 'fill_gap' | 'syllable_stress' | 'punctuation_intent';
  prompt: string;
  sentenceContext?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  l1CommonInterference?: L1Language[];
}

// EscapeScenario y EscapeRoomStage viven ahora en ../types (fuente única).
// Se re-exportan para no romper consumidores que los importaban desde aquí.
export type { EscapeScenario, EscapeRoomStage } from '../types';

// 1. Core Orthographic Word Bank (Cognitive Model)
export const ORTHOGRAPHY_WORD_BANK: OrthoWordItem[] = [
  ...EXTRA_WORDS,
  ...EXTRA_WORDS_2,
  ...EXTRA_WORDS_3,
  {
    id: 'w-medico',
    word: 'médico',
    level: 'A2',
    category: 'accentuation',
    subcategory: 'esdrujula',
    difficulty: 2,
    phonology: "/'me.ði.ko/",
    syllables: ['mé', 'di', 'co'],
    stressedSyllable: 0,
    rule: 'Palabra esdrújula: el acento recae en la antepenúltima sílaba y siempre lleva tilde.',
    ruleCategoryName: 'Acentuación esdrújula',
    semanticField: 'Salud y profesiones',
    frequency: 'high',
    commonErrors: ['medico', 'medicó'],
    confusableWith: ['medico', 'medicó'],
    examples: [
      { sentence: 'El médico me recetó descanso.', role: 'Sustantivo (profesional de la salud)' },
      { sentence: 'Yo medico a mis pacientes con prudencia.', role: 'Verbo presente (yo medico)' },
      { sentence: 'Ayer el doctor medicó al paciente.', role: 'Verbo pretérito (él medicó)' }
    ],
    l1Risk: ['inglés', 'francés', 'italiano'],
    visualAnchor: {
      letterToHighlight: 'É',
      description: 'La fuerza de voz está en la primera sílaba [MÉ]. La tilde señala la voz que desciende.',
      soundClue: 'Golpe de voz inicial: MÉ-di-co'
    },
    socraticClues: {
      level1: 'Pronunciá la palabra en voz alta. ¿Dónde cae el golpe de voz principal?',
      level2: 'Contá las sílabas desde el final: última (co), penúltima (di), antepenúltima (mé). ¿Qué regla cumplen las esdrújulas?',
      level3: 'Las palabras esdrújulas siempre llevan tilde en la antepenúltima sílaba: "médico".'
    }
  },
  {
    id: 'w-hervir',
    word: 'hervir',
    level: 'A2',
    category: 'spellings',
    subcategory: 'h_b_v',
    difficulty: 2,
    phonology: "/eɾ'biɾ/",
    syllables: ['her', 'vir'],
    stressedSyllable: 1,
    rule: 'Lleva H inicial muda y terminación en -VIR (como servir y vivir, excepciones a verbos en -bir).',
    ruleCategoryName: 'Grafía H / V',
    semanticField: 'Cocina y procesos',
    frequency: 'high',
    commonErrors: ['ervir', 'herbir', 'erbir'],
    confusableWith: ['servir', 'vivir', 'haber'],
    examples: [
      { sentence: 'Hay que hervir el agua antes de tomarla.', role: 'Infinitivo' },
      { sentence: 'El agua está hirviendo en la olla.', role: 'Gerundio con cambio vocálico' }
    ],
    l1Risk: ['francés', 'italiano', 'portugués', 'inglés'],
    visualAnchor: {
      letterToHighlight: 'H...V',
      description: 'Doble ancla: H inicial muda y V central en la terminación -vir.',
      soundClue: 'H muda + terminación -vir como "vivir"'
    },
    socraticClues: {
      level1: 'Pensá en cómo empieza este verbo y en qué letra finaliza su raíz.',
      level2: 'La mayoría de los verbos terminan en -bir (escribir, recibir), pero hervir, servir y vivir son las 3 excepciones con V.',
      level3: 'Se escribe con H inicial y con V: "hervir".'
    }
  },
  {
    id: 'w-habia',
    word: 'había',
    level: 'A1',
    category: 'accentuation',
    subcategory: 'hiato',
    difficulty: 2,
    phonology: "/a'bi.a/",
    syllables: ['ha', 'bí', 'a'],
    stressedSyllable: 1,
    rule: 'Hiato acentual: vocal cerrada tónica (í) junto a vocal abierta átona (a) siempre lleva tilde para romper el diptongo.',
    ruleCategoryName: 'Hiato acentual',
    semanticField: 'Existencia y tiempo',
    frequency: 'high',
    commonErrors: ['habia', 'avia', 'abia'],
    confusableWith: ['hacia', 'hacía'],
    examples: [
      { sentence: 'Había mucha gente en el museo.', role: 'Imperfecto impersonal' },
      { sentence: 'Yo ya había terminado la tarea.', role: 'Pluscuamperfecto auxiliar' }
    ],
    l1Risk: ['inglés', 'francés', 'portugués', 'chino'],
    visualAnchor: {
      letterToHighlight: 'H...Í',
      description: 'H del verbo haber + tilde en la Í para separar las sílabas ha-BÍ-a.',
      soundClue: 'Tres sílabas sonoras: ha - BÍ - a'
    },
    socraticClues: {
      level1: '¿Cuántas sílabas escuchás al decir "ha-bí-a"? ¿La I suena fuerte o débil?',
      level2: 'Cuando la vocal débil (i, u) suena con fuerza junto a una vocal fuerte (a, e, o), se produce un hiato que exige tilde.',
      level3: 'Proviene del verbo haber (con H) y lleva tilde en la I para romper el diptongo: "había".'
    }
  },
  {
    id: 'w-pais',
    word: 'país',
    level: 'A1',
    category: 'accentuation',
    subcategory: 'hiato',
    difficulty: 2,
    phonology: "/pa'is/",
    syllables: ['pa', 'ís'],
    stressedSyllable: 1,
    rule: 'Hiato de vocal abierta + vocal cerrada tónica: pa-ÍS. Lleva tilde obligatoria.',
    ruleCategoryName: 'Hiato de vocal débil',
    semanticField: 'Geografía y sociedad',
    frequency: 'high',
    commonErrors: ['pais'],
    confusableWith: ['paisaje', 'paises'],
    examples: [
      { sentence: 'Argentina es un país con diversos climas.', role: 'Sustantivo singular' },
      { sentence: 'En mi país hablamos dos idiomas.', role: 'Sustantivo' }
    ],
    l1Risk: ['francés', 'inglés', 'italiano'],
    visualAnchor: {
      letterToHighlight: 'Í',
      description: 'La tilde en la Í separa el sonido en dos tiempos: pa-ÍS.',
      soundClue: 'No es un monosílabo "pais", son dos sílabas: pa - ÍS'
    },
    socraticClues: {
      level1: 'Al pronunciar, ¿decís todo en un solo golpe o separás pa-ís?',
      level2: 'La fuerza de voz recae en la vocal débil I, lo que rompe la unión natural con la A.',
      level3: 'Lleva tilde en la I: "país". En plural mantiene la tilde: "países".'
    }
  },
  {
    id: 'w-rapidamente',
    word: 'rápidamente',
    level: 'B1',
    category: 'morphology',
    subcategory: 'sufijos_mente',
    difficulty: 3,
    phonology: "/'ra.pi.ða.men.te/",
    syllables: ['rá', 'pi', 'da', 'men', 'te'],
    stressedSyllable: 0,
    rule: 'Adverbio en -mente: conserva exactamente la tilde del adjetivo base original (rápido -> rápidamente).',
    ruleCategoryName: 'Acentuación de compuestos en -mente',
    semanticField: 'Velocidad y modo',
    frequency: 'high',
    commonErrors: ['rapidamente'],
    confusableWith: ['velozmente', 'fácilmente'],
    examples: [
      { sentence: 'El tren llegó rápidamente a la estación.', role: 'Adverbio de modo' },
      { sentence: 'Resolvieron el dilema rápidamente.', role: 'Adverbio de modo' }
    ],
    l1Risk: ['inglés', 'portugués', 'alemán'],
    visualAnchor: {
      letterToHighlight: 'Á',
      description: 'Conserva la tilde de la palabra madre "RÁPIDO" aunque el acento rítmico secundario esté en "men".',
      soundClue: 'Doble acento perceptivo: RÁ-pi-da-MEN-te'
    },
    socraticClues: {
      level1: '¿Cuál es el adjetivo del que nace esta palabra? ¿Ese adjetivo lleva tilde?',
      level2: 'Los adverbios terminados en -mente conservan la tilde del adjetivo primitivo si este la llevaba.',
      level3: 'Como "rápido" lleva tilde por ser esdrújula, "rápidamente" la mantiene: "rápidamente".'
    }
  },
  {
    id: 'w-exigir',
    word: 'exigir',
    level: 'B1',
    category: 'spellings',
    subcategory: 'g_j',
    difficulty: 3,
    phonology: "/ek.si'xiɾ/",
    syllables: ['e', 'xi', 'gir'],
    stressedSyllable: 2,
    rule: 'Verbos terminados en -GER y -GIR se escriben con G (salvo crujir y tejer). Cambian a J ante A u O (yo exijo).',
    ruleCategoryName: 'Alternancia G / J en verbos',
    semanticField: 'Acciones y derechos',
    frequency: 'high',
    commonErrors: ['exijir', 'ehigir', 'esigir'],
    confusableWith: ['exijo', 'dirigir', 'elegir'],
    examples: [
      { sentence: 'Los ciudadanos pueden exigir transparencia.', role: 'Infinitivo con G' },
      { sentence: 'Yo no te exijo nada imposible.', role: 'Presente 1ª persona con J (exijo)' }
    ],
    l1Risk: ['francés', 'inglés', 'italiano'],
    visualAnchor: {
      letterToHighlight: 'X...G',
      description: 'X interna + terminación verbal -GIR.',
      soundClue: 'Sonido /ks/ seguido del sonido /x/ ante I: e-xi-gir'
    },
    socraticClues: {
      level1: 'Recordá la regla general de los verbos terminados en el sonido /xir/. ¿Qué letra usan casi todos?',
      level2: 'Los verbos en -ger y -gir llevan G en el infinitivo (dirigir, elegir, exigir). Solo cambian a J cuando la vocal siguiente es A u O.',
      level3: 'En infinitivo se escribe con G: "exigir".'
    }
  },
  {
    id: 'w-decision',
    word: 'decisión',
    level: 'B1',
    category: 'morphology',
    subcategory: 'sufijos_cion_sion',
    difficulty: 3,
    phonology: "/de.si'sjon/",
    syllables: ['de', 'ci', 'sión'],
    stressedSyllable: 2,
    rule: 'Derivado del verbo "decidir" (terminado en -dir sin conservar la d): toma el sufijo -SIÓN y tilde en la Ó por ser aguda en -n.',
    ruleCategoryName: 'Sufijos -ción / -sión',
    semanticField: 'Cognición y elecciones',
    frequency: 'high',
    commonErrors: ['decision', 'desición', 'decición', 'desisión'],
    confusableWith: ['precisión', 'revisión', 'condición'],
    examples: [
      { sentence: 'Tomaron una decisión trascendental.', role: 'Sustantivo femenino singular' }
    ],
    l1Risk: ['francés', 'portugués', 'inglés', 'italiano'],
    visualAnchor: {
      letterToHighlight: 'C...S...Ó',
      description: 'Secuencia: de-CI-SIÓN (primero C, luego S, tilde final en Ó).',
      soundClue: 'Alternancia C luego S + aguda terminada en N'
    },
    socraticClues: {
      level1: 'Observá la primera consonante de la raíz (de-ci...) y luego el sufijo final (...sión).',
      level2: 'Las palabras derivadas de verbos en -dir que no mantienen la d en el sustantivo (decidir -> decisión, dividir -> división) se escriben con S.',
      level3: 'Se escribe con C en la primera sílaba, S en la última y tilde en la O: "decisión".'
    }
  },
  {
    id: 'w-zanahoria',
    word: 'zanahoria',
    level: 'A2',
    category: 'spellings',
    subcategory: 'h_intermedia',
    difficulty: 3,
    phonology: "/sa.na'o.ɾja/",
    syllables: ['za', 'na', 'ho', 'ria'],
    stressedSyllable: 2,
    rule: 'Lleva Z inicial y H intercalada muda entre la A y la O (za-na-ho-ria).',
    ruleCategoryName: 'H intercalada / Z',
    semanticField: 'Alimentos y botánica',
    frequency: 'medium',
    commonErrors: ['zanaoria', 'sanaoria', 'zanajoria', 'sanahoria'],
    confusableWith: ['calahorra', 'almohada'],
    examples: [
      { sentence: 'Agregá dos zanahorias cortadas en rodajas a la sopa.', role: 'Sustantivo' }
    ],
    l1Risk: ['inglés', 'francés', 'italiano', 'ruso'],
    visualAnchor: {
      letterToHighlight: 'Z...H',
      description: 'Comienza con Z y esconde una H silenciosa entre las vocales A y O.',
      soundClue: 'za - na - [h]o - ria'
    },
    socraticClues: {
      level1: '¿Tiene alguna letra invisible/muda en el medio que separe las vocales a y o?',
      level2: 'Empieza con Z y lleva una H intercalada entre la segunda y la tercera sílaba.',
      level3: 'Se escribe "zanahoria".'
    }
  },
  {
    id: 'w-rebelar',
    word: 'rebelar(se)',
    level: 'B2',
    category: 'spellings',
    subcategory: 'homofonos_b_v',
    difficulty: 4,
    phonology: "/re.be'laɾ/",
    syllables: ['re', 'be', 'lar'],
    stressedSyllable: 2,
    rule: 'Rebelar (con B) significa oponer resistencia o sublevarse. Revelar (con V) significa descubrir un secreto o manifestar algo oculto.',
    ruleCategoryName: 'Homófonos B / V',
    semanticField: 'Política y sociedad',
    frequency: 'medium',
    commonErrors: ['revelar'],
    confusableWith: ['revelar'],
    examples: [
      { sentence: 'Los soldados decidieron rebelarse contra la injusticia.', role: 'Sublevarse (con B)' },
      { sentence: 'El informe reveló la verdad oculta.', role: 'Descubrir (con V)' }
    ],
    l1Risk: ['francés', 'portugués', 'italiano'],
    visualAnchor: {
      letterToHighlight: 'B',
      description: 'B de Bélico / Batalla / Sublevación (Rebelión).',
      soundClue: 'Asociación semántica: ReBelión -> ReBelar'
    },
    socraticClues: {
      level1: '¿Qué significado tiene la palabra en la frase: descubrir un secreto o levantarse en protesta?',
      level2: 'Pensá en la palabra de la misma familia: "rebelión" (con B) o "revelación" (con V).',
      level3: 'Para sublevarse contra la autoridad se usa con B: "rebelar". Para fotos o secretos es con V: "revelar".'
    }
  },
  {
    id: 'w-sin-embargo',
    word: 'sin embargo',
    level: 'B1',
    category: 'punctuation',
    subcategory: 'conectores_coma',
    difficulty: 3,
    phonology: "/sin em'baɾ.ɣo/",
    syllables: ['sin', 'em', 'bar', 'go'],
    stressedSyllable: 2,
    rule: 'Conector discursivo contraargumentativo: debe ir delimitado por comas cuando va en medio de la oración, o precedido de punto/punto y coma y seguido de coma.',
    ruleCategoryName: 'Puntuación de conectores discursivos',
    semanticField: 'Discurso y argumentación',
    frequency: 'high',
    commonErrors: ['sin embargo no vino', 'sinembargo'],
    confusableWith: ['no obstante', 'por lo tanto'],
    examples: [
      { sentence: 'Estudió mucho; sin embargo, el examen fue difícil.', role: 'Puntuación de conector' },
      { sentence: 'El día estaba frío, sin embargo, salieron a caminar.', role: 'Conector entre comas' }
    ],
    l1Risk: ['inglés', 'francés', 'alemán'],
    visualAnchor: {
      letterToHighlight: ', sin embargo,',
      description: 'Aislado por pausas: coma obligatoria tras el conector.',
      soundClue: 'Pausa prosódica en el discurso'
    },
    socraticClues: {
      level1: 'Cuando usás un conector de contraste al inicio o mitad de una idea, ¿hacés una pausa en la voz?',
      level2: 'Los conectores como "sin embargo", "no obstante" o "por lo tanto" requieren puntuación delimitadora.',
      level3: 'Se escribe separado ("sin embargo") y seguido de coma: "; sin embargo, ..."'
    }
  },
  {
    id: 'w-verguenza',
    word: 'vergüenza',
    level: 'B1',
    category: 'spellings',
    subcategory: 'dieresis',
    difficulty: 4,
    phonology: "/beɾ'ɣwen.θa/",
    syllables: ['ver', 'güen', 'za'],
    stressedSyllable: 1,
    rule: 'La diéresis (¨) sobre la U en güe/güi indica que la U SÍ se pronuncia (gü-e). Sin diéresis, la U sería muda (gue = /ge/).',
    ruleCategoryName: 'Diéresis en gü (güe / güi)',
    semanticField: 'Emociones y carácter',
    frequency: 'medium',
    commonErrors: ['verguenza', 'berguenza', 'vergïenza'],
    confusableWith: ['pingüino', 'bilingüe', 'antigüedad'],
    examples: [
      { sentence: 'Sintió vergüenza al equivocarse en público.', role: 'Sustantivo con diéresis' },
      { sentence: 'El pingüino y la cigüeña también llevan diéresis.', role: 'Familia de la diéresis' }
    ],
    l1Risk: ['inglés', 'francés', 'italiano', 'portugués', 'alemán'],
    visualAnchor: {
      letterToHighlight: 'Ü',
      description: 'Los dos puntitos sobre la U (¨) le devuelven la voz: gü-EN suena, no queda muda.',
      soundClue: 'Se oye la U: ver-GÜEN-za'
    },
    socraticClues: {
      level1: 'Al pronunciar «vergüenza», ¿escuchás la U entre la G y la E, o queda muda?',
      level2: 'Si la U debe sonar en las sílabas gue/gui, se le colocan dos puntos (diéresis): güe, güi.',
      level3: 'Lleva diéresis sobre la U porque esa U se pronuncia: "vergüenza".'
    }
  },
  {
    id: 'w-tambien',
    word: 'también',
    level: 'A2',
    category: 'accentuation',
    subcategory: 'aguda',
    difficulty: 2,
    phonology: "/tam'bjen/",
    syllables: ['tam', 'bién'],
    stressedSyllable: 1,
    rule: 'Palabra aguda terminada en -n: lleva tilde en la última sílaba (tam-BIÉN).',
    ruleCategoryName: 'Acentuación aguda (n/s/vocal)',
    semanticField: 'Conectores aditivos',
    frequency: 'high',
    commonErrors: ['tambien'],
    confusableWith: ['también', 'tan bien'],
    examples: [
      { sentence: 'Yo también quiero participar en el proyecto.', role: 'Adverbio de adición (una palabra)' },
      { sentence: 'Cantás muy bien y bailás tan bien como ella.', role: 'Contraste con "tan bien" (dos palabras)' }
    ],
    l1Risk: ['inglés', 'francés', 'portugués', 'chino'],
    visualAnchor: {
      letterToHighlight: 'É',
      description: 'Aguda terminada en N: la fuerza de voz cae en BIÉN y por eso lleva tilde.',
      soundClue: 'Golpe de voz final: tam-BIÉN'
    },
    socraticClues: {
      level1: '¿En qué sílaba cae el golpe de voz: en TAM o en BIÉN? ¿En qué letra termina la palabra?',
      level2: 'Las palabras agudas (fuerza en la última sílaba) llevan tilde cuando terminan en n, s o vocal.',
      level3: 'Es aguda terminada en -n, por eso lleva tilde: "también".'
    }
  }
];

// 2. Minimal Contrasts (Tríadas y Pares Semántico-Ortográficos)
export const MINIMAL_CONTRASTS: MinimalContrastSet[] = [
  ...EXTRA_CONTRASTS,
  {
    id: 'mc-medico',
    title: 'médico / medico / medicó',
    level: 'A2',
    category: 'accentuation',
    subcategory: 'esdrujula_llana_aguda',
    targetFocus: 'Posición del acento y cambio de función (Sustantivo vs Presente vs Pretérito)',
    forms: [
      {
        word: 'médico',
        accentType: 'Esdrújula (tilde en la antepenúltima)',
        grammaticalFunction: 'Sustantivo o adjetivo',
        meaningContext: 'Persona especializada en medicina.',
        exampleSentence: 'El médico del hospital es muy atento.'
      },
      {
        word: 'medico',
        accentType: 'Llana (acento prosódico en la penúltima)',
        grammaticalFunction: 'Verbo en presente (1ª persona singular: yo)',
        meaningContext: 'Acción presente de prescribir medicamentos.',
        exampleSentence: 'Yo nunca me medico sin consultar a un profesional.'
      },
      {
        word: 'medicó',
        accentType: 'Aguda (tilde en la última sílaba)',
        grammaticalFunction: 'Verbo en pretérito perfecto simple (3ª persona: él/ella)',
        meaningContext: 'Acción pasada completada.',
        exampleSentence: 'Ayer la doctora medicó a mi abuelo con antibióticos.'
      }
    ],
    discoveryQuestion: '¿Qué elemento gráfico determina si se trata de una profesión, una acción del presente o un hecho del pasado?'
  },
  {
    id: 'mc-termino',
    title: 'término / termino / terminó',
    level: 'B1',
    category: 'accentuation',
    subcategory: 'esdrujula_llana_aguda',
    targetFocus: 'Tríada de acentuación léxico-temporal',
    forms: [
      {
        word: 'término',
        accentType: 'Esdrújula (tilde en antepenúltima)',
        grammaticalFunction: 'Sustantivo',
        meaningContext: 'Palabra, concepto, plazo o límite.',
        exampleSentence: 'Ese término lingüístico es muy complejo.'
      },
      {
        word: 'termino',
        accentType: 'Llana (sin tilde)',
        grammaticalFunction: 'Verbo presente (yo)',
        meaningContext: 'Acción que finaliza ahora mismo.',
        exampleSentence: 'Termino de almorzar y salgo para allá.'
      },
      {
        word: 'terminó',
        accentType: 'Aguda (tilde en la última)',
        grammaticalFunction: 'Verbo pretérito (él/ella)',
        meaningContext: 'Acción finalizada en el pasado.',
        exampleSentence: 'La reunión terminó a las seis en punto.'
      }
    ],
    discoveryQuestion: '¿Cómo cambia el significado de la oración si movemos la fuerza de voz de TÉR-mi-no a ter-mi-NÓ?'
  },
  {
    id: 'mc-el-el',
    title: 'el / él (Tilde diacrítica)',
    level: 'A1',
    category: 'accentuation',
    subcategory: 'diacritica',
    targetFocus: 'Diferenciación entre artículo y pronombre personal',
    forms: [
      {
        word: 'el',
        accentType: 'Monosílabo átono (sin tilde)',
        grammaticalFunction: 'Artículo determinado masculino singular',
        meaningContext: 'Acompaña a un sustantivo.',
        exampleSentence: 'El profesor llegó con todos los libros.'
      },
      {
        word: 'él',
        accentType: 'Monosílabo tónico (con tilde diacrítica)',
        grammaticalFunction: 'Pronombre personal (sujeto)',
        meaningContext: 'Reemplaza a una persona masculina.',
        exampleSentence: 'Él sabe exactamente cuál es la respuesta.'
      }
    ],
    discoveryQuestion: '¿Quién realiza la acción y quién acompaña al sustantivo en: "Él compró el auto"?'
  },
  {
    id: 'mc-tu-tu',
    title: 'tu / tú (Tilde diacrítica)',
    level: 'A1',
    category: 'accentuation',
    subcategory: 'diacritica',
    targetFocus: 'Posesivo vs Pronombre de 2ª persona',
    forms: [
      {
        word: 'tu',
        accentType: 'Monosílabo átono (sin tilde)',
        grammaticalFunction: 'Adjetivo posesivo',
        meaningContext: 'Indica pertenencia: tu casa, tu libro.',
        exampleSentence: 'Tu hermano me llamó por teléfono.'
      },
      {
        word: 'tú',
        accentType: 'Monosílabo tónico (con tilde)',
        grammaticalFunction: 'Pronombre personal',
        meaningContext: 'La persona a la que le hablo.',
        exampleSentence: 'Tú siempre tienes buenas ideas.'
      }
    ],
    discoveryQuestion: '¿Por qué en "Tú trajiste tu mochila" una palabra lleva tilde y la otra no?'
  },
  {
    id: 'mc-donde-donde',
    title: 'dónde / donde (Interrogativo vs Relativo)',
    level: 'B1',
    category: 'accentuation',
    subcategory: 'interrogativos',
    targetFocus: 'Valor enfático/interrogativo vs nexo relativo',
    forms: [
      {
        word: 'dónde',
        accentType: 'Tónico (con tilde)',
        grammaticalFunction: 'Adverbio interrogativo o exclamativo (directo o indirecto)',
        meaningContext: 'Pregunta por un lugar.',
        exampleSentence: 'No sé dónde guardaste las llaves.'
      },
      {
        word: 'donde',
        accentType: 'Átono (sin tilde)',
        grammaticalFunction: 'Adverbio relativo',
        meaningContext: 'Se refiere a un lugar ya mencionado (antecedente).',
        exampleSentence: 'La casa donde nací todavía sigue en pie.'
      }
    ],
    discoveryQuestion: '¿Hay una pregunta explícita o implícita, o se trata de una referencia a un lugar previo?'
  },
  {
    id: 'mc-hecho-echo',
    title: 'hecho / echo (Homófonos H)',
    level: 'A2',
    category: 'spellings',
    subcategory: 'homofonos',
    targetFocus: 'Verbo hacer vs verbo echar',
    forms: [
      {
        word: 'hecho',
        accentType: 'Llana (con H)',
        grammaticalFunction: 'Participio de "hacer" o sustantivo',
        meaningContext: 'Realizado, fabricado o acontecimiento real.',
        exampleSentence: 'Ya he hecho toda la comida para la fiesta.'
      },
      {
        word: 'echo',
        accentType: 'Llana (sin H)',
        grammaticalFunction: 'Presente del verbo "echar" (yo)',
        meaningContext: 'Tirar, verter o expulsar.',
        exampleSentence: 'Yo le echo un poco de sal a la ensalada.'
      }
    ],
    discoveryQuestion: '¿La acción proviene de FABRICAR/REALIZAR (hacer) o de LANZAR/VERTER (echar)?'
  },
  {
    id: 'mc-si-si',
    title: 'sí / si (Tilde diacrítica)',
    level: 'A2',
    category: 'accentuation',
    subcategory: 'diacritica',
    targetFocus: 'Afirmación/pronombre tónico vs conjunción condicional átona',
    forms: [
      {
        word: 'sí',
        accentType: 'Monosílabo tónico (con tilde diacrítica)',
        grammaticalFunction: 'Adverbio de afirmación o pronombre reflexivo',
        meaningContext: 'Afirma («¡sí!») o refuerza («volvió en sí»).',
        exampleSentence: 'Le pregunté y me dijo que sí.'
      },
      {
        word: 'si',
        accentType: 'Monosílabo átono (sin tilde)',
        grammaticalFunction: 'Conjunción condicional (o nota musical)',
        meaningContext: 'Introduce una condición: «si llueve...».',
        exampleSentence: 'Si estudiás, vas a aprobar el examen.'
      }
    ],
    discoveryQuestion: '¿La palabra afirma algo (¡sí!) o plantea una condición hipotética (si...)?'
  }
];

// 3. Structured Input Activities (Input Processing)
export const STRUCTURED_INPUT_EXERCISES: StructuredInputExercise[] = [
  ...EXTRA_STRUCTURED_INPUT,
  {
    id: 'si-1',
    level: 'A2',
    category: 'accentuation',
    comprehensionQuestion: '¿En cuál de estas tres oraciones la persona está hablando de su propia profesión en el presente?',
    correctIndex: 1,
    sentences: [
      {
        sentence: 'El médico del pueblo llegó muy temprano.',
        highlightWord: 'médico',
        isCorrectMeaning: false
      },
      {
        sentence: 'Yo medico a mis pacientes con tratamientos naturales.',
        highlightWord: 'medico',
        isCorrectMeaning: true
      },
      {
        sentence: 'Ayer el especialista medicó a todos los internados.',
        highlightWord: 'medicó',
        isCorrectMeaning: false
      }
    ],
    explanation: '"medico" (sin tilde, llana) corresponde a la 1ª persona del presente del verbo medicar: "Yo medico". "médico" es el sustantivo y "medicó" es el pasado.',
    cognitiveReflection: 'La ausencia de tilde y la posición del acento en la penúltima sílaba señalan la conjugación en primera persona del presente.'
  },
  {
    id: 'si-2',
    level: 'A1',
    category: 'accentuation',
    comprehensionQuestion: '¿Quién posee el objeto en esta oración: "Él tiene tu libro"?',
    correctIndex: 1,
    sentences: [
      {
        sentence: 'Él tiene el libro propio.',
        highlightWord: 'Él',
        isCorrectMeaning: false
      },
      {
        sentence: 'El libro te pertenece a ti (tu libro).',
        highlightWord: 'tu',
        isCorrectMeaning: true
      },
      {
        sentence: 'Nadie tiene el libro.',
        highlightWord: 'libro',
        isCorrectMeaning: false
      }
    ],
    explanation: '"tu" (sin tilde) es un adjetivo posesivo de segunda persona ("tu libro" = tu propiedad). "Él" (con tilde) es el sujeto que realiza la acción de tenerlo.',
    cognitiveReflection: 'La tilde distingue la persona que ejecuta la acción (Él) del dueño del objeto (tu).'
  },
  {
    id: 'si-3',
    level: 'B1',
    category: 'accentuation',
    comprehensionQuestion: '¿En cuál de las opciones se desconoce el lugar exacto y se plantea una incógnita?',
    correctIndex: 0,
    sentences: [
      {
        sentence: 'Me pregunto dónde se habrá metido Martín.',
        highlightWord: 'dónde',
        isCorrectMeaning: true
      },
      {
        sentence: 'Fuimos al restaurante donde cenamos el año pasado.',
        highlightWord: 'donde',
        isCorrectMeaning: false
      },
      {
        sentence: 'El parque donde jugábamos ya no tiene árboles.',
        highlightWord: 'donde',
        isCorrectMeaning: false
      }
    ],
    explanation: '"dónde" con tilde expresa interrogación indirecta ("Me pregunto dónde..."). En cambio, "donde" sin tilde es un relativo que remite a un lugar ya conocido.',
    cognitiveReflection: 'Las palabras interrogativas conservan la tilde diacrítica enfática incluso en oraciones subordinadas indirectas.'
  },
  {
    id: 'si-4',
    level: 'A2',
    category: 'spellings',
    comprehensionQuestion: '¿En cuál de estas frases se está expresando que se arrojó algo o se vertió un ingrediente?',
    correctIndex: 0,
    sentences: [
      {
        sentence: 'Siempre le echo azúcar al café por las mañanas.',
        highlightWord: 'echo',
        isCorrectMeaning: true
      },
      {
        sentence: 'Es un hecho comprobado científicamente.',
        highlightWord: 'hecho',
        isCorrectMeaning: false
      },
      {
        sentence: 'Ya he hecho todos los deberes de la semana.',
        highlightWord: 'hecho',
        isCorrectMeaning: false
      }
    ],
    explanation: '"echo" (sin H) viene del verbo echar (verter, agregar, tirar). "hecho" (con H) proviene del verbo hacer o es el sustantivo "suceso".',
    cognitiveReflection: 'Echar "echa la H por la ventana" (regla mnemotécnica tradicional basada en familias léxicas).'
  }
];

// 4. Discovery Sets for Inductive Accentuation & Morphological Rules
export const DISCOVERY_SETS: DiscoverySet[] = [
  ...EXTRA_DISCOVERY,
  {
    id: 'disc-agudas-llanas',
    title: 'Descubrimiento: ¿Cuándo llevan tilde las palabras agudas?',
    level: 'A2',
    groupA: [
      { word: 'canción', stressedIndex: 1, endsWith: 'n' },
      { word: 'sofá', stressedIndex: 1, endsWith: 'vocal' },
      { word: 'compás', stressedIndex: 1, endsWith: 's' },
      { word: 'café', stressedIndex: 1, endsWith: 'vocal' }
    ],
    groupB: [
      { word: 'pared', stressedIndex: 1, endsWith: 'd' },
      { word: 'reloj', stressedIndex: 1, endsWith: 'j' },
      { word: 'animal', stressedIndex: 1, endsWith: 'l' },
      { word: 'cantar', stressedIndex: 1, endsWith: 'r' }
    ],
    promptQuestion: 'Ambos grupos tienen la fuerza de voz en la última sílaba (son agudas). Observá las letras finales del Grupo A con tilde y del Grupo B sin tilde.',
    classificationQuestion: '¿En qué letras terminan las palabras agudas que SÍ llevan tilde?',
    discoveredRule: 'Las palabras agudas llevan tilde únicamente cuando terminan en N, S o VOCAL.',
    targetCategory: 'Acentuación aguda'
  },
  {
    id: 'disc-esdrujulas',
    title: 'Descubrimiento: El patrón de las palabras esdrújulas',
    level: 'A2',
    groupA: [
      { word: 'médico', stressedIndex: 0, endsWith: 'o' },
      { word: 'pájaro', stressedIndex: 0, endsWith: 'o' },
      { word: 'teléfono', stressedIndex: 0, endsWith: 'o' },
      { word: 'música', stressedIndex: 0, endsWith: 'a' }
    ],
    groupB: [
      { word: 'árbol', stressedIndex: 0, endsWith: 'l' },
      { word: 'fácil', stressedIndex: 0, endsWith: 'l' },
      { word: 'mesa', stressedIndex: 0, endsWith: 'a' },
      { word: 'casa', stressedIndex: 0, endsWith: 'a' }
    ],
    promptQuestion: 'En las palabras del Grupo A, el golpe de voz está en la antepenúltima sílaba (mé-di-co, pá-ja-ro). ¿Qué tienen en común todas ellas con respecto a la tilde?',
    classificationQuestion: '¿Depende la tilde de las esdrújulas de la letra final o es incondicional?',
    discoveredRule: 'TODAS las palabras esdrújulas llevan tilde siempre, sin importar en qué letra terminen.',
    targetCategory: 'Acentuación esdrújula'
  },
  {
    id: 'disc-hiatos',
    title: 'Descubrimiento: La ruptura del diptongo (Hiatos acentuales)',
    level: 'B1',
    groupA: [
      { word: 'país', stressedIndex: 1, endsWith: 's' },
      { word: 'raíz', stressedIndex: 1, endsWith: 'z' },
      { word: 'María', stressedIndex: 1, endsWith: 'a' },
      { word: 'frío', stressedIndex: 0, endsWith: 'o' }
    ],
    groupB: [
      { word: 'aire', stressedIndex: 0, endsWith: 'e' },
      { word: 'tierra', stressedIndex: 0, endsWith: 'a' },
      { word: 'ciudad', stressedIndex: 1, endsWith: 'd' },
      { word: 'cuidado', stressedIndex: 1, endsWith: 'o' }
    ],
    promptQuestion: 'En el Grupo A la vocal débil (i/u) suena con más fuerza que la vocal abierta contigua. En el Grupo B las dos vocales van unidas en una sola sílaba.',
    classificationQuestion: '¿Qué le ocurre a la vocal débil cuando lleva la fuerza de la pronunciación?',
    discoveredRule: 'Cuando la vocal cerrada (I, U) es tónica junto a una abierta (A, E, O), se destruye el diptongo (hiato) y la cerrada lleva tilde automáticamente, por encima de las reglas generales de agudas o llanas.',
    targetCategory: 'Hiato acentual'
  }
];

// 5. Morphological Word Families & Suffixes
export const WORD_FAMILIES: WordFamilyItem[] = [
  ...EXTRA_FAMILIES,
  {
    root: 'pan',
    category: 'morphology',
    level: 'A1',
    coreRule: 'La raíz léxica invariable mantiene su grafía base a través de todas las derivaciones.',
    baseWord: 'pan',
    family: [
      { word: 'panadero', suffixOrPrefix: '-adero (profesión)', partOfSpeech: 'Sustantivo', meaning: 'Persona que hace pan', criticalLetter: 'p-a-n' },
      { word: 'panadería', suffixOrPrefix: '-adería (lugar + tilde en hiato)', partOfSpeech: 'Sustantivo', meaning: 'Tienda donde se vende pan', criticalLetter: 'ía' },
      { word: 'empanar', suffixOrPrefix: 'em- (prefijo antes de P) + -ar', partOfSpeech: 'Verbo', meaning: 'Cubrir con pan rallado', criticalLetter: 'm ante p' },
      { word: 'panificado', suffixOrPrefix: '-ificado (participio)', partOfSpeech: 'Adjetivo/Sustantivo', meaning: 'Producto horneado', criticalLetter: 'p-a-n' }
    ],
    discoveryQuestion: '¿Qué elemento se mantiene idéntico en toda la familia y qué regla de prefijo aparece en "empanar"?',
    reconstruction: {
      instruction: 'Formá el sustantivo de LUGAR (la tienda donde se vende pan) a partir de «pan» con el sufijo -adería:',
      answer: 'panadería',
      successNote: '¡Exacto! «panadería» conserva la raíz "pan" y lleva tilde en la í por el hiato (-de-RÍ-a).',
      hint: 'Mantené la raíz "pan" y recordá la tilde del hiato en la terminación -ería → -ía.',
    }
  },
  {
    root: 'hacer',
    category: 'morphology',
    level: 'A2',
    coreRule: 'Todas las palabras de la familia de "hacer" conservan la H inicial y alternan c/z/g según el sonido.',
    baseWord: 'hacer',
    family: [
      { word: 'rehacer', suffixOrPrefix: 're- (repetición)', partOfSpeech: 'Verbo', meaning: 'Volver a hacer', criticalLetter: 'h intermedia' },
      { word: 'hecho', suffixOrPrefix: '-cho (participio irregular)', partOfSpeech: 'Participio/Sustantivo', meaning: 'Acción completada', criticalLetter: 'h inicial' },
      { word: 'hacedor', suffixOrPrefix: '-edor (agente)', partOfSpeech: 'Sustantivo', meaning: 'Quien produce o crea', criticalLetter: 'h inicial' },
      { word: 'deshecho', suffixOrPrefix: 'des- (inversión) + hecho', partOfSpeech: 'Adjetivo', meaning: 'Desbaratado o destruido (no confundir con desecho de basura)', criticalLetter: 'h intermedia' }
    ],
    discoveryQuestion: '¿Por qué "deshecho" (de deshacer) lleva H intermedia y "desecho" (de desechar) no?',
    reconstruction: {
      instruction: 'Formá el verbo que significa «volver a hacer» con el prefijo re- sobre «hacer»:',
      answer: 'rehacer',
      successNote: '¡Exacto! «rehacer» conserva la H del verbo base "hacer" (queda intercalada tras el prefijo re-).',
      hint: 'La familia de "hacer" siempre conserva la H, aunque quede en el interior de la palabra.',
    }
  },
  {
    root: 'rápido',
    category: 'morphology',
    level: 'B1',
    coreRule: 'Los adverbios formados con el sufijo -mente conservan exactamente la tilde que tenía el adjetivo de origen.',
    baseWord: 'rápido',
    family: [
      { word: 'rápidamente', suffixOrPrefix: '-mente', partOfSpeech: 'Adverbio', meaning: 'De manera veloz', criticalLetter: 'á con tilde' },
      { word: 'rapidez', suffixOrPrefix: '-ez (cualidad)', partOfSpeech: 'Sustantivo', meaning: 'Velocidad (termina en z, sin tilde)', criticalLetter: 'z final' }
    ],
    discoveryQuestion: '¿Por qué "rápidamente" conserva la tilde pero "rapidez" no la lleva?',
    reconstruction: {
      instruction: 'Formá el adverbio en -mente a partir del adjetivo «rápido», manteniendo las reglas de acentuación:',
      answer: 'rápidamente',
      successNote: '¡Exacto! «rápidamente» conserva la tilde del adjetivo de origen "rápido" (esdrújula).',
      hint: 'Los adverbios en -mente conservan la tilde del adjetivo base si este la lleva ("rápido" → "rápidamente").',
    }
  }
];

// 6. Intelligent Dictations (Speech Transcription)
export const DICTATION_ITEMS: DictationItem[] = [
  ...EXTRA_DICTATIONS,
  {
    id: 'dict-1',
    level: 'A1',
    text: 'Ayer María llegó temprano porque quería estudiar en la biblioteca.',
    audioPacing: 'normal',
    focusCategory: 'accentuation',
    difficulty: 2,
    contextTopic: 'Vida académica y rutinas',
    hints: ['María (hiato con tilde)', 'llegó (aguda en vocal con tilde)', 'quería (hiato)', 'biblioteca (con B)']
  },
  {
    id: 'dict-2',
    level: 'A2',
    text: 'El médico le aconsejó hervir el agua antes de beberla.',
    audioPacing: 'normal',
    focusCategory: 'spellings',
    difficulty: 2,
    contextTopic: 'Salud y prevención',
    hints: ['médico (esdrújula)', 'aconsejó (con J y tilde)', 'hervir (con H y con V)', 'beberla (ambas con B)']
  },
  {
    id: 'dict-3',
    level: 'B1',
    text: 'No sé dónde vive, pero sé que su decisión fue rápida y prudente.',
    audioPacing: 'normal',
    focusCategory: 'accentuation',
    difficulty: 3,
    contextTopic: 'Decisiones personales',
    hints: ['sé (verbo saber con tilde)', 'dónde (interrogativo indirecto)', 'decisión (con C, S y tilde)', 'rápida (esdrújula)']
  },
  {
    id: 'dict-4',
    level: 'B2',
    text: 'Sin embargo, los ciudadanos decidieron rebelarse y exigir explicaciones claras.',
    audioPacing: 'normal',
    focusCategory: 'spellings',
    difficulty: 4,
    contextTopic: 'Sociedad y derechos',
    hints: ['Sin embargo, (coma tras conector)', 'rebelarse (sublevarse con B)', 'exigir (con X y con G)']
  }
];

// 7. Adaptive Diagnostic Baseline (15 Calibrated Questions)
export const INITIAL_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  ...EXTRA_DIAGNOSTIC,
  {
    id: 'diag-1',
    category: 'accentuation',
    subcategory: 'esdrujula',
    level: 'A2',
    type: 'spot_error',
    prompt: 'Observá la siguiente oración. ¿Qué palabra necesita corrección en su acentuación?',
    sentenceContext: 'El medico del hospital atendió a varios pacientes.',
    options: ['medico -> médico', 'hospital -> hóspital', 'pacientes -> paciéntes', 'Ninguna, está correcta'],
    correctAnswer: 'medico -> médico',
    explanation: '"médico" es una palabra esdrújula (mé-di-co) y todas las esdrújulas llevan tilde obligatoriamente.',
    l1CommonInterference: ['inglés', 'francés', 'italiano']
  },
  {
    id: 'diag-2',
    category: 'spellings',
    subcategory: 'b_v',
    level: 'A2',
    type: 'fill_gap',
    prompt: 'Completá la oración con las grafías correctas:',
    sentenceContext: 'Es necesario her___ir el agua antes de ___e___erla.',
    options: ['v / b / b', 'b / v / v', 'v / v / b', 'b / b / b'],
    correctAnswer: 'v / b / b',
    explanation: '"hervir" es una excepción que se escribe con V; "beber" se escribe con ambas B en todas sus formas.',
    l1CommonInterference: ['francés', 'portugués', 'inglés']
  },
  {
    id: 'diag-3',
    category: 'accentuation',
    subcategory: 'hiato',
    level: 'B1',
    type: 'fill_gap',
    prompt: 'Elegí la opción que contiene la acentuación correcta para las tres palabras:',
    sentenceContext: 'En este pa___s todav___a hay mucho fr___o.',
    options: ['país / todavía / frío', 'pais / todavia / frio', 'país / todavia / frio', 'pais / todavía / frío'],
    correctAnswer: 'país / todavía / frío',
    explanation: 'Las tres palabras contienen hiatos formados por vocal abierta + vocal cerrada tónica (a-í, i-a, í-o), por lo que llevan tilde obligatoria.',
    l1CommonInterference: ['inglés', 'alemán', 'francés']
  },
  {
    id: 'diag-4',
    category: 'accentuation',
    subcategory: 'diacritica',
    level: 'A2',
    type: 'contrast',
    prompt: '¿En cuál de las siguientes opciones se utiliza correctamente la tilde diacrítica?',
    options: [
      'Él me prestó su cuaderno ayer.',
      'El me prestó su cuaderno ayer.',
      'Él me prestó sú cuaderno ayer.',
      'El me presto su cuaderno ayér.'
    ],
    correctAnswer: 'Él me prestó su cuaderno ayer.',
    explanation: '"Él" lleva tilde porque es pronombre personal sujeto. "su" no lleva tilde porque es posesivo.',
    l1CommonInterference: ['inglés', 'portugués', 'francés']
  },
  {
    id: 'diag-5',
    category: 'spellings',
    subcategory: 'g_j',
    level: 'B1',
    type: 'spot_error',
    prompt: 'Detectá la forma ortográfica correcta para completar ambas frases:',
    sentenceContext: 'Tenemos que ___ (exigir/exijir) calidad, por eso yo ___ (exigo/exijo) compromiso.',
    options: ['exigir / exijo', 'exijir / exijo', 'exigir / exigo', 'exijir / exigo'],
    correctAnswer: 'exigir / exijo',
    explanation: 'El verbo infinitivo se escribe con G ("exigir"), pero ante la vocal O cambia a J para mantener el sonido /x/: "exijo".',
    l1CommonInterference: ['francés', 'inglés', 'italiano']
  },
  {
    id: 'diag-6',
    category: 'punctuation',
    subcategory: 'conectores_coma',
    level: 'B1',
    type: 'punctuation_intent',
    prompt: '¿Cuál es la puntuación correcta para esta oración con conector contraargumentativo?',
    options: [
      'Estudió mucho; sin embargo, no aprobó el examen.',
      'Estudió mucho sin embargo no aprobó el examen.',
      'Estudió mucho, sin embargo no aprobó, el examen.',
      'Estudió mucho sin embargo, no aprobó el examen.'
    ],
    correctAnswer: 'Estudió mucho; sin embargo, no aprobó el examen.',
    explanation: 'Los conectores discursivos como "sin embargo" van delimitados por comas o precedidos de punto y coma y seguidos de coma.',
    l1CommonInterference: ['inglés', 'alemán']
  },
  {
    id: 'diag-7',
    category: 'morphology',
    subcategory: 'sufijos_mente',
    level: 'B1',
    type: 'fill_gap',
    prompt: 'Al convertir el adjetivo "fácil" en adverbio, ¿cuál es la forma correcta?',
    options: ['fácilmente', 'facilmente', 'fácil mente', 'fázilmente'],
    correctAnswer: 'fácilmente',
    explanation: 'Los adverbios en -mente conservan exactamente la tilde del adjetivo original ("fácil" -> "fácilmente").',
    l1CommonInterference: ['inglés', 'portugués']
  },
  {
    id: 'diag-8',
    category: 'capitals',
    subcategory: 'meses_dias_idiomas',
    level: 'A2',
    type: 'contrast',
    prompt: 'En español normativo, ¿cuál de estas oraciones está correctamente escrita respecto a las mayúsculas?',
    options: [
      'El lunes de marzo empezamos el curso de español.',
      'El Lunes de Marzo empezamos el curso de Español.',
      'El Lunes de marzo empezamos el curso de español.',
      'El lunes de Marzo empezamos el curso de Español.'
    ],
    correctAnswer: 'El lunes de marzo empezamos el curso de español.',
    explanation: 'En español (a diferencia del inglés u otros idiomas), los días de la semana, los meses del año y los nombres de idiomas se escriben con minúscula inicial.',
    l1CommonInterference: ['inglés', 'alemán']
  },
  {
    id: 'diag-9',
    category: 'spellings',
    subcategory: 'c_s_z',
    level: 'B1',
    type: 'fill_gap',
    prompt: 'Completá la palabra: de___i___ión',
    options: ['c / s (decisión)', 's / c (desición)', 'c / c (decición)', 's / s (desisión)'],
    correctAnswer: 'c / s (decisión)',
    explanation: 'Proviene de "decidir" (con C) y toma el sufijo derivativo "-sión" (con S y tilde en la O).',
    l1CommonInterference: ['portugués', 'francés', 'italiano']
  },
  {
    id: 'diag-10',
    category: 'accentuation',
    subcategory: 'interrogativos',
    level: 'B1',
    type: 'contrast',
    prompt: '¿En cuál de estas frases "cuando/cuándo" debe llevar tilde?',
    options: [
      'No sé cuándo vendrá a visitarnos.',
      'Iré al parque cuando termine la lluvia.',
      'Llegó en el momento cuando más lo necesitábamos.',
      'Avísame cuando llegues a casa.'
    ],
    correctAnswer: 'No sé cuándo vendrá a visitarnos.',
    explanation: 'Lleva tilde ("cuándo") porque introduce una interrogativa indirecta con sentido enfático.',
    l1CommonInterference: ['inglés', 'francés', 'portugués']
  }
];

// 8. Escape Room Scenarios (ESCAPE ORTO)
export const ESCAPE_SCENARIOS: EscapeScenario[] = [
  ...EXTRA_ESCAPE,
  {
    id: 'esc-01',
    codeName: 'PROTOCOLO SILICÓN',
    title: 'La Base de Datos Corrupta del Laboratorio',
    difficulty: 'Intermedio (B1-B2)',
    description: 'El núcleo del procesador lingüístico fue saboteado con errores de tildes y grafías dudosas. Para restablecer el sistema, deberás resolver 5 cerraduras ortográficas secuenciales.',
    stages: [
      {
        stageNumber: 1,
        stageTitle: 'Fase 1: Detección de Esdrújulas',
        briefing: 'El sensor térmico detectó tres palabras sin tilde que colapsan el registro.',
        instruction: 'Seleccioná todas las palabras que DEBEN llevar tilde por ser esdrújulas.',
        encryptedSnippet: 'medico // arbol // pajaro // telefono // cancion',
        interactiveType: 'select_multiple',
        options: ['medico', 'arbol', 'pajaro', 'telefono', 'cancion'],
        correctAnswers: ['medico', 'pajaro', 'telefono'],
        clueUnlockCode: 'ESDR-3',
        socraticHint: 'Contá tres sílabas desde el final. Las esdrújulas siempre llevan tilde obligatoria.'
      },
      {
        stageNumber: 2,
        stageTitle: 'Fase 2: El Contraste Semántico',
        briefing: 'Un registro de audio alteró la identidad del sujeto.',
        instruction: 'Completá la frase: "¿Quién tiene el libro? [____] tiene [____] libro."',
        encryptedSnippet: '[El / Él] tiene [tu / tú] libro.',
        interactiveType: 'decode_contrast',
        options: ['Él / tu', 'El / tú', 'Él / tú', 'El / tu'],
        correctAnswers: ['Él / tu'],
        clueUnlockCode: 'DIAC-9',
        socraticHint: 'El pronombre sujeto lleva tilde (Él); el posesivo no lleva tilde (tu).'
      },
      {
        stageNumber: 3,
        stageTitle: 'Fase 3: Reconstrucción Morfológica',
        briefing: 'Un sufijo adverbial perdió su acento originario al fusionarse.',
        instruction: 'Escribí la forma correcta del adverbio derivado de "rápido":',
        encryptedSnippet: 'ADJETIVO: rápido -> ADVERBIO: [ ? ]',
        interactiveType: 'type_correct_key',
        correctAnswers: ['rápidamente'],
        clueUnlockCode: 'SUF-MENTE',
        socraticHint: 'Los compuestos en -mente conservan intacta la tilde del adjetivo de base.'
      },
      {
        stageNumber: 4,
        stageTitle: 'Fase 4: Depuración de Texto Infectado',
        briefing: 'El informe de seguridad contiene 2 errores críticos de grafías B/V y G/J.',
        instruction: 'Identificá la palabra con error: "El director decidió exijir que el personal vuelva a hervir el agua."',
        encryptedSnippet: 'El director decidió [exijir] que el personal vuelva a hervir el agua.',
        interactiveType: 'spot_odd_one',
        options: ['director', 'exijir', 'vuelva', 'hervir'],
        correctAnswers: ['exijir'],
        clueUnlockCode: 'VERB-GIR',
        socraticHint: 'Los verbos en -ger y -gir se escriben con G en su infinitivo: "exigir".'
      },
      {
        stageNumber: 5,
        stageTitle: 'Fase Final: Clave Maestra',
        briefing: 'Ingresá la palabra clave que rompe el diptongo con tilde en la I para "lugar habitado por una nación soberana":',
        instruction: 'Escribí con su tilde exacta la palabra de dos sílabas pa-ís:',
        encryptedSnippet: 'CLAVE DE ACCESO: [ P _ _ _ ]',
        interactiveType: 'type_correct_key',
        correctAnswers: ['país'],
        clueUnlockCode: 'SISTEMA RESTAURADO',
        socraticHint: 'Lleva tilde en la vocal cerrada tónica: pa-ÍS.'
      }
    ]
  }
];

// 9. Free Writing Prompts by CEFR Level
export const FREE_WRITING_PROMPTS = [
  ...EXTRA_WRITING_PROMPTS,
  {
    level: 'A1' as Level,
    title: 'Mensaje de Invitación',
    prompt: 'Escribí un mensaje breve para invitar a un amigo a cenar en tu casa. Mencioná qué día, a qué hora y qué van a comer.',
    targetFocus: 'Mayúsculas iniciales, puntuación básica, tildes en días/preguntas, verbos cotidianos (hacer, tener, estar).'
  },
  {
    level: 'A2' as Level,
    title: 'Anécdota del Fin de Semana',
    prompt: 'Contá qué hiciste el fin de semana pasado. Describí los lugares que visitaste y con quién estuviste.',
    targetFocus: 'Acentuación de pretéritos agudos (llegó, comí, visité), b/v en formas verbales (estuve, fui, había).'
  },
  {
    level: 'B1' as Level,
    title: 'Opinión: El Trabajo Remoto',
    prompt: 'Escribí un texto de opinión explicando las ventajas y desventajas de trabajar o estudiar desde casa.',
    targetFocus: 'Puntuación de conectores (sin embargo, por lo tanto), tilde diacrítica, sufijos en -ción/-sión y -mente.'
  },
  {
    level: 'B2' as Level,
    title: 'Texto Argumentativo: Inteligencia Artificial',
    prompt: 'Redactá un texto argumentando si la inteligencia artificial transformará la educación de manera positiva o negativa.',
    targetFocus: 'Estructura discursiva con punto y coma, subordinadas con interrogativos/relativos, palabras derivadas complejas.'
  },
  {
    level: 'C1' as Level,
    title: 'Columna de Opinión Editorial',
    prompt: 'Redactá una columna de opinión sobre los desafíos del multilingüismo y la preservación lingüística en la era digital.',
    targetFocus: 'Puntuación de incisos, vocativos, conectores complejos, mayúsculas institucionales, precisión léxica.'
  },
  {
    level: 'C2' as Level,
    title: 'Ensayo Crítico / Reseña Académica',
    prompt: 'Redactá una reflexión crítica sobre cómo la ortografía refleja las tensiones entre norma académica y evolución sociolingüística.',
    targetFocus: 'Dominio ortográfico integral, convenciones editoriales avanzadas, cohesión discursiva y matices léxicos.'
  }
];
