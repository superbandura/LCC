# ASW (Anti-Submarine Warfare) System Documentation

## Overview

The ASW System implements location-based submarine detection and elimination mechanics. ASW assets deployed in operational areas can detect and destroy submarines operating in the South China Sea abstract area. This system runs as the first phase of submarine operations, eliminating threats before they can execute attacks or patrols.

**Key Concepts**:
- **ASW Elements**: Cards, ships, and patrol submarines with anti-submarine capabilities
- **South China Sea**: Abstract operational area where submarines with attack/patrol orders are considered active
- **Detection Roll**: d20 = 1 (5% success rate)
- **Elimination Roll**: d20 ≤ 10 (50% success rate if detected)

---

## ASW Phase Architecture

### Execution Order

The ASW phase executes FIRST in the submarine operations sequence:

```
Day Advancement:
  1. ASW Phase          ← Submarines eliminated here
  2. Attack Orders      ← Only surviving submarines attack
  3. Week End CP Reset  ← If Sunday
  4. Patrol Orders      ← Only surviving submarines patrol
```

### Location-Based System

ASW is location-based, not abstract:
- **ASW Elements** are located in operational areas or submarine campaign
- **Target Submarines** are in "South China Sea" (abstract area for campaign)
- Submarines are considered "in South China Sea" when they have active attack OR patrol orders

**Why this matters**:
- Submarines sitting idle (no orders) cannot be targeted by ASW
- Attack submarines are vulnerable during their approach
- Patrol submarines are vulnerable while on station

---

## ASW Element Types

### 1. ASW Cards (Submarine Campaign)

Cards deployed to submarine campaign with `submarineType: 'asw'`:

```typescript
const aswCard: SubmarineDeployment = {
  id: 'asw-1',
  submarineName: 'P-8A Surveillance',
  faction: 'us',
  submarineType: 'asw',  // ← ASW type
  status: 'active',
  // ...
};
```

**Examples**:
- US: P-8A Poseidon surveillance aircraft
- China: GX-6 maritime patrol aircraft

### 2. ASW Cards (Operational Areas)

Cards played to operational areas with `submarineType: 'asw'`:

```typescript
const operationalArea: OperationalArea = {
  id: 'area-1',
  name: 'Philippine Sea',
  playedCards: ['asw-card-id'],  // ← ASW card played here
  // ...
};
```

### 3. ASW Ships

Ships with ASW capability in task forces:

**US ASW Ships**:
- ARLEIGH BURKE CLASS DDG
- DDG(X)

**China ASW Ships**:
- TYPE 052D
- TYPE 055 DDG
- TYPE 054 FFG

```typescript
// Check if ship is ASW capable
const isASWCapable = (unitType: string): boolean => {
  const aswShips = [
    'ARLEIGH BURKE CLASS DDG',
    'DDG(X)',
    'TYPE 052D',
    'TYPE 055 DDG',
    'TYPE 054 FFG'
  ];
  return aswShips.includes(unitType);
};
```

### 4. Patrol Submarines

Submarines with active patrol orders can perform ASW against enemy submarines:

```typescript
const patrolSubmarine: SubmarineDeployment = {
  submarineType: 'submarine',
  currentOrder: {
    orderType: 'patrol',  // ← Can do ASW
    status: 'pending',
    targetId: 'south-china-sea',
    // ...
  },
  // ...
};
```

**Dual Purpose**: Patrol submarines both execute patrols AND hunt enemy submarines.

---

## Detection Mechanics

### Target Selection

Each ASW element attempts to detect one random enemy submarine:

```typescript
// 1. Find enemy submarines in South China Sea
const enemySubmarines = submarinesInSouthChinaSea.filter(
  sub => sub.faction !== aswElement.faction &&
         !eliminatedSubmarineIds.includes(sub.id)
);

// 2. Pick random target
const targetSubmarine = enemySubmarines[
  Math.floor(Math.random() * enemySubmarines.length)
];
```

### Two-Stage Roll System

#### Stage 1: Detection Roll

```typescript
const detectionRoll = d20();  // 1-20

if (detectionRoll === 1) {
  // Success! Submarine detected (5% chance)
  proceedToEliminationRoll();
} else {
  // Failed to detect submarine (95% chance)
  noEventsGenerated();
}
```

#### Stage 2: Elimination Roll (if detected)

```typescript
const eliminationRoll = d20();  // 1-20

if (eliminationRoll <= 10) {
  // Submarine eliminated (50% chance)
  submarineStatus = 'destroyed';
  createEliminationEvents();  // 2 events: attacker + defender
} else {
  // Submarine evaded (50% chance)
  createDetectionEvent();     // 1 event: attacker only
}
```

**Combined Probability**:
- Detect AND eliminate: 5% × 50% = 2.5% per ASW element
- Detect but evade: 5% × 50% = 2.5% per ASW element
- No detection: 95% per ASW element

---

## Event Generation

### Event Types

#### 1. Detection Event (Submarine Evaded)

Generated when detection succeeds but elimination fails:

```typescript
{
  eventType: 'detected',
  faction: aswElement.faction,  // Only attacker knows
  description: 'Submarine detected but evaded elimination',
  // No defender event - submarine escaped undetected
}
```

**Visibility**: Only the ASW operator's faction sees this event.

#### 2. Elimination Events (Submarine Destroyed)

Generated when both detection and elimination succeed:

```typescript
// Attacker's perspective
{
  eventType: 'asw_kill',
  faction: aswElement.faction,
  description: `Submarine ${targetName} eliminated by ${aswElementName}`,
  targetInfo: {
    targetId: targetSubmarine.id,
    targetName: targetSubmarine.submarineName,
    targetType: 'submarine'
  }
}

// Defender's perspective
{
  eventType: 'destroyed',
  faction: targetSubmarine.faction,
  description: `Submarine ${targetName} destroyed by ASW forces`,
  targetInfo: {
    targetId: targetSubmarine.id,
    targetName: targetSubmarine.submarineName,
    targetType: 'submarine'
  }
}
```

**Visibility**: Both factions see events (attacker sees kill, defender sees loss).

---

## Code Implementation

### Main ASW Phase Function

```typescript
static async processASWPhase(
  submarineCampaign: SubmarineCampaignState | null,
  currentTurnState: TurnState,
  operationalAreas: OperationalArea[],
  taskForces: TaskForce[],
  units: Unit[],
  cards: Card[]
): Promise<ASWResult> {
  // 1. Identify submarines in South China Sea
  const submarinesInSouthChinaSea = submarineCampaign.deployedSubmarines.filter(
    sub => sub.status === 'active' &&
           sub.submarineType === 'submarine' &&
           sub.currentOrder &&
           (sub.currentOrder.orderType === 'attack' ||
            sub.currentOrder.orderType === 'patrol')
  );

  // 2. Collect ASW elements from multiple sources
  const allASWElements: ASWElement[] = [];

  // ASW cards from submarine campaign
  allASWElements.push(...getASWCardsFromCampaign());

  // ASW cards and ships from operational areas
  for (const area of operationalAreas) {
    allASWElements.push(...getASWCardsInArea(area, cards));
    allASWElements.push(...getASWShipsInArea(area, taskForces, units));
  }

  // Patrol submarines
  allASWElements.push(...getPatrolSubmarines(submarinesInSouthChinaSea));

  // 3. Process detection attempts
  for (const aswElement of allASWElements) {
    const targetSubmarine = selectRandomEnemySubmarine(
      submarinesInSouthChinaSea,
      aswElement.faction,
      eliminatedSubmarineIds
    );

    const detectionRoll = rollD20();
    if (detectionRoll === 1) {
      const eliminationRoll = rollD20();
      if (eliminationRoll <= 10) {
        // Submarine eliminated
        eliminateSubmarine(targetSubmarine);
      } else {
        // Submarine evaded
        createDetectionEvent(aswElement, targetSubmarine);
      }
    }
  }

  return { events, updatedSubmarines, eliminatedSubmarineIds };
}
```

### Helper Functions

#### Get ASW Cards from Area

```typescript
private static getASWCardsInArea(
  area: OperationalArea,
  cards: Card[]
): ASWElement[] {
  if (!area.playedCards) return [];

  return area.playedCards
    .map(instanceId => {
      const baseCardId = instanceId.split('-instance-')[0];
      const card = cards.find(c => c.id === baseCardId);
      return card;
    })
    .filter(card => card?.submarineType === 'asw')
    .map(card => ({
      id: card.id,
      name: card.name,
      faction: card.faction,
      type: 'card' as const,
      areaId: area.id,
      areaName: area.name
    }));
}
```

#### Get ASW Ships from Area

```typescript
private static getASWShipsInArea(
  area: OperationalArea,
  taskForces: TaskForce[],
  units: Unit[]
): ASWElement[] {
  const taskForcesInArea = taskForces.filter(
    tf => tf.operationalAreaId === area.id
  );

  const aswElements: ASWElement[] = [];

  for (const tf of taskForcesInArea) {
    for (const unitId of tf.units) {
      const unit = units.find(u => u.id === unitId);
      if (unit && this.isASWCapable(unit.type)) {
        aswElements.push({
          id: unit.id,
          name: unit.name,
          faction: tf.faction,
          type: 'ship' as const,
          areaId: area.id,
          areaName: area.name
        });
      }
    }
  }

  return aswElements;
}
```

---

## Integration with Submarine Campaign

### Turn Advancement Sequence

```typescript
// In App.tsx handleAdvanceTurn()
const handleAdvanceTurn = async () => {
  // ...

  // STEP 1: Process ASW phase FIRST
  const aswEvents = await processASWPhase(newTurnState);
  console.log(`  ✅ ASW events: ${aswEvents.length}`);

  // STEP 2: Process submarine attacks (only surviving submarines)
  const attackEvents = await processSubmarineAttacks(newTurnState);
  console.log(`  ✅ Attack events: ${attackEvents.length}`);

  // STEP 3: If week completed, recalculate command points
  if (completedWeek) {
    const newCommandPoints = calculateCommandPoints(locations, influenceMarker, true);
    updateCommandPoints(newCommandPoints);
  }

  // STEP 4: Process submarine patrols (only surviving submarines)
  const patrolEvents = await processSubmarinePatrols(newTurnState);
  console.log(`  ✅ Patrol events: ${patrolEvents.length}`);

  // Combine all submarine events
  const currentTurnEvents = [...aswEvents, ...attackEvents, ...patrolEvents];

  if (currentTurnEvents.length > 0) {
    console.log(`📋 Total submarine events: ${currentTurnEvents.length}`);
  }

  // ...
};
```

### State Updates

**Eliminated Submarines**:
```typescript
// Update submarine status
updatedSubmarines = updatedSubmarines.map(sub =>
  sub.id === targetSubmarine.id
    ? { ...sub, status: 'destroyed' as const }
    : sub
);
```

**Kill Counts**:
```typescript
// Increment ASW element's kill count
if (aswElement.type === 'card' || aswElement.type === 'submarine') {
  updatedSubmarines = updatedSubmarines.map(sub =>
    sub.id === aswElement.id
      ? {
          ...sub,
          totalKills: sub.totalKills + 1,
          missionsCompleted: sub.missionsCompleted + 1
        }
      : sub
  );
}
```

---

## Testing

### Test Coverage

**Test File**: `services/submarineService.test.ts`

**ASW Test Cases**:
1. ✓ Return empty result when submarine campaign is null
2. ✓ Return empty result when no ASW cards active
3. ✓ Return empty result when no enemy submarines active
4. ✓ Not detect submarine when roll ≠ 1
5. ✓ Detect but not eliminate when elimination roll > 10
6. ✓ Detect and eliminate when both rolls succeed
7. ✓ Process multiple ASW cards independently
8. ✓ Only target enemy submarines (not same faction)

**Mock Structure**:
```typescript
// Mock detection success (roll = 1) but elimination failure (roll = 12)
let callCount = 0;
Math.random = () => {
  callCount++;
  if (callCount === 1) return 0.0;  // Target selection (index 0)
  if (callCount === 2) return 0.0;  // Detection roll = 1 (success)
  if (callCount === 3) return 0.55; // Elimination roll = 12 (failure, > 10)
  return 0.5;
};
```

**Key Test Requirements**:
- Submarines MUST have `currentOrder` with `orderType: 'attack'` or `'patrol'` to be targetable
- Without orders, submarines are not considered "in South China Sea"

---

## Common Pitfalls

### 1. Submarines Without Orders

**Problem**: Submarine not being targeted by ASW

**Cause**: Missing or inactive `currentOrder`

**Fix**:
```typescript
// ❌ BAD: No order
const submarine: SubmarineDeployment = {
  submarineType: 'submarine',
  status: 'active',
  // Missing currentOrder!
};

// ✅ GOOD: Has patrol order
const submarine: SubmarineDeployment = {
  submarineType: 'submarine',
  status: 'active',
  currentOrder: {
    orderType: 'patrol',  // or 'attack'
    status: 'pending',
    targetId: 'south-china-sea',
    // ...
  },
};
```

### 2. Card Instance IDs vs Base IDs

**Problem**: ASW cards in operational areas not detected

**Cause**: `area.playedCards` contains instance IDs like `"card-123-instance-456"`, but `cards` array has base IDs like `"card-123"`

**Fix**:
```typescript
// Extract base card ID from instance ID
const baseCardId = instanceId.split('-instance-')[0];
const card = cards.find(c => c.id === baseCardId);
```

### 3. Missing ASW Ship Types

**Problem**: Ship with ASW capability not performing ASW

**Cause**: Ship type not in `isASWCapable()` list

**Fix**: Ensure all ASW-capable ships are listed:
```typescript
const aswShips = [
  'ARLEIGH BURKE CLASS DDG',
  'DDG(X)',
  'TYPE 052D',
  'TYPE 055 DDG',
  'TYPE 054 FFG'
];
```

### 4. Execution Order

**Problem**: Submarines executing attacks before ASW phase eliminates them

**Cause**: ASW phase not running first

**Fix**: Ensure ASW runs BEFORE attacks and patrols:
```typescript
// ✅ CORRECT ORDER
const aswEvents = await processASWPhase(turnState);
const attackEvents = await processSubmarineAttacks(turnState);
const patrolEvents = await processSubmarinePatrols(turnState);
```

---

## Console Logging

ASW phase uses minimal logging for clarity:

```typescript
// Summary log (only if eliminations occurred)
console.log(`🎯 ASW: ${eliminatedCount} eliminated (${detectionAttempts} attempts, ${successfulDetections} detected)`);
```

**Example Output**:
```
🎯 ASW: 2 eliminated (15 attempts, 3 detected)
```

**Interpretation**:
- 15 ASW elements attempted detection
- 3 successful detections (roll = 1)
- 2 eliminations (2 of 3 detected submarines eliminated)

---

## Balance Considerations

### ASW Success Rates

**Detection Rate**: 5% (d20 = 1)
- Very rare individual success
- Scales with number of ASW elements
- 10 ASW elements ≈ 40% chance of at least 1 detection

**Elimination Rate**: 50% (d20 ≤ 10)
- Half of detected submarines eliminated
- Half evade (attacker aware, defender unaware)

**Combined Rate**: 2.5% per ASW element
- 1 ASW element: 2.5% kill chance
- 10 ASW elements: 22% kill chance
- 20 ASW elements: 40% kill chance

### Comparison with Patrol Success

**Previous Patrol Success**: 90% (d20 ≤ 18)
**New Patrol Success**: 10% (d20 ≤ 2)

**Why the change**:
- Patrols were too reliable (9 in 10 succeeded)
- ASW provides focused submarine hunting
- Patrols now represent general disruption, not precision strikes

---

## File References

**Implementation**:
- `F:\LCC\services\submarineService.ts:242-376` - processASWPhase()
- `F:\LCC\services\submarineService.ts:768-903` - ASW helper methods
- `F:\LCC\App.tsx:842-843` - ASW phase execution

**Tests**:
- `F:\LCC\services\submarineService.test.ts:658-1083` - ASW test suite (8 tests)

**Related Documentation**:
- [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md) - Damage mechanics
- [UNIT_SYSTEM.md](UNIT_SYSTEM.md) - Unit capabilities and types
- [CARD_SYSTEM.md](CARD_SYSTEM.md) - Card deployment and types
- [ARCHITECTURE.md](ARCHITECTURE.md) - Service layer patterns

---

## Future Enhancements

### Potential Improvements

1. **Variable Detection Rates**: Different ASW elements could have different detection probabilities
2. **Environmental Factors**: Weather, sea state could affect detection
3. **ASW Zones**: Some areas could have better/worse ASW coverage
4. **Submarine Evasion Bonuses**: Certain submarine types could be harder to detect
5. **ASW Fatigue**: ASW elements could degrade effectiveness over time

### Extensibility Points

The ASW system is designed for extension:

```typescript
interface ASWElement {
  id: string;
  name: string;
  faction: Faction;
  type: 'card' | 'ship' | 'submarine';
  areaId?: string;
  areaName?: string;
  // Future: detectionBonus?: number;
  // Future: eliminationBonus?: number;
}
```

Add bonuses without breaking existing code by making them optional fields.
