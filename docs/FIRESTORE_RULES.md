# Firestore Security Rules Documentation

This document explains the Firestore security rules implementation for the multi-game architecture.

## Overview

The security rules implement **Role-Based Access Control (RBAC)** with three main roles:
- **Master**: Full control over the game (both factions, game state, player management)
- **Player**: Control only their assigned faction's data
- **Anonymous**: No access (all operations require authentication)

## Rule Structure

### Helper Functions

#### Authentication
- `isAuthenticated()` - Checks if user is logged in
- Required for ALL operations (no anonymous access)

#### Game Membership
- `isGameMember(gameId)` - Checks if user is a player in the game
- `getGameRole(gameId)` - Returns user's role ('master' or 'player')
- `isMaster(gameId)` - Checks if user is a master
- `isPlayer(gameId)` - Checks if user is a player (not master)

#### Faction Control
- `getPlayerFaction(gameId)` - Returns user's faction ('us' or 'china')
- `canModifyFaction(gameId, faction)` - Checks if user can modify faction data
  - Masters: Can modify both factions
  - Players: Can only modify their own faction

#### Game Management
- `isGameCreator(gameId)` - Checks if user created the game
- `isValidMetadataUpdate()` - Validates metadata changes (prevents ID/creator changes)

---

## Collection Rules

### `/users/{userId}`

**Purpose**: Store user profiles with authentication data.

**Rules**:
- ✅ **Read**: Users can read their own profile
- ✅ **Create**: Users can create their own profile during signup
  - Must match authenticated UID
  - Cannot set arbitrary role (defaults to 'user')
- ✅ **Update**: Users can update their own profile
  - Cannot change UID
  - Cannot change role (prevents privilege escalation)
- ❌ **Delete**: Users cannot delete their profile

**Security Notes**:
- Prevents users from reading other users' profiles
- Prevents role escalation (user → admin)
- Profile creation is tied to Firebase Auth UID

---

### `/games/{gameId}`

**Purpose**: Store game state for each active game.

**Data Structure**:
```typescript
{
  metadata: {
    id: string,
    name: string,
    creatorUid: string,
    status: 'active' | 'archived' | 'completed',
    visibility: 'public' | 'private',
    players: {
      [uid]: {
        role: 'master' | 'player',
        faction: 'us' | 'china' | null,
        joinedAt: string
      }
    }
  },
  units: Unit[],
  taskForces: TaskForce[],
  operationalAreas: OperationalArea[],
  // ... other game state fields
}
```

#### Read Access

✅ **Allowed**:
- Game members can always read their games
- Any authenticated user can read public games (for lobby)

❌ **Denied**:
- Unauthenticated users cannot read anything
- Users cannot read private games they're not in

#### Create Access

✅ **Allowed**:
- Any authenticated user can create a game
- Creator must be in the players list
- Creator's UID must match metadata.creatorUid

❌ **Denied**:
- Cannot create game without authentication
- Cannot create game on behalf of another user

#### Delete Access

✅ **Allowed**:
- Only game creator can delete the game

❌ **Denied**:
- Players cannot delete games
- Masters cannot delete games (unless they're the creator)

#### Update Access

**Masters** can:
- ✅ Update all game state fields
- ✅ Modify both US and China faction data
- ✅ Advance turn
- ✅ Manage players (add/remove/change roles)
- ✅ Update game settings (name, visibility, max players)
- ❌ Cannot change game ID, creator, or creation date

**Players** can:
- ✅ Update their faction's units
- ✅ Update their faction's task forces
- ✅ Update their faction's purchased cards
- ✅ Update command points
- ✅ Update operational areas (card assignments)
- ✅ Update pending deployments
- ❌ Cannot update metadata (except lastActivityAt)
- ❌ Cannot modify opponent's faction data
- ❌ Cannot change their own role or faction
- ❌ Cannot kick other players

---

### `/game/current` (Legacy)

**Purpose**: Backward compatibility during migration.

**Rules**:
- ✅ **Read/Write**: Any authenticated user (temporary)
- ⚠️ **WARNING**: This is less secure and should be removed after migration

**Migration Plan**:
1. Deploy new multi-game code with both systems working
2. Migrate data from `/game/current` to `/games/default`
3. Test that everything works with new system
4. Remove legacy rules after 2-week transition period

---

## Security Considerations

### What's Protected

✅ **Authentication**:
- All operations require valid Firebase Auth token
- No anonymous access

✅ **Authorization**:
- Users can only access games they're members of
- Role-based permissions (Master vs Player)
- Faction-based data isolation for Players

✅ **Data Integrity**:
- Cannot change game ID, creator, or creation date
- Cannot escalate own privileges
- Cannot impersonate other users

✅ **Audit Trail**:
- All operations include request.auth.uid
- Firebase logs all requests with user context

### Known Limitations

⚠️ **Performance**:
- Rules use `get()` calls which count toward document read limits
- Each permission check reads the game document
- May impact performance with high-frequency updates

⚠️ **Fine-Grained Faction Validation**:
- Current rules have `// TODO: Validate faction-specific changes`
- Need to validate that unit/taskForce updates only affect player's faction
- More complex validation requires iterating through arrays (performance impact)

⚠️ **Cross-Game Attacks**:
- Users cannot access other games' data (protected)
- Users cannot join games without invitation (needs implementation)

---

## Testing Security Rules

### Local Testing with Firebase Emulator

```bash
# Install Firebase emulator
npm install -g firebase-tools

# Start emulator
firebase emulators:start --only firestore

# Run rules tests
firebase emulators:exec --only firestore "npm test"
```

### Manual Testing Scenarios

**Test 1: Unauthenticated Access**
- ❌ Try to read /games without login → Should fail
- ❌ Try to create game without login → Should fail

**Test 2: User Profile Access**
- ✅ User A reads own profile → Should succeed
- ❌ User A reads User B's profile → Should fail
- ❌ User A changes own role to admin → Should fail

**Test 3: Game Creation**
- ✅ Authenticated user creates game → Should succeed
- ✅ Creator is automatically added to players → Should succeed
- ❌ Create game with wrong creator UID → Should fail

**Test 4: Master Permissions**
- ✅ Master modifies US faction data → Should succeed
- ✅ Master modifies China faction data → Should succeed
- ✅ Master advances turn → Should succeed
- ✅ Master kicks player → Should succeed

**Test 5: Player Permissions**
- ✅ US Player modifies US units → Should succeed
- ❌ US Player modifies China units → Should fail
- ❌ Player advances turn → Should fail
- ❌ Player kicks another player → Should fail

**Test 6: Game Deletion**
- ✅ Creator deletes own game → Should succeed
- ❌ Player deletes game → Should fail
- ❌ Master deletes game (if not creator) → Should fail

---

## Deployment

### Deploy to Production

```bash
# Deploy rules only (without deploying functions/hosting)
firebase deploy --only firestore:rules

# Deploy with confirmation
firebase deploy --only firestore:rules --project=your-project-id
```

### Rollback Plan

If rules cause issues:

```bash
# Revert to previous version
firebase deploy --only firestore:rules --version=previous

# Or manually edit in Firebase Console
# Go to: Firebase Console → Firestore → Rules → Edit
```

---

## Future Improvements

### Planned Enhancements

1. **Fine-Grained Faction Validation**
   - Validate individual unit/taskForce changes
   - Ensure players only modify their faction's entities
   - Add helper function to check array element factions

2. **Rate Limiting**
   - Implement request throttling per user
   - Prevent spam/DoS attacks
   - Limit game creation (e.g., max 10 games per user)

3. **Invite System**
   - Add rules for game invitations
   - Validate invitation tokens
   - Implement friend list permissions

4. **Observer Role**
   - Add read-only "observer" role
   - Spectator mode for completed games
   - Replay functionality

5. **Advanced Logging**
   - Log all privilege escalation attempts
   - Track suspicious activity patterns
   - Alert on repeated rule violations

### Performance Optimizations

- Cache game metadata reads (reduce `get()` calls)
- Use computed properties instead of repeated lookups
- Implement client-side validation to reduce rejected writes

---

## Troubleshooting

### Common Errors

**Error**: "Missing or insufficient permissions"
- **Cause**: User not authenticated or not in game
- **Fix**: Ensure user is logged in and has joined the game

**Error**: "Document read limit exceeded"
- **Cause**: Too many `get()` calls in rules
- **Fix**: Reduce rule complexity or cache game data client-side

**Error**: "Cannot modify metadata"
- **Cause**: Player trying to change game settings
- **Fix**: Only masters can modify metadata

### Debug Rules

Enable rules debugging in Firebase Console:
1. Go to Firestore → Rules
2. Click "Simulator"
3. Test specific operations with mock data
4. View detailed rule evaluation logs

---

## References

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Language Reference](https://firebase.google.com/docs/rules/rules-language)
- [Testing Security Rules](https://firebase.google.com/docs/rules/unit-tests)
