import React, { useState, useMemo } from 'react';
import { Card, CardType, UnitCategory, Location, Unit, InfluenceThreshold } from '../types';
import { CARD_TYPE_LABELS, CARD_TYPE_OPTIONS } from '../constants';
import { formatInfluenceEffect } from '../utils/dice';

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  onUpdateCards: (cards: Card[]) => void;
  isAdmin: boolean;
  locations: Location[]; // Lista de bases para condiciones
  units: Unit[]; // Lista de unidades para tipos de transporte
}

const UNIT_CATEGORY_OPTIONS: { value: UnitCategory; label: string }[] = [
  { value: 'ground', label: 'Terrestre' },
  { value: 'naval', label: 'Naval' },
  { value: 'artillery', label: 'Artillería' },
  { value: 'interception', label: 'Intercepción' },
  { value: 'supply', label: 'Suministro' },
];

const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  onClose,
  cards,
  onUpdateCards,
  isAdmin,
  locations,
  units,
}) => {
  const [editedCards, setEditedCards] = useState<Card[]>(cards);
  const [selectedFaction, setSelectedFaction] = useState<'us' | 'china'>('us');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<CardType | 'all'>('all');

  // Filter cards by faction
  const factionCards = useMemo(() => {
    return editedCards.filter(card => card.faction === selectedFaction);
  }, [editedCards, selectedFaction]);

  // Filter cards by type
  const filteredCards = useMemo(() => {
    if (selectedTypeFilter === 'all') return factionCards;
    return factionCards.filter(card => card.cardType === selectedTypeFilter);
  }, [factionCards, selectedTypeFilter]);

  // Get selected card
  const selectedCard = useMemo(() => {
    return editedCards.find(card => card.id === selectedCardId);
  }, [editedCards, selectedCardId]);

  // Count cards by type
  const cardTypeCounts = useMemo(() => {
    const counts: Record<CardType, number> = {
      attack: 0,
      maneuver: 0,
      interception: 0,
      intelligence: 0,
      communications: 0,
    };
    factionCards.forEach(card => {
      counts[card.cardType]++;
    });
    return counts;
  }, [factionCards]);

  // Filter locations by selected card's faction
  const factionLocations = useMemo(() => {
    if (!selectedCard) return [];
    const countryMap = { us: 'EE. UU.', china: 'China' } as const;
    return locations.filter(loc => loc.country === countryMap[selectedCard.faction]);
  }, [locations, selectedCard]);

  // Get selected base for condition
  const selectedBase = useMemo(() => {
    if (!selectedCard?.requiredBaseId) return null;
    return locations.find(loc => loc.id === selectedCard.requiredBaseId);
  }, [locations, selectedCard]);

  // Get unique unit types for transport dropdown (filtered by card faction, excluding naval)
  const filteredUnitTypes = useMemo(() => {
    if (!selectedCard) return [];

    const types = new Set<string>();
    units.forEach(unit => {
      // Filtrar por facción de la carta
      if (unit.faction === selectedCard.faction &&
          unit.type &&
          unit.category !== 'naval') { // Excluir unidades navales
        types.add(unit.type);
      }
    });
    return Array.from(types).sort();
  }, [units, selectedCard]);

  const handleCardUpdate = (
    field: keyof Card,
    value: CardType | number | boolean | UnitCategory | string | undefined
  ) => {
    if (!selectedCardId) return;

    setEditedCards(prev =>
      prev.map(card => {
        if (card.id === selectedCardId) {
          const updated = { ...card, [field]: value };

          // Si se desmarca isAttachable, limpiar campos relacionados
          if (field === 'isAttachable' && !value) {
            delete updated.attachableCategory;
            delete updated.hpBonus;
            delete updated.secondaryAmmoBonus;
          }

          // Si se desmarca requiresBaseCondition, limpiar campos relacionados
          if (field === 'requiresBaseCondition' && !value) {
            delete updated.requiredBaseId;
            delete updated.requiredBaseMaxDamage;
          }

          // Si se cambia la base seleccionada, resetear el umbral de daño
          if (field === 'requiredBaseId') {
            delete updated.requiredBaseMaxDamage;
          }

          // Si se desmarca isTransport, limpiar campos relacionados
          if (field === 'isTransport' && !value) {
            delete updated.transportCapacity;
            delete updated.transportSlots;
          }

          // Si cambia la capacidad, ajustar el array de slots
          if (field === 'transportCapacity' && typeof value === 'number') {
            const newCapacity = value;
            const currentSlots = updated.transportSlots || [];
            // Ajustar el tamaño del array al nuevo capacity
            updated.transportSlots = Array.from({ length: newCapacity }, (_, i) => currentSlots[i] || '');
          }

          // Si se desmarca isInfluenceCard, limpiar campos relacionados
          if (field === 'isInfluenceCard' && !value) {
            delete updated.influenceThresholds;
          }

          // Si se marca isInfluenceCard y no hay thresholds, inicializar con 5 umbrales estándar
          if (field === 'isInfluenceCard' && value && !updated.influenceThresholds) {
            updated.influenceThresholds = [
              { minRoll: 1, maxRoll: 3, influenceEffect: 3, description: 'Decisive Success' },
              { minRoll: 4, maxRoll: 9, influenceEffect: 2, description: 'Minor Success' },
              { minRoll: 10, maxRoll: 12, influenceEffect: 0, description: 'No Effect' },
              { minRoll: 13, maxRoll: 16, influenceEffect: -1, description: 'Failure' },
              { minRoll: 17, maxRoll: 20, influenceEffect: -4, description: 'Major Failure' }
            ];
          }

          return updated;
        }
        return card;
      })
    );
  };

  // Función helper para actualizar un slot específico del array transportSlots
  const handleTransportSlotUpdate = (slotIndex: number, unitType: string) => {
    if (!selectedCardId || !selectedCard) return;

    const currentSlots = selectedCard.transportSlots || [];
    const newSlots = [...currentSlots];
    newSlots[slotIndex] = unitType;

    handleCardUpdate('transportSlots', newSlots);
  };

  // Funciones para manejar umbrales de influencia
  const handleThresholdUpdate = (index: number, field: keyof InfluenceThreshold, value: number | string) => {
    if (!selectedCardId || !selectedCard) return;

    const currentThresholds = selectedCard.influenceThresholds || [];
    const newThresholds = [...currentThresholds];
    newThresholds[index] = { ...newThresholds[index], [field]: value };

    handleCardUpdate('influenceThresholds', newThresholds);
  };

  const handleAddThreshold = () => {
    if (!selectedCardId || !selectedCard) return;

    const currentThresholds = selectedCard.influenceThresholds || [];
    const newThreshold: InfluenceThreshold = {
      minRoll: 1,
      maxRoll: 1,
      influenceEffect: 0,
      description: 'Nuevo umbral'
    };

    handleCardUpdate('influenceThresholds', [...currentThresholds, newThreshold]);
  };

  const handleRemoveThreshold = (index: number) => {
    if (!selectedCardId || !selectedCard) return;

    const currentThresholds = selectedCard.influenceThresholds || [];
    const newThresholds = currentThresholds.filter((_, i) => i !== index);

    handleCardUpdate('influenceThresholds', newThresholds);
  };

  const handleCreateNewCard = () => {
    if (!isAdmin) return;

    // Generate unique ID
    const prefix = selectedFaction === 'us' ? 'card-us' : 'card-cn';
    const existingIds = editedCards
      .filter(c => c.id.startsWith(prefix))
      .map(c => parseInt(c.id.split('-')[2]) || 0);
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const newId = `${prefix}-${String(nextId).padStart(3, '0')}`;

    const newCard: Card = {
      id: newId,
      name: 'Nueva Carta',
      faction: selectedFaction,
      cardType: 'attack',
      cost: 1,
      imagePath: selectedFaction === 'us'
        ? '/Cartas USMC/placeholder.jpg'
        : '/Cartas PLAN/placeholder.jpg',
    };

    setEditedCards(prev => [...prev, newCard]);
    setSelectedCardId(newId);
  };

  // Función para limpiar campos falsy antes de guardar a Firestore
  const cleanCardForFirestore = (card: Card): Card => {
    const cleaned = { ...card };

    if (!cleaned.isAttachable) {
      delete cleaned.attachableCategory;
      delete cleaned.hpBonus;
      delete cleaned.secondaryAmmoBonus;
      delete cleaned.isAttachable; // No guardar false, mejor ausencia
    } else {
      if (!cleaned.hpBonus) delete cleaned.hpBonus;
      if (!cleaned.secondaryAmmoBonus) delete cleaned.secondaryAmmoBonus;
    }

    // Limpiar campos de condiciones si no están activas
    if (!cleaned.requiresBaseCondition) {
      delete cleaned.requiredBaseId;
      delete cleaned.requiredBaseMaxDamage;
      delete cleaned.requiresBaseCondition; // No guardar false, mejor ausencia
    } else {
      if (!cleaned.requiredBaseId) delete cleaned.requiredBaseId;
      if (!cleaned.requiredBaseMaxDamage) delete cleaned.requiredBaseMaxDamage;
    }

    // Limpiar límite de compras solo si es undefined o null
    // Preservar 0 explícitamente (0 = sin límite de compras)
    if (cleaned.maxPurchases === undefined || cleaned.maxPurchases === null) {
      delete cleaned.maxPurchases;
    }

    // Limpiar deployment time solo si es undefined o null
    // Preservar 0 explícitamente (0 = deployment inmediato)
    if (cleaned.deploymentTime === undefined || cleaned.deploymentTime === null) {
      delete cleaned.deploymentTime;
    }

    // Limpiar campos de transporte si no están activos
    if (!cleaned.isTransport) {
      delete cleaned.transportCapacity;
      delete cleaned.transportSlots;
      delete cleaned.isTransport; // No guardar false, mejor ausencia
    } else {
      if (!cleaned.transportCapacity) delete cleaned.transportCapacity;
      // Limpiar slots vacíos del array
      if (cleaned.transportSlots) {
        cleaned.transportSlots = cleaned.transportSlots.filter(slot => slot && slot.trim() !== '');
        if (cleaned.transportSlots.length === 0) {
          delete cleaned.transportSlots;
        }
      }
    }

    // Limpiar campos de influencia si no están activos
    if (!cleaned.isInfluenceCard) {
      delete cleaned.influenceThresholds;
      delete cleaned.isInfluenceCard; // No guardar false, mejor ausencia
    } else {
      // Validar que hay al menos un umbral
      if (!cleaned.influenceThresholds || cleaned.influenceThresholds.length === 0) {
        delete cleaned.influenceThresholds;
      }
    }

    // Limpiar campo de campaña submarina si no está activo
    if (!cleaned.sub) {
      delete cleaned.sub; // No guardar false, mejor ausencia
      delete cleaned.submarineType; // Limpiar tipo si campaña submarina está desactivada
    }

    // Limpiar campo de usos infinitos si no está activo
    if (!cleaned.infinite) {
      delete cleaned.infinite; // No guardar false, mejor ausencia
    }

    return cleaned;
  };

  const handleSave = () => {
    // Limpiar todas las cartas antes de guardar
    const cleanedCards = editedCards.map(cleanCardForFirestore);
    onUpdateCards(cleanedCards);
    onClose();
  };

  const handleCancel = () => {
    setEditedCards(cards); // Reset changes
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
      <div className="bg-gray-800 rounded-lg shadow-xl w-[95vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Editor de Cartas
            </h2>
            <p className="text-gray-400 mt-1">
              Edita el tipo, costo y propiedades de las cartas
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white text-3xl font-bold"
          >
            ×
          </button>
        </div>


        {/* Admin Warning Banner */}
        {!isAdmin && (
          <div className="mx-6 mt-4 p-3 bg-yellow-900 bg-opacity-50 border border-yellow-600 rounded text-yellow-200 text-sm">
            <strong>⚠️ Read-Only Mode:</strong> You must be in administrator mode to edit cards.
          </div>
        )}

        {/* Filters Section - Full Width */}
        <div className="mx-6 mt-4">
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-center gap-6">
              {/* Faction Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Faction:</span>
                <button
                  onClick={() => setSelectedFaction('us')}
                  className={`rounded-lg transition-all ${
                    selectedFaction === 'us'
                      ? 'ring-4 ring-blue-500'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title={`USMC (${editedCards.filter(c => c.faction === 'us').length})`}
                >
                  <img src="/images/Icon_USMC.png" alt="USMC" className="w-8 h-8 rounded-lg" />
                </button>
                <button
                  onClick={() => setSelectedFaction('china')}
                  className={`rounded-lg transition-all ${
                    selectedFaction === 'china'
                      ? 'ring-4 ring-red-500'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title={`PLAN (${editedCards.filter(c => c.faction === 'china').length})`}
                >
                  <img src="/images/Icon_PLAN.png" alt="PLAN" className="w-8 h-8 rounded-lg" />
                </button>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-700"></div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Type:</span>
                <button
                  onClick={() => setSelectedTypeFilter('all')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    selectedTypeFilter === 'all'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                {(Object.keys(CARD_TYPE_LABELS) as CardType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedTypeFilter(type)}
                    className={`p-1.5 rounded transition-all ${
                      selectedTypeFilter === type
                        ? 'ring-2 ring-cyan-400 bg-gray-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    title={`${CARD_TYPE_LABELS[type].label} (${cardTypeCounts[type]})`}
                  >
                    <img
                      src={CARD_TYPE_LABELS[type].icon}
                      alt={CARD_TYPE_LABELS[type].label}
                      className="w-6 h-6 object-contain"
                    />
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-700"></div>

              {/* New Card Button */}
              {isAdmin && (
                <button
                  onClick={handleCreateNewCard}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-medium flex items-center gap-1"
                  title="Create New Card"
                >
                  <span className="text-lg leading-none">+</span>
                  <span>New Card</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Three Columns */}
        <div className="flex-1 grid grid-cols-12 gap-4 px-6 pb-6 pt-4 overflow-hidden">
          {/* Left Column: Card List */}
          <div className="col-span-3 flex flex-col min-h-0">
            {/* Card List */}
            <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden flex flex-col min-h-0">
              <h3 className="text-sm font-bold text-white p-3 border-b border-gray-700">
                Cards ({filteredCards.length})
              </h3>
              <div className="flex-1 overflow-y-auto min-h-0">
                {filteredCards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`w-full px-3 py-2 text-left border-b border-gray-800 transition-colors ${
                      selectedCardId === card.id
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="text-sm font-medium truncate">{card.name}</div>
                    <div className="text-xs opacity-75 mt-0.5 flex items-center gap-2">
                      <span>{CARD_TYPE_LABELS[card.cardType].label} • {card.cost} pts</span>
                      <div className="flex items-center gap-1 ml-auto">
                        {card.isTransport && (
                          <span
                            className="bg-gray-600 text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded border border-gray-500"
                            title="Transport Card"
                          >
                            T
                          </span>
                        )}
                        {card.isInfluenceCard && (
                          <span
                            className="bg-blue-600 text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded border border-blue-500"
                            title="Influence Card"
                          >
                            I
                          </span>
                        )}
                        {card.sub && (
                          <span
                            className="text-blue-400 text-lg leading-none"
                            title="Submarine Campaign Card"
                          >
                            🔵
                          </span>
                        )}
                        {card.infinite && (
                          <span
                            className="bg-purple-600 text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded border border-purple-500"
                            title="Infinite Uses"
                          >
                            ∞
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column: Card Preview */}
          <div className="col-span-5 flex flex-col bg-gray-900 rounded-lg min-h-0">
            <h3 className="text-lg font-bold text-white p-4 border-b border-gray-700">
              Preview
            </h3>
            <div className="flex-1 p-4 flex items-center justify-center min-h-0 overflow-auto">
              {selectedCard ? (
                <img
                  src={selectedCard.imagePath}
                  alt={selectedCard.name}
                  className="max-w-full max-h-full object-contain rounded-lg border-2 border-cyan-400"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-lg">Select a card</p>
                  <p className="text-sm mt-2">to view preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Edit Form */}
          <div className="col-span-4 flex flex-col bg-gray-900 rounded-lg min-h-0">
            <h3 className="text-lg font-bold text-white p-4 border-b border-gray-700">
              Propiedades
            </h3>
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {selectedCard ? (
                <div className="space-y-3">
                  {/* ID y Nombre en la misma línea */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        ID
                      </label>
                      <input
                        type="text"
                        value={selectedCard.id}
                        disabled
                        className="w-full px-2 py-1.5 bg-gray-800 text-gray-500 text-xs rounded border border-gray-700"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={selectedCard.name}
                        onChange={(e) => handleCardUpdate('name', e.target.value)}
                        disabled={!isAdmin}
                        className="w-full px-2 py-1.5 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Faction (readonly) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Faction
                    </label>
                    <input
                      type="text"
                      value={selectedCard.faction === 'us' ? 'USMC' : 'PLAN'}
                      disabled
                      className="w-full px-2 py-1.5 bg-gray-800 text-gray-500 text-xs rounded border border-gray-700"
                    />
                  </div>

                  {/* Tipo y Costo en la misma línea */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Type
                      </label>
                      <select
                        value={selectedCard.cardType}
                        onChange={(e) => handleCardUpdate('cardType', e.target.value as CardType)}
                        disabled={!isAdmin}
                        className="w-full px-2 py-1.5 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {CARD_TYPE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Cost
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={selectedCard.cost}
                        onChange={(e) => handleCardUpdate('cost', parseInt(e.target.value) || 0)}
                        disabled={!isAdmin}
                        className="w-full px-2 py-1.5 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Image Path */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Image Path
                    </label>
                    <input
                      type="text"
                      value={selectedCard.imagePath}
                      onChange={(e) => handleCardUpdate('imagePath', e.target.value)}
                      disabled={!isAdmin}
                      className="w-full px-2 py-1.5 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Tiempo de Despliegue */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Deployment Time (days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={selectedCard.deploymentTime ?? 0}
                      onChange={(e) => handleCardUpdate('deploymentTime', parseInt(e.target.value) || 0)}
                      disabled={!isAdmin}
                      className="w-full px-2 py-1.5 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Days until card becomes operational. 0 = immediate"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      0 = immediate, 1-7 = days delay
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-700 my-3"></div>

                  {/* Adjuntable */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isAttachable"
                      checked={selectedCard.isAttachable || false}
                      onChange={(e) => handleCardUpdate('isAttachable', e.target.checked)}
                      disabled={!isAdmin}
                      className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <label htmlFor="isAttachable" className="text-xs font-medium text-gray-300">
                      Card Attachable to Units
                    </label>
                  </div>

                  {/* Attachment fields (conditional) - Todo en una línea */}
                  {selectedCard.isAttachable && (
                    <div className="grid grid-cols-3 gap-2">
                      {/* Unit Category */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Category
                        </label>
                        <select
                          value={selectedCard.attachableCategory || ''}
                          onChange={(e) => handleCardUpdate('attachableCategory', e.target.value as UnitCategory || undefined)}
                          disabled={!isAdmin}
                          className="w-full px-2 py-1.5 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">-</option>
                          {UNIT_CATEGORY_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* HP Bonus */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          HP
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={selectedCard.hpBonus || 0}
                          onChange={(e) => handleCardUpdate('hpBonus', parseInt(e.target.value) || 0)}
                          disabled={!isAdmin}
                          className="w-full px-2 py-1.5 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Secondary Ammo Bonus */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Mun 2ª
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={selectedCard.secondaryAmmoBonus || 0}
                          onChange={(e) => handleCardUpdate('secondaryAmmoBonus', parseInt(e.target.value) || 0)}
                          disabled={!isAdmin}
                          className="w-full px-2 py-1.5 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-700 my-3"></div>

                  {/* Condición de Base */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="requiresBaseCondition"
                      checked={selectedCard.requiresBaseCondition || false}
                      onChange={(e) => handleCardUpdate('requiresBaseCondition', e.target.checked)}
                      disabled={!isAdmin}
                      className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <label htmlFor="requiresBaseCondition" className="text-xs font-medium text-gray-300">
                      Base Condition
                    </label>
                  </div>

                  {/* Base condition fields (conditional) */}
                  {selectedCard.requiresBaseCondition && (
                    <div className="space-y-2">
                      {/* Base Selector */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Required Base
                        </label>
                        <select
                          value={selectedCard.requiredBaseId || ''}
                          onChange={(e) => handleCardUpdate('requiredBaseId', e.target.value || undefined)}
                          disabled={!isAdmin}
                          className="w-full px-2 py-1.5 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Select base...</option>
                          {factionLocations.map(location => (
                            <option key={location.id} value={location.id}>
                              {location.name} ({location.damagePoints} HP)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Damage Threshold Selector */}
                      {selectedBase && (
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Damage Threshold (disable if reached)
                          </label>
                          <select
                            value={selectedCard.requiredBaseMaxDamage || ''}
                            onChange={(e) => handleCardUpdate('requiredBaseMaxDamage', parseInt(e.target.value) || undefined)}
                            disabled={!isAdmin}
                            className="w-full px-2 py-1.5 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Select threshold...</option>
                            {Array.from({ length: selectedBase.damagePoints }, (_, i) => i + 1).map(threshold => (
                              <option key={threshold} value={threshold}>
                                {threshold} {threshold === selectedBase.damagePoints ? '(destroyed)' : 'points'}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            Card disabled if base has ≥ {selectedCard.requiredBaseMaxDamage || '?'} damage points
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-700 my-3"></div>

                  {/* Carta de Transporte */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isTransport"
                      checked={selectedCard.isTransport || false}
                      onChange={(e) => handleCardUpdate('isTransport', e.target.checked)}
                      disabled={!isAdmin}
                      className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <label htmlFor="isTransport" className="text-xs font-medium text-gray-300">
                      🚁 Transport Card
                    </label>
                  </div>

                  {/* Transport fields (conditional) */}
                  {selectedCard.isTransport && (
                    <div className="space-y-2">
                      {/* Transport Capacity */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Transport Capacity
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          placeholder="4"
                          value={selectedCard.transportCapacity || ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            handleCardUpdate('transportCapacity', isNaN(value) ? undefined : value);
                          }}
                          disabled={!isAdmin}
                          className="w-full px-2 py-1.5 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Number of units it can transport (1-20)
                        </p>
                      </div>

                      {/* Configuración de Slots */}
                      {selectedCard.transportCapacity && selectedCard.transportCapacity > 0 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">
                            Configuración de Slots
                          </label>
                          <div className="space-y-2">
                            {Array.from({ length: selectedCard.transportCapacity }, (_, index) => (
                              <div key={index}>
                                <label className="block text-xs text-gray-500 mb-1">
                                  Slot {index + 1}
                                </label>
                                <select
                                  value={(selectedCard.transportSlots && selectedCard.transportSlots[index]) || ''}
                                  onChange={(e) => handleTransportSlotUpdate(index, e.target.value)}
                                  disabled={!isAdmin}
                                  className="w-full px-2 py-1.5 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <option value="">Select type...</option>
                                  {filteredUnitTypes.map(type => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Each slot can accept a specific unit type ({selectedCard.faction === 'us' ? 'USMC' : 'PLAN'}, no naval)
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-700 my-3"></div>

                  {/* Carta de Campaña Submarina */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sub"
                      checked={selectedCard.sub || false}
                      onChange={(e) => handleCardUpdate('sub', e.target.checked)}
                      disabled={!isAdmin}
                      className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <label htmlFor="sub" className="text-xs font-medium text-gray-300">
                      🌊 Carta de Campaña Submarina
                    </label>
                  </div>

                  {/* Submarine Card Type Dropdown (conditional) */}
                  {selectedCard.sub && (
                    <div className="ml-6 mt-2 space-y-1">
                      <label htmlFor="submarineType" className="block text-xs font-medium text-gray-400">
                        Tipo de Carta Submarina:
                      </label>
                      <select
                        id="submarineType"
                        value={selectedCard.submarineType || ''}
                        onChange={(e) => handleCardUpdate('submarineType', e.target.value || undefined)}
                        disabled={!isAdmin}
                        className="w-full px-3 py-2 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Seleccionar tipo --</option>
                        <option value="submarine">🔵 Submarino</option>
                        <option value="asw">⚓ Unidad ASW</option>
                        <option value="asset">🛠️ Asset de Soporte</option>
                      </select>
                      {!selectedCard.submarineType && (
                        <p className="text-xs text-yellow-400 mt-1">
                          ⚠️ Debes seleccionar un tipo para cartas de campaña submarina
                        </p>
                      )}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-700 my-3"></div>

                  {/* Carta de Influencia */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isInfluenceCard"
                      checked={selectedCard.isInfluenceCard || false}
                      onChange={(e) => handleCardUpdate('isInfluenceCard', e.target.checked)}
                      disabled={!isAdmin}
                      className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <label htmlFor="isInfluenceCard" className="text-xs font-medium text-gray-300">
                      🎲 Carta de Influencia (Tirada d20)
                    </label>
                  </div>

                  {/* Influence thresholds (conditional) */}
                  {selectedCard.isInfluenceCard && (
                    <div className="space-y-3 bg-purple-900 bg-opacity-20 p-3 rounded border border-purple-700">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-purple-300">
                          Roll Thresholds
                        </label>
                        {isAdmin && (
                          <button
                            onClick={handleAddThreshold}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                          >
                            + Add Threshold
                          </button>
                        )}
                      </div>

                      {/* Thresholds table */}
                      <div className="space-y-2">
                        {(selectedCard.influenceThresholds || []).map((threshold, index) => (
                          <div
                            key={index}
                            className="bg-gray-800 p-2 rounded border border-gray-700"
                          >
                            <div className="grid grid-cols-12 gap-2 items-start">
                              {/* Min Roll */}
                              <div className="col-span-2">
                                <label className="block text-xs text-gray-400 mb-1">Min</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={threshold.minRoll}
                                  onChange={(e) => handleThresholdUpdate(index, 'minRoll', parseInt(e.target.value) || 1)}
                                  disabled={!isAdmin}
                                  className="w-full px-2 py-1 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                                />
                              </div>

                              {/* Max Roll */}
                              <div className="col-span-2">
                                <label className="block text-xs text-gray-400 mb-1">Max</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={threshold.maxRoll}
                                  onChange={(e) => handleThresholdUpdate(index, 'maxRoll', parseInt(e.target.value) || 1)}
                                  disabled={!isAdmin}
                                  className="w-full px-2 py-1 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                                />
                              </div>

                              {/* Effect */}
                              <div className="col-span-2">
                                <label className="block text-xs text-gray-400 mb-1">Efecto</label>
                                <input
                                  type="number"
                                  min="-10"
                                  max="10"
                                  value={threshold.influenceEffect}
                                  onChange={(e) => handleThresholdUpdate(index, 'influenceEffect', parseInt(e.target.value) || 0)}
                                  disabled={!isAdmin}
                                  className={`w-full px-2 py-1 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-purple-500 disabled:opacity-50 font-bold ${
                                    threshold.influenceEffect > 0 ? 'text-blue-400' :
                                    threshold.influenceEffect < 0 ? 'text-red-400' :
                                    'text-yellow-400'
                                  }`}
                                />
                              </div>

                              {/* Description */}
                              <div className="col-span-5">
                                <label className="block text-xs text-gray-400 mb-1">Description</label>
                                <input
                                  type="text"
                                  value={threshold.description}
                                  onChange={(e) => handleThresholdUpdate(index, 'description', e.target.value)}
                                  disabled={!isAdmin}
                                  placeholder="Ex: Decisive success (+3)"
                                  className="w-full px-2 py-1 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                                />
                              </div>

                              {/* Delete button */}
                              <div className="col-span-1 flex items-end">
                                {isAdmin && (
                                  <button
                                    onClick={() => handleRemoveThreshold(index)}
                                    className="w-full px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                    title="Remove threshold"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Preview */}
                            <div className="mt-1 text-xs text-gray-400">
                              🎲 {threshold.minRoll}-{threshold.maxRoll}: <span className={`font-semibold ${
                                threshold.influenceEffect > 0 ? 'text-blue-400' :
                                threshold.influenceEffect < 0 ? 'text-red-400' :
                                'text-yellow-400'
                              }`}>{formatInfluenceEffect(threshold.influenceEffect)}</span> ({threshold.description})
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Define los rangos de tirada (1-20) y su efecto en el marcador de influencia (-10 a +10)
                      </p>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-700 my-3"></div>

                  {/* Límite de Compras */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Límite de Compras (opcional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      placeholder="0 = No limit"
                      value={selectedCard.maxPurchases !== undefined ? selectedCard.maxPurchases : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || value === null) {
                          handleCardUpdate('maxPurchases', undefined);
                        } else {
                          const numValue = parseInt(value);
                          handleCardUpdate('maxPurchases', isNaN(numValue) ? undefined : numValue);
                        }
                      }}
                      disabled={!isAdmin}
                      className="w-full px-2 py-1.5 bg-gray-700 text-white text-xs rounded border border-gray-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Número máximo de compras (0 = sin límite, vacío = límite de 1)
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-700 my-3"></div>

                  {/* Usos Infinitos */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="infinite"
                      checked={selectedCard.infinite || false}
                      onChange={(e) => handleCardUpdate('infinite', e.target.checked)}
                      disabled={!isAdmin}
                      className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <label htmlFor="infinite" className="text-xs font-medium text-gray-300">
                      ♾️ Usos Infinitos
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    La carta no desaparecerá del área de despliegue al ser usada
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  <p className="text-sm">Select a card</p>
                  <p className="text-xs mt-1">to edit its properties</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
          >
            {isAdmin ? 'Cancel' : 'Close'}
          </button>
          {isAdmin && (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardEditorModal;
