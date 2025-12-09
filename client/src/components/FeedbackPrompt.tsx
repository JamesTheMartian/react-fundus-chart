import React from 'react';

interface FeedbackPromptProps {
    isOpen: boolean;
    onClose: () => void;
    onFeedback: () => void;
    onDontShowAgain: () => void;
}

export const FeedbackPrompt: React.FC<FeedbackPromptProps> = ({
    isOpen,
    onClose,
    onFeedback,
    onDontShowAgain,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">We Value Your Feedback</h3>
                    <p className="text-gray-600">
                        Would you like to take a moment to rate your experience with the system? It only takes a minute.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onFeedback}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm shadow-blue-200 active:scale-95"
                    >
                        Give Feedback
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-200 transition-all active:scale-95"
                    >
                        Maybe Later
                    </button>
                    <button
                        onClick={onDontShowAgain}
                        className="w-full py-2 px-4 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
                    >
                        Don't show this again
                    </button>
                </div>
            </div>
        </div>
    );
};
