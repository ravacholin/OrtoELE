import { UserProfile, SrsItemState, OrthoCategory } from '../types';

/**
 * GAMIFICACIÓN HONESTA (Fase 3)
 * -----------------------------------------------------------------------
 * Logros derivados EXCLUSIVAMENTE de datos reales del estudiante (sesiones
 * completadas, palabras dominadas, racha, precisión sobre intentos reales,
 * categorías consolidadas y escape rooms resueltos). No hay puntos
 * inventados, ni experiencia ficticia, ni progreso sembrado: un usuario
 * nuevo ve todos los logros bloqueados con su progreso real en 0.
 *
 * Cada logro expone `current` / `target` para poder mostrar una barra de
 * progreso verificable, y `unlocked` = current >= target. Todo es una
 * función pura del perfil + los estados SRS: mismas entradas → mismo
 * resultado (determinista y auditable).
 */

export type AchievementTier = 'bronce' | 'plata' | 'oro';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  /** Nombre de icono de lucide-react (se resuelve en la UI). */
  icon: string;
  tier: AchievementTier;
  current: number;
  target: number;
  unit: string;
  unlocked: boolean;
}

const CATEGORY_LABEL: Record<OrthoCategory, string> = {
  accentuation: 'acentuación',
  spellings: 'grafías',
  punctuation: 'puntuación',
  morphology: 'morfología',
  capitals: 'mayúsculas',
};

function make(
  id: string,
  title: string,
  description: string,
  icon: string,
  tier: AchievementTier,
  current: number,
  target: number,
  unit: string,
): Achievement {
  const safeCurrent = Math.max(0, Math.round(current));
  return {
    id,
    title,
    description,
    icon,
    tier,
    current: Math.min(safeCurrent, target),
    target,
    unit,
    unlocked: safeCurrent >= target,
  };
}

/**
 * Calcula la lista completa de logros a partir de datos reales.
 * @param profile Perfil del usuario (contadores reales).
 * @param srsItems Estados SRS reales (para dominadas por categoría, etc.).
 */
export function computeAchievements(
  profile: UserProfile,
  srsItems: SrsItemState[],
): Achievement[] {
  const dominated = srsItems.filter((i) => i.state === 'DOMINADO');
  const totalAttempts = srsItems.reduce((acc, i) => acc + i.totalAttempts, 0);

  // Palabras que fallaste al menos una vez y hoy están estables o dominadas:
  // errores realmente reconvertidos (dato honesto, no una promesa).
  const recovered = srsItems.filter(
    (i) => i.mistakesCount > 0 && (i.state === 'ESTABLE' || i.state === 'DOMINADO'),
  ).length;

  // Categoría más consolidada por nº de palabras dominadas (solo si hay).
  const domByCat: Record<string, number> = {};
  dominated.forEach((i) => {
    domByCat[i.category] = (domByCat[i.category] || 0) + 1;
  });
  let bestCat: OrthoCategory | null = null;
  let bestCatCount = 0;
  (Object.keys(domByCat) as OrthoCategory[]).forEach((cat) => {
    if (domByCat[cat] > bestCatCount) {
      bestCatCount = domByCat[cat];
      bestCat = cat;
    }
  });

  const achievements: Achievement[] = [];

  // ---- Constancia (sesiones) ----
  achievements.push(
    make('primer-paso', 'Primer paso', 'Completá tu primera sesión de entrenamiento.', 'Footprints', 'bronce', profile.sessionsCompleted, 1, 'sesión'),
    make('rutina', 'En marcha', 'Completá 5 sesiones.', 'Activity', 'plata', profile.sessionsCompleted, 5, 'sesiones'),
    make('disciplina', 'Disciplina', 'Completá 20 sesiones.', 'Trophy', 'oro', profile.sessionsCompleted, 20, 'sesiones'),
  );

  // ---- Racha diaria ----
  achievements.push(
    make('racha-3', 'Racha encendida', 'Practicá 3 días seguidos.', 'Flame', 'bronce', profile.streakDays, 3, 'días'),
    make('racha-7', 'Semana firme', 'Practicá 7 días seguidos.', 'Flame', 'plata', profile.streakDays, 7, 'días'),
    make('racha-30', 'Hábito consolidado', 'Practicá 30 días seguidos.', 'CalendarCheck', 'oro', profile.streakDays, 30, 'días'),
  );

  // ---- Dominio léxico ----
  achievements.push(
    make('dominio-1', 'Primera dominada', 'Llevá 1 palabra al estado DOMINADO.', 'Star', 'bronce', profile.wordsDominated, 1, 'palabra'),
    make('dominio-10', 'Lexicón en forma', 'Dominá 10 palabras.', 'Sparkles', 'plata', profile.wordsDominated, 10, 'palabras'),
    make('dominio-40', 'Ortografía sólida', 'Dominá 40 palabras.', 'Award', 'oro', profile.wordsDominated, 40, 'palabras'),
  );

  // ---- Precisión (solo relevante con volumen real de intentos) ----
  // Se exige un mínimo de intentos para que el logro sea honesto: una
  // precisión del 100 % con 2 intentos no dice nada.
  const precisionForBadge = totalAttempts >= 20 ? profile.globalPrecision : 0;
  achievements.push(
    make('precision-80', 'Buen pulso', 'Alcanzá 80 % de precisión (con al menos 20 intentos).', 'Target', 'plata', precisionForBadge, 80, '%'),
    make('precision-92', 'Mano firme', 'Alcanzá 92 % de precisión (con al menos 20 intentos).', 'Crosshair', 'oro', precisionForBadge, 92, '%'),
  );

  // ---- Reconversión de errores ----
  achievements.push(
    make('recuperador', 'Errores reconvertidos', 'Estabilizá 5 palabras que antes fallaste.', 'RefreshCw', 'plata', recovered, 5, 'palabras'),
  );

  // ---- Volumen de práctica ----
  achievements.push(
    make('practica-100', 'Cien intentos', 'Acumulá 100 respuestas registradas.', 'Layers', 'bronce', totalAttempts, 100, 'intentos'),
  );

  // ---- Especialista por categoría (dinámico y honesto) ----
  if (bestCat && bestCatCount > 0) {
    achievements.push(
      make(
        `especialista-${bestCat}`,
        `Especialista en ${CATEGORY_LABEL[bestCat]}`,
        `Dominá 8 palabras de ${CATEGORY_LABEL[bestCat]} — tu categoría más fuerte.`,
        'BadgeCheck',
        'oro',
        bestCatCount,
        8,
        'palabras',
      ),
    );
  }

  // ---- Escape rooms ----
  if (profile.escapeRoomsCleared && profile.escapeRoomsCleared.length > 0) {
    achievements.push(
      make('escapista', 'Escapista', 'Resolvé tu primer escape ortográfico.', 'KeyRound', 'plata', profile.escapeRoomsCleared.length, 1, 'escape'),
    );
  }

  return achievements;
}

/** Resumen compacto para cabeceras: desbloqueados / total. */
export function summarizeAchievements(list: Achievement[]): { unlocked: number; total: number } {
  return { unlocked: list.filter((a) => a.unlocked).length, total: list.length };
}
