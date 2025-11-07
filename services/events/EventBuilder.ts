/**
 * EventBuilder
 *
 * Builder pattern for creating submarine campaign events.
 * Eliminates code duplication across patrol, attack, and ASW services.
 *
 * Usage:
 *   const event = new EventBuilder()
 *     .setSubmarine(submarine)
 *     .setFaction(faction)
 *     .setTurnState(turnState)
 *     .setEventType('attack_success')
 *     .setTarget(targetId, targetName, targetType)
 *     .setDescription(description)
 *     .setRolls(primaryRoll, primaryThreshold, secondaryRoll, secondaryThreshold)
 *     .setDamage(damageDealt)
 *     .build();
 */

import { SubmarineEvent, SubmarineDeployment, TurnState, Faction } from '../../types';

export class EventBuilder {
  private event: Partial<SubmarineEvent>;

  constructor() {
    this.event = {
      timestamp: Date.now()
    };
  }

  /**
   * Set submarine information (attacker/source)
   */
  setSubmarine(submarine: SubmarineDeployment): this {
    this.event.submarineId = submarine.id;
    this.event.submarineName = submarine.submarineName;
    this.event.cardId = submarine.cardId;
    this.event.cardName = submarine.cardName;
    this.event.submarineType = submarine.submarineType;

    // Set faction if not already set
    if (!this.event.faction) {
      this.event.faction = submarine.faction;
    }

    return this;
  }

  /**
   * Set custom submarine info (for ASW elements that aren't submarines)
   */
  setSubmarineInfo(id: string, name: string, cardId: string, cardName: string, submarineType?: string): this {
    this.event.submarineId = id;
    this.event.submarineName = name;
    this.event.cardId = cardId;
    this.event.cardName = cardName;
    if (submarineType) {
      this.event.submarineType = submarineType;
    }
    return this;
  }

  /**
   * Set faction (perspective of this event)
   */
  setFaction(faction: Faction): this {
    this.event.faction = faction;
    return this;
  }

  /**
   * Set turn state (turn number, day of week, and current date)
   */
  setTurnState(turnState: TurnState): this {
    this.event.turn = turnState.turnNumber;
    this.event.dayOfWeek = turnState.dayOfWeek;
    this.event.currentDate = turnState.currentDate;
    return this;
  }

  /**
   * Set event type
   */
  setEventType(eventType: 'attack_success' | 'attack_failure' | 'detected' | 'destroyed'): this {
    this.event.eventType = eventType;
    return this;
  }

  /**
   * Set target information
   */
  setTarget(targetId: string, targetName: string, targetType: 'area' | 'base' | 'unit'): this {
    this.event.targetInfo = {
      targetId,
      targetName,
      targetType
    };
    return this;
  }

  /**
   * Set damage dealt to target
   */
  setDamage(damageDealt: number): this {
    if (!this.event.targetInfo) {
      throw new Error('Must set target before setting damage');
    }
    this.event.targetInfo.damageDealt = damageDealt;
    return this;
  }

  /**
   * Set description
   */
  setDescription(description: string): this {
    this.event.description = description;
    return this;
  }

  /**
   * Set roll details (primary and optional secondary roll)
   */
  setRolls(
    primaryRoll: number,
    primaryThreshold: number,
    secondaryRoll?: number,
    secondaryThreshold?: number
  ): this {
    this.event.rollDetails = {
      primaryRoll,
      primaryThreshold
    };

    if (secondaryRoll !== undefined) {
      this.event.rollDetails.secondaryRoll = secondaryRoll;
    }
    if (secondaryThreshold !== undefined) {
      this.event.rollDetails.secondaryThreshold = secondaryThreshold;
    }

    return this;
  }

  /**
   * Set ASW element info (for ASW events)
   */
  setASWElementInfo(elementId: string, elementName: string, elementType: string, areaId?: string, areaName?: string): this {
    if (!this.event.rollDetails) {
      this.event.rollDetails = { primaryRoll: 0, primaryThreshold: 0 };
    }

    const aswElementInfo: any = {
      elementId,
      elementName,
      elementType
    };

    // Only add area fields if they're defined
    if (areaId !== undefined) {
      aswElementInfo.areaId = areaId;
    }
    if (areaName !== undefined) {
      aswElementInfo.areaName = areaName;
    }

    this.event.rollDetails.aswElementInfo = aswElementInfo;
    return this;
  }

  /**
   * Set execution turn (for attack events)
   */
  setExecutionTurn(executionTurn?: number): this {
    if (!this.event.rollDetails) {
      this.event.rollDetails = { primaryRoll: 0, primaryThreshold: 0 };
    }
    this.event.rollDetails.executionTurn = executionTurn;
    return this;
  }

  /**
   * Build the final event
   */
  build(): SubmarineEvent {
    // Validate required fields
    if (!this.event.submarineId || !this.event.submarineName || !this.event.faction ||
        !this.event.cardId || !this.event.cardName || !this.event.eventType ||
        this.event.turn === undefined || this.event.dayOfWeek === undefined ||
        !this.event.timestamp || !this.event.description) {
      throw new Error('EventBuilder: Missing required fields');
    }

    // Generate unique event ID
    const eventId = `event-${this.event.submarineId}-${Date.now()}-${Math.random()}`;

    return {
      eventId,
      ...this.event
    } as SubmarineEvent;
  }

  /**
   * Create a paired event (attacker/defender) with different faction
   */
  cloneForOpponentFaction(): EventBuilder {
    const clone = new EventBuilder();

    // Copy all properties except faction
    clone.event = { ...this.event };

    // Flip faction
    const opponentFaction = this.event.faction === 'us' ? 'china' : 'us';
    clone.event.faction = opponentFaction;

    return clone;
  }
}
