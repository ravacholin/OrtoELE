import React, { useState } from 'react';
import { HelpCircle, ChevronRight, Sparkles, MessageSquare, AlertCircle, X } from 'lucide-react';
import { OrthoWordItem, Level, L1Language, ErrorCode } from '../types';

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
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiResponses, setAiResponses] = useState<{ query: string; response: string; question?: string }[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!isOpen) return null;

  const handleUnlockHint = (lvl: number) => {
    setUnlockedLevel(lvl);
    if (onUseHint) {
      onUseHint(lvl);
    }
  };

  const handleAskCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isLoadingAi) return;

    const query = customQuestion.trim();
    setCustomQuestion('');
    setIsLoadingAi(true);

    try {
      const res = await fetch('/api/orto-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentText: query,
          targetWord: targetWordItem?.word || '',
          targetSentence: targetContextSentence || '',
          errorCategory: category || targetWordItem?.category || 'spellings',
          hintLevel: unlockedLevel,
          level,
          l1,
        }),
      });

      const data = await res.json();
      setAiResponses(prev => [
        ...prev,
        {
          query,
          response: data.question || data.clue || 'Observá la forma gráfica y la posición del golpe de voz.',
          question: data.question,
        }
      ]);
    } catch (err) {
      setAiResponses(prev => [
        ...prev,
        {
          query,
          response: 'Considerá la relación entre la raíz de la palabra y su pronunciación prosódica.',
        }
      ]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-neutral-900/98 border-l border-neutral-800 shadow-2xl z-50 flex flex-col p-5 font-mono text-xs backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-bold tracking-wider text-neutral-100 text-sm">ORTO COACH</span>
          <span className="text-[10px] text-neutral-500 bg-neutral-950 px-1.5 py-0.5 border border-neutral-800">SOCRÁTICO</span>
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
          <span className="text-neutral-200 font-semibold block mb-1">MÉTODO INDIRECTO:</span>
          No te damos la respuesta instantánea. El objetivo es que actives tu lexicón mental y descubras el patrón subyacente.
        </div>

        {/* Target Context */}
        {(targetWordItem || targetContextSentence) && (
          <div className="p-3 bg-neutral-950/60 border border-neutral-800/80">
            <span className="text-neutral-500 text-[10px] uppercase block mb-1">Contexto de trabajo:</span>
            {targetContextSentence ? (
              <p className="text-neutral-300 italic font-sans text-xs">«{targetContextSentence}»</p>
            ) : targetWordItem ? (
              <p className="text-neutral-200 font-bold text-sm tracking-wide">{targetWordItem.word}</p>
            ) : null}
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
              {targetWordItem?.socraticClues?.level1 ||
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
                {targetWordItem?.socraticClues?.level2 ||
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
                {targetWordItem?.socraticClues?.level3 || targetWordItem?.rule || 'Norma ortográfica directa activada.'}
              </p>
            ) : (
              <p className="text-neutral-600 text-xs italic">Explicación normativa completa para cuando necesites despejar dudas.</p>
            )}
          </div>
        </div>

        {/* AI Interaction History */}
        {aiResponses.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <span className="text-neutral-500 text-[10px] uppercase font-bold">INTERACCIONES SOCRÁTICAS</span>
            {aiResponses.map((item, idx) => (
              <div key={idx} className="bg-neutral-950 border border-neutral-800 p-2.5 space-y-1.5 text-xs">
                <div className="text-neutral-400 font-sans text-[11px]">
                  <span className="text-neutral-500 font-mono">TÚ:</span> {item.query}
                </div>
                <div className="text-amber-200 font-sans text-[12px] bg-neutral-900/80 p-2 border-l-2 border-amber-500">
                  <span className="text-neutral-500 font-mono text-[10px] block mb-0.5">ORTO COACH:</span>
                  {item.response}
                </div>
              </div>
            ))}
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

      {/* Ask Coach Input Form */}
      <form onSubmit={handleAskCoach} className="pt-3 border-t border-neutral-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Preguntá una duda o pedí reflexión..."
            className="flex-1 bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
          />
          <button
            type="submit"
            disabled={isLoadingAi || !customQuestion.trim()}
            className="bg-neutral-100 text-neutral-950 font-bold px-3 py-2 hover:bg-neutral-300 disabled:opacity-40 transition-colors"
          >
            {isLoadingAi ? '...' : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};
