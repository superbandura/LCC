import { Position, OperationalArea, Unit, Card } from '../../../types';

/**
 * Check if a location is within operational area bounds
 */
export const isLocationInBounds = (locationCoords: Position, bounds: OperationalArea['bounds']): boolean => {
  const [lat, lng] = locationCoords;
  const [[minLat, minLng], [maxLat, maxLng]] = bounds;

  const latInRange = lat >= Math.min(minLat, maxLat) && lat <= Math.max(minLat, maxLat);
  const lngInRange = lng >= Math.min(minLng, maxLng) && lng <= Math.max(minLng, maxLng);

  return latInRange && lngInRange;
};

/**
 * Get units for a specific task force
 */
export const getTaskForceUnits = (taskForceId: string, units: Unit[]): Unit[] => {
  return units.filter(unit => unit.taskForceId === taskForceId);
};

/**
 * Get compatible units for attaching a card
 */
export const getCompatibleUnitsForCard = (
  card: Card,
  units: Unit[],
  areaUnitsIds: Set<string>
): Unit[] => {
  if (!card.isAttachable || !card.attachableCategory) return [];

  return units.filter(unit => {
    // Must be in this area
    if (!areaUnitsIds.has(unit.id)) return false;

    // Must match category
    if (unit.category !== card.attachableCategory) return false;

    // Must not have a card already
    if (unit.attachedCard) return false;

    // Must not be destroyed
    const damageCount = unit.currentDamage.filter(d => d).length;
    if (damageCount >= unit.damagePoints) return false;

    return true;
  });
};

/**
 * Calculate tactical network effect based on damage
 */
export const getTacticalNetworkEffect = (damageArray: boolean[]): string => {
  const damageCount = damageArray.filter(dmg => dmg === true).length;

  if (damageCount <= 1) {
    return 'Tactical Network fully operational';
  } else if (damageCount <= 3) {
    return 'Minor Effect: Reduces LRS and INTERCEPT by 4';
  } else {
    return 'Major Effect: Reduces LRS and INTERCEPT by 7';
  }
};

/**
 * Check if air patrols are destroyed
 */
export const areAirPatrolsDestroyed = (damageArray: boolean[]): boolean => {
  return damageArray.every(dmg => dmg === true);
};
