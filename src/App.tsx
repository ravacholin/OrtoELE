import React, { useState, useEffect } from 'react';
import { UserProfile, OrthoWordItem, SessionPlan } from './types';
import { srsManager } from './utils/srsEngine';
import { buildSession, buildMistakeSession, buildSessionFromDaily, SessionFocus } from './utils/sessionEngine';
import { assembleDailyChallenge, todayKey } from './utils/proceduralEngine';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { OnboardingModal } from './components/OnboardingModal';
import { DiagnosticView } from './components/DiagnosticView';
import { TrainingHub } from './components/TrainingHub';
import { SessionRunner } from './components/SessionRunner';
import { SrsReviewView } from './components/SrsReviewView';
import { VocabularyLexicon } from './components/VocabularyLexicon';
import { SocraticCoachDrawer } from './components/SocraticCoachDrawer';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(srsManager.getProfile());
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [trainingSubcategory, setTrainingSubcategory] = useState<string>('grafias');

  // Sesión activa (motor de sesión). Cuando no es null, se muestra el runner.
  const [activeSession, setActiveSession] = useState<SessionPlan | null>(null);

  const refreshProfile = () => setProfile(srsManager.getProfile());

  // Onboarding Modal state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(!profile.onboardingCompleted);

  // Socratic Coach Drawer state
  const [isCoachOpen, setIsCoachOpen] = useState<boolean>(false);
  const [coachTargetWord, setCoachTargetWord] = useState<OrthoWordItem | null>(null);
  const [coachContextSentence, setCoachContextSentence] = useState<string>('');

  // Synchronize profile changes with storage
  const handleUpdateProfile = (newProfile: UserProfile) => {
    srsManager.saveProfile(newProfile);
    setProfile(newProfile);
  };

  const handleOnboardingComplete = (updatedProfile: Partial<UserProfile>, startDiagnostic: boolean) => {
    const merged: UserProfile = {
      ...profile,
      ...updatedProfile,
      onboardingCompleted: true,
    };
    handleUpdateProfile(merged);
    setIsOnboardingOpen(false);

    if (startDiagnostic) {
      setCurrentView('diagnostic');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleNavigate = (view: string, subcategory?: string) => {
    setCurrentView(view);
    if (subcategory) {
      setTrainingSubcategory(subcategory);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCoach = (targetWord?: OrthoWordItem, sentence?: string) => {
    setCoachTargetWord(targetWord || null);
    setCoachContextSentence(sentence || '');
    setIsCoachOpen(true);
  };

  // ---- Motor de sesión ----
  const startSession = (plan: SessionPlan) => {
    setActiveSession(plan);
    setCurrentView('session');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartRecommendedSession = () => {
    startSession(buildSession({ origin: 'recommended', size: 10 }));
  };

  const handleStartFocusSession = (focus: SessionFocus) => {
    startSession(buildSession({ origin: 'focus', focus, size: 10 }));
  };

  const handleStartDailyChallenge = () => {
    const daily = assembleDailyChallenge(todayKey(), profile.errorProfile);
    startSession(buildSessionFromDaily(daily));
  };

  const handleStartMistakeReview = (wordIds: string[]) => {
    startSession(buildMistakeSession(wordIds));
  };

  const handleSessionComplete = (plan: SessionPlan) => {
    // El desafío del día solo se marca cumplido al terminarlo de verdad.
    if (plan.origin === 'daily') {
      try {
        localStorage.setItem(`ortolab-daily-${todayKey()}`, 'done');
      } catch {
        /* almacenamiento no disponible */
      }
    }
  };

  const handleExitSession = () => {
    setActiveSession(null);
    refreshProfile();
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrainWordFromLexicon = (wordItem: OrthoWordItem) => {
    setCoachTargetWord(wordItem);
    setTrainingSubcategory('fotografia');
    setCurrentView('training');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-neutral-800 selection:text-neutral-100">
      {/* Top Header */}
      <Header
        profile={profile}
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCoach={() => handleOpenCoach()}
      />

      {/* Main Content Router */}
      <main className="flex-1 pb-16">
        {currentView === 'dashboard' && (
          <Dashboard
            profile={profile}
            onNavigate={handleNavigate}
            onStartRecommendedSession={handleStartRecommendedSession}
            onStartDailyChallenge={handleStartDailyChallenge}
            onStartFocusSession={handleStartFocusSession}
            onOpenCoach={handleOpenCoach}
          />
        )}

        {currentView === 'session' && activeSession && (
          <SessionRunner
            plan={activeSession}
            onExit={handleExitSession}
            onProfileChange={refreshProfile}
            onComplete={handleSessionComplete}
            onStartMistakeReview={handleStartMistakeReview}
          />
        )}

        {currentView === 'training' && (
          <TrainingHub
            profile={profile}
            initialMode={trainingSubcategory}
            onOpenCoach={handleOpenCoach}
          />
        )}

        {currentView === 'srs' && (
          <SrsReviewView
            profile={profile}
            onOpenCoach={handleOpenCoach}
          />
        )}

        {currentView === 'diagnostic' && (
          <DiagnosticView
            profile={profile}
            onCompleteDiagnostic={handleUpdateProfile}
            onNavigateToTraining={() => handleNavigate('training')}
          />
        )}

        {currentView === 'lexicon' && (
          <VocabularyLexicon
            profile={profile}
            onOpenCoach={handleOpenCoach}
            onTrainWord={handleTrainWordFromLexicon}
          />
        )}
      </main>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
      />

      {/* Socratic Coach Drawer */}
      <SocraticCoachDrawer
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        targetWordItem={coachTargetWord}
        targetContextSentence={coachContextSentence}
        category={coachTargetWord?.category}
        level={profile.level === 'unassigned' ? 'B1' : profile.level}
        l1={profile.l1}
        onUseHint={(hintLevel) => {
          if (coachTargetWord) {
            srsManager.recordAttempt(coachTargetWord.id, Math.max(2, 5 - hintLevel), hintLevel);
            setProfile(srsManager.getProfile());
          }
        }}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs font-mono text-neutral-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ORTOGRAFÍA LAB · Cómo se escriben las palabras en español · ELE A1–C2</span>
          <span className="text-neutral-500">Grafías (b/v · s/c/z · g/j · h) primero · Tildes · Puntuación · Mayúsculas</span>
        </div>
      </footer>
    </div>
  );
}
