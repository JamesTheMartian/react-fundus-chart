import React, { useState, useEffect } from 'react';
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
        <div className="flex flex-col w-full h-full bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Layers & Objects</h3>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-[200px] lg:max-h-none">
                {[...elements].reverse().map(element => (
                    <div
                        key={element.id}
                        className={`group flex items-center justify-between p-2 bg-white border rounded-md cursor-pointer transition-all duration-200 ${element.id === selectedElementId
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                            }`}
                        onClick={() => onSelect(element.id)}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: element.color }}></span>
                            <span className="text-sm text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
                                {element.name || `${element.pathology || element.type} ${element.id.slice(-4)}`}
                            </span>
                        </div>
                        <div className={`flex gap-1 transition-opacity duration-200 ${element.id === selectedElementId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                            <button
                                className="p-1 rounded border-none bg-transparent text-gray-500 cursor-pointer flex items-center justify-center hover:bg-gray-200 hover:text-gray-800"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdate(element.id, { visible: !element.visible });
                                }}
                                title={element.visible ? "Hide" : "Show"}
                            >
                                {element.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <button
                                className="p-1 rounded border-none bg-transparent text-gray-500 cursor-pointer flex items-center justify-center hover:bg-red-100 hover:text-red-500"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(element.id);
                                }}
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
                {elements.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-8 italic">No objects drawn</div>
                )}
            </div>

            {selectedElementId && selectedElement && (
                <div className="mt-4 pt-4 border-t border-gray-200 bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold mb-3 text-gray-900">Edit Object</h4>
                    <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Name this object..."
                        />
                    </div>
                    <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                        <textarea
                            className="w-full p-2 border border-gray-300 rounded text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Add clinical notes..."
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end mt-2">
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white border-none rounded text-sm font-medium cursor-pointer transition-colors hover:bg-blue-600"
                            onClick={handleSave}
                        >
                            <Check size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
