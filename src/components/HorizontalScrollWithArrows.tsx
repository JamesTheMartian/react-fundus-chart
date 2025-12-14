import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface HorizontalScrollWithArrowsProps {
    children: React.ReactNode;
    containerClassName?: string;
    scrollAreaClassName?: string;
    arrowButtonClassName?: string;
    leftArrowButtonClassName?: string;
    rightArrowButtonClassName?: string;
    arrowIconClassName?: string;
    arrowSize?: number;
    scrollAmount?: number;
    showArrows?: boolean;
}

export const HorizontalScrollWithArrows: React.FC<HorizontalScrollWithArrowsProps> = ({
    children,
    containerClassName = '',
    scrollAreaClassName = '',
    arrowButtonClassName = 'absolute z-20 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-90',
    leftArrowButtonClassName,
    rightArrowButtonClassName,
    arrowIconClassName = 'text-gray-700 dark:text-gray-300',
    arrowSize = 14,
    scrollAmount = 100,
    showArrows = true,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    // Check scroll position and update arrow visibility
    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 5); // Small threshold to avoid flickering
            setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
        }
    };

    // Scroll by amount
    const scroll = (amount: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: amount,
                behavior: 'smooth',
            });
        }
    };

    // Setup scroll listener
    useEffect(() => {
        const container = scrollRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            // Initial check
            checkScroll();

            // Recheck on resize
            const resizeObserver = new ResizeObserver(checkScroll);
            resizeObserver.observe(container);

            return () => {
                container.removeEventListener('scroll', checkScroll);
                resizeObserver.disconnect();
            };
        }
    }, []);

    return (
        <div className={`relative ${containerClassName}`}>
            {/* Left Arrow Button */}
            {showArrows && showLeftArrow && (
                <button
                    onClick={() => scroll(-scrollAmount)}
                    className={leftArrowButtonClassName || `${arrowButtonClassName} left-1`}
                    aria-label="Scroll left"
                >
                    <ArrowLeft size={arrowSize} className={arrowIconClassName} />
                </button>
            )}

            {/* Scrollable Content */}
            <div
                ref={scrollRef}
                className={scrollAreaClassName}
            >
                {children}
            </div>

            {/* Right Arrow Button */}
            {showArrows && showRightArrow && (
                <button
                    onClick={() => scroll(scrollAmount)}
                    className={rightArrowButtonClassName || `${arrowButtonClassName} right-1`}
                    aria-label="Scroll right"
                >
                    <ArrowRight size={arrowSize} className={arrowIconClassName} />
                </button>
            )}
        </div>
    );
};
