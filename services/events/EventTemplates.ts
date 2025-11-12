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
  successDefender: (damage: number): string =>
    `${damage} command ${damage === 1 ? 'point' : 'points'} lost due to enemy submarine activity`,

  /**
   * Failed patrol (attacker perspective)
   */
  failureAttacker: (zoneName: string): string =>
    `Failed patrol in ${zoneName} - No enemy activity detected`,

  /**
   * Failed patrol (defender perspective)
   */
  failureDefender: (zoneName: string): string =>
    `Enemy patrol in ${zoneName} - No impact on operations`,

  /**
   * Failed patrol (admin view only - no perspective)
   */
  patrolFailed: (zoneName: string): string =>
    `Patrol sweep completed in ${zoneName} - No enemy contact`
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
    `Base ${targetName} attacked - ${damage} damage ${damage === 1 ? 'point' : 'points'}`,

  /**
   * Failed attack (defender perspective - no damage)
   */
  failureDefender: (targetName: string): string =>
    `Missile attack detected at ${targetName} - Defenses held`
};

/**
 * ASW event templates
 */
export const ASWTemplates = {
  /**
   * ASW elimination (attacker perspective - no enemy submarine name for fog of war)
   */
  eliminationAttacker: (aswElementType: string, aswElementName: string): string =>
    `ASW ${aswElementType} ${aswElementName} eliminated enemy submarine`,

  /**
   * ASW elimination (defender perspective)
   */
  eliminationDefender: (submarineName: string, aswElementType: string, aswElementName: string): string =>
    `Submarine ${submarineName} destroyed by enemy ${aswElementType} (${aswElementName})`,

  /**
   * ASW detection but evaded (attacker perspective - no enemy submarine name for fog of war)
   */
  detectionEvaded: (areaName?: string): string =>
    areaName
      ? `Enemy submarine detected but evaded in ${areaName}`
      : `Enemy submarine detected but evaded`,

  /**
   * ASW detection but evaded (defender perspective)
   */
  detectionEvadedDefender: (submarineName: string, areaName: string): string =>
    `Submarine ${submarineName} detected in ${areaName} but escaped - Enemy failed to eliminate`,

  /**
   * ASW detection attempt failed (admin view only - no perspective)
   */
  detectionFailed: (): string =>
    `Detection attempt failed - No enemy contact`
};

/**
 * Mine event templates
 */
export const MineTemplates = {
  /**
   * Mine hit (defender perspective only)
   */
  hit: (unitName: string, unitType: string, areaName: string): string =>
    `${unitType} ${unitName} destroyed by maritime mine in ${areaName}`,

  /**
   * Mine detection failed (defender perspective)
   */
  detectionFailed: (unitName: string, unitType: string, areaName: string): string =>
    `${unitType} ${unitName} passed through minefield in ${areaName} - No contact`
};

/**
 * Asset deployment event templates
 */
export const AssetTemplates = {
  /**
   * Asset deployment success (deployer perspective)
   */
  deploymentSuccess: (assetType: string, areaName: string): string =>
    `Asset deployment: ${assetType} operational in ${areaName}`
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
