/**
 * AssetDeployService
 *
 * Handles asset card deployment to operational areas:
 * - Processes 'deploy' orders for asset-type submarine cards
 * - Adds assets to operational area assignedCards array
 * - Maritime Mines, future asset types (sensors, decoys, etc.)
 * - Updates submarine deployment status after deployment
 *
 * This service is pure and testable - it doesn't directly modify Firebase,
 * but returns updated data structures for the caller to persist.
 */

import {
  SubmarineCampaignState,
  SubmarineDeployment,
  TurnState,
  OperationalArea
} from '../../types';

export interface AssetDeployResult {
  updatedSubmarines: SubmarineDeployment[];
  updatedOperationalAreas: OperationalArea[];
  deployedAssets: Array<{
    assetId: string;
    assetName: string;
    areaId: string;
    areaName: string;
  }>;
}

/**
 * AssetDeployService class
 * Contains all asset deployment logic
 */
export class AssetDeployService {
  /**
   * Process asset deploy orders
   * Assets with orderType='deploy' and status='pending' are deployed to their target areas
   */
  static async processDeployOrders(
    submarineCampaign: SubmarineCampaignState | null,
    currentTurnState: TurnState,
    operationalAreas: OperationalArea[],
    submarines?: SubmarineDeployment[]
  ): Promise<AssetDeployResult> {
    if (!submarineCampaign) {
      return {
        updatedSubmarines: [],
        updatedOperationalAreas: [...operationalAreas],
        deployedAssets: []
      };
    }

    // Use provided submarines or fall back to campaign submarines
    const sourceSubmarines = submarines || submarineCampaign.deployedSubmarines;

    // Filter assets with pending deploy orders
    const pendingDeploys = sourceSubmarines.filter(
      sub => sub.status === 'active' &&
             sub.submarineType === 'asset' &&
             sub.currentOrder &&
             sub.currentOrder.orderType === 'deploy' &&
             sub.currentOrder.status === 'pending'
    );

    if (pendingDeploys.length === 0) {
      return {
        updatedSubmarines: sourceSubmarines,
        updatedOperationalAreas: [...operationalAreas],
        deployedAssets: []
      };
    }

    const deployedAssets: Array<{ assetId: string; assetName: string; areaId: string; areaName: string }> = [];
    let updatedOperationalAreas = operationalAreas.map(area => ({
      ...area,
      assignedCards: [...(area.assignedCards || [])]
    }));
    const updatedSubmarines = sourceSubmarines.map(sub => {
      // Check if this submarine has a pending deploy order
      const hasPendingDeploy = pendingDeploys.some(deploy => deploy.id === sub.id);
      if (!hasPendingDeploy) {
        return sub;
      }

      // Find target operational area
      const targetAreaId = sub.currentOrder!.targetId;
      const targetAreaIndex = updatedOperationalAreas.findIndex(area => area.id === targetAreaId);

      if (targetAreaIndex === -1) {
        console.error(`❌ Asset Deploy: Area ${targetAreaId} not found for ${sub.submarineName}`);
        return sub;
      }

      // Create card instance ID: {cardId}_{deploymentId}
      const cardInstanceId = `${sub.cardId}_${sub.id}`;

      // Add asset to operational area's assignedCards (prevent duplicates)
      if (!updatedOperationalAreas[targetAreaIndex].assignedCards!.includes(cardInstanceId)) {
        updatedOperationalAreas[targetAreaIndex].assignedCards!.push(cardInstanceId);

        // Record deployment
        deployedAssets.push({
          assetId: sub.id,
          assetName: sub.submarineName,
          areaId: targetAreaId,
          areaName: updatedOperationalAreas[targetAreaIndex].name
        });
      } else {
        console.warn(`⚠️ Asset Deploy: ${cardInstanceId} already deployed to ${targetAreaId} - skipping duplicate`);
      }

      // Mark order as completed
      return {
        ...sub,
        currentOrder: {
          ...sub.currentOrder!,
          status: 'completed' as const,
          executionTurn: currentTurnState.turnNumber,
          executionDate: currentTurnState.currentDate
        }
      };
    });

    if (deployedAssets.length > 0) {
      console.log(`🎯 Asset Deploy: ${deployedAssets.length} assets deployed`);
      deployedAssets.forEach(asset => {
        console.log(`  → ${asset.assetName} deployed to ${asset.areaName}`);
      });
    }

    return {
      updatedSubmarines,
      updatedOperationalAreas,
      deployedAssets
    };
  }
}
