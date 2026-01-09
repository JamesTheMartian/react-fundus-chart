import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Pencil, Palette, Eye, Box, Save, Share2, Keyboard, Users, 
  PlayCircle, Sparkles 
} from 'lucide-react';
import { QUICK_START_ITEMS } from '../../data/tutorialSteps';
import { useOnboarding } from '../../contexts/OnboardingContext';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Pencil, Palette, Eye, Box, Save, Share2, Keyboard, Users,
};

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickStartModal: React.FC<QuickStartModalProps> = ({ isOpen, onClose }) => {
  const { startTutorial } = useOnboarding();

  if (!isOpen) return null;

  const handleStartTutorial = () => {
    onClose();
    startTutorial();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-primary-500/10 via-primary-600/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-500/10">
                  <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Quick Start Guide
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get up and running in minutes
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {QUICK_START_ITEMS.map((item, index) => {
                const Icon = iconMap[item.icon] || Pencil;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-white dark:bg-gray-700 shadow-sm group-hover:shadow-md transition-shadow">
                        <Icon size={20} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
              Want a guided walkthrough?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                I'll explore myself
              </button>
              <button
                onClick={handleStartTutorial}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                <PlayCircle size={16} />
                Start Tutorial
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
