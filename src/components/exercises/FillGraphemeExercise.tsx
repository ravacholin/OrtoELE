import React, { useMemo, useState } from 'react';
import { OrthoWordItem } from '../../types';
import { generateSpellingChoice, tryGenerateFillGrapheme } from '../../utils/proceduralEngine';
import { BaseExerciseProps, boolToQuality, CheckButton, ContinueButton, FeedbackBox, HintReveal } from './shared';
import { SpellingChoiceExercise } from './SpellingChoiceExercise';

interface Props extends BaseExerciseProps {
  item: OrthoWordItem;
  isLast?: boolean;
}

export const FillGraphemeExercise: React.FC<Props> = ({ item, seed, onResult, isLast }) => {
  const ex = useMemo(() => tryGenerateFillGrapheme(item, seed), [item, seed]);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [hints, setHints] = useState(0);
  const [hintShown, setHintShown] = useState(false);

  // Respaldo: si el ítem no admite este formato, usar elección de forma.
  if (!ex) {
    return <SpellingChoiceExercise item={item} seed={seed} onResult={onResult} isLast={isLast} />;
  }

  const correct = selected === ex.correctLetter;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-sans text-neutral-300 leading-relaxed">
          Completá la letra que falta:
        </p>
        <p className="mt-2 text-2xl font-mono tracking-wide text-neutral-100">{ex.maskedWord}</p>
        {ex.contextSentence && ex.contextSentence !== ex.maskedWord && (
          <p className="mt-2 text-sm font-sans text-neutral-400 italic">«{ex.contextSentence}»</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {ex.options.map((opt) => {
          const isPicked = selected === opt;
          const showState = checked && (opt === ex.correctLetter ? 'correct' : isPicked ? 'wrong' : '');
          return (
            <button
              key={opt}
              disabled={checked}
              onClick={() => setSelected(opt)}
              className={`w-14 h-14 border text-xl font-mono uppercase transition-colors ${
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

      {checked && (
        <FeedbackBox
          verdict={correct ? 'correct' : 'wrong'}
          message={correct ? `¡Correcto! Se escribe «${ex.word}».` : `Se escribe «${ex.word}».`}
          rule={ex.explanation}
        />
      )}

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
