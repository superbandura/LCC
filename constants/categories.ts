/**
 * Unit Categories Constants
 *
 * Defines unit categories with their display properties.
 * Used across multiple components for filtering and display.
 */

import { UnitCategory } from '../types';

export interface UnitCategoryConfig {
  value: UnitCategory;
  label: string;
  iconPath: string;
  color: string;
}

export const UNIT_CATEGORIES: UnitCategoryConfig[] = [
  { value: 'ground', label: 'Ground', iconPath: '/IconGround.png', color: 'bg-green-700' },
  { value: 'naval', label: 'Naval', iconPath: '/IconNava.png', color: 'bg-blue-700' },
  { value: 'artillery', label: 'Artillery', iconPath: '/IconArtillery.png', color: 'bg-red-700' },
  { value: 'interception', label: 'Interception', iconPath: '/IconInterception.png', color: 'bg-purple-700' },
  { value: 'supply', label: 'Supply', iconPath: '/IconSupply.png', color: 'bg-yellow-700' },
];
