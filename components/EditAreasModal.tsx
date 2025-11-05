import React, { useState, useEffect, useMemo } from 'react';
import { OperationalArea, Location, Position } from '../types';
import { CloseIcon } from './Icons';

interface EditAreasModalProps {
  isOpen: boolean;
  onClose: () => void;
  areas: OperationalArea[];
  onSave: (updatedAreas: OperationalArea[]) => void;
  onPreview: (area: OperationalArea | null) => void;
  locations: Location[];
  onLocationsUpdate: (updatedLocations: Location[]) => void;
  onStartCoordinateSelection: () => void;
  onStopCoordinateSelection: () => void;
  selectedCoordinates: Position | null;
  shouldResetState: boolean;
  isAdmin: boolean;
  initialSelectedBaseId?: string | null;
}

const EditAreasModal: React.FC<EditAreasModalProps> = ({
  isOpen,
  onClose,
  areas,
  onSave,
  onPreview,
  locations,
  onLocationsUpdate,
  onStartCoordinateSelection,
  onStopCoordinateSelection,
  selectedCoordinates,
  shouldResetState,
  isAdmin,
  initialSelectedBaseId
}) => {
  const [activeTab, setActiveTab] = useState<'areas' | 'bases'>('areas');
  const [editedAreas, setEditedAreas] = useState<OperationalArea[]>([]);
  const [editedLocations, setEditedLocations] = useState<Location[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  // States for bases management
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isCreatingNewLocation, setIsCreatingNewLocation] = useState(false);
  const [newLocation, setNewLocation] = useState<Partial<Location>>({
    name: '',
    region: '',
    country: 'EE. UU.',
    type: '',
    description: '',
    coords: [0, 0],
    damagePoints: 4,
    currentDamage: [false, false, false, false],
  });

  const selectedArea = editedAreas.find(a => a.id === selectedAreaId) || null;
  const selectedAreaIndex = editedAreas.findIndex(a => a.id === selectedAreaId);

  // Get the currently selected location from editedLocations
  const selectedLocation = useMemo(() => {
    return editedLocations.find(l => l.id === selectedLocationId) || null;
  }, [editedLocations, selectedLocationId]);

  useEffect(() => {
    if (isOpen) {
      setEditedAreas(JSON.parse(JSON.stringify(areas)));
      setEditedLocations(JSON.parse(JSON.stringify(locations)));

      // Check if we're opening with a preselected base
      if (initialSelectedBaseId) {
        // Switch to bases tab and select the specified base
        setActiveTab('bases');
        setSelectedLocationId(initialSelectedBaseId);
        setIsCreatingNewLocation(false);
      } else if (shouldResetState) {
        // Only reset state if we should (not returning from coordinate selection)
        if (areas.length > 0) {
          setSelectedAreaId(areas[0].id); // Select first area by default
        } else {
          setSelectedAreaId(null);
        }
        setIsCreatingNewLocation(false);
        setSelectedLocationId(null);
      }
      // If we're returning from coordinate selection, preserve selectedLocationId
    } else if (shouldResetState) {
      // Reset selection when closing normally (not for coordinate selection)
      setSelectedAreaId(null);
      setActiveTab('areas'); // Reset to areas tab when closing
      setIsCreatingNewLocation(false);
      // Don't reset selectedLocationId here - it will be reset when modal opens fresh
    }
  }, [isOpen, areas, locations, shouldResetState, initialSelectedBaseId]);

  useEffect(() => {
    // Update preview when selected area changes
    if (selectedArea) {
      onPreview(selectedArea);
    }
  }, [selectedArea, onPreview]);

  useEffect(() => {
    // Update coordinates when selected from map
    if (selectedCoordinates && isOpen) {
      if (isCreatingNewLocation) {
        setNewLocation(prev => ({ ...prev, coords: selectedCoordinates }));
        onStopCoordinateSelection();
      } else if (selectedLocationId) {
        // Update the selected location's coordinates
        setEditedLocations(prevLocations => {
          const index = prevLocations.findIndex(loc => loc.id === selectedLocationId);
          if (index !== -1) {
            const updatedLocations = [...prevLocations];
            updatedLocations[index] = { ...updatedLocations[index], coords: selectedCoordinates };
            return updatedLocations;
          }
          return prevLocations;
        });
        onStopCoordinateSelection();
      }
    }
  }, [selectedCoordinates, isCreatingNewLocation, selectedLocationId, isOpen, onStopCoordinateSelection]);


  if (!isOpen) return null;

  const handleAreaSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedAreaId(id);
    const areaToPreview = editedAreas.find(a => a.id === id);
    onPreview(areaToPreview || null);
  };
  
  const handleFormChange = (updatedProps: Partial<OperationalArea>) => {
    if (selectedAreaIndex === -1) return;

    const newAreas = [...editedAreas];
    newAreas[selectedAreaIndex] = { ...newAreas[selectedAreaIndex], ...updatedProps };
    setEditedAreas(newAreas);
    onPreview(newAreas[selectedAreaIndex]);
  };

  const handleBoundsChange = (boundIndex: number, coordIndex: number, value: string) => {
    if (!selectedArea) return;
    const newBounds = JSON.parse(JSON.stringify(selectedArea.bounds));
    const newValue = parseFloat(value);
    if (!isNaN(newValue)) {
      newBounds[boundIndex][coordIndex] = newValue;
      handleFormChange({ bounds: newBounds });
    }
  }

  // Functions for base management
  const handleCreateNewLocation = () => {
    setIsCreatingNewLocation(true);
    setSelectedLocationId(null);
    setNewLocation({
      name: '',
      region: '',
      country: 'EE. UU.',
      type: '',
      description: '',
      coords: [20.0, 121.5],
      damagePoints: 4,
      currentDamage: [false, false, false, false],
    });
  };

  const handleCancelCreateLocation = () => {
    setIsCreatingNewLocation(false);
    setSelectedLocationId(null);
  };

  const handleSaveNewLocation = () => {
    if (!newLocation.name || !newLocation.region || !newLocation.type) {
      alert('Please complete all required fields (Name, Region, Type)');
      return;
    }

    const id = `custom-${Date.now()}`;
    const damageArray = Array(newLocation.damagePoints || 4).fill(false);

    const locationToAdd: Location = {
      id,
      name: newLocation.name!,
      region: newLocation.region!,
      country: newLocation.country as 'EE. UU.' | 'China',
      type: newLocation.type!,
      description: newLocation.description || '',
      coords: newLocation.coords || [20.0, 121.5],
      damagePoints: newLocation.damagePoints || 4,
      currentDamage: damageArray,
      commandPoints: newLocation.commandPoints || 0,
    };

    setEditedLocations([...editedLocations, locationToAdd]);
    setIsCreatingNewLocation(false);
  };

  const handleSelectLocation = (locationId: string) => {
    setSelectedLocationId(locationId);
    setIsCreatingNewLocation(false);
  };

  const handleUpdateLocation = (updates: Partial<Location>) => {
    const index = editedLocations.findIndex(loc => loc.id === selectedLocationId);
    if (index === -1) return;

    const updatedLocations = [...editedLocations];
    updatedLocations[index] = { ...updatedLocations[index], ...updates };
    setEditedLocations(updatedLocations);
  };

  const handleDeleteLocation = (locationId: string) => {
    if (confirm('Are you sure you want to delete this base?')) {
      setEditedLocations(editedLocations.filter(loc => loc.id !== locationId));
      if (selectedLocationId === locationId) {
        setSelectedLocationId(null);
      }
    }
  };

  const handleDamagePointsChange = (newDamagePoints: number) => {
    if (isCreatingNewLocation) {
      const newDamageArray = Array(newDamagePoints).fill(false);
      setNewLocation({ ...newLocation, damagePoints: newDamagePoints, currentDamage: newDamageArray });
    } else if (selectedLocationId) {
      const index = editedLocations.findIndex(loc => loc.id === selectedLocationId);
      if (index !== -1) {
        const currentLocation = editedLocations[index];
        const newDamageArray = Array(newDamagePoints).fill(false);
        // Preserve existing damage state up to the new size
        for (let i = 0; i < Math.min(newDamagePoints, currentLocation.currentDamage.length); i++) {
          newDamageArray[i] = currentLocation.currentDamage[i];
        }

        // Update local state
        const updatedLocations = [...editedLocations];
        updatedLocations[index] = {
          ...updatedLocations[index],
          damagePoints: newDamagePoints,
          currentDamage: newDamageArray
        };
        setEditedLocations(updatedLocations);
      }
    }
  };

  const handleSave = () => {
    onSave(editedAreas);
    onLocationsUpdate(editedLocations);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <header className="p-4 border-b border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-cyan-400">Areas and Bases Editor</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full">
              <CloseIcon />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('areas')}
              className={`flex-1 px-4 py-2 rounded-md font-semibold transition ${
                activeTab === 'areas'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Operational Areas
            </button>
            <button
              onClick={() => setActiveTab('bases')}
              className={`flex-1 px-4 py-2 rounded-md font-semibold transition ${
                activeTab === 'bases'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Bases
            </button>
          </div>

          {/* Admin Warning Banner */}
          {!isAdmin && (
            <div className="mt-4 p-3 bg-yellow-900 bg-opacity-50 border border-yellow-600 rounded text-yellow-200 text-sm">
              <strong>⚠️ READ-ONLY MODE:</strong> You must be in administrator mode to edit areas and bases.
            </div>
          )}
        </header>

        <main className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'areas' ? (
            <>
              <div>
                <label htmlFor="area-select" className="block text-sm font-medium text-gray-400 mb-2">Select Area</label>
                <select
                  id="area-select"
                  value={selectedAreaId || ''}
                  onChange={handleAreaSelection}
                  disabled={!isAdmin}
                  className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>

              {selectedArea && (
                <div className={`bg-gray-700/50 p-4 rounded-md space-y-4 ${!isAdmin ? 'pointer-events-none opacity-60' : ''}`}>
                  <h3 className="font-semibold text-lg text-white">Editando: {selectedArea.name}</h3>

                  {/* --- Coordenadas --- */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Latitud Superior</label>
                      <input type="number" step="0.01" value={selectedArea.bounds[0][0]} onChange={(e) => handleBoundsChange(0, 0, e.target.value)} className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Longitud Izquierda</label>
                      <input type="number" step="0.01" value={selectedArea.bounds[0][1]} onChange={(e) => handleBoundsChange(0, 1, e.target.value)} className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Latitud Inferior</label>
                      <input type="number" step="0.01" value={selectedArea.bounds[1][0]} onChange={(e) => handleBoundsChange(1, 0, e.target.value)} className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Longitud Derecha</label>
                      <input type="number" step="0.01" value={selectedArea.bounds[1][1]} onChange={(e) => handleBoundsChange(1, 1, e.target.value)} className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                  </div>

                  {/* --- Estilos --- */}
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Color de Borde</label>
                      <input type="color" value={selectedArea.color || '#FBBF24'} onChange={(e) => handleFormChange({ color: e.target.value })} className="w-full h-10 bg-gray-900 border border-gray-600 rounded cursor-pointer" />
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Transparencia ({Math.round((selectedArea.fillOpacity ?? 0.05) * 100)}%)</label>
                      <input type="range" min="0" max="1" step="0.01" value={selectedArea.fillOpacity ?? 0.05} onChange={(e) => handleFormChange({ fillOpacity: parseFloat(e.target.value) })} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                    </div>
                  </div>

                </div>
              )}
            </>
          ) : (
            <>
              {/* Bases Tab Content */}
              <div className="space-y-4">
                {/* List of existing bases */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-400">Bases Existentes</label>
                    <button
                      onClick={handleCreateNewLocation}
                      disabled={!isAdmin}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded transition disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      + Create New Base
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 bg-gray-900 p-3 rounded border border-gray-700">
                    {editedLocations.map((loc) => (
                      <div
                        key={loc.id}
                        className={`flex justify-between items-center p-2 rounded cursor-pointer transition ${
                          selectedLocationId === loc.id
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        }`}
                        onClick={() => handleSelectLocation(loc.id)}
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{loc.name}</div>
                          <div className="text-xs opacity-75">
                            {loc.region} - {loc.country}
                            {loc.commandPoints && loc.commandPoints > 0 && (
                              <span className="ml-2 px-1.5 py-0.5 bg-cyan-600 rounded text-white font-bold">
                                {loc.commandPoints} PM
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLocation(loc.id);
                          }}
                          disabled={!isAdmin}
                          className="ml-2 px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    {editedLocations.length === 0 && (
                      <div className="text-center text-gray-500 text-sm py-4">
                        No bases. Click "Create New Base" to add one.
                      </div>
                    )}
                  </div>
                </div>

                {/* Form for creating/editing location */}
                {(isCreatingNewLocation || selectedLocationId) && (
                  <div className={`bg-gray-700/50 p-4 rounded-md space-y-4 ${!isAdmin ? 'pointer-events-none opacity-60' : ''}`}>
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg text-white">
                        {isCreatingNewLocation ? 'Create New Base' : `Editing: ${selectedLocation?.name || ''}`}
                      </h3>
                      {isCreatingNewLocation && (
                        <button
                          onClick={handleCancelCreateLocation}
                          className="text-sm text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {/* Form fields */}
                    <div className="grid grid-cols-1 gap-3">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Name *</label>
                        <input
                          type="text"
                          value={isCreatingNewLocation ? (newLocation.name || '') : (selectedLocation?.name || '')}
                          onChange={(e) =>
                            isCreatingNewLocation
                              ? setNewLocation({ ...newLocation, name: e.target.value })
                              : handleUpdateLocation({ name: e.target.value })
                          }
                          className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="Ex: Kadena Air Base"
                        />
                      </div>

                      {/* Region */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Region *</label>
                        <input
                          type="text"
                          value={isCreatingNewLocation ? (newLocation.region || '') : (selectedLocation?.region || '')}
                          onChange={(e) =>
                            isCreatingNewLocation
                              ? setNewLocation({ ...newLocation, region: e.target.value })
                              : handleUpdateLocation({ region: e.target.value })
                          }
                          className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="Ex: Okinawa (Japan)"
                        />
                      </div>

                      {/* Country/Faction */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Side *</label>
                        <select
                          value={isCreatingNewLocation ? (newLocation.country || 'EE. UU.') : (selectedLocation?.country || 'EE. UU.')}
                          onChange={(e) =>
                            isCreatingNewLocation
                              ? setNewLocation({ ...newLocation, country: e.target.value as 'EE. UU.' | 'China' })
                              : handleUpdateLocation({ country: e.target.value as 'EE. UU.' | 'China' })
                          }
                          className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                        >
                          <option value="EE. UU.">EE. UU.</option>
                          <option value="China">China</option>
                        </select>
                      </div>

                      {/* Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Type *</label>
                        <input
                          type="text"
                          value={isCreatingNewLocation ? (newLocation.type || '') : (selectedLocation?.type || '')}
                          onChange={(e) =>
                            isCreatingNewLocation
                              ? setNewLocation({ ...newLocation, type: e.target.value })
                              : handleUpdateLocation({ type: e.target.value })
                          }
                          className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="Ex: Air Base (USAF)"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                        <textarea
                          value={isCreatingNewLocation ? (newLocation.description || '') : (selectedLocation?.description || '')}
                          onChange={(e) =>
                            isCreatingNewLocation
                              ? setNewLocation({ ...newLocation, description: e.target.value })
                              : handleUpdateLocation({ description: e.target.value })
                          }
                          className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
                          rows={3}
                          placeholder="Base description..."
                        />
                      </div>

                      {/* Coordinates */}
                      <div>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Latitud *</label>
                            <input
                              type="number"
                              step="0.0001"
                              value={isCreatingNewLocation ? (newLocation.coords?.[0] || 0) : (selectedLocation?.coords[0] || 0)}
                              onChange={(e) => {
                                const lat = parseFloat(e.target.value);
                                if (isCreatingNewLocation) {
                                  setNewLocation({ ...newLocation, coords: [lat, newLocation.coords?.[1] || 0] });
                                } else if (selectedLocation) {
                                  handleUpdateLocation({ coords: [lat, selectedLocation.coords[1]] });
                                }
                              }}
                              className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Longitud *</label>
                            <input
                              type="number"
                              step="0.0001"
                              value={isCreatingNewLocation ? (newLocation.coords?.[1] || 0) : (selectedLocation?.coords[1] || 0)}
                              onChange={(e) => {
                                const lng = parseFloat(e.target.value);
                                if (isCreatingNewLocation) {
                                  setNewLocation({ ...newLocation, coords: [newLocation.coords?.[0] || 0, lng] });
                                } else if (selectedLocation) {
                                  handleUpdateLocation({ coords: [selectedLocation.coords[0], lng] });
                                }
                              }}
                              className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={onStartCoordinateSelection}
                          className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded transition flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Select on Map
                        </button>
                      </div>

                      {/* Damage Points */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Damage Points ({isCreatingNewLocation ? (newLocation.damagePoints || 4) : (selectedLocation?.damagePoints || 4)})
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={isCreatingNewLocation ? (newLocation.damagePoints || 4) : (selectedLocation?.damagePoints || 4)}
                          onChange={(e) => handleDamagePointsChange(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Array(isCreatingNewLocation ? (newLocation.damagePoints || 4) : (selectedLocation?.damagePoints || 4))
                            .fill(0)
                            .map((_, i) => (
                              <div key={i} className="w-6 h-6 bg-gray-600 border border-gray-500 rounded"></div>
                            ))}
                        </div>
                      </div>

                      {/* Command Points */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Command Points Generated ({isCreatingNewLocation ? (newLocation.commandPoints || 0) : (selectedLocation?.commandPoints || 0)})
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isCreatingNewLocation ? (newLocation.commandPoints || 0) : (selectedLocation?.commandPoints || 0)}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (isCreatingNewLocation) {
                              setNewLocation({ ...newLocation, commandPoints: value });
                            } else if (selectedLocationId) {
                              handleUpdateLocation({ commandPoints: value });
                            }
                          }}
                          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="mt-2 text-sm text-gray-400">
                          This base generates <span className="text-cyan-400 font-bold text-lg">
                            {isCreatingNewLocation ? (newLocation.commandPoints || 0) : (selectedLocation?.commandPoints || 0)}
                          </span> Command Points for{' '}
                          <span className={isCreatingNewLocation ? (newLocation.country === 'EE. UU.' ? 'text-blue-400' : 'text-red-400') : (selectedLocation?.country === 'EE. UU.' ? 'text-blue-400' : 'text-red-400')}>
                            {isCreatingNewLocation ? newLocation.country : selectedLocation?.country}
                          </span>
                        </div>
                      </div>

                      {/* Save button for new location */}
                      {isCreatingNewLocation && (
                        <button
                          onClick={handleSaveNewLocation}
                          disabled={!isAdmin}
                          className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-md transition disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Save New Base
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        <footer className="p-4 border-t border-gray-700 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition">
            {isAdmin ? 'Cancel' : 'Close'}
          </button>
          {isAdmin && (
            <button onClick={handleSave} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-md transition">
              Save Changes
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default EditAreasModal;