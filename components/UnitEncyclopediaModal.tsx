import React, { useState, useMemo } from 'react';
import { Unit, UnitCategory } from '../types';
import { UNIT_CATEGORIES } from '../constants';

interface UnitEncyclopediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: Unit[];
  onUnitsUpdate: (updatedUnits: Unit[]) => void;
  isAdmin: boolean;
  selectedFaction: 'us' | 'china';
}

const UnitEncyclopediaModal: React.FC<UnitEncyclopediaModalProps> = ({
  isOpen,
  onClose,
  units,
  onUnitsUpdate,
  isAdmin,
  selectedFaction: propSelectedFaction
}) => {
  const [selectedFaction, setSelectedFaction] = useState<'us' | 'china'>(propSelectedFaction);
  const [selectedCategory, setSelectedCategory] = useState<UnitCategory | 'all'>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [editedUnits, setEditedUnits] = useState<Unit[]>(units);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  // Estado para crear nueva unidad
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newUnit, setNewUnit] = useState<Partial<Unit>>({
    name: '',
    type: '',
    description: '',
    faction: 'us',
    image: '',
    damagePoints: 1,
    currentDamage: [],
    taskForceId: undefined,
  });

  // Sincronizar con props cuando cambien
  React.useEffect(() => {
    setEditedUnits(units);
  }, [units]);

  // Actualizar facción de nueva unidad cuando cambia la facción seleccionada
  React.useEffect(() => {
    if (isCreatingNew) {
      setNewUnit(prev => ({ ...prev, faction: selectedFaction }));
    }
  }, [selectedFaction, isCreatingNew]);

  // Filtrar unidades por facción y categoría seleccionada
  const filteredUnits = useMemo(() => {
    const filtered = editedUnits.filter(unit => {
      const factionMatch = unit.faction === selectedFaction;
      const categoryMatch = selectedCategory === 'all' || unit.category === selectedCategory;
      return factionMatch && categoryMatch;
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
  }, [editedUnits, selectedFaction, selectedCategory]);

  // Obtener la unidad seleccionada
  const selectedUnit = useMemo(() => {
    return editedUnits.find(unit => unit.id === selectedUnitId);
  }, [editedUnits, selectedUnitId]);

  const handleFieldChange = (unitId: string, field: keyof Unit, value: string | number) => {
    const updated = editedUnits.map(unit => {
      if (unit.id === unitId) {
        // Special handling for damagePoints - normalize currentDamage array
        if (field === 'damagePoints') {
          const numValue = value === '' ? 1 : Number(value);
          const normalizedDamage = [...unit.currentDamage];

          // Resize array to match new damagePoints
          if (normalizedDamage.length < numValue) {
            // Pad with false
            while (normalizedDamage.length < numValue) {
              normalizedDamage.push(false);
            }
          } else if (normalizedDamage.length > numValue) {
            // Truncate from the end
            normalizedDamage.length = numValue;
          }

          return { ...unit, damagePoints: numValue, currentDamage: normalizedDamage };
        }

        // Para campos numéricos opcionales
        if (field === 'attackPrimary' || field === 'attackSecondary' ||
            field === 'interception' || field === 'supply' || field === 'groundCombat' ||
            field === 'deploymentCost') {
          const numValue = value === '' ? undefined : Number(value);
          return { ...unit, [field]: numValue };
        }
        return { ...unit, [field]: value };
      }
      return unit;
    });
    setEditedUnits(updated);
  };

  // Toggle de capacidades opcionales
  const handleCapabilityToggle = (unitId: string, capability: 'attackPrimary' | 'attackSecondary' | 'interception' | 'supply' | 'groundCombat', enabled: boolean) => {
    const updated = editedUnits.map(unit => {
      if (unit.id === unitId) {
        if (enabled) {
          // Activar capacidad con valor por defecto
          return { ...unit, [capability]: 1 };
        } else {
          // Desactivar capacidad (undefined)
          return { ...unit, [capability]: undefined };
        }
      }
      return unit;
    });
    setEditedUnits(updated);
  };

  // Actualizar campos de nueva unidad
  const handleNewUnitFieldChange = (field: keyof Unit, value: string | number) => {
    if (field === 'attackPrimary' || field === 'attackSecondary' ||
        field === 'interception' || field === 'supply' || field === 'groundCombat' ||
        field === 'damagePoints' || field === 'deploymentCost') {
      const numValue = value === '' ? undefined : Number(value);
      setNewUnit(prev => ({ ...prev, [field]: numValue }));
    } else {
      setNewUnit(prev => ({ ...prev, [field]: value }));
    }
  };

  // Toggle de capacidades opcionales para nueva unidad
  const handleNewUnitCapabilityToggle = (capability: 'attackPrimary' | 'attackSecondary' | 'interception' | 'supply' | 'groundCombat', enabled: boolean) => {
    if (enabled) {
      setNewUnit(prev => ({ ...prev, [capability]: 1 }));
    } else {
      setNewUnit(prev => ({ ...prev, [capability]: undefined }));
    }
  };

  // Crear nueva unidad
  const handleCreateUnit = () => {
    if (!newUnit.name || !newUnit.type || !newUnit.damagePoints) {
      alert('Por favor, completa al menos el nombre, tipo y HP de la unidad.');
      return;
    }

    const unit: Unit = {
      id: `${selectedFaction}-custom-${Date.now()}`,
      name: newUnit.name,
      type: newUnit.type,
      description: newUnit.description || '',
      faction: selectedFaction,
      image: newUnit.image || '',
      damagePoints: newUnit.damagePoints,
      currentDamage: Array(newUnit.damagePoints).fill(false),
      taskForceId: undefined,
      attackPrimary: newUnit.attackPrimary,
      attackSecondary: newUnit.attackSecondary,
      interception: newUnit.interception,
      supply: newUnit.supply,
      groundCombat: newUnit.groundCombat,
    };

    setEditedUnits(prev => [...prev, unit]);

    // Reset form
    setNewUnit({
      name: '',
      type: '',
      description: '',
      faction: selectedFaction,
      image: '',
      damagePoints: 1,
      currentDamage: [],
      taskForceId: undefined,
    });
    setIsCreatingNew(false);
  };

  // Cancelar creación de nueva unidad
  const handleCancelNewUnit = () => {
    setNewUnit({
      name: '',
      type: '',
      description: '',
      faction: selectedFaction,
      image: '',
      damagePoints: 1,
      currentDamage: [],
      taskForceId: undefined,
    });
    setIsCreatingNew(false);
  };

  const handleSave = () => {
    onUnitsUpdate(editedUnits);
    onClose();
  };

  const handleCancel = () => {
    setEditedUnits(units); // Revertir cambios
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[10002]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={handleCancel}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-cyan-400">
              Unit Encyclopedia
            </h2>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                ({filteredUnits.length} unidades)
              </span>

              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Cerrar"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Admin Warning Banner */}
        {!isAdmin && (
          <div className="mx-6 mt-4 p-3 bg-yellow-900 bg-opacity-50 border border-yellow-600 rounded text-yellow-200 text-sm">
            <strong>⚠️ Modo Solo Lectura:</strong> Puedes ver las unidades, pero solo el administrador puede editarlas o crear nuevas.
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex-grow flex overflow-hidden bg-gray-900">
          {/* Left Column - Filters and Unit List */}
          <div className="w-[30%] border-r border-gray-700 flex flex-col">
            {/* Faction Filters */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setSelectedFaction('us')}
                  className={`rounded-lg transition-all ${
                    selectedFaction === 'us'
                      ? 'ring-4 ring-blue-500'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title="USMC"
                >
                  <img src="/images/Icon_USMC.png" alt="USMC" className="w-12 h-12 rounded-lg" />
                </button>
                <button
                  onClick={() => setSelectedFaction('china')}
                  className={`rounded-lg transition-all ${
                    selectedFaction === 'china'
                      ? 'ring-4 ring-red-500'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title="PLAN"
                >
                  <img src="/images/Icon_PLAN.png" alt="PLAN" className="w-12 h-12 rounded-lg" />
                </button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`rounded-lg transition-all border-4 inline-block ${
                    selectedCategory === 'all'
                      ? 'border-cyan-500 scale-110'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  title="All"
                >
                  <div className="w-10 h-10 rounded bg-cyan-600 flex items-center justify-center">
                    <span className="text-2xl text-white">∞</span>
                  </div>
                </button>
                {UNIT_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`rounded-lg transition-all border-4 inline-block ${
                      selectedCategory === cat.value
                        ? 'scale-110'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    style={selectedCategory === cat.value ? {
                      borderColor: cat.color === 'bg-green-700' ? '#15803d' :
                                   cat.color === 'bg-blue-700' ? '#1d4ed8' :
                                   cat.color === 'bg-red-700' ? '#b91c1c' :
                                   cat.color === 'bg-purple-700' ? '#7e22ce' :
                                   cat.color === 'bg-yellow-700' ? '#a16207' : 'transparent'
                    } : undefined}
                    title={cat.label}
                  >
                    <img src={cat.iconPath} alt={cat.label} className="w-10 h-10 rounded block" />
                  </button>
                ))}
              </div>
            </div>

            {/* Unit List */}
            <div className="flex-grow overflow-y-auto p-4">
              <div className="space-y-1">
                {filteredUnits.map(unit => {
                  const isEmbarked = unit.taskForceId?.startsWith('EMBARKED_');

                  return (
                    <button
                      key={unit.id}
                      onClick={() => {
                        setSelectedUnitId(unit.id);
                        setIsCreatingNew(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedUnitId === unit.id
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{unit.name}</span>
                        {isEmbarked && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded ml-2">
                            Embarcada
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nueva Unidad Button at bottom */}
            {isAdmin && (
              <div className="p-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    setIsCreatingNew(true);
                    setSelectedUnitId(null);
                  }}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span>➕</span>
                  <span>Nueva Unidad</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Unit Details / Creation Form */}
          <div className="flex-1 overflow-y-auto p-6">
            {isCreatingNew ? (
              /* Formulario de creación de unidad */
              <div className={`max-w-4xl mx-auto ${!isAdmin ? 'pointer-events-none opacity-60' : ''}`}>
                <div className="bg-gray-800 border-2 border-green-600 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-green-400 mb-6">
                    Create New Unit {selectedFaction === 'us' ? 'USMC' : 'PLAN'}
                  </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Columna izquierda */}
                  <div className="space-y-4">
                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newUnit.name || ''}
                        onChange={(e) => handleNewUnitFieldChange('name', e.target.value)}
                        placeholder="Ej: ALPHA 1, DDG-56"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newUnit.type || ''}
                        onChange={(e) => handleNewUnitFieldChange('type', e.target.value)}
                        placeholder="Ej: INFANTRY PLATOON, DESTROYER"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>

                    {/* Categoría */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={newUnit.category || ''}
                        onChange={(e) => handleNewUnitFieldChange('category', e.target.value as UnitCategory)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">No category</option>
                        {UNIT_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Ruta de Imagen */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Image Path
                      </label>
                      <input
                        type="text"
                        value={newUnit.image || ''}
                        onChange={(e) => handleNewUnitFieldChange('image', e.target.value)}
                        placeholder={`/images/Unidades ${selectedFaction === 'us' ? 'USMC' : 'PLAN'}/nombre.png`}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newUnit.description || ''}
                        onChange={(e) => handleNewUnitFieldChange('description', e.target.value)}
                        placeholder="Detailed unit description..."
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
                      />
                    </div>

                    {/* Coste de Despliegue */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Deployment Cost (Command Points)
                      </label>
                      <input
                        type="number"
                        value={newUnit.deploymentCost ?? 0}
                        onChange={(e) => handleNewUnitFieldChange('deploymentCost', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-cyan-500"
                        min="0"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Puntos de mando requeridos para desplegar esta unidad en una Task Force
                      </p>
                    </div>
                  </div>

                  {/* Columna derecha - Capacidades */}
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-300 mb-4">Capabilities</h4>

                      {/* HP - Obligatorio */}
                      <div className="mb-4 pb-4 border-b border-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 bg-gray-900 border-2 border-gray-500 rounded"></div>
                          <label className="text-sm font-medium text-gray-300">
                            HP (Puntos de Daño) <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <input
                          type="number"
                          value={newUnit.damagePoints ?? 1}
                          onChange={(e) => handleNewUnitFieldChange('damagePoints', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-cyan-500"
                          min="1"
                          required
                        />
                      </div>

                      {/* Capacidades opcionales */}
                      <div className="space-y-3">
                        {/* Ataque Principal */}
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={newUnit.attackPrimary !== undefined}
                              onChange={(e) => handleNewUnitCapabilityToggle('attackPrimary', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <div className="w-4 h-4 bg-red-600 rounded"></div>
                            <span className="text-sm text-gray-300">Primary Attack</span>
                          </label>
                          {newUnit.attackPrimary !== undefined && (
                            <input
                              type="number"
                              value={newUnit.attackPrimary}
                              onChange={(e) => handleNewUnitFieldChange('attackPrimary', e.target.value)}
                              className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                              min="1"
                            />
                          )}
                        </div>

                        {/* Ataque Secundario */}
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={newUnit.attackSecondary !== undefined}
                              onChange={(e) => handleNewUnitCapabilityToggle('attackSecondary', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <div className="w-4 h-4 bg-orange-500 rounded"></div>
                            <span className="text-sm text-gray-300">Secondary Attack</span>
                          </label>
                          {newUnit.attackSecondary !== undefined && (
                            <input
                              type="number"
                              value={newUnit.attackSecondary}
                              onChange={(e) => handleNewUnitFieldChange('attackSecondary', e.target.value)}
                              className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                              min="1"
                            />
                          )}
                        </div>

                        {/* Intercepción */}
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={newUnit.interception !== undefined}
                              onChange={(e) => handleNewUnitCapabilityToggle('interception', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <div className="w-4 h-4 bg-purple-600 rounded"></div>
                            <span className="text-sm text-gray-300">Interception</span>
                          </label>
                          {newUnit.interception !== undefined && (
                            <input
                              type="number"
                              value={newUnit.interception}
                              onChange={(e) => handleNewUnitFieldChange('interception', e.target.value)}
                              className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                              min="1"
                            />
                          )}
                        </div>

                        {/* Suministro */}
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={newUnit.supply !== undefined}
                              onChange={(e) => handleNewUnitCapabilityToggle('supply', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                            <span className="text-sm text-gray-300">Supply</span>
                          </label>
                          {newUnit.supply !== undefined && (
                            <input
                              type="number"
                              value={newUnit.supply}
                              onChange={(e) => handleNewUnitFieldChange('supply', e.target.value)}
                              className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                              min="1"
                            />
                          )}
                        </div>

                        {/* Combate Terrestre */}
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={newUnit.groundCombat !== undefined}
                              onChange={(e) => handleNewUnitCapabilityToggle('groundCombat', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <div className="w-4 h-4 bg-green-600 rounded"></div>
                            <span className="text-sm text-gray-300">Ground Combat</span>
                          </label>
                          {newUnit.groundCombat !== undefined && (
                            <input
                              type="number"
                              value={newUnit.groundCombat}
                              onChange={(e) => handleNewUnitFieldChange('groundCombat', e.target.value)}
                              className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                              min="1"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={handleCancelNewUnit}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateUnit}
                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Create Unit
                  </button>
                </div>
              </div>
            </div>
          ) : selectedUnit ? (
            /* Editor de unidad seleccionada */
            <div className={`max-w-4xl mx-auto ${!isAdmin ? 'pointer-events-none opacity-60' : ''}`}>
              <div className={`bg-gray-800 border-2 rounded-lg p-6 ${
                selectedUnit.faction === 'us' ? 'border-blue-600' : 'border-red-600'
              }`}>
                <h3 className="text-xl font-bold text-cyan-400 mb-6">
                  Edit Unit: {selectedUnit.name}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Columna izquierda - Datos básicos */}
                  <div className="space-y-4">
                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={selectedUnit.name}
                        onChange={(e) => handleFieldChange(selectedUnit.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={selectedUnit.description}
                        onChange={(e) => handleFieldChange(selectedUnit.id, 'description', e.target.value)}
                        placeholder="Detailed unit description..."
                        rows={8}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
                      />
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={selectedUnit.type}
                        onChange={(e) => handleFieldChange(selectedUnit.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Categoría */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={selectedUnit.category || ''}
                        onChange={(e) => handleFieldChange(selectedUnit.id, 'category', e.target.value as UnitCategory)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">No category</option>
                        {UNIT_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Ruta de Imagen */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Image Path
                      </label>
                      <input
                        type="text"
                        value={selectedUnit.image}
                        onChange={(e) => handleFieldChange(selectedUnit.id, 'image', e.target.value)}
                        placeholder={`/images/Unidades ${selectedUnit.faction === 'us' ? 'USMC' : 'PLAN'}/nombre.png`}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Coste de Despliegue */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Deployment Cost (Command Points)
                      </label>
                      <input
                        type="number"
                        value={selectedUnit.deploymentCost ?? 0}
                        onChange={(e) => handleFieldChange(selectedUnit.id, 'deploymentCost', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-cyan-500"
                        min="0"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Puntos de mando requeridos para desplegar esta unidad en una Task Force
                      </p>
                    </div>
                  </div>

                  {/* Columna derecha - Imagen y Capacidades */}
                  <div className="space-y-4">
                    {/* Imagen de la unidad */}
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                      <div className="h-32 flex items-center justify-center">
                        <img
                          src={selectedUnit.image}
                          alt={selectedUnit.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-300 mb-4">Capabilities</h4>

                      {/* HP - Obligatorio */}
                      <div className="mb-4 pb-4 border-b border-gray-600">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 bg-gray-900 border-2 border-gray-500 rounded"></div>
                          <label className="text-sm font-medium text-gray-300">
                            HP (Puntos de Daño) <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <input
                          type="number"
                          value={selectedUnit.damagePoints ?? 1}
                          onChange={(e) => handleFieldChange(selectedUnit.id, 'damagePoints', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-cyan-500"
                          min="1"
                          required
                        />
                      </div>

                      {/* Capacidades opcionales */}
                      <div className="space-y-3">
                        {/* Ataque Principal */}
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={selectedUnit.attackPrimary !== undefined}
                              onChange={(e) => handleCapabilityToggle(selectedUnit.id, 'attackPrimary', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <div className="w-4 h-4 bg-red-600 rounded"></div>
                            <span className="text-sm text-gray-300">Primary Attack</span>
                          </label>
                          {selectedUnit.attackPrimary !== undefined && (
                            <input
                              type="number"
                              value={selectedUnit.attackPrimary}
                              onChange={(e) => handleFieldChange(selectedUnit.id, 'attackPrimary', e.target.value)}
                              className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                              min="1"
                            />
                          )}
                        </div>

                        {/* Ataque Secundario */}
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={selectedUnit.attackSecondary !== undefined}
                              onChange={(e) => handleCapabilityToggle(selectedUnit.id, 'attackSecondary', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <div className="w-4 h-4 bg-orange-500 rounded"></div>
                            <span className="text-sm text-gray-300">Secondary Attack</span>
                          </label>
                          {selectedUnit.attackSecondary !== undefined && (
                            <input
                              type="number"
                              value={selectedUnit.attackSecondary}
                              onChange={(e) => handleFieldChange(selectedUnit.id, 'attackSecondary', e.target.value)}
                              className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                              min="1"
                            />
                          )}
                        </div>

                        {/* Intercepción */}
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={selectedUnit.interception !== undefined}
                              onChange={(e) => handleCapabilityToggle(selectedUnit.id, 'interception', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <div className="w-4 h-4 bg-purple-600 rounded"></div>
                            <span className="text-sm text-gray-300">Interception</span>
                          </label>
                          {selectedUnit.interception !== undefined && (
                            <input
                              type="number"
                              value={selectedUnit.interception}
                              onChange={(e) => handleFieldChange(selectedUnit.id, 'interception', e.target.value)}
                              className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                              min="1"
                            />
                          )}
                        </div>

                        {/* Suministro */}
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={selectedUnit.supply !== undefined}
                              onChange={(e) => handleCapabilityToggle(selectedUnit.id, 'supply', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                            <span className="text-sm text-gray-300">Supply</span>
                          </label>
                          {selectedUnit.supply !== undefined && (
                            <input
                              type="number"
                              value={selectedUnit.supply}
                              onChange={(e) => handleFieldChange(selectedUnit.id, 'supply', e.target.value)}
                              className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                              min="1"
                            />
                          )}
                        </div>

                        {/* Combate Terrestre */}
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={selectedUnit.groundCombat !== undefined}
                              onChange={(e) => handleCapabilityToggle(selectedUnit.id, 'groundCombat', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <div className="w-4 h-4 bg-green-600 rounded"></div>
                            <span className="text-sm text-gray-300">Ground Combat</span>
                          </label>
                          {selectedUnit.groundCombat !== undefined && (
                            <input
                              type="number"
                              value={selectedUnit.groundCombat}
                              onChange={(e) => handleFieldChange(selectedUnit.id, 'groundCombat', e.target.value)}
                              className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                              min="1"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No hay unidad seleccionada */
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-xl mb-2">Select a unit from the list</p>
                <p className="text-sm">o crea una nueva para comenzar</p>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-gray-900 border-t border-gray-700 p-4 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            {isAdmin ? 'Cancel' : 'Close'}
          </button>
          {isAdmin && (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitEncyclopediaModal;
