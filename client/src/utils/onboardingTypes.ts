// Onboarding Types for Tutorial, Help Center, and What's New

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector for spotlight (desktop)
  mobileSelector?: string; // CSS selector for mobile elements (prefixed with m-)
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'draw' | 'hover'; // Required action to proceed
  highlightPadding?: number;
  media?: {
    type: 'image' | 'video' | 'gif';
    src: string;
  };
}

export interface HelpCategory {
  id: string;
  title: string;
  icon: string; // Lucide icon name
  articles: HelpArticle[];
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string; // Markdown or plain text
  keywords: string[]; // For search
  relatedArticles?: string[]; // IDs of related articles
}

export interface ChangelogEntry {
  version: string;
  date: string;
  features: string[];
  improvements: string[];
  bugFixes: string[];
  breaking?: string[];
}

export interface OnboardingState {
  // Tutorial state
  isTutorialActive: boolean;
  currentTutorialStep: number;
  tutorialCompleted: boolean;
  
  // Modal visibility
  showQuickStart: boolean;
  showHelpCenter: boolean;
  showWhatsNew: boolean;
  
  // Progress tracking
  lastSeenVersion: string;
  dismissedWhatsNewVersions: string[];
}

// localStorage keys
export const ONBOARDING_STORAGE_KEYS = {
  TUTORIAL_COMPLETED: 'onboarding_tutorial_completed',
  TUTORIAL_PROGRESS: 'onboarding_tutorial_progress',
  LAST_SEEN_VERSION: 'onboarding_last_seen_version',
  WHATS_NEW_DISMISSED: 'onboarding_whats_new_dismissed',
  QUICK_START_SHOWN: 'onboarding_quick_start_shown',
} as const;
