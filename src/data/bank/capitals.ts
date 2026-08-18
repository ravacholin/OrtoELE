import { CapitalsExercise } from '../../types';

/**
 * Módulo MAYÚSCULAS (§25) — corrección determinista por tramos MCER.
 * `rawText` y `correctedText` difieren ÚNICAMENTE en mayúsculas/minúsculas
 * (mismos caracteres, misma puntuación), de modo que la validación es
 * verificable token a token sin ninguna inferencia.
 */
export const CAPITALS_EXERCISES: CapitalsExercise[] = [
  /* ---------- A1-A2: nombres, países, ciudades, personas ---------- */
  {
    id: 'cap-a1-nombres',
    level: 'A1',
    tier: 'A1-A2',
    focus: 'Nombres propios y de lugar',
    instruction: 'Corregí las mayúsculas de esta oración.',
    rawText: 'mi amiga ana vive en méxico y estudia en la universidad.',
    correctedText: 'Mi amiga Ana vive en México y estudia en la universidad.',
    targets: [
      { wrong: 'mi', right: 'Mi', reason: 'Mayúscula inicial de oración.' },
      { wrong: 'ana', right: 'Ana', reason: 'Nombre propio de persona.' },
      { wrong: 'méxico', right: 'México', reason: 'Nombre propio de país.' },
    ],
    explanation:
      'Van con mayúscula: el inicio de la oración, los nombres de personas y los nombres de países y ciudades. «Universidad» aquí es común (no es el nombre de una institución concreta).',
    socraticClue: '¿Cuáles de estas palabras nombran a una persona o a un lugar concreto?',
  },
  {
    id: 'cap-a2-dias-idiomas',
    level: 'A2',
    tier: 'A1-A2',
    focus: 'Minúscula en días, meses e idiomas',
    instruction: 'Corregí las mayúsculas: recordá qué se escribe en minúscula en español.',
    rawText: 'El Lunes tengo clase de Inglés y el Martes estudio Español.',
    correctedText: 'El lunes tengo clase de inglés y el martes estudio español.',
    targets: [
      { wrong: 'Lunes', right: 'lunes', reason: 'Los días de la semana van en minúscula.' },
      { wrong: 'Inglés', right: 'inglés', reason: 'Los idiomas van en minúscula.' },
      { wrong: 'Martes', right: 'martes', reason: 'Los días de la semana van en minúscula.' },
      { wrong: 'Español', right: 'español', reason: 'Los idiomas van en minúscula.' },
    ],
    explanation:
      'A diferencia del inglés o el alemán, en español los días, los meses y los idiomas se escriben con minúscula.',
    socraticClue: '¿Los días de la semana y los idiomas se escriben igual que en tu lengua materna?',
  },
  {
    id: 'cap-a2-ciudades',
    level: 'A2',
    tier: 'A1-A2',
    focus: 'Ciudades y gentilicios',
    instruction: 'Corregí solo lo que necesite mayúscula o minúscula.',
    rawText: 'los Argentinos de buenos aires viajan a montevideo en verano.',
    correctedText: 'Los argentinos de Buenos Aires viajan a Montevideo en verano.',
    targets: [
      { wrong: 'los', right: 'Los', reason: 'Mayúscula inicial de oración.' },
      { wrong: 'Argentinos', right: 'argentinos', reason: 'Los gentilicios van en minúscula.' },
      { wrong: 'buenos aires', right: 'Buenos Aires', reason: 'Ciudad: ambas palabras del nombre propio con mayúscula.' },
      { wrong: 'montevideo', right: 'Montevideo', reason: 'Nombre propio de ciudad.' },
    ],
    explanation:
      'Las ciudades llevan mayúscula (en los nombres compuestos, cada palabra significativa), pero los gentilicios («argentinos», «uruguayos») van en minúscula.',
    socraticClue: '¿Qué diferencia hay entre el nombre de un lugar y el nombre de sus habitantes?',
  },

  /* ---------- B1-B2: instituciones, cargos, acontecimientos ---------- */
  {
    id: 'cap-b1-instituciones',
    level: 'B1',
    tier: 'B1-B2',
    focus: 'Instituciones vs. nombres comunes',
    instruction: 'Corregí las mayúsculas de instituciones y cargos.',
    rawText:
      'El presidente habló ante el congreso de la nación sobre el nuevo ministerio de educación.',
    correctedText:
      'El presidente habló ante el Congreso de la Nación sobre el nuevo Ministerio de Educación.',
    targets: [
      { wrong: 'congreso de la nación', right: 'Congreso de la Nación', reason: 'Nombre propio de institución.' },
      { wrong: 'ministerio de educación', right: 'Ministerio de Educación', reason: 'Nombre propio de organismo oficial.' },
    ],
    explanation:
      'Los nombres oficiales de instituciones y organismos llevan mayúscula en sus palabras significativas. En cambio, «presidente» como cargo genérico va en minúscula.',
    socraticClue: '¿«Congreso de la Nación» nombra una institución concreta o una idea general?',
  },
  {
    id: 'cap-b2-acontecimientos',
    level: 'B2',
    tier: 'B1-B2',
    focus: 'Acontecimientos históricos',
    instruction: 'Corregí las mayúsculas de los acontecimientos y periodos.',
    rawText:
      'La revolución francesa transformó europa; después llegó la revolución industrial.',
    correctedText:
      'La Revolución Francesa transformó Europa; después llegó la Revolución Industrial.',
    targets: [
      { wrong: 'revolución francesa', right: 'Revolución Francesa', reason: 'Acontecimiento histórico con nombre propio.' },
      { wrong: 'europa', right: 'Europa', reason: 'Nombre propio de continente.' },
      { wrong: 'revolución industrial', right: 'Revolución Industrial', reason: 'Acontecimiento histórico con nombre propio.' },
    ],
    explanation:
      'Los nombres de acontecimientos históricos relevantes se escriben con mayúscula inicial en sus palabras significativas.',
    socraticClue: '¿«Revolución Francesa» es un hecho concreto con nombre propio o una revolución cualquiera?',
  },

  /* ---------- C1-C2: usos discursivos, títulos, convenciones ---------- */
  {
    id: 'cap-c1-titulos',
    level: 'C1',
    tier: 'C1-C2',
    focus: 'Títulos de obras',
    instruction: 'Corregí la mayúscula según la convención española de títulos.',
    rawText: 'Leí Cien Años De Soledad y la Sombra Del Viento el mismo verano.',
    correctedText: 'Leí Cien años de soledad y La sombra del viento el mismo verano.',
    targets: [
      { wrong: 'Cien Años De Soledad', right: 'Cien años de soledad', reason: 'En español solo la primera palabra del título lleva mayúscula (y los nombres propios).' },
      { wrong: 'la Sombra Del Viento', right: 'La sombra del viento', reason: 'Solo la primera palabra del título va con mayúscula.' },
    ],
    explanation:
      'A diferencia del inglés, en los títulos de obras en español solo se escribe con mayúscula la primera palabra (y los nombres propios que contenga).',
    socraticClue: '¿En español se ponen en mayúscula todas las palabras del título, como en inglés, o solo la primera?',
  },
  {
    id: 'cap-c2-discursivo',
    level: 'C2',
    tier: 'C1-C2',
    focus: 'Mayúscula tras dos puntos y usos discursivos',
    instruction: 'Corregí las mayúsculas según las convenciones del discurso.',
    rawText:
      'estimada directora: Le escribo para informarle que el Departamento aprobó la propuesta.',
    correctedText:
      'Estimada directora: le escribo para informarle que el departamento aprobó la propuesta.',
    targets: [
      { wrong: 'estimada', right: 'Estimada', reason: 'Mayúscula inicial del texto.' },
      { wrong: 'Le', right: 'le', reason: 'Tras los dos puntos de un saludo de carta se sigue en minúscula si continúa la misma oración... salvo la fórmula de encabezado; aquí continúa el cuerpo en minúscula.' },
      { wrong: 'Departamento', right: 'departamento', reason: 'Usado como nombre común genérico, va en minúscula.' },
    ],
    explanation:
      'En una carta, tras los dos puntos del saludo el cuerpo puede iniciarse en minúscula cuando continúa la idea; «departamento» como sustantivo común no lleva mayúscula.',
    socraticClue: '¿«Departamento» nombra aquí una institución concreta o funciona como palabra común?',
  },
];
