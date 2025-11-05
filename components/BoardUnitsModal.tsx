import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, Unit } from '../types';

interface BoardUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transportCard: Card;
  availableUnits: Unit[];
  currentEmbarkedUnits?: string[]; // Para edición de embarque existente
  onBoard: (unitIds: string[]) => void;
}

const BoardUnitsModal: React.FC<BoardUnitsModalProps> = ({
  isOpen,
  onClose,
  transportCard,
  availableUnits,
  currentEmbarkedUnits = [],
  onBoard,
}) => {
  const [selectedUnits, setSelectedUnits] = useState<string[]>(
    currentEmbarkedUnits.length > 0
      ? currentEmbarkedUnits
      : Array(transportCard.transportCapacity || 0).fill('')
  );

  // Track previous isOpen state to detect when modal opens
  const prevIsOpenRef = useRef(isOpen);

  // Sync selectedUnits only when modal opens (transition from false to true)
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    const isNowOpen = isOpen;

    // Only sync when modal transitions from closed to open
    if (!wasOpen && isNowOpen) {
      setSelectedUnits(
        currentEmbarkedUnits.length > 0
          ? currentEmbarkedUnits
          : Array(transportCard.transportCapacity || 0).fill('')
      );
    }

    // Update ref for next check
    prevIsOpenRef.current = isOpen;
  }, [isOpen, currentEmbarkedUnits, transportCard.transportCapacity]);

  // Filtrar unidades disponibles para cada slot
  const getAvailableUnitsForSlot = (slotIndex: number): Unit[] => {
    const requiredType = transportCard.transportSlots?.[slotIndex];
    if (!requiredType) return [];

    const filtered = availableUnits.filter(unit => {
      // Match de tipo exacto
      if (unit.type !== requiredType) return false;

      // Excluir unidades ya seleccionadas en otros slots
      const isAlreadySelected = selectedUnits.some(
        (selectedId, idx) => idx !== slotIndex && selectedId === unit.id
      );
      if (isAlreadySelected) return false;

      // Excluir unidades con taskForceId (excepto si es la misma unidad siendo re-seleccionada)
      if (unit.taskForceId && !currentEmbarkedUnits.includes(unit.id)) {
        return false;
      }

      // Excluir unidades destruidas
      const destroyedCount = unit.currentDamage?.filter(d => d).length || 0;
      if (destroyedCount >= unit.damagePoints) return false;

      return true;
    });

    // Ordenar unidades por formación (agrupa ALPHA, BRAVO, etc.)
    return filtered.sort((a, b) => {
      // Extraer la formación (parte alfabética) del nombre
      const getFormation = (name: string): string => {
        // Buscar palabras en mayúsculas (ALPHA, BRAVO, CHARLIE, etc.)
        const match = name.match(/[A-Z]+(?=[^A-Z]*$)/);
        return match ? match[0] : name;
      };

      // Extraer el número de la unidad
      const getUnitNumber = (name: string): number => {
        // Buscar el primer número en el nombre
        const match = name.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };

      const formationA = getFormation(a.name);
      const formationB = getFormation(b.name);
      const numberA = getUnitNumber(a.name);
      const numberB = getUnitNumber(b.name);

      // Primero ordenar por formación alfabéticamente
      if (formationA !== formationB) {
        return formationA.localeCompare(formationB);
      }

      // Si están en la misma formación, ordenar por número
      return numberA - numberB;
    });
  };

  const handleSlotChange = (slotIndex: number, unitId: string) => {
    const newSelectedUnits = [...selectedUnits];
    newSelectedUnits[slotIndex] = unitId;
    setSelectedUnits(newSelectedUnits);
  };

  const handleConfirm = () => {
    // Filtrar slots vacíos
    const embarkedUnitIds = selectedUnits.filter(id => id && id.trim() !== '');

    // Validar al menos 1 unidad
    if (embarkedUnitIds.length === 0) {
      alert('You must embark at least 1 unit');
      return;
    }

    onBoard(embarkedUnitIds);
    onClose();
  };

  const occupiedSlots = selectedUnits.filter(id => id && id.trim() !== '').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">
          Embark Units - {transportCard.name}
        </h2>

        <p className="text-sm text-gray-400 mb-4">
          Capacity: {transportCard.transportCapacity} slots ({occupiedSlots} occupied)
        </p>

        <div className="space-y-3 mb-6">
          {Array.from({ length: transportCard.transportCapacity || 0 }, (_, index) => {
            const availableUnitsForSlot = getAvailableUnitsForSlot(index);
            const requiredType = transportCard.transportSlots?.[index] || 'Unknown';

            return (
              <div key={index}>
                <label className="block text-xs text-gray-400 mb-1">
                  Slot {index + 1} - {requiredType}
                </label>
                <select
                  value={selectedUnits[index] || ''}
                  onChange={(e) => handleSlotChange(index, e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Empty</option>
                  {availableUnitsForSlot.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
                {availableUnitsForSlot.length === 0 && (
                  <p className="text-xs text-red-400 mt-1">
                    No available units of type {requiredType}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {occupiedSlots === 0 && (
          <p className="text-sm text-yellow-400 mb-4">
            ⚠ You must select at least 1 unit
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={occupiedSlots === 0}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Embark
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardUnitsModal;
