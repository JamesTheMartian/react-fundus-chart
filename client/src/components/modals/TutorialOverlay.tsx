import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';

export const TutorialOverlay: React.FC = () => {
  const {
    isTutorialActive,
    currentTutorialStep,
    tutorialSteps,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
  } = useOnboarding();

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const currentStep = tutorialSteps[currentTutorialStep];
  const isLastStep = currentTutorialStep === tutorialSteps.length - 1;
  const isFirstStep = currentTutorialStep === 0;

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Find and track target element
  useEffect(() => {
    if (!isTutorialActive) {
      setTargetRect(null);
      return;
    }

    // Determine which selector to use based on device type
    const getSelector = (): string | null => {
      // On mobile, prefer mobileSelector if available
      if (isMobile && currentStep?.mobileSelector) {
        return currentStep.mobileSelector;
      }
      return currentStep?.targetSelector || null;
    };

    const selector = getSelector();
    if (!selector) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      // Try the primary selector first
      let el = document.querySelector(selector);
      
      // On mobile, if mobileSelector fails, fall back to targetSelector
      if (!el && isMobile && currentStep?.targetSelector) {
        el = document.querySelector(currentStep.targetSelector);
      }
      
      // On desktop, if targetSelector fails, try mobileSelector as last resort
      if (!el && !isMobile && currentStep?.mobileSelector) {
        el = document.querySelector(currentStep.mobileSelector);
      }
      
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        // Scroll element into view if needed
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isTutorialActive, currentStep, isMobile]);

  // Keyboard navigation
  useEffect(() => {
    if (!isTutorialActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skipTutorial();
      if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTutorialActive, nextStep, prevStep, skipTutorial]);

  // Touch swipe handling for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextStep();
      else prevStep();
    }
    setTouchStart(null);
  }, [touchStart, nextStep, prevStep]);

  if (!isTutorialActive) return null;

  const padding = currentStep?.highlightPadding || 8;

  // Calculate tooltip position with bounds checking
  const getTooltipStyle = (): React.CSSProperties => {
    const tooltipWidth = isMobile ? window.innerWidth - 32 : 360;
    const tooltipHeight = 280; // Approximate tooltip height
    const margin = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const safeMargin = 16; // Minimum distance from edge

    // On mobile, ALWAYS center the tooltip for better UX
    // Also center for steps without target or explicitly set to center
    const shouldCenter = isMobile && currentStep?.position === 'center' || !targetRect || currentStep?.position === 'center' || !currentStep?.targetSelector;
    
    if (shouldCenter) {
      return {
        position: 'fixed',
        top: '20%',
        left: '0%',
        transform: 'translate(-50%, -50%)',
        maxWidth: `calc(100vw - ${safeMargin * 2}px)`,
        maxHeight: `calc(100vh - ${safeMargin * 2}px)`,
      };
    }

    const padding = currentStep?.highlightPadding || 8;
    
    // Calculate ideal positions for each direction
    const positions = {
      top: targetRect.top - margin - padding - tooltipHeight,
      bottom: targetRect.bottom + margin + padding,
      left: targetRect.left - margin - padding - tooltipWidth,
      right: targetRect.right + margin + padding,
    };

    // Calculate horizontal center aligned with target
    const horizontalCenter = Math.max(
      safeMargin,
      Math.min(
        targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        viewportWidth - tooltipWidth - safeMargin
      )
    );

    // Calculate vertical center aligned with target
    const verticalCenter = Math.max(
      safeMargin,
      Math.min(
        targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
        viewportHeight - tooltipHeight - safeMargin
      )
    );

    // Check which positions are valid (tooltip fits within viewport)
    const canFitTop = positions.top >= safeMargin;
    const canFitBottom = positions.bottom + tooltipHeight <= viewportHeight - safeMargin;
    const canFitLeft = positions.left >= safeMargin;
    const canFitRight = positions.right + tooltipWidth <= viewportWidth - safeMargin;

    // Determine best position based on preference and available space
    let preferredPosition: 'top' | 'bottom' | 'left' | 'right' | 'center' = currentStep?.position || 'bottom';
    
    // If preferred position doesn't fit, find an alternative
    if (
      (preferredPosition === 'top' && !canFitTop) ||
      (preferredPosition === 'bottom' && !canFitBottom) ||
      (preferredPosition === 'left' && !canFitLeft) ||
      (preferredPosition === 'right' && !canFitRight)
    ) {
      // Try opposite direction first
      if (preferredPosition === 'top' && canFitBottom) preferredPosition = 'bottom';
      else if (preferredPosition === 'bottom' && canFitTop) preferredPosition = 'top';
      else if (preferredPosition === 'left' && canFitRight) preferredPosition = 'right';
      else if (preferredPosition === 'right' && canFitLeft) preferredPosition = 'left';
      // Then try any valid position
      else if (canFitBottom) preferredPosition = 'bottom';
      else if (canFitTop) preferredPosition = 'top';
      else if (canFitRight) preferredPosition = 'right';
      else if (canFitLeft) preferredPosition = 'left';
      else preferredPosition = 'center'; // Fallback to center if nothing fits
    }

    // Generate style based on final position
    switch (preferredPosition) {
      case 'top':
        return {
          position: 'fixed',
          top: Math.max(safeMargin, positions.top),
          left: horizontalCenter,
          maxWidth: `calc(100vw - ${safeMargin * 2}px)`,
        };
      case 'bottom':
        return {
          position: 'fixed',
          top: Math.min(positions.bottom, viewportHeight - tooltipHeight - safeMargin),
          left: horizontalCenter,
          maxWidth: `calc(100vw - ${safeMargin * 2}px)`,
        };
      case 'left':
        return {
          position: 'fixed',
          top: verticalCenter,
          left: Math.max(safeMargin, positions.left),
          maxWidth: `calc(100vw - ${safeMargin * 2}px)`,
        };
      case 'right':
        return {
          position: 'fixed',
          top: verticalCenter,
          left: Math.min(positions.right, viewportWidth - tooltipWidth - safeMargin),
          maxWidth: `calc(100vw - ${safeMargin * 2}px)`,
        };
      default:
        return {
          position: 'fixed',
          top: '50%',
          left: '0%',
          transform: 'translate(-50%, -50%)',
          maxWidth: `calc(100vw - ${safeMargin * 2}px)`,
          maxHeight: `calc(100vh - ${safeMargin * 2}px)`,
        };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Backdrop with spotlight cutout */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left - padding}
                  y={targetRect.top - padding}
                  width={targetRect.width + padding * 2}
                  height={targetRect.height + padding * 2}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
            style={{ pointerEvents: 'auto' }}
            onClick={skipTutorial}
          />
        </svg>

        {/* Spotlight pulse animation */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute pointer-events-none"
            style={{
              left: targetRect.left - padding - 2,
              top: targetRect.top - padding - 2,
              width: targetRect.width + padding * 2 + 4,
              height: targetRect.height + padding * 2 + 4,
              borderRadius: 10,
              border: '2px solid rgba(99, 102, 241, 0.6)',
              boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.2), 0 0 20px rgba(99, 102, 241, 0.3)',
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-primary-400"
              animate={{ 
                scale: [1, 1.02, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        )}

        {/* Tooltip */}
        <motion.div
          key={currentTutorialStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={getTooltipStyle()}
          className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
            isMobile ? 'mx-4 w-[calc(100%-32px)] max-w-none' : 'w-[360px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 rounded-full">
                {currentTutorialStep + 1} / {tutorialSteps.length}
              </span>
            </div>
            <button
              onClick={skipTutorial}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {currentStep?.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {currentStep?.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 pb-3">
            {tutorialSteps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentTutorialStep
                    ? 'bg-primary-600'
                    : idx < currentTutorialStep
                    ? 'bg-primary-300'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isFirstStep
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <div className="flex items-center gap-2">
              {!isLastStep && (
                <button
                  onClick={skipTutorial}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <SkipForward size={14} />
                  Skip
                </button>
              )}
              
              <button
                onClick={isLastStep ? completeTutorial : nextStep}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
              >
                {isLastStep ? 'Get Started' : 'Next'}
                {!isLastStep && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
