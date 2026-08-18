import React, { useState, useEffect } from 'react';
import { UserProfile, OrthoWordItem } from './types';
import { srsManager } from './utils/srsEngine';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { OnboardingModal } from './components/OnboardingModal';
import { DiagnosticView } from './components/DiagnosticView';
import { TrainingHub } from './components/TrainingHub';
import { FreeWritingLab } from './components/FreeWritingLab';
import { SrsReviewView } from './components/SrsReviewView';
import { VocabularyLexicon } from './components/VocabularyLexicon';
import { EscapeRoomView } from './components/EscapeRoomView';
import { TeacherMode } from './components/TeacherMode';
import { SocraticCoachDrawer } from './components/SocraticCoachDrawer';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(srsManager.getProfile());
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [trainingSubcategory, setTrainingSubcategory] = useState<string>('contrastes');

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

  const handleStartRecommendedSession = () => {
    setTrainingSubcategory('contrastes');
    setCurrentView('training');
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
            onOpenCoach={handleOpenCoach}
          />
        )}

        {currentView === 'training' && (
          <TrainingHub
            profile={profile}
            initialMode={trainingSubcategory}
            onOpenCoach={handleOpenCoach}
          />
        )}

        {currentView === 'writing' && (
          <FreeWritingLab
            profile={profile}
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

        {currentView === 'escape' && (
          <EscapeRoomView
            profile={profile}
            onOpenCoach={handleOpenCoach}
          />
        )}

        {currentView === 'teacher' && (
          <TeacherMode
            profile={profile}
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
          <span>ORTOGRAFÍA LAB · Laboratorio Cognitivo de Adquisición Ortográfica ELE</span>
          <span className="text-neutral-500">Recuperación Activa · Memoria Ideovisual · Input Estructurado</span>
        </div>
      </footer>
    </div>
  );
}
