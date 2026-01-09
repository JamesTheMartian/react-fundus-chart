import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, Rocket, Pencil, Palette, Box, Share2, Keyboard, AlertCircle,
  ChevronRight, ChevronDown, ArrowUp, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { HELP_CATEGORIES, searchHelpContent } from '../../data/helpContent';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Rocket, Pencil, Palette, Box, Share2, Keyboard, AlertCircle,
};

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('getting-started');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchResults = useMemo(() => {
    return searchHelpContent(searchQuery);
  }, [searchQuery]);

  const activeArticles = useMemo(() => {
    if (searchQuery) {
      return searchResults.map(r => r.article);
    }
    return HELP_CATEGORIES.find(c => c.id === activeCategory)?.articles || [];
  }, [searchQuery, searchResults, activeCategory]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShowBackToTop(e.currentTarget.scrollTop > 200);
  };

  const scrollToTop = () => {
    const content = document.getElementById('help-content');
    content?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
          className="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Help Center
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar - Categories */}
            <div className={`
              ${isMobileMenuOpen ? 'block' : 'hidden'} sm:block
              w-full sm:w-56 shrink-0 border-r border-gray-100 dark:border-gray-800 
              bg-gray-50 dark:bg-gray-800/50 overflow-y-auto
              absolute sm:relative inset-0 sm:inset-auto z-10
            `}>
              <div className="p-3 space-y-1">
                {/* Mobile close button */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="sm:hidden w-full flex items-center justify-between p-3 text-gray-600 dark:text-gray-400 mb-2"
                >
                  <span className="font-medium">Categories</span>
                  <X size={18} />
                </button>

                {HELP_CATEGORIES.map((category) => {
                  const Icon = iconMap[category.icon] || Rocket;
                  const isActive = activeCategory === category.id && !searchQuery;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setSearchQuery('');
                        setExpandedArticle(null);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-primary-500' : ''} />
                      {category.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile category toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="sm:hidden absolute top-20 left-4 z-5 flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              Categories
              <ChevronRight size={14} />
            </button>

            {/* Content */}
            <div
              id="help-content"
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 sm:pl-6"
            >
              {/* Search results header */}
              {searchQuery && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </p>
                </div>
              )}

              {/* Category title */}
              {!searchQuery && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {HELP_CATEGORIES.find(c => c.id === activeCategory)?.title}
                </h3>
              )}

              {/* Articles */}
              <div className="space-y-3">
                {activeArticles.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No articles found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  activeArticles.map((article) => {
                    const isExpanded = expandedArticle === article.id;
                    
                    return (
                      <motion.div
                        key={article.id}
                        initial={false}
                        className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            {article.title}
                          </span>
                          <ChevronDown
                            size={18}
                            className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="pt-4 prose prose-sm dark:prose-invert max-w-none">
                                  {/* Simple markdown-like rendering */}
                                  {article.content.split('\n\n').map((paragraph, i) => {
                                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                      return (
                                        <h4 key={i} className="font-semibold text-gray-900 dark:text-white mt-4 mb-2">
                                          {paragraph.replace(/\*\*/g, '')}
                                        </h4>
                                      );
                                    }
                                    if (paragraph.startsWith('|')) {
                                      // Table
                                      const rows = paragraph.split('\n').filter(r => r.trim() && !r.includes('---'));
                                      return (
                                        <div key={i} className="overflow-x-auto mt-3">
                                          <table className="text-sm">
                                            <tbody>
                                              {rows.map((row, ri) => (
                                                <tr key={ri}>
                                                  {row.split('|').filter(Boolean).map((cell, ci) => (
                                                    <td key={ci} className="px-3 py-1.5 text-gray-600 dark:text-gray-400">
                                                      {cell.trim()}
                                                    </td>
                                                  ))}
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      );
                                    }
                                    if (paragraph.startsWith('- ')) {
                                      return (
                                        <ul key={i} className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                                          {paragraph.split('\n').map((item, li) => (
                                            <li key={li}>{item.replace('- ', '')}</li>
                                          ))}
                                        </ul>
                                      );
                                    }
                                    return (
                                      <p key={i} className="text-gray-600 dark:text-gray-400">
                                        {paragraph.split('**').map((part, pi) => 
                                          pi % 2 === 1 ? <strong key={pi}>{part}</strong> : part
                                        )}
                                      </p>
                                    );
                                  })}
                                </div>
                                
                                {/* Feedback */}
                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4">
                                  <span className="text-xs text-gray-400">Was this helpful?</span>
                                  <button className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors">
                                    <ThumbsUp size={14} />
                                  </button>
                                  <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                                    <ThumbsDown size={14} />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Back to top */}
          <AnimatePresence>
            {showBackToTop && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={scrollToTop}
                className="absolute bottom-6 right-6 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
              >
                <ArrowUp size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
