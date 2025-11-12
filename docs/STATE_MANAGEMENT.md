# State Management Documentation

## Overview

LCC uses a **centralized state management** pattern with React hooks and Firestore real-time synchronization.

### Legacy Single-Game Mode
All game state stored in single Firestore document (`game/current`), synced automatically across all connected clients.

### Multi-Game Mode (NEW)
Each game has its own isolated Firestore document (`/games/{gameId}/state`). User authentication required via Firebase Auth. See [Multi-Game Authentication](./MULTI_GAME_AUTH.md) for complete details.

---

## State Architecture

### State Categories

#### 1. Authentication State (Multi-Game Only)
Managed by `AuthContext` provider:

```typescript
// From contexts/AuthContext.tsx
const { currentUser, userProfile, loading, signup, login, logout } = useAuth();

// currentUser: Firebase Auth user object
// userProfile: UserProfile from /users/{uid}
// loading: Auth state loading flag
```

#### 2. Game Selection State (Multi-Game Only)
Managed by `GameContext` provider:

```typescript
// From contexts/GameContext.tsx
const {
  gameId,                    // Selected game ID
  gameMetadata,              // GameMetadata for selected game
  currentPlayerRole,         // 'player' | 'master' | null
  currentPlayerFaction,      // 'us' | 'china' | null
  setGameId,                 // Select/change game
  leaveGame,                 // Leave current game
  isMaster,                  // Helper flag
  isPlayer,                  // Helper flag
  canControlFaction          // Permission check function
} = useGame();
```

#### 3. Synced State (Firestore-backed)
State that persists in Firestore and syncs across all clients in real-time.

```typescript
// In App.tsx (managed by useGameState or useGameStateMultiGame hook - 19 Firestore-synced states)
const [operationalAreas, setOperationalAreas] = useState<OperationalArea[]>([]);
const [operationalData, setOperationalData] = useState<Record<string, OperationalData>>({});
const [locations, setLocations] = useState<Location[]>([]);
const [taskForces, setTaskForces] = useState<TaskForce[]>([]);
const [units, setUnits] = useState<Unit[]>([]);
const [cards, setCards] = useState<Card[]>([]);
const [commandPoints, setCommandPoints] = useState<CommandPoints>({ us: 0, china: 0 });
const [purchasedCards, setPurchasedCards] = useState<PurchasedCards>({ us: [], china: [] });
const [destructionLog, setDestructionLog] = useState<DestructionRecord[]>([]);
const [turnState, setTurnState] = useState<TurnState>(initialTurnState);
const [pendingDeployments, setPendingDeployments] = useState<PendingDeployments>(initialPendingDeployments);
const [influenceMarker, setInfluenceMarker] = useState<InfluenceMarker>({ value: 0 });
const [submarineCampaign, setSubmarineCampaign] = useState<SubmarineCampaignState>(...);
const [playedCardNotifications, setPlayedCardNotifications] = useState<PlayedCardNotification[]>([]);
const [playerAssignments, setPlayerAssignments] = useState<PlayerAssignment | null>(null);
const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>([]);
const [cardPurchaseHistory, setCardPurchaseHistory] = useState<CardPurchaseHistory[]>([]); // Legacy
```

#### 4. Local State (Client-only)
State that exists only on the current client and is not synced.

```typescript
// In App.tsx
const [selectedFaction, setSelectedFaction] = useState<'us' | 'china' | null>(null);
const [filters, setFilters] = useState({
  region: 'all',
  country: 'all',
  status: 'all'
});

// Modal states
const [showEditAreas, setShowEditAreas] = useState(false);
const [showTaskForces, setShowTaskForces] = useState(false);
const [showCommandCenter, setShowCommandCenter] = useState(false);
// ... etc
```

#### 5. Derived State (Computed)
State computed from other state using `useMemo` for performance.

```typescript
// Filtered locations based on user filters
const filteredLocations = useMemo(() => {
  return locations.filter(location => {
    const matchesRegion = filters.region === 'all' || location.region === filters.region;
    const matchesCountry = filters.country === 'all' || location.country === filters.country;
    const matchesStatus = filters.status === 'all' || /* status logic */;
    return matchesRegion && matchesCountry && matchesStatus;
  });
}, [locations, filters]); // CRITICAL: Must include all dependencies

// Faction-specific task forces
const factionTaskForces = useMemo(() => {
  if (!selectedFaction) return [];
  return taskForces.filter(tf => tf.faction === selectedFaction);
}, [taskForces, selectedFaction]);
```

---

## Firestore Synchronization

### Document Structure

#### Legacy Single-Game Mode
```
Firestore:
  └── game/
      └── current/
          ├── operationalAreas: Array<OperationalArea>
          ├── operationalData: Record<string, OperationalData>
          ├── locations: Array<Location>
          ├── taskForces: Array<TaskForce>
          ├── units: Array<Unit>
          ├── cards: Array<Card>
          ├── commandPoints: { us: number, china: number }
          ├── purchasedCards: { us: PurchasedCardInstance[], china: PurchasedCardInstance[] }
          ├── destructionLog: Array<DestructionRecord>
          ├── turnState: TurnState
          ├── pendingDeployments: PendingDeployments
          ├── influenceMarker: InfluenceMarker
          ├── submarineCampaign: SubmarineCampaignState
          ├── playedCardNotifications: Array<PlayedCardNotification>
          ├── playerAssignments: PlayerAssignment | null (legacy, unused in multi-game)
          ├── registeredPlayers: Array<RegisteredPlayer> (legacy, unused in multi-game)
          └── cardPurchaseHistory: Array<CardPurchaseHistory> (legacy)
```

#### Multi-Game Mode (NEW)
```
Firestore:
  ├── users/
  │   └── {uid}/
  │       ├── email: string
  │       ├── displayName: string
  │       ├── role: 'user' | 'admin'
  │       ├── createdAt: string
  │       └── lastLoginAt: string
  │
  └── games/
      └── {gameId}/
          ├── metadata/
          │   ├── name: string
          │   ├── creatorUid: string
          │   ├── status: 'active' | 'archived' | 'completed'
          │   ├── visibility: 'public' | 'private'
          │   ├── players: Record<uid, GamePlayer>
          │   ├── hasPassword: boolean
          │   └── password?: string
          │
          └── state/
              ├── operationalAreas: Array<OperationalArea>
              ├── operationalData: Record<string, OperationalData>
              ├── locations: Array<Location>
              ├── taskForces: Array<TaskForce>
              ├── units: Array<Unit>
              ├── cards: Array<Card>
              ├── commandPoints: { us: number, china: number }
              ├── purchasedCards: { us: PurchasedCardInstance[], china: PurchasedCardInstance[] }
              ├── destructionLog: Array<DestructionRecord>
              ├── turnState: TurnState
              ├── pendingDeployments: PendingDeployments
              ├── influenceMarker: InfluenceMarker
              ├── submarineCampaign: SubmarineCampaignState
              └── playedCardNotifications: Array<PlayedCardNotification>
```

### Subscription Pattern

All Firestore subscriptions are managed by custom hooks:

#### Legacy Single-Game Mode
**useGameState** hook (see `hooks/useGameState.ts`):

```typescript
// In App.tsx (legacy mode)
const gameState = useGameState(/* initial values */); // Returns all 19 Firestore-synced states

// useGameState hook internally manages 19 active subscriptions from game/current:
// 1. subscribeToOperationalAreas
// 2. subscribeToOperationalData
// 3. subscribeToLocations
// 4. subscribeToTaskForces
// 5. subscribeToUnits
// 6. subscribeToCards
// 7. subscribeToCommandPoints
// 8. subscribeToPreviousCommandPoints (command points history tracking)
// 9. subscribeToPurchaseHistory (legacy purchase tracking)
// 10. subscribeToCardPurchaseHistory (legacy card purchase tracking)
// 11. subscribeToPurchasedCards
// 12. subscribeToDestructionLog
// 13. subscribeToTurnState
// 14. subscribeToPendingDeployments
// 15. subscribeToInfluenceMarker
// 16. subscribeToSubmarineCampaign
// 17. subscribeToPlayedCardNotificationsQueue
// 18. subscribeToPlayerAssignments (legacy, for single-game player assignment)
// 19. subscribeToRegisteredPlayers (legacy, for single-game player registration)

// Note: firestoreService.ts has 21 total subscription functions
// useGameState.ts actively uses 19 of them for single-game mode
// Additional functions for multi-game: subscribeToPublicGames, subscribeToGameMetadata

// Total: 19 active subscriptions (encapsulated in useGameState hook)
```

#### Multi-Game Mode (NEW)
**useGameStateMultiGame** hook (see `hooks/useGameStateMultiGame.ts`):

```typescript
// In App.tsx (multi-game mode)
const { gameId } = useGame(); // Get selected game ID from GameContext
const gameState = useGameStateMultiGame(gameId); // Returns all 19 Firestore-synced states

// useGameStateMultiGame hook internally manages 19 active subscriptions from /games/{gameId}/state:
// 1-17: Same as legacy mode (operationalAreas, units, cards, etc.)
// 18-19: playerAssignments, registeredPlayers (NOT USED in multi-game, but still subscribed for compatibility)

// Key differences from legacy hook:
// - Takes gameId parameter for game-scoped subscriptions
// - Subscribes to /games/{gameId}/state instead of game/current
// - Same API surface as useGameState for backward compatibility
// - Used when authentication is enabled (AppWrapper → GameContext)

// Total: 19 active subscriptions (encapsulated in useGameStateMultiGame hook)

// Previous pattern (deprecated - now in useGameState):
// useEffect(() => {
//   const unsubscribeAreas = subscribeToOperationalAreas(setOperationalAreas);
//   const unsubscribeData = subscribeToOperationalData(setOperationalData);
//   // ... 15 more subscriptions
//   return () => {
//     unsubscribeAreas();
//     unsubscribeData();
//     // ... cleanup all 17 subscriptions
//   };
// }, []);
```

**Benefits of useGameState hook**:
- Single source of truth for all Firestore state
- Centralized subscription management
- Easier testing (mock entire hook)
- Cleaner component code (-87 lines in App.tsx)
- Consistent state initialization

### Update Flow

```
┌─────────────┐
│   User      │
│  Action     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│   Component             │
│   handleUpdate(newData) │
└──────┬──────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│   firestoreService.updateXXX()   │
│   (e.g., updateTaskForces)       │
└──────┬───────────────────────────┘
       │
       ▼
┌───────────────────────┐
│   Firestore Write     │
│   doc('game/current') │
└──────┬────────────────┘
       │
       │ (triggers onSnapshot)
       │
       ▼
┌──────────────────────────┐
│  All Connected Clients   │
│  onSnapshot callback     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────┐
│  setState() call │
│  in App.tsx      │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  React Re-render │
│  (all clients)   │
└──────────────────┘
```

---

## Critical Memoization Patterns

### ⚠️ Common Pitfall: Missing Dependencies

**WRONG** ❌:
```typescript
// This will cause stale data!
const filteredLocations = useMemo(() => {
  return locations.filter(/* uses filters */);
}, [locations]); // Missing 'filters' dependency!
```

**CORRECT** ✅:
```typescript
const filteredLocations = useMemo(() => {
  return locations.filter(/* uses filters */);
}, [locations, filters]); // All dependencies included
```

### Common Memoization Scenarios

#### 1. Filtering by Faction
```typescript
const factionUnits = useMemo(() => {
  return units.filter(u => u.faction === selectedFaction);
}, [units, selectedFaction]);
```

#### 2. Filtering by Category
```typescript
const groundUnits = useMemo(() => {
  return units.filter(u => u.category === 'ground');
}, [units]);
```

#### 3. Complex Calculations
```typescript
const totalCommandPoints = useMemo(() => {
  return locations.reduce((sum, loc) => {
    const operational = loc.currentDamage.filter(Boolean).length < loc.damagePoints;
    return sum + (operational ? loc.commandPoints || 0 : 0);
  }, 0);
}, [locations]);
```

---

## State Update Patterns

### 1. Updating Arrays in Firestore

**Add Item**:
```typescript
const handleAddTaskForce = async (newTaskForce: TaskForce) => {
  const updatedTaskForces = [...taskForces, newTaskForce];
  await updateTaskForces(updatedTaskForces);
  // onSnapshot will trigger state update automatically
};
```

**Update Item**:
```typescript
const handleUpdateTaskForce = async (id: string, changes: Partial<TaskForce>) => {
  const updatedTaskForces = taskForces.map(tf =>
    tf.id === id ? { ...tf, ...changes } : tf
  );
  await updateTaskForces(updatedTaskForces);
};
```

**Delete Item**:
```typescript
const handleDeleteTaskForce = async (id: string) => {
  const updatedTaskForces = taskForces.filter(tf => tf.id !== id);
  await updateTaskForces(updatedTaskForces);
};
```

### 2. Updating Nested Data

**Update Unit Damage Array**:
```typescript
const handleToggleDamage = async (unitId: string, index: number) => {
  const updatedUnits = units.map(unit => {
    if (unit.id === unitId) {
      const newDamage = [...unit.currentDamage];
      newDamage[index] = !newDamage[index];
      return { ...unit, currentDamage: newDamage };
    }
    return unit;
  });
  await updateUnits(updatedUnits);
};
```

### 3. Updating Object Fields

**Update Card Budget**:
```typescript
const handlePurchaseCard = async (card: Card) => {
  const faction = card.faction === 'USMC' ? 'us' : 'china';
  const newBudget = {
    ...cardBudget,
    [faction]: cardBudget[faction] - card.cost
  };
  await updateCardBudget(newBudget);
};
```

---

## Side Effects Management

### useEffect Patterns

#### 1. Subscribe on Mount
```typescript
useEffect(() => {
  const unsubscribe = subscribeToCollection((data) => {
    setState(data);
  });

  return () => unsubscribe();
}, []); // Empty array = run once on mount
```

#### 2. React to State Changes
```typescript
useEffect(() => {
  // Cleanup orphaned units when task forces change
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

#### 3. Modal Data Loading
```typescript
useEffect(() => {
  if (isOpen) {
    // Load fresh data when modal opens
    const updatedData = /* fetch or compute data */;
    setLocalData(updatedData);
  }
}, [isOpen]); // Run when modal opens
```

### ⚠️ Common Pitfall: Circular Updates

**WRONG** ❌:
```typescript
// This causes infinite loop!
useEffect(() => {
  setEditedLocations(locations); // Triggers re-render
}, [isOpen, locations]); // locations changes → effect runs → setState → locations changes → ...
```

**CORRECT** ✅:
```typescript
// Only load when modal opens
useEffect(() => {
  if (isOpen) {
    setEditedLocations(locations);
  }
}, [isOpen]); // Only depend on isOpen
```

### 🔄 useRef Pattern for Modal State Sync

**Problem**: Need to sync state when modal opens, but including state in dependencies causes infinite loops.

**Solution**: Use `useRef` to track previous modal state and detect transitions.

**Example** (BoardUnitsModal.tsx):
```typescript
import React, { useState, useEffect, useRef } from 'react';

const BoardUnitsModal = ({ isOpen, currentEmbarkedUnits, transportCard }) => {
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  // Track previous modal open state
  const prevIsOpenRef = useRef(isOpen);

  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    const isNowClosed = !isOpen;

    // Only sync when modal transitions from closed to open
    if (!wasOpen && isNowClosed) {
      setSelectedUnits(
        currentEmbarkedUnits.length > 0
          ? currentEmbarkedUnits
          : Array(transportCard.transportCapacity || 0).fill('')
      );
    }

    // Update ref for next render
    prevIsOpenRef.current = isOpen;
  }, [isOpen, currentEmbarkedUnits, transportCard.transportCapacity]);
  // Note: selectedUnits NOT in dependencies

  return (
    // ... modal UI
  );
};
```

**Why This Works**:
- ✅ `useRef` persists across renders without triggering re-renders
- ✅ Detects modal open transition (false → true)
- ✅ Syncs state only on transition, not on every prop change
- ✅ Avoids infinite loop by NOT including `selectedUnits` in dependencies

**When to Use This Pattern**:
- Modal components that need to sync external state on open
- Forms that need to reset when a different item is selected
- Any component where state sync should happen on specific transitions

---

## State Normalization

### Data Normalization Patterns

#### 1. Remove Undefined Fields
Firestore doesn't store `undefined` values, so they must be removed before write:

```typescript
// In firestoreService.ts
const removeUndefinedFields = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedFields);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = removeUndefinedFields(value);
      }
      return acc;
    }, {} as any);
  }
  return obj;
};
```

#### 2. Flatten Nested Arrays
Firestore doesn't support nested arrays. Operational area bounds must be flattened:

```typescript
// Convert [[lat1, lng1], [lat2, lng2]] → [lat1, lng1, lat2, lng2]
export const areaToFirestore = (area: OperationalArea) => {
  return {
    ...area,
    bounds: area.bounds.flat() // Flatten nested array
  };
};

// Convert [lat1, lng1, lat2, lng2] → [[lat1, lng1], [lat2, lng2]]
export const areaFromFirestore = (data: any): OperationalArea => {
  const bounds = data.bounds || [];
  return {
    ...data,
    bounds: [
      [bounds[0], bounds[1]],
      [bounds[2], bounds[3]]
    ]
  };
};
```

#### 3. Damage Array Normalization
Ensure damage arrays match `damagePoints` length:

```typescript
// Pad or truncate currentDamage to match damagePoints
const normalizeDamageArray = (currentDamage: boolean[], damagePoints: number): boolean[] => {
  if (currentDamage.length === damagePoints) {
    return currentDamage;
  }
  if (currentDamage.length < damagePoints) {
    // Pad with false
    return [...currentDamage, ...Array(damagePoints - currentDamage.length).fill(false)];
  }
  // Truncate
  return currentDamage.slice(0, damagePoints);
};
```

---

## Auto-Save Pattern

### Immediate Firestore Updates

Some components implement auto-save functionality, eliminating the need for manual save buttons.

**Example: DataEditor** (components/map/DataEditor/index.tsx)

```typescript
const handleCheckboxChange = (
  faction: 'us' | 'plan',
  field: 'tacticalNetworkDamage' | 'airPatrolsDamage',
  index: number
) => {
  const newData = { ...data };
  newData[faction][field][index] = !newData[faction][field][index];
  setData(newData);

  // Auto-save: Immediately persist to Firestore
  onSave(areaId, newData);
};

const handleUsedChange = (faction: 'us' | 'plan', used: boolean) => {
  const newData = { ...data };
  newData[faction].airPatrolsUsed = used;
  setData(newData);

  // Auto-save
  onSave(areaId, newData);
};
```

**Benefits**:
- ✅ No "Guardar" button needed
- ✅ Immediate feedback to user
- ✅ Prevents data loss
- ✅ Consistent multiplayer sync
- ✅ Simpler UI

**When to Use**:
- Checkbox toggles
- Simple field updates
- Non-critical operations

**When NOT to Use**:
- Complex multi-field forms (use draft state + save button)
- Operations requiring validation
- Expensive Firestore writes

---

## Date Formatting Utilities

### formatETA Helper Function

Used in multiple components to display arrival dates in Spanish format.

**Pattern** (duplicated in 3 components - candidate for extraction):
```typescript
const formatETA = (eta: { turn: number; day: number } | null): string => {
  if (!eta || !turnState) return 'Fecha desconocida';

  const currentDate = new Date(turnState.currentDate);
  const turnsToAdd = eta.turn - turnState.turnNumber;
  const daysToAdd = (turnsToAdd * 7) + (eta.day - turnState.dayOfWeek);

  const arrivalDate = new Date(currentDate);
  arrivalDate.setDate(arrivalDate.getDate() + daysToAdd);

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  return `${arrivalDate.getDate()} de ${monthNames[arrivalDate.getMonth()]}`;
};
```

**Used In**:
- `components/map/DataEditor/tabs/CardsTab.tsx`
- `components/map/DataEditor/tabs/TaskForcesTab.tsx`
- `components/TaskForceDetailModal.tsx`

**Future Enhancement**: Extract to `utils/dateFormatters.ts` to eliminate duplication.

---

## Pending Deployments

### Overview
The `pendingDeployments` state tracks cards, units, and Task Forces that are in transit and haven't arrived yet. This system implements deployment time mechanics where assets take time to become operational.

### Structure
```typescript
interface PendingDeployments {
  cards: PendingCardDeployment[];
  units: PendingUnitDeployment[];
  taskForces: PendingTaskForceDeployment[];
}

interface PendingCardDeployment {
  cardId: string;
  areaId: string;
  faction: 'us' | 'china';
  deployedAtTurn: number;      // Turn when assigned
  deployedAtDay: number;        // Day (1-7) when assigned
  activatesAtTurn: number;      // Turn when operational
  activatesAtDay: number;       // Day when operational
}
```

### Deployment Flow

**1. Card Deployment**:
```typescript
// User assigns card from purchased cards to operational area
// → Card marked with isPendingDeployment
// → Entry added to pendingDeployments.cards
// → ETA calculated: activatesAtTurn/Day = deployedAt + card.deploymentTime
```

**2. Unit/Task Force Deployment**:
```typescript
// User deploys unit or TF
// → Unit/TF marked with isPendingDeployment
// → Entry added to pendingDeployments.units or .taskForces
// → ETA calculated using default 2-day deployment time
```

**3. Turn Advancement**:
```typescript
// When advancing turn:
// → Check all pending deployments
// → If currentTurn >= activatesAtTurn && currentDay >= activatesAtDay:
//   → Remove isPendingDeployment flag
//   → Remove from pendingDeployments
//   → Show DeploymentNotificationModal
```

### Planning Phase Exception
During **turn 0** (planning phase, `turnState.isPlanningPhase === true`):
- All deployments are **immediate**
- No pending deployments created
- Units/cards/TFs become operational instantly

### State Updates
```typescript
// Adding pending deployment
const newPending: PendingCardDeployment = {
  cardId: card.id,
  areaId: area.id,
  faction: selectedFaction,
  deployedAtTurn: turnState.turnNumber,
  deployedAtDay: turnState.dayOfWeek,
  activatesAtTurn: calculateActivationTurn(...),
  activatesAtDay: calculateActivationDay(...)
};

await updatePendingDeployments({
  ...pendingDeployments,
  cards: [...pendingDeployments.cards, newPending]
});

// Processing arrivals on turn advance
const arrivedCards = pendingDeployments.cards.filter(p =>
  p.activatesAtTurn < newTurn ||
  (p.activatesAtTurn === newTurn && p.activatesAtDay <= newDay)
);

// Remove arrived items and update units/cards/TFs
const remainingPending = {
  cards: pendingDeployments.cards.filter(p => !arrivedCards.includes(p)),
  units: pendingDeployments.units.filter(p => !arrivedUnits.includes(p)),
  taskForces: pendingDeployments.taskForces.filter(p => !arrivedTFs.includes(p))
};

await updatePendingDeployments(remainingPending);
```

### Visualization
- **Map Tooltip**: Shows pending count (🚁 icon)
- **DataEditor Tabs**: Separate sections for pending items
- **Task Force Panel**: Shows "⏳ X" badge for pending units
- **Unit Detail Modal**: Read-only for pending units with transit banner
- **Notification Modal**: Shows arrivals when advancing turn

---

## Multiplayer Considerations

### Conflict Resolution
Currently uses **"last write wins"** strategy. Firestore automatically handles concurrent writes.

**Potential Issues**:
- Two clients modify same data simultaneously
- One client's changes may be overwritten

**Future Enhancement**: Optimistic locking or merge strategies

### Real-Time Sync Guarantees
- ✅ Changes propagate to all clients within ~100-500ms
- ✅ Firestore handles offline/online transitions
- ✅ Local cache provides instant reads
- ❌ No conflict detection
- ❌ No transaction support for complex operations

---

## Performance Best Practices

### 1. Minimize Re-renders
```typescript
// Use memo for expensive derived state
const expensiveCalculation = useMemo(() => {
  return /* heavy computation */;
}, [dependencies]);

// Use callback refs to avoid re-creating functions
const handleUpdate = useCallback((data) => {
  updateData(data);
}, [updateData]);
```

### 2. Batch State Updates
```typescript
// WRONG: Multiple setState calls = multiple re-renders
setUnits(newUnits);
setTaskForces(newTaskForces);
setLocations(newLocations);

// BETTER: Batch in single Firestore write
await updateGameState({
  units: newUnits,
  taskForces: newTaskForces,
  locations: newLocations
});
```

### 3. Debounce Expensive Operations
```typescript
// For search inputs, filter dropdowns, etc.
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    // Expensive search operation
  }, 300),
  []
);
```

---

## Debugging State Issues

### Common Problems and Solutions

#### 1. Stale Data
**Problem**: Component shows old data
**Cause**: Missing dependency in useMemo/useEffect
**Solution**: Check dependencies with React DevTools or ESLint

#### 2. Infinite Loop
**Problem**: Component re-renders infinitely
**Cause**: useEffect with setState and dependency on changing state
**Solution**: Narrow dependencies, use functional setState

#### 3. Data Not Syncing
**Problem**: Changes don't appear on other clients
**Cause**: Not calling Firestore update function
**Solution**: Ensure `updateXXX()` is called, check Firestore console

#### 4. Undefined Values
**Problem**: Data shows undefined in Firestore
**Cause**: Not removing undefined before write
**Solution**: Use `removeUndefinedFields()` helper

---

## Future Improvements

### Planned Enhancements
1. **Custom Hooks**: `useFirestoreCollection()`, `useFactionFilter()`
2. **Context API**: Reduce prop drilling
3. **State Management Library**: Consider Zustand or Jotai
4. **Optimistic Updates**: Update UI before Firestore confirmation
5. **Undo/Redo**: Implement command pattern for state changes

---

## Related Documentation
- [Architecture](./ARCHITECTURE.md)
- [Card System](./CARD_SYSTEM.md)
- [Unit System](./UNIT_SYSTEM.md)
- [Combat System](./COMBAT_SYSTEM.md)
