import React, { useMemo, useState } from 'react';
import { UserProfile, EscapeScenario, EscapeRoomStage } from '../types';
import { ESCAPE_SCENARIOS } from '../data/orthographyBank';
import { foldAccents } from '../utils/proceduralEngine';
import {
  Lock, Unlock, KeyRound, ChevronRight, CheckCircle2, XCircle, Lightbulb,
  ArrowLeft, Trophy, Terminal,
} from 'lucide-react';

interface EscapeRoomViewProps {
  profile: UserProfile;
  onClearScenario: (scenarioId: string) => void;
}

/** Normaliza para comparar respuestas: minúsculas, sin tildes, sin espacios de más. */
function norm(s: string): string {
  return foldAccents(s).replace(/\s+/g, ' ').trim();
}

function checkStage(stage: EscapeRoomStage, selected: string[], typed: string): boolean {
  const correct = stage.correctAnswers.map(norm);
  if (stage.interactiveType === 'type_correct_key' || stage.interactiveType === 'order_syllables') {
    return correct.includes(norm(typed));
  }
  if (stage.interactiveType === 'select_multiple') {
    const sel = selected.map(norm).sort();
    const exp = [...correct].sort();
    return sel.length === exp.length && sel.every((v, i) => v === exp[i]);
  }
  // decode_contrast / spot_odd_one: una sola opción correcta
  return selected.length === 1 && correct.includes(norm(selected[0]));
}

const StageRunner: React.FC<{
  scenario: EscapeScenario;
  onSolved: () => void;
  onBack: () => void;
  alreadyCleared: boolean;
}> = ({ scenario, onSolved, onBack, alreadyCleared }) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [typed, setTyped] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [finished, setFinished] = useState(false);

  const stage = scenario.stages[stageIdx];
  const isMulti = stage.interactiveType === 'select_multiple';
  const isType = stage.interactiveType === 'type_correct_key' || stage.interactiveType === 'order_syllables';

  const resetStageState = () => {
    setSelected([]);
    setTyped('');
    setShowHint(false);
    setFeedback('idle');
  };

  const toggleOption = (opt: string) => {
    if (feedback === 'ok') return;
    if (isMulti) {
      setSelected((prev) => (prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]));
    } else {
      setSelected([opt]);
    }
  };

  const submit = () => {
    const ok = checkStage(stage, selected, typed);
    if (ok) {
      setFeedback('ok');
    } else {
      setFeedback('fail');
    }
  };

  const advance = () => {
    if (stageIdx < scenario.stages.length - 1) {
      setStageIdx((i) => i + 1);
      resetStageState();
    } else {
      setFinished(true);
      if (!alreadyCleared) onSolved();
    }
  };

  const canSubmit = isType ? typed.trim().length > 0 : selected.length > 0;

  if (finished) {
    return (
      <div className="border border-emerald-900/60 bg-emerald-950/20 p-8 text-center space-y-4">
        <div className="w-14 h-14 border border-emerald-700 flex items-center justify-center mx-auto text-emerald-400">
          <Unlock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-sans text-neutral-100">¡{scenario.codeName} descifrado!</h2>
        <p className="text-xs font-sans text-neutral-400 max-w-md mx-auto leading-relaxed">
          Resolviste las {scenario.stages.length} cerraduras ortográficas. Este escape queda marcado como superado en tu perfil.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-5 py-2.5 text-xs tracking-wider transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>VOLVER A LOS ESCAPES</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 hover:text-neutral-300">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Salir del escape</span>
      </button>

      {/* Progress */}
      <div className="flex items-center gap-1.5">
        {scenario.stages.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 ${i < stageIdx ? 'bg-emerald-500' : i === stageIdx ? 'bg-neutral-300' : 'bg-neutral-800'}`}
          />
        ))}
      </div>

      <div className="border border-neutral-800 bg-neutral-950 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> Cerradura {stage.stageNumber} / {scenario.stages.length}
          </span>
          <span className="text-[10px] font-mono text-neutral-600">{scenario.codeName}</span>
        </div>

        <div>
          <h3 className="text-base font-bold font-sans text-neutral-100">{stage.stageTitle}</h3>
          <p className="text-[11px] font-sans text-neutral-500 mt-1">{stage.briefing}</p>
        </div>

        <p className="text-sm font-sans text-neutral-200 leading-relaxed">{stage.instruction}</p>

        {stage.encryptedSnippet && (
          <div className="border border-neutral-800 bg-neutral-900/60 p-3 font-mono text-xs text-emerald-300 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
            <span className="break-words">{stage.encryptedSnippet}</span>
          </div>
        )}

        {/* Inputs */}
        {isType ? (
          <input
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
              if (feedback !== 'idle') setFeedback('idle');
            }}
            placeholder="Escribí la clave…"
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-600 outline-none p-3 text-sm font-mono text-neutral-100 placeholder:text-neutral-600"
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {(stage.options || []).map((opt) => {
              const isSel = selected.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  disabled={feedback === 'ok'}
                  className={`text-left border px-3 py-2.5 text-sm font-mono transition-colors ${
                    isSel
                      ? 'border-neutral-100 bg-neutral-100 text-neutral-950 font-bold'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-600'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {isMulti && <p className="text-[10px] font-mono text-neutral-600">Podés marcar varias opciones.</p>}

        {/* Feedback */}
        {feedback === 'ok' && (
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 border border-emerald-900/60 bg-emerald-950/20 p-2.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Correcto — clave «{stage.clueUnlockCode}» liberada.</span>
          </div>
        )}
        {feedback === 'fail' && (
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 border border-rose-900/60 bg-rose-950/20 p-2.5">
            <XCircle className="w-4 h-4" />
            <span>Todavía no. Revisá la pista y volvé a intentar.</span>
          </div>
        )}

        {/* Hint */}
        {showHint ? (
          <p className="text-[11px] font-sans text-neutral-400 flex items-start gap-1.5 border-t border-neutral-900 pt-3">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>{stage.socraticHint}</span>
          </p>
        ) : (
          <button onClick={() => setShowHint(true)} className="text-[11px] font-mono text-neutral-500 hover:text-amber-400 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Ver pista</span>
          </button>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-1">
          {feedback === 'ok' ? (
            <button
              onClick={advance}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold px-5 py-2 text-xs tracking-wider transition-colors"
            >
              <span>{stageIdx < scenario.stages.length - 1 ? 'SIGUIENTE CERRADURA' : 'ABRIR LA CAJA'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold px-5 py-2 text-xs tracking-wider transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>PROBAR CLAVE</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const EscapeRoomView: React.FC<EscapeRoomViewProps> = ({ profile, onClearScenario }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const cleared = useMemo(() => new Set(profile.escapeRoomsCleared || []), [profile.escapeRoomsCleared]);

  const active = ESCAPE_SCENARIOS.find((s) => s.id === activeId) || null;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 font-mono space-y-6">
      <div className="border-b border-neutral-800 pb-4 space-y-2">
        <div className="flex items-center gap-2 text-neutral-100">
          <KeyRound className="w-4 h-4 text-emerald-400" />
          <h1 className="text-lg font-bold tracking-tight">ESCAPE ORTO</h1>
          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 uppercase">
            {cleared.size} / {ESCAPE_SCENARIOS.length} resueltos
          </span>
        </div>
        <p className="text-[11px] font-sans text-neutral-400 leading-relaxed max-w-3xl">
          Cadenas de cerraduras ortográficas: cada etapa es un acertijo verificable por regla (tildes diacríticas,
          esdrújulas, grafías, contrastes). Resolvelas en orden para «abrir la caja». 100 % procedural, sin IA.
        </p>
      </div>

      {active ? (
        <StageRunner
          scenario={active}
          alreadyCleared={cleared.has(active.id)}
          onSolved={() => onClearScenario(active.id)}
          onBack={() => setActiveId(null)}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {ESCAPE_SCENARIOS.map((s) => {
            const done = cleared.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`text-left border p-4 space-y-2 transition-colors ${
                  done ? 'border-emerald-900/60 bg-emerald-950/10 hover:border-emerald-700' : 'border-neutral-800 bg-neutral-950 hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{s.codeName}</span>
                  {done ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                      <Trophy className="w-3 h-3" /> RESUELTO
                    </span>
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-neutral-600" />
                  )}
                </div>
                <h3 className="text-sm font-bold font-sans text-neutral-100">{s.title}</h3>
                <p className="text-[11px] font-sans text-neutral-400 leading-snug">{s.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-neutral-600">{s.difficulty}</span>
                  <span className="text-[10px] font-mono text-neutral-500">{s.stages.length} cerraduras</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
