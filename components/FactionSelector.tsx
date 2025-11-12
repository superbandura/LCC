import React from 'react';
import usmcImage from '../USMC.jpg';
import planImage from '../PLAN.jpg';

interface FactionSelectorProps {
  onSelect: (faction: 'us' | 'china') => void;
}

const US_FACTION_IMAGE = usmcImage;
const CHINA_FACTION_IMAGE = planImage;

const FactionSelector: React.FC<FactionSelectorProps> = ({ onSelect }) => {
  const handleFactionSelect = (faction: 'us' | 'china') => {
    onSelect(faction);
  };

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
};

export default FactionSelector;