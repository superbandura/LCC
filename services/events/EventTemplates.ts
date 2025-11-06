/**
 * EventTemplates
 *
 * Standardized event descriptions for submarine campaign operations.
 * Ensures consistent messaging across all services.
 */

/**
 * Patrol event templates
 */
export const PatrolTemplates = {
  /**
   * Successful patrol (attacker perspective - no damage info)
   */
  successAttacker: (zoneName: string): string =>
    `Successful patrol in ${zoneName} - Enemy logistics affected`,

  /**
   * Successful patrol (defender perspective - with damage info)
   */
  successDefender: (zoneName: string, damage: number): string =>
    `Logistics affected in ${zoneName} - ${damage} command ${damage === 1 ? 'point' : 'points'} lost`,

  /**
   * Failed patrol (attacker perspective)
   */
  failureAttacker: (zoneName: string): string =>
    `Failed patrol in ${zoneName} - No enemy activity detected`,

  /**
   * Failed patrol (defender perspective)
   */
  failureDefender: (zoneName: string): string =>
    `Enemy patrol in ${zoneName} - No impact on operations`
};

/**
 * Attack event templates
 */
export const AttackTemplates = {
  /**
   * Attack launched (attacker perspective - same for success/failure)
   */
  launchedAttacker: (targetName: string): string =>
    `Missile attack launched against ${targetName}`,

  /**
   * Successful attack (defender perspective - with damage info)
   */
  successDefender: (targetName: string, damage: number): string =>
    `Base ${targetName} attacked - ${damage} damage ${damage === 1 ? 'point' : 'points'}`
};

/**
 * ASW event templates
 */
export const ASWTemplates = {
  /**
   * ASW elimination (attacker perspective)
   */
  eliminationAttacker: (aswElementType: string, aswElementName: string, targetSubmarineName: string): string =>
    `ASW ${aswElementType} ${aswElementName} eliminated enemy submarine ${targetSubmarineName}`,

  /**
   * ASW elimination (defender perspective)
   */
  eliminationDefender: (submarineName: string, aswElementType: string, aswElementName: string): string =>
    `Submarine ${submarineName} destroyed by enemy ${aswElementType} (${aswElementName})`,

  /**
   * ASW detection but evaded (attacker perspective only)
   */
  detectionEvaded: (targetSubmarineName: string): string =>
    `Enemy submarine detected but evaded - ${targetSubmarineName} escaped`,

  /**
   * ASW detection failed (attacker perspective)
   */
  detectionFailed: (targetSubmarineName: string): string =>
    `Detection attempt failed - ${targetSubmarineName} remained undetected`
};

/**
 * Helper function to get zone name from target ID
 */
export function formatZoneName(targetId: string, operationalAreas?: Array<{ id: string; name: string }>): string {
  if (targetId === 'south-china-sea') {
    return 'Mar de China';
  }
  const area = operationalAreas?.find(a => a.id === targetId);
  return area?.name || 'Zona desconocida';
}
