/**
 * useDeploymentNotifications Hook
 *
 * Handles deployment arrival detection and submarine event notifications.
 * Detects turn/day changes and calculates what has arrived for the current faction.
 *
 * Benefits:
 * - Encapsulates complex arrival notification logic
 * - Prevents duplicate notifications
 * - Centralized turn change detection
 * - Easier to test
 *
 * Usage:
 *   const notifications = useDeploymentNotifications({
 *     turnState,
 *     selectedFaction,
 *     pendingDeployments,
 *     cards,
 *     taskForces,
 *     units,
 *     submarineCampaign
 *   });
 *
 *   // Check if notifications are available
 *   if (notifications.hasNotifications) {
 *     // Show notification modal with notifications.arrivals
 *   }
 */

import { useState, useEffect, useRef } from 'react';
import {
  TurnState,
  PendingDeployments,
  Card,
  TaskForce,
  Unit,
  SubmarineCampaignState,
  SubmarineEvent,
  PendingCardDeployment,
  PendingTaskForceDeployment,
  PendingUnitDeployment
} from '../types';
import { DeploymentService } from '../services/deploymentService';

export interface ArrivalNotifications {
  cards: Card[];
  taskForces: TaskForce[];
  units: Unit[];
  cardDeployments: PendingCardDeployment[];
  taskForceDeployments: PendingTaskForceDeployment[];
  unitDeployments: PendingUnitDeployment[];
  submarineEvents: SubmarineEvent[];
  hasNotifications: boolean;
  turnNumber: number;
  dayOfWeek: number;
  currentDate: string;
}

export interface UseDeploymentNotificationsProps {
  turnState: TurnState;
  selectedFaction: 'us' | 'china' | null;
  pendingDeployments: PendingDeployments;
  cards: Card[];
  taskForces: TaskForce[];
  units: Unit[];
  submarineCampaign: SubmarineCampaignState;
}

/**
 * Hook to detect and calculate deployment arrivals
 * Returns arrival data when turn/day changes
 */
export function useDeploymentNotifications({
  turnState,
  selectedFaction,
  pendingDeployments,
  cards,
  taskForces,
  units,
  submarineCampaign
}: UseDeploymentNotificationsProps): ArrivalNotifications | null {
  const [notifications, setNotifications] = useState<ArrivalNotifications | null>(null);
  const lastModalOpenDate = useRef<string | null>(null);
  const prevCurrentDate = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Skip planning phase, initial mount, or no faction selected
    if (turnState.isPlanningPhase || turnState.turnNumber === 0 || !selectedFaction) {
      return;
    }

    // Detect day advance (date changed)
    // Only process once per date change (prevent duplicate notifications)
    if (prevCurrentDate.current !== undefined &&
        prevCurrentDate.current !== turnState.currentDate &&
        lastModalOpenDate.current !== turnState.currentDate) {

      console.log('🔔 Day changed detected:', prevCurrentDate.current, '→', turnState.currentDate);
      console.log('📅 Turn:', turnState.turnNumber, '| Day:', turnState.dayOfWeek);

      // Mark this date as processed
      lastModalOpenDate.current = turnState.currentDate;

      // Calculate arrivals for current faction using DeploymentService
      const arrivals = DeploymentService.calculateArrivals(
        pendingDeployments,
        turnState,
        selectedFaction,
        cards,
        taskForces,
        units
      );

      // Get submarine events for this turn, day, and faction
      console.log(`🔍 Checking submarineCampaign.events: ${submarineCampaign?.events?.length || 0} total`);
      console.log(`🎯 Searching events with: turn=${turnState.turnNumber}, faction=${selectedFaction}, dayOfWeek=${turnState.dayOfWeek}`);

      const mySubmarineEvents = submarineCampaign?.events.filter(
        e => e.turn === turnState.turnNumber &&
             e.faction === selectedFaction &&
             e.dayOfWeek === turnState.dayOfWeek
      ) || [];

      console.log(`✅ Events found for ${selectedFaction}: ${mySubmarineEvents.length}`);

      // Check if there are any notifications
      const hasNotifications =
        arrivals.arrivedCards.length > 0 ||
        arrivals.arrivedTaskForces.length > 0 ||
        arrivals.arrivedUnits.length > 0 ||
        mySubmarineEvents.length > 0;

      // Log modal content
      console.log('📊 Notifications:');
      console.log(`  - Deployments: ${arrivals.arrivedCards.length} cards, ${arrivals.arrivedTaskForces.length} TFs, ${arrivals.arrivedUnits.length} units`);
      console.log(`  - Submarine events: ${mySubmarineEvents.length}`);

      if (mySubmarineEvents.length > 0) {
        console.log('  📋 Events for modal:');
        mySubmarineEvents.forEach((e, idx) => {
          console.log(`    ${idx + 1}. [T${e.turn} D${e.dayOfWeek || '?'}] [${e.faction.toUpperCase()}] ${e.submarineName} - ${e.description}`);
        });
      }

      // Set notifications
      const notificationData: ArrivalNotifications = {
        cards: arrivals.arrivedCards,
        taskForces: arrivals.arrivedTaskForces,
        units: arrivals.arrivedUnits,
        cardDeployments: arrivals.arrivedCardDeployments,
        taskForceDeployments: arrivals.arrivedTaskForceDeployments,
        unitDeployments: arrivals.arrivedUnitDeployments,
        submarineEvents: mySubmarineEvents,
        hasNotifications,
        turnNumber: turnState.turnNumber,
        dayOfWeek: turnState.dayOfWeek,
        currentDate: turnState.currentDate
      };

      setNotifications(notificationData);
    }

    // Update previous date
    prevCurrentDate.current = turnState.currentDate;
  }, [turnState.currentDate, turnState.turnNumber, turnState.dayOfWeek, turnState.isPlanningPhase, selectedFaction, pendingDeployments, cards, taskForces, units, submarineCampaign]);

  return notifications;
}

/**
 * Hook to manage notification acknowledgment
 * Provides a way to clear notifications after user has seen them
 */
export function useNotificationAcknowledgment() {
  const [acknowledgedNotifications, setAcknowledgedNotifications] = useState<Set<string>>(new Set());

  const acknowledge = (notificationKey: string) => {
    setAcknowledgedNotifications(prev => {
      const next = new Set(prev);
      next.add(notificationKey);
      return next;
    });
  };

  const isAcknowledged = (notificationKey: string): boolean => {
    return acknowledgedNotifications.has(notificationKey);
  };

  const clearAcknowledgments = () => {
    setAcknowledgedNotifications(new Set());
  };

  return {
    acknowledge,
    isAcknowledged,
    clearAcknowledgments
  };
}
