import React from 'react';

interface DeleteGameModalProps {
  gameName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteGameModal: React.FC<DeleteGameModalProps> = ({ gameName, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border-2 border-red-600 rounded-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-mono font-bold text-red-400 uppercase tracking-wider mb-2">
            DELETE GAME
          </h2>
        </div>

        {/* Warning Message */}
        <div className="bg-gray-900 border border-red-600 rounded p-4 mb-6">
          <p className="font-mono text-sm text-gray-300 mb-3">
            ARE YOU SURE YOU WANT TO DELETE THE GAME{' '}
            <span className="text-red-400 font-bold">"{gameName}"</span>?
          </p>
          <p className="font-mono text-xs text-red-300 uppercase tracking-wide">
            ⚠ THIS ACTION CANNOT BE UNDONE AND ALL GAME DATA WILL BE LOST.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-mono font-bold py-3 px-6 rounded uppercase tracking-wider transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-mono font-bold py-3 px-6 rounded uppercase tracking-wider transition-colors"
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteGameModal;
