import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ONBOARDING_STORAGE_KEYS } from '../utils/onboardingTypes';
import { TUTORIAL_STEPS } from '../data/tutorialSteps';
import { isNewVersion } from '../data/changelog';
import { APP_CONFIG } from '../utils/constants';

interface OnboardingContextValue {
  // Tutorial
  isTutorialActive: boolean;
  currentTutorialStep: number;
  tutorialSteps: typeof TUTORIAL_STEPS;
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  goToStep: (step: number) => void;
  
  // Modals
  showQuickStart: boolean;
  setShowQuickStart: (show: boolean) => void;
  showHelpCenter: boolean;
  setShowHelpCenter: (show: boolean) => void;
  showWhatsNew: boolean;
  setShowWhatsNew: (show: boolean) => void;
  
  // State
  isFirstVisit: boolean;
  hasNewVersion: boolean;
  dismissWhatsNew: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  // Tutorial state
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  
  // Modal visibility
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  
  // Derived state
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [hasNewVersion, setHasNewVersion] = useState(false);

  // Check first visit and version on mount
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEYS.TUTORIAL_COMPLETED);
    const lastSeenVersion = localStorage.getItem(ONBOARDING_STORAGE_KEYS.LAST_SEEN_VERSION);
    
    // First visit check
    if (!tutorialCompleted) {
      setIsFirstVisit(true);
      // Auto-show quick start for first-time users after a short delay
      const timer = setTimeout(() => {
        setShowQuickStart(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    // Version check - show what's new if newer version
    if (isNewVersion(APP_CONFIG.version, lastSeenVersion)) {
      setHasNewVersion(true);
      // Show what's new modal automatically
      const timer = setTimeout(() => {
        setShowWhatsNew(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTutorial = useCallback(() => {
    setShowQuickStart(false);
    setCurrentTutorialStep(0);
    setIsTutorialActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentTutorialStep < TUTORIAL_STEPS.length - 1) {
      setCurrentTutorialStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  }, [currentTutorialStep]);

  const prevStep = useCallback(() => {
    if (currentTutorialStep > 0) {
      setCurrentTutorialStep(prev => prev - 1);
    }
  }, [currentTutorialStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < TUTORIAL_STEPS.length) {
      setCurrentTutorialStep(step);
    }
  }, []);

  const skipTutorial = useCallback(() => {
    setIsTutorialActive(false);
    setCurrentTutorialStep(0);
    localStorage.setItem(ONBOARDING_STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
    setIsFirstVisit(false);
  }, []);

  const completeTutorial = useCallback(() => {
    setIsTutorialActive(false);
    setCurrentTutorialStep(0);
    localStorage.setItem(ONBOARDING_STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
    setIsFirstVisit(false);
  }, []);

  const dismissWhatsNew = useCallback(() => {
    setShowWhatsNew(false);
    localStorage.setItem(ONBOARDING_STORAGE_KEYS.LAST_SEEN_VERSION, APP_CONFIG.version);
    setHasNewVersion(false);
  }, []);

  const value: OnboardingContextValue = {
    isTutorialActive,
    currentTutorialStep,
    tutorialSteps: TUTORIAL_STEPS,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
    goToStep,
    showQuickStart,
    setShowQuickStart,
    showHelpCenter,
    setShowHelpCenter,
    showWhatsNew,
    setShowWhatsNew,
    isFirstVisit,
    hasNewVersion,
    dismissWhatsNew,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
