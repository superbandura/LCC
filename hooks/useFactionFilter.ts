/**
 * useFactionFilter Hook
 *
 * Generic hook for filtering game entities by faction.
 * Provides automatic memoization for performance.
 *
 * Benefits:
 * - Reusable faction filtering logic
 * - Automatic memoization prevents unnecessary re-renders
 * - Type-safe filtering
 * - Clean, declarative API
 *
 * Usage:
 *   const factionUnits = useFactionFilter(units, selectedFaction);
 *   const factionTaskForces = useFactionFilter(taskForces, selectedFaction);
 */

import { useMemo } from 'react';

/**
 * Generic type for entities that have a faction property
 */
export type FactionEntity = {
  faction: 'us' | 'china';
  [key: string]: any;
};

/**
 * Filter an array of entities by faction
 * Returns empty array if no faction is selected
 *
 * @param items - Array of items with faction property
 * @param selectedFaction - Currently selected faction (or null)
 * @returns Filtered array of items matching the selected faction
 */
export function useFactionFilter<T extends FactionEntity>(
  items: T[],
  selectedFaction: 'us' | 'china' | null
): T[] {
  return useMemo(() => {
    if (!selectedFaction) {
      return [];
    }
    return items.filter(item => item.faction === selectedFaction);
  }, [items, selectedFaction]);
}

/**
 * Filter multiple arrays by faction at once
 * Useful when you need to filter several entity types simultaneously
 *
 * Usage:
 *   const filtered = useFactionFilterMultiple({
 *     units,
 *     taskForces,
 *     cards
 *   }, selectedFaction);
 *   // Access: filtered.units, filtered.taskForces, filtered.cards
 */
export function useFactionFilterMultiple<T extends Record<string, FactionEntity[]>>(
  entityGroups: T,
  selectedFaction: 'us' | 'china' | null
): T {
  return useMemo(() => {
    if (!selectedFaction) {
      // Return empty arrays for all groups
      return Object.keys(entityGroups).reduce((acc, key) => {
        acc[key] = [];
        return acc;
      }, {} as any) as T;
    }

    // Filter each group
    const filtered = Object.entries(entityGroups).reduce((acc, [key, items]) => {
      acc[key] = items.filter(item => item.faction === selectedFaction);
      return acc;
    }, {} as any) as T;

    return filtered;
  }, [entityGroups, selectedFaction]);
}

/**
 * Get faction-specific statistics
 * Provides counts and percentages for each faction
 *
 * Usage:
 *   const stats = useFactionStats(units);
 *   console.log(stats.us.count, stats.china.count);
 */
export function useFactionStats<T extends FactionEntity>(items: T[]) {
  return useMemo(() => {
    const usItems = items.filter(item => item.faction === 'us');
    const chinaItems = items.filter(item => item.faction === 'china');
    const total = items.length;

    return {
      us: {
        count: usItems.length,
        percentage: total > 0 ? Math.round((usItems.length / total) * 100) : 0,
        items: usItems
      },
      china: {
        count: chinaItems.length,
        percentage: total > 0 ? Math.round((chinaItems.length / total) * 100) : 0,
        items: chinaItems
      },
      total
    };
  }, [items]);
}
