# Transport Card System Documentation

## Overview

Transport cards are a special type of card that can carry units to operational areas. This system enables strategic deployment of units via transport vehicles (ships, aircraft, etc.).

---

## Transport Card Properties

```typescript
export interface Card {
  // ... other fields

  // Transport-specific fields
  isTransport?: boolean;          // Indicates this is a transport card
  transportCapacity?: number;     // Number of units that can be embarked (1-20)
  transportSlots?: string[];      // Types of unit allowed per slot (array length = transportCapacity)
  embarkedUnits?: string[];       // IDs of units currently embarked on this transport
}
```

**Example Transport Card**:
```typescript
{
  id: "us-transport-001",
  name: "LHD Amphibious Assault Ship",
  faction: "USMC",
  cardType: "maneuver",
  cost: 25,
  isTransport: true,
  transportCapacity: 6,
  transportSlots: ["ground", "ground", "ground", "air", "air", "supply"],
  embarkedUnits: ["unit-001", "unit-002", "unit-004"] // 3 units embarked
}
```

---

## Transport Lifecycle

```
┌──────────────────┐
│  Purchase Card   │  ← User purchases transport card in CommandCenterModal
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Board Units     │  ← BoardUnitsModal: Select units to embark
│ (BoardUnitsModal)│  ← Units marked with taskForceId = "EMBARKED_{instanceId}"
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Deploy Card     │  ← Send card with embarked units to operational area
│  to Area         │  ← Card enters pending deployment if deploymentTime > 0
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Card Arrives    │  ← After deploymentTime expires
│  in Area         │  ← embarkedUnits preserved through pending deployment
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Disembark       │  ← DisembarkModal: 3 options for disembarking units
│ (DisembarkModal) │  ← Card is consumed after disembarkation
└──────────────────┘
```

---

## Boarding Units (BoardUnitsModal)

**Location**: `components/BoardUnitsModal.tsx`

**Purpose**: Allow users to select which units to embark on a transport card.

**Key Features**:
- **Slot-based selection**: Each transport slot has a specific unit category requirement
- **Available units filtering**: Only shows unassigned units of matching category
- **Visual indicators**: Slots filled vs. empty, unit details
- **Edit existing**: Can modify existing embarked units

**Implementation**:
```typescript
// BoardUnitsModal.tsx (simplified)
interface BoardUnitsModalProps {
  transportCard: Card;
  currentEmbarkedUnits: string[];  // Existing embarked unit IDs
  availableUnits: Unit[];          // Units that can be embarked
  onSave: (selectedUnitIds: string[]) => void;
  onClose: () => void;
}

const BoardUnitsModal: React.FC<BoardUnitsModalProps> = ({
  transportCard,
  currentEmbarkedUnits,
  availableUnits,
  onSave,
  onClose
}) => {
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  // Sync state when modal opens (useRef pattern to prevent infinite loops)
  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    const isNowClosed = !isOpen;

    if (!wasOpen && isNowClosed) {
      setSelectedUnits(
        currentEmbarkedUnits.length > 0
          ? currentEmbarkedUnits
          : Array(transportCard.transportCapacity || 0).fill('')
      );
    }

    prevIsOpenRef.current = isOpen;
  }, [isOpen, currentEmbarkedUnits, transportCard.transportCapacity]);

  // Filter available units by slot category
  const getUnitsForSlot = (slotIndex: number) => {
    const slotCategory = transportCard.transportSlots?.[slotIndex];
    return availableUnits.filter(u =>
      u.category === slotCategory && !selectedUnits.includes(u.id)
    );
  };

  return (
    <div className="modal">
      {/* Slots UI */}
      {Array.from({ length: transportCard.transportCapacity || 0 }).map((_, idx) => (
        <div key={idx}>
          <label>Slot {idx + 1} ({transportCard.transportSlots?.[idx]})</label>
          <select
            value={selectedUnits[idx] || ''}
            onChange={(e) => {
              const newUnits = [...selectedUnits];
              newUnits[idx] = e.target.value;
              setSelectedUnits(newUnits);
            }}
          >
            <option value="">-- Vacío --</option>
            {getUnitsForSlot(idx).map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.type})
              </option>
            ))}
          </select>
        </div>
      ))}

      <button onClick={() => onSave(selectedUnits.filter(id => id !== ''))}>
        Guardar
      </button>
    </div>
  );
};
```

**Unit Marking**:
When units are embarked, they're assigned a special taskForceId:
```typescript
// CommandCenterModal.tsx
const handleBoardUnits = (cardInstanceId: string, unitIds: string[]) => {
  const updatedUnits = units.map(unit => {
    if (unitIds.includes(unit.id)) {
      return {
        ...unit,
        taskForceId: `EMBARKED_${cardInstanceId}` // Special prefix
      };
    }
    return unit;
  });

  updateUnits(updatedUnits);
};
```

**Orphaned Units Cleanup Exception**:
The `cleanOrphanedUnits` function skips units with `EMBARKED_` prefix:
```typescript
// firestoreService.ts
export const cleanOrphanedUnits = (units: Unit[], taskForces: TaskForce[]): Unit[] => {
  return units.map(unit => {
    // Skip units that are embarked on transport cards
    if (unit.taskForceId?.startsWith('EMBARKED_')) {
      return unit; // Don't clean embarked units
    }

    // ... rest of cleanup logic
  });
};
```

---

## Disembarking Units (DisembarkModal)

**Location**: `components/map/DataEditor/modals/DisembarkModal.tsx` (~450 lines)

**Purpose**: Allow users to distribute embarked units when transport arrives at operational area.

**Three Disembarkation Options**:

### Option A: Single New Task Force
Create one new Task Force with all embarked units.

```typescript
// User inputs:
- New Task Force name

// Result:
- 1 new Task Force created
- All embarked units assigned to it
- Transport card consumed
```

### Option B: Existing Task Force
Integrate all embarked units into an existing Task Force in the area.

```typescript
// User inputs:
- Select existing Task Force (dropdown)

// Result:
- All embarked units added to selected TF
- Transport card consumed
```

### Option C: Mixed Distribution
Manually distribute units between new Task Forces and/or existing Task Forces.

```typescript
// User inputs:
- Create multiple new Task Forces (names)
- Assign units to new TFs (checkboxes)
- Assign units to existing TFs (dropdowns)

// Result:
- Multiple new Task Forces created
- Units distributed as configured
- Transport card consumed
```

**Implementation**:
```typescript
// DisembarkModal.tsx (simplified)
interface NewTaskForceConfig {
  id: string;     // Temporary UI ID
  name: string;
  unitIds: string[];
}

interface DisembarkConfig {
  newTaskForces: NewTaskForceConfig[];
  existingTFAssignments: { unitId: string; taskForceId: string }[];
}

interface DisembarkModalProps {
  card: Card;
  embarkedUnits: Unit[];
  areaTaskForces: TaskForce[];     // TFs already in the operational area
  existingTFNames: string[];       // For duplicate name validation
  onDisembark: (config: DisembarkConfig) => void;
  onCancel: () => void;
}

const DisembarkModal: React.FC<DisembarkModalProps> = ({ ... }) => {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C'>('A');
  const [newTFName, setNewTFName] = useState<string>('');
  const [selectedExistingTFId, setSelectedExistingTFId] = useState<string>('');
  const [newTaskForces, setNewTaskForces] = useState<NewTaskForceConfig[]>([
    { id: 'temp_1', name: '', unitIds: [] }
  ]);
  const [existingAssignments, setExistingAssignments] = useState<Record<string, string>>({});

  const validateAssignments = (): boolean => {
    // Validate all units are assigned
    // Validate no duplicate TF names
    // Validate TF names provided for all non-empty TFs
    return errors.length === 0;
  };

  const handleConfirm = () => {
    if (!validateAssignments()) return;

    let config: DisembarkConfig = {
      newTaskForces: [],
      existingTFAssignments: []
    };

    if (selectedOption === 'A') {
      config.newTaskForces = [{
        id: 'temp_new',
        name: newTFName.trim(),
        unitIds: embarkedUnits.map(u => u.id)
      }];
    } else if (selectedOption === 'B') {
      config.existingTFAssignments = embarkedUnits.map(u => ({
        unitId: u.id,
        taskForceId: selectedExistingTFId
      }));
    } else if (selectedOption === 'C') {
      config.newTaskForces = newTaskForces.filter(ntf => ntf.unitIds.length > 0);
      config.existingTFAssignments = Object.entries(existingAssignments)
        .filter(([_, tfId]) => tfId && tfId !== 'unassigned')
        .map(([unitId, tfId]) => ({ unitId, taskForceId: tfId }));
    }

    onDisembark(config);
  };

  // ... UI rendering
};
```

**Disembarkation Handler**:
```typescript
// DataEditor/index.tsx
const handleDisembarkUnits = (cardId: string, config: DisembarkConfig) => {
  const card = cards.find(c => c.id === cardId);
  if (!card || !card.embarkedUnits) return;

  let updatedUnits = [...units];
  let updatedTaskForces = [...taskForces];

  // Create new task forces
  config.newTaskForces.forEach((ntf) => {
    const realId = `tf_${selectedFaction}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTF: TaskForce = {
      id: realId,
      name: ntf.name,
      faction: selectedFaction,
      operationalAreaId: areaId,
      isDeployed: true,
      isPendingDeployment: false
    };
    updatedTaskForces.push(newTF);

    // Assign units to new TF
    ntf.unitIds.forEach((unitId) => {
      updatedUnits = updatedUnits.map(u =>
        u.id === unitId ? { ...u, taskForceId: realId } : u
      );
    });
  });

  // Assign units to existing TFs
  config.existingTFAssignments.forEach((assignment) => {
    updatedUnits = updatedUnits.map(u =>
      u.id === assignment.unitId
        ? { ...u, taskForceId: assignment.taskForceId }
        : u
    );
  });

  // Remove card from area (consumed)
  const updatedAreas = operationalAreas.map(a => {
    if (a.id === areaId) {
      return {
        ...a,
        assignedCards: (a.assignedCards || []).filter(cId => cId !== cardId)
      };
    }
    return a;
  });

  // Remove embarkedUnits from Card
  const updatedCards = cards.map(c => {
    if (c.id === cardId) {
      const { embarkedUnits, ...rest } = c;
      return rest as Card;
    }
    return c;
  });

  // Save all changes
  onUnitsUpdate(updatedUnits);
  onTaskForcesUpdate(updatedTaskForces);
  onOperationalAreasUpdate(updatedAreas);
  onCardsUpdate(updatedCards);
};
```

---

## Pending Deployment Preservation

**Problem**: Cards with `deploymentTime > 0` arrive without embarked units.

**Solution**: Store `embarkedUnits` in `PendingCardDeployment` and restore when card activates.

**Interface Update**:
```typescript
// types.ts
export interface PendingCardDeployment {
  cardId: string;
  areaId: string;
  faction: 'us' | 'china';
  deployedAtTurn: number;
  deployedAtDay: number;
  activatesAtTurn: number;
  activatesAtDay: number;
  embarkedUnits?: string[];  // ✅ Added to preserve units during transit
}
```

**Creating Pending Deployment**:
```typescript
// App.tsx (handleCardAssignment)
const newPendingCard: PendingCardDeployment = {
  cardId,
  areaId,
  faction: selectedFaction!,
  deployedAtTurn: turnState.turnNumber,
  deployedAtDay: turnState.dayOfWeek,
  activatesAtTurn: timing.activatesAtTurn,
  activatesAtDay: timing.activatesAtDay,
  embarkedUnits: card?.embarkedUnits  // ✅ Preserve embarked units
};
```

**Activating Pending Deployment**:
```typescript
// App.tsx (handleAdvanceTurn)
const deploymentsWithUnits = cardDeployments.filter(
  p => p.embarkedUnits && p.embarkedUnits.length > 0
);

if (deploymentsWithUnits.length > 0) {
  // Restore embarkedUnits to Cards before adding to area
  const updatedCards = cards.map(card => {
    const deployment = deploymentsWithUnits.find(p => p.cardId === card.id);
    if (deployment) {
      return {
        ...card,
        embarkedUnits: deployment.embarkedUnits  // ✅ Restore units
      };
    }
    return card;
  });
  updateCards(updatedCards);
}
```

---

## Transport Card Validation

**Rules**:
- ✅ Units must match slot category (e.g., "ground" slot → ground unit)
- ✅ Units must be unassigned (no taskForceId) or currently embarked on this transport
- ✅ Cannot embark units from enemy faction
- ✅ Cannot embark destroyed units (damageCount >= damagePoints)
- ✅ Cannot embark units already in pending deployment (as part of different transport or TF)

**Filtering Available Units**:
```typescript
const getAvailableUnitsForSlot = (slotCategory: UnitCategory) => {
  return units.filter(unit => {
    // Match category
    if (unit.category !== slotCategory) return false;

    // Match faction
    if (unit.faction !== card.faction) return false;

    // Not destroyed
    const damageCount = unit.currentDamage?.filter(Boolean).length || 0;
    if (damageCount >= unit.damagePoints) return false;

    // Unassigned or embarked on THIS transport
    const isEmbarkedHere = unit.taskForceId === `EMBARKED_${cardInstanceId}`;
    const isUnassigned = !unit.taskForceId;
    if (!isEmbarkedHere && !isUnassigned) return false;

    return true;
  });
};
```

---

## Visual Indicators

**In CommandCenterModal**:
- Transport cards show **embarked unit count** badge
- Example: "🚢 3/6" (3 units embarked out of 6 capacity)

**In TaskForceModal**:
- Embarked units are **excluded** from available units list
- Unit count updates automatically when units are embarked

**In DataEditor CardsTab**:
- Transport cards with embarked units show special icon
- Clicking transport card with units opens DisembarkModal (not CardPlayModal)

---

## Database Schema

**PurchasedCardInstance with embarkedUnits**:
```typescript
// Stored in Firestore: game/current/purchasedCards
{
  us: [
    {
      instanceId: "us-transport-001_1699284567890",
      cardId: "us-transport-001",
      embarkedUnits: ["unit-001", "unit-002", "unit-004"], // Units on board
      purchasedAt: 1699284567890
    }
  ],
  china: [...]
}
```

**Units with EMBARKED_ taskForceId**:
```typescript
// Stored in Firestore: game/current/units
[
  {
    id: "unit-001",
    name: "Infantry Platoon Alpha",
    faction: "us",
    category: "ground",
    taskForceId: "EMBARKED_us-transport-001_1699284567890",  // Special prefix
    // ... other properties
  }
]
```

**PendingCardDeployment with embarkedUnits**:
```typescript
// Stored in Firestore: game/current/pendingDeployments
{
  cards: [
    {
      cardId: "us-transport-001",
      areaId: "area-philippine-sea",
      faction: "us",
      deployedAtTurn: 1,
      deployedAtDay: 3,
      activatesAtTurn: 1,
      activatesAtDay: 5,
      embarkedUnits: ["unit-001", "unit-002", "unit-004"]  // Preserved during transit
    }
  ]
}
```

---

## Common Patterns

### Check if Card is Transport
```typescript
const isTransportCard = (card: Card): boolean => {
  return card.isTransport === true && (card.transportCapacity || 0) > 0;
};
```

### Get Embarked Units from Card Instance
```typescript
const getEmbarkedUnits = (cardInstanceId: string): Unit[] => {
  const cardInstance = purchasedCards[faction].find(
    c => c.instanceId === cardInstanceId
  );

  if (!cardInstance?.embarkedUnits) return [];

  return cardInstance.embarkedUnits
    .map(unitId => units.find(u => u.id === unitId))
    .filter((u): u is Unit => u !== undefined);
};
```

### Count Available Transport Slots
```typescript
const getAvailableSlots = (card: Card, embarkedUnits: string[]): number => {
  const capacity = card.transportCapacity || 0;
  const occupied = embarkedUnits.length;
  return capacity - occupied;
};
```

### Get Units Available for Embarkation
```typescript
const getUnitsForEmbarkation = (faction: Faction, units: Unit[]): Unit[] => {
  return units.filter(unit => {
    // Match faction
    if (unit.faction !== faction) return false;

    // Not already embarked or in task force
    if (unit.taskForceId) return false;

    // Not destroyed
    const damageCount = unit.currentDamage?.filter(Boolean).length || 0;
    if (damageCount >= unit.damagePoints) return false;

    return true;
  });
};
```

---

## Troubleshooting

### Issue: Units Not Appearing in BoardUnitsModal
**Problem**: Available units list is empty
**Cause**: Units already assigned to Task Forces or wrong faction
**Solution**: Ensure units are unassigned (`taskForceId === null`) and match faction

### Issue: Embarked Units Lost After Deployment
**Problem**: Card arrives at area without units
**Cause**: `embarkedUnits` not copied to `PendingCardDeployment`
**Solution**: Ensure `embarkedUnits` field is preserved (App.tsx:570)

### Issue: Infinite Loop When Opening BoardUnitsModal
**Problem**: Modal re-renders infinitely
**Cause**: `useEffect` with `selectedUnits` in dependencies
**Solution**: Use `useRef` pattern to detect modal open transition (see BoardUnitsModal implementation)

### Issue: Orphaned Units Cleanup Removes Embarked Units
**Problem**: Embarked units reset to `taskForceId: null`
**Cause**: `cleanOrphanedUnits` doesn't recognize `EMBARKED_` prefix
**Solution**: Skip cleanup for units with `taskForceId?.startsWith('EMBARKED_')`

### Issue: Can't Disembark Units
**Problem**: DisembarkModal doesn't open or shows error
**Cause**: Card missing `embarkedUnits` or empty array
**Solution**:
- Verify `embarkedUnits` array has unit IDs
- Check units still exist in game state
- Ensure card has valid `transportCapacity`

### Issue: Units Disappear After Disembarkation
**Problem**: Units not visible in Task Force
**Cause**: Task Force creation failed or assignment not saved
**Solution**:
- Check Firestore update was successful
- Verify Task Force has valid `operationalAreaId`
- Ensure units have correct `taskForceId` after disembark

---

## Best Practices

### For Players

**Planning**:
- Choose units carefully based on mission requirements
- Consider slot restrictions when purchasing transport cards
- Account for deployment time when planning operations

**Efficiency**:
- Fill all available slots to maximize transport value
- Mix unit types for tactical flexibility
- Keep transport cards for critical deployments

**Security**:
- Protect transports during deployment time
- Don't disembark in contested areas
- Have backup plans if transport is destroyed

### For Developers

**State Management**:
- Always preserve `embarkedUnits` through pending deployments
- Use special `EMBARKED_` prefix for unit tracking
- Update all related states atomically (units, cards, areas)

**Validation**:
- Check slot category compatibility before boarding
- Validate unit availability (not destroyed, not assigned)
- Ensure faction matching

**UI/UX**:
- Show clear feedback for embarked unit count
- Highlight compatible units in BoardUnitsModal
- Provide clear disembarkation options with explanations

---

## Related Documentation
- [Card System Overview](./CARD_SYSTEM.md) - Core card mechanics and budget
- [Card Attachment System](./CARD_ATTACHMENT.md) - Attaching cards to units
- [Influence Card System](./CARD_INFLUENCE.md) - Influence mechanics
- [Unit System](./UNIT_SYSTEM.md) - Unit categories and management
- [State Management](./STATE_MANAGEMENT.md) - State update patterns
- [Deployment System](./COMBAT_SYSTEM.md#deployment-system) - Pending deployment mechanics
