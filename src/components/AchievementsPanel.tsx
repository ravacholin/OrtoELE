import React from 'react';
import { UserProfile } from '../types';
import { srsManager } from '../utils/srsEngine';
import { computeAchievements, summarizeAchievements, Achievement, AchievementTier } from '../utils/achievements';
import {
  Footprints, Activity, Trophy, Flame, CalendarCheck, Star, Sparkles, Award,
  Target, Crosshair, RefreshCw, Layers, BadgeCheck, KeyRound, Lock, Medal, LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Footprints, Activity, Trophy, Flame, CalendarCheck, Star, Sparkles, Award,
  Target, Crosshair, RefreshCw, Layers, BadgeCheck, KeyRound, Medal,
};

const TIER_STYLE: Record<AchievementTier, { border: string; text: string; label: string }> = {
  bronce: { border: 'border-amber-800/70', text: 'text-amber-600', label: 'BRONCE' },
  plata: { border: 'border-neutral-500/60', text: 'text-neutral-300', label: 'PLATA' },
  oro: { border: 'border-yellow-600/70', text: 'text-yellow-400', label: 'ORO' },
};

interface AchievementsPanelProps {
  profile: UserProfile;
}

const AchievementCard: React.FC<{ a: Achievement }> = ({ a }) => {
  const Icon = a.unlocked ? (ICONS[a.icon] || Medal) : Lock;
  const tier = TIER_STYLE[a.tier];
  const pct = Math.min(100, Math.round((a.current / a.target) * 100));

  return (
    <div
      className={`border bg-neutral-950 p-4 space-y-3 transition-colors ${
        a.unlocked ? `${tier.border} bg-neutral-900/30` : 'border-neutral-800/80'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 border flex items-center justify-center shrink-0 ${
              a.unlocked ? `${tier.border}` : 'border-neutral-800'
            }`}
          >
            <Icon className={`w-4 h-4 ${a.unlocked ? tier.text : 'text-neutral-600'}`} />
          </div>
          <div>
            <span className={`text-xs font-bold block font-sans ${a.unlocked ? 'text-neutral-100' : 'text-neutral-400'}`}>
              {a.title}
            </span>
            <span className={`text-[9px] font-mono uppercase tracking-wider ${a.unlocked ? tier.text : 'text-neutral-600'}`}>
              {tier.label}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[11px] font-sans text-neutral-400 leading-snug">{a.description}</p>

      {a.unlocked ? (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
          <BadgeCheck className="w-3 h-3" />
          <span>DESBLOQUEADO</span>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="h-1.5 bg-neutral-900 border border-neutral-800 overflow-hidden">
            <div className="h-full bg-neutral-600" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] font-mono text-neutral-500">
            {a.current} / {a.target} {a.unit}
          </span>
        </div>
      )}
    </div>
  );
};

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ profile }) => {
  const srsItems = Object.values(srsManager.getSrsItems());
  const achievements = computeAchievements(profile, srsItems);
  const { unlocked, total } = summarizeAchievements(achievements);

  // Desbloqueados primero (los más nuevos arriba), luego por progreso.
  const ordered = [...achievements].sort((x, y) => {
    if (x.unlocked !== y.unlocked) return x.unlocked ? -1 : 1;
    const px = x.current / x.target;
    const py = y.current / y.target;
    return py - px;
  });

  return (
    <div className="border border-neutral-800 bg-neutral-950 p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 gap-2 flex-wrap">
        <span className="font-mono text-xs font-bold tracking-wider text-neutral-200 uppercase flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          LOGROS
        </span>
        <span className="font-mono text-[11px] text-neutral-400">
          {unlocked} / {total} desbloqueados
        </span>
      </div>

      <p className="text-[11px] font-sans text-neutral-500 leading-relaxed -mt-1">
        Cada logro sale de tus datos reales: sesiones, palabras dominadas, racha y precisión. Nada inventado —
        si algo está bloqueado, todavía no lo lograste.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ordered.map((a) => (
          <AchievementCard key={a.id} a={a} />
        ))}
      </div>
    </div>
  );
};
