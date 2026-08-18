import React, { useState, useEffect } from 'react';
import { UserProfile, Level, TextEvaluationResult } from '../types';
import { PenTool, Sparkles, History, Brain, ShieldCheck } from 'lucide-react';
import { srsManager } from '../utils/srsEngine';
import { storageService, WritingSubmission } from '../services/storageService';
import { analyzeText } from '../utils/proceduralEngine';

interface FreeWritingLabProps {
  profile: UserProfile;
  onOpenCoach: (targetWord?: any, sentence?: string) => void;
}

export const FreeWritingLab: React.FC<FreeWritingLabProps> = ({ profile, onOpenCoach }) => {
  const writingPrompts: { level: Level; topic: string; prompt: string; targetStructures: string[] }[] = [
    {
      level: 'A2',
      topic: 'Anécdota de fin de semana',
      prompt: 'Contá en 3 a 5 oraciones qué hiciste el fin de semana pasado. Utilizá verbos en pretérito perfecto simple (fui, comí, estuve, salí).',
      targetStructures: ['Pretéritos con tilde (comí, visité)', 'Uso de mayúsculas al inicio', 'Punto y seguido'],
    },
    {
      level: 'B1',
      topic: 'Correo formal solicitando información',
      prompt: 'Escribí un correo electrónico breve a la secretaría de un curso universitario preguntando por las fechas de inscripción, el costo y los requisitos.',
      targetStructures: ['Fórmulas de cortesía (Estimado/a, atentamente)', 'Signos de apertura (¿ ?)', 'Tilde en interrogativos (cuándo, cuánto)'],
    },
    {
      level: 'B2',
      topic: 'Opinión sobre el trabajo remoto',
      prompt: 'Argumentá brevemente las ventajas y desventajas del teletrabajo. Empleá conectores contraargumentativos como "sin embargo", "no obstante" o "por lo tanto".',
      targetStructures: ['Comas con conectores discursivos (Sin embargo, ...)', 'Acentuación de adverbios', 'Grafías dudosas (ventajas, exigencias)'],
    },
    {
      level: 'C1',
      topic: 'Breve ensayo crítico sobre inteligencia artificial',
      prompt: 'Redactá una reflexión concisa sobre el impacto ético de la automatización en la educación, prestando especial atención a la subordinación y los incisos.',
      targetStructures: ['Comas en oraciones explicativas e incisos', 'Punto y coma en enumeraciones complejas', 'Vocabulario formal y precisión léxica'],
    },
  ];

  const [selectedPromptIndex, setSelectedPromptIndex] = useState(1);
  const [studentText, setStudentText] = useState(
    'Estimados señores:\nQueria consultar por que fechas empezara el proximo curso y cuando sabremos el costo total. Sin embargo aun no recibi confirmacion. Muchas gracias.'
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<TextEvaluationResult | null>(null);
  const [savedHistory, setSavedHistory] = useState<WritingSubmission[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    setSavedHistory(storageService.getWritingHistory());
  }, []);

  const currentPrompt = writingPrompts[selectedPromptIndex];

  const handleEvaluate = () => {
    if (!studentText.trim() || isEvaluating) return;
    setIsEvaluating(true);

    // Análisis 100% determinista y local (sin IA). Detecta trampas
    // ortográficas verificables por regla; no evalúa gramática ni estilo.
    const analysis = analyzeText(studentText);
    const result: TextEvaluationResult = {
      score: analysis.score,
      annotatedText: analysis.annotatedText,
      feedbackItems: analysis.feedbackItems,
      socraticAdvice: analysis.socraticAdvice,
      isOffline: false,
    };

    setEvaluationResult(result);
    srsManager.recomputeProfileStats();

    storageService.saveWritingSubmission({
      promptTitle: currentPrompt.topic,
      level: currentPrompt.level,
      text: studentText,
      result,
    });
    setSavedHistory(storageService.getWritingHistory());
    setIsEvaluating(false);
  };

  const loadPastSubmission = (sub: WritingSubmission) => {
    setStudentText(sub.text);
    setEvaluationResult(sub.result);
    setShowHistoryModal(false);
  };

  const wordCount = studentText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = studentText.length;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 font-mono">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">PRODUCCIÓN CONTEXTUALIZADA</span>
          <h2 className="text-2xl font-bold font-sans text-neutral-100">
            Laboratorio de Escritura Libre & Autocorrección
          </h2>
          <span className="inline-flex items-center gap-1.5 mt-1 text-[10px] font-mono text-emerald-400/90 bg-emerald-950/30 border border-emerald-900/60 px-2 py-0.5">
            <ShieldCheck className="w-3 h-3" />
            CORRECTOR DETERMINISTA · LOCAL · SIN IA
          </span>
        </div>
        <div className="flex gap-2">
          {savedHistory.length > 0 && (
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center space-x-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-emerald-400" />
              <span>HISTORIAL GUARDADO ({savedHistory.length})</span>
            </button>
          )}

          <button
            onClick={() => onOpenCoach(undefined, studentText)}
            className="flex items-center space-x-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 transition-colors"
          >
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span>CONSULTAR ORTO COACH</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompts & Textarea (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Prompt Selector */}
          <div className="border border-neutral-800 bg-neutral-950 p-4 space-y-3">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">
              SELECCIONAR PROPUESTA DE ESCRITURA ({currentPrompt.level})
            </span>

            <div className="flex flex-wrap gap-2">
              {writingPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPromptIndex(idx);
                    setEvaluationResult(null);
                  }}
                  className={`px-3 py-1 text-xs border transition-colors ${
                    selectedPromptIndex === idx
                      ? 'border-neutral-100 bg-neutral-900 text-neutral-100 font-bold'
                      : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  [{p.level}] {p.topic}
                </button>
              ))}
            </div>

            <div className="bg-neutral-900/60 border border-neutral-800/80 p-3 space-y-1.5 text-xs font-sans">
              <p className="text-neutral-200 font-medium">{currentPrompt.prompt}</p>
              <div className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
                <strong>Foco de control ortográfico:</strong> {currentPrompt.targetStructures.join(' · ')}
              </div>
            </div>
          </div>

          {/* Text Editor */}
          <div className="border border-neutral-800 bg-neutral-950 p-4 space-y-3">
            <div className="flex justify-between items-center text-xs text-neutral-400">
              <span className="font-bold text-neutral-300">TU TEXTO (AUTO-GUARDADO LOCAL)</span>
              <div className="space-y-0.5 text-right text-[11px] text-neutral-500">
                <span>{wordCount} palabras</span> · <span>{charCount} caracteres</span>
              </div>
            </div>

            <textarea
              rows={8}
              value={studentText}
              onChange={(e) => setStudentText(e.target.value)}
              placeholder="Escribí aquí tu texto en español..."
              className="w-full bg-neutral-900 border border-neutral-800 p-4 text-xs sm:text-sm font-sans text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 leading-relaxed font-mono"
            />

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setStudentText('')}
                className="text-xs text-neutral-500 hover:text-neutral-300"
              >
                Limpiar texto
              </button>

              <button
                onClick={handleEvaluate}
                disabled={isEvaluating || !studentText.trim()}
                className="bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 text-neutral-950 font-bold px-6 py-2.5 text-xs tracking-wider transition-colors flex items-center space-x-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEvaluating ? 'ANALIZANDO CÓDIGOS...' : 'ANALIZAR ORTOGRAFÍA'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Feedback & Annotated Text (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-neutral-800 bg-neutral-950 p-5 space-y-4 min-h-[420px] flex flex-col justify-between">
            {evaluationResult ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                  <span className="text-xs font-bold text-neutral-200 uppercase">ANÁLISIS COGNITIVO</span>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-neutral-100">{evaluationResult.score || 80}%</span>
                    <span className="text-[10px] text-neutral-500 block">PRECISIÓN</span>
                  </div>
                </div>

                {/* Annotated Text Box */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                    TEXTO CON CÓDIGOS INDIRECTOS
                  </span>
                  <div className="bg-neutral-900 border border-neutral-800 p-3.5 text-xs font-mono text-neutral-200 leading-relaxed whitespace-pre-wrap">
                    {evaluationResult.annotatedText}
                  </div>
                </div>

                {/* Feedback Items / Socratic Prompts */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                    PREGUNTAS PARA AUTOCORRECCIÓN
                  </span>
                  {evaluationResult.feedbackItems.map((item, idx) => (
                    <div key={idx} className="bg-neutral-900/70 border border-neutral-800 p-3 space-y-1 text-xs">
                      <div className="flex items-center space-x-2 font-mono">
                        <span className="px-1.5 py-0.5 bg-neutral-800 text-amber-400 font-bold text-[10px]">
                          {item.code}
                        </span>
                        <span className="text-neutral-300 font-medium font-sans">{item.word}</span>
                      </div>
                      <p className="text-neutral-400 font-sans text-[11px] leading-normal">{item.suggestion}</p>
                      {item.socraticQuestion && (
                        <div className="text-amber-300/90 font-sans text-[11px] italic pt-1 border-t border-neutral-800/80">
                          {item.socraticQuestion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Socratic Advice */}
                {evaluationResult.socraticAdvice && (
                  <div className="bg-neutral-950 border border-neutral-800 p-3 text-[11px] font-sans text-neutral-400 italic">
                    «{evaluationResult.socraticAdvice}»
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center space-y-3 text-neutral-500">
                <PenTool className="w-8 h-8 mx-auto text-neutral-700" />
                <p className="text-xs font-sans max-w-xs mx-auto">
                  Escribí o pegá tu texto a la izquierda y hacé clic en <strong>Analizar Ortografía</strong> para recibir marcas indirectas ([ORT], [TIL], [PUN], [MA], [SEG]) y guardarlo en tu historial.
                </p>
                <p className="text-[10px] font-sans max-w-xs mx-auto text-neutral-600 pt-1 border-t border-neutral-800/60">
                  Corrector <strong>determinista y local</strong>: señala trampas ortográficas verificables por regla. No usa IA ni evalúa gramática o estilo.
                </p>
              </div>
            )}

            {/* Error Legend */}
            <div className="border-t border-neutral-800/80 pt-3 text-[10px] text-neutral-500 flex flex-wrap gap-x-3 gap-y-1 font-mono">
              <span><strong>[ORT]</strong> Grafía</span>
              <span><strong>[TIL]</strong> Tilde</span>
              <span><strong>[PUN]</strong> Puntuación</span>
              <span><strong>[MA]</strong> Mayúscula</span>
              <span><strong>[SEG]</strong> Segmentación</span>
            </div>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-mono">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">HISTORIAL EN LOCALSTORAGE</span>
                <h3 className="text-lg font-bold text-neutral-100">Ensayos & Evaluaciones Guardadas</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-neutral-500 hover:text-neutral-200 text-xs"
              >
                CERRAR [ESC]
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {savedHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadPastSubmission(item)}
                  className="p-3 border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 cursor-pointer space-y-1.5 transition-colors"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-neutral-200">{item.promptTitle} ({item.level})</span>
                    <span className="text-emerald-400 font-bold">{item.result.score || 80}% precisión</span>
                  </div>
                  <p className="text-[11px] font-sans text-neutral-400 line-clamp-2 italic">
                    «{item.text}»
                  </p>
                  <div className="text-[10px] text-neutral-600">
                    Guardado: {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
