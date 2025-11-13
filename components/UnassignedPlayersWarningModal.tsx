import React from 'react';

interface UnassignedPlayersWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  unassignedPlayers: Array<{ playerName: string; faction: 'us' | 'china' }>;
}

const UnassignedPlayersWarningModal: React.FC<UnassignedPlayersWarningModalProps> = ({
  isOpen,
  onClose,
  unassignedPlayers
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 border-2 border-yellow-600 p-6 w-[600px] max-w-[90vw] shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 bg-yellow-900/20 border-l-4 border-yellow-600 p-3">
          <span className="text-3xl text-yellow-400">⚠</span>
          <h2 className="text-lg font-mono font-bold text-yellow-400 uppercase tracking-wider">
            Cannot Advance Turn
          </h2>
        </div>

        {/* Message */}
        <div className="mb-4 bg-black/40 border border-gray-800 p-4">
          <p className="text-sm font-mono text-gray-300 leading-relaxed">
            All players must assign themselves to operational areas before the campaign can begin.
          </p>
        </div>

        {/* Unassigned Players List */}
        <div className="mb-6 bg-black/40 border-2 border-yellow-600 p-4">
          <h3 className="text-sm font-mono font-bold text-yellow-400 uppercase tracking-wider mb-3">
            Unassigned Players ({unassignedPlayers.length})
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {unassignedPlayers.map((player, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-800/50 border border-gray-700 p-2"
              >
                <span className="font-mono text-sm text-gray-300">{player.playerName}</span>
                <span
                  className={`font-mono text-xs font-bold uppercase px-2 py-1 border ${
                    player.faction === 'us'
                      ? 'text-blue-400 border-blue-600 bg-blue-900/20'
                      : 'text-red-400 border-red-600 bg-red-900/20'
                  }`}
                >
                  {player.faction === 'us' ? 'US NAVY' : 'PLAN'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 bg-yellow-900/10 border border-yellow-700 p-3">
          <p className="text-xs font-mono text-yellow-300 leading-relaxed">
            <span className="font-bold">→</span> Open the <span className="font-bold">Player Assignment</span> panel (top-right icon)
            <br />
            <span className="font-bold">→</span> Ensure all players have selected an operational area
            <br />
            <span className="font-bold">→</span> Try advancing again once all players are assigned
          </p>
        </div>

        {/* Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2 font-mono text-sm font-bold uppercase tracking-wider bg-yellow-900/20 border-2 border-yellow-600 text-yellow-400 hover:bg-gray-800 transition-all"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnassignedPlayersWarningModal;
