import React, { useState } from 'react';
import { Level, L1Language, UserProfile } from '../types';
import { ChevronRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (updatedProfile: Partial<UserProfile>, startDiagnostic: boolean) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedLevel, setSelectedLevel] = useState<Level>('B1');
  const [selectedL1, setSelectedL1] = useState<L1Language>('inglés');
  const [selectedGoal, setSelectedGoal] = useState<string>('mejorar acentuación y ortografía');

  if (!isOpen) return null;

  const levels: { id: Level; title: string; desc: string }[] = [
    { id: 'A1', title: 'A1 · Acceso', desc: 'Correspondencia grafía-sonido, mayúsculas, h y b/v básicas.' },
    { id: 'A2', title: 'A2 · Plataforma', desc: 'Agudas, llanas, esdrújulas, g/j, h y dictados cotidianos.' },
    { id: 'B1', title: 'B1 · Umbral', desc: 'Hiatos, tilde diacrítica, interrogativos, sufijos -ción/-sión.' },
    { id: 'B2', title: 'B2 · Avanzado', desc: 'Adverbios en -mente, homófonos (b/v, c/s/z), puntuación discursiva.' },
    { id: 'C1', title: 'C1 · Dominio Operativo', desc: 'Incisos, punto y coma, mayúsculas editoriales, ortografía discursiva.' },
    { id: 'C2', title: 'C2 · Maestría', desc: 'Estilo editorial, textos académicos, matices ortotipográficos.' },
    { id: 'unassigned', title: 'No sé / Diagnóstico', desc: 'El sistema calibrará automáticamente tu nivel ortográfico.' },
  ];

  const languages: { id: L1Language; label: string; tip: string }[] = [
    { id: 'inglés', label: 'Inglés', tip: 'Riesgo: mayúsculas en días/meses, dobles consonantes (ss, mm, tt), omisión de tildes.' },
    { id: 'francés', label: 'Francés', tip: 'Riesgo: confusión c/s/z, alternancia b/v, tildes invertidas.' },
    { id: 'portugués', label: 'Portugués', tip: 'Riesgo: interferencia b/v, sufijos -ção vs -ción, tildes diacríticas.' },
    { id: 'italiano', label: 'Italiano', tip: 'Riesgo: dobles consonantes, g/j, acento fonológico vs ortográfico.' },
    { id: 'alemán', label: 'Alemán', tip: 'Riesgo: mayúsculas en sustantivos comunes, comas estructurales.' },
    { id: 'chino', label: 'Chino', tip: 'Riesgo: percepción silábica, distinción r/rr, hiatos y diptongos.' },
    { id: 'japonés', label: 'Japonés', tip: 'Riesgo: grupos consonánticos, distinción b/v, l/r.' },
    { id: 'ruso', label: 'Ruso', tip: 'Riesgo: transliteración fonética, distinción c/z y s.' },
    { id: 'árabe', label: 'Árabe', tip: 'Riesgo: distinción p/b, vocales cortas vs tildes en español.' },
    { id: 'español', label: 'Español', tip: 'Hablante nativo o de herencia que desea pulir norma y acentuación.' },
    { id: 'otra', label: 'Otra lengua', tip: 'Detección adaptativa de patrones de interferencia.' },
  ];

  const goals = [
    { id: 'mejorar ortografía general', label: 'Mejorar ortografía general y seguridad al escribir' },
    { id: 'mejorar acentuación', label: 'Dominar tildes, hiatos, esdrújulas y diacrítica' },
    { id: 'escribir textos académicos', label: 'Redactar textos académicos, ensayos o informes' },
    { id: 'escribir textos profesionales', label: 'Escritura corporativa, correos formales y precisión' },
    { id: 'preparar examen oficial (DELE/SIELE)', label: 'Preparación para exámenes oficiales (DELE / SIELE)' },
    { id: 'practicar por placer', label: 'Entrenamiento cognitivo por curiosidad lingüística' },
  ];

  const handleFinish = (withDiagnostic: boolean) => {
    onComplete(
      {
        level: selectedLevel,
        l1: selectedL1,
        goal: selectedGoal,
        onboardingCompleted: true,
      },
      withDiagnostic
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl font-mono">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 text-xs">
          <span className="font-bold text-neutral-200">
            CALIBRACIÓN INICIAL // PASO 0{step} DE 04
          </span>
          <span className="text-neutral-500">ORTOGRAFÍA LAB ELE</span>
        </div>

        {/* Step 1: Level */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-sans text-neutral-100">
              ¿Cuál es tu nivel aproximado de español?
            </h2>
            <p className="text-xs font-sans text-neutral-400">
              Seleccioná tu nivel de referencia según el MCER. No te preocupes: el laboratorio adaptará la dificultad de manera progresiva.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {levels.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`p-3 text-left border transition-all text-xs ${
                    selectedLevel === lvl.id
                      ? 'border-neutral-100 bg-neutral-900 text-neutral-100'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{lvl.title}</span>
                    {selectedLevel === lvl.id && <Check className="w-3.5 h-3.5 text-neutral-100" />}
                  </div>
                  <div className="text-[11px] font-sans text-neutral-500 mt-1">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: L1 Mother Tongue */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-sans text-neutral-100">
              ¿Cuál es tu lengua materna (L1)?
            </h2>
            <p className="text-xs font-sans text-neutral-400">
              Utilizamos esta información para mapear interferencias fonológicas y ortográficas específicas de tu lengua de origen.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 max-h-72 overflow-y-auto pr-1">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedL1(lang.id)}
                  className={`p-2.5 text-left border transition-all text-xs ${
                    selectedL1 === lang.id
                      ? 'border-neutral-100 bg-neutral-900 text-neutral-100'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{lang.label}</span>
                    {selectedL1 === lang.id && <Check className="w-3 h-3 text-neutral-100" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Interference hint box */}
            {selectedL1 && (
              <div className="bg-neutral-900 border border-neutral-800 p-3 text-xs">
                <span className="text-[10px] text-neutral-500 block uppercase mb-0.5">Patrón de riesgo L1 detectado:</span>
                <span className="text-neutral-300 font-sans">
                  {languages.find(l => l.id === selectedL1)?.tip}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Objective */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-sans text-neutral-100">
              ¿Cuál es tu objetivo principal?
            </h2>
            <p className="text-xs font-sans text-neutral-400">
              Personalizaremos los textos de producción y el orden de los módulos de entrenamiento.
            </p>

            <div className="space-y-2 pt-2">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGoal(g.id)}
                  className={`w-full p-3 text-left border transition-all text-xs ${
                    selectedGoal === g.id
                      ? 'border-neutral-100 bg-neutral-900 text-neutral-100'
                      : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between font-sans">
                    <span>{g.label}</span>
                    {selectedGoal === g.id && <Check className="w-3.5 h-3.5 text-neutral-100 shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Final Confirmation */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold font-sans text-neutral-100">
              Perfil configurado con éxito.
            </h2>
            <p className="text-xs font-sans text-neutral-400 leading-relaxed">
              El laboratorio está listo. Te sugerimos realizar un <strong>diagnóstico inicial adaptativo (10 preguntas)</strong> para generar tu primer <em>Perfil Ortográfico</em> exacto.
            </p>

            <div className="border border-neutral-800 bg-neutral-900/50 p-4 space-y-2 text-xs">
              <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                <span className="text-neutral-500">NIVEL SELECCIONADO:</span>
                <span className="font-bold text-neutral-200 uppercase">{selectedLevel}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                <span className="text-neutral-500">LENGUA MATERNA (L1):</span>
                <span className="font-bold text-neutral-200 capitalize">{selectedL1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">OBJETIVO:</span>
                <span className="font-bold text-neutral-200 text-right">{selectedGoal}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => handleFinish(true)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold p-3 text-xs tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>REALIZAR DIAGNÓSTICO AHORA</span>
              </button>
              <button
                onClick={() => handleFinish(false)}
                className="border border-neutral-800 hover:bg-neutral-900 text-neutral-300 font-bold p-3 text-xs tracking-wider transition-colors"
              >
                IR AL DASHBOARD
              </button>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        {step < 4 && (
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800 text-xs">
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center space-x-1 text-neutral-400 hover:text-neutral-200 px-3 py-1.5 border border-neutral-800 hover:bg-neutral-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ATRÁS</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center space-x-2 bg-neutral-100 text-neutral-950 font-bold px-4 py-2 hover:bg-neutral-300 transition-colors"
            >
              <span>SIGUIENTE</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
