import React, { useState, useEffect } from 'react';
import { Unit, Card, OperationalArea } from '../types';

interface UnitDetailModalProps {
  unit: Unit;
  onClose: () => void;
  onSave: (updatedUnit: Unit) => void;
  isAdmin?: boolean;
  cards?: Card[];
  operationalAreas?: OperationalArea[];
  onOperationalAreasUpdate?: (areas: OperationalArea[]) => void;
  currentOperationalAreaId?: string; // ID of the current operational area
  taskForces?: { id: string; operationalAreaId: string }[]; // For finding area from task force
  isReadOnly?: boolean; // True for pending deployment units
}

const UnitDetailModal: React.FC<UnitDetailModalProps> = ({
  unit,
  onClose,
  onSave,
  isAdmin = false,
  cards = [],
  operationalAreas = [],
  onOperationalAreasUpdate,
  currentOperationalAreaId,
  taskForces = [],
  isReadOnly = false
}) => {
  const [editedUnit, setEditedUnit] = useState<Unit>(unit);
  const [showCardDetail, setShowCardDetail] = useState(false);

  // Reset edited unit when prop changes
  useEffect(() => {
    setEditedUnit(unit);
  }, [unit]);

  // Calculate if unit is destroyed
  const damageCount = editedUnit.currentDamage.filter(d => d).length;
  const isDestroyed = damageCount === editedUnit.damagePoints;

  // Toggle damage checkbox - prevent repair if unit is destroyed (unless admin)
  const toggleDamage = (index: number) => {
    const newDamage = [...editedUnit.currentDamage];
    const wouldBeUnchecking = newDamage[index] === true;

    // Prevent unchecking (repairing) if unit is already destroyed, UNLESS user is admin
    if (wouldBeUnchecking && isDestroyed && !isAdmin) {
      return; // Damage is permanent (non-admin)
    }

    newDamage[index] = !newDamage[index];
    setEditedUnit({ ...editedUnit, currentDamage: newDamage });
  };

  // Increment/decrement ammunition used
  const adjustAmmunition = (
    capability: 'attackPrimaryUsed' | 'attackSecondaryUsed' | 'interceptionUsed' | 'supplyUsed' | 'groundCombatUsed',
    totalCapability: 'attackPrimary' | 'attackSecondary' | 'interception' | 'supply' | 'groundCombat',
    delta: number
  ) => {
    const currentUsed = editedUnit[capability] || 0;
    const total = editedUnit[totalCapability] || 0;
    const newUsed = Math.max(0, Math.min(total, currentUsed + delta));
    setEditedUnit({ ...editedUnit, [capability]: newUsed });
  };

  // Detach card from unit and return it to operational area
  const handleDetachCard = () => {
    if (!editedUnit.attachedCard || !onOperationalAreasUpdate) return;

    const attachedCard = cards.find(c => c.id === editedUnit.attachedCard);
    if (!attachedCard) return;

    // Revert bonuses
    const updated = { ...editedUnit };

    // Revert HP bonus
    if (attachedCard.hpBonus && attachedCard.hpBonus > 0) {
      const newDamagePoints = updated.damagePoints - attachedCard.hpBonus;

      // Validation: If unit would be destroyed after removing HP, block detach
      const currentDamagedCount = updated.currentDamage.filter(d => d).length;
      if (currentDamagedCount > newDamagePoints) {
        alert(
          `⚠️ No se puede desadjuntar esta carta.\n\n` +
          `La unidad tiene ${currentDamagedCount} HP dañados, pero al quitar la carta solo tendría ${newDamagePoints} HP totales.\n\n` +
          `Esto destruiría la unidad. Repara primero algunos HP antes de desadjuntar.`
        );
        return;
      }

      updated.damagePoints = newDamagePoints;
      // Truncate currentDamage array
      updated.currentDamage = updated.currentDamage.slice(0, newDamagePoints);
    }

    // Revert secondary ammo bonus
    if (attachedCard.secondaryAmmoBonus && attachedCard.secondaryAmmoBonus > 0) {
      const newSecondary = (updated.attackSecondary || 0) - attachedCard.secondaryAmmoBonus;
      const usedSecondary = updated.attackSecondaryUsed || 0;

      // Validation: If used ammo exceeds new capacity, adjust used amount
      if (usedSecondary > newSecondary) {
        updated.attackSecondaryUsed = newSecondary;
      }

      updated.attackSecondary = newSecondary;
    }

    // Remove card from unit
    delete updated.attachedCard;

    // Find operational area for this unit
    let targetAreaId = currentOperationalAreaId;

    // If not provided, try to find via task force
    if (!targetAreaId && updated.taskForceId) {
      const taskForce = taskForces.find(tf => tf.id === updated.taskForceId);
      if (taskForce) {
        targetAreaId = taskForce.operationalAreaId;
      }
    }

    // Fallback to first area if still not found
    if (!targetAreaId && operationalAreas.length > 0) {
      targetAreaId = operationalAreas[0].id;
    }

    if (!targetAreaId) return;

    // Return card to operational area
    const updatedAreas = operationalAreas.map(area => {
      if (area.id === targetAreaId) {
        const currentCards = area.assignedCards || [];
        return {
          ...area,
          assignedCards: [...currentCards, editedUnit.attachedCard!]
        };
      }
      return area;
    });

    // Save changes
    setEditedUnit(updated);
    onSave(updated);
    onOperationalAreasUpdate(updatedAreas);
  };

  const handleSave = () => {
    onSave(editedUnit);
    onClose();
  };

  // Calculate remaining ammunition
  const getRemaining = (total: number | undefined, used: number | undefined): number => {
    return (total || 0) - (used || 0);
  };

  // Category color mapping
  const getCategoryColor = () => {
    const colors: Record<string, string> = {
      ground: 'border-green-500',
      naval: 'border-blue-500',
      artillery: 'border-red-500',
      interception: 'border-purple-500',
      supply: 'border-yellow-500',
    };
    return editedUnit.category ? colors[editedUnit.category] : 'border-gray-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10002] p-4">
      <div
        className={`bg-gray-800 rounded-lg border-4 ${getCategoryColor()} max-w-3xl w-full max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-cyan-400">{editedUnit.name}</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
          {isReadOnly ? (
            <div className="mt-2 p-2 bg-orange-900 bg-opacity-30 border border-orange-500 rounded text-orange-300 text-xs flex items-center gap-2">
              <span>⏳</span>
              <span className="font-semibold">This unit is in transit. Information available in read-only mode.</span>
            </div>
          ) : !isAdmin && (
            <div className="mt-2 p-2 bg-orange-900 bg-opacity-30 border border-orange-500 rounded text-orange-300 text-xs flex items-center gap-2">
              <span>🔍</span>
              <span className="font-semibold">UNIDAD ENEMIGA DETECTADA - Solo Lectura</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Unit Image and Basic Info - Compact Layout */}
          <div className="grid grid-cols-4 gap-3">
            {/* Unit Image */}
            <div className="col-span-1">
              <img
                src={editedUnit.image}
                alt={editedUnit.name}
                className="w-full h-auto rounded border-2 border-gray-600"
              />
            </div>

            {/* Basic Information */}
            <div className="col-span-3 space-y-2">
              <div>
                <label className="text-xs text-gray-400 block">Type</label>
                <p className="text-white font-semibold text-sm">{editedUnit.type}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 block">Category</label>
                <p className="text-white font-semibold text-sm capitalize">{editedUnit.category || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 block">Description</label>
                <p className="text-white text-xs leading-tight">{editedUnit.description}</p>
              </div>
            </div>
          </div>

          {/* Attached Cards Section */}
          {editedUnit.attachedCard && (() => {
            const attachedCard = cards.find(c => c.id === editedUnit.attachedCard);
            if (!attachedCard) return null;

            return (
              <div className="border-t border-gray-700 pt-3">
                <h3 className="text-sm font-semibold text-cyan-400 mb-2">🃏 Carta Adjuntada</h3>
                <div className="bg-gradient-to-br from-cyan-900 to-blue-900 bg-opacity-30 border-2 border-cyan-500 rounded p-2">
                  <div className="flex items-start gap-3">
                    {/* Card Thumbnail */}
                    <div className="flex-shrink-0">
                      <img
                        src={attachedCard.imagePath}
                        alt={attachedCard.name}
                        className="w-24 h-auto rounded border-2 border-cyan-400 cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setShowCardDetail(true)}
                      />
                    </div>

                    {/* Card Info */}
                    <div className="flex-1 space-y-1">
                      <div>
                        <p className="text-white font-bold text-sm">{attachedCard.name}</p>
                        <p className="text-gray-400 text-xs capitalize">Type: {attachedCard.cardType}</p>
                      </div>

                      {/* Bonuses Applied */}
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-cyan-300">Bonuses:</p>
                        {attachedCard.hpBonus && attachedCard.hpBonus > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-green-400">💚</span>
                            <span className="text-white">+{attachedCard.hpBonus} HP</span>
                          </div>
                        )}
                        {attachedCard.secondaryAmmoBonus && attachedCard.secondaryAmmoBonus > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-orange-400">🔶</span>
                            <span className="text-white">+{attachedCard.secondaryAmmoBonus} Secondary Ammunition</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => setShowCardDetail(true)}
                          className="flex-1 px-2 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded font-medium transition-colors"
                        >
                          👁️ View
                        </button>
                        {isAdmin && onOperationalAreasUpdate && (
                          <button
                            onClick={handleDetachCard}
                            className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-medium transition-colors"
                          >
                            🔓 Detach
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Card Detail Modal */}
          {showCardDetail && editedUnit.attachedCard && (() => {
            const attachedCard = cards.find(c => c.id === editedUnit.attachedCard);
            if (!attachedCard) return null;

            return (
              <div
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10003]"
                onClick={() => setShowCardDetail(false)}
              >
                <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full mx-4 p-4" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-xl font-bold text-white mb-4 text-center">{attachedCard.name}</h3>
                  <img
                    src={attachedCard.imagePath}
                    alt={attachedCard.name}
                    className="w-full h-auto rounded-lg border-2 border-cyan-400 mb-4"
                  />
                  <button
                    onClick={() => setShowCardDetail(false)}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })()}

          {/* HP Tracking */}
          <div className="border-t border-gray-700 pt-3">
            <h3 className="text-sm font-semibold text-cyan-400 mb-2">Hit Points (HP)</h3>
            {isAdmin ? (
              <>
                {isDestroyed && (
                  <div className="mb-2 p-1.5 bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded text-yellow-400 text-xs">
                    🔧 Modo Admin: Puedes revivir esta unidad desmarcando casillas
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {editedUnit.currentDamage.map((damaged, index) => (
                    <label key={index} className={`flex items-center space-x-1 ${!isReadOnly && !isDestroyed ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
                      <input
                        type="checkbox"
                        checked={damaged}
                        onChange={() => toggleDamage(index)}
                        disabled={isReadOnly || (isDestroyed && damaged)}
                        className={`w-4 h-4 ${!isReadOnly && !isDestroyed ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      />
                      <span className="text-white text-xs">HP {index + 1}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Restantes: {editedUnit.currentDamage.filter(d => !d).length} / {editedUnit.damagePoints}
                </p>
              </>
            ) : (
              <div className="p-2 bg-gray-700 bg-opacity-30 rounded">
                <p className="text-white text-sm">
                  <span className="font-semibold">HP Total:</span> {editedUnit.damagePoints}
                </p>
              </div>
            )}
          </div>

          {/* Ammunition Counters */}
          <div className="border-t border-gray-700 pt-3">
            <h3 className="text-sm font-semibold text-cyan-400 mb-2">Ammunition and Capabilities</h3>
            <div className="space-y-2">
              {/* Primary Attack */}
              {editedUnit.attackPrimary !== undefined && (
                <div className="flex items-center justify-between p-2 bg-red-900 bg-opacity-20 rounded border border-red-500">
                  <div className="flex-1">
                    <p className="text-red-400 font-semibold text-xs">🔴 Primary Attack</p>
                    <p className="text-white text-xs">
                      {isAdmin ? (
                        <>Restante: {getRemaining(editedUnit.attackPrimary, editedUnit.attackPrimaryUsed)} / {editedUnit.attackPrimary}</>
                      ) : (
                        <>Capacity: {editedUnit.attackPrimary}</>
                      )}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustAmmunition('attackPrimaryUsed', 'attackPrimary', 1);
                        }}
                        disabled={getRemaining(editedUnit.attackPrimary, editedUnit.attackPrimaryUsed) === 0}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs"
                      >
                        Usar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustAmmunition('attackPrimaryUsed', 'attackPrimary', -1);
                        }}
                        disabled={(editedUnit.attackPrimaryUsed || 0) === 0}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs"
                      >
                        Recuperar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Secondary Attack */}
              {editedUnit.attackSecondary !== undefined && (
                <div className="flex items-center justify-between p-2 bg-orange-900 bg-opacity-20 rounded border border-orange-500">
                  <div className="flex-1">
                    <p className="text-orange-400 font-semibold text-xs">🟠 Secondary Attack</p>
                    <p className="text-white text-xs">
                      {isAdmin ? (
                        <>Restante: {getRemaining(editedUnit.attackSecondary, editedUnit.attackSecondaryUsed)} / {editedUnit.attackSecondary}</>
                      ) : (
                        <>Capacity: {editedUnit.attackSecondary}</>
                      )}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustAmmunition('attackSecondaryUsed', 'attackSecondary', 1);
                        }}
                        disabled={getRemaining(editedUnit.attackSecondary, editedUnit.attackSecondaryUsed) === 0}
                        className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs"
                      >
                        Usar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustAmmunition('attackSecondaryUsed', 'attackSecondary', -1);
                        }}
                        disabled={(editedUnit.attackSecondaryUsed || 0) === 0}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs"
                      >
                        Recuperar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Interception */}
              {editedUnit.interception !== undefined && (
                <div className="flex items-center justify-between p-2 bg-purple-900 bg-opacity-20 rounded border border-purple-500">
                  <div className="flex-1">
                    <p className="text-purple-400 font-semibold text-xs">🟣 Interception</p>
                    <p className="text-white text-xs">
                      {isAdmin ? (
                        <>Restante: {getRemaining(editedUnit.interception, editedUnit.interceptionUsed)} / {editedUnit.interception}</>
                      ) : (
                        <>Capacity: {editedUnit.interception}</>
                      )}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustAmmunition('interceptionUsed', 'interception', 1);
                        }}
                        disabled={getRemaining(editedUnit.interception, editedUnit.interceptionUsed) === 0}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs"
                      >
                        Usar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustAmmunition('interceptionUsed', 'interception', -1);
                        }}
                        disabled={(editedUnit.interceptionUsed || 0) === 0}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs"
                      >
                        Recuperar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Supply */}
              {editedUnit.supply !== undefined && (
                <div className="flex items-center justify-between p-2 bg-blue-900 bg-opacity-20 rounded border border-blue-500">
                  <div className="flex-1">
                    <p className="text-blue-400 font-semibold text-xs">🔵 Supply</p>
                    <p className="text-white text-xs">
                      {isAdmin ? (
                        <>Restante: {getRemaining(editedUnit.supply, editedUnit.supplyUsed)} / {editedUnit.supply}</>
                      ) : (
                        <>Capacity: {editedUnit.supply}</>
                      )}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustAmmunition('supplyUsed', 'supply', 1);
                        }}
                        disabled={getRemaining(editedUnit.supply, editedUnit.supplyUsed) === 0}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs"
                      >
                        Usar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustAmmunition('supplyUsed', 'supply', -1);
                        }}
                        disabled={(editedUnit.supplyUsed || 0) === 0}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs"
                      >
                        Recuperar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Ground Combat */}
              {editedUnit.groundCombat !== undefined && (
                <div className="flex items-center justify-between p-2 bg-green-900 bg-opacity-20 rounded border border-green-500">
                  <div className="flex-1">
                    <p className="text-green-400 font-semibold text-xs">🟢 Ground Combat</p>
                    <p className="text-white text-xs">
                      {isAdmin ? (
                        <>Restante: {getRemaining(editedUnit.groundCombat, editedUnit.groundCombatUsed)} / {editedUnit.groundCombat}</>
                      ) : (
                        <>Capacity: {editedUnit.groundCombat}</>
                      )}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustAmmunition('groundCombatUsed', 'groundCombat', 1);
                        }}
                        disabled={getRemaining(editedUnit.groundCombat, editedUnit.groundCombatUsed) === 0}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs"
                      >
                        Usar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustAmmunition('groundCombatUsed', 'groundCombat', -1);
                        }}
                        disabled={(editedUnit.groundCombatUsed || 0) === 0}
                        className="bg-lime-600 hover:bg-lime-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-xs"
                      >
                        Recuperar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* No capabilities message */}
              {!editedUnit.attackPrimary && !editedUnit.attackSecondary &&
               !editedUnit.interception && !editedUnit.supply && !editedUnit.groundCombat && (
                <p className="text-gray-400 text-center py-4">This unit has no combat capabilities available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-3">
          <div className="flex justify-end space-x-2">
            {isAdmin && !isReadOnly ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitDetailModal;
