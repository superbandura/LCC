import { CardPurchaseHistory } from '../types';

/**
 * Initial per-card purchase history state
 *
 * Tracks lifetime card purchases for each specific card ID per faction.
 * This counter represents the total number of times each card has been purchased
 * throughout the game and should never decrease (except on game reset).
 *
 * Format: { us: { "us-001": 3, "us-002": 1 }, china: { "china-001": 2 } }
 *
 * Both factions start with empty purchase history at the beginning of a new game.
 */
export const initialCardPurchaseHistory: CardPurchaseHistory = {
  us: {},
  china: {},
};
