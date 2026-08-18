import React, { useMemo, useState } from 'react';
import { OrthoWordItem } from '../../types';
import { generateSpellingChoice } from '../../utils/proceduralEngine';
import { BaseExerciseProps, boolToQuality, CheckButton, ContinueButton, FeedbackBox, HintReveal } from './shared';

interface Props extends BaseExerciseProps {
  item: OrthoWordItem;
  isLast?: boolean;
}

export const SpellingChoiceExercise: React.FC<Props> = ({ item, onResult, isLast }) => {
  const ex = useMemo(() => generateSpellingChoice(item), [item]);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [hints, setHints] = useState(0);
  const [hintShown, setHintShown] = useState(false);

  const correct = selected === ex.correct;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-sans text-neutral-300 leading-relaxed">{ex.prompt}</p>
        {ex.contextSentence && (
          <p className="mt-2 text-base font-sans text-neutral-100 italic">«{ex.contextSentence}»</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {ex.options.map((opt) => {
          const isPicked = selected === opt;
          const showState = checked && (opt === ex.correct ? 'correct' : isPicked ? 'wrong' : '');
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

      {checked && <FeedbackBox verdict={correct ? 'correct' : 'wrong'} message={correct ? '¡Correcto!' : `La forma correcta es «${ex.correct}».`} rule={ex.explanation} />}

      <div className="flex justify-end">
        {!checked ? (
          <CheckButton onClick={() => setChecked(true)} disabled={selected === null} />
        ) : (
          <ContinueButton isLast={isLast} onClick={() => onResult({ correct, hints, quality: boolToQuality(correct, hints) })} />
        )}
      </div>
    </div>
  );
};
