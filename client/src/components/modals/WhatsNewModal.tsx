import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Bug, AlertTriangle, ChevronDown, ChevronUp, Rocket } from 'lucide-react';
import { CHANGELOG, getNewChanges } from '../../data/changelog';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { APP_CONFIG } from '../../utils/constants';
import { ONBOARDING_STORAGE_KEYS } from '../../utils/onboardingTypes';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
  const { dismissWhatsNew } = useOnboarding();
  const [expandedVersions, setExpandedVersions] = React.useState<Set<string>>(new Set([CHANGELOG[0]?.version]));
  const [showAll, setShowAll] = React.useState(false);

  const lastSeenVersion = useMemo(() => {
    return localStorage.getItem(ONBOARDING_STORAGE_KEYS.LAST_SEEN_VERSION);
  }, []);

  const newChanges = useMemo(() => {
    return getNewChanges(lastSeenVersion);
  }, [lastSeenVersion]);

  const displayChanges = showAll ? CHANGELOG : (newChanges.length > 0 ? newChanges : CHANGELOG.slice(0, 1));

  const toggleVersion = (version: string) => {
    setExpandedVersions(prev => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  };

  const handleClose = () => {
    dismissWhatsNew();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg max-h-[85vh] overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col"
        >
          {/* Header with gradient */}
          <div className="relative px-6 py-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-br from-primary-500/20 via-purple-500/10 to-pink-500/5 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 10 }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                  className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-lg"
                >
                  <Rocket className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    What's New
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Version {APP_CONFIG.version}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {displayChanges.map((entry) => {
              const isExpanded = expandedVersions.has(entry.version);
              const isLatest = entry.version === CHANGELOG[0]?.version;
              
              return (
                <div
                  key={entry.version}
                  className={`border rounded-xl overflow-hidden transition-colors ${
                    isLatest
                      ? 'border-primary-200 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-500/5'
                      : 'border-gray-100 dark:border-gray-700'
                  }`}
                >
                  {/* Version header */}
                  <button
                    onClick={() => toggleVersion(entry.version)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        v{entry.version}
                      </span>
                      {isLatest && (
                        <span className="px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-500/20 rounded-full uppercase">
                          Latest
                        </span>
                      )}
                      <span className="text-sm text-gray-400">
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </button>

                  {/* Version content */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                          {/* Features */}
                          {entry.features.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={14} className="text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                  New Features
                                </span>
                              </div>
                              <ul className="space-y-1.5">
                                {entry.features.map((feature, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="text-emerald-500 mt-1.5">•</span>
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Improvements */}
                          {entry.improvements.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Zap size={14} className="text-blue-500" />
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                  Improvements
                                </span>
                              </div>
                              <ul className="space-y-1.5">
                                {entry.improvements.map((improvement, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="text-blue-500 mt-1.5">•</span>
                                    {improvement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Bug Fixes */}
                          {entry.bugFixes.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Bug size={14} className="text-amber-500" />
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                  Bug Fixes
                                </span>
                              </div>
                              <ul className="space-y-1.5">
                                {entry.bugFixes.map((fix, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="text-amber-500 mt-1.5">•</span>
                                    {fix}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Breaking Changes */}
                          {entry.breaking && entry.breaking.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle size={14} className="text-red-500" />
                                <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                                  Breaking Changes
                                </span>
                              </div>
                              <ul className="space-y-1.5">
                                {entry.breaking.map((change, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="text-red-500 mt-1.5">•</span>
                                    {change}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Show all toggle */}
            {CHANGELOG.length > displayChanges.length && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full py-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                View all {CHANGELOG.length} versions
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gradient-to-br from-primary-500/20 via-purple-500/10 to-pink-500/5 flex justify-end">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              Got it!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
