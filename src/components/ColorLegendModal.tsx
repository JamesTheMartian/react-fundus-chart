import React from 'react';
import { X } from 'lucide-react';
import { COLOR_LEGEND } from '../data/colorLegend';
import './ColorLegendModal.css';

interface ColorLegendModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ColorLegendModal: React.FC<ColorLegendModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="legend-modal-overlay" onClick={onClose}>
            <div className="legend-modal" onClick={e => e.stopPropagation()}>
                <div className="legend-header">
                    <h2>Color Legend & Tips</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="legend-content">
                    {Object.values(COLOR_LEGEND).map((item) => (
                        <div key={item.name} className="legend-item">
                            <div className="legend-color-header">
                                <div
                                    className="color-swatch"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="legend-color-name">{item.name}</span>
                            </div>
                            <ul className="legend-list">
                                {item.meanings.map((meaning, index) => (
                                    <li key={index}>{meaning}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
