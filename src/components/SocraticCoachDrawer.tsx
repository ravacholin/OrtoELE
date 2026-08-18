import React, { useState } from 'react';
import { ArrowRight, Sparkles, Eye, X, Layers, Info } from 'lucide-react';
import { OrthoWordItem, Level, L1Language } from '../types';
import { classifyAccent } from '../utils/proceduralEngine';

interface SocraticCoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetWordItem?: OrthoWordItem | null;
  targetContextSentence?: string;
  category?: string;
  level?: Level;
  l1?: L1Language;
  onUseHint?: (hintLevel: number) => void;
}

/**
 * PISTAS — panel de ayuda escalonada (sin IA).
 * Las pistas y el microanálisis se derivan íntegramente de los metadatos
 * del ítem (socraticClues, syllables, visualAnchor, confusableWith,
 * examples). No hay generación de texto ni llamadas a ningún motor de IA.
 */
export const SocraticCoachDrawer: React.FC<SocraticCoachDrawerProps> = ({
  isOpen,
  onClose,
  targetWordItem,
  targetContextSentence,
  category,
  level = 'B1',
  l1 = 'español',
  onUseHint,
}) => {
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [exampleRevealed, setExampleRevealed] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleUnlockHint = (lvl: number) => {
    setUnlockedLevel(lvl);
    if (onUseHint) onUseHint(lvl);
  };

  const item = targetWordItem || null;
  const cleanWord = item ? (item.word.match(/[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+/)?.[0] || item.word) : '';
  const example = item?.examples?.[0]?.sentence || item?.exampleSentence || '';
  const blankedExample = example && cleanWord
    ? example.replace(new RegExp(cleanWord, 'i'), '［ _____ ］')
    : '';

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-neutral-900/98 border-l border-neutral-800 shadow-2xl z-50 flex flex-col p-5 font-mono text-xs backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-bold tracking-wider text-neutral-100 text-sm">PISTAS</span>
          <span className="text-[10px] text-neutral-500 bg-neutral-950 px-1.5 py-0.5 border border-neutral-800">SIN IA</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {/* Method explanation box */}
        <div className="bg-neutral-950 p-3 border border-neutral-800 text-neutral-400 text-[11px] leading-relaxed">
          <span className="text-neutral-200 font-semibold block mb-1">PISTAS ESCALONADAS:</span>
          Empezá por la pista 1. Revelá la 2 y la 3 solo si las necesitás. La idea es que primero intentes recordar cómo se escribe la palabra.
        </div>

        {/* Target Context */}
        {(item || targetContextSentence) && (
          <div className="p-3 bg-neutral-950/60 border border-neutral-800/80">
            <span className="text-neutral-500 text-[10px] uppercase block mb-1">Contexto de trabajo:</span>
            {item ? (
              <p className="text-neutral-200 font-bold text-sm tracking-wide">{item.word}</p>
            ) : targetContextSentence ? (
              <p className="text-neutral-300 italic font-sans text-xs">«{targetContextSentence}»</p>
            ) : null}
            {item && (
              <span className="text-[10px] text-neutral-500 block mt-1">
                {item.ruleCategoryName || item.category} · nivel {item.level}
              </span>
            )}
          </div>
        )}

        {/* Tiered Hints */}
        <div className="space-y-2.5">
          <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider block">PISTAS ESCALONADAS</span>

          {/* Level 1 Hint */}
          <div className="border border-neutral-800 bg-neutral-950 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-neutral-300 font-bold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-200 flex items-center justify-center text-[10px]">1</span>
                Pregunta Conceptual
              </span>
              <span className="text-[10px] text-emerald-400">100% Pts</span>
            </div>
            <p className="text-neutral-300 text-xs font-sans leading-relaxed">
              {item?.socraticClues?.level1 ||
                '¿Dónde cae el golpe de voz principal y qué regla fonológica u ortográfica se activa en esta posición?'}
            </p>
          </div>

          {/* Level 2 Hint */}
          <div className={`border p-3 transition-colors ${unlockedLevel >= 2 ? 'border-neutral-700 bg-neutral-950' : 'border-neutral-800/60 bg-neutral-950/40'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-neutral-300 font-bold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-200 flex items-center justify-center text-[10px]">2</span>
                Ayuda Contextual & Morfología
              </span>
              {unlockedLevel >= 2 ? (
                <span className="text-[10px] text-amber-400">85% Pts</span>
              ) : (
                <button
                  onClick={() => handleUnlockHint(2)}
                  className="text-[10px] text-neutral-400 hover:text-neutral-200 underline"
                >
                  Revelar (-15% pts)
                </button>
              )}
            </div>
            {unlockedLevel >= 2 ? (
              <p className="text-neutral-300 text-xs font-sans leading-relaxed">
                {item?.socraticClues?.level2 ||
                  'Observá si la palabra pertenece a una familia léxica conocida o si hay un cambio en la terminación verbal o sufijo.'}
              </p>
            ) : (
              <p className="text-neutral-600 text-xs italic">Pista bloqueada. Intentá responder primero con la pregunta 1.</p>
            )}
          </div>

          {/* Level 3 Hint */}
          <div className={`border p-3 transition-colors ${unlockedLevel >= 3 ? 'border-neutral-700 bg-neutral-950' : 'border-neutral-800/60 bg-neutral-950/40'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-neutral-300 font-bold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-200 flex items-center justify-center text-[10px]">3</span>
                Regla Explícita
              </span>
              {unlockedLevel >= 3 ? (
                <span className="text-[10px] text-neutral-400">60% Pts</span>
              ) : (
                <button
                  onClick={() => handleUnlockHint(3)}
                  className="text-[10px] text-neutral-400 hover:text-neutral-200 underline"
                >
                  Revelar (-40% pts)
                </button>
              )}
            </div>
            {unlockedLevel >= 3 ? (
              <p className="text-neutral-300 text-xs font-sans leading-relaxed">
                {item?.socraticClues?.level3 || item?.rule || 'Norma ortográfica directa activada.'}
              </p>
            ) : (
              <p className="text-neutral-600 text-xs italic">Explicación normativa completa para cuando necesites despejar dudas.</p>
            )}
          </div>
        </div>

        {/* Deterministic Micro-analysis (replaces the former AI free-text box) */}
        {item && (
          <div className="space-y-2.5 pt-2 border-t border-neutral-800">
            <span className="text-neutral-500 text-[10px] uppercase font-bold flex items-center gap-1.5">
              <Layers className="w-3 h-3" /> MICROANÁLISIS ORTOGRÁFICO
            </span>

            {/* Syllabification with stressed syllable */}
            <div className="border border-neutral-800 bg-neutral-950 p-3 space-y-1.5">
              <span className="text-[10px] text-neutral-500 uppercase block">Silabación · sílaba tónica</span>
              <div className="flex flex-wrap gap-1.5">
                {item.syllables.map((syll, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 border text-xs font-mono ${
                      idx === item.stressedSyllable
                        ? 'border-amber-500 bg-amber-950/40 text-amber-300 font-bold'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-300'
                    }`}
                  >
                    {syll}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-neutral-500 block">
                Clasificación: <strong className="text-neutral-300">{classifyAccent(item)}</strong>
              </span>
            </div>

            {/* Visual anchor */}
            {item.visualAnchor && (
              <div className="border border-neutral-800 bg-neutral-950 p-3 space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase flex items-center gap-1"><Eye className="w-3 h-3" /> Ancla visual</span>
                <span className="text-amber-400 font-bold text-sm">{item.visualAnchor.letterToHighlight}</span>
                <p className="text-neutral-400 font-sans text-[11px] leading-relaxed">{item.visualAnchor.description}</p>
              </div>
            )}

            {/* Confusables */}
            {item.confusableWith.length > 0 && (
              <div className="border border-neutral-800 bg-neutral-950 p-3 space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase">No confundir con</span>
                <p className="text-neutral-300 font-mono text-[11px]">{item.confusableWith.join(' · ')}</p>
              </div>
            )}

            {/* Blanked example — active recall */}
            {blankedExample && (
              <div className="border border-neutral-800 bg-neutral-950 p-3 space-y-2">
                <span className="text-[10px] text-neutral-500 uppercase">Recuperación activa</span>
                <p className="text-neutral-300 font-sans text-[11px] italic">«{blankedExample}»</p>
                {exampleRevealed ? (
                  <p className="text-emerald-300 font-sans text-[11px] border-l-2 border-emerald-600 pl-2">«{example}»</p>
                ) : (
                  <button
                    onClick={() => setExampleRevealed(true)}
                    className="text-[10px] text-neutral-400 hover:text-neutral-200 underline flex items-center gap-1"
                  >
                    Revelar la forma en contexto <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Codes Reference */}
        <div className="border border-neutral-800 bg-neutral-950 p-2.5 space-y-1.5 text-[11px]">
          <span className="text-neutral-500 text-[10px] uppercase font-bold block">CÓDIGOS INDIRECTOS</span>
          <div className="grid grid-cols-2 gap-1.5 text-neutral-400">
            <div><strong className="text-neutral-200">[ORT]</strong> Grafía (b/v, g/j...)</div>
            <div><strong className="text-neutral-200">[TIL]</strong> Acentuación/tilde</div>
            <div><strong className="text-neutral-200">[PUN]</strong> Puntuación / comas</div>
            <div><strong className="text-neutral-200">[MA]</strong> Mayúsculas</div>
            <div className="col-span-2"><strong className="text-neutral-200">[SEG]</strong> Segmentación indebida</div>
          </div>
        </div>
      </div>

      {/* Footer note (no AI input) */}
      <div className="pt-3 border-t border-neutral-800 flex items-start gap-2 text-[10px] text-neutral-500 leading-relaxed">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-neutral-600" />
        <span>
          Las pistas provienen de los datos de cada palabra
          {l1 !== 'español' ? ` y de las confusiones típicas de tu L1 (${l1})` : ''}. Sin motores de IA.
        </span>
      </div>
    </div>
  );
};
