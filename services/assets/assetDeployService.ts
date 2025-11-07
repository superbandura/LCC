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
  SubmarineEvent,
  TurnState,
  OperationalArea
} from '../../types';
import { EventBuilder } from '../events/EventBuilder';
import { AssetTemplates } from '../events/EventTemplates';

export interface AssetDeployResult {
  updatedSubmarines: SubmarineDeployment[];
  updatedOperationalAreas: OperationalArea[];
  deployedAssets: Array<{
    assetId: string;
    assetName: string;
    areaId: string;
    areaName: string;
  }>;
  events: SubmarineEvent[];
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
        deployedAssets: [],
        events: []
      };
    }

    // Use provided submarines or fall back to campaign submarines
    const sourceSubmarines = submarines || submarineCampaign.deployedSubmarines;

    // Log asset order statuses at the start of processing
    const assetOrdersAtStart = sourceSubmarines
      .filter(sub => sub.submarineType === 'asset' && sub.currentOrder)
      .map(sub => ({
        name: sub.submarineName,
        orderType: sub.currentOrder?.orderType,
        status: sub.currentOrder?.status,
        executionTurn: sub.currentOrder?.executionTurn
      }));
    if (assetOrdersAtStart.length > 0) {
      console.log('🔍 [ASSET DEPLOY START] Asset orders at phase start:', assetOrdersAtStart);
    }

    // Filter assets with pending deploy orders (only if not already executed)
    const pendingDeploys = sourceSubmarines.filter(
      sub => sub.status === 'active' &&
             sub.submarineType === 'asset' &&
             sub.currentOrder &&
             sub.currentOrder.orderType === 'deploy' &&
             sub.currentOrder.status === 'pending' &&
             !sub.currentOrder.executionTurn  // Only process if not already executed
    );

    if (pendingDeploys.length === 0) {
      return {
        updatedSubmarines: sourceSubmarines,
        updatedOperationalAreas: [...operationalAreas],
        deployedAssets: [],
        events: []
      };
    }

    const deployedAssets: Array<{ assetId: string; assetName: string; areaId: string; areaName: string }> = [];
    const events: SubmarineEvent[] = [];
    // Assets are invisible infrastructure - do NOT add them to assignedCards
    const updatedOperationalAreas = [...operationalAreas];

    const updatedSubmarines = sourceSubmarines.map(sub => {
      // Check if this submarine has a pending deploy order
      const hasPendingDeploy = pendingDeploys.some(deploy => deploy.id === sub.id);
      if (!hasPendingDeploy) {
        return sub;
      }

      // Find target operational area
      const targetAreaId = sub.currentOrder!.targetId;
      const targetArea = operationalAreas.find(area => area.id === targetAreaId);

      if (!targetArea) {
        console.error(`❌ Asset Deploy: Area ${targetAreaId} not found for ${sub.submarineName}`);
        return sub;
      }

      // Record deployment for logging (assets remain invisible to players)
      deployedAssets.push({
        assetId: sub.id,
        assetName: sub.submarineName,
        areaId: targetAreaId,
        areaName: targetArea.name
      });

      // Create deployment event (visible to deploying faction)
      const deploymentEvent = new EventBuilder()
        .setSubmarine(sub)
        .setTurnState(currentTurnState)
        .setEventType('attack_success') // Use attack_success for display in ops log
        .setTarget(targetAreaId, targetArea.name, 'area')
        .setDescription(AssetTemplates.deploymentSuccess(sub.cardName, targetArea.name))
        .setExecutionTurn(currentTurnState.turnNumber)
        .build();

      events.push(deploymentEvent);

      // Mark order as completed
      const completedSub = {
        ...sub,
        currentOrder: {
          ...sub.currentOrder!,
          status: 'completed' as const,
          executionTurn: currentTurnState.turnNumber,
          executionDate: currentTurnState.currentDate
        }
      };

      console.log(`🔧 [ASSET DEPLOY] Marking ${sub.submarineName} order as completed:`, {
        before: sub.currentOrder?.status,
        after: completedSub.currentOrder?.status,
        executionTurn: completedSub.currentOrder?.executionTurn
      });

      return completedSub;
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
      deployedAssets,
      events
    };
  }
}
