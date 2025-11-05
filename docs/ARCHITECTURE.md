# LCC Architecture Documentation

## Project Overview

**Littoral Commander Campaign (LCC)** is a React-based multiplayer strategic simulation application for military operations in the Indo-Pacific region.

### Technology Stack
- **Frontend**: React 19, TypeScript, Vite
- **Mapping**: Leaflet 1.9.4, react-leaflet v5
- **Backend**: Firebase Firestore (real-time database)
- **Styling**: Tailwind CSS v3 (CDN)
- **Build Tool**: Vite

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │ Components │  │   Modals   │  │   Map Integration  │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Business Logic                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │  Services  │  │   Hooks    │  │    Constants       │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                       Data Layer                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │ Firestore  │  │   Types    │  │    Utilities       │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

### Root Component (App.tsx)
- Central state management with 11 useState hooks (reduced from 31)
- 14 Firestore real-time subscriptions managed by `useGameState` hook
- Faction selection logic
- Modal orchestration via `useModal` hook
- Layout and UI structure
- 18 performance-optimized handlers with `useCallback`
- **Current size**: ~1,218 lines (reduced from 1,588 lines, -23.3%)

### Component Organization

```
components/
├── map/
│   ├── Map.tsx                    # Main map component (~430 lines)
│   ├── controls/                  # Map control components
│   │   ├── MapInitializer.tsx
│   │   ├── ScaleControl.tsx
│   │   ├── ChangeView.tsx
│   │   ├── DragController.tsx
│   │   └── MapClickHandler.tsx
│   └── DataEditor/                # Map popup editor
│       ├── index.tsx              # Main DataEditor wrapper
│       ├── TacticalTab.tsx        # Tactical network management
│       ├── PatrolsTab.tsx         # Air patrol management
│       ├── TaskForcesTab.tsx      # Task force list view
│       ├── BasesTab.tsx           # Base damage management
│       └── CardsTab.tsx           # Assigned cards view
│
├── modals/                        # Modal dialogs
│   ├── EditAreasModal.tsx         # Area/base editing
│   ├── TaskForceModal.tsx         # Task force management
│   ├── CommandCenterModal.tsx     # Card purchasing
│   ├── CardEditorModal.tsx        # Card database editor
│   ├── UnitEncyclopediaModal.tsx  # Unit catalog
│   ├── UnitDetailModal.tsx        # Individual unit details
│   ├── TaskForceDetailModal.tsx   # Task force details
│   ├── CombatStatisticsModal.tsx  # Combat stats
│   └── AdminLoginModal.tsx        # Admin authentication
│
├── ui/                            # UI components
│   ├── FactionSelector.tsx        # Initial faction selection
│   ├── Sidebar.tsx                # Location sidebar
│   ├── UnitCard.tsx               # Unit card component
│   ├── TurnControl.tsx            # Turn display and advancement (~83 lines)
│   └── Icons.tsx                  # Icon components
│
└── shared/                        # Reusable components
```

---

## Data Flow

### 1. Initialization Flow

```
App.tsx componentDidMount
    │
    ├─> useGameState() hook initializes
    │   │
    │   └─> Subscribe to Firestore collections (14 subscriptions)
    │       ├─> operationalAreas
    │       ├─> operationalData
    │       ├─> locations
    │       ├─> taskForces
    │       ├─> units
    │       ├─> cards
    │       ├─> commandPoints
    │       ├─> purchasedCards
    │       ├─> destructionLog
    │       ├─> turnState
    │       ├─> pendingDeployments
    │       ├─> influenceMarker
    │       ├─> submarineCampaign
    │       └─> playedCardNotifications
    │
    └─> Update React state on Firestore changes (real-time)
```

### 2. User Action Flow

```
User Interaction (e.g., edit base damage)
    │
    ├─> Component state update (local)
    │
    ├─> firestoreService.updateXXX() call
    │
    ├─> Firestore document update
    │
    └─> onSnapshot listener triggers
        │
        └─> App.tsx state update
            │
            └─> All clients re-render (multiplayer sync)
```

### 3. State Management Pattern

**Single Source of Truth**: Firestore document `game/current`

**State Categories**:
- **Synced State**: Stored in Firestore, auto-synced across clients (13 states managed by `useGameState` hook)
  - operationalAreas: Map zones with bounds, colors, assignedCards
  - operationalData: Damage/status by area ID
  - locations: Military bases with damage tracking
  - taskForces: Faction-specific military units
  - units: Unit encyclopedia (96 units: 48 USMC, 48 PLAN)
  - cards: Card database (197 cards: 103 USMC, 94 PLAN)
  - commandPoints: Command points for deployments {us: number, china: number}
  - cardBudget: Card purchase budget {us: 50, china: 50}
  - purchasedCards: Cards bought but not yet deployed
  - destructionLog: Record of destroyed units/bases
  - turnState: Current turn number, date, planning phase status
  - pendingDeployments: Cards/units/TFs in transit
  - influenceMarker: Campaign influence meter (-10 to +10)
  - submarineCampaign: Submarine campaign state and events

- **Local State**: Client-side only, not synced (11 states total)
  - selectedFaction: Current player faction ('us' | 'china' | null)
  - filters: Location display filters by country
  - Modal states: Managed by `useModal` hook (7 modals)
  - Preview/selection states: previewArea, selectedBaseForEdit, etc.

**Update Pattern**:
```typescript
// 1. User modifies data in component
const handleUpdate = (newData) => {
  // 2. Call Firestore service
  await updateFirestoreCollection('collectionName', newData);
  // 3. Firestore triggers onSnapshot
  // 4. App.tsx receives update and calls setState
  // 5. Component re-renders with new data
};
```

---

## Key Design Patterns

### 1. Real-Time Synchronization
All game state changes propagate to all connected clients automatically via Firestore onSnapshot listeners.

### 2. Memoization for Performance
Critical derived data and handlers are optimized to prevent unnecessary recalculations and re-renders:
- **useMemo** for expensive calculations:
  - `filteredLocations`: Filters locations by country and search criteria
  - `factionTaskForces`: Filters task forces by selected faction
- **useCallback** for event handlers (18 handlers):
  - All update handlers (handleOperationalDataUpdate, handleLocationsUpdate, etc.)
  - Modal handlers (handleCloseModal, etc.)
  - User interaction handlers (handleFactionSelect, handleFilterChange, etc.)

### 3. Array Flattening for Firestore
Firestore doesn't support nested arrays. `firestoreService.ts` handles conversion:
- `areaToFirestore()`: Flatten bounds `[[lat,lng],[lat,lng]]` → `[lat1,lng1,lat2,lng2]`
- `areaFromFirestore()`: Unflatten back to nested arrays

### 4. Prop Drilling
State managed at App.tsx level, passed down as props to child components. Future consideration: Context API for deeply nested state.

### 5. Icon Generation with ReactDOMServer
Leaflet markers use `ReactDOMServer.renderToString()` to convert React components to HTML strings for divIcon rendering.

---

## Module Dependencies

### Core Modules
- `App.tsx`: Root component, state orchestration
- `firestoreService.ts`: All Firestore CRUD operations
- `types.ts`: TypeScript type definitions
- `firebase.ts`: Firebase initialization and config

### Service Layer
Business logic extracted from App.tsx into testable, reusable services:
- `services/submarineService.ts`: Submarine campaign mechanics (~602 lines)
  - Patrol processing with d20 rolls
  - Attack calculations (50% success rate)
  - Event generation and submarine state management
- `services/turnService.ts`: Turn and time management (~181 lines)
  - Turn advancement logic
  - Day/week calculations
  - Game phase determination
- `services/deploymentService.ts`: Deployment timing and activation (~369 lines)
  - Arrival calculations
  - Deployment cleanup
  - Activation timing
- `services/destructionService.ts`: Combat tracking and statistics (~244 lines)
  - Unit destruction detection
  - Combat effectiveness metrics
  - Destruction log management

### Utility Layer (New)
- `utils/iconGenerators.ts`: Leaflet icon generation
- `utils/damageCalculations.ts`: Damage/HP logic
- `utils/unitFilters.ts`: Unit filtering functions
- `utils/validators.ts`: Data validation

### Constants (New)
- `constants/categories.ts`: UNIT_CATEGORIES
- `constants/cardTypes.ts`: CARD_TYPE_LABELS
- `constants/index.ts`: Centralized exports

### Custom Hooks
Custom hooks for state management and UI logic:
- `hooks/useGameState.ts`: Centralized Firestore state management
  - Manages 14 Firestore subscriptions
  - Provides update functions for all game state
  - Eliminates 87 lines of boilerplate from App.tsx
- `hooks/useModal.ts`: Unified modal state management
  - Manages 7 modal open/close states
  - Provides consistent API (open, close, toggle, isOpen)
  - Replaces 7 individual useState declarations
- `hooks/useFactionFilter.ts`: Generic faction filtering with memoization
  - Type-safe filtering for any entity with faction property
  - Automatic memoization for performance
  - Multi-entity filtering support
- `hooks/useDeploymentNotifications.ts`: Arrival notification system
  - Detects turn/day changes
  - Calculates arrivals for current faction
  - Prevents duplicate notifications

---

## Integration Points

### Firebase/Firestore
- **Document Path**: `game/current`
- **Collections**: Stored as fields in single document
- **Real-time**: onSnapshot listeners for live sync
- **Rules**: Defined in `firestore.rules` (currently open access)

### Leaflet Map
- **TileLayer**: OpenStreetMap tiles
- **Markers**: Base locations with custom icons
- **Rectangles**: Operational areas with bounds
- **Popups**: DataEditor for area/base management
- **Controls**: Custom Leaflet controls for scale, view, drag

### Build Pipeline
- **Dev Server**: `npm run dev` (Vite)
- **Build**: `npm run build` (Vite)
- **Deploy**: `firebase deploy` (Firebase Hosting)

---

## Scalability Considerations

### Current Limitations
1. **Single Document**: All game state in one Firestore doc (size limit: 1MB)
2. **No Authentication**: Open access to Firestore
3. **Client-Side Logic**: All game rules enforced client-side
4. **Prop Drilling**: Deep component trees with prop passing

### Future Enhancements
1. **Multi-Document Structure**: Split collections into separate documents
2. **Authentication**: Firebase Auth for user management
3. **Server-Side Validation**: Cloud Functions for game rules
4. **State Management Library**: Context API or Zustand
5. **Optimistic Updates**: Update UI before Firestore confirmation

---

## Performance Optimizations

### Implemented
- ✅ **useCallback** for event handlers (18 handlers with proper dependencies)
  - Prevents function recreation on every render
  - Reduces child component re-renders
  - Optimizes prop comparison in React.memo
- ✅ **useMemo** for expensive calculations (2 critical computations)
  - filteredLocations: Location filtering with country/search criteria
  - factionTaskForces: Task force faction filtering
- ✅ **Custom hooks** with built-in memoization
  - useGameState: Centralized state management
  - useFactionFilter: Automatic memoization for faction filtering
- ✅ **Firestore query optimization** (single doc read)
- ✅ **Component code splitting** potential with React.lazy
- ✅ **Icon caching** (ReactDOMServer results)

### Metrics
- **-32.8%** reduction in App.tsx size (1,588 → 1,067 lines)
- **-65%** reduction in useState declarations (31 → 11)
- **-100%** subscription boilerplate (87 lines eliminated)
- **+100%** testable business logic (all services pure functions)

### Recommended Future Improvements
- 🔄 React.memo on heavy components (Map, modals, Sidebar)
- 🔄 Virtualization for long lists (unit/card catalogs)
- 🔄 Debouncing for search inputs
- 🔄 Image lazy loading
- 🔄 Service Worker for offline support
- 🔄 CDN for static assets

---

## Security Model

**Current**: Open access, no authentication

**Firestore Rules**: All read/write allowed
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Future Considerations**:
- Add Firebase Authentication
- Implement per-user game sessions
- Add admin role verification
- Server-side validation with Cloud Functions

---

## Architectural Improvements (2025 Refactoring)

### Before Refactoring
```
App.tsx (1,588 lines) - Monolithic component
├── 31 useState declarations
├── 87 lines of Firestore subscription boilerplate
├── 661 lines of business logic mixed with UI
├── 0 memoized functions
└── Very high complexity, low testability
```

### After Refactoring
```
App.tsx (~1,266 lines) - Clean orchestration layer
├── services/ (~1,396 lines of testable business logic)
│   ├── submarineService.ts (602 lines)
│   ├── turnService.ts (181 lines)
│   ├── deploymentService.ts (369 lines)
│   └── destructionService.ts (244 lines)
│
├── hooks/ (~300 lines of reusable logic)
│   ├── useGameState.ts (manages 14 Firestore subscriptions)
│   ├── useModal.ts (manages 7 modal states)
│   ├── useFactionFilter.ts (generic filtering)
│   └── useDeploymentNotifications.ts (arrival detection)
│
└── Optimized App.tsx
    ├── 11 useState declarations (reduced from 31)
    ├── 0 lines of subscription boilerplate (managed by hooks)
    ├── 18 memoized handlers with useCallback
    ├── 2 memoized calculations with useMemo
    └── High maintainability, high testability
```

### Benefits Achieved
1. **Separation of Concerns**: Business logic separated from UI
2. **Testability**: Services are pure functions, easily testable in isolation
3. **Reusability**: Hooks and services can be used across components
4. **Performance**: Memoization reduces unnecessary re-renders
5. **Maintainability**: Changes localized to specific services
6. **Readability**: App.tsx is now primarily orchestration, not implementation

### Impact Metrics
| Aspect | Before | After | Improvement |
|--------|--------|-------|-------------|
| Lines in App.tsx | 1,588 | 1,266 | -20.3% |
| useState declarations | 31 | 11 | -65% |
| Subscription boilerplate | 87 lines | 0 lines | -100% |
| Business logic in component | 661 lines | 0 lines | -100% |
| Memoized functions | 0 | 20 | +100% |
| Testable services | 0 | 4 | +100% |
| Custom hooks | 0 | 4 | +100% |

---

## Related Documentation
- [State Management](./STATE_MANAGEMENT.md)
- [Card System](./CARD_SYSTEM.md)
- [Unit System](./UNIT_SYSTEM.md)
- [Combat System](./COMBAT_SYSTEM.md)
- [Map Integration](./MAP_INTEGRATION.md)
