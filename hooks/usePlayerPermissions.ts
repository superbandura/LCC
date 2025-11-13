/**
 * usePlayerPermissions Hook
 *
 * Determines user permissions based on their role and operational area assignment.
 * Used to control visibility and access to Command Center, Task Force, Combat Statistics modals,
 * submarine campaign operations, and turn advancement.
 *
 * Permission Hierarchy:
 * 1. Admin (global role): Full access to everything
 * 2. Command Center Player: Access to CC/TF/Stats modals, submarine control, and turn advancement
 * 3. Regular Player (including Master): Standard access only
 *
 * IMPORTANT: Master has NO special permissions except deleting the game they created.
 * Master must be assigned to Command Center to access CC/TF/Submarine operations.
 *
 * Usage:
 *   const permissions = usePlayerPermissions(playerAssignments, operationalAreas);
 *
 *   if (permissions.canAccessCommandCenter) {
 *     // Show Command Center modal button
 *   }
 */

import { useMemo } from 'react';
import { PlayerAssignment, OperationalArea } from '../types';
import { useAuth } from '../contexts/AuthContext';

export interface PlayerPermissions {
  /**
   * Can access Command Center modal
   * True for: Admin, players assigned to Command Center
   */
  canAccessCommandCenter: boolean;

  /**
   * Can access Task Force modal
   * True for: Admin, players assigned to Command Center
   */
  canAccessTaskForce: boolean;

  /**
   * Can access Combat Statistics modal
   * True for: Everyone (no restriction)
   */
  canAccessStats: boolean;

  /**
   * Can execute submarine campaign operations
   * True for: Admin, players assigned to Command Center
   */
  canControlSubmarineCampaign: boolean;

  /**
   * Can advance the turn (press "Advance Turn" button)
   * True for: Admin, players assigned to Command Center
   */
  canAdvanceTurn: boolean;

  /**
   * Is the user assigned to a Command Center area
   */
  isCommandCenterPlayer: boolean;

  /**
   * Array of all operational area IDs the user is assigned to
   */
  assignedAreas: string[];
}

/**
 * Hook to determine player permissions based on assignments and roles
 */
export function usePlayerPermissions(
  playerAssignments: PlayerAssignment[],
  operationalAreas: OperationalArea[]
): PlayerPermissions {
  const { userProfile } = useAuth();

  return useMemo(() => {
    // Admin has full access to everything without needing assignments
    const isAdmin = userProfile?.role === 'admin';

    if (isAdmin) {
      return {
        canAccessCommandCenter: true,
        canAccessTaskForce: true,
        canAccessStats: true,
        canControlSubmarineCampaign: true,
        canAdvanceTurn: true,
        isCommandCenterPlayer: true,
        assignedAreas: [],
      };
    }

    // For ALL other players (including Master):
    // Get all assignments for this player
    const userAssignments = playerAssignments.filter(
      assignment => assignment.playerName === userProfile?.displayName
    );

    // Check if ANY assignment is to a Command Center area
    const isCommandCenterPlayer = userAssignments.some(assignment => {
      const area = operationalAreas.find(a => a.id === assignment.operationalAreaId);
      return area?.isCommandCenter === true;
    });

    // Extract all assigned area IDs
    const assignedAreas = userAssignments.map(a => a.operationalAreaId);

    // Permissions based ONLY on Command Center assignment
    return {
      canAccessCommandCenter: isCommandCenterPlayer,
      canAccessTaskForce: isCommandCenterPlayer,
      canAccessStats: true,  // Everyone can access Stats
      canControlSubmarineCampaign: isCommandCenterPlayer,
      canAdvanceTurn: isCommandCenterPlayer,
      isCommandCenterPlayer,
      assignedAreas,
    };
  }, [playerAssignments, operationalAreas, userProfile]);
}
