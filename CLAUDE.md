# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

"Littoral Commander Campaign" (LCC) - React-based interactive map application for military operational areas in the Indo-Pacific region. Built with React 19, TypeScript, Vite, Leaflet/react-leaflet.

## Documentation

Comprehensive system documentation is available in the `/docs` directory. **Always consult these docs before implementing features** to understand patterns and avoid common pitfalls.

### 🗺️ Navigation Index

**Start here**: **[docs/INDEX.md](docs/INDEX.md)** - Complete navigation index with links to specific sections, troubleshooting guide, and component reference. Use this to quickly find relevant documentation without reading entire files.

### 📚 Core Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Project architecture, component hierarchy, data flow, design patterns
- **[docs/MULTI_GAME_AUTH.md](docs/MULTI_GAME_AUTH.md)** - **NEW**: Multi-game authentication system, user profiles, RBAC, game isolation
- **[docs/STATE_MANAGEMENT.md](docs/STATE_MANAGEMENT.md)** - State management patterns, Firestore sync, memoization, side effects
- **Card System** (4 documents):
  - **[docs/CARD_SYSTEM.md](docs/CARD_SYSTEM.md)** - Core card mechanics, budget system, purchase/assignment lifecycle
  - **[docs/CARD_ATTACHMENT.md](docs/CARD_ATTACHMENT.md)** - Card attachment to units, bonuses, detachment rules
  - **[docs/CARD_TRANSPORT.md](docs/CARD_TRANSPORT.md)** - Transport card system, boarding/disembarking units
  - **[docs/CARD_INFLUENCE.md](docs/CARD_INFLUENCE.md)** - Influence cards, thresholds, dice rolls, strategic impact
- **[docs/UNIT_SYSTEM.md](docs/UNIT_SYSTEM.md)** - Unit types, task forces, damage system, combat capabilities
- **[docs/COMBAT_SYSTEM.md](docs/COMBAT_SYSTEM.md)** - Damage mechanics, combat logging, operational data, command points
- **[docs/MAP_INTEGRATION.md](docs/MAP_INTEGRATION.md)** - Leaflet setup, custom controls, icon generation, coordinate system
- **[docs/REFACTORING_LOG.md](docs/REFACTORING_LOG.md)** - Change history, refactoring phases, metrics

### 📖 Efficient Reading Strategy

1. **For specific tasks**: Use [INDEX.md](docs/INDEX.md) to find the exact section you need
2. **For new features**: Read INDEX.md troubleshooting and relevant core doc
3. **For understanding**: Start with ARCHITECTURE.md, then dive into specific systems
4. **For context optimization**: INDEX.md allows selective reading instead of loading entire documents

Utility scripts are documented in **[scripts/README.md](scripts/README.md)**.

## Development Commands

```bash
npm install                     # Install dependencies
npm run dev                     # Dev server (localhost:3000)
npm run build                   # Production build
npm test                        # Run Vitest tests (watch mode)
npm run test:ui                 # Run tests with UI
npm run test:coverage           # Run tests with coverage report
npm run sync-units              # Sync units from Firestore
npx tsx scripts/syncCardsFromFirestore.ts  # Sync cards from Firestore
npx tsx scripts/syncLocationsFromFirestore.ts  # Sync locations from Firestore
firebase login                  # Firebase authentication
firebase deploy                 # Deploy to Firebase
```

## Firebase Configuration

### Multi-Game System (Current)
**Branch**: `feature/multi-game-auth`

Each game has isolated Firestore document at `/games/{gameId}/state`. Requires Firebase Authentication.

**Key Files**:
- `AppWrapper.tsx`: Root component with AuthContext and GameContext providers (~110 lines)
- `contexts/AuthContext.tsx`: Firebase Auth management (~160 lines)
- `contexts/GameContext.tsx`: Game selection and metadata (~95 lines)
- `firestoreService.ts`: Legacy Firestore operations (~1,613 lines, 21 subscription functions)
- `firestoreServiceMultiGame.ts`: Multi-game Firestore operations (user/game management)
- `hooks/useGameStateMultiGame.ts`: Multi-game state hook (~280 lines, 19 active subscriptions)

**Architecture**:
- `AppWrapper`: Routes between AuthScreen → GameLobby → App based on auth/game state
- `AuthContext`: Manages Firebase Authentication, user profiles, first-user admin
- `GameContext`: Manages game selection, player roles, permissions
- `firestoreServiceMultiGame.ts`: User and game management functions
- `hooks/useGameStateMultiGame.ts`: Game-scoped Firestore subscriptions
- `services/`: Business logic layer (10+ modular services organized by domain)

### Legacy Single-Game Mode
All game state stored in Firestore document `game/current` and syncs real-time across clients.

**Files**: `firestoreService.ts` (~1,613 lines), `hooks/useGameState.ts` (~279 lines, 19 subscriptions)

## Architecture

### Project Structure

```
F:\LCC/
├── AppWrapper.tsx          # Root component with auth/game routing (~110 lines)
├── contexts/               # React Context providers (~255 lines)
│   ├── AuthContext.tsx    # Firebase Authentication (~160 lines)
│   └── GameContext.tsx    # Game selection (~95 lines)
├── components/              # React components
│   ├── AuthScreen.tsx      # Login/signup interface (multi-game)
│   ├── GameLobby.tsx       # Game selection/creation (multi-game)
│   ├── CreateGameModal.tsx # Create new game
│   ├── PasswordPromptModal.tsx # Join private game
│   ├── DeleteGameModal.tsx # Delete/archive game (admin)
│   ├── SuccessModal.tsx    # Success notifications
│   ├── ErrorBoundary.tsx   # Application-wide error boundary
│   ├── map/                # Map-related components
│   │   ├── Map.tsx         # Main map component (~407 lines)
│   │   ├── controls/       # Map controls (MapInitializer, ScaleControl, etc.)
│   │   └── DataEditor/     # DataEditor tabs (TacticalTab, PatrolsTab, etc.)
│   ├── modals/             # Modal dialogs
│   ├── ui/                 # UI components
│   └── shared/             # Reusable components
├── hooks/                  # Custom React hooks (~1,065 lines)
│   ├── useGameState.ts    # Firestore state subscriptions - LEGACY (19 active, 279 lines)
│   ├── useGameStateMultiGame.ts # Multi-game Firestore subscriptions (19 active, ~280 lines)
│   ├── useModal.ts        # Modal state management (7 modals, 129 lines)
│   ├── useFactionFilter.ts # Faction-based filtering (103 lines)
│   └── useDeploymentNotifications.ts # Deployment queue notifications (174 lines)
├── services/               # Business logic layer (~4,000+ lines, 138 tests)
│   ├── turnService.ts     # Turn management and capability resets
│   ├── deploymentService.ts # Deployment queue and validation
│   ├── destructionService.ts # Combat destruction logging
│   ├── submarineService.ts # Shared submarine utilities
│   ├── submarineCampaignOrchestrator.ts # Phase coordinator
│   ├── asw/               # ASW Phase service
│   ├── patrol/            # Patrol Phase service
│   ├── attack/            # Attack Phase service
│   ├── mines/             # Mine Phase service
│   ├── assets/            # Asset Deploy Phase service
│   ├── events/            # EventBuilder and EventTemplates
│   └── *.test.ts          # Vitest test files (132 tests)
├── utils/                  # Utility functions
├── constants/              # Shared constants
├── contexts/               # React contexts
├── data/                   # Initial/seed data
├── docs/                   # System documentation
├── scripts/                # Utility scripts
│   ├── archive/           # Archived migration scripts
│   └── README.md          # Scripts documentation
├── public/                 # Static assets
├── types.ts               # TypeScript type definitions
├── App.tsx                # Root component
├── firestoreService.ts    # Firestore operations
├── firebase.ts            # Firebase configuration
└── CLAUDE.md              # This file
```

### Services Layer

Business logic in 10+ modular services (~4,000+ lines, 132 tests):

**Core Services:**
- **turnService.ts** (151 lines, 36 tests): Turn management, week/day calculations, game phase detection
- **deploymentService.ts** (330 lines, 24 tests): Deployment timing, arrival calculations, command point validation
- **destructionService.ts** (217 lines, 33 tests): Destruction tracking, combat statistics, unit revival detection

**Submarine Campaign Services (Modular Architecture):**
- **submarineCampaignOrchestrator.ts** (338 lines): Coordinates all 5 submarine campaign phases in correct sequence
- **submarineService.ts** (1,118 lines, 21 tests): Shared utilities (communication failures, tactical network damage, ASW ship snapshots)
- **asw/aswService.ts** (313 lines): ASW Phase - Detection with 5% rate, 50% elimination, zone filtering
- **attack/attackService.ts** (231 lines): Attack Phase - Base attacks with 50% success rate
- **patrol/patrolService.ts** (168 lines): Patrol Phase - Patrol operations with 90% success rate
- **mines/mineService.ts** (290 lines, 9 tests): Mine Phase - Maritime mine detection (5% rate, d20=1)
- **assets/assetDeployService.ts** (132 lines, 9 tests): Asset Deploy Phase - Processes deploy orders for mines/sensors
- **events/EventBuilder.ts** (189 lines): Builder pattern for consistent event creation across all services
- **events/EventTemplates.ts** (123 lines): Centralized message templates (Patrol, Attack, ASW, Mine)

All services pure functions with comprehensive Vitest coverage. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

### Custom Hooks

Four hooks reduce component complexity and centralize logic (~736 lines total):
- **useGameState** (279 lines): Manages **19 active Firestore subscriptions**, single source of truth for all game state
- **useModal** (148 lines): Unified API for 7 modal states (`open()`, `close()`, `toggle()`, `isOpen()`)
- **useFactionFilter** (111 lines): Memoized faction filtering for units, cards, task forces
- **useDeploymentNotifications** (198 lines): Auto-opens modal when deployments queued

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for implementation details.

### State Management

State architecture has been refactored into custom hooks and services:

**useGameState Hook** (`hooks/useGameState.ts`):
Centralized hook encapsulating 14 Firestore subscriptions:
- `operationalAreas`: Map zones with bounds, colors, assignedCards, playedCards
- `operationalData`: Damage/status by area ID
- `locations`: Military bases with damage tracking
- `taskForces`: Faction-specific military units
- `units`: Unit encyclopedia (96 units: 48 USMC, 48 PLAN)
- `cards`: Card database (197 cards: 103 USMC, 94 PLAN)
- `commandPoints`: {us: 50, china: 50} (replaces cardBudget)
- `purchasedCards`: {us: Card[], china: Card[]} - faction-specific purchased cards
- `destructionLog`: DestructionRecord[] - combat destruction history
- `turnState`: TurnState - current turn and phase information
- `pendingDeployments`: {cards: [], taskForces: [], units: []} - deployment queue
- `influenceMarker`: InfluenceMarker - influence zone state
- `submarineCampaign`: SubmarineCampaignState - submarine warfare state
- `playedCardNotifications`: PlayedCardNotification[] - queue of played card notifications for both players

**App.tsx Local State** (~1,276 lines):
- `selectedFaction`: 'us' | 'china' | null
- `filters`: Country visibility filters for sidebar
- Modal states: Managed by `useModal` hook (7 modals)

**Critical Memoizations**:
- `filteredLocations`: MUST include `filters` AND `locations` in deps
- `factionTaskForces`: Filters by `selectedFaction`

**Real-time Sync**: All 14 states sync via Firestore `onSnapshot` listeners in `useGameState` hook

### Data Model (types.ts)

**Location**: `coords`, `country`, `damagePoints`, `currentDamage[]` (length must match damagePoints)

**OperationalArea**: `id`, `name`, `bounds: [[lat,lng],[lat,lng]]`, `color`, `fillOpacity`, `assignedCards?: string[]`

**TaskForce**: `id`, `name`, `faction`, `operationalAreaId`, `units: string[]`

**Unit**: `id`, `name`, `type`, `faction`, `category`, `damagePoints`, `currentDamage[]`, `taskForceId?`, `attachedCard?`
- Optional capabilities (number | undefined): `attackPrimary/Used`, `attackSecondary/Used`, `interception/Used`, `supply/Used`, `groundCombat/Used`

**Card**: `id`, `name`, `faction`, `cardType`, `cost`, `imagePath`
- Attachment fields: `isAttachable?`, `attachableCategory?`, `hpBonus?`, `secondaryAmmoBonus?`

**CardType**: 'attack' | 'maneuver' | 'interception' | 'intelligence' | 'communications'

**CommandPoints**: `{ us: number, china: number }` - Faction command point budgets (replaces legacy cardBudget)

**PurchasedCards**: `{ us: Card[], china: Card[] }` - Faction-specific purchased card inventories

**DestructionRecord**: `{ id, unitId?, locationId?, timestamp, turn, faction, destroyedBy? }` - Combat destruction logs

**TurnState**: `{ currentDate: string, dayOfWeek: number, turnNumber: number, isPlanningPhase: boolean }` - Turn tracking

**PendingDeployments**: `{ cards: [], taskForces: [], units: [] }` - Deployment queue with activation timing

**InfluenceMarker**: `{ position: LatLng, faction: Faction, lastUpdated: string }` - Strategic influence position

**SubmarineCampaignState**: `{ deployedSubmarines: Submarine[], events: SubmarineEvent[], usedSubmarineNames: Record<Faction, Set<string>> }` - Submarine warfare state

**Important**: Firestore doesn't support nested arrays. `firestoreService.ts` flattens/unflattens `bounds` arrays.

### Components

- **AppWrapper.tsx**: Application root (~110 lines), provides AuthContext and GameContext, routes between AuthScreen/GameLobby/App
- **App.tsx**: Game interface component (~1,304 lines), uses `useGameStateMultiGame` and `useModal` hooks, faction selection, layout, memoized filters
- **Map.tsx**: Leaflet map (~407 lines) with markers, rectangles, popups, DataEditor
  - Air patrol indicators (blue/red/gray circles, 35x35px)
  - DataEditor with 5 tabs: TacticalTab, PatrolsTab, ForcesTab, CommandPointsTab, CardsTab
- **Sidebar.tsx**: Location list with region grouping and filters
- **EditAreasModal.tsx**: Two tabs - Areas (bounds/colors) and Bases (CRUD operations)
- **TaskForceModal.tsx**: Left panel (list), Right panel (create/edit), faction-filtered
- **CommandCenterModal.tsx**: Three panels - Catalog, Viewer, Purchased cards
- **CardEditorModal.tsx**: Inline editing table + preview panel
- **UnitEncyclopediaModal.tsx**: Full-screen grid view + creation form
- **DeploymentNotificationModal.tsx**: Shows pending deployments, execute/cancel actions
- **FactionSelector.tsx**: Initial faction selection screen

### UI Buttons (bottom-right, top to bottom)

1. Green "CC": CommandCenterModal
2. Red "TF": TaskForceModal
3. Blue Edit: EditAreasModal
4. Cyan Location: Geolocation

### Data Files (data/)

Initial seed data only. After `initializeGameData()`, all changes persist in Firestore.
- `locations.ts`, `operationalAreas.ts`, `operationalData.ts`, `taskForces.ts`, `units.ts`, `cards.ts`, `mapLayers.ts`

### Key Patterns

- **Real-time Sync**: 14 `onSnapshot` listeners in `useGameState` hook update state automatically
- **Array Flattening**: Nested arrays converted for Firestore (firestoreService.ts)
- **Custom Hooks**: State management logic extracted to hooks (useGameState, useModal, useFactionFilter, useDeploymentNotifications)
- **Service Layer**: Business logic in pure functions (turnService, deploymentService, destructionService, submarineService)
- **Memoization**: `useMemo` for filtered/derived data, `useCallback` for event handlers (18 callbacks in App.tsx)
- **Live Preview**: EditAreasModal uses `onPreview` callback
- **Icon Rendering**: `ReactDOMServer.renderToString()` for Leaflet divIcons (utility in utils/iconGenerators.ts)
- **Faction Filtering**: Task Forces filtered at App.tsx level before passing to modal

## Critical Implementation Notes

### ⚠️ Most Common Pitfalls

1. **Firestore Arrays**: Never write directly to Firestore - always use `firestoreService` functions
   - Operational area `bounds`: Use `areaToFirestore()` / `areaFromFirestore()` for nested array conversion
   - See: [docs/MAP_INTEGRATION.md § Array Flattening](docs/MAP_INTEGRATION.md)

2. **Damage Arrays**: Must normalize `currentDamage` length to match `damagePoints` before rendering
   - Missing normalization → checkbox errors and array index issues
   - See: [docs/STATE_MANAGEMENT.md § Damage Normalization](docs/STATE_MANAGEMENT.md)

3. **Card Type Icons**: MUST be in `/public/` root (not subdirectories)
   - Required: `/red.png`, `/green.png`, `/purple.png`, `/yellow.png`, `/blue.png`
   - Vite limitation: Icons in subdirectories fail to load
   - See: [docs/CARD_SYSTEM.md § Visual Indicators](docs/CARD_SYSTEM.md)

4. **Command Points Timing**:
   - Planning Phase → Turn 1: Calculate WITHOUT influence bonus (`applyInfluenceBonus: false`)
   - End of Week (Sunday): Calculate WITH influence bonus (`applyInfluenceBonus: true`)
   - Mid-Week: NO recalculation (only consumption)
   - See: [docs/COMBAT_SYSTEM.md § Command Points](docs/COMBAT_SYSTEM.md)

5. **Memoization Dependencies**:
   - `filteredLocations`: MUST include both `filters` AND `locations` in deps
   - Missing deps → stale UI and infinite loops
   - See: [docs/STATE_MANAGEMENT.md § Critical Memoization](docs/STATE_MANAGEMENT.md)

### 🔗 Quick Reference by System

| System | Key Concept | Documentation |
|--------|-------------|---------------|
| **Cards** | 5 types, 50 points budget (non-recoverable) | [CARD_SYSTEM.md](docs/CARD_SYSTEM.md) |
| **Attachment** | 1 card/unit, category match required | [CARD_ATTACHMENT.md](docs/CARD_ATTACHMENT.md) |
| **Transport** | Embarked units, slot-based capacity | [CARD_TRANSPORT.md](docs/CARD_TRANSPORT.md) |
| **Influence** | Threshold-based dice rolls (d20) | [CARD_INFLUENCE.md](docs/CARD_INFLUENCE.md) |
| **Units** | Optional capabilities use `undefined`, NOT 0 | [UNIT_SYSTEM.md](docs/UNIT_SYSTEM.md) |
| **Task Forces** | Faction-filtered, supply level calculations | [UNIT_SYSTEM.md](docs/UNIT_SYSTEM.md) |
| **Combat** | Damage states, destruction logging | [COMBAT_SYSTEM.md](docs/COMBAT_SYSTEM.md) |
| **Map** | Leaflet v1.9.4, custom icons via ReactDOMServer | [MAP_INTEGRATION.md](docs/MAP_INTEGRATION.md) |

**For detailed implementation patterns, troubleshooting, and examples**: Always consult [docs/INDEX.md](docs/INDEX.md) first for navigation to specific topics.

### Design Standards

**CRITICAL**: All UI components must follow the **Retro-Military Terminal Aesthetic** for visual consistency.

**Core Requirements**:
1. **Language**: All UI text in English (no Spanish in user-facing text)
2. **Font**: `font-mono` (monospace) on ALL text elements
3. **Primary Color**: Green accent (`text-green-400`, `bg-green-600`) - NOT cyan
4. **Typography**: `uppercase tracking-wider` for headers, `tracking-wide` for labels

**Reference Components** (for styling patterns):
- `TaskForceModal.tsx`, `DeploymentNotificationModal.tsx`, `CommandCenterModal.tsx`, `DisembarkModal.tsx`

**Common Mistakes**: Forgetting `font-mono`, using cyan instead of green, leaving Spanish text in UI

## Map Integration

Uses react-leaflet v5 with Leaflet v1.9.4.

**Components**: `MapContainer`, `TileLayer`, `Marker`, `Rectangle`, `Popup`, `ChangeView`, `MapInitializer`

**Important**:
- Leaflet CSS in `index.tsx` (not via @import due to PostCSS)
- Default icons fixed in `index.tsx` with CDN URLs
- Map needs `invalidateSize()` after mount/resize
- Validate coordinates for NaN/undefined
- Default center: `[20.0, 121.5]`, zoom: `5`

## Styling

Tailwind CSS v3 from CDN (`<script>` in `index.html`)
- Colors: Cyan (primary), Gray (backgrounds), Yellow (accent)
- Custom Leaflet styles in `index.html` `<style>` block

## Multiplayer

- Single Firestore document: `game/current`
- Real-time sync across all clients
- No authentication - open access
- Test: Open multiple tabs/windows

## Multi-Game Authentication

**NEW in branch `feature/multi-game-auth`**: Complete multi-user support with Firebase Authentication.

### Key Features
- ✅ Firebase email/password authentication
- ✅ User profiles with global roles (admin/user)
- ✅ Game-specific roles (player/master)
- ✅ Public and password-protected private games
- ✅ Game isolation (each game has separate Firestore document)
- ✅ First-user admin privileges
- ✅ Real-time game lobby

### New Components (6)
1. **AuthScreen.tsx** - Login/signup interface
2. **GameLobby.tsx** - Game selection and creation
3. **CreateGameModal.tsx** - Create new game form
4. **PasswordPromptModal.tsx** - Join private game
5. **DeleteGameModal.tsx** - Admin game deletion
6. **SuccessModal.tsx** - Success notifications

### Context Providers (2)
1. **AuthContext** (`useAuth` hook) - User authentication and profiles
2. **GameContext** (`useGame` hook) - Game selection and permissions

### Firestore Structure
```
users/
└── {uid}/
    ├── email, displayName
    ├── role: 'user' | 'admin'
    └── createdAt, lastLoginAt

games/
└── {gameId}/
    ├── metadata/
    │   ├── name, creatorUid
    │   ├── visibility: 'public' | 'private'
    │   ├── players: Record<uid, GamePlayer>
    │   └── hasPassword, password?
    └── state/
        └── (all game state)
```

See **[docs/MULTI_GAME_AUTH.md](docs/MULTI_GAME_AUTH.md)** for complete documentation.

---

## Testing

Test suite built with Vitest + happy-dom environment.

**Service Tests** (138 test cases total):
- `services/turnService.test.ts` (36 tests) - Turn lifecycle, date calculations, phase transitions, game phases
- `services/deploymentService.test.ts` (24 tests) - Deployment timing, activation logic, command point validation, cleanup
- `services/destructionService.test.ts` (33 tests) - Destruction detection, revival tracking, combat statistics
- `services/submarineService.test.ts` (27 tests) - Patrol mechanics (90% success), attack resolution (50% success), d20 rolls
- `services/mines/mineService.test.ts` (9 tests) - Maritime mine detection mechanics
- `services/assets/assetDeployService.test.ts` (9 tests) - Asset deployment processing

**Test Status**:
- ✅ **138 tests passing** (all tests fixed)
- 0 tests failing
- 1 test skipped

**Test Coverage**:
- All service functions have comprehensive unit tests
- Edge cases covered: validation errors, state inconsistencies, boundary conditions
- Deterministic testing: Math.random mocked for submarine d20 rolls
- Firestore operations not mocked (services are pure functions)

**Test Commands**:
```bash
npm test              # Watch mode (default)
npm run test:ui       # Visual UI with test results
npm run test:coverage # Generate coverage report
```

**Test Configuration**:
- Framework: Vitest 4.0.6
- Environment: happy-dom (lightweight DOM simulation)
- Setup file: `src/test/setup.ts` (mocks console methods)

**Philosophy**:
- Services contain complex business logic → heavily tested (107 tests)
- UI components rely on integration testing via manual QA
- Focus test effort on high-value, high-complexity code

## Development Notes

- Geolocation requires permissions
- Internet required for Firestore + map tiles
- Port 3000 (auto-increments if occupied)
- Strict mode enabled
- Sidebar hidden on load

## Troubleshooting

**HMR Issues**: If file edits fail, stop dev server or use Node.js scripts

**State Management Issues**:
- Ensure `useGameState` hook is properly imported and initialized in App.tsx
- Check that all 14 Firestore subscriptions are active (see browser console for connection status)
- Verify commandPoints (not cardBudget) is used throughout codebase

**DataEditor Errors**:
- Check DataEditor tab components exist: TacticalTab, PatrolsTab, ForcesTab, CommandPointsTab, CardsTab
- Verify state is properly passed from Map.tsx to DataEditor

**Air Patrol Indicators**:
- `getAirPatrolStatusIcon()` (utils/iconGenerators.ts) uses solid backgrounds
- `ReactDOMServer.renderToString()` for Leaflet divIcons
- 35x35px circles positioned at bottom-right of operational areas

**Test Failures**:
- Run `npm test` to verify all 107 service tests pass
- Check that test dates match actual calendar (2030 dates verified)
- Submarine tests use mocked Math.random for deterministic d20 rolls
