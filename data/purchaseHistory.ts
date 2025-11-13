import { PurchaseHistory } from '../types';

/**
 * Initial purchase history state
 *
 * Tracks lifetime card purchases for each faction.
 * This counter represents the total number of cards purchased throughout the game
 * and should never decrease (except on game reset).
 *
 * Both factions start with 0 purchases at the beginning of a new game.
 */
export const initialPurchaseHistory: PurchaseHistory = {
  "us": 0,
  "china": 0
};
