import React from 'react';
import { Unit } from '../types';

interface UnitCardProps {
  unit: Unit;
  isSelected?: boolean;
  onClick?: () => void;
  compact?: boolean;
  onInfoClick?: (unitId: string) => void;
  showSimplified?: boolean; // For TaskForceDetailModal - only shows image
  onDetectionToggle?: (unitId: string) => void; // For detection status toggle
  onRemove?: () => void; // For removing unit from Task Force during creation
}

const UnitCard: React.FC<UnitCardProps> = ({
  unit,
  isSelected = false,
  onClick,
  compact = false,
  onInfoClick,
  showSimplified = false,
  onDetectionToggle,
  onRemove
}) => {
  // Calculate damage percentage
  const damageCount = unit.currentDamage.filter(d => d).length;
  const damagePercentage = (damageCount / unit.damagePoints) * 100;

  // Check if unit is destroyed (all HP lost)
  const isDestroyed = damageCount === unit.damagePoints;

  // Check detection status (default to false if undefined)
  const isDetected = unit.isDetected ?? false;

  // Get damage color
  const getDamageColor = () => {
    if (damagePercentage === 0) return 'bg-green-500';
    if (damagePercentage < 50) return 'bg-yellow-500';
    if (damagePercentage < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (compact) {
    // Compact version - just image and name
    return (
      <div
        onClick={onClick}
        className={`
          relative bg-gray-700 border-2 rounded-lg overflow-hidden cursor-pointer
          transition-all hover:border-cyan-400 hover:shadow-md
          ${isSelected ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-gray-600'}
          ${isDestroyed ? 'border-red-600' : ''}
        `}
      >
        {/* Unit Image */}
        <div className="relative h-16 bg-gray-800 flex items-center justify-center overflow-hidden">
          <img
            src={unit.image}
            alt={unit.name}
            className={`w-full h-full object-contain ${isDestroyed ? 'grayscale opacity-60' : ''}`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Destroyed overlay */}
          {isDestroyed && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900/30">
              <div className="text-red-500 text-5xl font-bold">✕</div>
            </div>
          )}
          {/* Info icon button */}
          {onInfoClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick(unit.id);
              }}
              className="absolute top-0.5 left-0.5 w-5 h-5 bg-cyan-500 hover:bg-cyan-600 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors z-10"
              title="View detailed information"
            >
              i
            </button>
          )}
          {/* Remove button - only shown when onRemove is provided */}
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors z-20"
              title="Remove from Task Force"
            >
              ×
            </button>
          )}
          {/* Damage indicator overlay */}
          {damageCount > 0 && !onRemove && (
            <div className="absolute top-0.5 right-0.5 px-1 py-0.5 bg-black/80 rounded text-xs text-white font-bold">
              {damageCount}/{unit.damagePoints}
            </div>
          )}
          {/* Card Attached Badge */}
          {unit.attachedCard && (
            <div
              className="absolute bottom-0.5 right-0.5 w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-10"
              title="Card attached"
            >
              <span className="text-white text-sm font-bold">🃏</span>
            </div>
          )}
        </div>

        {/* Unit Name */}
        <div className="p-1.5 bg-gray-900/50">
          <p className="text-white text-xs text-center flex items-center justify-center flex-wrap gap-1" title={unit.name}>
            <span className="truncate">{unit.name}</span>
            {unit.deploymentCost !== undefined && unit.deploymentCost > 0 && (
              <span className="bg-gray-800 text-green-400 text-xs font-mono font-bold px-1.5 py-0.5 rounded border border-green-900 whitespace-nowrap">
                {unit.deploymentCost} CP
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  // Simplified version - only image (for TaskForceDetailModal)
  if (showSimplified) {
    return (
      <div
        className={`
          relative bg-gray-700 border-2 rounded-lg overflow-hidden
          transition-all hover:border-cyan-400 hover:shadow-lg
          ${isSelected ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-gray-600'}
        `}
      >
        {/* Unit Image */}
        <div className="relative h-32 bg-gray-800 flex items-center justify-center overflow-hidden">
          <img
            src={unit.image}
            alt={unit.name}
            className={`w-full h-full object-contain transition-all ${
              !isDetected || isDestroyed ? 'grayscale' : ''
            }`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />

          {/* Info icon button */}
          {onInfoClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick(unit.id);
              }}
              className="absolute top-1 left-1 w-6 h-6 bg-cyan-500 hover:bg-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors z-10"
              title="View detailed information"
            >
              i
            </button>
          )}

          {/* Destroyed overlay - Red X */}
          {isDestroyed && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="text-red-600 text-7xl font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                ✕
              </div>
            </div>
          )}

          {/* Detection toggle button (bottom-right) */}
          {onDetectionToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDetectionToggle(unit.id);
              }}
              disabled={isDestroyed}
              className={`absolute bottom-1 right-1 w-7 h-7 rounded-full flex items-center justify-center text-lg transition-colors z-10 ${
                isDestroyed
                  ? 'bg-gray-600/70 cursor-not-allowed'
                  : 'bg-black/70 hover:bg-black/90 cursor-pointer'
              }`}
              title={isDestroyed ? 'Unidad destruida' : (isDetected ? 'Detectada (click para ocultar)' : 'Oculta (click para detectar)')}
            >
              {isDetected ? '👁️' : '👁️‍🗨️'}
            </button>
          )}

          {/* Card Attached Badge (top-right) */}
          {unit.attachedCard && (
            <div
              className="absolute top-1 right-1 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-10"
              title="Card attached"
            >
              <span className="text-white text-lg font-bold">🃏</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full version with all details
  return (
    <div
      onClick={onClick}
      className={`
        relative bg-gray-700 border-2 rounded-lg overflow-hidden
        transition-all hover:border-cyan-400 hover:shadow-lg
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${isSelected ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-gray-600'}
      `}
    >
      {/* Unit Image */}
      <div className="relative h-24 bg-gray-800 flex items-center justify-center overflow-hidden">
        <img
          src={unit.image}
          alt={unit.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Info icon button */}
        {onInfoClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInfoClick(unit.id);
            }}
            className="absolute top-1 left-1 w-6 h-6 bg-cyan-500 hover:bg-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors z-10"
            title="Ver información detallada"
          >
            i
          </button>
        )}
        {/* Damage indicator overlay */}
        {damageCount > 0 && (
          <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white font-bold">
            {damageCount}/{unit.damagePoints}
          </div>
        )}
        {/* Card Attached Badge */}
        {unit.attachedCard && (
          <div
            className="absolute bottom-1 right-1 w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-10"
            title="Carta adjuntada"
          >
            <span className="text-white text-base font-bold">🃏</span>
          </div>
        )}
      </div>

      {/* Unit Info */}
      <div className="p-2">
        <h4 className="text-white font-semibold text-xs truncate" title={unit.name}>
          {unit.name}
        </h4>
        <p className="text-gray-400 text-xs mt-0.5 truncate" title={unit.type}>
          {unit.type}
        </p>

        {/* Damage bar */}
        <div className="mt-1.5">
          <div className="w-full bg-gray-600 rounded-full h-1 overflow-hidden">
            <div
              className={`h-full transition-all ${getDamageColor()}`}
              style={{ width: `${damagePercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span className="text-xs">HP</span>
            <span className="text-xs">{unit.damagePoints - damageCount}/{unit.damagePoints}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitCard;
