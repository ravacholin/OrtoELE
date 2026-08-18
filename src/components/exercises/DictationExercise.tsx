import React, { useState } from 'react';
import { DictationItem } from '../../types';
import { evaluateAnswer } from '../../utils/proceduralEngine';
import { speechService } from '../../utils/speech';
import { Volume2 } from 'lucide-react';
import { BaseExerciseProps, verdictToQuality, verdictIsSuccess, CheckButton, ContinueButton, FeedbackBox, HintReveal } from './shared';

interface Props extends BaseExerciseProps {
  dictation: DictationItem;
  isLast?: boolean;
}

export const DictationExercise: React.FC<Props> = ({ dictation, onResult, isLast }) => {
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hints, setHints] = useState(0);
  const [hintShown, setHintShown] = useState(false);

  const rate = dictation.audioPacing === 'slow' ? 0.7 : dictation.audioPacing === 'syllabic' ? 0.6 : 0.9;

  const play = () => {
    setPlaying(true);
    speechService.speak(dictation.text, { rate, onEnd: () => setPlaying(false), onError: () => setPlaying(false) });
  };

  const evalResult = evaluateAnswer(typed, dictation.text);
  const success = verdictIsSuccess(evalResult.verdict);

  return (
    <div className="space-y-5">
      <div>
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono block">
          Dictado · {dictation.contextTopic}
        </span>
        <p className="mt-1 text-sm font-sans text-neutral-300">
          Escuchá y escribí exactamente lo que oís, con tildes y puntuación.
        </p>
      </div>

      <button
        onClick={play}
        className="flex items-center gap-2 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 px-5 py-3 text-sm font-mono transition-colors"
      >
        <Volume2 className={`w-5 h-5 ${playing ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
        <span>{playing ? 'Reproduciendo…' : 'Reproducir dictado'}</span>
      </button>

      <textarea
        value={typed}
        disabled={checked}
        onChange={(e) => setTyped(e.target.value)}
        rows={2}
        placeholder="Escribí lo que escuchaste…"
        className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-base font-sans text-neutral-100 focus:outline-none focus:border-neutral-400 disabled:opacity-70"
      />

      {!checked && (
        <HintReveal
          clue={dictation.hints?.[0] || 'Prestá atención a las grafías dudosas y a las tildes.'}
          revealed={hintShown}
          onReveal={() => {
            setHintShown(true);
            setHints((h) => h + 1);
          }}
        />
      )}

      {checked && (
        <div className="space-y-3">
          <FeedbackBox verdict={evalResult.verdict} message={evalResult.message} />
          <div className="border border-neutral-800 bg-neutral-900/60 p-3 text-sm font-sans">
            <span className="text-[10px] uppercase text-neutral-500 font-mono block mb-1">Texto correcto</span>
            <p className="text-neutral-100">{dictation.text}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        {!checked ? (
          <CheckButton onClick={() => setChecked(true)} disabled={typed.trim() === ''} />
        ) : (
          <ContinueButton
            isLast={isLast}
            onClick={() => onResult({ correct: success, hints, quality: verdictToQuality(evalResult.verdict, hints) })}
          />
        )}
      </div>
    </div>
  );
};
