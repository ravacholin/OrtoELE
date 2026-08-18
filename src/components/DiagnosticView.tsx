import React, { useState } from 'react';
import { DiagnosticQuestion, INITIAL_DIAGNOSTIC_QUESTIONS } from '../data/orthographyBank';
import { UserProfile, OrthoCategory } from '../types';
import { CheckCircle2, ArrowRight, RotateCcw, Award, Sparkles, HelpCircle } from 'lucide-react';
import { srsManager } from '../utils/srsEngine';
import { storageService } from '../services/storageService';

interface DiagnosticViewProps {
  profile: UserProfile;
  onCompleteDiagnostic: (newProfile: UserProfile) => void;
  onNavigateToTraining: () => void;
}

export const DiagnosticView: React.FC<DiagnosticViewProps> = ({
  profile,
  onCompleteDiagnostic,
  onNavigateToTraining,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<{ questionId: string; selected: string; correct: boolean; category: OrthoCategory }[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [computedProfile, setComputedProfile] = useState<UserProfile | null>(null);

  const currentQ: DiagnosticQuestion = INITIAL_DIAGNOSTIC_QUESTIONS[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (showFeedback) return;
    setSelectedAnswer(opt);
  };

  const handleConfirmAnswer = () => {
    if (!selectedAnswer || showFeedback) return;

    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    const newRecord = {
      questionId: currentQ.id,
      selected: selectedAnswer,
      correct: isCorrect,
      category: currentQ.category,
    };

    setUserAnswers(prev => [...prev, newRecord]);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < INITIAL_DIAGNOSTIC_QUESTIONS.length) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      finishDiagnostic();
    }
  };

  const finishDiagnostic = () => {
    const allAnswers = [...userAnswers];
    if (selectedAnswer && !userAnswers.find(a => a.questionId === currentQ.id)) {
      allAnswers.push({
        questionId: currentQ.id,
        selected: selectedAnswer,
        correct: selectedAnswer === currentQ.correctAnswer,
        category: currentQ.category,
      });
    }

    const catCounts: Record<OrthoCategory, { total: number; correct: number }> = {
      accentuation: { total: 0, correct: 0 },
      spellings: { total: 0, correct: 0 },
      punctuation: { total: 0, correct: 0 },
      morphology: { total: 0, correct: 0 },
      capitals: { total: 0, correct: 0 },
    };

    const mistakesByCat: Record<string, number> = {};

    allAnswers.forEach(ans => {
      if (catCounts[ans.category]) {
        catCounts[ans.category].total += 1;
        if (ans.correct) {
          catCounts[ans.category].correct += 1;
        } else {
          mistakesByCat[ans.category] = (mistakesByCat[ans.category] || 0) + 1;
        }
      }
    });

    const newErrorProfile = { ...profile.errorProfile };
    (Object.keys(catCounts) as OrthoCategory[]).forEach(cat => {
      const data = catCounts[cat];
      if (data.total > 0) {
        newErrorProfile[cat] = Math.round((data.correct / data.total) * 100);
      }
    });

    const totalCorrect = allAnswers.filter(a => a.correct).length;
    const globalPrec = Math.round((totalCorrect / allAnswers.length) * 100);

    const patterns: string[] = [];
    if (newErrorProfile.accentuation < 80) patterns.push('Acentuación de hiatos y esdrújulas');
    if (newErrorProfile.spellings < 80) patterns.push('Alternancia B/V y verbos en -GER/-GIR');
    if (newErrorProfile.punctuation < 80) patterns.push('Comas en conectores discursivos y contraargumentativos');
    if (newErrorProfile.morphology < 80) patterns.push('Sufijos adverbiales en -mente y -ción/-sión');
    if (patterns.length === 0) patterns.push('Mantenimiento de alta precisión léxica y estilo editorial');

    const updatedProfile: UserProfile = {
      ...profile,
      globalPrecision: globalPrec,
      errorProfile: newErrorProfile,
      topErrorPatterns: patterns.slice(0, 3),
      sessionsCompleted: profile.sessionsCompleted + 1,
    };

    srsManager.saveProfile(updatedProfile);

    // Save diagnostic record to localStorage history
    storageService.saveDiagnosticRecord({
      score: totalCorrect,
      total: allAnswers.length,
      levelAssigned: profile.level,
      mistakesByCategory: mistakesByCat,
    });

    setComputedProfile(updatedProfile);
    setIsFinished(true);
    onCompleteDiagnostic(updatedProfile);
  };

  const getBar = (pct: number) => {
    const total = 10;
    const filled = Math.round((pct / 100) * total);
    return '█'.repeat(filled) + '░'.repeat(total - filled);
  };

  if (isFinished && computedProfile) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 font-mono space-y-8">
        {/* Diagnostic Result Card */}
        <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-800 pb-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">INFORME DIAGNÓSTICO GUARDADO</span>
              <h2 className="text-2xl font-bold font-sans text-neutral-100">
                PERFIL ORTOGRÁFICO CALIBRADO
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-500 block">PRECISIÓN INICIAL</span>
              <span className="text-3xl font-bold text-neutral-100">{computedProfile.globalPrecision}%</span>
            </div>
          </div>

          {/* Breakdown Bars */}
          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>01 ACENTUACIÓN (Agudas, llanas, esdrújulas, hiatos)</span>
                <span className="text-neutral-200 font-bold">{computedProfile.errorProfile.accentuation}%</span>
              </div>
              <div className="text-neutral-300">{getBar(computedProfile.errorProfile.accentuation)}</div>
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>02 GRAFÍAS DUDOSAS (B/V, G/J, C/S/Z, H)</span>
                <span className="text-neutral-200 font-bold">{computedProfile.errorProfile.spellings}%</span>
              </div>
              <div className="text-neutral-300">{getBar(computedProfile.errorProfile.spellings)}</div>
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>03 PUNTUACIÓN (Comas, conectores, incisos)</span>
                <span className="text-neutral-200 font-bold">{computedProfile.errorProfile.punctuation}%</span>
              </div>
              <div className="text-neutral-300">{getBar(computedProfile.errorProfile.punctuation)}</div>
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>04 MORFOLOGÍA & DERIVACIÓN (-mente, -ción)</span>
                <span className="text-neutral-200 font-bold">{computedProfile.errorProfile.morphology}%</span>
              </div>
              <div className="text-neutral-300">{getBar(computedProfile.errorProfile.morphology)}</div>
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>05 MAYÚSCULAS & MINÚSCULAS</span>
                <span className="text-neutral-200 font-bold">{computedProfile.errorProfile.capitals}%</span>
              </div>
              <div className="text-neutral-300">{getBar(computedProfile.errorProfile.capitals)}</div>
            </div>
          </div>

          {/* Critical Patterns */}
          <div className="border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-bold">
              PATRONES PRIORITARIOS A TRABAJAR:
            </span>
            <ul className="space-y-1.5 text-xs font-sans text-neutral-300">
              {computedProfile.topErrorPatterns.map((pat, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-amber-400 font-mono text-[10px] mt-0.5">►</span>
                  <span>{pat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action to proceed */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onNavigateToTraining}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-6 py-3 text-xs tracking-wider transition-colors inline-flex items-center space-x-2"
            >
              <span>INICIAR ENTRENAMIENTO PERSONALIZADO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setShowFeedback(false);
                setUserAnswers([]);
                setIsFinished(false);
              }}
              className="border border-neutral-800 hover:bg-neutral-900 text-neutral-300 px-4 py-3 text-xs tracking-wider transition-colors inline-flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REPETIR DIAGNÓSTICO</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-mono space-y-6">
      {/* Progress & Header */}
      <div className="border-b border-neutral-800 pb-3 flex justify-between items-center text-xs">
        <div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">TEST DE CALIBRACIÓN ELE</span>
          <span className="font-bold text-neutral-200">EVALUACIÓN DE PERFIL ORTOGRÁFICO</span>
        </div>
        <div className="text-neutral-400 font-bold">
          {currentIndex + 1} / {INITIAL_DIAGNOSTIC_QUESTIONS.length}
        </div>
      </div>

      {/* Question Card */}
      <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] text-neutral-500 uppercase">
            <span>CATEGORÍA: {currentQ.category}</span>
            <span>NIVEL {currentQ.level}</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold font-sans text-neutral-100 leading-snug">
            {currentQ.prompt}
          </h3>
        </div>

        {currentQ.sentenceContext && (
          <div className="bg-neutral-900 border border-neutral-800 p-3 text-xs font-sans text-neutral-300 italic">
            «{currentQ.sentenceContext}»
          </div>
        )}

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedAnswer === opt;
            const isCorrectAnswer = opt === currentQ.correctAnswer;

            let borderStyle = 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/40 text-neutral-200';
            if (showFeedback) {
              if (isCorrectAnswer) {
                borderStyle = 'border-emerald-700 bg-emerald-950/40 text-emerald-200';
              } else if (isSelected && !isCorrectAnswer) {
                borderStyle = 'border-amber-700 bg-amber-950/40 text-amber-200';
              }
            } else if (isSelected) {
              borderStyle = 'border-neutral-200 bg-neutral-900 text-neutral-100 font-bold';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(opt)}
                disabled={showFeedback}
                className={`w-full text-left p-4 border text-xs font-sans transition-all flex items-start space-x-3 ${borderStyle}`}
              >
                <span className="font-mono text-[11px] text-neutral-500 font-bold mt-0.5">
                  {String.fromCharCode(65 + idx)}.
                </span>
                <span className="flex-1 leading-relaxed">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Area */}
        {showFeedback && (
          <div className="border border-neutral-800 bg-neutral-900/90 p-4 space-y-2 animate-fadeIn text-xs">
            <div className="flex items-center space-x-2">
              {selectedAnswer === currentQ.correctAnswer ? (
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>RESPUESTA CORRECTA</span>
                </span>
              ) : (
                <span className="text-amber-400 font-bold flex items-center space-x-1">
                  <HelpCircle className="w-4 h-4" />
                  <span>REVISIÓN NORMATIVA</span>
                </span>
              )}
            </div>
            <p className="text-neutral-300 font-sans leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-2 border-t border-neutral-900">
          <span className="text-[11px] text-neutral-500">
            {showFeedback ? 'Revisá la explicación antes de continuar.' : 'Seleccioná la opción más adecuada.'}
          </span>

          {!showFeedback ? (
            <button
              onClick={handleConfirmAnswer}
              disabled={!selectedAnswer}
              className="bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 text-neutral-950 font-bold px-6 py-2.5 text-xs transition-colors"
            >
              CONFIRMAR
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-6 py-2.5 text-xs tracking-wider transition-colors inline-flex items-center space-x-1.5"
            >
              <span>{currentIndex + 1 === INITIAL_DIAGNOSTIC_QUESTIONS.length ? 'VER RESULTADOS' : 'SIGUIENTE'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
