import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    color?: 'primary' | 'white' | 'gray';
}

const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
};

const colorMap = {
    primary: 'text-primary-600 dark:text-primary-400',
    white: 'text-white',
    gray: 'text-gray-400 dark:text-gray-500',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    className = '',
    color = 'primary',
}) => {
    const dimension = sizeMap[size];
    const colorClass = colorMap[color];

    return (
        <motion.svg
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            width={dimension}
            height={dimension}
            viewBox="0 0 24 24"
            fill="none"
            className={`${colorClass} ${className}`}
            aria-label="Loading"
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-20"
            />
            <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </motion.svg>
    );
};

// =================================================================
// Button with Loading State
// =================================================================
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    loadingText?: string;
    children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
    isLoading = false,
    loadingText,
    children,
    disabled,
    className = '',
    ...props
}) => {
    return (
        <button
            disabled={disabled || isLoading}
            className={`relative ${className} ${isLoading ? 'cursor-wait' : ''}`}
            {...props}
        >
            <span className={isLoading ? 'opacity-0' : 'opacity-100'}>{children}</span>
            {isLoading && (
                <span className="absolute inset-0 flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" color="white" />
                    {loadingText && <span className="text-sm">{loadingText}</span>}
                </span>
            )}
        </button>
    );
};

// =================================================================
// Skeleton Loader
// =================================================================
interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
}) => {
    const variantClasses = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    return (
        <div
            className={`skeleton ${variantClasses[variant]} ${className}`}
            style={{ width, height }}
            aria-hidden="true"
        />
    );
};
