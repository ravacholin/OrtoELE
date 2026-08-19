import React, { useMemo, useState } from 'react';
import { UserProfile, Level } from '../types';
import { analyzeText, ProceduralAnalysis } from '../utils/proceduralEngine';
import { FREE_WRITING_PROMPTS } from '../data/orthographyBank';
import {
  PenLine, ShieldCheck, AlertTriangle, Lightbulb, Info, Sparkles, RotateCcw,
} from 'lucide-react';

interface TextReviewViewProps {
  profile: UserProfile;
  onOpenCoach?: () => void;
}

const CODE_LABEL: Record<string, { label: string; color: string }> = {
  '[ORT]': { label: 'Grafía', color: 'text-emerald-400 border-emerald-800/70 bg-emerald-950/20' },
  '[TIL]': { label: 'Tilde', color: 'text-amber-400 border-amber-800/70 bg-amber-950/20' },
  '[PUN]': { label: 'Puntuación', color: 'text-blue-400 border-blue-800/70 bg-blue-950/20' },
  '[MA]': { label: 'Mayúscula', color: 'text-violet-400 border-violet-800/70 bg-violet-950/20' },
  '[SEG]': { label: 'Segmentación', color: 'text-rose-400 border-rose-800/70 bg-rose-950/20' },
};

const LEVEL_ORDER: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const TextReviewView: React.FC<TextReviewViewProps> = ({ profile }) => {
  const level: Level = profile.level === 'unassigned' ? 'B1' : profile.level;

  // Prompts hasta el nivel del estudiante (uno por nivel, el primero de cada uno).
  const prompts = useMemo(() => {
    const maxIdx = LEVEL_ORDER.indexOf(level);
    const reach = maxIdx < 0 ? LEVEL_ORDER.length - 1 : maxIdx;
    const allowed = new Set(LEVEL_ORDER.slice(0, reach + 1));
    const seen = new Set<string>();
    const out: { level: Level; title: string; prompt: string; targetFocus: string }[] = [];
    FREE_WRITING_PROMPTS.forEach((p) => {
      if (allowed.has(p.level) && !seen.has(p.level)) {
        seen.add(p.level);
        out.push(p);
      }
    });
    return out;
  }, [level]);

  const [text, setText] = useState('');
  const [activePrompt, setActivePrompt] = useState<typeof prompts[number] | null>(null);
  const [result, setResult] = useState<ProceduralAnalysis | null>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setResult(analyzeText(text));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setText('');
    setResult(null);
    setActivePrompt(null);
  };

  const scoreColor = (s: number) =>
    s >= 90 ? 'text-emerald-400' : s >= 70 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 font-mono space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-4 space-y-2">
        <div className="flex items-center gap-2 text-neutral-100">
          <PenLine className="w-4 h-4 text-emerald-400" />
          <h1 className="text-lg font-bold tracking-tight">REVISIÓN DE TEXTO</h1>
          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 uppercase">
            Nivel {level}
          </span>
        </div>
        <p className="text-[11px] font-sans text-neutral-400 leading-relaxed max-w-3xl">
          Escribí un texto y el laboratorio marcará solo lo que puede <span className="text-neutral-200">verificar por regla</span>:
          grafías mal escritas conocidas, tildes, comas de conectores, uniones indebidas y mayúsculas de días/meses/idiomas.
          No corrige gramática ni estilo, y nunca inventa un error: si no está seguro, no lo marca.
        </p>
      </div>

      {/* Honesty note */}
      <div className="flex items-start gap-2.5 border border-neutral-800 bg-neutral-900/40 p-3 text-[11px] font-sans text-neutral-400">
        <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
        <span>
          Corrector <span className="text-neutral-200">100 % procedural, sin IA</span>. Cubre errores frecuentes verificables; un texto
          «sin marcas» no garantiza que esté perfecto, solo que no disparó ninguna regla del motor.
        </span>
      </div>

      {/* Prompt chooser */}
      {prompts.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            ¿Sin ideas? Elegí una consigna
          </span>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {prompts.map((p) => (
              <button
                key={`${p.level}-${p.title}`}
                onClick={() => {
                  setActivePrompt(p);
                  setResult(null);
                }}
                className={`text-left border p-3 transition-colors ${
                  activePrompt?.title === p.title
                    ? 'border-neutral-100 bg-neutral-900'
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                }`}
              >
                <span className="text-[9px] font-mono text-neutral-500 uppercase block">{p.level}</span>
                <span className="text-xs font-bold text-neutral-200 block font-sans">{p.title}</span>
                <span className="text-[10px] font-sans text-neutral-500 line-clamp-2 block mt-0.5">{p.prompt}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activePrompt && (
        <div className="border border-neutral-800 bg-neutral-900/40 p-3 space-y-1.5">
          <span className="text-xs font-bold text-neutral-100 font-sans">{activePrompt.title}</span>
          <p className="text-[11px] font-sans text-neutral-300">{activePrompt.prompt}</p>
          <p className="text-[10px] font-sans text-neutral-500 flex items-start gap-1.5">
            <Sparkles className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
            <span>Foco ortográfico: {activePrompt.targetFocus}</span>
          </p>
        </div>
      )}

      {/* Editor */}
      <div className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribí acá tu texto…"
          rows={8}
          className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-600 outline-none p-3 text-sm font-sans text-neutral-100 resize-y placeholder:text-neutral-600"
        />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-mono text-neutral-500">{wordCount} palabras</span>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 px-3 py-2 text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!text.trim()}
              className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold px-5 py-2 text-xs tracking-wider transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>REVISAR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fadeIn">
          <div className="border border-neutral-800 bg-neutral-950 p-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">
                Marcas verificables por regla
              </span>
              <span className={`text-3xl font-mono font-bold ${scoreColor(result.score ?? 0)}`}>
                {result.score ?? 0}
                <span className="text-sm text-neutral-500"> / 100</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Palabras analizadas</span>
              <span className="text-xl font-mono text-neutral-200">{result.totalWords}</span>
            </div>
          </div>

          {/* Stat chips */}
          <div className="flex flex-wrap gap-2">
            {(Object.entries(result.stats) as [string, number][])
              .filter(([, n]) => n > 0)
              .map(([code, n]) => {
                const meta = CODE_LABEL[code] || { label: code, color: 'text-neutral-300 border-neutral-800 bg-neutral-900' };
                return (
                  <span key={code} className={`text-[11px] font-mono border px-2.5 py-1 ${meta.color}`}>
                    {meta.label}: {n}
                  </span>
                );
              })}
          </div>

          {/* Annotated text */}
          <div className="border border-neutral-800 bg-neutral-900/40 p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block mb-2">
              Texto anotado
            </span>
            <p className="text-sm font-sans text-neutral-200 whitespace-pre-wrap leading-relaxed">
              {result.annotatedText}
            </p>
          </div>

          {/* Feedback cards */}
          {result.feedbackItems.length > 0 ? (
            <div className="space-y-2">
              {result.feedbackItems.map((f, i) => {
                const meta = CODE_LABEL[f.code] || { label: f.code, color: 'text-neutral-300 border-neutral-800 bg-neutral-900' };
                return (
                  <div key={i} className="border border-neutral-800 bg-neutral-950 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span className={`text-[10px] font-mono border px-2 py-0.5 uppercase ${meta.color}`}>{meta.label}</span>
                      <span className="text-[11px] font-mono text-neutral-400">{f.word}</span>
                    </div>
                    <p className="text-xs font-sans text-neutral-300 leading-relaxed">{f.suggestion}</p>
                    {f.socraticQuestion && (
                      <p className="text-[11px] font-sans text-neutral-500 flex items-start gap-1.5">
                        <Lightbulb className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <span>{f.socraticQuestion}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-emerald-900/60 bg-emerald-950/20 p-4 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs font-sans text-emerald-200 leading-relaxed">{result.socraticAdvice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
