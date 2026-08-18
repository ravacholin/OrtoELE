import React, { useState } from 'react';
import { UserProfile, OrthoWordItem, SrsItemState } from '../types';
import { 
  Play, CheckCircle2, RotateCcw, PenTool, Sparkles, BookOpen, Award, Users, 
  AlertTriangle, ArrowRight, Eye, Volume2, Target, ShieldAlert, Brain, Zap, Filter, TrendingUp
} from 'lucide-react';
import { srsManager } from '../utils/srsEngine';
import { speechService } from '../utils/speech';
import { assembleDailyChallenge, todayKey } from '../utils/proceduralEngine';
import { RetentionAnalyticsChart } from './RetentionAnalyticsChart';

const CATEGORY_LABEL: Record<string, string> = {
  accentuation: 'Acentuación',
  spellings: 'Grafías',
  punctuation: 'Puntuación',
  morphology: 'Morfología',
  capitals: 'Mayúsculas',
};

interface DashboardProps {
  profile: UserProfile;
  onNavigate: (view: string, subcategory?: string) => void;
  onStartRecommendedSession: () => void;
  onOpenCoach?: (targetWord?: OrthoWordItem, sentence?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  onNavigate,
  onStartRecommendedSession,
  onOpenCoach,
}) => {
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'analytics' | 'recurrent_errors'>('overview');
  const [errorCategoryFilter, setErrorCategoryFilter] = useState<string>('all');

  const recurrentErrors = srsManager.getDetailedRecurrentMistakes();

  // Desafío del día (§37): ensamblado determinista por fecha, priorizando
  // las categorías más débiles del perfil. Estado de completado por día en
  // localStorage (se reinicia solo al cambiar la fecha).
  const dailyKey = todayKey();
  const dailyChallenge = assembleDailyChallenge(dailyKey, profile.errorProfile);
  const [challengeDone, setChallengeDone] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`ortolab-daily-${dailyKey}`) === 'done';
    } catch {
      return false;
    }
  });
  const completeChallenge = () => {
    try {
      localStorage.setItem(`ortolab-daily-${dailyKey}`, 'done');
    } catch {
      /* almacenamiento no disponible: se mantiene solo en memoria */
    }
    setChallengeDone(true);
  };

  const filteredErrors = recurrentErrors.filter(item => {
    if (errorCategoryFilter === 'all') return true;
    return item.wordItem.category === errorCategoryFilter;
  });

  const getProgressBar = (val: number) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round((val / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
  };

  const handleStartFocusedTraining = (specificWordId?: string) => {
    if (specificWordId) {
      onNavigate('training', 'fotografia');
    } else {
      onNavigate('training', 'recurrentes');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 font-mono">
      {/* Dashboard Sub-View Switcher */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-3 gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDashboardTab('overview')}
            className={`px-4 py-2 text-xs font-bold transition-all border ${
              dashboardTab === 'overview'
                ? 'border-neutral-100 bg-neutral-100 text-neutral-950 shadow-sm'
                : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            VISTA GENERAL
          </button>

          <button
            onClick={() => setDashboardTab('analytics')}
            className={`px-4 py-2 text-xs font-bold transition-all border flex items-center space-x-2 ${
              dashboardTab === 'analytics'
                ? 'border-emerald-400 bg-emerald-400 text-neutral-950 shadow-sm'
                : 'border-neutral-800 bg-neutral-950 text-emerald-400 hover:border-emerald-800/80'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>CURVA DE OLVIDO & ANALYTICS</span>
          </button>

          <button
            onClick={() => setDashboardTab('recurrent_errors')}
            className={`px-4 py-2 text-xs font-bold transition-all border flex items-center space-x-2 ${
              dashboardTab === 'recurrent_errors'
                ? 'border-amber-400 bg-amber-400 text-neutral-950 shadow-sm'
                : 'border-neutral-800 bg-neutral-950 text-amber-400 hover:border-amber-900/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ERRORES RECURRENTES ({recurrentErrors.length})</span>
          </button>
        </div>

        <div className="text-[11px] text-neutral-500">
          Estado: <strong className="text-neutral-300">Sesión {profile.sessionsCompleted + 1}</strong> · Racha: <strong className="text-amber-400">{profile.streakDays}d</strong>
        </div>
      </div>

      {dashboardTab === 'overview' ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Hero / Command Banner */}
          <div className="border border-neutral-800 bg-neutral-950 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative overflow-hidden">
            <div className="space-y-3 z-10">
              <div className="inline-flex items-center space-x-2 text-xs font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span>SESIÓN {profile.sessionsCompleted + 1} LISTA</span>
                <span className="text-neutral-600">|</span>
                <span>OBJETIVO: {profile.goal.toUpperCase()}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-100 font-sans">
                Entrená tu español escrito.
              </h1>
              <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed font-sans">
                Laboratorio cognitivo de adquisición ortográfica. Recuperación activa, contrastes mínimos y memoria ideovisual sin memorización pasiva de reglas.
              </p>
            </div>

            {/* Big Action CTA */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 z-10 min-w-[260px]">
              <button
                onClick={onStartRecommendedSession}
                className="flex items-center justify-center space-x-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-950 px-6 py-4 font-mono font-bold text-sm tracking-wider transition-all shadow-lg active:scale-[0.99]"
              >
                <Play className="w-4 h-4 fill-neutral-950" />
                <span>EMPEZAR SESIÓN</span>
              </button>

              {recurrentErrors.length > 0 ? (
                <button
                  onClick={() => setDashboardTab('recurrent_errors')}
                  className="flex items-center justify-center space-x-2 border border-amber-900/80 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 px-4 py-2.5 text-xs font-mono transition-colors"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Ver {recurrentErrors.length} errores recurrentes</span>
                </button>
              ) : (
                <div className="text-[11px] font-mono text-neutral-500 text-center sm:text-left lg:text-center">
                  Recomendado: 8 palabras + 3 contrastes + 1 dictado
                </div>
              )}
            </div>
          </div>

          {/* Primary Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="border border-neutral-800 bg-neutral-950 p-4 space-y-1">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">PRECISIÓN GLOBAL</span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-neutral-100">
                {profile.globalPrecision}%
              </div>
              <span className="text-[11px] font-mono text-emerald-400 block">+3.8% esta semana</span>
            </div>

            {/* Metric 2 */}
            <div className="border border-neutral-800 bg-neutral-950 p-4 space-y-1">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">PALABRAS DOMINADAS</span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-neutral-100">
                {profile.wordsDominated}
              </div>
              <span className="text-[11px] font-mono text-neutral-400 block">{profile.wordsInTraining} en entrenamiento SRS</span>
            </div>

            {/* Metric 3 */}
            <div className="border border-neutral-800 bg-neutral-950 p-4 space-y-1">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">RACHA COGNITIVA</span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-neutral-100">
                {profile.streakDays} <span className="text-sm font-normal text-neutral-500">días</span>
              </div>
              <span className="text-[11px] font-mono text-amber-400 block">Récord activo</span>
            </div>

            {/* Metric 4 */}
            <div className="border border-neutral-800 bg-neutral-950 p-4 space-y-1">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">NIVEL MCER ACTIVO</span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-neutral-100 uppercase">
                {profile.level === 'unassigned' ? 'B1' : profile.level}
              </div>
              <span className="text-[11px] font-mono text-neutral-400 block">L1: {profile.l1}</span>
            </div>
          </div>

          {/* DESAFÍO DEL DÍA (§37) — ensamblado procedural, sin IA */}
          <div className="border border-neutral-800 bg-neutral-950 p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold tracking-wider text-neutral-100">DESAFÍO DEL DÍA</span>
                <span className="text-[10px] text-neutral-600 font-mono">{dailyChallenge.dateKey}</span>
              </div>
              {challengeDone ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completado
                </span>
              ) : (
                <span className="text-[11px] text-neutral-500 font-mono">~{dailyChallenge.estimatedMinutes} min</span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 font-sans">
              Enfoque de hoy:{' '}
              <span className="text-neutral-200">
                {dailyChallenge.focusCategories.map((c) => CATEGORY_LABEL[c] || c).join(' · ')}
              </span>{' '}
              — tus categorías más débiles según el perfil de error.
            </p>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {dailyChallenge.segments.map((s, i) => (
                <div
                  key={`${s.refId}-${i}`}
                  className="flex items-center gap-2 text-[11px] font-mono text-neutral-300 border border-neutral-800 bg-neutral-900/40 px-2 py-1.5"
                >
                  <span className="w-4 h-4 flex items-center justify-center text-[9px] bg-neutral-800 text-neutral-400 shrink-0">
                    {i + 1}
                  </span>
                  <span className="truncate">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={onStartRecommendedSession}
                className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-4 py-2 text-xs tracking-wider transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-neutral-950" />
                <span>EMPEZAR DESAFÍO</span>
              </button>
              {!challengeDone && (
                <button
                  onClick={completeChallenge}
                  className="flex items-center gap-2 border border-neutral-800 bg-neutral-950 hover:border-neutral-600 text-neutral-300 px-4 py-2 text-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Marcar como completado</span>
                </button>
              )}
            </div>
          </div>

          {/* Secondary Quick Action Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            <button
              onClick={() => onNavigate('diagnostic')}
              className="border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 p-3 text-left font-mono text-xs transition-colors group"
            >
              <CheckCircle2 className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200 mb-1.5" />
              <span className="text-neutral-300 font-bold block">Diagnóstico</span>
              <span className="text-[10px] text-neutral-500">Evaluar nivel</span>
            </button>

            <button
              onClick={() => onNavigate('training')}
              className="border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 p-3 text-left font-mono text-xs transition-colors group"
            >
              <BookOpen className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200 mb-1.5" />
              <span className="text-neutral-300 font-bold block">Entrenar</span>
              <span className="text-[10px] text-neutral-500">Módulos activos</span>
            </button>

            <button
              onClick={() => onNavigate('writing')}
              className="border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 p-3 text-left font-mono text-xs transition-colors group"
            >
              <PenTool className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200 mb-1.5" />
              <span className="text-neutral-300 font-bold block">Escribir</span>
              <span className="text-[10px] text-neutral-500">Producción libre</span>
            </button>

            <button
              onClick={() => onNavigate('srs')}
              className="border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 p-3 text-left font-mono text-xs transition-colors group"
            >
              <RotateCcw className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200 mb-1.5" />
              <span className="text-neutral-300 font-bold block">Repasar</span>
              <span className="text-[10px] text-neutral-500">Motor SRS</span>
            </button>

            <button
              onClick={() => onNavigate('lexicon')}
              className="border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 p-3 text-left font-mono text-xs transition-colors group"
            >
              <Sparkles className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200 mb-1.5" />
              <span className="text-neutral-300 font-bold block">Vocabulario</span>
              <span className="text-[10px] text-neutral-500">Lexicón mental</span>
            </button>

            <button
              onClick={() => onNavigate('escape')}
              className="border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 p-3 text-left font-mono text-xs transition-colors group"
            >
              <Award className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200 mb-1.5" />
              <span className="text-neutral-300 font-bold block">Escape Orto</span>
              <span className="text-[10px] text-neutral-500">5 Cerraduras</span>
            </button>

            <button
              onClick={() => onNavigate('teacher')}
              className="border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 p-3 text-left font-mono text-xs transition-colors group col-span-2 sm:col-span-1"
            >
              <Users className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200 mb-1.5" />
              <span className="text-neutral-300 font-bold block">Modo Docente</span>
              <span className="text-[10px] text-neutral-500">Guías & L1</span>
            </button>
          </div>

          {/* Profile & Errors Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Orthographic Profile Bars (7 Cols) */}
            <div className="lg:col-span-7 border border-neutral-800 bg-neutral-950 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span className="font-mono text-xs font-bold tracking-wider text-neutral-200 uppercase">
                  PERFIL ORTOGRÁFICO
                </span>
                <span className="font-mono text-[10px] text-neutral-500">CALIBRACIÓN COGNITIVA</span>
              </div>

              <div className="space-y-3.5 font-mono text-xs">
                {/* Acentuación */}
                <div>
                  <div className="flex justify-between mb-1 text-neutral-300">
                    <span>ACENTUACIÓN</span>
                    <span className="text-neutral-400">{profile.errorProfile.accentuation}%</span>
                  </div>
                  <div className="text-neutral-500 tracking-tighter text-sm">
                    {getProgressBar(profile.errorProfile.accentuation)}
                  </div>
                </div>

                {/* Grafías */}
                <div>
                  <div className="flex justify-between mb-1 text-neutral-300">
                    <span>GRAFÍAS (B/V, G/J, H...)</span>
                    <span className="text-neutral-400">{profile.errorProfile.spellings}%</span>
                  </div>
                  <div className="text-neutral-500 tracking-tighter text-sm">
                    {getProgressBar(profile.errorProfile.spellings)}
                  </div>
                </div>

                {/* Puntuación */}
                <div>
                  <div className="flex justify-between mb-1 text-neutral-300">
                    <span>PUNTUACIÓN (COMAS, PUNTOS)</span>
                    <span className="text-neutral-400">{profile.errorProfile.punctuation}%</span>
                  </div>
                  <div className="text-neutral-500 tracking-tighter text-sm">
                    {getProgressBar(profile.errorProfile.punctuation)}
                  </div>
                </div>

                {/* Morfología */}
                <div>
                  <div className="flex justify-between mb-1 text-neutral-300">
                    <span>MORFOLOGÍA & SUFIJOS</span>
                    <span className="text-neutral-400">{profile.errorProfile.morphology}%</span>
                  </div>
                  <div className="text-neutral-500 tracking-tighter text-sm">
                    {getProgressBar(profile.errorProfile.morphology)}
                  </div>
                </div>

                {/* Mayúsculas */}
                <div>
                  <div className="flex justify-between mb-1 text-neutral-300">
                    <span>MAYÚSCULAS & CONVENCIONES</span>
                    <span className="text-neutral-400">{profile.errorProfile.capitals}%</span>
                  </div>
                  <div className="text-neutral-500 tracking-tighter text-sm">
                    {getProgressBar(profile.errorProfile.capitals)}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Error Patterns & Focus (5 Cols) */}
            <div className="lg:col-span-5 border border-neutral-800 bg-neutral-950 p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="font-mono text-xs font-bold tracking-wider text-neutral-200 uppercase flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    TUS 3 PATRONES PRINCIPALES
                  </span>
                  <button
                    onClick={() => setDashboardTab('recurrent_errors')}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Ver detalles
                  </button>
                </div>

                <div className="space-y-2.5">
                  {profile.topErrorPatterns.map((pat, idx) => (
                    <div key={idx} className="border border-neutral-900 bg-neutral-900/50 p-3 flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] text-neutral-500 block">PATRÓN 0{idx + 1}</span>
                        <p className="text-xs text-neutral-200 font-sans font-medium">{pat}</p>
                      </div>
                      <button
                        onClick={() => onNavigate('training')}
                        className="p-1 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors shrink-0"
                        title="Entrenar este patrón"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Socratic philosophy quote */}
              <div className="border-t border-neutral-900 pt-3 text-[11px] font-mono text-neutral-500 leading-relaxed italic">
                «La ortografía no se enseña mediante la acumulación de reglas, sino construyendo representaciones estables en el lexicón mental.»
              </div>
            </div>
          </div>

          {/* Cognitive Retention & Mastered Words Analytics Visualizer (Recharts) */}
          <RetentionAnalyticsChart profile={profile} />

          {/* Specialized Laboratory Modules Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-400">
                MÓDULOS DE ENTRENAMIENTO COGNITIVO
              </span>
              <button
                onClick={() => onNavigate('training')}
                className="font-mono text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {/* Module 1 */}
              <div 
                onClick={() => onNavigate('training', 'contrastes')}
                className="border border-neutral-800 bg-neutral-950 p-4 hover:border-neutral-700 transition-colors cursor-pointer space-y-2"
              >
                <div className="text-neutral-500 text-[10px]">01 // TRÍADAS & CONTRASTES</div>
                <div className="text-sm font-bold text-neutral-200">médico / medico / medicó</div>
                <p className="text-[11px] font-sans text-neutral-400 leading-normal">
                  Inferí la relación entre forma gráfica, pronunciación prosódica, significado y función gramatical.
                </p>
              </div>

              {/* Module 2 */}
              <div 
                onClick={() => onNavigate('training', 'fotografia')}
                className="border border-neutral-800 bg-neutral-950 p-4 hover:border-neutral-700 transition-colors cursor-pointer space-y-2"
              >
                <div className="text-neutral-500 text-[10px]">02 // MEMORIA IDEOVISUAL</div>
                <div className="text-sm font-bold text-neutral-200 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  Modo Fotografía Mental
                </div>
                <p className="text-[11px] font-sans text-neutral-400 leading-normal">
                  Exposición breve de 2-5s a grafías dudosas, distractor cognitivo y recuperación diferida activa.
                </p>
              </div>

              {/* Module 3 */}
              <div 
                onClick={() => onNavigate('training', 'dictado')}
                className="border border-neutral-800 bg-neutral-950 p-4 hover:border-neutral-700 transition-colors cursor-pointer space-y-2"
              >
                <div className="text-neutral-500 text-[10px]">03 // TRANSCODIFICACIÓN</div>
                <div className="text-sm font-bold text-neutral-200 flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  Dictado Inteligente
                </div>
                <p className="text-[11px] font-sans text-neutral-400 leading-normal">
                  Escuchar voz natural a velocidad adaptable, escribir y recibir análisis de tildes, omisiones y segmentación.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : dashboardTab === 'analytics' ? (
        /* DEDICATED ANALYTICS VIEW */
        <div className="space-y-6 animate-fadeIn">
          <RetentionAnalyticsChart profile={profile} />
          
          <div className="border border-neutral-800 bg-neutral-950 p-6 space-y-4">
            <h4 className="text-sm font-bold font-sans text-neutral-100 flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>Fundamentación Teórica del Modelo de Memoria</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-neutral-400">
              <div className="bg-neutral-900/60 p-4 border border-neutral-800 space-y-1">
                <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold block">1. Ley del Decaimiento</span>
                <p>La curva de olvido (Ebbinghaus, 1885) postula una pérdida logarítmica del recuerdo en ausencia de refuerzo activo.</p>
              </div>
              <div className="bg-neutral-900/60 p-4 border border-neutral-800 space-y-1">
                <span className="font-mono text-[10px] text-blue-400 uppercase font-bold block">2. Repetición Espaciada</span>
                <p>Al programar repasos justo antes del punto crítico de olvido, la pendiente de decaimiento se aplana exponencialmente.</p>
              </div>
              <div className="bg-neutral-900/60 p-4 border border-neutral-800 space-y-1">
                <span className="font-mono text-[10px] text-amber-400 uppercase font-bold block">3. Huella Ideovisual</span>
                <p>El anclaje visual y semántico de la grafía dudosa consolida la representación ortográfica en el lexicón mental a largo plazo.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* DEDICATED RECURRENT ERRORS VIEW */
        <div className="space-y-6 animate-fadeIn">
          {/* Top Focus Action Banner */}
          <div className="border border-amber-900/60 bg-amber-950/20 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 text-[10px] font-mono text-amber-400 uppercase tracking-widest bg-amber-950/60 border border-amber-800/80 px-2.5 py-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>DIAGNÓSTICO CONTINUO DE VULNERABILIDADES</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-sans text-neutral-100">
                Puntos Críticos & Errores Recurrentes
              </h2>
              <p className="text-xs font-sans text-neutral-300 max-w-2xl leading-relaxed">
                El algoritmo analiza tus respuestas en tiempo real para detectar interferencias morfológicas, omisión de tildes y grafías dudosas no consolidadas.
              </p>
            </div>

            {filteredErrors.length > 0 && (
              <div className="shrink-0">
                <button
                  onClick={() => handleStartFocusedTraining()}
                  className="bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold px-6 py-3.5 text-xs tracking-wider transition-all flex items-center space-x-2 shadow-lg hover:shadow-amber-950/50"
                >
                  <Zap className="w-4 h-4 fill-neutral-950" />
                  <span>ENTRENAR ESTOS {filteredErrors.length} ÍTEMS</span>
                </button>
              </div>
            )}
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950 p-4 border border-neutral-800 text-xs">
            <div className="flex items-center space-x-2 text-neutral-400">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <span>Filtrar por categoría:</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'accentuation', label: 'Acentuación' },
                { id: 'spellings', label: 'Grafías (B/V, G/J, H)' },
                { id: 'punctuation', label: 'Puntuación' },
                { id: 'morphology', label: 'Morfología' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setErrorCategoryFilter(cat.id)}
                  className={`px-3 py-1 text-xs border transition-colors ${
                    errorCategoryFilter === cat.id
                      ? 'border-neutral-100 bg-neutral-100 text-neutral-950 font-bold'
                      : 'border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Cards Grid */}
          {filteredErrors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredErrors.map(({ srsItem, wordItem, mistakeRate }) => (
                <div
                  key={srsItem.wordId}
                  className="border border-neutral-800 bg-neutral-950 p-5 space-y-4 hover:border-neutral-700 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header: Word & Category */}
                    <div className="flex items-start justify-between border-b border-neutral-800 pb-2.5">
                      <div>
                        <span className="text-xl font-bold text-neutral-100 font-mono group-hover:text-amber-300 transition-colors">
                          {wordItem.word}
                        </span>
                        <span className="text-[10px] text-neutral-500 uppercase block font-sans">
                          {wordItem.subcategory || wordItem.category}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 uppercase font-bold border ${
                        srsItem.state === 'INCIERTO' 
                          ? 'border-amber-800 bg-amber-950/40 text-amber-300' 
                          : 'border-blue-800 bg-blue-950/40 text-blue-300'
                      }`}>
                        {srsItem.state}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-neutral-900 p-2 border border-neutral-800">
                        <span className="text-[9px] text-neutral-500 block">FALLOS</span>
                        <span className="font-bold text-amber-400">{srsItem.mistakesCount}</span>
                      </div>
                      <div className="bg-neutral-900 p-2 border border-neutral-800">
                        <span className="text-[9px] text-neutral-500 block">INTENTOS</span>
                        <span className="font-bold text-neutral-200">{srsItem.totalAttempts}</span>
                      </div>
                      <div className="bg-neutral-900 p-2 border border-neutral-800">
                        <span className="text-[9px] text-neutral-500 block">TASA ERROR</span>
                        <span className="font-bold text-neutral-300">{mistakeRate}%</span>
                      </div>
                    </div>

                    {/* Common mistakes */}
                    {wordItem.commonErrors && wordItem.commonErrors.length > 0 && (
                      <div className="bg-neutral-900/60 border border-neutral-800 p-2.5 space-y-1 text-xs font-sans">
                        <span className="text-[10px] text-neutral-500 font-mono uppercase block">Confusiones detectadas:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {wordItem.commonErrors.map((err, i) => (
                            <span key={i} className="text-amber-400 font-mono text-[11px] line-through">
                              {err}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rule / Clue */}
                    <div className="text-xs font-sans text-neutral-400 leading-relaxed">
                      {wordItem.rule}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenCoach && onOpenCoach(wordItem)}
                      className="text-xs text-neutral-400 hover:text-neutral-200 underline"
                    >
                      Pista socrática
                    </button>

                    <button
                      onClick={() => handleStartFocusedTraining(wordItem.id)}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-3.5 py-1.5 text-xs transition-colors flex items-center space-x-1"
                    >
                      <span>Entrenar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-neutral-800 bg-neutral-950 p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-sans text-neutral-100">
                  ¡No se registran errores recurrentes en esta categoría!
                </h3>
                <p className="text-xs font-sans text-neutral-400 max-w-md mx-auto">
                  Tus representaciones ortográficas para estos términos se encuentran en estado estable o dominado.
                </p>
              </div>
              <button
                onClick={() => setDashboardTab('overview')}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold px-5 py-2.5 text-xs transition-colors"
              >
                VOLVER A LA VISTA GENERAL
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
