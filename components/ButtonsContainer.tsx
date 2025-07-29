import React from 'react';

interface ButtonsContainerProps {
  onSuggestCenter: () => void;
  onGiveFeedback: () => void;
}

export default function ButtonsContainer({ onSuggestCenter, onGiveFeedback }: ButtonsContainerProps) {
    return (
        <div className="flex w-full h-12 mt-4" id="buttons-container">
            <button
                onClick={onSuggestCenter}
                className="flex-1 bg-white text-gray-700 border border-gray-300 rounded-l-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:ring-offset-2 focus:z-10 px-4 py-2 relative font-medium transition-colors"
            >
                Suggest a Center
            </button>
            <button
                onClick={onGiveFeedback}
                className="flex-1 bg-white text-gray-700 border border-gray-300 border-l-0 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:ring-offset-2 focus:z-10 px-4 py-2 relative font-medium transition-colors"
            >
                Give Feedback
            </button>
            <button
                onClick={() => window.open('https://www.dharma-gates.org/', '_blank')}
                className="flex-1 bg-[#286B88] text-white border border-[#286B88] border-l-0 rounded-r-lg hover:bg-[#286B88]/90 focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:ring-offset-2 focus:z-10 px-4 py-2 relative font-medium transition-colors"
            >
                Dharma Gates
            </button>
        </div>
    );
} 