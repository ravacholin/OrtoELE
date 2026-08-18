import React, { useMemo, useState } from 'react';
import { OrthoWordItem } from '../../types';
import { generateAccentPlacement, stripTildes } from '../../utils/proceduralEngine';
import { speechService } from '../../utils/speech';
import { Volume2 } from 'lucide-react';
import { BaseExerciseProps, boolToQuality, CheckButton, ContinueButton, FeedbackBox, HintReveal } from './shared';

interface Props extends BaseExerciseProps {
  item: OrthoWordItem;
  isLast?: boolean;
}

const ACCENT_LABEL: Record<string, string> = {
  aguda: 'aguda',
  llana: 'llana (grave)',
  esdrújula: 'esdrújula',
  sobresdrújula: 'sobresdrújula',
};

export const AccentPlacementExercise: React.FC<Props> = ({ item, onResult, isLast }) => {
  const ex = useMemo(() => generateAccentPlacement(item), [item]);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [hints, setHints] = useState(0);
  const [hintShown, setHintShown] = useState(false);

  const correct = picked === ex.stressedIndex;
  // Se muestran las sílabas sin tilde para no revelar la sílaba tónica.
  const strippedSyllables = ex.syllables.map(stripTildes);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-sans text-neutral-300 leading-relaxed">
          ¿En qué sílaba recae el golpe de voz (la sílaba tónica)?
        </p>
        <button
          onClick={() => speechService.speakSyllables(strippedSyllables)}
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-amber-300 shrink-0"
        >
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span>Escuchar</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {strippedSyllables.map((syll, i) => {
          const isPicked = picked === i;
          const isStressed = ex.stressedIndex === i;
          const stateCls = checked
            ? isStressed
              ? 'border-emerald-700 bg-emerald-950/40 text-emerald-300'
              : isPicked
                ? 'border-rose-800 bg-rose-950/40 text-rose-300'
                : 'border-neutral-800 bg-neutral-950 text-neutral-500'
            : isPicked
              ? 'border-neutral-100 bg-neutral-900 text-neutral-100'
              : 'border-neutral-800 bg-neutral-950 text-neutral-200 hover:border-neutral-600';
          return (
            <React.Fragment key={i}>
              <button
                disabled={checked}
                onClick={() => setPicked(i)}
                className={`px-4 py-3 border text-lg font-mono transition-colors ${stateCls}`}
              >
                {syll}
              </button>
              {i < strippedSyllables.length - 1 && <span className="text-neutral-600">·</span>}
            </React.Fragment>
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
          message={
            correct
              ? `¡Correcto! «${ex.word}» es ${ACCENT_LABEL[ex.accentClass] || ex.accentClass}.`
              : `La sílaba tónica es «${strippedSyllables[ex.stressedIndex]}». Se escribe «${ex.word}».`
          }
          rule={`${ex.explanation}${ex.needsWrittenAccent ? ' Esta palabra lleva tilde.' : ' Esta palabra no lleva tilde.'}`}
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
