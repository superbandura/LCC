# Unit System Documentation

## Overview

The Unit System manages military units organized into Task Forces operating within Operational Areas. Units have combat capabilities, damage tracking, and can be enhanced with attached cards.

---

## Unit Structure

### Unit Definition

```typescript
export interface Unit {
  id: string;
  name: string;
  type: string;                  // e.g., "Fighter Aircraft", "Destroyer"
  faction: 'USMC' | 'PLAN';
  category: UnitCategory;

  // Damage/HP system
  damagePoints: number;          // Max HP
  currentDamage: boolean[];      // Damage track (length = damagePoints)

  // Assignment
  taskForceId?: string;          // Assigned task force (optional)

  // Combat capabilities (all optional, undefined = not available)
  attackPrimary?: number;        // Primary attack ammo
  attackPrimaryUsed?: number;    // Primary ammo used
  attackSecondary?: number;      // Secondary attack ammo
  attackSecondaryUsed?: number;  // Secondary ammo used
  interception?: number;         // Interception capacity
  interceptionUsed?: number;     // Interception used
  supply?: number;               // Supply capacity
  supplyUsed?: number;           // Supply used
  groundCombat?: number;         // Ground combat strength
  groundCombatUsed?: number;     // Ground combat used

  // Card attachment
  attachedCard?: string;         // Attached card ID (optional)

  // Command Points Cost (deployment system)
  deploymentCost?: number;       // Command points required to deploy this unit

  // Metadata
  description?: string;
  imagePath?: string;            // e.g., "/images/Unidades USMC/F-35B.jpg"
}
```

### Command Points Cost System

Each unit has an optional deployment cost that represents the command and logistical resources required to deploy it into active operations.

**Field**: `deploymentCost?: number`

**Purpose**: Track command points (PM) spent when deploying units to Task Forces

**Cost Structure**:
- **Create Task Force**: 2 PM (fixed cost)
- **Deploy Task Force**: Sum of all unit `deploymentCost` values
- **Add units to deployed TF**: `deploymentCost` of newly added units
- **Remove units from deployed TF**: 1 PM (fixed cost)
- **Dissolve Task Force**: 1 PM (fixed cost)

**Important Rules**:
- ✅ Points spent are **NEVER recovered** (non-refundable)
- ❌ Cannot deploy if insufficient command points
- ⚠️ Destroyed units with attached cards: Both unit AND card are permanently lost (no PM refund)

**Workflow Example**:
```typescript
// 1. Create Task Force (-2 PM)
const newTF: TaskForce = {
  id: 'tf-001',
  name: 'Alpha Strike',
  faction: 'us',
  operationalAreaId: 'area-001',
  isDeployed: false  // Not yet deployed
};

// 2. Assign units (no cost yet)
const units = [
  { id: 'unit-001', deploymentCost: 5 },
  { id: 'unit-002', deploymentCost: 8 },
  { id: 'unit-003', deploymentCost: 3 }
];

// 3. Deploy Task Force (-(5+8+3) = -16 PM)
// Total cost: 2 + 16 = 18 PM

// 4. Later: Add new unit to deployed TF (-5 PM)
const newUnit = { id: 'unit-004', deploymentCost: 5 };
```

**Implementation** (TaskForceModal.tsx):
- Line ~123: Create TF (deduct 2 PM immediately)
- Line ~364: Deploy TF (calculate and deduct sum of unit costs)
- Line ~262: Add units to deployed TF (charge deployment cost)
- Line ~176: Dissolve TF (deduct 1 PM)
- Line ~319: Remove units (deduct 1 PM if TF is deployed)

**Editor Location**: UnitEncyclopediaModal.tsx includes a field to set `deploymentCost` for each unit (admin only).

### Unit Categories

```typescript
export type UnitCategory =
  | 'air'           // Aircraft (fighters, bombers, helicopters)
  | 'naval'         // Ships (destroyers, carriers, submarines)
  | 'ground'        // Ground forces (infantry, armor, artillery)
  | 'support';      // Support units (logistics, medical)

// Defined in constants/categories.ts
export const UNIT_CATEGORIES = [
  { value: 'air', label: 'Air', emoji: '✈️' },
  { value: 'naval', label: 'Naval', emoji: '⚓' },
  { value: 'ground', label: 'Ground', emoji: '🎖️' },
  { value: 'support', label: 'Support', emoji: '📦' }
];
```

---

## Unit Database

### Current Inventory
- **Total Units**: 96
  - **USMC**: 48 units
  - **PLAN**: 48 units

### Unit Data Storage

**Initial Data**: `data/unitsData.ts` (1,533 lines, auto-generated)

**Live Data**: Firestore `game/current/units` (synced in real-time)

**Sync Command**:
```bash
npm run sync-units
# or
npx tsx syncUnitsFromFirestore.ts
```

---

## Task Force System

### Task Force Definition

```typescript
export interface TaskForce {
  id: string;
  name: string;
  faction: 'us' | 'china';
  operationalAreaId: string | null;  // Null when TF not deployed yet
  isDeployed?: boolean;              // false = created, true = deployed
}
```

**Deployment States**:
- **Created (isDeployed: false)**: Task Force created but not yet deployed to operational area
  - Units can be assigned freely (no PM cost)
  - Area can be changed
  - Must deploy before operations

- **Deployed (isDeployed: true)**: Task Force actively operating in area
  - Adding units costs PM (deploymentCost)
  - Removing units costs 1 PM
  - Area cannot be changed

**Important**: Units are now stored via `taskForceId` field in Unit interface, not in a `units` array on TaskForce.

### Task Force Organization

```
Operational Area
  └── Task Force 1
      ├── Unit A
      ├── Unit B
      └── Unit C
  └── Task Force 2
      ├── Unit D
      └── Unit E
```

### Task Force Management (TaskForceModal)

**UI Layout**:
```
┌──────────────┬────────────────────┐
│              │                    │
│ Task Force   │  Create/Edit Form  │
│    List      │                    │
│   (left)     │      (right)       │
│              │                    │
└──────────────┴────────────────────┘
```

**Left Panel**: List of faction's task forces
- Grouped by operational area
- Supply level indicator (color bar)
- Click to select for editing

**Right Panel**: Create new or edit selected
- Name input
- Area selection dropdown
- Unit assignment checkboxes
- Save/Delete buttons

---

## Supply Level System

### Supply Calculation

**Formula**:
```typescript
const calculateSupplyLevel = (taskForce: TaskForce, units: Unit[]) => {
  const tfUnits = units.filter(u => taskForce.units.includes(u.id));

  // Only count operational units (not destroyed)
  const operationalUnits = tfUnits.filter(unit => {
    const damageCount = unit.currentDamage.filter(d => d).length;
    return damageCount < unit.damagePoints;
  });

  // Sum supply capacities
  const maxCapacity = operationalUnits.reduce((sum, unit) => {
    return sum + (unit.supply || 0);
  }, 0);

  const usedCapacity = operationalUnits.reduce((sum, unit) => {
    return sum + (unit.supplyUsed || 0);
  }, 0);

  const currentCapacity = maxCapacity - usedCapacity;

  // Return percentage (0-100)
  return maxCapacity > 0 ? (currentCapacity / maxCapacity) * 100 : 0;
};
```

### Supply Level Visualization

**Color Gradient**: Red (0%) → Yellow (50%) → Green (100%)

```typescript
const getSupplyColor = (percentage: number) => {
  // HSL: 0 (red) to 120 (green)
  const hue = (percentage / 100) * 120;
  return `hsl(${hue}, 80%, 50%)`;
};
```

**Display**:
```tsx
<div className="w-full bg-gray-700 h-2 rounded">
  <div
    className="h-full rounded transition-all"
    style={{
      width: `${supplyLevel}%`,
      backgroundColor: getSupplyColor(supplyLevel)
    }}
  />
</div>
```

---

## Damage System

### Damage Track

Each unit has a **damage point track** represented as a boolean array:
- `false` = Healthy
- `true` = Damaged

**Example**:
```typescript
{
  damagePoints: 4,
  currentDamage: [false, false, true, false] // Unit has 1 damage point
}
```

### Damage States

1. **Operational**: `damageCount < damagePoints`
   - Unit fully functional
   - Can perform all actions

2. **Damaged**: `damageCount > 0 && damageCount < damagePoints`
   - Unit partially functional
   - May have reduced capabilities (game-specific rules)

3. **Destroyed**: `damageCount === damagePoints`
   - Unit removed from play
   - All damage boxes checked
   - Attached card is lost

### Damage Tracking (UnitDetailModal)

**Checkbox Display**:
```tsx
<div className="flex gap-1">
  {unit.currentDamage.map((damaged, index) => (
    <input
      key={index}
      type="checkbox"
      checked={damaged}
      onChange={() => handleToggleDamage(index)}
      className="w-5 h-5"
    />
  ))}
</div>
```

### Damage Normalization

**CRITICAL**: Always normalize damage arrays to match `damagePoints`:

```typescript
const normalizeDamage = (unit: Unit): Unit => {
  const { damagePoints, currentDamage } = unit;

  if (currentDamage.length === damagePoints) {
    return unit; // Already correct
  }

  if (currentDamage.length < damagePoints) {
    // Pad with false
    return {
      ...unit,
      currentDamage: [
        ...currentDamage,
        ...Array(damagePoints - currentDamage.length).fill(false)
      ]
    };
  }

  // Truncate if too long
  return {
    ...unit,
    currentDamage: currentDamage.slice(0, damagePoints)
  };
};
```

---

## Combat Capabilities

### Capability Types

#### 1. Attack Primary
- Main offensive capability
- E.g., anti-ship missiles, bombs
- **Optional**: `undefined` if not available

#### 2. Attack Secondary
- Secondary offensive capability
- E.g., machine guns, torpedoes
- **Optional**: `undefined` if not available

#### 3. Interception
- Defensive capability
- E.g., air defense, anti-missile
- **Optional**: `undefined` if not available

#### 4. Supply
- Logistics support
- Provides supply points to task force
- **Optional**: `undefined` if not available

#### 5. Ground Combat
- Land warfare capability
- E.g., assault, occupation
- **Optional**: `undefined` if not available

### Capability Usage Tracking

Each capability has a "used" counter:
- `attackPrimary` / `attackPrimaryUsed`
- `attackSecondary` / `attackSecondaryUsed`
- etc.

**Remaining Calculation**:
```typescript
const remainingPrimary = (unit.attackPrimary || 0) - (unit.attackPrimaryUsed || 0);
```

### Resetting Capabilities

**Admin Function**: Reset all "used" counters to 0

```typescript
const handleResetCapabilities = () => {
  const updatedUnits = units.map(unit => ({
    ...unit,
    attackPrimaryUsed: 0,
    attackSecondaryUsed: 0,
    interceptionUsed: 0,
    supplyUsed: 0,
    groundCombatUsed: 0
  }));

  updateUnits(updatedUnits);
};
```

---

## Unit Assignment

### Assigning Units to Task Forces

**From UnitEncyclopediaModal**:
```typescript
const handleAssignUnit = (unitId: string, taskForceId: string) => {
  const updatedUnits = units.map(unit =>
    unit.id === unitId ? { ...unit, taskForceId } : unit
  );

  updateUnits(updatedUnits);
};
```

**From TaskForceModal** (bulk assignment):
```typescript
const handleUpdateTaskForce = (taskForce: TaskForce, selectedUnitIds: string[]) => {
  // Update task force
  const updatedTaskForces = taskForces.map(tf =>
    tf.id === taskForce.id ? { ...taskForce, units: selectedUnitIds } : tf
  );

  updateTaskForces(updatedTaskForces);

  // Update units with taskForceId
  const updatedUnits = units.map(unit => {
    if (selectedUnitIds.includes(unit.id)) {
      return { ...unit, taskForceId: taskForce.id };
    } else if (unit.taskForceId === taskForce.id) {
      return { ...unit, taskForceId: undefined };
    }
    return unit;
  });

  updateUnits(updatedUnits);
};
```

### Orphaned Units Cleanup

**Auto-cleanup** when task force is deleted:

```typescript
// In App.tsx
useEffect(() => {
  const orphanedUnits = units.filter(
    unit => unit.taskForceId && !taskForces.find(tf => tf.id === unit.taskForceId)
  );

  if (orphanedUnits.length > 0) {
    const updatedUnits = units.map(unit =>
      orphanedUnits.includes(unit) ? { ...unit, taskForceId: undefined } : unit
    );
    updateUnits(updatedUnits);
  }
}, [taskForces]); // Run when taskForces changes
```

---

## Unit Encyclopedia (UnitEncyclopediaModal)

### Features
- **Full-screen grid view** of all units
- **Faction filtering** (automatic)
- **Category filtering** (dropdown)
- **Search** by name
- **Create new units** (inline form)
- **Edit units** (click to open UnitDetailModal)

### Grid Display

```tsx
<div className="grid grid-cols-4 gap-4">
  {filteredUnits.map(unit => (
    <UnitCard
      key={unit.id}
      unit={unit}
      onClick={() => handleOpenDetail(unit)}
      showTaskForce={true}
    />
  ))}
</div>
```

### Unit Creation Form

**Fields**:
- Name, Type, Category
- Damage Points (auto-creates damage array)
- Combat capabilities (optional numbers)
- Image path
- Description

**Implementation**:
```typescript
const handleCreateUnit = () => {
  const newUnit: Unit = {
    id: `unit_${Date.now()}`,
    name: newUnitName,
    type: newUnitType,
    faction: selectedFaction,
    category: newUnitCategory,
    damagePoints: newUnitDamagePoints,
    currentDamage: Array(newUnitDamagePoints).fill(false), // Initialize
    // Optional capabilities
    attackPrimary: newUnitAttackPrimary || undefined,
    attackSecondary: newUnitAttackSecondary || undefined,
    // ... other optional fields
  };

  const updatedUnits = [...units, newUnit];
  updateUnits(updatedUnits);
};
```

---

## Unit Detail Modal (UnitDetailModal)

### Tabs
1. **General**: Name, type, faction, category
2. **Combat**: All capabilities with usage tracking
3. **Damage**: Damage track checkboxes
4. **Card**: Attached card info and detach button (admin)

### Admin Functions
- Edit all unit properties
- Toggle damage checkboxes
- Reset capabilities
- Detach card
- Delete unit

---

## Unit Filtering Patterns

### 1. By Faction
```typescript
const factionUnits = useMemo(() => {
  return units.filter(u => u.faction === selectedFaction);
}, [units, selectedFaction]);
```

### 2. By Category
```typescript
const categoryUnits = units.filter(u => u.category === 'air');
```

### 3. By Task Force
```typescript
const taskForceUnits = useMemo(() => {
  if (!taskForce) return [];
  return units.filter(u => taskForce.units.includes(u.id));
}, [units, taskForce]);
```

### 4. By Operational Status
```typescript
const operationalUnits = units.filter(unit => {
  const damageCount = unit.currentDamage.filter(d => d).length;
  return damageCount < unit.damagePoints;
});
```

### 5. Unassigned Units
```typescript
const unassignedUnits = units.filter(u => !u.taskForceId);
```

---

## Image Paths

### Directory Structure
```
/images/
  ├── Unidades USMC/
  │   ├── F-35B Lightning II.jpg
  │   ├── F/A-18E Super Hornet.jpg
  │   └── ...
  └── Unidades PLAN/
      ├── J-15 Flying Shark.jpg
      ├── Type 055 Destroyer.jpg
      └── ...
```

### Image Path Convention
```typescript
unit.imagePath = `/images/Unidades ${faction}/${unit.name}.jpg`;
```

---

## Common Issues & Solutions

### Issue: Damage Array Length Mismatch
**Problem**: Checkbox errors or array index out of bounds
**Cause**: `currentDamage.length !== damagePoints`
**Solution**: Always normalize before rendering

### Issue: Undefined Capabilities
**Problem**: NaN or null in calculations
**Cause**: Using `0` instead of `undefined` for disabled capabilities
**Solution**: Use `undefined` and check with `|| 0` in calculations

### Issue: Units Not Appearing in Task Force
**Problem**: Unit checkboxes in TaskForceModal not showing
**Cause**: Faction filtering incorrect or unit already assigned
**Solution**: Filter by faction and exclude already-assigned units

### Issue: Attached Card Not Showing
**Problem**: 🃏 badge not visible
**Cause**: `attachedCard` is empty string instead of undefined
**Solution**: Use `unit.attachedCard && unit.attachedCard !== ''`

---

## Future Enhancements

### Planned Features
1. **Unit XP System**: Gain experience from combat
2. **Unit Promotions**: Unlock abilities with XP
3. **Unit Fatigue**: Reduced effectiveness after prolonged combat
4. **Unit Morale**: Affected by victories/defeats
5. **Unit Reinforcements**: Replace destroyed units with budget

---

## Related Documentation
- [Architecture](./ARCHITECTURE.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Card System](./CARD_SYSTEM.md)
- [Combat System](./COMBAT_SYSTEM.md)
