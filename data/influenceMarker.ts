import { InfluenceMarker } from '../types';

/**
 * Initial influence marker state
 * Value 0 represents a neutral position between US and China
 * Range: -10 to -1 (China advantage) | 0 (neutral) | +1 to +10 (US advantage)
 */
export const initialInfluenceMarker: InfluenceMarker = {
  value: 0,
};
