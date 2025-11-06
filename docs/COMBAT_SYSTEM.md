# Combat System Documentation

## Overview

The Combat System handles damage tracking, unit destruction, combat logging, and tactical operations. It integrates with the Unit System for capabilities and the Card System for enhancements.

---

## Damage Mechanics

### Damage Point System

Each unit and location has:
- **damagePoints**: Maximum HP (health points)
- **currentDamage**: Boolean array tracking damage state

**Example**:
```typescript
{
  damagePoints: 5,
  currentDamage: [false, true, true, false, false]
  // Unit has taken 2 damage (2/5 HP used)
}
```

### Damage States

```typescript
// Calculate current damage
const damageCount = entity.currentDamage.filter(d => d).length;

// Determine state
if (damageCount === 0) {
  // PRISTINE - No damage taken
} else if (damageCount < entity.damagePoints) {
  // DAMAGED - Partially damaged, still operational
} else if (damageCount === entity.damagePoints) {
  // DESTROYED - All damage points used, unit eliminated
}
```

### Visual Representation

**Checkbox Display** (common pattern):
```tsx
<div className="flex gap-1">
  {entity.currentDamage.map((damaged, index) => (
    <div
      key={index}
      className={`w-6 h-6 border-2 ${
        damaged
          ? 'bg-red-600 border-red-800'
          : 'bg-gray-700 border-gray-600'
      }`}
    >
      {damaged && '✕'}
    </div>
  ))}
</div>
```

---

## Unit Combat

### Combat Capabilities

#### Primary Attack (attackPrimary)
- Main offensive weapon system
- Limited ammunition (tracks used rounds)
- Examples: Anti-ship missiles, air-to-air missiles

```typescript
// Check if unit can attack
const canAttack = (unit: Unit) => {
  if (!unit.attackPrimary) return false;
  const used = unit.attackPrimaryUsed || 0;
  return used < unit.attackPrimary;
};

// Perform attack (reduce ammo)
const performAttack = (unit: Unit) => {
  const updatedUnit = {
    ...unit,
    attackPrimaryUsed: (unit.attackPrimaryUsed || 0) + 1
  };
  updateUnits([updatedUnit]);
};
```

#### Secondary Attack (attackSecondary)
- Secondary weapon system
- Separate ammo pool
- Examples: Machine guns, torpedoes

#### Interception (interception)
- Defensive capability
- Intercepts incoming attacks
- Examples: Air defense, anti-missile systems

```typescript
const canIntercept = (unit: Unit) => {
  if (!unit.interception) return false;
  const used = unit.interceptionUsed || 0;
  return used < unit.interception;
};
```

#### Ground Combat (groundCombat)
- Land warfare capability
- Used for assaults and occupation
- Examples: Infantry, armor

### Capability Enhancement via Cards

Cards can boost capabilities when attached:

```typescript
// Card with hpBonus and secondaryAmmoBonus
const card: Card = {
  id: 'card_001',
  isAttachable: true,
  attachableCategory: 'air',
  hpBonus: 2,              // +2 HP
  secondaryAmmoBonus: 1    // +1 secondary ammo
};

// When attached to unit
const enhancedUnit: Unit = {
  ...baseUnit,
  damagePoints: baseUnit.damagePoints + 2,
  currentDamage: [...baseUnit.currentDamage, false, false],
  attackSecondary: (baseUnit.attackSecondary || 0) + 1,
  attachedCard: card.id
};
```

---

## Location/Base Combat

### Base Damage System

Locations (military bases) can be damaged by attacks:

```typescript
interface Location {
  id: string;
  name: string;
  coords: [number, number];
  country: string;
  damagePoints: number;
  currentDamage: boolean[];
  // ... other properties
}
```

### Base Damage Editor (DataEditor BasesTab)

**UI for toggling damage**:
```tsx
<div className="space-y-2">
  {locations.map(location => (
    <div key={location.id} className="flex items-center gap-2">
      <span>{location.name}</span>
      <div className="flex gap-1">
        {location.currentDamage.map((damaged, index) => (
          <input
            key={index}
            type="checkbox"
            checked={damaged}
            onChange={() => handleToggleBaseDamage(location.id, index)}
          />
        ))}
      </div>
    </div>
  ))}
</div>
```

### Base Destruction Effects

When base is destroyed:
- ❌ No longer provides command points
- ❌ Cannot support operations
- ⚠️ May affect task forces in area (game-specific rules)

---

## Operational Data System

### Operational Area Status

Each operational area has associated data:

```typescript
interface OperationalData {
  id: string;                    // Matches OperationalArea.id
  tacticalNetwork: boolean;      // C4ISR network active
  airPatrolStatus: 'active' | 'inactive' | 'pending';
  // ... other tactical properties
}
```

### Tactical Network

**Purpose**: Command, Control, Communications, Computers, Intelligence, Surveillance, Reconnaissance

**Effects**:
- Enhanced coordination
- Better intelligence
- Improved reaction time

**Toggle** (DataEditor TacticalTab):
```typescript
const handleToggleTacticalNetwork = (areaId: string) => {
  const updatedData = operationalData.map(data =>
    data.id === areaId
      ? { ...data, tacticalNetwork: !data.tacticalNetwork }
      : data
  );
  updateOperationalData(updatedData);
};
```

**Visual Indicator** (Map.tsx):
- Active: Green circle icon
- Inactive: Gray circle icon

### Air Patrol Status

**States**:
- `'active'`: Patrol operational (blue indicator)
- `'inactive'`: No patrol (gray indicator)
- `'pending'`: Patrol deploying (yellow indicator)

**Indicator Icons** (Map.tsx:99-163):
```typescript
const getAirPatrolStatusIcon = (status: string) => {
  const colors = {
    active: 'bg-blue-500',
    pending: 'bg-yellow-500',
    inactive: 'bg-gray-500'
  };

  return ReactDOMServer.renderToString(
    <div className={`w-8 h-8 rounded-full ${colors[status]}`}>
      ✈️
    </div>
  );
};
```

**Toggle** (DataEditor PatrolsTab):
```typescript
const handleUpdateAirPatrol = (areaId: string, status: 'active' | 'inactive' | 'pending') => {
  const updatedData = operationalData.map(data =>
    data.id === areaId ? { ...data, airPatrolStatus: status } : data
  );
  updateOperationalData(updatedData);
};
```

---

## Combat Logging

### Combat Log Structure

```typescript
// Stored in Firestore: game/current/combatLog
const combatLog: string[] = [
  "[2024-10-31 14:23] Unit 'F-35B Lightning II' attacked enemy base 'Hainan Naval Base'",
  "[2024-10-31 14:25] Unit 'Type 055 Destroyer' took 2 damage",
  "[2024-10-31 14:30] Unit 'AH-1Z Viper' was destroyed"
];
```

### Logging Combat Events

```typescript
const logCombatEvent = (message: string) => {
  const timestamp = new Date().toLocaleString();
  const logEntry = `[${timestamp}] ${message}`;

  const updatedLog = [...combatLog, logEntry];
  updateCombatLog(updatedLog);
};

// Usage
logCombatEvent(`Unit '${unit.name}' performed primary attack`);
logCombatEvent(`Base '${location.name}' took ${damageAmount} damage`);
logCombatEvent(`Unit '${unit.name}' was destroyed`);
```

### Combat Statistics Modal

**Purpose**: Display combat log and statistics

**Features**:
- Chronological event list
- Faction-specific filtering
- Export log (future feature)

---

## Unit Destruction

### Destruction Logic

```typescript
const isUnitDestroyed = (unit: Unit): boolean => {
  const damageCount = unit.currentDamage.filter(d => d).length;
  return damageCount >= unit.damagePoints;
};
```

### Destruction Consequences

When a unit is destroyed:
1. ❌ **Unit becomes inactive** (but still exists in database)
2. ❌ **Attached card is lost** (no recovery)
3. ❌ **Cannot perform actions**
4. ⚠️ **Task force supply level updates** (destroyed units don't contribute)
5. 📝 **Logged in combat log**

### Tracking Destroyed Units

**App.tsx tracking system** (lines 186-233):
```typescript
// Track destroyed units
useEffect(() => {
  units.forEach(unit => {
    const wasDestroyed = destroyedUnits.has(unit.id);
    const isDestroyed = unit.currentDamage.every(d => d === true);

    if (isDestroyed && !wasDestroyed) {
      // Unit just destroyed
      setDestroyedUnits(prev => new Set(prev).add(unit.id));

      // Log event
      const timestamp = new Date().toLocaleString();
      const logEntry = `[${timestamp}] Unidad destruida: ${unit.name} (${unit.faction})`;

      const taskForce = taskForces.find(tf => tf.id === unit.taskForceId);
      const area = operationalAreas.find(a => a.id === taskForce?.operationalAreaId);

      const detailedLog = area
        ? `${logEntry} en ${area.name}`
        : logEntry;

      updateCombatLog([...combatLog, detailedLog]);
    }
  });
}, [units]); // Run when units change
```

---

## Command Points System

### Command Point Calculation

**Purpose**: Calculate command points from bases with optional influence bonus

**Function Signature** (firestoreService.ts:468-511):
```typescript
/**
 * Calculate command points from bases
 * Command points are reduced proportionally based on damage
 * Influence marker affects final command points: each point = 5% bonus/penalty
 * IMPORTANT: Influence bonus should only be applied at end of week, not mid-week or planning phase
 */
export const calculateCommandPoints = (
  locations: Location[],
  influenceValue: number = 0,
  applyInfluenceBonus: boolean = true  // Control when influence is applied
): CommandPoints => {
  const points: CommandPoints = { us: 0, china: 0 };

  // STEP 1: Calculate base CP from locations
  locations.forEach(loc => {
    if (!loc.commandPoints || loc.commandPoints === 0) return;

    // Calculate damage ratio
    const damageCount = loc.currentDamage.filter(d => d === true).length;
    const damageRatio = damageCount / loc.damagePoints;

    // Calculate effective command points (reduced by damage)
    const effectivePoints = Math.floor(loc.commandPoints * (1 - damageRatio));

    // Add to the appropriate faction
    if (loc.country === 'EE. UU.') {
      points.us += effectivePoints;
    } else if (loc.country === 'China') {
      points.china += effectivePoints;
    }
  });

  // STEP 2: Apply influence modifier ONLY if flag is true
  // Influence bonus: each point = 5% bonus/penalty
  if (applyInfluenceBonus && influenceValue !== 0) {
    const influenceMultiplier = Math.abs(influenceValue) * 0.05;

    if (influenceValue > 0) {
      // Positive influence: US gets bonus, China gets penalty
      points.us = Math.floor(points.us * (1 + influenceMultiplier));
      points.china = Math.floor(points.china * (1 - influenceMultiplier));
    } else {
      // Negative influence: China gets bonus, US gets penalty
      points.china = Math.floor(points.china * (1 + influenceMultiplier));
      points.us = Math.floor(points.us * (1 - influenceMultiplier));
    }
  }

  return points;
};
```

### Command Point Timing & Mechanics

**CRITICAL RULE**: Command points are calculated **ONCE per week** and then **consumed** during the week. They are NOT recalculated mid-week.

#### Calculation Timing

**1. Planning Phase → Turn 1** (NO influence bonus):
```typescript
// App.tsx:641
const newCommandPoints = calculateCommandPoints(locations, 0, false);
// Base CP only, influence bonus NOT applied
```

**2. End of Week (Day 7 → Day 1)** (WITH influence bonus):
```typescript
// App.tsx:783
const newCommandPoints = calculateCommandPoints(locations, influenceMarker.value, true);
// Base CP + influence bonus applied
```

**3. Mid-Week**: Command points are NOT recalculated. They only decrease when spent on:
- Purchasing cards
- Deploying units
- Deploying task forces
- Other operational costs

#### Weekly Cycle Example

```
SUNDAY (End of Week):
  ├─> Calculate base CP from bases: US = 100, China = 120
  ├─> Apply influence bonus (marker = +3):
  │     US: 100 * (1 + 0.3) = 130
  │     China: 120 * (1 - 0.3) = 84
  └─> New week starts with: US = 130, China = 84

MONDAY - SATURDAY (Mid-Week):
  ├─> CP are CONSUMED (not recalculated):
  │     - Buy card (-20 CP)
  │     - Deploy unit (-15 CP)
  │     - Current CP decreases to 95, 69, etc.
  └─> NO recalculation until next Sunday

NEXT SUNDAY:
  └─> Recalculate from bases + influence bonus again
```

### Influence Bonus Formula

**Each influence point = 5% bonus/penalty**

**Examples**:
```typescript
// Base CP: US = 100, China = 100
// Influence = +5 (US advantage)
US: 100 * (1 + 0.25) = 125 CP (+25%)
China: 100 * (1 - 0.25) = 75 CP (-25%)

// Influence = -3 (China advantage)
US: 100 * (1 - 0.15) = 85 CP (-15%)
China: 100 * (1 + 0.15) = 115 CP (+15%)

// Influence = 0 (neutral)
US: 100 CP (no change)
China: 100 CP (no change)
```

### Command Point Display

**Shown in DataEditor CommandPointsTab**:
```tsx
<div className="text-lg font-bold">
  🇺🇸 US Command Points: {commandPoints.us}
  🇨🇳 China Command Points: {commandPoints.china}
</div>
```

---

## Damage Application Workflow

### 1. Manual Damage (Admin)

**From UnitDetailModal**:
```typescript
const handleToggleDamage = (unit: Unit, index: number) => {
  const updatedDamage = [...unit.currentDamage];
  updatedDamage[index] = !updatedDamage[index];

  const updatedUnit = { ...unit, currentDamage: updatedDamage };

  // Check if now destroyed
  if (updatedDamage.every(d => d)) {
    logCombatEvent(`Unit '${unit.name}' was destroyed`);
  }

  updateUnits([updatedUnit]);
};
```

**From DataEditor (bases)**:
```typescript
const handleToggleBaseDamage = (locationId: string, index: number) => {
  const updatedLocations = locations.map(loc => {
    if (loc.id === locationId) {
      const newDamage = [...loc.currentDamage];
      newDamage[index] = !newDamage[index];
      return { ...loc, currentDamage: newDamage };
    }
    return loc;
  });

  updateLocations(updatedLocations);
};
```

### 2. Automated Combat (Future)

**Planned combat resolution system**:
```typescript
const resolveCombat = (attacker: Unit, defender: Unit | Location) => {
  // 1. Check if attacker can attack
  if (!canAttack(attacker)) return;

  // 2. Calculate hit probability
  const hitChance = calculateHitChance(attacker, defender);

  // 3. Roll for hit
  if (Math.random() < hitChance) {
    // 4. Apply damage
    const damageAmount = calculateDamage(attacker);
    applyDamage(defender, damageAmount);

    // 5. Log event
    logCombatEvent(`${attacker.name} hit ${defender.name} for ${damageAmount} damage`);
  }

  // 6. Consume ammunition
  attacker.attackPrimaryUsed = (attacker.attackPrimaryUsed || 0) + 1;
  updateUnits([attacker]);
};
```

---

## Combat Resolution Rules (Future)

### Planned Mechanics

#### 1. Attack Resolution
- Attacker selects target
- System calculates hit chance (based on range, weather, etc.)
- Roll for hit
- Calculate damage
- Apply to target's damage track

#### 2. Interception
- Defender can attempt interception (if capable)
- Consumes interception resource
- Reduces incoming damage or negates attack

#### 3. Range & Line of Sight
- Units can only attack targets within range
- Terrain/obstacles may block attacks
- Air units have extended range

#### 4. Combined Arms
- Bonuses for multiple unit types attacking together
- Ground + Air coordination
- Naval fire support for ground operations

---

## Reset Functions

### Reset Unit Capabilities (Admin)

**Purpose**: Reset all "used" counters at start of new turn

```typescript
const handleResetAllCapabilities = () => {
  const updatedUnits = units.map(unit => ({
    ...unit,
    attackPrimaryUsed: 0,
    attackSecondaryUsed: 0,
    interceptionUsed: 0,
    supplyUsed: 0,
    groundCombatUsed: 0
  }));

  updateUnits(updatedUnits);
  logCombatEvent('All unit capabilities reset for new turn');
};
```

### Reset Combat Log (Admin)

```typescript
const handleClearCombatLog = () => {
  if (confirm('Clear entire combat log?')) {
    updateCombatLog([]);
  }
};
```

---

## Performance Considerations

### Efficient Damage Checks

**WRONG** ❌ (creates new array every render):
```typescript
const isDestroyed = unit.currentDamage.filter(d => d).length === unit.damagePoints;
```

**BETTER** ✅ (use memoization):
```typescript
const destroyedUnits = useMemo(() => {
  return units.filter(unit =>
    unit.currentDamage.every(d => d === true)
  );
}, [units]);
```

### Batch Updates

**WRONG** ❌ (multiple Firestore writes):
```typescript
units.forEach(unit => {
  updateUnits([{ ...unit, attackPrimaryUsed: 0 }]);
});
```

**BETTER** ✅ (single batch write):
```typescript
const updatedUnits = units.map(unit => ({
  ...unit,
  attackPrimaryUsed: 0
}));
updateUnits(updatedUnits);
```

---

## Influence System

### Overview

The Influence System tracks campaign-level progress through a bidirectional meter representing the balance of power between US and China forces. Players use special influence cards with dice roll mechanics to shift the meter, creating a strategic layer beyond tactical combat.

### Influence Marker

**Purpose**: Measure overall campaign success/failure

**Range**: -10 (China advantage) to +10 (US advantage)

**Type Definition** (types.ts:207-209):
```typescript
export interface InfluenceMarker {
  value: number; // Range: -10 to -1 (China) | 0 (neutral) | +1 to +10 (US)
}
```

**State Management**:
```typescript
// In App.tsx
const [influenceMarker, setInfluenceMarker] = useState<InfluenceMarker>({ value: 0 });

// Firestore subscription (App.tsx:187-189)
const unsubscribeInfluenceMarker = subscribeToInfluenceMarker((marker) => {
  setInfluenceMarker(marker);
});
```

**Update Handler**:
```typescript
const handleInfluenceMarkerUpdate = (updatedMarker: InfluenceMarker) => {
  // Clamp value to valid range
  const clampedValue = Math.max(-10, Math.min(10, updatedMarker.value));
  updateInfluenceMarker({ value: clampedValue });
};
```

### Visual Representation

**Component**: `InfluenceTrack.tsx` (128 lines)

**Features**:
- Horizontal track with 21 positions (-10 to +10)
- Color gradient: Red (China) → Yellow (Neutral) → Blue (US)
- Numeric labels at key positions (every 5 steps)
- Current position highlighted with pulsing border
- Status text indicating advantage level

**Color Coding**:
```typescript
const getPositionColor = (position: number): string => {
  if (position < -5) return 'bg-red-700';    // Strong China advantage
  if (position < 0) return 'bg-red-500';     // China advantage
  if (position === 0) return 'bg-yellow-400'; // Neutral
  if (position <= 5) return 'bg-blue-500';    // US advantage
  return 'bg-blue-700';                       // Strong US advantage
};
```

**Display Labels**:
- Position 0: "0 (Neutral)"
- Positions 1-5: "1-5 (Ventaja US)" or "1-5 (Ventaja China)"
- Positions 6-10: "6-10 (Ventaja fuerte US)" or "6-10 (Ventaja fuerte China)"

**Usage in UI**:
```tsx
<InfluenceTrack
  value={influenceMarker.value}
  onChange={isAdmin ? handleInfluenceMarkerUpdate : undefined}
/>
```

### Influence Cards

**Card Properties** (types.ts:114-117):
```typescript
export interface Card {
  // ... other fields
  isInfluenceCard?: boolean;                    // Indicates this card affects influence
  influenceThresholds?: InfluenceThreshold[];   // Dice roll effects
}
```

**Threshold Definition** (types.ts:212-217):
```typescript
export interface InfluenceThreshold {
  minRoll: number;         // Minimum d20 roll (1-20)
  maxRoll: number;         // Maximum d20 roll (1-20)
  influenceEffect: number; // Effect on marker (-10 to +10)
  description: string;     // Effect description (e.g., "Decisive Success (+3)")
}
```

**Example Influence Card**:
```typescript
{
  id: "us-influence-001",
  name: "Diplomatic Breakthrough",
  faction: "us",
  cardType: "intelligence",
  cost: 20,
  isInfluenceCard: true,
  influenceThresholds: [
    { minRoll: 1, maxRoll: 5, influenceEffect: -2, description: "Diplomatic Failure (-2)" },
    { minRoll: 6, maxRoll: 10, influenceEffect: 0, description: "No Effect (0)" },
    { minRoll: 11, maxRoll: 15, influenceEffect: +1, description: "Minor Success (+1)" },
    { minRoll: 16, maxRoll: 19, influenceEffect: +2, description: "Major Success (+2)" },
    { minRoll: 20, maxRoll: 20, influenceEffect: +3, description: "Decisive Success (+3)" }
  ]
}
```

### Dice Roll System

**Component**: `DiceRollModal.tsx` (~200 lines)

**Purpose**: Execute dice rolls for influence cards and apply effects to the influence marker.

**Roll Modes**:
1. **Manual Input**: Player enters result (1-20)
2. **Automatic Roll**: System generates random d20 result with animation

**Workflow**:
```
User plays influence card
    │
    ▼
DiceRollModal opens
    │
    ├─> Select roll mode (manual or automatic)
    │
    ├─> Execute roll
    │   ├─> Manual: Enter number 1-20
    │   └─> Automatic: Generate random result + animation
    │
    ├─> Calculate effect from thresholds
    │   └─> Find matching threshold for roll result
    │
    ├─> Display result and effect
    │   └─> Show description + influence change
    │
    └─> Apply to marker
        └─> Update influence value (clamped to -10/+10)
```

**Implementation**:
```typescript
// Roll d20
const rollD20 = (): number => {
  return Math.floor(Math.random() * 20) + 1;
};

// Find matching threshold
const getInfluenceEffect = (
  roll: number,
  thresholds: InfluenceThreshold[]
): InfluenceThreshold | null => {
  return thresholds.find(
    t => roll >= t.minRoll && roll <= t.maxRoll
  ) || null;
};

// Apply effect
const handleApplyInfluence = (card: Card, roll: number) => {
  const effect = getInfluenceEffect(roll, card.influenceThresholds || []);

  if (effect) {
    const newValue = influenceMarker.value + effect.influenceEffect;
    const clamped = Math.max(-10, Math.min(10, newValue));

    updateInfluenceMarker({ value: clamped });

    // Remove card from area (consumed)
    const updatedArea = {
      ...currentArea,
      assignedCards: currentArea.assignedCards?.filter(id => id !== card.id)
    };
    updateOperationalAreas([updatedArea]);
  }
};
```

### Dice Animation

**Component**: `DiceAnimation.tsx` (~150 lines)

**Purpose**: Visual d20 rolling animation

**Animation Phases**:
1. **Rolling**: Rapid number cycling (0.1s intervals)
2. **Slowing**: Gradual deceleration
3. **Final Result**: Display final number with highlight

**Visual Design**:
- 3D dice icon
- Large numeric display
- Color-coded result (critical on 20, fumble on 1)
- Rotation animation during roll

**Usage**:
```tsx
<DiceAnimation
  isRolling={isRolling}
  result={diceResult}
  onRollComplete={() => setIsRolling(false)}
/>
```

### Playing Influence Cards

**From CommandCenterModal**:
1. Purchase influence card (costs command points)
2. Assign card to operational area

**From DataEditor CardsTab**:
1. Select influence card in area
2. Click "Tirar Dados" (Roll Dice) button
3. DiceRollModal opens
4. Execute roll and apply effect
5. Card is consumed (removed from area)

**Validation**:
```typescript
const canPlayInfluenceCard = (card: Card): boolean => {
  // Must be influence card
  if (!card.isInfluenceCard) return false;

  // Must have thresholds defined
  if (!card.influenceThresholds || card.influenceThresholds.length === 0) {
    return false;
  }

  // Must be in operational area (not pending)
  const area = operationalAreas.find(a =>
    a.assignedCards?.includes(card.id)
  );

  return area !== undefined;
};
```

### Strategic Considerations

**Timing**:
- Influence cards are one-time use
- Results are random (based on d20 roll)
- Plan for both success and failure scenarios

**Risk/Reward**:
- High-cost cards typically have better thresholds
- Critical success (roll 20) often gives maximum effect
- Critical failure (roll 1) may have negative consequences

**Campaign Victory**:
- Reaching +10 or -10 may trigger campaign end conditions
- Influence affects morale, reinforcements, or political support
- Strategic importance increases as campaign progresses

### Database Schema

**Firestore Document** (game/current):
```typescript
{
  influenceMarker: {
    value: 0  // Current influence position (-10 to +10)
  }
}
```

**Card with Influence** (game/current/cards):
```typescript
{
  id: "card-001",
  name: "Media Campaign",
  isInfluenceCard: true,
  influenceThresholds: [
    { minRoll: 1, maxRoll: 8, influenceEffect: -1, description: "Backfires (-1)" },
    { minRoll: 9, maxRoll: 15, influenceEffect: +1, description: "Success (+1)" },
    { minRoll: 16, maxRoll: 20, influenceEffect: +2, description: "Viral Success (+2)" }
  ]
}
```

### Event Logging

**Influence Changes**:
```typescript
const logInfluenceChange = (
  card: Card,
  roll: number,
  effect: InfluenceThreshold,
  oldValue: number,
  newValue: number
) => {
  const timestamp = new Date().toLocaleString();
  const logEntry = `[${timestamp}] Carta de influencia '${card.name}' jugada por ${card.faction}. ` +
    `Tirada: ${roll}. Efecto: ${effect.description}. ` +
    `Influencia: ${oldValue} → ${newValue}`;

  updateCombatLog([...combatLog, logEntry]);
};
```

### UI Integration

**Locations**:
- **CombatStatisticsModal**: Displays current influence marker value
- **DataEditor CardsTab**: Shows "Tirar Dados" button for influence cards
- **CommandCenterModal**: Highlights influence cards in catalog

**Visual Indicators**:
- 🎲 Icon next to influence card name
- Special border color for influence cards in lists
- Influence value displayed prominently in header

### Common Patterns

**Check if Card is Influence Card**:
```typescript
const isInfluenceCard = (card: Card): boolean => {
  return card.isInfluenceCard === true &&
         Array.isArray(card.influenceThresholds) &&
         card.influenceThresholds.length > 0;
};
```

**Format Influence Effect**:
```typescript
const formatInfluenceEffect = (effect: number): string => {
  if (effect > 0) return `+${effect}`;
  if (effect < 0) return `${effect}`;
  return '0';
};
```

**Get Influence Status**:
```typescript
const getInfluenceStatus = (value: number): string => {
  if (value < -5) return 'Ventaja fuerte China';
  if (value < 0) return 'Ventaja China';
  if (value === 0) return 'Neutral';
  if (value <= 5) return 'Ventaja US';
  return 'Ventaja fuerte US';
};
```

### Troubleshooting

#### Issue: Influence Card Doesn't Show Roll Button
**Problem**: Card in area but no "Tirar Dados" button
**Cause**: Missing `isInfluenceCard` flag or empty `influenceThresholds`
**Solution**: Verify card has both properties set in CardEditorModal

#### Issue: Dice Roll Doesn't Apply
**Problem**: Roll completes but influence doesn't change
**Cause**: Effect calculation returns null or update fails
**Solution**: Check thresholds cover full 1-20 range, verify Firestore update

#### Issue: Influence Value Goes Out of Range
**Problem**: Influence shows values > 10 or < -10
**Cause**: Missing clamp in update handler
**Solution**: Always clamp: `Math.max(-10, Math.min(10, value))`

---

## Future Enhancements

### Planned Features
1. **Automated Combat Resolution**: Click-to-attack system
2. **Combat Animations**: Visual feedback for attacks/damage
3. **Damage Types**: Kinetic, explosive, electronic warfare
4. **Armor/Defense Ratings**: Reduce incoming damage
5. **Critical Hits**: Extra damage on lucky rolls
6. **Retreating**: Move damaged units to safety
7. **Repair/Healing**: Restore damage points
8. **Weather Effects**: Affects combat effectiveness
9. **Fog of War**: Hide enemy positions
10. **Turn-Based System**: Structured phases for combat

---

## Related Documentation
- [Architecture](./ARCHITECTURE.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Card System](./CARD_SYSTEM.md)
- [Unit System](./UNIT_SYSTEM.md)
- [Map Integration](./MAP_INTEGRATION.md)
