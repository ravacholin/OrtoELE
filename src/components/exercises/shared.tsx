import React from 'react';
import { Lightbulb, ArrowRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { AnswerVerdict } from '../../utils/proceduralEngine';

export interface ExerciseResult {
  correct: boolean;
  hints: number;
  quality: number; // 1-5 para srsManager.recordAttempt
}

export interface BaseExerciseProps {
  seed: string;
  onResult: (r: ExerciseResult) => void;
}

/** Mapea un veredicto tolerante a la calidad SRS (1-5). Un "casi" por
 *  tilde cuenta como acierto flojo (3), no como fallo. */
export function verdictToQuality(v: AnswerVerdict, hints: number): number {
  if (v === 'correct') return hints > 0 ? 4 : 5;
  if (v === 'accent-only') return 3;
  return 1;
}

export function boolToQuality(correct: boolean, hints: number): number {
  return correct ? (hints > 0 ? 4 : 5) : 1;
}

/** Un "casi por tilde" se considera acierto (con matiz) a efectos de conteo. */
export function verdictIsSuccess(v: AnswerVerdict): boolean {
  return v === 'correct' || v === 'accent-only';
}

export const HintReveal: React.FC<{
  clue: string;
  revealed: boolean;
  onReveal: () => void;
  disabled?: boolean;
}> = ({ clue, revealed, onReveal, disabled }) => {
  if (revealed) {
    return (
      <div className="flex items-start gap-2 text-xs text-amber-200/90 bg-amber-950/20 border border-amber-900/50 p-3 font-sans">
        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>{clue}</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onReveal}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-300 disabled:opacity-40 disabled:hover:text-neutral-400 transition-colors"
    >
      <Lightbulb className="w-3.5 h-3.5" />
      <span>Ver pista</span>
    </button>
  );
};

export const FeedbackBox: React.FC<{
  verdict: AnswerVerdict;
  message: string;
  rule?: string;
}> = ({ verdict, message, rule }) => {
  const tone =
    verdict === 'correct'
      ? { border: 'border-emerald-800', bg: 'bg-emerald-950/30', text: 'text-emerald-300', Icon: CheckCircle2 }
      : verdict === 'accent-only'
        ? { border: 'border-amber-800', bg: 'bg-amber-950/30', text: 'text-amber-300', Icon: AlertTriangle }
        : { border: 'border-rose-900', bg: 'bg-rose-950/30', text: 'text-rose-300', Icon: XCircle };
  const { Icon } = tone;
  return (
    <div className={`border ${tone.border} ${tone.bg} p-4 space-y-2 animate-fadeIn`}>
      <div className={`flex items-center gap-2 text-sm font-bold ${tone.text}`}>
        <Icon className="w-4 h-4" />
        <span>{message}</span>
      </div>
      {rule && <p className="text-xs text-neutral-300 font-sans leading-relaxed">{rule}</p>}
    </div>
  );
};

export const CheckButton: React.FC<{ onClick: () => void; disabled: boolean; label?: string }> = ({
  onClick,
  disabled,
  label = 'Comprobar',
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold px-6 py-2.5 text-xs tracking-wider transition-colors"
  >
    {label}
  </button>
);

export const ContinueButton: React.FC<{ onClick: () => void; isLast?: boolean }> = ({ onClick, isLast }) => (
  <button
    onClick={onClick}
    autoFocus
    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold px-6 py-2.5 text-xs tracking-wider transition-colors"
  >
    <span>{isLast ? 'Ver resultados' : 'Continuar'}</span>
    <ArrowRight className="w-3.5 h-3.5" />
  </button>
);
