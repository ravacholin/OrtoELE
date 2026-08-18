import React, { useState } from 'react';
import { UserProfile, SrsItemState, OrthoWordItem } from '../types';
import { srsManager } from '../utils/srsEngine';
import { ORTHOGRAPHY_WORD_BANK } from '../data/orthographyBank';
import { RotateCcw, Volume2, ShieldCheck } from 'lucide-react';
import { speechService } from '../utils/speech';

interface SrsReviewViewProps {
  profile: UserProfile;
  onOpenCoach: (targetWord?: OrthoWordItem, sentence?: string) => void;
}

export const SrsReviewView: React.FC<SrsReviewViewProps> = ({ onOpenCoach }) => {
  // Cola real de repasos vencidos (respeta nextReviewDate / estado INCIERTO),
  // fijada al montar para que sea una sesión finita y estable.
  const [dueItems] = useState<SrsItemState[]>(() => srsManager.getDueReviewItems());

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const formatNextReview = (): string => {
    const items = Object.values(srsManager.getSrsItems());
    const future = items
      .map((i) => new Date(i.nextReviewDate).getTime())
      .filter((t) => !Number.isNaN(t) && t > Date.now())
      .sort((a, b) => a - b);
    if (future.length === 0) return '—';
    const days = Math.round((future[0] - Date.now()) / 86400000);
    if (days <= 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    return `En ${days} días`;
  };

  const currentItemState: SrsItemState | undefined = dueItems[currentIndex % Math.max(1, dueItems.length)];
  const currentWordBankItem: OrthoWordItem = ORTHOGRAPHY_WORD_BANK.find(w => w.id === currentItemState?.wordId) || {
    id: currentItemState?.wordId || '1',
    word: currentItemState?.word || 'palabra',
    syllables: [currentItemState?.word || 'palabra'],
    stressedSyllable: 0,
    accentType: 'llana',
    category: currentItemState?.category || 'spellings',
    subcategory: 'general',
    difficulty: 2,
    semanticField: 'General',
    frequency: 'high',
    commonErrors: [],
    confusableWith: [],
    examples: [{ sentence: `Observamos la forma gráfica correcta de ${currentItemState?.word || 'palabra'}.` }],
    l1Risk: ['inglés'],
    level: 'B1',
    rule: 'Consolidación de huella ortográfica en memoria a largo plazo.',
    socraticClues: {
      level1: '¿Dónde está el golpe de voz?',
      level2: 'Pensá en su familia léxica.',
      level3: 'Norma ortográfica aplicable.',
    }
  };

  const handleRate = (quality: number) => {
    if (!currentItemState) return;

    srsManager.recordAttempt(currentItemState.wordId, quality, isRevealed ? 1 : 0);
    if (quality >= 3) setCorrectCount((c) => c + 1);

    if (currentIndex + 1 < dueItems.length) {
      setCurrentIndex(c => c + 1);
      setIsRevealed(false);
      setTypedInput('');
    } else {
      srsManager.completeSession();
      setSessionCompleted(true);
    }
  };

  const handleCheckTyped = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRevealed(true);
  };

  const exampleSentence = currentWordBankItem.exampleSentence || currentWordBankItem.examples?.[0]?.sentence || `Observamos la forma de ${currentWordBankItem.word}.`;
  const wordMeaning = currentWordBankItem.meaning || currentWordBankItem.semanticField || currentWordBankItem.rule;

  if (dueItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 font-mono text-center space-y-6">
        <div className="border border-neutral-800 bg-neutral-950 p-8 space-y-4">
          <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">REPASO ESPACIADO</span>
            <h2 className="text-2xl font-bold font-sans text-neutral-100">No tenés repasos pendientes</h2>
            <p className="text-xs font-sans text-neutral-400 max-w-md mx-auto leading-relaxed">
              Cuando practiques palabras nuevas, el motor SRS las programará para repaso en el momento óptimo. Volvé cuando tengas ítems vencidos, o hacé una sesión de práctica desde el inicio.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (sessionCompleted) {
    const srsAccuracy = Math.round((correctCount / Math.max(1, dueItems.length)) * 100);
    const nextReviewLabel = formatNextReview();
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 font-mono space-y-6 text-center">
        <div className="border border-neutral-800 bg-neutral-950 p-8 space-y-6">
          <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">SESIÓN SRS CONCLUIDA</span>
            <h2 className="text-2xl font-bold font-sans text-neutral-100">
              Huellas Ortográficas Actualizadas
            </h2>
            <p className="text-xs font-sans text-neutral-400 max-w-md mx-auto">
              El algoritmo de repetición espaciada ha reajustado los intervalos de retención según tu tiempo de respuesta y precisión.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-neutral-900 p-3 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">PALABRAS REPASADAS</span>
              <span className="text-xl font-bold text-neutral-100">{dueItems.length}</span>
            </div>
            <div className="bg-neutral-900 p-3 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">PRECISIÓN SRS</span>
              <span className="text-xl font-bold text-emerald-400">{srsAccuracy}%</span>
            </div>
            <div className="bg-neutral-900 p-3 border border-neutral-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-neutral-500 block">PRÓXIMO REPASO</span>
              <span className="text-xl font-bold text-neutral-100">{nextReviewLabel}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setSessionCompleted(false);
              setCurrentIndex(0);
              setIsRevealed(false);
              setTypedInput('');
            }}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-6 py-3 text-xs tracking-wider transition-colors inline-flex items-center space-x-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REINICIAR COLA DE REPASO</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 font-mono">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-3 flex justify-between items-center text-xs">
        <div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">REPETICIÓN ESPACIADA (SRS)</span>
          <span className="font-bold text-neutral-200">CONSOLIDACIÓN DE LEXICÓN MENTAL</span>
        </div>
        <div className="text-neutral-400 font-bold">
          {currentIndex + 1} / {Math.max(1, dueItems.length)}
        </div>
      </div>

      {/* Main Flash / Retrieval Card */}
      <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
        {/* Status indicator pill */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
              currentItemState?.state === 'DOMINADO' ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300' :
              currentItemState?.state === 'ESTABLE' ? 'border-blue-800 bg-blue-950/40 text-blue-300' :
              currentItemState?.state === 'APRENDIENDO' ? 'border-amber-800 bg-amber-950/40 text-amber-300' :
              'border-neutral-800 bg-neutral-900 text-neutral-400'
            }`}>
              ESTADO: {currentItemState?.state || 'APRENDIENDO'}
            </span>
            <span className="text-neutral-500 text-[11px]">
              Intervalo: {currentItemState?.intervalDays || 1}d
            </span>
          </div>

          <button
            onClick={() => speechService.speak(currentWordBankItem.word, { rate: 0.9 })}
            className="flex items-center space-x-1 text-neutral-400 hover:text-neutral-200"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span className="text-xs">Pronunciar</span>
          </button>
        </div>

        {/* Prompt definition */}
        <div className="space-y-3">
          <span className="text-[10px] text-neutral-500 uppercase block">DEFINICIÓN & CONTEXTO</span>
          <p className="text-lg font-sans font-medium text-neutral-100 leading-snug">
            {wordMeaning}
          </p>
          <div className="bg-neutral-900/60 border border-neutral-800 p-3 font-sans text-xs text-neutral-300 italic">
            «{exampleSentence.replace(currentWordBankItem.word, '__________')}»
          </div>
        </div>

        {/* Active Typing / Reveal Zone */}
        {!isRevealed ? (
          <form onSubmit={handleCheckTyped} className="space-y-4 pt-2">
            <div className="space-y-2">
              <span className="text-xs text-neutral-400 block font-sans">
                Escribí la palabra objetivo con su ortografía y tilde exacta:
              </span>
              <input
                type="text"
                autoFocus
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder="Escribí aquí..."
                className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-lg font-mono text-neutral-100 focus:outline-none focus:border-neutral-400"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => onOpenCoach(currentWordBankItem)}
                className="text-xs text-neutral-400 hover:text-neutral-200 underline"
              >
                Ver pista
              </button>

              <button
                type="submit"
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-6 py-2.5 text-xs transition-colors"
              >
                COMPROBAR RESPUESTA
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 pt-2 animate-fadeIn">
            {/* Word Display & Rule */}
            <div className="border border-neutral-800 bg-neutral-900/90 p-5 space-y-3">
              <div className="flex justify-between items-baseline border-b border-neutral-800 pb-2">
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {currentWordBankItem.word}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  Tu respuesta: <strong className={typedInput.trim().toLowerCase() === currentWordBankItem.word.toLowerCase() ? 'text-emerald-300' : 'text-amber-300'}>{typedInput || '(vacío)'}</strong>
                </span>
              </div>

              <div className="text-xs font-sans text-neutral-300 leading-relaxed">
                {currentWordBankItem.rule}
              </div>

              {/* Syllables Breakdown */}
              <div className="text-[11px] font-mono text-neutral-500 pt-1 flex gap-2">
                <span>Estructura silábica:</span>
                <span className="text-neutral-300">{currentWordBankItem.syllables.join(' · ')}</span>
              </div>
            </div>

            {/* SRS Recall Quality Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                CALIFICA TU VELOCIDAD Y FACILIDAD DE RECUPERACIÓN:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleRate(1)}
                  className="p-3 border border-amber-900/60 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 text-xs font-bold transition-colors text-left"
                >
                  <span className="block text-sm">1. Difícil / Error</span>
                  <span className="text-[10px] font-normal text-amber-500/80">Intervalo 1d</span>
                </button>

                <button
                  onClick={() => handleRate(3)}
                  className="p-3 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold transition-colors text-left"
                >
                  <span className="block text-sm">2. Con esfuerzo</span>
                  <span className="text-[10px] font-normal text-neutral-500">Intervalo 2d</span>
                </button>

                <button
                  onClick={() => handleRate(4)}
                  className="p-3 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-bold transition-colors text-left"
                >
                  <span className="block text-sm">3. Bien</span>
                  <span className="text-[10px] font-normal text-neutral-500">Intervalo 4d</span>
                </button>

                <button
                  onClick={() => handleRate(5)}
                  className="p-3 border border-emerald-900/60 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 text-xs font-bold transition-colors text-left"
                >
                  <span className="block text-sm">4. Inmediato</span>
                  <span className="text-[10px] font-normal text-emerald-500/80">Intervalo 7d+</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
