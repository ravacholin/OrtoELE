import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { Volume2, Sparkles, Terminal, BookOpen, RotateCcw, CheckCircle2, Flame, WifiOff, PenLine, KeyRound } from 'lucide-react';
import { speechService } from '../utils/speech';
import { swManager } from '../utils/serviceWorkerRegistration';

interface HeaderProps {
  profile: UserProfile;
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenCoach?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  currentView,
  onNavigate,
}) => {
  const [audioTesting, setAudioTesting] = React.useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    const unsubscribe = swManager.subscribe((online, ready) => {
      setIsOnline(online);
      setIsOfflineReady(ready);
    });
    return unsubscribe;
  }, []);

  const testAudio = () => {
    setAudioTesting(true);
    speechService.speak("Ortografía Lab. Laboratorio cognitivo activo.", {
      rate: 0.9,
      onEnd: () => setAudioTesting(false),
      onError: () => setAudioTesting(false),
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'INICIO', icon: Terminal },
    { id: 'training', label: 'ENTRENAR ORTOGRAFÍA', icon: BookOpen },
    { id: 'srs', label: 'REPASAR (SRS)', icon: RotateCcw },
    { id: 'review', label: 'REVISAR TEXTO', icon: PenLine },
    { id: 'escape', label: 'ESCAPE ORTO', icon: KeyRound },
    { id: 'diagnostic', label: 'DIAGNÓSTICO', icon: CheckCircle2 },
    { id: 'lexicon', label: 'VOCABULARIO', icon: Sparkles },
  ];

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/95 sticky top-0 z-40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Branding & Status Row */}
        <div className="flex flex-wrap items-center justify-between py-3 gap-3 border-b border-neutral-900">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="text-left group flex items-baseline space-x-2 focus:outline-none"
            >
              <span className="font-mono text-xl font-bold tracking-tight text-neutral-100 group-hover:text-neutral-300 transition-colors">
                ORTOGRAFÍA<span className="text-neutral-500">.LAB</span>
              </span>
              <span className="hidden sm:inline-block font-mono text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 uppercase tracking-wider">
                ELE · A1–C2
              </span>
            </button>
            <div className="hidden md:flex items-center space-x-1.5 text-xs text-neutral-500 font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>GRAFÍAS: B/V · S/C/Z · G/J · H</span>
            </div>
          </div>

          {/* Right Live Indicators */}
          <div className="flex items-center space-x-2 sm:space-x-4 text-xs font-mono">
            {/* Level Badge */}
            <div className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-neutral-300 flex items-center space-x-1.5">
              <span className="text-neutral-500">NIVEL:</span>
              <span className="font-semibold text-neutral-100 uppercase">{profile.level === 'unassigned' ? 'B1 (AUTO)' : profile.level}</span>
            </div>

            {/* Precision Metric */}
            <div className="hidden sm:flex bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-neutral-300 items-center space-x-1.5">
              <span className="text-neutral-500">PRECISIÓN:</span>
              <span className="font-semibold text-neutral-100">{profile.globalPrecision}%</span>
            </div>

            {/* Streak */}
            <div className="bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-neutral-300 flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{profile.streakDays}d</span>
            </div>

            {/* Offline / Online Service Worker Status */}
            <div 
              title={isOnline ? (isOfflineReady ? "Caché sin conexión activa" : "En línea") : "Modo sin conexión: progreso guardado localmente"}
              className={`hidden sm:flex px-2 py-1 border text-[11px] items-center space-x-1.5 ${
                !isOnline 
                  ? 'border-amber-700 bg-amber-950/60 text-amber-300' 
                  : isOfflineReady 
                    ? 'border-emerald-800/80 bg-emerald-950/40 text-emerald-300' 
                    : 'border-neutral-800 bg-neutral-900 text-neutral-400'
              }`}
            >
              {!isOnline ? (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span className="font-bold">OFFLINE</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>OFFLINE READY</span>
                </>
              )}
            </div>

            {/* Audio Check Button */}
            <button
              onClick={testAudio}
              title="Probar audio en español"
              className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <Volume2 className={`w-3.5 h-3.5 ${audioTesting ? 'text-amber-400 animate-pulse' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-neutral-100 text-neutral-950 font-bold border-neutral-100 shadow-sm'
                    : 'bg-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-neutral-950' : 'text-neutral-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
