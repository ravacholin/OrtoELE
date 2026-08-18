import React, { useMemo, useState } from 'react';
import { SessionPlan, StepResult, OrthoCategory } from '../types';
import { ORTHOGRAPHY_WORD_BANK, MINIMAL_CONTRASTS, DICTATION_ITEMS } from '../data/orthographyBank';
import { srsManager } from '../utils/srsEngine';
import { X, Home, Target, CheckCircle2, Trophy } from 'lucide-react';
import { SpellingChoiceExercise } from './exercises/SpellingChoiceExercise';
import { FillGraphemeExercise } from './exercises/FillGraphemeExercise';
import { ErrorSpottingExercise } from './exercises/ErrorSpottingExercise';
import { AccentPlacementExercise } from './exercises/AccentPlacementExercise';
import { ContrastExercise } from './exercises/ContrastExercise';
import { DictationExercise } from './exercises/DictationExercise';
import { ExerciseResult } from './exercises/shared';

const CATEGORY_LABEL: Record<OrthoCategory, string> = {
  accentuation: 'Acentuación',
  spellings: 'Grafías',
  punctuation: 'Puntuación',
  morphology: 'Morfología',
  capitals: 'Mayúsculas',
};

const REASON_LABEL: Record<string, string> = {
  due: 'Repaso vencido',
  mistake: 'Error recurrente',
  new: 'Nuevo',
  challenge: 'Desafío',
};

const bankById = new Map(ORTHOGRAPHY_WORD_BANK.map((w) => [w.id, w]));

interface SessionRunnerProps {
  plan: SessionPlan;
  onExit: () => void;
  onProfileChange?: () => void;
  onComplete?: (plan: SessionPlan) => void;
  onStartMistakeReview?: (wordIds: string[]) => void;
}

export const SessionRunner: React.FC<SessionRunnerProps> = ({
  plan,
  onExit,
  onProfileChange,
  onComplete,
  onStartMistakeReview,
}) => {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<StepResult[]>([]);
  const [finished, setFinished] = useState(false);

  const total = plan.steps.length;
  const step = plan.steps[index];

  const handleResult = (r: ExerciseResult) => {
    if (!step) return;

    if (step.wordId) {
      srsManager.recordAttempt(step.wordId, r.quality, r.hints);
    }

    const stepResult: StepResult = {
      stepId: step.id,
      wordId: step.wordId,
      category: step.category,
      label: step.label,
      correct: r.correct,
      hints: r.hints,
      quality: r.quality,
    };
    const nextResults = [...results, stepResult];
    setResults(nextResults);

    if (index + 1 >= total) {
      srsManager.completeSession();
      onProfileChange?.();
      onComplete?.(plan);
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  // ---- Estado vacío: la sesión no pudo armar pasos ----
  if (total === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-5">
        <p className="text-sm font-sans text-neutral-300">
          No hay ítems disponibles para esta sesión ahora mismo. Probá con otra categoría o volvé más tarde.
        </p>
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-5 py-2.5 text-xs tracking-wider transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>VOLVER AL INICIO</span>
        </button>
      </div>
    );
  }

  // ---- Pantalla de resultados ----
  if (finished) {
    const correctCount = results.filter((r) => r.correct).length;
    const accuracy = Math.round((correctCount / Math.max(1, results.length)) * 100);
    const missed = results.filter((r) => !r.correct);
    const missedWordIds = missed.filter((r) => r.wordId).map((r) => r.wordId!) as string[];

    // Categorías más flojas de esta sesión.
    const byCat = new Map<OrthoCategory, { total: number; wrong: number }>();
    results.forEach((r) => {
      const c = byCat.get(r.category) || { total: 0, wrong: 0 };
      c.total += 1;
      if (!r.correct) c.wrong += 1;
      byCat.set(r.category, c);
    });
    const weakCats = Array.from(byCat.entries())
      .filter(([, v]) => v.wrong > 0)
      .sort((a, b) => b[1].wrong - a[1].wrong);

    return (
      <div className="max-w-2xl mx-auto py-10 px-4 space-y-6 animate-fadeIn">
        <div className="border border-neutral-800 bg-neutral-950 p-8 space-y-6 text-center">
          <div className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-amber-400">
            {accuracy >= 80 ? <Trophy className="w-7 h-7 text-emerald-400" /> : <CheckCircle2 className="w-7 h-7" />}
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">SESIÓN COMPLETADA</span>
            <h2 className="text-2xl font-bold font-sans text-neutral-100">{plan.title}</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-900 p-3 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">EJERCICIOS</span>
              <span className="text-2xl font-bold text-neutral-100 font-mono">{results.length}</span>
            </div>
            <div className="bg-neutral-900 p-3 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">ACIERTOS</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">{correctCount}</span>
            </div>
            <div className="bg-neutral-900 p-3 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">PRECISIÓN</span>
              <span className="text-2xl font-bold text-neutral-100 font-mono">{accuracy}%</span>
            </div>
          </div>

          {weakCats.length > 0 && (
            <div className="text-left space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">A reforzar</span>
              <div className="flex flex-wrap gap-2">
                {weakCats.map(([cat, v]) => (
                  <span key={cat} className="text-xs font-mono border border-amber-900/60 bg-amber-950/20 text-amber-300 px-2.5 py-1">
                    {CATEGORY_LABEL[cat]} · {v.wrong}/{v.total}
                  </span>
                ))}
              </div>
            </div>
          )}

          {missed.length > 0 && (
            <div className="text-left space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">Fallaste en</span>
              <div className="flex flex-wrap gap-1.5">
                {missed.map((r, i) => (
                  <span key={`${r.stepId}-${i}`} className="text-xs font-mono text-rose-300 line-through">
                    {r.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {missedWordIds.length > 0 && onStartMistakeReview && (
              <button
                onClick={() => onStartMistakeReview(missedWordIds)}
                className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold px-5 py-2.5 text-xs tracking-wider transition-colors"
              >
                <Target className="w-3.5 h-3.5" />
                <span>REPASAR LOS {missedWordIds.length} FALLOS</span>
              </button>
            )}
            <button
              onClick={onExit}
              className="flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-5 py-2.5 text-xs tracking-wider transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>VOLVER AL INICIO</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Ejercicio activo ----
  const isLast = index + 1 >= total;
  const progressPct = Math.round((index / total) * 100);

  const renderExercise = () => {
    const commonKey = step.id;
    switch (step.kind) {
      case 'spelling-choice': {
        const item = bankById.get(step.wordId || '');
        if (!item) break;
        return <SpellingChoiceExercise key={commonKey} item={item} seed={step.id} onResult={handleResult} isLast={isLast} />;
      }
      case 'fill-grapheme': {
        const item = bankById.get(step.wordId || '');
        if (!item) break;
        return <FillGraphemeExercise key={commonKey} item={item} seed={step.id} onResult={handleResult} isLast={isLast} />;
      }
      case 'error-spotting': {
        const item = bankById.get(step.wordId || '');
        if (!item) break;
        return <ErrorSpottingExercise key={commonKey} item={item} seed={step.id} onResult={handleResult} isLast={isLast} />;
      }
      case 'accent-placement': {
        const item = bankById.get(step.wordId || '');
        if (!item) break;
        return <AccentPlacementExercise key={commonKey} item={item} seed={step.id} onResult={handleResult} isLast={isLast} />;
      }
      case 'contrast': {
        const c = MINIMAL_CONTRASTS.find((x) => x.id === step.contrastId);
        if (!c) break;
        return <ContrastExercise key={commonKey} contrast={c} seed={step.id} onResult={handleResult} isLast={isLast} />;
      }
      case 'dictation': {
        const d = DICTATION_ITEMS.find((x) => x.id === step.dictationId);
        if (!d) break;
        return <DictationExercise key={commonKey} dictation={d} seed={step.id} onResult={handleResult} isLast={isLast} />;
      }
    }
    // Respaldo defensivo: dato faltante → saltar el paso.
    return (
      <div className="text-center py-8 space-y-3">
        <p className="text-xs text-neutral-500 font-sans">Ítem no disponible, pasando al siguiente…</p>
        <button
          onClick={() => handleResult({ correct: true, hints: 0, quality: 4 })}
          className="text-xs underline text-neutral-400 hover:text-neutral-200"
        >
          Continuar
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 space-y-5">
      {/* Barra superior: progreso + salir */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-400">
            {plan.title} · {index + 1} / {total}
          </span>
          <button onClick={onExit} className="flex items-center gap-1 text-neutral-500 hover:text-neutral-200 transition-colors">
            <X className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
        <div className="h-1.5 w-full bg-neutral-900 border border-neutral-800 overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Tarjeta del ejercicio */}
      <div className="border border-neutral-800 bg-neutral-950 p-5 sm:p-7 space-y-5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
            {CATEGORY_LABEL[step.category]}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 border border-neutral-800 text-neutral-500">
            {REASON_LABEL[step.reason] || step.reason}
          </span>
        </div>
        {renderExercise()}
      </div>
    </div>
  );
};
