import React, { useMemo, useState } from 'react';
import { MinimalContrastSet } from '../../types';
import { buildContrastChallenge } from '../../utils/proceduralEngine';
import { BaseExerciseProps, boolToQuality, CheckButton, ContinueButton, FeedbackBox } from './shared';

interface Props extends BaseExerciseProps {
  contrast: MinimalContrastSet;
  isLast?: boolean;
}

export const ContrastExercise: React.FC<Props> = ({ contrast, onResult, isLast }) => {
  const ch = useMemo(() => buildContrastChallenge(contrast), [contrast]);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const correct = selected === ch.correct;

  return (
    <div className="space-y-5">
      <div>
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono block">
          Contraste mínimo · {contrast.title}
        </span>
        <p className="mt-1 text-base font-sans text-neutral-100 leading-relaxed">{ch.question}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {ch.options.map((opt) => {
          const isPicked = selected === opt;
          const showState = checked && (opt === ch.correct ? 'correct' : isPicked ? 'wrong' : '');
          return (
            <button
              key={opt}
              disabled={checked}
              onClick={() => setSelected(opt)}
              className={`px-4 py-3 border text-base font-mono transition-colors ${
                showState === 'correct'
                  ? 'border-emerald-700 bg-emerald-950/40 text-emerald-300'
                  : showState === 'wrong'
                    ? 'border-rose-800 bg-rose-950/40 text-rose-300'
                    : isPicked
                      ? 'border-neutral-100 bg-neutral-900 text-neutral-100'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-600'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {checked && (
        <FeedbackBox
          verdict={correct ? 'correct' : 'wrong'}
          message={correct ? '¡Correcto!' : `La forma correcta es «${ch.correct}».`}
          rule={ch.explanation}
        />
      )}

      <div className="flex justify-end">
        {!checked ? (
          <CheckButton onClick={() => setChecked(true)} disabled={selected === null} />
        ) : (
          <ContinueButton isLast={isLast} onClick={() => onResult({ correct, hints: 0, quality: boolToQuality(correct, 0) })} />
        )}
      </div>
    </div>
  );
};
