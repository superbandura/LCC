import React from 'react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    success: {
      border: 'border-green-600',
      text: 'text-green-400',
      bg: 'bg-green-900/20',
      icon: '✓'
    },
    warning: {
      border: 'border-yellow-600',
      text: 'text-yellow-400',
      bg: 'bg-yellow-900/20',
      icon: '⚠'
    },
    error: {
      border: 'border-red-600',
      text: 'text-red-400',
      bg: 'bg-red-900/20',
      icon: '✗'
    },
    info: {
      border: 'border-cyan-600',
      text: 'text-cyan-400',
      bg: 'bg-cyan-900/20',
      icon: 'ℹ'
    }
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div
        className={`bg-gray-900 ${style.border} border-2 p-6 w-[500px] max-w-[90vw] shadow-2xl animate-in fade-in zoom-in duration-200`}
      >
        {/* Header */}
        <div className={`flex items-center gap-3 mb-4 ${style.bg} ${style.border} border-l-4 p-3`}>
          <span className={`text-3xl ${style.text}`}>{style.icon}</span>
          <h2 className={`text-lg font-mono font-bold ${style.text} uppercase tracking-wider`}>
            {title}
          </h2>
        </div>

        {/* Message */}
        <div className="mb-6 bg-black/40 border border-gray-800 p-4">
          <p className="text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {/* Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-8 py-2 font-mono text-sm font-bold uppercase tracking-wider ${style.bg} ${style.border} border-2 ${style.text} hover:bg-gray-800 transition-all`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
