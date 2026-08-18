import React, { useMemo, useState } from 'react';
import { OrthoWordItem } from '../../types';
import { generateErrorSpotting } from '../../utils/proceduralEngine';
import { BaseExerciseProps, boolToQuality, CheckButton, ContinueButton, FeedbackBox, HintReveal } from './shared';

interface Props extends BaseExerciseProps {
  item: OrthoWordItem;
  isLast?: boolean;
}

const NO_ERROR = -2; // valor sentinel para "no hay errores"

export const ErrorSpottingExercise: React.FC<Props> = ({ item, seed, onResult, isLast }) => {
  const ex = useMemo(() => generateErrorSpotting(item, seed), [item, seed]);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [hints, setHints] = useState(0);
  const [hintShown, setHintShown] = useState(false);

  const correct = ex.hasError ? picked === ex.wrongIndex : picked === NO_ERROR;

  return (
    <div className="space-y-5">
      <p className="text-sm font-sans text-neutral-300 leading-relaxed">
        Tocá la palabra mal escrita. Si está todo bien, elegí «Sin errores».
      </p>

      <div className="flex flex-wrap gap-x-2 gap-y-3 text-lg font-sans leading-relaxed bg-neutral-900/40 border border-neutral-800 p-4">
        {ex.tokens.map((tok, i) => {
          const isPicked = picked === i;
          const isWrong = ex.wrongIndex === i;
          const stateCls = checked
            ? isWrong
              ? 'border-rose-700 bg-rose-950/40 text-rose-200'
              : isPicked
                ? 'border-amber-700 bg-amber-950/30 text-amber-200'
                : 'border-transparent text-neutral-300'
            : isPicked
              ? 'border-neutral-100 bg-neutral-800 text-neutral-100'
              : 'border-transparent text-neutral-200 hover:bg-neutral-800/60';
          return (
            <button
              key={i}
              disabled={checked}
              onClick={() => setPicked(i)}
              className={`px-1.5 py-0.5 border-b-2 rounded-sm transition-colors ${stateCls}`}
            >
              {tok}
            </button>
          );
        })}
      </div>

      <button
        disabled={checked}
        onClick={() => setPicked(NO_ERROR)}
        className={`px-4 py-2 text-xs border transition-colors ${
          picked === NO_ERROR
            ? checked
              ? ex.hasError
                ? 'border-rose-800 bg-rose-950/30 text-rose-300'
                : 'border-emerald-700 bg-emerald-950/40 text-emerald-300'
              : 'border-neutral-100 bg-neutral-900 text-neutral-100'
            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600'
        }`}
      >
        Sin errores
      </button>

      {!checked && (
        <HintReveal
          clue={ex.socraticClue}
          revealed={hintShown}
          onReveal={() => {
            setHintShown(true);
            setHints((h) => h + 1);
          }}
        />
      )}

      {checked && (
        <FeedbackBox
          verdict={correct ? 'correct' : 'wrong'}
          message={
            correct
              ? '¡Correcto!'
              : ex.hasError
                ? `Había un error: la forma correcta es «${ex.correctWord}».`
                : 'No había ningún error en la oración.'
          }
          rule={ex.explanation}
        />
      )}

      <div className="flex justify-end">
        {!checked ? (
          <CheckButton onClick={() => setChecked(true)} disabled={picked === null} />
        ) : (
          <ContinueButton isLast={isLast} onClick={() => onResult({ correct, hints, quality: boolToQuality(correct, hints) })} />
        )}
      </div>
    </div>
  );
};
