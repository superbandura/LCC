# Multi-Game Authentication System

**Last Updated**: 2025-11-12
**Version**: 1.0
**Branch**: feature/multi-game-auth

## Overview

The Multi-Game Authentication System enables multiple users to create, join, and play separate game instances simultaneously. Each game has its own isolated state, players, and roles.

### Key Features
- **Firebase Authentication**: Email/password authentication with automatic profile creation
- **Multi-Game Support**: Users can create/join multiple independent game instances
- **Role-Based Access Control (RBAC)**: Global roles (user/admin) and game-specific roles (player/master)
- **Password-Protected Games**: Optional password protection for private games
- **First-User Admin**: First user to sign up automatically gets admin role
- **Real-Time Game State**: Game metadata syncs in real-time across all clients

---

## Architecture

### Component Hierarchy

```
AppWrapper.tsx (root)
├── ErrorBoundary
├── AuthProvider (authentication context)
│   └── GameProvider (game selection context)
│       └── AppRouter
│           ├── AuthScreen (not authenticated)
│           ├── GameLobby (authenticated, no game selected)
│           └── App.tsx (authenticated, game selected)
```

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      AppWrapper.tsx                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │             AuthProvider (AuthContext)                │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │       GameProvider (GameContext)                │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │          AppRouter                        │  │  │  │
│  │  │  │                                           │  │  │  │
│  │  │  │  1. Not authenticated? → AuthScreen      │  │  │  │
│  │  │  │  2. No game selected? → GameLobby        │  │  │  │
│  │  │  │  3. Game selected? → App.tsx             │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Model

### User Authentication

#### UserProfile
Global user profile stored in `/users/{uid}`:

```typescript
interface UserProfile {
  uid: string;                  // Firebase Auth UID
  email: string;                // User email
  displayName: string;          // Display name
  role: 'user' | 'admin';       // Global role
  createdAt: string;            // ISO timestamp
  lastLoginAt: string;          // ISO timestamp
}
```

**Role Hierarchy**:
- **admin**: First user to sign up, can access admin features
- **user**: All subsequent users, standard permissions

### Game Management

#### GameMetadata
Game metadata stored in `/games/{gameId}/metadata`:

```typescript
interface GameMetadata {
  id: string;                           // Game ID
  name: string;                         // Game name
  creatorUid: string;                   // UID of creator
  status: 'active' | 'archived' | 'completed';
  visibility: 'public' | 'private';     // Join permissions
  createdAt: string;                    // ISO timestamp
  lastActivityAt: string;               // ISO timestamp
  players: Record<string, GamePlayer>;  // uid → GamePlayer (unlimited)
  hasPassword: boolean;                 // Password protected?
  password?: string;                    // Game password (if protected)
}
```

#### GamePlayer
Per-game player role stored within GameMetadata:

```typescript
interface GamePlayer {
  uid: string;                          // Firebase Auth UID
  displayName: string;                  // Display name
  role: 'player' | 'master';            // Role in THIS game
  faction: 'us' | 'china' | null;       // Assigned faction (null for master)
  joinedAt: string;                     // ISO timestamp
}
```

**Game Roles**:
- **master**: Game master, can control game flow, typically no faction
- **player**: Regular player assigned to US or China faction

#### GameState
Full game state stored in `/games/{gameId}/state`:

```typescript
interface GameState {
  metadata: GameMetadata;
  // ... all existing game state fields
  operationalAreas: OperationalArea[];
  units: Unit[];
  cards: Card[];
  // etc.
}
```

---

## Core Components

### AppWrapper.tsx (~110 lines)

Root component that wraps the entire application with authentication and game context providers.

**Responsibilities**:
- Provides AuthContext and GameContext to entire app
- Renders ErrorBoundary for crash protection
- Entry point for application

**File**: `AppWrapper.tsx`

```typescript
<ErrorBoundary>
  <AuthProvider>
    <GameProvider>
      <AppRouter />
    </GameProvider>
  </AuthProvider>
</ErrorBoundary>
```

---

### AppRouter (~75 lines)

Internal component within AppWrapper that handles routing logic based on auth and game state.

**Routing Logic**:
1. **Loading**: Shows spinner while checking auth state
2. **Not Authenticated**: Renders `<AuthScreen />` for login/signup
3. **Authenticated, No Game**: Renders `<GameLobby />` for game selection
4. **Game Loading**: Shows spinner while loading game metadata
5. **User Not in Game**: Redirects to GameLobby if user not in player list
6. **Game Ready**: Renders `<App />` (main game interface)

**Key Checks**:
- `currentUser`: Firebase Auth user object
- `userProfile`: User profile loaded from Firestore
- `gameId`: Selected game ID (persisted in localStorage)
- `gameMetadata`: Game metadata loaded from Firestore
- `gameMetadata.players[uid]`: User exists in game's player list

---

### AuthContext (~160 lines)

React Context that manages Firebase Authentication state and user profiles.

**File**: `contexts/AuthContext.tsx`

**Exported Hook**: `useAuth()`

**Provided State**:
```typescript
interface AuthContextType {
  currentUser: User | null;              // Firebase Auth user
  userProfile: UserProfile | null;       // User profile from Firestore
  loading: boolean;                      // Auth state loading
  signup: (email, password, displayName) => Promise<void>;
  login: (email, password) => Promise<void>;
  logout: () => Promise<void>;
}
```

**Key Features**:
- **Automatic Profile Creation**: Creates UserProfile in Firestore on signup
- **First-User Admin**: First user gets `role: 'admin'`, others get `role: 'user'`
- **Profile Loading**: Loads UserProfile from Firestore on login
- **Last Login Tracking**: Updates `lastLoginAt` timestamp on each login
- **Signup Flag**: Uses `signupInProgressRef` to prevent race conditions

**Authentication Flow**:
1. `signup()` called → Create Firebase Auth user
2. Update display name in Firebase Auth
3. Check if other users exist (determines admin status)
4. Create UserProfile in Firestore with appropriate role
5. Set `currentUser` and `userProfile` state

**Login Flow**:
1. `onAuthStateChanged` fires → Firebase user detected
2. Load UserProfile from Firestore using `getUserProfile(uid)`
3. Update `lastLoginAt` timestamp
4. Set `currentUser` and `userProfile` state together
5. Mark loading as complete

---

### GameContext (~95 lines)

React Context that manages game selection and game metadata.

**File**: `contexts/GameContext.tsx`

**Exported Hook**: `useGame()`

**Provided State**:
```typescript
interface GameContextType {
  gameId: string | null;                     // Selected game ID
  gameMetadata: GameMetadata | null;         // Game metadata
  currentPlayerRole: 'player' | 'master' | null;
  currentPlayerFaction: 'us' | 'china' | null;
  setGameId: (gameId: string | null) => void;
  leaveGame: () => void;
  isMaster: boolean;                         // Helper flag
  isPlayer: boolean;                         // Helper flag
  canControlFaction: (faction) => boolean;   // Permission check
}
```

**Key Features**:
- **Game Selection Persistence**: Saves `gameId` to localStorage
- **Real-Time Metadata Sync**: Subscribes to game metadata updates
- **Role Extraction**: Extracts current player's role and faction from metadata
- **Permission Helpers**: Provides `canControlFaction()` for access control

**Game Selection Flow**:
1. User selects game in GameLobby
2. `setGameId(gameId)` called
3. GameContext persists `gameId` to localStorage
4. Subscribes to game metadata via `subscribeToGameMetadata()`
5. GameMetadata loads → AppRouter renders App.tsx
6. App.tsx uses `useGameStateMultiGame(gameId)` to load game state

---

## UI Components

### AuthScreen.tsx

User authentication screen with login/signup tabs.

**File**: `components/AuthScreen.tsx`

**Features**:
- **Email/Password Login**: Standard Firebase Auth login
- **Email/Password Signup**: Creates new user account + profile
- **Display Name**: Required during signup
- **Error Handling**: Shows validation errors inline
- **Retro-Military Aesthetic**: Consistent green/black terminal styling

**Validation**:
- Email: Valid email format required
- Password: Minimum 6 characters (Firebase default)
- Display Name: Non-empty string required

---

### GameLobby.tsx

Game selection and creation interface.

**File**: `components/GameLobby.tsx`

**Features**:
- **Public Games List**: Shows all public games with status
- **Create New Game**: Modal to create new game with options:
  - Game name
  - Visibility (public/private)
  - Password protection (optional)
- **Join Game**: Click to join public game, password prompt for private
- **Leave Button**: Sign out and return to AuthScreen

**Game Creation Flow**:
1. Click "Create New Game" button
2. Fill in CreateGameModal form
3. Submit → Creates game in `/games/{gameId}/metadata`
4. Adds current user as first player with role "master"
5. Initializes game state in `/games/{gameId}/state`
6. Redirects to game interface (App.tsx)

**Join Game Flow**:
1. Click game in public games list
2. If password-protected → PasswordPromptModal
3. Validate password → Add user to game's players
4. Redirect to game interface (App.tsx)

---

### CreateGameModal.tsx

Modal for creating a new game.

**File**: `components/CreateGameModal.tsx`

**Form Fields**:
- **Game Name**: Text input (required)
- **Visibility**: Radio buttons (public/private)
- **Password**: Text input (optional, only if private)
- **Max Players**: Number input (default: 8)

**Validation**:
- Game name: Non-empty, max 50 characters
- Password: Required if visibility is "private"

---

### PasswordPromptModal.tsx

Modal for entering password to join private game.

**File**: `components/PasswordPromptModal.tsx`

**Features**:
- Text input for password
- Cancel button to abort join
- Submit button to attempt join
- Error message if password incorrect

---

### DeleteGameModal.tsx

Modal for deleting/archiving games (admin only).

**File**: `components/DeleteGameModal.tsx`

**Features**:
- Confirmation prompt before deletion
- Shows game name and player count
- Only accessible to admin users
- Sets game status to "archived" (soft delete)

---

### SuccessModal.tsx

Generic success notification modal.

**File**: `components/SuccessModal.tsx`

**Usage**: Shows success messages after operations like:
- Game created successfully
- Joined game successfully
- Left game successfully

---

## Firestore Service Functions

### User Management

#### createUserProfile
Creates new user profile in `/users/{uid}`.

```typescript
async function createUserProfile(profile: UserProfile): Promise<void>
```

**Called**: During signup in AuthContext

---

#### getUserProfile
Retrieves user profile from `/users/{uid}`.

```typescript
async function getUserProfile(uid: string): Promise<UserProfile | null>
```

**Called**: During login in AuthContext

---

#### updateUserLastLogin
Updates `lastLoginAt` timestamp.

```typescript
async function updateUserLastLogin(uid: string): Promise<void>
```

**Called**: On every login in AuthContext

---

#### checkIfUsersExist
Checks if any users exist (to determine if first user).

```typescript
async function checkIfUsersExist(): Promise<boolean>
```

**Returns**: `true` if users exist, `false` if database is empty

**Called**: During signup to determine admin role

---

### Game Management

#### createGame
Creates new game with metadata and initial state.

```typescript
async function createGame(
  gameMetadata: GameMetadata,
  initialState: GameState
): Promise<string>
```

**Returns**: Game ID

**Called**: In CreateGameModal when user creates new game

**Operations**:
1. Generates unique game ID
2. Creates `/games/{gameId}/metadata` document
3. Creates `/games/{gameId}/state` document with initial data
4. Returns game ID for routing

---

#### joinGame
Adds user to game's player list.

```typescript
async function joinGame(
  gameId: string,
  player: GamePlayer,
  password?: string
): Promise<void>
```

**Validation**:
- If game has password, validates password match
- Prevents duplicate joins (no player limit)

**Called**: In GameLobby when user joins game

---

#### leaveGame
Removes user from game's player list.

```typescript
async function leaveGame(
  gameId: string,
  uid: string
): Promise<void>
```

**Called**: When user clicks "Leave Game" button

**Note**: Does not delete game, only removes player

---

#### subscribeToPublicGames
Real-time subscription to all public games.

```typescript
function subscribeToPublicGames(
  callback: (games: GameMetadata[]) => void
): () => void
```

**Returns**: Unsubscribe function

**Called**: In GameLobby to display game list

**Query**: Filters games where `visibility === 'public'` AND `status === 'active'`

---

#### subscribeToGameMetadata
Real-time subscription to specific game's metadata.

```typescript
function subscribeToGameMetadata(
  gameId: string,
  callback: (metadata: GameMetadata) => void
): () => void
```

**Returns**: Unsubscribe function

**Called**: In GameContext when game is selected

---

## Hooks

### useGameStateMultiGame (~280 lines)

Centralized hook for managing Firestore game state subscriptions for multi-game system.

**File**: `hooks/useGameStateMultiGame.ts`

**Similar to**: `hooks/useGameState.ts` (legacy single-game version)

**Key Differences**:
- **Game-Scoped**: Takes `gameId` parameter, subscribes to `/games/{gameId}/state`
- **Multi-Game Support**: Works with multi-game authentication system
- **Same API**: Returns same GameState interface for backward compatibility

**Usage in App.tsx**:
```typescript
const { gameId } = useGame();
const gameState = useGameStateMultiGame(gameId);
```

**Subscriptions** (19 total):
1. subscribeToOperationalAreas
2. subscribeToOperationalData
3. subscribeToLocations
4. subscribeToTaskForces
5. subscribeToUnits
6. subscribeToCards
7. subscribeToCommandPoints
8. subscribeToPreviousCommandPoints
9. subscribeToPurchaseHistory
10. subscribeToCardPurchaseHistory
11. subscribeToPurchasedCards
12. subscribeToDestructionLog
13. subscribeToTurnState
14. subscribeToPendingDeployments
15. subscribeToInfluenceMarker
16. subscribeToSubmarineCampaign
17. subscribeToPlayedCardNotificationsQueue
18. subscribeToPlayerAssignments (legacy, not used in multi-game)
19. subscribeToRegisteredPlayers (legacy, not used in multi-game)

---

## Firestore Structure

### Single-Game (Legacy)
```
game/
└── current/
    ├── operationalAreas: []
    ├── units: []
    ├── cards: []
    └── ...
```

### Multi-Game (New)
```
users/
├── {uid1}/
│   ├── email: "user@example.com"
│   ├── displayName: "Player1"
│   ├── role: "admin"
│   └── ...
└── {uid2}/
    └── ...

games/
├── {gameId1}/
│   ├── metadata/
│   │   ├── name: "Game 1"
│   │   ├── creatorUid: "uid1"
│   │   ├── players: { uid1: {...}, uid2: {...} }
│   │   └── ...
│   └── state/
│       ├── operationalAreas: []
│       ├── units: []
│       ├── cards: []
│       └── ...
└── {gameId2}/
    └── ...
```

---

## Security Rules

### Users Collection
```
match /users/{uid} {
  // Users can read their own profile
  allow read: if request.auth.uid == uid;

  // Users can write their own profile
  allow write: if request.auth.uid == uid;

  // Anyone authenticated can create profiles (for signup)
  allow create: if request.auth != null;

  // Admins can read all profiles
  allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### Games Collection
```
match /games/{gameId} {
  // Anyone can read public game metadata
  allow read: if resource.data.visibility == 'public';

  // Players can read their own game
  allow read: if request.auth.uid in resource.data.players;

  // Creator or admin can write game metadata
  allow write: if request.auth.uid == resource.data.creatorUid
                || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';

  // Players can read/write game state
  match /state/{document=**} {
    allow read, write: if request.auth.uid in get(/databases/$(database)/documents/games/$(gameId)/metadata).data.players;
  }
}
```

---

## Migration from Single-Game to Multi-Game

### Breaking Changes
1. **App.tsx**: Now uses `useGameStateMultiGame(gameId)` instead of `useGameState()`
2. **firestoreService**: New functions in `firestoreServiceMultiGame.ts`
3. **Authentication Required**: All users must authenticate to access games
4. **Game Selection**: Users must select a game from GameLobby

### Migration Path
1. **Create First User**: First user becomes admin automatically
2. **Create Game from Legacy Data**: Admin can import existing game data
3. **Invite Players**: Share game ID or make game public
4. **Players Join**: Other users sign up and join game

### Backward Compatibility
- **Legacy Routes**: `useGameState` and `firestoreService` still exist for single-game mode
- **Data Model**: GameState interface unchanged, ensuring compatibility

---

## Common Patterns

### Checking User Permissions
```typescript
const { canControlFaction, isMaster } = useGame();

// Check if user can control US faction
if (canControlFaction('us')) {
  // Allow US faction actions
}

// Check if user is game master
if (isMaster) {
  // Allow master-only actions
}
```

### Getting Current User Info
```typescript
const { currentUser, userProfile } = useAuth();
const { gameMetadata, currentPlayerRole, currentPlayerFaction } = useGame();

console.log('User:', userProfile?.displayName);
console.log('Global Role:', userProfile?.role); // 'user' | 'admin'
console.log('Game Role:', currentPlayerRole); // 'player' | 'master'
console.log('Faction:', currentPlayerFaction); // 'us' | 'china' | null
```

### Creating a New Game
```typescript
const { currentUser } = useAuth();
const { setGameId } = useGame();

const newGameMetadata: GameMetadata = {
  id: '', // Will be generated
  name: 'My Game',
  creatorUid: currentUser.uid,
  status: 'active',
  visibility: 'public',
  createdAt: new Date().toISOString(),
  lastActivityAt: new Date().toISOString(),
  players: {
    [currentUser.uid]: {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      role: 'master',
      faction: null,
      joinedAt: new Date().toISOString()
    }
  },
  hasPassword: false
};

const gameId = await createGame(newGameMetadata, initialGameState);
setGameId(gameId); // Switch to new game
```

---

## Troubleshooting

### User Profile Not Loading
**Symptom**: AppRouter shows AuthScreen even though user is authenticated

**Cause**: `userProfile` is null after authentication

**Solution**:
1. Check Firestore rules allow reading `/users/{uid}`
2. Verify user profile was created during signup
3. Check console for errors in AuthContext

---

### Game Not Loading
**Symptom**: Spinner shows "LOADING GAME..." indefinitely

**Cause**: `gameMetadata` never loads

**Solution**:
1. Verify game exists in `/games/{gameId}/metadata`
2. Check Firestore rules allow reading game metadata
3. Verify user is in game's player list
4. Check console for subscription errors

---

### User Redirected to GameLobby After Selecting Game
**Symptom**: User selects game but immediately redirected back to lobby

**Cause**: User not in game's player list (`gameMetadata.players[uid]` is undefined)

**Solution**:
1. Ensure user joined game properly via `joinGame()`
2. Check game's player list in Firestore
3. Try leaving and rejoining game

---

### First User Not Getting Admin Role
**Symptom**: First user gets `role: 'user'` instead of `role: 'admin'`

**Cause**: `checkIfUsersExist()` returns true when it should return false

**Solution**:
1. Verify `/users` collection is empty before first signup
2. Check Firestore rules allow querying users collection
3. Try deleting all users and creating first user again

---

## Testing

### Manual Testing Checklist
- [ ] First user signup → Gets admin role
- [ ] Second user signup → Gets user role
- [ ] Login with existing user → Profile loads correctly
- [ ] Create public game → Appears in GameLobby
- [ ] Create private game → Does not appear in GameLobby
- [ ] Join public game → Redirects to game interface
- [ ] Join private game with correct password → Succeeds
- [ ] Join private game with wrong password → Shows error
- [ ] Leave game → Returns to GameLobby
- [ ] Logout → Returns to AuthScreen
- [ ] Refresh page in game → Game state persists
- [ ] Two users in same game → Real-time sync works

---

## Future Enhancements

### Planned Features
- **Game Invitations**: Send email invites to specific users
- **Player Kick**: Masters can remove players from game
- **Game Archive**: View and restore archived games
- **Game Templates**: Create games from predefined templates
- **Spectator Mode**: Allow users to watch games without playing
- **Chat System**: In-game chat for players
- **Turn History**: View complete turn-by-turn history
- **Game Export**: Export game state to JSON file

---

## References

### Related Documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - Overall project architecture
- [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) - State management patterns
- [REFACTORING_LOG.md](REFACTORING_LOG.md) - Change history

### Key Files
- `AppWrapper.tsx` - Root component with auth/game context
- `contexts/AuthContext.tsx` - Authentication context provider
- `contexts/GameContext.tsx` - Game selection context provider
- `hooks/useGameStateMultiGame.ts` - Multi-game state hook
- `firestoreServiceMultiGame.ts` - Multi-game Firestore operations
- `components/AuthScreen.tsx` - Login/signup interface
- `components/GameLobby.tsx` - Game selection interface

---

**Document Maintained By**: LCC Development Team
**Last Review**: 2025-11-12
**Status**: Complete and up-to-date
