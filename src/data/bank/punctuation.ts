import { PunctuationExercise } from '../../types';

/**
 * Módulo PUNTUACIÓN (§24) — 100% procedural.
 * Tres subtipos deterministas:
 *  - punctuate: el estudiante inserta signos; se compara con `canonical`
 *    normalizando espacios (la app no "adivina": marca diferencias exactas).
 *  - compare: elegir la versión mejor puntuada (con nota explicativa).
 *  - edit: corregir un texto con puntuación errónea (referencia `fixedText`).
 */
export const PUNCTUATION_EXERCISES: PunctuationExercise[] = [
  /* ---------- PUNTUAR ---------- */
  {
    id: 'pun-punctuate-conector',
    level: 'B1',
    type: 'punctuate',
    focus: 'Coma con conector discursivo',
    instruction:
      'Insertá la puntuación que falta. Prestá atención a la pausa que exige el conector.',
    rawText:
      'El proyecto avanzó bien sin embargo todavía quedan detalles por revisar',
    canonical:
      'El proyecto avanzó bien; sin embargo, todavía quedan detalles por revisar.',
    explanation:
      'Los conectores adversativos como «sin embargo» se aíslan con coma (o punto y coma antes) porque introducen un giro en el discurso.',
    socraticClue:
      '¿Qué pausa hacés al pronunciar «sin embargo» en voz alta? Esa pausa se marca con coma.',
  },
  {
    id: 'pun-punctuate-condicional',
    level: 'A2',
    type: 'punctuate',
    focus: 'Coma en subordinada antepuesta',
    instruction: 'Puntuá la oración para separar la condición del resultado.',
    rawText: 'Si terminás temprano llamame y nos encontramos en la plaza',
    canonical: 'Si terminás temprano, llamame y nos encontramos en la plaza.',
    explanation:
      'Cuando la subordinada condicional va delante de la principal, se cierra con una coma.',
    socraticClue: '¿Dónde termina la condición «si...» y empieza lo que va a pasar?',
  },
  {
    id: 'pun-punctuate-enumeracion',
    level: 'A2',
    type: 'punctuate',
    focus: 'Comas en enumeración',
    instruction: 'Separá los elementos de la lista con la puntuación adecuada.',
    rawText: 'Compré pan queso frutas y verduras para la semana',
    canonical: 'Compré pan, queso, frutas y verduras para la semana.',
    explanation:
      'Los elementos de una enumeración se separan con comas; antes de la «y» final no se usa coma.',
    socraticClue: 'Contá los elementos de la lista: ¿cuántas pausas necesitás entre ellos?',
  },
  {
    id: 'pun-punctuate-interrogacion',
    level: 'A1',
    type: 'punctuate',
    focus: 'Signos de interrogación (apertura y cierre)',
    instruction: 'Añadí los signos de interrogación que faltan.',
    rawText: 'Cuándo llegás a casa',
    canonical: '¿Cuándo llegás a casa?',
    explanation:
      'En español las preguntas directas se abren con «¿» y se cierran con «?». El signo de apertura es obligatorio.',
    socraticClue: '¿Qué signo, que otras lenguas no usan, marca el comienzo de una pregunta en español?',
  },
  {
    id: 'pun-punctuate-vocativo',
    level: 'B1',
    type: 'punctuate',
    focus: 'Coma del vocativo',
    instruction: 'Puntuá la oración para aislar el nombre de la persona a la que se habla.',
    rawText: 'María pasame la sal por favor',
    canonical: 'María, pasame la sal, por favor.',
    explanation:
      'El vocativo (la persona a la que nos dirigimos) se separa siempre con comas del resto de la oración.',
    socraticClue: '¿A quién le hablás en la oración? Ese nombre va aislado por comas.',
  },
  {
    id: 'pun-punctuate-inciso',
    level: 'B2',
    type: 'punctuate',
    focus: 'Coma de inciso explicativo',
    instruction: 'Marcá el inciso explicativo con la puntuación correspondiente.',
    rawText: 'Mi hermano que vive en Madrid vuelve el mes que viene',
    canonical: 'Mi hermano, que vive en Madrid, vuelve el mes que viene.',
    explanation:
      'El inciso explicativo (una aclaración que se puede quitar sin cambiar el sentido) va entre comas. Si fuera especificativo (distingue a un hermano de otros), no llevaría comas.',
    socraticClue: 'Si quitás «que vive en Madrid», ¿la oración sigue teniendo sentido? Entonces es un inciso.',
  },
  {
    id: 'pun-punctuate-dospuntos',
    level: 'B2',
    type: 'punctuate',
    focus: 'Dos puntos antes de enumeración',
    instruction: 'Insertá los dos puntos y las comas necesarias.',
    rawText: 'Necesitamos tres cosas tiempo dinero y organización',
    canonical: 'Necesitamos tres cosas: tiempo, dinero y organización.',
    explanation:
      'Los dos puntos anuncian una enumeración o una consecuencia de lo dicho antes.',
    socraticClue: '¿Qué signo anuncia que a continuación viene una lista de esas «tres cosas»?',
  },
  {
    id: 'pun-punctuate-puntoycoma',
    level: 'C1',
    type: 'punctuate',
    focus: 'Punto y coma entre oraciones relacionadas',
    instruction: 'Elegí la puntuación que enlace las dos ideas manteniendo su relación.',
    rawText:
      'Unos preferían quedarse en casa otros querían salir a pesar de la lluvia',
    canonical:
      'Unos preferían quedarse en casa; otros querían salir, a pesar de la lluvia.',
    explanation:
      'El punto y coma separa dos oraciones independientes pero estrechamente relacionadas, con más pausa que la coma y menos que el punto.',
    socraticClue: '¿Las dos ideas son frases completas relacionadas? El punto y coma las une sin cortarlas del todo.',
  },

  /* ---------- COMPARAR ---------- */
  {
    id: 'pun-compare-conector',
    level: 'B1',
    type: 'compare',
    focus: 'Coma que aísla el conector',
    instruction: '¿Cuál de las dos versiones comunica mejor la intención?',
    options: [
      {
        text: 'No estudió nada; por lo tanto, no aprobó el examen.',
        isBest: true,
        note: 'El conector consecutivo queda bien delimitado: la relación causa→consecuencia es clara.',
      },
      {
        text: 'No estudió nada por lo tanto no aprobó el examen.',
        isBest: false,
        note: 'Sin puntuación, el conector se diluye y la lectura se vuelve confusa.',
      },
    ],
    explanation:
      'Los conectores consecutivos («por lo tanto», «por consiguiente») se aíslan con comas y suelen ir precedidos de punto y coma.',
    socraticClue: 'Leé ambas en voz alta: ¿en cuál se oye la pausa lógica del razonamiento?',
  },
  {
    id: 'pun-compare-inciso',
    level: 'B2',
    type: 'compare',
    focus: 'Coma especificativa vs. explicativa',
    instruction: 'Ambas son correctas pero significan cosas distintas. ¿Cuál dice que TODOS los alumnos aprobaron?',
    options: [
      {
        text: 'Los alumnos, que estudiaron, aprobaron.',
        isBest: true,
        note: 'Con comas es explicativa: todos estudiaron y todos aprobaron.',
      },
      {
        text: 'Los alumnos que estudiaron aprobaron.',
        isBest: false,
        note: 'Sin comas es especificativa: solo aprobaron los que estudiaron (los otros no).',
      },
    ],
    explanation:
      'La presencia o ausencia de comas en una relativa cambia el significado: explicativa (con comas, se aplica a todos) frente a especificativa (sin comas, selecciona un subgrupo).',
    socraticClue: '¿La relativa aclara algo de todo el grupo o distingue un subgrupo dentro de él?',
  },
  {
    id: 'pun-compare-coma-sujeto',
    level: 'B1',
    type: 'compare',
    focus: 'No separar sujeto y verbo con coma',
    instruction: '¿Cuál está correctamente puntuada?',
    options: [
      {
        text: 'Los estudiantes de intercambio visitaron el museo.',
        isBest: true,
        note: 'El sujeto y el verbo nunca se separan con una sola coma.',
      },
      {
        text: 'Los estudiantes de intercambio, visitaron el museo.',
        isBest: false,
        note: 'Error frecuente: una coma sola entre el sujeto y su verbo es incorrecta.',
      },
    ],
    explanation:
      'No se pone coma entre el sujeto y el verbo, por largo que sea el sujeto (salvo que se abra y cierre un inciso con dos comas).',
    socraticClue: '¿Quién realiza la acción y cuál es el verbo? ¿Debería haber una pausa entre ambos?',
  },

  /* ---------- EDICIÓN ---------- */
  {
    id: 'pun-edit-mixto',
    level: 'B2',
    type: 'edit',
    focus: 'Corrección integral de un párrafo',
    instruction:
      'Este texto tiene errores de puntuación. Reescribilo correctamente.',
    brokenText:
      'Cuando llegamos a la ciudad, estaba lloviendo por eso decidimos entrar a un café. pedimos dos cafés y esperamos que escampara',
    fixedText:
      'Cuando llegamos a la ciudad, estaba lloviendo; por eso decidimos entrar a un café. Pedimos dos cafés y esperamos que escampara.',
    explanation:
      'Se corrige: punto y coma antes del conector «por eso», mayúscula tras el punto y punto final.',
    socraticClue: 'Revisá cada pausa: ¿hay un conector sin aislar? ¿Falta una mayúscula después de un punto?',
  },
  {
    id: 'pun-edit-dialogo',
    level: 'B1',
    type: 'edit',
    focus: 'Signos de exclamación e interrogación',
    instruction: 'Corregí los signos de apertura y cierre en este diálogo.',
    brokenText: 'Qué alegría verte! No sabía que venías, cuándo llegaste?',
    fixedText: '¡Qué alegría verte! No sabía que venías. ¿Cuándo llegaste?',
    explanation:
      'Cada exclamación e interrogación exige su signo de apertura (¡ / ¿). Además, la segunda oración empieza pregunta nueva tras punto.',
    socraticClue: '¿Cada signo de cierre (! o ?) tiene su pareja de apertura al comienzo del enunciado?',
  },
];
