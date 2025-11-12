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

### Root Component (AppWrapper.tsx)
**NEW**: Multi-game authentication system root component (~110 lines)
- Wraps entire application with authentication and game context providers
- Provides AuthContext (user authentication) and GameContext (game selection)
- Renders ErrorBoundary for application-wide crash protection
- Routes between AuthScreen, GameLobby, and App.tsx based on auth/game state

**Routing Flow**:
1. Not authenticated → `<AuthScreen />` (login/signup)
2. Authenticated, no game selected → `<GameLobby />` (game selection)
3. Authenticated, game selected → `<App />` (game interface)

**Related Documentation**: See [Multi-Game Authentication](./MULTI_GAME_AUTH.md) for complete system details

### Game Component (App.tsx)
- Central state management with 11 useState hooks (reduced from 31)
- 19 active Firestore real-time subscriptions managed by `useGameStateMultiGame` hook (19 total subscription functions)
- Faction selection logic
- Modal orchestration via `useModal` hook
- Layout and UI structure
- 18 performance-optimized handlers with `useCallback`
- **Current size**: ~1,304 lines (reduced from 1,588 lines, -17.9%)

### Component Organization

```
components/
├── AuthScreen.tsx                 # Login/signup interface (multi-game auth)
├── GameLobby.tsx                  # Game selection/creation (multi-game auth)
├── CreateGameModal.tsx            # Create new game modal
├── PasswordPromptModal.tsx        # Join private game modal
├── DeleteGameModal.tsx            # Delete game modal (admin)
├── SuccessModal.tsx               # Success notification modal
├── ErrorBoundary.tsx              # Application-wide error boundary
│
├── map/
│   ├── Map.tsx                    # Main map component (~407 lines)
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
│   └── AdminLoginModal.tsx        # Admin authentication (legacy)
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

### 1. Initialization Flow (Multi-Game System)

```
AppWrapper.tsx mounts
    │
    ├─> AuthProvider initializes (AuthContext)
    │   │
    │   └─> onAuthStateChanged listener
    │       ├─> User logged in? Load UserProfile from /users/{uid}
    │       └─> Update lastLoginAt timestamp
    │
    ├─> GameProvider initializes (GameContext)
    │   │
    │   ├─> Restore gameId from localStorage
    │   └─> Subscribe to GameMetadata for selected game
    │
    └─> AppRouter routing logic
        │
        ├─> No auth? → AuthScreen
        ├─> Auth, no game? → GameLobby
        └─> Auth + game? → App.tsx
            │
            └─> useGameStateMultiGame(gameId) hook initializes
                │
                └─> Subscribe to Firestore collections (19 subscriptions)
                    ├─> operationalAreas
                    ├─> operationalData
                    ├─> locations
                    ├─> taskForces
                    ├─> units
                    ├─> cards
                    ├─> commandPoints
                    ├─> purchasedCards
                    ├─> destructionLog
                    ├─> turnState
                    ├─> pendingDeployments
                    ├─> influenceMarker
                    ├─> submarineCampaign
                    └─> playedCardNotifications
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

**Multi-Game System**:
- **Legacy**: Firestore document `game/current` (single-game mode)
- **Multi-Game**: Firestore documents `/games/{gameId}/state` (multi-game mode)

**State Categories**:
- **Authentication State**: Managed by `AuthContext` (user authentication, profile)
- **Game Selection State**: Managed by `GameContext` (gameId, metadata, player role)
- **Synced State**: Stored in Firestore, auto-synced across clients (19 states managed by `useGameStateMultiGame` hook)
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
- `AppWrapper.tsx`: Application root with auth/game providers
- `App.tsx`: Game interface component, state orchestration
- `firestoreService.ts`: Firestore CRUD operations (legacy, ~1,613 lines)
- `firestoreServiceMultiGame.ts`: Multi-game Firestore operations
- `types.ts`: TypeScript type definitions
- `firebase.ts`: Firebase initialization and config

### Context Providers
- `contexts/AuthContext.tsx`: Firebase Authentication management (~160 lines)
  - User signup/login/logout
  - UserProfile creation and loading
  - First-user admin role assignment
  - Provides: `currentUser`, `userProfile`, `loading`, `signup()`, `login()`, `logout()`
- `contexts/GameContext.tsx`: Game selection and metadata (~95 lines)
  - Game selection with localStorage persistence
  - Real-time game metadata subscription
  - Player role/faction extraction
  - Provides: `gameId`, `gameMetadata`, `currentPlayerRole`, `currentPlayerFaction`, `setGameId()`, `leaveGame()`, `canControlFaction()`

### Service Layer
Business logic extracted from App.tsx into testable, reusable services (138 tests total, ~4,000+ lines):

#### Core Services
- `services/turnService.ts`: Turn and time management (151 lines, 36 tests)
  - Turn advancement logic
  - Day/week calculations
  - Game phase determination
- `services/deploymentService.ts`: Deployment timing and activation (330 lines, 24 tests)
  - Arrival calculations
  - Deployment cleanup
  - Activation timing
- `services/destructionService.ts`: Combat tracking and statistics (217 lines, 33 tests)
  - Unit destruction detection
  - Combat effectiveness metrics
  - Destruction log management

#### Submarine Campaign Services (Modular Architecture)
- `services/submarineCampaignOrchestrator.ts`: Phase coordinator (338 lines)
  - Executes all 5 submarine campaign phases in correct order
  - Ensures state chaining between phases (ASW → Attack → Patrol → Mines → Assets)
  - Single entry point for submarine campaign operations
- `services/submarineService.ts`: Shared utilities (1,118 lines, 27 tests passing)
  - Communication failure checks
  - Tactical network damage calculations
  - ASW ship snapshot management
  - Patrol and attack mechanics
- `services/asw/aswService.ts`: ASW Phase (313 lines)
  - ASW detection with 5% detection rate, 50% elimination rate
  - Three ASW element types: cards, ships, patrol submarines
  - Zone-filtered detection (submarines only detect in same area)
- `services/attack/attackService.ts`: Attack Phase (231 lines)
  - Base attack mechanics with 50% success rate
  - Creates patrol orders on attack completion
- `services/patrol/patrolService.ts`: Patrol Phase (168 lines)
  - Patrol operations with 90% success rate
  - Command point damage to enemy logistics
- `services/mines/mineService.ts`: Mine Phase (290 lines, 9 tests passing)
  - Maritime mine detection: 5% success rate (d20=1)
  - Each mine rolls against each enemy unit in range
  - Creates events for all detection attempts
- `services/assets/assetDeployService.ts`: Asset Deploy Phase (147 lines, 9 tests passing)
  - Processes deploy orders for asset-type cards (mines, sensors)
  - Prevents duplicate asset deployments
  - Marks deploy orders as completed

#### Event System (Unified Pattern)
- `services/events/EventBuilder.ts`: Builder pattern for consistent events (189 lines)
  - Fluent API: `.setSubmarineInfo().setFaction().setEventType().build()`
  - Generates unique IDs, timestamps, turn tracking
  - Unified interface for all submarine campaign events
- `services/events/EventTemplates.ts`: Centralized message templates (123 lines)
  - PatrolTemplates, AttackTemplates, ASWTemplates, MineTemplates
  - Ensures consistent language across all event descriptions

**Test Status**: ✅ 138 passing, 0 failing, 1 skipped

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
Custom hooks for state management and UI logic (~785 lines total):
- `hooks/useGameState.ts`: Centralized Firestore state management - **LEGACY** (279 lines)
  - Single-game mode hook
  - Manages **19 active Firestore subscriptions** for `game/current` document
  - Provides update functions for all game state
  - Subscriptions: operationalAreas, operationalData, locations, taskForces, units, cards, commandPoints, purchasedCards, destructionLog, turnState, pendingDeployments, influenceMarker, submarineCampaign, playedCardNotifications, playerAssignments, registeredPlayers, cardPurchaseHistory
- `hooks/useGameStateMultiGame.ts`: Multi-game Firestore state management - **NEW** (~280 lines)
  - Multi-game mode hook for `/games/{gameId}/state`
  - Takes `gameId` parameter for game-scoped subscriptions
  - Same 19 Firestore subscriptions as legacy hook
  - Used in App.tsx when multi-game authentication is enabled
- `hooks/useModal.ts`: Unified modal state management (129 lines)
  - Manages 7 modal open/close states
  - Provides consistent API (open, close, toggle, isOpen)
  - Replaces 7 individual useState declarations
- `hooks/useFactionFilter.ts`: Generic faction filtering with memoization (103 lines)
  - Type-safe filtering for any entity with faction property
  - Automatic memoization for performance
  - Multi-entity filtering support
- `hooks/useDeploymentNotifications.ts`: Arrival notification system (174 lines)
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

### Current Limitations (Addressed in Multi-Game System)
1. ~~**Single Document**: All game state in one Firestore doc (size limit: 1MB)~~ ✅ **SOLVED** - Multi-game system uses `/games/{gameId}/state` structure
2. ~~**No Authentication**: Open access to Firestore~~ ✅ **SOLVED** - Firebase Authentication with UserProfile system
3. **Client-Side Logic**: All game rules enforced client-side (still applies)
4. **Prop Drilling**: Deep component trees with prop passing (mitigated by Context API)

### Multi-Game System (Implemented)
- ✅ **Authentication**: Firebase Auth with email/password
- ✅ **User Profiles**: UserProfile stored in `/users/{uid}`
- ✅ **Role-Based Access**: Global roles (admin/user) and game roles (master/player)
- ✅ **Game Isolation**: Each game has separate Firestore document
- ✅ **Context Providers**: AuthContext and GameContext for state management
- ✅ **Password Protection**: Optional password-protected private games

### Future Enhancements
1. **Server-Side Validation**: Cloud Functions for game rules
2. **Optimistic Updates**: Update UI before Firestore confirmation
3. **Game Invitations**: Send email invites to specific users
4. **Spectator Mode**: Allow users to watch games without playing
5. **Turn History**: Complete turn-by-turn history viewing

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

### Legacy (Single-Game Mode)
**Status**: Open access, no authentication

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

### Multi-Game Mode (NEW)
**Status**: Firebase Authentication required, role-based access control

**Firestore Rules**: See [MULTI_GAME_AUTH.md](./MULTI_GAME_AUTH.md#security-rules) for complete security rules

**Key Security Features**:
- Users can only read their own profile
- Game creators and admins can write game metadata
- Players can only access games they're members of
- Public games are readable by all authenticated users
- Private games require password verification

**Future Considerations**:
- Server-side validation with Cloud Functions
- Rate limiting for API calls
- Audit logging for admin actions

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

### After Refactoring + Multi-Game System
```
AppWrapper.tsx (~110 lines) - Authentication and routing root
├── contexts/ (~255 lines)
│   ├── AuthContext.tsx (160 lines) - Firebase Auth
│   └── GameContext.tsx (95 lines) - Game selection
│
├── App.tsx (~1,304 lines) - Clean orchestration layer
│   ├── services/ (~3,100+ lines of testable business logic)
│   │   ├── submarineService.ts (1,118 lines)
│   │   ├── turnService.ts (151 lines)
│   │   ├── deploymentService.ts (330 lines)
│   │   └── destructionService.ts (217 lines)
│   │
│   ├── hooks/ (~785 lines of reusable logic)
│   │   ├── useGameState.ts (279 lines, legacy)
│   │   ├── useGameStateMultiGame.ts (280 lines, multi-game)
│   │   ├── useModal.ts (129 lines, manages 7 modals)
│   │   ├── useFactionFilter.ts (103 lines, generic filtering)
│   │   └── useDeploymentNotifications.ts (174 lines, arrival detection)
│   │
│   └── Optimized App.tsx
│       ├── 11 useState declarations (reduced from 31)
│       ├── 0 lines of subscription boilerplate (managed by hooks)
│       ├── 18 memoized handlers with useCallback
│       ├── 2 memoized calculations with useMemo
│       └── High maintainability, high testability
│
└── Multi-Game Components (~6 components)
    ├── AuthScreen.tsx (login/signup)
    ├── GameLobby.tsx (game selection)
    ├── CreateGameModal.tsx
    ├── PasswordPromptModal.tsx
    ├── DeleteGameModal.tsx
    └── SuccessModal.tsx
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
| Lines in App.tsx | 1,588 | 1,304 | -17.9% |
| useState declarations | 31 | 11 | -65% |
| Subscription boilerplate | 87 lines | 0 lines | -100% |
| Business logic in component | 661 lines | 0 lines | -100% |
| Memoized functions | 0 | 20 | +100% |
| Testable services | 0 | 10+ | +100% |
| Custom hooks | 0 | 5 | +100% |
| Authentication | None | Firebase Auth | +100% |
| Multi-game support | None | Full support | +100% |

---

## Related Documentation
- **[Multi-Game Authentication](./MULTI_GAME_AUTH.md)** - Complete multi-game system documentation
- [State Management](./STATE_MANAGEMENT.md) - State patterns and Firestore sync
- [Card System](./CARD_SYSTEM.md) - Card purchase and deployment
- [Unit System](./UNIT_SYSTEM.md) - Units and task forces
- [Combat System](./COMBAT_SYSTEM.md) - Combat mechanics and damage
- [Map Integration](./MAP_INTEGRATION.md) - Leaflet integration
- [Refactoring Log](./REFACTORING_LOG.md) - Change history
