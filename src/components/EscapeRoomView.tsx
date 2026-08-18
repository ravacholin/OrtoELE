import React, { useState } from 'react';
import { UserProfile, EscapeScenario, EscapeRoomStage } from '../types';
import { ESCAPE_SCENARIOS } from '../data/orthographyBank';
import { Lock, Unlock, Key, ShieldAlert, Award, RotateCcw } from 'lucide-react';
import { srsManager } from '../utils/srsEngine';

interface EscapeRoomViewProps {
  profile: UserProfile;
  onOpenCoach: (targetWord?: any, sentence?: string) => void;
}

export const EscapeRoomView: React.FC<EscapeRoomViewProps> = ({ profile, onOpenCoach }) => {
  const [currentScenarioIndex] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [inputCode, setInputCode] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [stageError, setStageError] = useState<string | null>(null);
  const [unlockedStages, setUnlockedStages] = useState<number[]>([]);
  const [isEscaped, setIsEscaped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const scenario: EscapeScenario = ESCAPE_SCENARIOS[currentScenarioIndex % ESCAPE_SCENARIOS.length];
  const currentStage: EscapeRoomStage = scenario.stages[currentStageIndex];

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    let isCorrect = false;

    if (currentStage.interactiveType === 'select_multiple') {
      const sortedSelected = [...selectedOptions].sort();
      const sortedCorrect = [...currentStage.correctAnswers].sort();
      isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
    } else if (currentStage.interactiveType === 'spot_odd_one' || currentStage.interactiveType === 'decode_contrast') {
      isCorrect = selectedOptions.length === 1 && currentStage.correctAnswers.includes(selectedOptions[0]);
    } else {
      const cleanInput = inputCode.trim().toLowerCase();
      isCorrect = currentStage.correctAnswers.some(ans => ans.toLowerCase().trim() === cleanInput);
    }

    if (isCorrect) {
      setStageError(null);
      const newUnlocked = [...unlockedStages, currentStageIndex];
      setUnlockedStages(newUnlocked);
      setSelectedOptions([]);

      if (currentStageIndex + 1 < scenario.stages.length) {
        setCurrentStageIndex(c => c + 1);
        setInputCode('');
        setShowHint(false);
      } else {
        setIsEscaped(true);
        const newProfile = { ...profile };
        if (!newProfile.escapeRoomsCleared.includes(scenario.id)) {
          newProfile.escapeRoomsCleared.push(scenario.id);
        }
        newProfile.globalPrecision = Math.min(100, newProfile.globalPrecision + 2.5);
        srsManager.saveProfile(newProfile);
      }
    } else {
      setStageError('Código de desbloqueo incorrecto. Revisá la instrucción y aplicá la regla normativa correspondiente.');
    }
  };

  const toggleOption = (opt: string) => {
    if (currentStage.interactiveType === 'select_multiple') {
      setSelectedOptions(prev => 
        prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
      );
    } else {
      setSelectedOptions([opt]);
    }
  };

  const handleReset = () => {
    setCurrentStageIndex(0);
    setUnlockedStages([]);
    setInputCode('');
    setSelectedOptions([]);
    setStageError(null);
    setIsEscaped(false);
    setShowHint(false);
  };

  if (isEscaped) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 font-mono space-y-6 text-center">
        <div className="border border-neutral-800 bg-neutral-950 p-8 sm:p-12 space-y-6">
          <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-amber-400">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">MISIÓN COGNITIVA COMPLETADA</span>
            <h2 className="text-3xl font-bold font-sans text-neutral-100">
              ¡Laboratorio Desbloqueado!
            </h2>
            <p className="text-xs font-sans text-neutral-300 max-w-lg mx-auto leading-relaxed">
              Has superado las 5 cerraduras ortográficas del <strong>{scenario.title}</strong>, demostrando dominio en acentuación, grafías críticas, morfología y puntuación contextual.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 max-w-md mx-auto text-xs text-neutral-300">
            <span className="text-[10px] text-neutral-500 uppercase block mb-1">RÉCORD OBTENIDO</span>
            <div className="text-emerald-400 font-bold text-sm">5 / 5 CERRADURAS RESUELTAS CON ÉXITO</div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={handleReset}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-6 py-3 text-xs tracking-wider transition-colors inline-flex items-center space-x-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>JUGAR DE NUEVO</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 font-mono">
      {/* Scenario Header */}
      <div className="border-b border-neutral-800 pb-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">ESCAPE ORTO // {scenario.codeName}</span>
          <h2 className="text-2xl font-bold font-sans text-neutral-100">
            {scenario.title}
          </h2>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
          <span className="text-neutral-500">DIFICULTAD:</span>
          <span className="bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-neutral-200 uppercase">{scenario.difficulty}</span>
        </div>
      </div>

      {/* Progress of 5 locks */}
      <div className="grid grid-cols-5 gap-2">
        {scenario.stages.map((stg, idx) => {
          const isDone = unlockedStages.includes(idx);
          const isCurrent = currentStageIndex === idx;
          return (
            <div
              key={idx}
              className={`border p-2.5 text-center text-xs transition-all ${
                isDone
                  ? 'border-emerald-800 bg-emerald-950/30 text-emerald-300'
                  : isCurrent
                  ? 'border-neutral-100 bg-neutral-900 text-neutral-100 font-bold'
                  : 'border-neutral-900 bg-neutral-950/60 text-neutral-600'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                {isDone ? (
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Lock className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-400' : 'text-neutral-600'}`} />
                )}
              </div>
              <span className="text-[10px] block truncate">Fase 0{idx + 1}</span>
            </div>
          );
        })}
      </div>

      {/* Active Stage Challenge Box */}
      <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-neutral-500">
            <span className="uppercase">CERRADURA {currentStageIndex + 1} DE {scenario.stages.length}</span>
            <span className="text-neutral-300 font-bold">{currentStage.stageTitle}</span>
          </div>
          <p className="text-xs font-sans text-neutral-400 leading-relaxed">
            {currentStage.briefing}
          </p>
        </div>

        {/* Transmission / Cryptic snippet */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 font-mono text-xs text-neutral-200 space-y-2">
          <div className="flex items-center space-x-2 text-[10px] text-amber-400 uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>TRANSMISIÓN CORRUPTA DETECTADA:</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-neutral-100 leading-relaxed font-mono">
            «{currentStage.encryptedSnippet}»
          </p>
          <div className="text-[11px] text-neutral-400 font-sans pt-1 border-t border-neutral-800">
            <strong>Instrucción:</strong> {currentStage.instruction}
          </div>
        </div>

        {/* Options for selection type */}
        {currentStage.options && currentStage.options.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">OPCIONES DISPONIBLES:</span>
            <div className="flex flex-wrap gap-2">
              {currentStage.options.map((opt, i) => {
                const isSelected = selectedOptions.includes(opt);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleOption(opt)}
                    className={`px-3.5 py-2 border text-xs font-mono transition-colors ${
                      isSelected
                        ? 'border-neutral-100 bg-neutral-100 text-neutral-950 font-bold'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Hint toggle */}
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowHint(h => !h)}
            className="text-neutral-400 hover:text-neutral-200 underline"
          >
            {showHint ? 'Ocultar pista' : 'Solicitar pista de descifrado'}
          </button>
          <button
            type="button"
            onClick={() => onOpenCoach(undefined, currentStage.encryptedSnippet)}
            className="text-xs text-amber-400 hover:text-amber-300"
          >
            Consultar Orto Coach
          </button>
        </div>

        {showHint && (
          <div className="bg-neutral-900/80 border border-neutral-800 p-3 text-xs font-sans text-neutral-300 animate-fadeIn">
            <strong className="text-neutral-200 font-mono text-[10px] uppercase block mb-1">PISTA COGNITIVA:</strong>
            {currentStage.socraticHint}
          </div>
        )}

        {/* Error message */}
        {stageError && (
          <div className="p-3 border border-amber-900/60 bg-amber-950/20 text-amber-300 text-xs font-sans">
            {stageError}
          </div>
        )}

        {/* Unlock Form */}
        <form onSubmit={handleUnlock} className="space-y-4 pt-2 border-t border-neutral-800">
          <div className="space-y-2">
            {!currentStage.options ? (
              <>
                <span className="text-xs text-neutral-300 font-sans block">
                  Ingresá la palabra clave o forma corregida:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Código de desbloqueo..."
                    className="flex-1 bg-neutral-900 border border-neutral-700 px-4 py-3 text-sm font-mono text-neutral-100 focus:outline-none focus:border-neutral-400"
                  />
                  <button
                    type="submit"
                    disabled={!inputCode.trim()}
                    className="bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 text-neutral-950 font-bold px-6 py-3 text-xs tracking-wider transition-colors flex items-center space-x-1.5"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>DESBLOQUEAR</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={selectedOptions.length === 0}
                  className="bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 text-neutral-950 font-bold px-6 py-3 text-xs tracking-wider transition-colors flex items-center space-x-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>VALIDAR SELECCIÓN</span>
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
