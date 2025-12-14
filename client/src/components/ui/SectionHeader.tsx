import React from 'react';

export const SectionHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <h3 className={`text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1 ${className}`}>
        {children}
    </h3>
);
