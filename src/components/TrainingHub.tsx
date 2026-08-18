import React, { useState, useEffect } from 'react';
import { UserProfile, OrthoWordItem } from '../types';
import { 
  ORTHOGRAPHY_WORD_BANK, 
  MINIMAL_CONTRASTS, 
  STRUCTURED_INPUT_EXERCISES, 
  DISCOVERY_SETS, 
  WORD_FAMILIES, 
  DICTATION_ITEMS 
} from '../data/orthographyBank';
import { speechService } from '../utils/speech';
import { srsManager } from '../utils/srsEngine';
import { buildContrastChallenge, foldAccents } from '../utils/proceduralEngine';
import { 
  Eye, Volume2, Sparkles, HelpCircle, ArrowRight, RotateCcw, 
  Check, AlertCircle, Layers, Compass, Brain, Edit3, ShieldAlert, Zap, CheckCircle2
} from 'lucide-react';

interface TrainingHubProps {
  profile: UserProfile;
  initialMode?: string;
  onOpenCoach: (targetWord?: OrthoWordItem, sentence?: string) => void;
}

export const TrainingHub: React.FC<TrainingHubProps> = ({
  profile,
  initialMode = 'contrastes',
  onOpenCoach,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialMode);

  // Sync tab if initialMode prop changes
  useEffect(() => {
    if (initialMode) setActiveTab(initialMode);
  }, [initialMode]);

  // Tab 1: Contrastes & Detective State
  const [contrastIndex, setContrastIndex] = useState(0);
  const [selectedContrastOption, setSelectedContrastOption] = useState<string | null>(null);
  const [contrastFeedback, setContrastFeedback] = useState<boolean>(false);

  // Tab 2: Input Estructurado State
  const [structuredIndex, setStructuredIndex] = useState(0);
  const [selectedStructuredIndex, setSelectedStructuredIndex] = useState<number | null>(null);
  const [structuredFeedback, setStructuredFeedback] = useState<boolean>(false);

  // Tab 3: Modo Fotografía / Memoria Visual State
  const [photoIndex, setPhotoIndex] = useState(0);
  const [photoPhase, setPhotoPhase] = useState<'flash' | 'distractor' | 'input' | 'result'>('flash');
  const [flashTimer, setFlashTimer] = useState<number>(3);
  const [writtenPhotoWord, setWrittenPhotoWord] = useState('');
  const [photoRecallScore, setPhotoRecallScore] = useState<number | null>(null);

  // Tab 4: Sílaba Tónica & Descubrimiento State
  const [stressItemIndex, setStressItemIndex] = useState(0);
  const [selectedSyllableIndex, setSelectedSyllableIndex] = useState<number | null>(null);
  const [stressFeedback, setStressFeedback] = useState<boolean>(false);
  const [discoveryIndex, setDiscoveryIndex] = useState(0);
  const [discoveryRuleRevealed, setDiscoveryRuleRevealed] = useState(false);

  // Tab 5: Morfología & Familias State
  const [familyIndex, setFamilyIndex] = useState(0);
  const [familyBuiltWord, setFamilyBuiltWord] = useState('');
  const [familyFeedback, setFamilyFeedback] = useState<boolean | null>(null);

  // Tab 6: Dictado Inteligente State
  const [dictIndex, setDictIndex] = useState(0);
  const [writtenDictation, setWrittenDictation] = useState('');
  const [dictationAnalysis, setDictationAnalysis] = useState<{
    precision: number;
    differences: { word: string; status: 'ok' | 'spelling' | 'accent' | 'missing' }[];
  } | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Recurrent Errors Focused Session State
  const [recurrentItems, setRecurrentItems] = useState(srsManager.getDetailedRecurrentMistakes());
  const [recurrentIndex, setRecurrentIndex] = useState(0);
  const [recurrentWrittenWord, setRecurrentWrittenWord] = useState('');
  const [recurrentStep, setRecurrentStep] = useState<'study' | 'test' | 'feedback'>('study');
  const [recurrentIsCorrect, setRecurrentIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setRecurrentItems(srsManager.getDetailedRecurrentMistakes());
  }, [activeTab]);

  // Current items
  const currentContrast = MINIMAL_CONTRASTS[contrastIndex % MINIMAL_CONTRASTS.length];
  // Desafío de discriminación derivado de los datos del contraste (no hardcodeado)
  const contrastChallenge = buildContrastChallenge(currentContrast);
  const currentStructured = STRUCTURED_INPUT_EXERCISES[structuredIndex % STRUCTURED_INPUT_EXERCISES.length];
  const currentPhotoWord = ORTHOGRAPHY_WORD_BANK[photoIndex % ORTHOGRAPHY_WORD_BANK.length];
  const currentStressWord = ORTHOGRAPHY_WORD_BANK[stressItemIndex % ORTHOGRAPHY_WORD_BANK.length];
  const currentDiscovery = DISCOVERY_SETS[discoveryIndex % DISCOVERY_SETS.length];
  const currentFamily = WORD_FAMILIES[familyIndex % WORD_FAMILIES.length];
  const currentDictation = DICTATION_ITEMS[dictIndex % DICTATION_ITEMS.length];
  const currentRecurrentItem = recurrentItems[recurrentIndex % Math.max(1, recurrentItems.length)];

  // Photo Mode timer management
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'fotografia' && photoPhase === 'flash') {
      if (flashTimer > 0) {
        interval = setInterval(() => {
          setFlashTimer(t => t - 1);
        }, 1000);
      } else {
        setPhotoPhase('distractor');
        setTimeout(() => {
          setPhotoPhase('input');
        }, 1500);
      }
    }
    return () => clearInterval(interval);
  }, [activeTab, photoPhase, flashTimer]);

  const startPhotoTest = () => {
    setFlashTimer(3);
    setPhotoPhase('flash');
    setWrittenPhotoWord('');
    setPhotoRecallScore(null);
  };

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = currentPhotoWord.word.toLowerCase().trim();
    const student = writtenPhotoWord.toLowerCase().trim();
    const isExact = student === correct;
    setPhotoRecallScore(isExact ? 100 : 0);
    setPhotoPhase('result');

    srsManager.recordAttempt(currentPhotoWord.id, isExact ? 5 : 1, 0);
  };

  // Dictation Audio Player
  const playDictation = (rate: number = 0.9) => {
    setIsPlayingAudio(true);
    speechService.speak(currentDictation.text, {
      rate,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const playSyllables = () => {
    setIsPlayingAudio(true);
    const sylls = currentStressWord.syllables;
    speechService.speakSyllables(sylls, () => setIsPlayingAudio(false));
  };

  const handleAnalyzeDictation = () => {
    const originalWords = currentDictation.text.replace(/[.,;!?]/g, '').toLowerCase().split(/\s+/).filter(Boolean);
    const typedWords = writtenDictation.replace(/[.,;!?]/g, '').toLowerCase().split(/\s+/).filter(Boolean);

    let matchCount = 0;
    const diffs = originalWords.map((orig, i) => {
      const typed = typedWords[i] || '';
      if (typed === orig) {
        matchCount++;
        return { word: orig, status: 'ok' as const };
      }
      // Check if it's just an accent error (remove accents)
      const stripOrig = orig.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const stripTyped = typed.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (stripOrig === stripTyped) {
        return { word: `${typed} [TIL -> ${orig}]`, status: 'accent' as const };
      }
      return { word: `${typed || '___'} [ORT -> ${orig}]`, status: 'spelling' as const };
    });

    const prec = Math.round((matchCount / originalWords.length) * 100);
    setDictationAnalysis({
      precision: prec,
      differences: diffs,
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 font-mono">
      {/* Module Selector Header */}
      <div className="border-b border-neutral-800 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">LABORATORIO COGNITIVO</span>
            <h2 className="text-2xl font-bold font-sans text-neutral-100">
              Entrenamiento de Adquisición Ortográfica
            </h2>
          </div>
          <button
            onClick={() => onOpenCoach(undefined, 'Laboratorio en ejecución')}
            className="flex items-center space-x-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 transition-colors"
          >
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span>CONSULTAR ORTO COACH</span>
          </button>
        </div>

        {/* Submodule Navigation */}
        <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
          {[
            ...(recurrentItems.length > 0 || activeTab === 'recurrentes'
              ? [{ id: 'recurrentes', label: `🔥 ERRORES RECURRENTES (${recurrentItems.length})`, icon: ShieldAlert, highlight: true }]
              : []),
            { id: 'contrastes', label: '01 CONTRASTES & DETECTIVE', icon: Compass },
            { id: 'input', label: '02 INPUT ESTRUCTURADO', icon: Layers },
            { id: 'fotografia', label: '03 MODO FOTOGRAFÍA (IDEOVISUAL)', icon: Eye },
            { id: 'silaba', label: '04 SÍLABA TÓNICA & DESCUBRIMIENTO', icon: Brain },
            { id: 'morfologia', label: '05 FAMILIAS & SUFIJOS', icon: Edit3 },
            { id: 'dictado', label: '06 DICTADO INTELIGENTE', icon: Volume2 },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-xs font-mono transition-all flex items-center space-x-2 border whitespace-nowrap ${
                  active
                    ? tab.id === 'recurrentes'
                      ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-neutral-100 text-neutral-950 font-bold border-neutral-100 shadow-sm'
                    : tab.id === 'recurrentes'
                      ? 'bg-amber-950/40 text-amber-300 border-amber-800/80 hover:bg-amber-900/40'
                      : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODULE 1: CONTRASTES MÍNIMOS & DETECTIVE ORTOGRÁFICO */}
      {activeTab === 'contrastes' && (
        <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 text-xs">
            <span className="font-bold text-neutral-400 uppercase">
              TRÍADA / CONTRASTE {contrastIndex + 1} DE {MINIMAL_CONTRASTS.length}
            </span>
            <span className="text-neutral-500">FOCO: {currentContrast.targetFocus}</span>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold font-sans text-neutral-100">
              {currentContrast.title}
            </h3>
            <p className="text-xs font-sans text-neutral-300 bg-neutral-900/60 border border-neutral-800 p-3 italic">
              «{currentContrast.discoveryQuestion}»
            </p>
          </div>

          {/* Contrast Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentContrast.forms.map((form, idx) => (
              <div 
                key={idx}
                className={`border p-4 space-y-3 transition-all ${
                  selectedContrastOption === form.word
                    ? 'border-neutral-200 bg-neutral-900/90'
                    : 'border-neutral-800/80 bg-neutral-950/60'
                }`}
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-lg font-bold text-neutral-100 font-mono">{form.word}</span>
                  <button
                    onClick={() => speechService.speak(form.exampleSentence, { rate: 0.9 })}
                    className="p-1 text-neutral-500 hover:text-neutral-300"
                    title="Escuchar oración"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] text-neutral-500 block uppercase font-mono">{form.accentType}</span>
                  <span className="text-neutral-300 font-sans font-medium block">{form.grammaticalFunction}</span>
                  <p className="text-[11px] font-sans text-neutral-400 italic">«{form.exampleSentence}»</p>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Detective Question */}
          <div className="border-t border-neutral-800 pt-5 space-y-3">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">
              DESAFÍO DE DISCRIMINACIÓN COGNITIVA
            </span>
            <p className="text-xs sm:text-sm font-sans text-neutral-200">
              {contrastChallenge.question}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {contrastChallenge.options.map((word, idx) => {
                const chosen = selectedContrastOption === word;
                const isCorrect = word === contrastChallenge.correct;
                let cls = 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700';
                if (contrastFeedback) {
                  if (isCorrect) cls = 'border-emerald-500 bg-emerald-950/30 text-emerald-200 font-bold';
                  else if (chosen) cls = 'border-amber-600 bg-amber-950/30 text-amber-200';
                  else cls = 'border-neutral-900 bg-neutral-950/40 text-neutral-600';
                } else if (chosen) {
                  cls = 'border-neutral-100 bg-neutral-100 text-neutral-950 font-bold';
                }
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (contrastFeedback) return;
                      setSelectedContrastOption(word);
                      setContrastFeedback(true);
                    }}
                    className={`px-4 py-2 text-xs border font-mono transition-colors ${cls}`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>

            {contrastFeedback && (
              <div className="bg-neutral-900 border border-neutral-800 p-4 text-xs font-sans text-neutral-300 space-y-1 mt-3">
                <span className={`font-mono font-bold block ${selectedContrastOption === contrastChallenge.correct ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedContrastOption === contrastChallenge.correct ? 'DISCRIMINACIÓN CORRECTA' : `REVISÁ: LA FORMA ERA «${contrastChallenge.correct}»`}
                </span>
                <p>{contrastChallenge.explanation}</p>
              </div>
            )}
          </div>

          {/* Next Button */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => onOpenCoach(undefined, currentContrast.discoveryQuestion)}
              className="text-xs text-neutral-400 hover:text-neutral-200 underline"
            >
              Pedir pista conceptual
            </button>
            <button
              onClick={() => {
                setContrastIndex(i => i + 1);
                setSelectedContrastOption(null);
                setContrastFeedback(false);
              }}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-5 py-2 text-xs flex items-center space-x-1.5"
            >
              <span>SIGUIENTE CONTRASTE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MODULE 2: INPUT ESTRUCTURADO (PROCESAMIENTO COGNITIVO) */}
      {activeTab === 'input' && (
        <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-800 pb-3 text-xs flex justify-between">
            <span className="font-bold text-neutral-400 uppercase">
              INPUT ESTRUCTURADO {structuredIndex + 1} DE {STRUCTURED_INPUT_EXERCISES.length}
            </span>
            <span className="text-neutral-500">MÉTODO: ATENCIÓN A LA FORMA</span>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">PREGUNTA DE INTERPRETACIÓN SEMÁNTICA</span>
            <h3 className="text-lg sm:text-xl font-bold font-sans text-neutral-100 leading-snug">
              {currentStructured.comprehensionQuestion}
            </h3>
            <p className="text-xs font-sans text-neutral-400">
              Observá la ortografía con atención. La grafía y la tilde determinan directamente el significado.
            </p>
          </div>

          {/* Sentences options */}
          <div className="space-y-3">
            {currentStructured.sentences.map((item, idx) => {
              const isSelected = selectedStructuredIndex === idx;
              let style = 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700';

              if (structuredFeedback) {
                if (idx === currentStructured.correctIndex) {
                  style = 'border-emerald-500 bg-emerald-950/20 text-emerald-200';
                } else if (isSelected) {
                  style = 'border-amber-600 bg-amber-950/20 text-amber-200';
                } else {
                  style = 'border-neutral-900 bg-neutral-950/40 text-neutral-600 opacity-60';
                }
              } else if (isSelected) {
                style = 'border-neutral-100 bg-neutral-900 text-neutral-100 font-bold';
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (!structuredFeedback) setSelectedStructuredIndex(idx);
                  }}
                  className={`w-full p-4 text-left border text-xs sm:text-sm font-sans transition-all flex items-center justify-between ${style}`}
                >
                  <div>
                    <span className="font-mono text-neutral-500 mr-2">0{idx + 1}.</span>
                    <span>{item.sentence}</span>
                  </div>
                  {isSelected && !structuredFeedback && (
                    <span className="w-2 h-2 bg-neutral-100 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Explanation */}
          {structuredFeedback && (
            <div className="bg-neutral-900 border border-neutral-800 p-4 space-y-2 text-xs font-sans text-neutral-300 animate-fadeIn">
              <span className="font-mono text-emerald-400 font-bold block">EXPLICACIÓN DE PROCESAMIENTO</span>
              <p>{currentStructured.explanation}</p>
              <p className="text-neutral-400 italic text-[11px] pt-1 border-t border-neutral-800">
                {currentStructured.cognitiveReflection}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-2">
            {!structuredFeedback ? (
              <button
                onClick={() => {
                  if (selectedStructuredIndex !== null) setStructuredFeedback(true);
                }}
                disabled={selectedStructuredIndex === null}
                className="bg-neutral-100 hover:bg-neutral-200 disabled:opacity-30 text-neutral-950 font-bold px-6 py-2.5 text-xs transition-colors"
              >
                PROCESAR RESPUESTA
              </button>
            ) : (
              <button
                onClick={() => {
                  setStructuredIndex(i => i + 1);
                  setSelectedStructuredIndex(null);
                  setStructuredFeedback(false);
                }}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-6 py-2.5 text-xs transition-colors flex items-center space-x-1.5"
              >
                <span>SIGUIENTE EJERCICIO</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODULE 3: MODO FOTOGRAFÍA / MEMORIA IDEOVISUAL */}
      {activeTab === 'fotografia' && (
        <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-800 pb-3 text-xs flex justify-between items-center">
            <span className="font-bold text-neutral-400 uppercase">
              FOTOGRAFÍA MENTAL // PALABRA {photoIndex + 1} DE {ORTHOGRAPHY_WORD_BANK.length}
            </span>
            <span className="text-neutral-500">MÉTODO IDEOVISUAL</span>
          </div>

          {/* Phase 1: Flash */}
          {photoPhase === 'flash' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="inline-flex items-center space-x-2 text-xs text-amber-400 font-mono bg-neutral-900 border border-neutral-800 px-3 py-1">
                <Eye className="w-4 h-4 animate-pulse" />
                <span>OBSERVÁ Y CAPTURÁ LA IMAGEN MENTAL ({flashTimer}s)</span>
              </div>

              {/* Big High-Contrast Word Display */}
              <div className="text-5xl sm:text-7xl font-bold font-mono tracking-wider text-neutral-100 uppercase select-none">
                {currentPhotoWord.word}
              </div>

              {/* Visual Anchor Indicator */}
              {currentPhotoWord.visualAnchor && (
                <div className="bg-neutral-900 border border-neutral-800 px-4 py-2 text-xs font-mono text-neutral-300">
                  <span className="text-neutral-500 uppercase mr-2">Punto crítico:</span>
                  <span className="text-amber-400 font-bold">{currentPhotoWord.visualAnchor.letterToHighlight}</span>
                </div>
              )}
            </div>
          )}

          {/* Phase 2: Distractor */}
          {photoPhase === 'distractor' && (
            <div className="py-16 text-center space-y-4 font-mono">
              <span className="text-neutral-500 text-xs uppercase block">PROCESAMIENTO COGNITIVO ACTIVO</span>
              <div className="text-2xl font-bold text-neutral-400 animate-pulse">
                Despejando memoria sensorial...
              </div>
            </div>
          )}

          {/* Phase 3: Immediate / Deferred Written Recall */}
          {photoPhase === 'input' && (
            <form onSubmit={handlePhotoSubmit} className="py-8 space-y-6 max-w-lg mx-auto text-center font-mono">
              <div className="space-y-2">
                <span className="text-xs text-neutral-400 uppercase font-bold block">
                  RECUPERACIÓN ACTIVA
                </span>
                <h4 className="text-lg font-sans text-neutral-100 font-bold">
                  Escribí la palabra exactamente como la fotografiaste en tu mente:
                </h4>
              </div>

              <input
                type="text"
                autoFocus
                value={writtenPhotoWord}
                onChange={(e) => setWrittenPhotoWord(e.target.value)}
                placeholder="Escribí aquí..."
                className="w-full bg-neutral-900 border border-neutral-700 px-4 py-3 text-center text-xl font-bold font-mono text-neutral-100 focus:outline-none focus:border-neutral-300"
              />

              <button
                type="submit"
                disabled={!writtenPhotoWord.trim()}
                className="bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 text-neutral-950 font-bold px-8 py-3 text-xs tracking-wider transition-colors"
              >
                COMPROBAR HUELLA MNÉMICA
              </button>
            </form>
          )}

          {/* Phase 4: Result Analysis */}
          {photoPhase === 'result' && (
            <div className="py-8 space-y-6 max-w-xl mx-auto font-mono text-center">
              <div className="space-y-2">
                <span className="text-xs text-neutral-500 uppercase block">EVALUACIÓN DE RECUPERACIÓN</span>
                <div className={`text-2xl font-bold ${photoRecallScore === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {photoRecallScore === 100 ? 'HUELLA ORTOGRÁFICA EXACTA (100%)' : 'FORMA PARA CONSOLIDAR'}
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-4 text-xs font-sans text-neutral-300 space-y-2 text-left">
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-500 font-mono">TU PRODUCCIÓN:</span>
                  <span className="font-mono font-bold text-neutral-200">{writtenPhotoWord}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-500 font-mono">FORMA OBJETIVO:</span>
                  <span className="font-mono font-bold text-emerald-400">{currentPhotoWord.word}</span>
                </div>
                <p className="text-[11px] text-neutral-400 pt-1">
                  {currentPhotoWord.rule}
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={startPhotoTest}
                  className="border border-neutral-800 hover:bg-neutral-900 text-neutral-300 px-4 py-2 text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>REPETIR PALABRA</span>
                </button>
                <button
                  onClick={() => {
                    setPhotoIndex(p => p + 1);
                    startPhotoTest();
                  }}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-6 py-2 text-xs flex items-center gap-1.5"
                >
                  <span>SIGUIENTE FOTOGRAFÍA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODULE 4: SÍLABA TÓNICA & ACENTUACIÓN INDUCTIVA */}
      {activeTab === 'silaba' && (
        <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-8">
          {/* Subpart A: Sílaba Tónica Perception */}
          <div className="space-y-4 border-b border-neutral-800 pb-6">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-neutral-400 uppercase">PERCEPCIÓN DE SÍLABA TÓNICA</span>
              <button
                onClick={playSyllables}
                disabled={isPlayingAudio}
                className="flex items-center space-x-1 text-neutral-300 hover:text-neutral-100 bg-neutral-900 px-2.5 py-1 border border-neutral-800"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Escuchar sílabas</span>
              </button>
            </div>

            <p className="text-xs font-sans text-neutral-300">
              Hacé clic sobre la <strong>sílaba tónica</strong> (la que lleva el mayor golpe de voz):
            </p>

            {/* Syllables clickable pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 py-4">
              {currentStressWord.syllables.map((syll, idx) => {
                const isSelected = selectedSyllableIndex === idx;
                const isTarget = idx === currentStressWord.stressedSyllable;
                let btnStyle = 'border-neutral-800 bg-neutral-900 text-neutral-200 hover:border-neutral-600';

                if (stressFeedback) {
                  if (isTarget) {
                    btnStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'border-amber-600 bg-amber-950/40 text-amber-200';
                  }
                } else if (isSelected) {
                  btnStyle = 'border-neutral-100 bg-neutral-100 text-neutral-950 font-bold';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!stressFeedback) {
                        setSelectedSyllableIndex(idx);
                        setStressFeedback(true);
                      }
                    }}
                    className={`px-6 py-4 border text-xl font-bold font-mono transition-all ${btnStyle}`}
                  >
                    {syll.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {stressFeedback && (
              <div className="bg-neutral-900 border border-neutral-800 p-3 text-xs font-sans text-neutral-300 text-center">
                <span className="font-mono text-emerald-400 font-bold block mb-1">
                  SÍLABA TÓNICA: {currentStressWord.syllables[currentStressWord.stressedSyllable]?.toUpperCase()}
                </span>
                <p className="text-neutral-400 text-[11px]">{currentStressWord.rule}</p>
                <button
                  onClick={() => {
                    setStressItemIndex(i => i + 1);
                    setSelectedSyllableIndex(null);
                    setStressFeedback(false);
                  }}
                  className="mt-3 inline-flex items-center space-x-1 bg-neutral-100 text-neutral-950 font-bold px-4 py-1.5 text-xs"
                >
                  <span>Siguiente palabra</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Subpart B: Inductive Discovery Classifier */}
          <div className="space-y-4 pt-2">
            <span className="text-xs text-neutral-400 uppercase font-bold block">
              ACENTUACIÓN POR DESCUBRIMIENTO
            </span>
            <h4 className="text-base font-sans font-bold text-neutral-100">
              {currentDiscovery.title}
            </h4>
            <p className="text-xs font-sans text-neutral-400">
              {currentDiscovery.promptQuestion}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Group A */}
              <div className="border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">GRUPO A (CON TILDE)</span>
                <div className="flex flex-wrap gap-2">
                  {currentDiscovery.groupA.map((g, i) => (
                    <span key={i} className="bg-neutral-950 border border-neutral-800 px-2.5 py-1 text-xs text-neutral-200 font-mono">
                      {g.word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Group B */}
              <div className="border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">GRUPO B (SIN TILDE)</span>
                <div className="flex flex-wrap gap-2">
                  {currentDiscovery.groupB.map((g, i) => (
                    <span key={i} className="bg-neutral-950 border border-neutral-800 px-2.5 py-1 text-xs text-neutral-200 font-mono">
                      {g.word}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reveal Rule Accordion */}
            <div className="border border-neutral-800 bg-neutral-950 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-300 font-sans font-bold">
                  {currentDiscovery.classificationQuestion}
                </span>
                <button
                  onClick={() => setDiscoveryRuleRevealed(r => !r)}
                  className="text-xs text-neutral-400 hover:text-neutral-200 underline font-mono"
                >
                  {discoveryRuleRevealed ? 'Ocultar regla' : 'Descubrir regla deducida'}
                </button>
              </div>

              {discoveryRuleRevealed && (
                <div className="bg-neutral-900 p-3 border-l-2 border-emerald-500 text-xs font-sans text-neutral-200 mt-2 animate-fadeIn">
                  <span className="font-mono text-[10px] text-emerald-400 uppercase block mb-1">PATRÓN REGULAR DESCUBIERTO:</span>
                  {currentDiscovery.discoveredRule}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 5: MORFOLOGÍA & FAMILIAS DE PALABRAS */}
      {activeTab === 'morfologia' && (
        <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-800 pb-3 text-xs flex justify-between items-center">
            <span className="font-bold text-neutral-400 uppercase">
              FAMILIA LÉXICA {familyIndex % WORD_FAMILIES.length + 1}/{WORD_FAMILIES.length}: RAÍZ "{currentFamily.root.toUpperCase()}"
            </span>
            <button
              onClick={() => {
                setFamilyIndex(i => i + 1);
                setFamilyBuiltWord('');
                setFamilyFeedback(null);
              }}
              className="flex items-center gap-1.5 border border-neutral-800 hover:border-neutral-600 text-neutral-300 px-3 py-1.5 transition-colors"
            >
              <span>SIGUIENTE FAMILIA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-sans text-neutral-300">
              {currentFamily.discoveryQuestion}
            </p>
          </div>

          {/* Family Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            {currentFamily.family.map((member, idx) => (
              <div key={idx} className="border border-neutral-800 bg-neutral-900/50 p-3 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-neutral-100 text-sm">{member.word}</span>
                  <span className="text-[10px] text-neutral-500">{member.partOfSpeech}</span>
                </div>
                <div className="text-[11px] font-sans text-neutral-400">{member.meaning}</div>
                <div className="text-[10px] text-amber-400/90 pt-1 border-t border-neutral-800/80">
                  Foco: {member.criticalLetter}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Rebuilding Task */}
          <div className="border-t border-neutral-800 pt-5 space-y-3">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">
              DESAFÍO DE RECONSTRUCCIÓN
            </span>
            <p className="text-xs font-sans text-neutral-200">
              {currentFamily.reconstruction.instruction}
            </p>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={familyBuiltWord}
                onChange={(e) => setFamilyBuiltWord(e.target.value)}
                placeholder="Escribí el derivado..."
                className="flex-1 bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs font-mono text-neutral-100 focus:outline-none focus:border-neutral-600"
              />
              <button
                onClick={() => {
                  const answer = currentFamily.reconstruction.answer.toLowerCase();
                  const typed = familyBuiltWord.trim().toLowerCase();
                  setFamilyFeedback(typed === answer);
                }}
                className="bg-neutral-100 text-neutral-950 font-bold px-4 py-2 text-xs hover:bg-neutral-200"
              >
                Comprobar
              </button>
            </div>

            {familyFeedback !== null && (() => {
              const answer = currentFamily.reconstruction.answer.toLowerCase();
              const typed = familyBuiltWord.trim().toLowerCase();
              // "Casi": grafía correcta pero difiere sólo en la tilde
              const nearMiss = !familyFeedback && foldAccents(typed) === foldAccents(answer);
              return (
                <div className={`p-3 text-xs font-sans border ${familyFeedback ? 'border-emerald-500/80 bg-emerald-950/20 text-emerald-300' : 'border-amber-500/80 bg-amber-950/20 text-amber-300'}`}>
                  {familyFeedback ? (
                    <span>{currentFamily.reconstruction.successNote}</span>
                  ) : nearMiss ? (
                    <span>Casi. La grafía es correcta pero revisá la tilde. {currentFamily.reconstruction.hint}</span>
                  ) : (
                    <span>{currentFamily.reconstruction.hint}</span>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODULE 6: DICTADO INTELIGENTE (TRANSCODIFICACIÓN) */}
      {activeTab === 'dictado' && (
        <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-800 pb-3 text-xs flex justify-between">
            <span className="font-bold text-neutral-400 uppercase">
              DICTADO {dictIndex + 1} DE {DICTATION_ITEMS.length} // {currentDictation.contextTopic}
            </span>
            <span className="text-neutral-500">TRANSCODIFICACIÓN ACÚSTICO-GRÁFICA</span>
          </div>

          {/* Audio Controls Box */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => playDictation(0.9)}
                disabled={isPlayingAudio}
                className="flex items-center space-x-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-4 py-2 text-xs"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isPlayingAudio ? 'Reproduciendo...' : 'Reproducir Audio'}</span>
              </button>

              <button
                onClick={() => playDictation(0.65)}
                disabled={isPlayingAudio}
                className="border border-neutral-800 hover:bg-neutral-800 text-neutral-300 px-3 py-2 text-xs"
              >
                Audio Lento (0.7x)
              </button>
            </div>

            <div className="text-[11px] text-neutral-500">
              Pista: {currentDictation.hints.join(' · ')}
            </div>
          </div>

          {/* Text input for dictation */}
          <div className="space-y-2">
            <span className="text-xs text-neutral-400 block font-sans">
              Escuchá con atención y transcribí el texto completo respetando tildes, mayúsculas y puntuación:
            </span>
            <textarea
              rows={3}
              value={writtenDictation}
              onChange={(e) => setWrittenDictation(e.target.value)}
              placeholder="Escribí aquí lo que escuchás..."
              className="w-full bg-neutral-900 border border-neutral-800 p-4 text-xs font-sans text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => onOpenCoach(undefined, currentDictation.hints[0])}
              className="text-xs text-neutral-400 hover:text-neutral-200 underline"
            >
              Pedir orientación socrática
            </button>
            <button
              onClick={handleAnalyzeDictation}
              disabled={!writtenDictation.trim()}
              className="bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 text-neutral-950 font-bold px-6 py-2.5 text-xs"
            >
              ANALIZAR TRANSCODIFICACIÓN
            </button>
          </div>

          {/* Analysis Results Display */}
          {dictationAnalysis && (
            <div className="border border-neutral-800 bg-neutral-900/80 p-5 space-y-4 text-xs animate-fadeIn">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="font-bold text-neutral-200">ANÁLISIS DE PRECISIÓN</span>
                <span className="font-bold text-neutral-100 text-sm">{dictationAnalysis.precision}%</span>
              </div>

              <div className="space-y-2 font-sans">
                <span className="text-[10px] text-neutral-500 font-mono uppercase block">TEXTO ORIGINAL:</span>
                <p className="text-neutral-200 italic text-sm">«{currentDictation.text}»</p>
              </div>

              <div className="space-y-2 font-sans pt-2 border-t border-neutral-800">
                <span className="text-[10px] text-neutral-500 font-mono uppercase block">DESGLOSE DE CONCORDANCIA:</span>
                <div className="flex flex-wrap gap-2">
                  {dictationAnalysis.differences.map((diff, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 border text-xs font-mono ${
                        diff.status === 'ok'
                          ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
                          : 'border-amber-700 bg-amber-950/40 text-amber-300'
                      }`}
                    >
                      {diff.word}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setDictIndex(d => d + 1);
                    setWrittenDictation('');
                    setDictationAnalysis(null);
                  }}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-5 py-2 text-xs flex items-center gap-1.5"
                >
                  <span>SIGUIENTE DICTADO</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODULE: RECURRENT ERRORS INTENSIVE DRILL */}
      {activeTab === 'recurrentes' && (
        <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
          {recurrentItems.length > 0 && currentRecurrentItem ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-3 text-xs gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-400 font-bold text-[10px]">
                    ERROR RECURRENTE {recurrentIndex + 1} DE {recurrentItems.length}
                  </span>
                  <span className="text-neutral-400 font-sans">
                    Categoría: <strong className="text-neutral-200 uppercase">{currentRecurrentItem.wordItem.category}</strong>
                  </span>
                </div>
                <div className="text-neutral-400 text-[11px]">
                  Fallos previos: <span className="text-amber-400 font-bold">{currentRecurrentItem.srsItem.mistakesCount}</span> · Tasa de error: <span className="text-neutral-200 font-bold">{currentRecurrentItem.mistakeRate}%</span>
                </div>
              </div>

              {/* Step 1: Study & Cognitive Anchor */}
              {recurrentStep === 'study' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center py-6 space-y-3 bg-neutral-900/60 border border-neutral-800 p-6">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold">
                      ANCLAJE IDEOVISUAL & PATRÓN NORMATIVO
                    </span>
                    <div className="text-4xl sm:text-5xl font-bold font-mono text-neutral-100 tracking-wider">
                      {currentRecurrentItem.wordItem.word}
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => speechService.speak(currentRecurrentItem.wordItem.word, { rate: 0.85 })}
                        className="p-2 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs inline-flex items-center space-x-1.5 transition-colors"
                      >
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span>Escuchar prosodia</span>
                      </button>
                    </div>
                  </div>

                  {/* Diagnostic details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                    <div className="bg-neutral-900 border border-neutral-800 p-4 space-y-1.5">
                      <span className="font-mono text-[10px] text-amber-400 uppercase font-bold block">
                        CONFUSIONES REGISTRADAS:
                      </span>
                      <p className="text-neutral-300">
                        {currentRecurrentItem.wordItem.commonErrors?.length 
                          ? currentRecurrentItem.wordItem.commonErrors.join(' · ') 
                          : 'Confusión de acentuación o grafía homófona'}
                      </p>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-4 space-y-1.5">
                      <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold block">
                        NORMA & ANCLAJE:
                      </span>
                      <p className="text-neutral-300">
                        {currentRecurrentItem.wordItem.rule}
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => onOpenCoach(currentRecurrentItem.wordItem)}
                      className="text-xs text-neutral-400 hover:text-neutral-200 underline"
                    >
                      Pedir pista socrática al Orto Coach
                    </button>
                    <button
                      onClick={() => {
                        setRecurrentStep('test');
                        setRecurrentWrittenWord('');
                        setRecurrentIsCorrect(null);
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold px-6 py-2.5 text-xs tracking-wider transition-colors flex items-center space-x-2"
                    >
                      <span>ESTOY LISTO PARA RECUPERAR</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Active Recall Test */}
              {recurrentStep === 'test' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!recurrentWrittenWord.trim()) return;
                    const correct = currentRecurrentItem.wordItem.word.toLowerCase().trim();
                    const typed = recurrentWrittenWord.toLowerCase().trim();
                    const isOk = correct === typed;
                    setRecurrentIsCorrect(isOk);
                    setRecurrentStep('feedback');

                    // Record SRS attempt
                    if (isOk) {
                      srsManager.recordAttempt(currentRecurrentItem.wordItem.id, 5, 0);
                    } else {
                      srsManager.recordAttempt(currentRecurrentItem.wordItem.id, 1, 0);
                    }
                    setRecurrentItems(srsManager.getDetailedRecurrentMistakes());
                  }}
                  className="space-y-6 animate-fadeIn"
                >
                  <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold">
                      RECUPERACIÓN ACTIVA DIFERIDA
                    </span>

                    <p className="text-sm font-sans text-neutral-200 leading-relaxed">
                      Escribí la forma ortográfica exacta sin errores de grafía ni omisión de tilde:
                    </p>

                    {currentRecurrentItem.wordItem.examples?.[0] && (
                      <div className="bg-neutral-950 p-3.5 border border-neutral-800 text-xs font-sans text-neutral-300 italic">
                        «{currentRecurrentItem.wordItem.examples[0].sentence.replace(
                          new RegExp(currentRecurrentItem.wordItem.word, 'gi'),
                          '[ ______ ]'
                        )}»
                      </div>
                    )}

                    <input
                      type="text"
                      autoFocus
                      value={recurrentWrittenWord}
                      onChange={(e) => setRecurrentWrittenWord(e.target.value)}
                      placeholder="Escribí la palabra..."
                      className="w-full bg-neutral-950 border border-neutral-700 p-4 text-lg font-mono text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400 text-center tracking-wider font-bold"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setRecurrentStep('study')}
                      className="text-xs text-neutral-500 hover:text-neutral-300"
                    >
                      Volver a ver anclaje
                    </button>
                    <button
                      type="submit"
                      disabled={!recurrentWrittenWord.trim()}
                      className="bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 text-neutral-950 font-bold px-6 py-2.5 text-xs transition-colors"
                    >
                      COMPROBAR RESPUESTA
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Feedback & SRS Update */}
              {recurrentStep === 'feedback' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className={`p-6 border text-xs space-y-3 ${
                    recurrentIsCorrect 
                      ? 'border-emerald-800 bg-emerald-950/40 text-emerald-200' 
                      : 'border-amber-800 bg-amber-950/40 text-amber-200'
                  }`}>
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      {recurrentIsCorrect ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span>¡RECUPERACIÓN CORRECTA! HUELLA COGNITIVA CONSOLIDADA</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-amber-400" />
                          <span>REVISIÓN NECESARIA</span>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 font-mono pt-2 border-t border-neutral-800/80">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase block">TU ESCRITURA:</span>
                        <span className="text-base font-bold">{recurrentWrittenWord}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase block">FORMA NORMATIVA:</span>
                        <span className="text-base font-bold text-neutral-100">{currentRecurrentItem.wordItem.word}</span>
                      </div>
                    </div>

                    <p className="font-sans text-neutral-300 pt-2 leading-relaxed">
                      {currentRecurrentItem.wordItem.rule}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setRecurrentStep('study')}
                      className="text-xs text-neutral-400 hover:text-neutral-200"
                    >
                      Revisar de nuevo
                    </button>

                    <button
                      onClick={() => {
                        if (recurrentIndex + 1 < recurrentItems.length) {
                          setRecurrentIndex(i => i + 1);
                        } else {
                          setRecurrentIndex(0);
                        }
                        setRecurrentStep('study');
                        setRecurrentWrittenWord('');
                        setRecurrentIsCorrect(null);
                      }}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-6 py-2.5 text-xs tracking-wider transition-colors flex items-center space-x-2"
                    >
                      <span>
                        {recurrentIndex + 1 < recurrentItems.length ? 'SIGUIENTE ERROR' : 'REPASAR LISTA'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-neutral-100 font-sans">
                  ¡No tenés errores recurrentes activos!
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto font-sans">
                  Tu lexicón mental está calibrado. Podés continuar practicando con los módulos estándar de contraste o dictado.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('contrastes')}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-5 py-2 text-xs"
              >
                IR A TRÍADAS & CONTRASTES
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
