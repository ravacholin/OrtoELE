import React, { useState } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine 
} from 'recharts';
import { srsManager } from '../utils/srsEngine';
import { UserProfile } from '../types';
import { TrendingUp, Activity, Brain, Clock, ShieldCheck, Sparkles, Layers } from 'lucide-react';

interface RetentionAnalyticsChartProps {
  profile: UserProfile;
}

export const RetentionAnalyticsChart: React.FC<RetentionAnalyticsChartProps> = ({ profile }) => {
  const [chartType, setChartType] = useState<'dominated' | 'forgetting_curve' | 'precision'>('dominated');

  const historyData = srsManager.getHistoricalProgressData();
  const forgettingData = srsManager.getForgettingCurveData();
  const lexiconBreakdown = srsManager.getLexiconStateBreakdown();

  const totalWords = lexiconBreakdown.reduce((acc, curr) => acc + curr.count, 0);
  const dominatedWords = profile.wordsDominated;
  const inTrainingWords = profile.wordsInTraining;

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-950 border border-neutral-700 p-3 shadow-xl text-xs font-mono space-y-1.5 min-w-[170px]">
          <p className="text-neutral-400 font-bold border-b border-neutral-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex justify-between items-center space-x-3 text-[11px]">
              <span style={{ color: entry.color }} className="flex items-center space-x-1">
                <span>■</span>
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold text-neutral-100">{entry.value} {entry.unit || ''}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border border-neutral-800 bg-neutral-950 p-6 space-y-6 font-mono">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-4 gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>ANALYTICS COGNITIVOS & PROGRESIÓN TEMPORAL</span>
          </div>
          <h3 className="text-lg font-bold font-sans text-neutral-100">
            Dinámica de Retención & Adquisición Léxica
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setChartType('dominated')}
            className={`px-3 py-1.5 text-xs font-mono border transition-all flex items-center space-x-1.5 ${
              chartType === 'dominated'
                ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300 font-bold'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Palabras Dominadas</span>
          </button>

          <button
            onClick={() => setChartType('forgetting_curve')}
            className={`px-3 py-1.5 text-xs font-mono border transition-all flex items-center space-x-1.5 ${
              chartType === 'forgetting_curve'
                ? 'border-amber-500 bg-amber-950/50 text-amber-300 font-bold'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Curva de Olvido (SRS)</span>
          </button>

          <button
            onClick={() => setChartType('precision')}
            className={`px-3 py-1.5 text-xs font-mono border transition-all flex items-center space-x-1.5 ${
              chartType === 'precision'
                ? 'border-blue-500 bg-blue-950/50 text-blue-300 font-bold'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Precisión & Retención (%)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-neutral-900/60 border border-neutral-800 p-3 space-y-0.5">
          <span className="text-[10px] text-neutral-500 block">CONSOLIDACIÓN TOTAL</span>
          <div className="text-xl font-bold text-emerald-400">
            {dominatedWords} <span className="text-xs text-neutral-500 font-normal">/ {totalWords} palabras</span>
          </div>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800 p-3 space-y-0.5">
          <span className="text-[10px] text-neutral-500 block">EN CURVA DE APRENDIZAJE</span>
          <div className="text-xl font-bold text-blue-400">
            {inTrainingWords} <span className="text-xs text-neutral-500 font-normal">palabras activas</span>
          </div>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800 p-3 space-y-0.5">
          <span className="text-[10px] text-neutral-500 block">RETENCIÓN PROYECTADA</span>
          <div className="text-xl font-bold text-amber-400">
            ~91% <span className="text-xs text-neutral-500 font-normal">a 30 días</span>
          </div>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800 p-3 space-y-0.5">
          <span className="text-[10px] text-neutral-500 block">INTERVALO MÁXIMO SRS</span>
          <div className="text-xl font-bold text-neutral-200">
            21 <span className="text-xs text-neutral-500 font-normal">días</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'dominated' ? (
            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDominated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorTraining" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="sessionLabel" stroke="#737373" fontSize={11} tickLine={false} />
              <YAxis stroke="#737373" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area 
                type="monotone" 
                dataKey="wordsDominated" 
                name="Palabras Dominadas" 
                stroke="#10b981" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorDominated)" 
              />
              <Area 
                type="monotone" 
                dataKey="wordsInTraining" 
                name="En Entrenamiento" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorTraining)" 
              />
              <Area 
                type="monotone" 
                dataKey="wordsUncertain" 
                name="Inciertas / Errores" 
                stroke="#f59e0b" 
                strokeWidth={1.5}
                fill="none" 
              />
            </AreaChart>
          ) : chartType === 'forgetting_curve' ? (
            <LineChart data={forgettingData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="dayLabel" stroke="#737373" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#737373" fontSize={11} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              
              <ReferenceLine y={50} stroke="#525252" strokeDasharray="3 3" label={{ value: 'Umbral 50%', fill: '#737373', fontSize: 10, position: 'insideBottomRight' }} />

              {/* Classical Ebbinghaus Curve */}
              <Line 
                type="monotone" 
                dataKey="sinRepaso" 
                name="Sin Repaso (Olvido Espontáneo)" 
                stroke="#ef4444" 
                strokeWidth={2} 
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#ef4444' }}
              />

              {/* Optimized Spaced Repetition Curve */}
              <Line 
                type="monotone" 
                dataKey="conSRS" 
                name="Con Repetición Espaciada SRS" 
                stroke="#10b981" 
                strokeWidth={2.5} 
                dot={{ r: 4, fill: '#10b981' }}
              />

              {/* Student Actual Estimated Retention */}
              <Line 
                type="monotone" 
                dataKey="estadoActualEstudiante" 
                name="Tu Retención Proyectada" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                dot={{ r: 3, fill: '#f59e0b' }}
              />
            </LineChart>
          ) : (
            <LineChart data={historyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="sessionLabel" stroke="#737373" fontSize={11} tickLine={false} />
              <YAxis domain={[40, 100]} stroke="#737373" fontSize={11} tickLine={false} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              <Line 
                type="monotone" 
                dataKey="globalPrecision" 
                name="Precisión Global" 
                stroke="#3b82f6" 
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#3b82f6' }}
              />

              <Line 
                type="monotone" 
                dataKey="retentionRate" 
                name="Tasa de Retención Léxica" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#10b981' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Explanatory Caption */}
      <div className="border-t border-neutral-900 pt-3 flex flex-col sm:flex-row justify-between text-[11px] text-neutral-400 gap-2 font-sans">
        {chartType === 'dominated' && (
          <p>
            <strong>Crecimiento del lexicón mental:</strong> Muestra la transición de palabras desde el estado inicial hacia la consolidación definitiva en la memoria a largo plazo.
          </p>
        )}
        {chartType === 'forgetting_curve' && (
          <p>
            <strong>Modelo matemático de Ebbinghaus:</strong> Cada repaso espaciado en el momento óptimo aplana la tasa de decaimiento y consolida la huella mnémica.
          </p>
        )}
        {chartType === 'precision' && (
          <p>
            <strong>Calibración de exactitud:</strong> Correlaciona la disminución de errores ortográficos con el número de sesiones acumuladas.
          </p>
        )}
        <span className="text-neutral-500 font-mono text-[10px] shrink-0">
          Motor SRS v1.2 · Intervalos Adaptativos
        </span>
      </div>
    </div>
  );
};
