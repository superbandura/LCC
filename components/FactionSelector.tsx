import React, { useState } from 'react';
import usmcImage from '../USMC.jpg';
import planImage from '../PLAN.jpg';

interface FactionSelectorProps {
  onSelect: (faction: 'us' | 'china', playerName: string) => void;
}

const US_FACTION_IMAGE = usmcImage;
const CHINA_FACTION_IMAGE = planImage;

const FactionSelector: React.FC<FactionSelectorProps> = ({ onSelect }) => {
  const [selectedFaction, setSelectedFaction] = useState<'us' | 'china' | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleFactionSelect = (faction: 'us' | 'china') => {
    setSelectedFaction(faction);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = playerName.trim();
    if (trimmedName.length === 0) {
      setError('PLAYER NAME REQUIRED');
      return;
    }

    if (trimmedName.length < 2) {
      setError('NAME TOO SHORT (MINIMUM 2 CHARACTERS)');
      return;
    }

    if (trimmedName.length > 30) {
      setError('NAME TOO LONG (MAXIMUM 30 CHARACTERS)');
      return;
    }

    if (selectedFaction) {
      onSelect(selectedFaction, trimmedName);
    }
  };

  const handleBack = () => {
    setSelectedFaction(null);
    setPlayerName('');
    setError('');
  };

  // Phase 1: Faction selection
  if (!selectedFaction) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex flex-col justify-center items-center text-white p-8 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-bold text-cyan-300 mb-4 tracking-wider" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.7)' }}>
            LITTORAL COMMANDER
          </h1>
          <h2 className="text-xl md:text-3xl font-light text-gray-200 mb-12 animate-pulse">
            CHOOSE YOUR SIDE
          </h2>
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            {/* US Faction */}
            <div
              className="cursor-pointer group flex flex-col items-center"
              onClick={() => handleFactionSelect('us')}
            >
              <img
                src={US_FACTION_IMAGE}
                alt="U.S. Faction"
                className="w-56 h-auto md:w-72 rounded-lg shadow-2xl border-4 border-transparent group-hover:border-cyan-400 transition-all duration-300 transform group-hover:scale-105"
              />
              <h2 className="text-center text-2xl font-semibold mt-4 text-gray-300 group-hover:text-white transition-colors">US NAVY</h2>
            </div>
            {/* China Faction */}
            <div
              className="cursor-pointer group flex flex-col items-center"
              onClick={() => handleFactionSelect('china')}
            >
              <img
                src={CHINA_FACTION_IMAGE}
                alt="Chinese Faction"
                className="w-56 h-auto md:w-72 rounded-lg shadow-2xl border-4 border-transparent group-hover:border-red-500 transition-all duration-300 transform group-hover:scale-105"
              />
              <h2 className="text-center text-2xl font-semibold mt-4 text-gray-300 group-hover:text-white transition-colors">PLAN</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Phase 2: Player name input
  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col justify-center items-center text-white p-8 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        <h1 className="text-3xl md:text-4xl font-mono font-bold text-green-400 mb-2 uppercase tracking-wider">
          PLAYER IDENTIFICATION
        </h1>
        <p className="text-lg font-mono text-gray-300 mb-8 tracking-wide">
          FACTION: {selectedFaction === 'us' ? 'US NAVY' : 'PLAN'}
        </p>

        <form onSubmit={handleSubmit} className="w-full bg-black bg-opacity-70 border-2 border-green-600 rounded p-6">
          <label className="block mb-4">
            <span className="block text-sm font-mono uppercase tracking-wider text-green-400 mb-2">
              ENTER YOUR NAME:
            </span>
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setError('');
              }}
              className="w-full bg-gray-800 border-2 border-green-700 text-green-300 font-mono px-4 py-2 rounded focus:outline-none focus:border-green-500"
              placeholder="TYPE NAME HERE..."
              autoFocus
              maxLength={30}
            />
          </label>

          {error && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded">
              <p className="text-red-300 font-mono text-sm tracking-wide">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-mono uppercase tracking-wider py-3 rounded border-2 border-gray-500 transition-colors"
            >
              BACK
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-500 text-black font-mono uppercase tracking-wider py-3 rounded border-2 border-green-400 transition-colors font-bold"
            >
              CONFIRM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FactionSelector;