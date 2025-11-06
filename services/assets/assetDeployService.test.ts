/**
 * AssetDeployService Tests
 *
 * Tests for asset deployment mechanics:
 * - Deploy order processing
 * - Addition to operational area assignedCards
 * - Order status updates
 * - Edge cases (no orders, missing areas, etc.)
 */

import { describe, it, expect } from 'vitest';
import { AssetDeployService } from './assetDeployService';
import {
  SubmarineCampaignState,
  SubmarineDeployment,
  TurnState,
  OperationalArea
} from '../../types';

describe('AssetDeployService', () => {
  const createMockTurnState = (): TurnState => ({
    turnNumber: 2,
    currentDate: '2030-06-10',
    dayOfWeek: 3,
    isPlanningPhase: false
  });

  const createMockOperationalAreas = (): OperationalArea[] => [
    {
      id: 'malacca-strait',
      name: 'Estrecho de Malaca',
      bounds: [[0, 0], [1, 1]] as [[number, number], [number, number]],
      assignedCards: []
    },
    {
      id: 'taiwan-strait',
      name: 'Estrecho de Taiwán',
      bounds: [[0, 0], [1, 1]] as [[number, number], [number, number]],
      assignedCards: ['existing-card-1']
    }
  ] as OperationalArea[];

  const createMockAssetWithDeployOrder = (targetArea: string): SubmarineDeployment => ({
    id: 'asset-1',
    submarineName: 'Maritime Mines Alpha',
    faction: 'us',
    cardId: 'us-020',
    cardName: 'Maritime Mines',
    submarineType: 'asset',
    status: 'active',
    missionsCompleted: 0,
    totalKills: 0,
    currentOrder: {
      orderId: 'order-1',
      submarineId: 'asset-1',
      orderType: 'deploy',
      status: 'pending',
      targetId: targetArea,
      targetType: 'area',
      assignedTurn: 1,
      assignedDate: '2030-06-03'
    }
  });

  describe('processDeployOrders', () => {
    it('should return empty result when submarine campaign is null', async () => {
      const turnState = createMockTurnState();
      const areas = createMockOperationalAreas();

      const result = await AssetDeployService.processDeployOrders(
        null,
        turnState,
        areas
      );

      expect(result.updatedSubmarines).toHaveLength(0);
      expect(result.updatedOperationalAreas).toHaveLength(2);
      expect(result.deployedAssets).toHaveLength(0);
    });

    it('should return unchanged data when no deploy orders present', async () => {
      const submarineWithoutOrder: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'USS Virginia',
        faction: 'us',
        cardId: 'us-001',
        cardName: 'Virginia-class',
        submarineType: 'submarine',
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0
        // No currentOrder
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarineWithoutOrder],
        events: [],
        currentTurn: 2,
        usedSubmarineNames: { us: [], china: [] }
      };

      const result = await AssetDeployService.processDeployOrders(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas()
      );

      expect(result.updatedSubmarines).toHaveLength(1);
      expect(result.deployedAssets).toHaveLength(0);
      expect(result.updatedOperationalAreas[0].assignedCards).toHaveLength(0);
    });

    it('should deploy asset to operational area', async () => {
      const asset = createMockAssetWithDeployOrder('malacca-strait');

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [asset],
        events: [],
        currentTurn: 2,
        usedSubmarineNames: { us: [], china: [] }
      };

      const result = await AssetDeployService.processDeployOrders(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas()
      );

      // Asset should be added to area's assignedCards
      const targetArea = result.updatedOperationalAreas.find(a => a.id === 'malacca-strait');
      expect(targetArea?.assignedCards).toContain('us-020_asset-1');
      expect(targetArea?.assignedCards).toHaveLength(1);

      // Deployment should be recorded
      expect(result.deployedAssets).toHaveLength(1);
      expect(result.deployedAssets[0]).toEqual({
        assetId: 'asset-1',
        assetName: 'Maritime Mines Alpha',
        areaId: 'malacca-strait',
        areaName: 'Estrecho de Malaca'
      });

      // Order should be marked as completed
      const updatedAsset = result.updatedSubmarines.find(s => s.id === 'asset-1');
      expect(updatedAsset?.currentOrder?.status).toBe('completed');
      expect(updatedAsset?.currentOrder?.executionTurn).toBe(2);
      expect(updatedAsset?.currentOrder?.executionDate).toBe('2030-06-10');
    });

    it('should deploy multiple assets to different areas', async () => {
      const asset1 = createMockAssetWithDeployOrder('malacca-strait');
      const asset2 = {
        ...createMockAssetWithDeployOrder('taiwan-strait'),
        id: 'asset-2',
        submarineName: 'Maritime Mines Bravo',
        currentOrder: {
          ...createMockAssetWithDeployOrder('taiwan-strait').currentOrder!,
          orderId: 'order-2',
          submarineId: 'asset-2'
        }
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [asset1, asset2],
        events: [],
        currentTurn: 2,
        usedSubmarineNames: { us: [], china: [] }
      };

      const result = await AssetDeployService.processDeployOrders(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas()
      );

      // Both assets deployed
      expect(result.deployedAssets).toHaveLength(2);

      // Asset 1 in malacca-strait
      const area1 = result.updatedOperationalAreas.find(a => a.id === 'malacca-strait');
      expect(area1?.assignedCards).toContain('us-020_asset-1');

      // Asset 2 in taiwan-strait (in addition to existing card)
      const area2 = result.updatedOperationalAreas.find(a => a.id === 'taiwan-strait');
      expect(area2?.assignedCards).toContain('us-020_asset-2');
      expect(area2?.assignedCards).toContain('existing-card-1'); // Existing card preserved
      expect(area2?.assignedCards).toHaveLength(2);

      // Both orders completed
      expect(result.updatedSubmarines.every(s => s.currentOrder?.status === 'completed')).toBe(true);
    });

    it('should not deploy assets with completed orders', async () => {
      const asset = {
        ...createMockAssetWithDeployOrder('malacca-strait'),
        currentOrder: {
          ...createMockAssetWithDeployOrder('malacca-strait').currentOrder!,
          status: 'completed' as const
        }
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [asset],
        events: [],
        currentTurn: 2,
        usedSubmarineNames: { us: [], china: [] }
      };

      const result = await AssetDeployService.processDeployOrders(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas()
      );

      expect(result.deployedAssets).toHaveLength(0);
      const targetArea = result.updatedOperationalAreas.find(a => a.id === 'malacca-strait');
      expect(targetArea?.assignedCards).toHaveLength(0);
    });

    it('should not deploy submarines (only assets)', async () => {
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'USS Virginia',
        faction: 'us',
        cardId: 'us-001',
        cardName: 'Virginia-class',
        submarineType: 'submarine', // Not 'asset'
        status: 'active',
        missionsCompleted: 0,
        totalKills: 0,
        currentOrder: {
          orderId: 'order-1',
          submarineId: 'sub-1',
          orderType: 'deploy',
          status: 'pending',
          targetId: 'malacca-strait',
          targetType: 'area',
          assignedTurn: 1,
          assignedDate: '2030-06-03'
        }
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [submarine],
        events: [],
        currentTurn: 2,
        usedSubmarineNames: { us: [], china: [] }
      };

      const result = await AssetDeployService.processDeployOrders(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas()
      );

      expect(result.deployedAssets).toHaveLength(0);
    });

    it('should handle asset with non-existent target area gracefully', async () => {
      const asset = createMockAssetWithDeployOrder('non-existent-area');

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [asset],
        events: [],
        currentTurn: 2,
        usedSubmarineNames: { us: [], china: [] }
      };

      const result = await AssetDeployService.processDeployOrders(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas()
      );

      // Deployment should fail gracefully
      expect(result.deployedAssets).toHaveLength(0);

      // Asset order should remain unchanged (not marked as completed)
      const updatedAsset = result.updatedSubmarines.find(s => s.id === 'asset-1');
      expect(updatedAsset?.currentOrder?.status).toBe('pending');
    });

    it('should preserve other submarines unchanged', async () => {
      const asset = createMockAssetWithDeployOrder('malacca-strait');
      const submarine: SubmarineDeployment = {
        id: 'sub-1',
        submarineName: 'USS Virginia',
        faction: 'us',
        cardId: 'us-001',
        cardName: 'Virginia-class',
        submarineType: 'submarine',
        status: 'active',
        missionsCompleted: 5,
        totalKills: 2,
        currentOrder: {
          orderId: 'order-2',
          submarineId: 'sub-1',
          orderType: 'patrol',
          status: 'pending',
          targetId: 'south-china-sea',
          targetType: 'area',
          assignedTurn: 2,
          assignedDate: '2030-06-10'
        }
      };

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [asset, submarine],
        events: [],
        currentTurn: 2,
        usedSubmarineNames: { us: [], china: [] }
      };

      const result = await AssetDeployService.processDeployOrders(
        submarineCampaign,
        createMockTurnState(),
        createMockOperationalAreas()
      );

      // Asset deployed
      expect(result.deployedAssets).toHaveLength(1);

      // Submarine unchanged
      const updatedSub = result.updatedSubmarines.find(s => s.id === 'sub-1');
      expect(updatedSub?.missionsCompleted).toBe(5);
      expect(updatedSub?.totalKills).toBe(2);
      expect(updatedSub?.currentOrder?.status).toBe('pending'); // Still pending
    });

    it('should prevent duplicate asset deployments to same area', async () => {
      const asset = createMockAssetWithDeployOrder('malacca-strait');

      // Area already has this asset deployed
      const areasWithDuplicate = createMockOperationalAreas();
      areasWithDuplicate[0].assignedCards = ['us-020_asset-1']; // Already deployed

      const submarineCampaign: SubmarineCampaignState = {
        deployedSubmarines: [asset],
        events: [],
        currentTurn: 2,
        usedSubmarineNames: { us: [], china: [] }
      };

      const result = await AssetDeployService.processDeployOrders(
        submarineCampaign,
        createMockTurnState(),
        areasWithDuplicate
      );

      // Should not add duplicate
      const targetArea = result.updatedOperationalAreas.find(a => a.id === 'malacca-strait');
      expect(targetArea?.assignedCards).toHaveLength(1); // Still 1, not 2
      expect(result.deployedAssets).toHaveLength(0); // No new deployment recorded

      // Order should still be marked as completed
      const updatedAsset = result.updatedSubmarines.find(s => s.id === 'asset-1');
      expect(updatedAsset?.currentOrder?.status).toBe('completed');
    });
  });
});
