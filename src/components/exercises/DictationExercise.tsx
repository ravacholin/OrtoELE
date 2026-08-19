import React, { useMemo, useState } from 'react';
import { DictationItem } from '../../types';
import { alignDictation, DictationDiffToken } from '../../utils/dictationAlignment';
import { speechService } from '../../utils/speech';
import { Volume2 } from 'lucide-react';
import { BaseExerciseProps, CheckButton, ContinueButton, FeedbackBox, HintReveal, verdictIsSuccess } from './shared';

interface Props extends BaseExerciseProps {
  dictation: DictationItem;
  isLast?: boolean;
}

const STATUS_STYLE: Record<DictationDiffToken['status'], { cls: string; tag?: string }> = {
  correct: { cls: 'text-emerald-300' },
  accent: { cls: 'text-amber-300 underline decoration-amber-500/60 decoration-dotted underline-offset-4', tag: 'tilde' },
  grapheme: { cls: 'text-rose-300 underline decoration-rose-500/60 decoration-wavy underline-offset-4', tag: 'grafía' },
  wrong: { cls: 'text-rose-400 line-through decoration-rose-500/70', tag: 'palabra' },
  missing: { cls: 'text-sky-300 border border-dashed border-sky-700/70 px-1', tag: 'faltó' },
  extra: { cls: 'text-neutral-500 line-through decoration-neutral-600', tag: 'sobra' },
};

/** Diff visual token a token de la transcripción frente al dictado. */
const DictationDiff: React.FC<{ tokens: DictationDiffToken[] }> = ({ tokens }) => (
  <div className="border border-neutral-800 bg-neutral-900/60 p-3">
    <span className="text-[10px] uppercase text-neutral-500 font-mono block mb-2">Tu transcripción, palabra por palabra</span>
    <p className="text-base font-sans leading-loose flex flex-wrap gap-x-1.5 gap-y-2 items-baseline">
      {tokens.map((t, i) => {
        const style = STATUS_STYLE[t.status];
        // Qué texto mostrar: lo escrito, salvo en omisiones (se muestra lo que faltó).
        const display = t.status === 'missing' ? t.expected : t.typed;
        const title =
          t.status === 'grapheme' || t.status === 'wrong'
            ? `deberías escribir «${t.expected}»`
            : t.status === 'accent'
              ? `con tilde: «${t.expected}»`
              : undefined;
        return (
          <span key={i} className="inline-flex items-baseline gap-1" title={title}>
            <span className={style.cls}>{display}</span>
            {style.tag && (
              <span className="text-[9px] uppercase font-mono text-neutral-500 tracking-wider">{style.tag}</span>
            )}
          </span>
        );
      })}
    </p>
  </div>
);

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

  const alignment = useMemo(() => alignDictation(typed, dictation.text), [typed, dictation.text]);
  const success = verdictIsSuccess(alignment.verdict);
  // La calidad SRS proviene de la alineación; se baja un punto si se usaron pistas.
  const quality = Math.max(1, hints > 0 && alignment.quality > 1 ? alignment.quality - 1 : alignment.quality);

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
          <FeedbackBox verdict={alignment.verdict} message={alignment.summary} />
          <DictationDiff tokens={alignment.tokens} />
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
            onClick={() => onResult({ correct: success, hints, quality })}
          />
        )}
      </div>
    </div>
  );
};
