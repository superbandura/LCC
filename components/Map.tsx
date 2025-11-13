import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Rectangle, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Position, Location, OperationalArea, OperationalData, MapLayer, TaskForce, Unit, Card, UnitCategory, TurnState, PendingDeployments, InfluenceMarker, PlayedCardNotification } from '../types';
import ReactDOMServer from 'react-dom/server';
import { getIcon, getOperationalStatusIcon, getOperationalStatusIconWithCardBadge, getAirPatrolStatusIcon, getTacticalNetworkStatusIcon, getPendingDeploymentsIcon } from '../utils/iconGenerators';
import { MapInitializer, ScaleControl, ChangeView, DragController, MapClickHandler } from './map/controls';
import { UNIT_CATEGORIES } from '../constants';
import DataEditor from './map/DataEditor';
import { TurnControl } from './TurnControl';

interface MapProps {
  center: Position;
  zoom: number;
  locations: Location[];
  operationalAreas: OperationalArea[];
  operationalData: Record<string, OperationalData>;
  onOperationalDataUpdate: (areaId: string, updatedData: OperationalData) => void;
  previewArea?: OperationalArea | null;
  tileLayer: MapLayer;
  coordinatesSelectionMode?: boolean;
  onCoordinatesSelected?: (coords: Position) => void;
  selectedCoordinates?: Position | null;
  onLocationsUpdate?: (locations: Location[]) => void;
  selectedFaction: 'us' | 'china';
  taskForces: TaskForce[];
  units: Unit[];
  cards: Card[];
  onOperationalAreasUpdate?: (areas: OperationalArea[]) => void;
  onUnitsUpdate?: (units: Unit[]) => void;
  onCardsUpdate?: (cards: Card[]) => void;
  onTaskForcesUpdate?: (taskForces: TaskForce[]) => void;
  isAdmin?: boolean;
  canAdvanceTurn?: boolean;
  onEditBase?: (locationId: string) => void;
  turnState: TurnState;
  onAdvanceTurn: () => void;
  pendingDeployments?: PendingDeployments;
  influenceMarker?: InfluenceMarker;
  onInfluenceMarkerUpdate?: (marker: InfluenceMarker) => void;
  onAddPlayedCardNotification?: (notification: PlayedCardNotification) => void;
  sidebarOpen?: boolean;
}


const Map: React.FC<MapProps> = ({
  center,
  zoom,
  locations,
  operationalAreas,
  operationalData,
  onOperationalDataUpdate,
  previewArea,
  tileLayer,
  coordinatesSelectionMode = false,
  onCoordinatesSelected,
  selectedCoordinates,
  onLocationsUpdate,
  selectedFaction,
  taskForces,
  units,
  cards,
  onOperationalAreasUpdate,
  onUnitsUpdate,
  onCardsUpdate,
  onTaskForcesUpdate,
  isAdmin = false,
  canAdvanceTurn = false,
  onEditBase,
  turnState,
  onAdvanceTurn,
  pendingDeployments,
  influenceMarker,
  onInfluenceMarkerUpdate,
  onAddPlayedCardNotification,
  sidebarOpen = false
}) => {
  // Validate and provide fallback coordinates
  const validCenter: Position = (center && Array.isArray(center) && center.length === 2 &&
    typeof center[0] === 'number' && typeof center[1] === 'number' &&
    !isNaN(center[0]) && !isNaN(center[1]) &&
    isFinite(center[0]) && isFinite(center[1]))
    ? center
    : [20.0, 121.5]; // Default to Indo-Pacific region

  const validZoom = (typeof zoom === 'number' && !isNaN(zoom) && isFinite(zoom) && zoom > 0)
    ? zoom
    : 5; // Default zoom level

  const previewStyle = {
    color: '#06b6d4', // cyan-500
    weight: 2,
    fillColor: '#06b6d4',
    fillOpacity: 0.2,
    dashArray: '5, 5',
  };

  return (
    <div className="relative h-full w-full">
      <TurnControl
        turnState={turnState}
        onAdvanceTurn={onAdvanceTurn}
        canAdvanceTurn={canAdvanceTurn}
        sidebarOpen={sidebarOpen}
      />
      <MapContainer
        center={validCenter}
        zoom={validZoom}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
      <MapInitializer />
      <ScaleControl />
      <ChangeView center={validCenter} zoom={validZoom} />
      <TileLayer
        key={tileLayer.url}
        attribution={tileLayer.attribution}
        url={tileLayer.url}
      />
      
      {operationalAreas.map((area) => {
        const data = operationalData[area.id];
        const infoIconPosition: Position = [area.bounds[0][0] - 0.2, area.bounds[1][1] - 0.2];
        
        const pathOptions = {
          color: area.color || '#FBBF24',
          weight: 2,
          fillColor: area.color || '#FBBF24',
          fillOpacity: area.fillOpacity ?? 0.05,
        };

        return (
          <React.Fragment key={area.id}>
            <Rectangle bounds={area.bounds} pathOptions={pathOptions}>
                <Tooltip sticky><span className="font-mono text-xs uppercase tracking-wide">Operational Area: {area.name}</span></Tooltip>
            </Rectangle>            {data && (() => {
              // Calculate number of assigned cards for selected faction
              const assignedCardsCount = area.assignedCards
                ? area.assignedCards.filter(instanceId => {
                    // Extract cardId from instanceId (format: "cardId_timestamp")
                    const cardId = instanceId.includes('_') ? instanceId.split('_')[0] : instanceId;
                    const card = cards.find(c => c.id === cardId);
                    return card && card.faction === selectedFaction;
                  }).length
                : 0;

              return (
                <>
                  <Marker position={infoIconPosition} icon={getOperationalStatusIconWithCardBadge(data, assignedCardsCount)}>
                    <Popup className="operational-data-popup" minWidth={400} maxWidth={500}>
                       <div className="text-gray-300 font-mono bg-gray-900 -m-3 p-3 rounded border border-gray-800">
                        <h3 className="font-bold text-sm mb-3 text-green-400 uppercase tracking-wide border-b border-green-900 pb-2">{area.name}</h3>
                        <DataEditor
                          areaId={area.id}
                          initialData={data}
                          onSave={onOperationalDataUpdate}
                          area={area}
                          locations={locations}
                          onLocationsUpdate={onLocationsUpdate}
                          selectedFaction={selectedFaction}
                          taskForces={taskForces}
                          units={units}
                          cards={cards}
                          operationalAreas={operationalAreas}
                          onOperationalAreasUpdate={onOperationalAreasUpdate}
                          onUnitsUpdate={onUnitsUpdate}
                          onCardsUpdate={onCardsUpdate}
                          onTaskForcesUpdate={onTaskForcesUpdate}
                          isAdmin={isAdmin}
                          pendingDeployments={pendingDeployments}
                          turnState={turnState}
                          influenceMarker={influenceMarker}
                          onInfluenceMarkerUpdate={onInfluenceMarkerUpdate}
                          onAddPlayedCardNotification={onAddPlayedCardNotification}
                        />
                       </div>
                    </Popup>
                  </Marker>
                  {/* Air Patrol Marker - only show if Combat Air Patrols card is played */}
                  {(() => {
                  const combatAirPatrolsCardId = selectedFaction === 'us' ? 'us-002' : 'china-002';
                  const isCardPlayed = area.playedCards?.includes(combatAirPatrolsCardId);
                  return isCardPlayed;
                })() && (
                  <Marker
                    position={[area.bounds[1][0] + 0.2, area.bounds[1][1] - 0.2]}
                    icon={getAirPatrolStatusIcon(data, selectedFaction)}
                  >
                    <Tooltip>
                      Air Patrols: {
                        data[selectedFaction === 'us' ? 'us' : 'plan'].airPatrolsDamage.every(dmg => dmg === true)
                          ? 'Destroyed'
                          : data[selectedFaction === 'us' ? 'us' : 'plan'].airPatrolsUsed
                            ? 'Used'
                            : 'Operational'
                      }
                    </Tooltip>
                  </Marker>
                  )}
                  <Marker
                    position={[area.bounds[0][0] - 0.2, area.bounds[0][1] + 0.2]}
                    icon={getTacticalNetworkStatusIcon(data, selectedFaction)}
                  >
                    <Tooltip>
                      Tactical Network: {
                        (() => {
                          const damageCount = data[selectedFaction === 'us' ? 'us' : 'plan'].tacticalNetworkDamage.filter(dmg => dmg === true).length;
                          if (damageCount >= 4) return 'Critical';
                          if (damageCount >= 2) return 'Damaged';
                          return 'Operational';
                        })()
                      }
                    </Tooltip>
                  </Marker>
                  {/* Pending Deployments Marker - only show if there are pending deployments for this area */}
                  {pendingDeployments && (() => {
                    const pendingCardsCount = pendingDeployments.cards.filter(
                      p => p.areaId === area.id && p.faction === selectedFaction
                    ).length;
                    const pendingTaskForcesCount = pendingDeployments.taskForces.filter(
                      p => {
                        const tf = taskForces.find(t => t.id === p.taskForceId);
                        return tf && tf.operationalAreaId === area.id && p.faction === selectedFaction;
                      }
                    ).length;
                    const pendingUnitsCount = pendingDeployments.units.filter(
                      p => {
                        const unit = units.find(u => u.id === p.unitId);
                        if (!unit || !unit.taskForceId) return false;

                        // Excluir unidades cuyo taskForce también está en tránsito
                        const isTaskForceInTransit = pendingDeployments.taskForces.some(
                          ptf => ptf.taskForceId === unit.taskForceId
                        );
                        if (isTaskForceInTransit) return false;

                        const tf = taskForces.find(t => t.id === unit.taskForceId);
                        return tf && tf.operationalAreaId === area.id && p.faction === selectedFaction;
                      }
                    ).length;
                    const totalPending = pendingCardsCount + pendingTaskForcesCount + pendingUnitsCount;

                    return totalPending > 0 ? (
                      <Marker
                        position={[area.bounds[1][0] + 0.2, area.bounds[0][1] + 0.2]}
                        icon={getPendingDeploymentsIcon(totalPending)}
                      >
                        <Tooltip>
                          <div className="text-xs">
                            <div className="font-bold mb-1">Deployments in Transit: {totalPending}</div>
                            {pendingCardsCount > 0 && <div>Cards: {pendingCardsCount}</div>}
                            {pendingTaskForcesCount > 0 && <div>Task Forces: {pendingTaskForcesCount}</div>}
                            {pendingUnitsCount > 0 && <div>Reinforcements: {pendingUnitsCount}</div>}
                          </div>
                        </Tooltip>
                      </Marker>
                    ) : null;
                  })()}
                </>
              );
            })()}
          </React.Fragment>
        )
      })}

      {previewArea && (
        <Rectangle 
          bounds={previewArea.bounds} 
          pathOptions={{
            color: previewArea.color || previewStyle.color,
            weight: previewStyle.weight,
            fillColor: previewArea.color || previewStyle.fillColor,
            fillOpacity: previewArea.fillOpacity ?? previewStyle.fillOpacity,
            dashArray: previewStyle.dashArray
          }} 
        />
      )}

      {locations.map((location) => {
        // Normalize damage array to match damagePoints
        const normalizedDamage = [...location.currentDamage];
        if (normalizedDamage.length < location.damagePoints) {
          // Pad with false
          while (normalizedDamage.length < location.damagePoints) {
            normalizedDamage.push(false);
          }
        } else if (normalizedDamage.length > location.damagePoints) {
          // Truncate
          normalizedDamage.length = location.damagePoints;
        }

        const damageCount = normalizedDamage.filter(d => d).length;
        const isDestroyed = damageCount >= location.damagePoints;

        const handleDamageToggle = (index: number) => {
          if (!onLocationsUpdate) return;

          const wouldBeUnchecking = normalizedDamage[index] === true;

          // Prevent unchecking (repairing) if location is already destroyed
          if (wouldBeUnchecking && isDestroyed) {
            return; // Damage is permanent
          }

          const updatedLocations = locations.map(loc => {
            if (loc.id === location.id) {
              const newDamage = [...normalizedDamage];
              newDamage[index] = !newDamage[index];
              return { ...loc, currentDamage: newDamage };
            }
            return loc;
          });
          onLocationsUpdate(updatedLocations);
        };

        return (
          <Marker key={location.id} position={location.coords} icon={getIcon(location.country, isDestroyed)}>
            <Popup className="operational-data-popup" minWidth={250}>
              <div className={`font-mono bg-gray-900 text-gray-300 -m-3 p-3 rounded border ${location.country === 'EE. UU.' ? 'border-blue-600' : 'border-red-600'}`}>
                <div className="flex items-center justify-between mb-2 border-b border-green-900 pb-2">
                  <h3 className="font-bold text-sm text-green-400 uppercase tracking-wide">{location.name}</h3>
                  {isAdmin && onEditBase && (
                    <button
                      onClick={() => {
                        onEditBase(location.id);
                      }}
                      className="ml-2 text-gray-500 hover:text-green-400 transition-colors"
                      title="Edit base"
                    >
                      🔧
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">{location.country} - {location.type}</p>
                <p className="text-xs mb-3 text-gray-400">{location.description}</p>

                {/* Command Points section */}
                {location.commandPoints && location.commandPoints > 0 &&
                 ((selectedFaction === 'us' && location.country === 'EE. UU.') ||
                  (selectedFaction === 'china' && location.country === 'China')) && (
                  <div className="border-t border-green-900 pt-3 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Command Points Generated</span>
                      <span className="text-xs font-bold text-green-400">
                        {Math.floor(location.commandPoints * (1 - damageCount / location.damagePoints))} / {location.commandPoints}
                      </span>
                    </div>
                    <div className="text-xs">
                      {damageCount > 0 ? (
                        <span className="text-orange-400">
                          ⚠️ Generation reduced by damage ({Math.round((1 - damageCount / location.damagePoints) * 100)}%)
                        </span>
                      ) : (
                        <span className="text-green-400">
                          ✓ Full generation
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Damage section */}
                <div className="border-t border-green-900 pt-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Damage Points</span>
                    <span className={`text-xs font-bold ${isDestroyed ? 'text-red-400' : 'text-green-400'}`}>
                      {damageCount}/{location.damagePoints}
                      {isDestroyed && ' (DESTROYED)'}
                    </span>
                  </div>
                  {isDestroyed && (
                    <div className="mb-2 p-2 bg-red-900/30 border border-red-600 rounded text-red-300 text-xs uppercase tracking-wide">
                      ⚠️ Base destroyed - Damage is permanent
                    </div>
                  )}
                  <div className="grid grid-cols-4 gap-2">
                    {normalizedDamage.map((damaged, index) => (
                      <label
                        key={index}
                        className={`flex items-center justify-center ${isDestroyed && damaged ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <input
                          type="checkbox"
                          checked={damaged}
                          onChange={() => handleDamageToggle(index)}
                          disabled={isDestroyed && damaged}
                          className={`w-5 h-5 text-red-600 ${isDestroyed && damaged ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Drag controller and coordinate selection handler */}
      <DragController selectionMode={coordinatesSelectionMode} />
      {coordinatesSelectionMode && onCoordinatesSelected && (
        <MapClickHandler
          selectionMode={coordinatesSelectionMode}
          onSelect={onCoordinatesSelected}
        />
      )}

      {/* Temporary marker for selected coordinates */}
      {selectedCoordinates && (
        <Marker
          position={selectedCoordinates}
          icon={L.divIcon({
            html: '<div style="background-color: #06b6d4; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
            className: 'custom-selection-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })}
        >
          <Tooltip permanent direction="top" offset={[0, -10]}>
            <div className="text-xs">
              Lat: {selectedCoordinates[0].toFixed(4)}<br />
              Lng: {selectedCoordinates[1].toFixed(4)}
            </div>
          </Tooltip>
        </Marker>
      )}
      </MapContainer>
    </div>
  );
};

export default Map;