import React, { useState } from 'react';
import { Card, TurnState, Unit } from '../../../../types';

interface PendingCardData {
  card?: Card;
  eta: { turn: number; day: number };
}

interface CardsTabProps {
  areaCards: { card: Card; instanceId: string }[];
  onSelectCard: (card: Card, instanceId: string) => void;
  pendingCards?: PendingCardData[];
  turnState?: TurnState;
  units?: Unit[];
  playedCards: string[]; // Array of played card IDs
  areaId: string; // Operational area ID
  onUpdatePlayedCards: (areaId: string, newPlayedCards: string[]) => void;
}

const CardsTab: React.FC<CardsTabProps> = ({
  areaCards,
  onSelectCard,
  pendingCards = [],
  turnState,
  units = [],
  playedCards,
  areaId,
  onUpdatePlayedCards
}) => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  // Helper function to format ETA date
  const formatETA = (eta: { turn: number; day: number }): string => {
    if (!turnState) return 'Unknown date';

    // Parse current date
    const currentDate = new Date(turnState.currentDate);

    // Calculate days to add (each turn is 7 days)
    const turnsToAdd = eta.turn - turnState.turnNumber;
    const daysToAdd = (turnsToAdd * 7) + (eta.day - turnState.dayOfWeek);

    // Calculate arrival date
    const arrivalDate = new Date(currentDate);
    arrivalDate.setDate(arrivalDate.getDate() + daysToAdd);

    // Format: "June 8"
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[arrivalDate.getMonth()]} ${arrivalDate.getDate()}`;
  };

  // Handler to reset all infinite cards in this area
  const handleUpdateInfiniteCards = () => {
    // Remove all infinite card IDs from playedCards array
    const infiniteCardIds = areaCards
      .filter(({ card }) => card.infinite)
      .map(({ card }) => card.id);

    const updatedPlayedCards = playedCards.filter(
      cardId => !infiniteCardIds.includes(cardId)
    );

    onUpdatePlayedCards(areaId, updatedPlayedCards);
  };

  if (areaCards.length === 0 && pendingCards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm font-mono">No cards assigned to this area</p>
        <p className="text-xs mt-1 font-mono">Send cards from Command Center</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4" style={{ maxHeight: '500px', overflowY: 'auto' }}>
      {/* Active Cards */}
      {areaCards.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2 font-mono uppercase tracking-wide">Operational Cards</h4>
          <div className="grid grid-cols-2 gap-3">
            {areaCards.map(({ card, instanceId }) => {
              const hasEmbarkedUnits = (card.embarkedUnits?.length || 0) > 0;
              const isHovered = hoveredCardId === card.id;
              const isInfiniteAndPlayed = card.infinite && playedCards.includes(card.id);

              return (
                <div
                  key={instanceId}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    isInfiniteAndPlayed
                      ? 'border-red-600 cursor-not-allowed'
                      : 'border-gray-600 hover:border-cyan-500 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!isInfiniteAndPlayed) {
                      onSelectCard(card, instanceId);
                    }
                  }}
                >
                  <img
                    src={card.imagePath}
                    alt={card.name}
                    className={`w-full h-auto object-cover ${
                      isInfiniteAndPlayed ? 'grayscale opacity-70' : ''
                    }`}
                  />

                  {/* Red X Overlay for Played Infinite Cards */}
                  {isInfiniteAndPlayed && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="absolute w-[90%] h-[6px] bg-red-600 rotate-45 shadow-lg" />
                      <div className="absolute w-[90%] h-[6px] bg-red-600 -rotate-45 shadow-lg" />
                    </div>
                  )}

                  {/* Infinite Badge */}
                  {card.infinite && (
                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-mono font-bold px-2 py-1 rounded border border-purple-500">
                      ∞
                    </div>
                  )}

                  {/* Embarked Units Badge */}
                  {hasEmbarkedUnits && (
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs font-mono font-bold px-2 py-1 rounded">
                      {card.embarkedUnits?.length} {card.embarkedUnits?.length === 1 ? 'unit' : 'units'}
                    </div>
                  )}

                  {/* Info Icon */}
                  {hasEmbarkedUnits && (
                    <div className="absolute top-2 right-2">
                      <button
                        className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                        onMouseEnter={() => setHoveredCardId(card.id)}
                        onMouseLeave={() => setHoveredCardId(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setHoveredCardId(isHovered ? null : card.id);
                        }}
                      >
                        ℹ
                      </button>

                      {/* Popup with unit list */}
                      {isHovered && (
                        <div className="absolute top-8 right-0 bg-gray-900 text-white text-xs rounded shadow-lg p-2 w-48 z-50 border border-cyan-500 font-mono">
                          <div className="font-bold mb-1 text-cyan-400">Embarked Units:</div>
                          <div className="space-y-0.5">
                            {card.embarkedUnits?.map(unitId => {
                              const unit = units.find(u => u.id === unitId);
                              return unit ? (
                                <div key={unitId} className="text-gray-300">• {unit.name}</div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Cards */}
      {pendingCards.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-orange-400 mb-2 font-mono uppercase tracking-wide">
            In Transit
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {pendingCards.map((item, idx) => {
              if (!item.card) return null;

              const hasEmbarkedUnits = (item.card.embarkedUnits?.length || 0) > 0;
              const isHovered = hoveredCardId === item.card.id;

              return (
                <div
                  key={idx}
                  className="relative rounded-lg overflow-hidden border-2 border-orange-500 border-dashed"
                >
                  <img
                    src={item.card.imagePath}
                    alt={item.card.name}
                    className="w-full h-auto object-cover opacity-40 grayscale"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40">
                    <div className="text-white text-sm font-mono font-bold mb-1">In Transit</div>
                    <div className="text-orange-400 text-xs font-mono font-semibold">
                      ETA: {formatETA(item.eta)}
                    </div>
                  </div>

                  {/* Embarked Units Badge */}
                  {hasEmbarkedUnits && (
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs font-mono font-bold px-2 py-1 rounded">
                      {item.card.embarkedUnits?.length} {item.card.embarkedUnits?.length === 1 ? 'unit' : 'units'}
                    </div>
                  )}

                  {/* Info Icon */}
                  {hasEmbarkedUnits && (
                    <div className="absolute top-2 right-2">
                      <button
                        className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                        onMouseEnter={() => setHoveredCardId(item.card!.id)}
                        onMouseLeave={() => setHoveredCardId(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setHoveredCardId(isHovered ? null : item.card!.id);
                        }}
                      >
                        ℹ
                      </button>

                      {/* Popup with unit list */}
                      {isHovered && (
                        <div className="absolute top-8 right-0 bg-gray-900 text-white text-xs rounded shadow-lg p-2 w-48 z-50 border border-cyan-500 font-mono">
                          <div className="font-bold mb-1 text-cyan-400">Embarked Units:</div>
                          <div className="space-y-0.5">
                            {item.card.embarkedUnits?.map(unitId => {
                              const unit = units.find(u => u.id === unitId);
                              return unit ? (
                                <div key={unitId} className="text-gray-300">• {unit.name}</div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Update Infinite Cards Section */}
      {(() => {
        const playedInfiniteCards = areaCards.filter(
          ({ card }) => card.infinite && playedCards.includes(card.id)
        );

        if (playedInfiniteCards.length === 0) return null;

        return (
          <div className="mt-4 border-t border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-purple-400 mb-2 font-mono uppercase tracking-wide">
              Infinite Cards - Reset Availability
            </h4>
            <div className="bg-gray-900 border border-purple-600 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-3 font-mono">
                The following infinite cards have been played and are currently unavailable.
                Click UPDATE to reset their availability for the next turn.
              </p>
              <div className="space-y-2 mb-3">
                {playedInfiniteCards.map(({ card, instanceId }) => (
                  <div key={instanceId} className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-purple-400">∞</span>
                    <span className="text-gray-300">{card.name}</span>
                    <span className="text-gray-500">({card.id})</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleUpdateInfiniteCards}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-mono font-bold py-2 px-4 rounded uppercase tracking-wide transition-all"
              >
                Update - Reset All Infinite Cards
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default CardsTab;
