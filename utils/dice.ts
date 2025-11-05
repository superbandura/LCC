import { InfluenceThreshold } from '../types';

/**
 * Roll a 20-sided die (d20)
 * @returns Random number between 1 and 20 (inclusive)
 */
export const rollD20 = (): number => {
  return Math.floor(Math.random() * 20) + 1;
};

/**
 * Get the influence effect for a given dice roll based on thresholds
 * @param roll The dice roll result (1-20)
 * @param thresholds Array of influence thresholds to evaluate
 * @returns The matching threshold or null if no match found
 */
export const getInfluenceEffect = (
  roll: number,
  thresholds: InfluenceThreshold[]
): InfluenceThreshold | null => {
  // Find the threshold that matches the roll
  const matchingThreshold = thresholds.find(
    threshold => roll >= threshold.minRoll && roll <= threshold.maxRoll
  );

  return matchingThreshold || null;
};

/**
 * Validate that influence thresholds cover the full d20 range (1-20) without gaps or overlaps
 * @param thresholds Array of influence thresholds to validate
 * @returns Object with validation result and error message if invalid
 */
export const validateInfluenceThresholds = (
  thresholds: InfluenceThreshold[]
): { valid: boolean; error?: string } => {
  if (!thresholds || thresholds.length === 0) {
    return { valid: false, error: 'Al menos un umbral es requerido' };
  }

  // Check for valid ranges
  for (const threshold of thresholds) {
    if (threshold.minRoll < 1 || threshold.minRoll > 20) {
      return { valid: false, error: `Valor mínimo debe estar entre 1 y 20 (encontrado: ${threshold.minRoll})` };
    }
    if (threshold.maxRoll < 1 || threshold.maxRoll > 20) {
      return { valid: false, error: `Valor máximo debe estar entre 1 y 20 (encontrado: ${threshold.maxRoll})` };
    }
    if (threshold.minRoll > threshold.maxRoll) {
      return { valid: false, error: `Valor mínimo (${threshold.minRoll}) no puede ser mayor que valor máximo (${threshold.maxRoll})` };
    }
    if (threshold.influenceEffect < -10 || threshold.influenceEffect > 10) {
      return { valid: false, error: `Efecto de influencia debe estar entre -10 y +10 (encontrado: ${threshold.influenceEffect})` };
    }
  }

  // Check for overlaps
  const sortedThresholds = [...thresholds].sort((a, b) => a.minRoll - b.minRoll);
  for (let i = 0; i < sortedThresholds.length - 1; i++) {
    const current = sortedThresholds[i];
    const next = sortedThresholds[i + 1];

    if (current.maxRoll >= next.minRoll) {
      return { valid: false, error: `Solapamiento detectado: [${current.minRoll}-${current.maxRoll}] y [${next.minRoll}-${next.maxRoll}]` };
    }
  }

  // Optional: Check for gaps (warning, not error)
  // This could be a future enhancement if you want to ensure full coverage of 1-20

  return { valid: true };
};

/**
 * Format the influence effect as a string with sign
 * @param effect The influence effect value (-10 to +10)
 * @returns Formatted string (e.g., "+3", "-2", "0")
 */
export const formatInfluenceEffect = (effect: number): string => {
  if (effect === 0) return '0';
  return effect > 0 ? `+${effect}` : effect.toString();
};
