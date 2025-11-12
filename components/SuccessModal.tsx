import React from 'react';

interface SuccessModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ title, message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border-2 border-green-600 rounded-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 text-green-400">✓</div>
          <h2 className="text-2xl font-mono font-bold text-green-400 uppercase tracking-wider mb-2">
            {title}
          </h2>
        </div>

        {/* Message */}
        <div className="bg-gray-900 border border-green-600 rounded p-4 mb-6">
          <p className="font-mono text-sm text-green-300 text-center uppercase tracking-wide">
            {message}
          </p>
        </div>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-mono font-bold py-3 px-6 rounded uppercase tracking-wider transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
