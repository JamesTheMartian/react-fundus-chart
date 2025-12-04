import React, { useState, useEffect } from 'react';
import type { FundusElement } from '../utils/types';
import { Trash2, Eye, EyeOff, Check } from 'lucide-react';
import './LayerPanel.css';

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
        <div className="layer-panel">
            <h3 className="layer-title">Layers & Objects</h3>

            <div className="layer-list">
                {[...elements].reverse().map(element => (
                    <div
                        key={element.id}
                        className={`layer-item ${element.id === selectedElementId ? 'selected' : ''}`}
                        onClick={() => onSelect(element.id)}
                    >
                        <div className="layer-info">
                            <span className="layer-icon" style={{ backgroundColor: element.color }}></span>
                            <span className="layer-name">
                                {element.name || `${element.pathology || element.type} ${element.id.slice(-4)}`}
                            </span>
                        </div>
                        <div className="layer-actions">
                            <button
                                className="icon-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdate(element.id, { visible: !element.visible });
                                }}
                                title={element.visible ? "Hide" : "Show"}
                            >
                                {element.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <button
                                className="icon-btn delete-btn"
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
                    <div className="empty-state">No objects drawn</div>
                )}
            </div>

            {selectedElementId && selectedElement && (
                <div className="element-editor">
                    <h4>Edit Object</h4>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Name this object..."
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Add clinical notes..."
                            rows={3}
                        />
                    </div>
                    <div className="editor-actions">
                        <button className="save-btn" onClick={handleSave}>
                            <Check size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
