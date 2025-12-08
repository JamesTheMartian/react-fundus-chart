import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FundusElement } from '../utils/types';
import { Trash2, Eye, EyeOff, Check } from 'lucide-react';


interface LayerPanelProps {
    elements: FundusElement[];
    selectedElementId: string | null;
    onSelect: (id: string | null) => void;
    onUpdate: (id: string, updates: Partial<FundusElement>) => void;
    onDelete: (id: string) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
    elements,
    selectedElementId,
    onSelect,
    onUpdate,
    onDelete
}) => {
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');

    const selectedElement = elements.find(el => el.id === selectedElementId);

    useEffect(() => {
        if (selectedElement) {
            setEditName(selectedElement.name || '');
            setEditDesc(selectedElement.description || '');
        }
    }, [selectedElementId, selectedElement]);

    const handleSave = () => {
        if (selectedElementId) {
            onUpdate(selectedElementId, {
                name: editName,
                description: editDesc
            });
        }
    };

    return (
        <div className="flex flex-col w-full h-full bg-white p-5">
            <h3 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Layers & Objects</h3>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-[200px] lg:max-h-none overflow-x-hidden p-1">
                <AnimatePresence mode='popLayout'>
                    {[...elements].reverse().map(element => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            key={element.id}
                            className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors duration-200 border ${element.id === selectedElementId
                                ? 'border-blue-200 bg-blue-50/50 shadow-sm'
                                : 'border-transparent hover:bg-gray-50 hover:border-gray-100'
                                }`}
                            onClick={() => onSelect(element.id)}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="w-2.5 h-2.5 rounded-full ring-1 ring-black/5 shrink-0" style={{ backgroundColor: element.color }}></span>
                                <span className={`text-sm whitespace-nowrap overflow-hidden text-ellipsis ${element.id === selectedElementId ? 'font-semibold text-blue-900' : 'font-medium text-gray-700'}`}>
                                    {element.name || `${element.pathology || element.type} ${element.id.slice(-4)}`}
                                </span>
                            </div>
                            <div className={`flex gap-1 transition-opacity duration-200 ${element.id === selectedElementId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}>
                                <button
                                    className="p-1.5 rounded-lg border-none bg-transparent text-gray-400 cursor-pointer flex items-center justify-center hover:bg-gray-200 hover:text-gray-700 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdate(element.id, { visible: !element.visible });
                                    }}
                                    title={element.visible ? "Hide" : "Show"}
                                >
                                    {element.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <button
                                    className="p-1.5 rounded-lg border-none bg-transparent text-gray-400 cursor-pointer flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(element.id);
                                    }}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {elements.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-8 italic">No objects drawn</div>
                )}
            </div>

            <AnimatePresence>
                {selectedElementId && selectedElement && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/50 p-4 rounded-xl border border-gray-100"
                    >
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-gray-500">Edit Object</h4>
                        <div className="mb-3">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Name</label>
                            <input
                                type="text"
                                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-medium transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-white"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Name this object..."
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                            <textarea
                                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-medium transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-white resize-none"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                placeholder="Add clinical notes..."
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end mt-2">
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all hover:bg-blue-700 shadow-sm hover:shadow active:scale-95"
                                onClick={handleSave}
                            >
                                <Check size={16} strokeWidth={2.5} /> Save Changes
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
