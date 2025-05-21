import React from 'react';

interface ButtonsContainerProps {
  onSuggestCenter: () => void;
}

export default function ButtonsContainer({ onSuggestCenter }: ButtonsContainerProps) {
    return (
        <div className="flex w-full h-12 mt-4" id="buttons-container">
            <button
                onClick={onSuggestCenter}
                className="flex-1 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:z-10 px-4 py-2 relative"
            >
                Suggest a Center
            </button>
            <button
                onClick={() => window.open('https://www.dharma-gates.org/', '_blank')}
                className="flex-1 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#286B88] focus:z-10 px-4 py-2 relative"
            >
                Dharma Gates
            </button>
        </div>
    );
} 