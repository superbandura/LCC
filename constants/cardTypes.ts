/**
 * Card Types Constants
 *
 * Defines card type metadata including labels, colors, and icons.
 * Used in CommandCenterModal and CardEditorModal.
 */

import { CardType } from '../types';

export interface CardTypeLabel {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const CARD_TYPE_LABELS: Record<CardType, CardTypeLabel> = {
  attack: {
    label: 'Fire',
    color: 'bg-red-600',
    bgColor: 'bg-red-800/40',
    icon: '/red.png'
  },
  maneuver: {
    label: 'Maneuver',
    color: 'bg-green-600',
    bgColor: 'bg-green-700/40',
    icon: '/green.png'
  },
  interception: {
    label: 'Interception',
    color: 'bg-purple-600',
    bgColor: 'bg-purple-700/40',
    icon: '/purple.png'
  },
  intelligence: {
    label: 'C5ISR',
    color: 'bg-yellow-600',
    bgColor: 'bg-yellow-500/50',
    icon: '/yellow.png'
  },
  communications: {
    label: 'Information',
    color: 'bg-blue-600',
    bgColor: 'bg-blue-700/40',
    icon: '/blue.png'
  },
};

export const CARD_TYPE_OPTIONS: { value: CardType; label: string }[] = [
  { value: 'attack', label: 'Fire' },
  { value: 'maneuver', label: 'Maneuver' },
  { value: 'interception', label: 'Interception' },
  { value: 'intelligence', label: 'C5ISR' },
  { value: 'communications', label: 'Information' },
];
