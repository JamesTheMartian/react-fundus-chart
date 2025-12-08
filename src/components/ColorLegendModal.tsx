import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { COLOR_LEGEND } from '../data/colorLegend';
// import './ColorLegendModal.css'; // Removed for Tailwind migration

interface ColorLegendModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ColorLegendModal: React.FC<ColorLegendModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="w-full max-w-4xl max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-gray-900">Color Legend & Tips</h2>
                            <button
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors"
                                onClick={onClose}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50/50">
                            {Object.values(COLOR_LEGEND).map((item) => (
                                <div key={item.name} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-50">
                                        <div
                                            className="w-6 h-6 rounded-full border-2 border-black/5 shadow-sm"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="font-semibold text-gray-800">{item.name}</span>
                                    </div>
                                    <ul className="space-y-1.5 pl-4 list-disc text-sm text-gray-600 marker:text-gray-300">
                                        {item.meanings.map((meaning, index) => (
                                            <li key={index}>{meaning}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
