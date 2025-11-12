# Firestore Rules Validation Guide

This guide explains how to validate and test Firestore security rules before deploying to production.

## Prerequisites

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

## Local Testing with Emulator

### Step 1: Start Firestore Emulator

```bash
# Start only Firestore emulator
firebase emulators:start --only firestore

# Or start all emulators
firebase emulators:start
```

The emulator will run on:
- Firestore: `http://localhost:8080`
- Emulator UI: `http://localhost:4000`

### Step 2: Point Your App to Emulator

Update `firebase.ts` to use emulator in development:

```typescript
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const db = getFirestore(app);

// Connect to emulator in development
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

### Step 3: Test in Browser

1. Run dev server: `npm run dev`
2. Open browser: `http://localhost:3000`
3. Test authentication and game operations
4. Check Emulator UI for rule evaluations: `http://localhost:4000`

## Manual Rule Testing Scenarios

### Test 1: Unauthenticated Access

**Expected**: All operations should fail

```bash
# Using Firebase REST API
curl -X GET "http://localhost:8080/v1/projects/test-project/databases/(default)/documents/games/test-game"
# Expected: 403 Forbidden
```

### Test 2: User Profile CRUD

**Scenario A: Create Own Profile** ✅
```javascript
// As authenticated user (uid: user123)
await setDoc(doc(db, 'users', 'user123'), {
  uid: 'user123',
  email: 'user@example.com',
  displayName: 'Test User',
  role: 'user',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString()
});
// Expected: Success
```

**Scenario B: Read Other User's Profile** ❌
```javascript
// As authenticated user (uid: user123)
await getDoc(doc(db, 'users', 'user456'));
// Expected: Permission denied
```

**Scenario C: Escalate Own Role** ❌
```javascript
// As authenticated user (uid: user123)
await updateDoc(doc(db, 'users', 'user123'), {
  role: 'admin'  // Try to become admin
});
// Expected: Permission denied
```

### Test 3: Game Creation

**Scenario A: Create Game as Authenticated User** ✅
```javascript
await setDoc(doc(db, 'games', 'game123'), {
  metadata: {
    id: 'game123',
    name: 'Test Game',
    creatorUid: currentUser.uid,  // Must match authenticated UID
    status: 'active',
    visibility: 'public',
    maxPlayers: 8,
    createdAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    players: {
      [currentUser.uid]: {
        role: 'master',
        faction: null,
        joinedAt: new Date().toISOString()
      }
    }
  },
  // ... initial game state
});
// Expected: Success
```

**Scenario B: Create Game for Another User** ❌
```javascript
await setDoc(doc(db, 'games', 'game123'), {
  metadata: {
    creatorUid: 'other-user-uid',  // Wrong creator
    // ...
  }
});
// Expected: Permission denied
```

### Test 4: Master Permissions

**Setup**: User is Master in game

**Scenario A: Modify US Faction Data** ✅
```javascript
// Master updates US units
await updateDoc(doc(db, 'games', 'game123'), {
  units: updatedUnitsArray,
  'metadata.lastActivityAt': new Date().toISOString()
});
// Expected: Success
```

**Scenario B: Advance Turn** ✅
```javascript
// Master advances turn
await updateDoc(doc(db, 'games', 'game123'), {
  turnState: {
    currentDate: '2030-06-03',
    dayOfWeek: 2,
    turnNumber: 1,
    isPlanningPhase: false
  }
});
// Expected: Success
```

**Scenario C: Kick Player** ✅
```javascript
// Master removes player from game
const metadata = (await getDoc(doc(db, 'games', 'game123'))).data().metadata;
delete metadata.players['player-uid'];

await updateDoc(doc(db, 'games', 'game123'), {
  metadata: metadata
});
// Expected: Success
```

### Test 5: Player Permissions

**Setup**: User is Player (US faction) in game

**Scenario A: Modify Own Faction Units** ✅
```javascript
// US Player updates US units
await updateDoc(doc(db, 'games', 'game123'), {
  units: updatedUnitsArray  // Only US units changed
});
// Expected: Success
```

**Scenario B: Modify Opponent's Units** ❌
```javascript
// US Player tries to modify China units
await updateDoc(doc(db, 'games', 'game123'), {
  units: updatedUnitsArrayWithChinaChanges
});
// Expected: Permission denied (if validation is enabled)
```

**Scenario C: Advance Turn** ❌
```javascript
// Player tries to advance turn
await updateDoc(doc(db, 'games', 'game123'), {
  turnState: { turnNumber: 2 }
});
// Expected: Permission denied
```

**Scenario D: Change Own Role** ❌
```javascript
// Player tries to become Master
const metadata = (await getDoc(doc(db, 'games', 'game123'))).data().metadata;
metadata.players[currentUser.uid].role = 'master';

await updateDoc(doc(db, 'games', 'game123'), {
  metadata: metadata
});
// Expected: Permission denied
```

### Test 6: Game Deletion

**Scenario A: Creator Deletes Game** ✅
```javascript
// As game creator
await deleteDoc(doc(db, 'games', 'game123'));
// Expected: Success
```

**Scenario B: Player Deletes Game** ❌
```javascript
// As non-creator player
await deleteDoc(doc(db, 'games', 'game123'));
// Expected: Permission denied
```

**Scenario C: Master (Non-Creator) Deletes Game** ❌
```javascript
// As Master who didn't create the game
await deleteDoc(doc(db, 'games', 'game123'));
// Expected: Permission denied
```

## Rules Simulator (Firebase Console)

### Access Simulator

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Navigate to: **Firestore Database → Rules**
4. Click **"Rules playground"** button

### Example Simulator Tests

**Test Read Access**:
```
Location: /games/test-game
Operation: get
Authenticated: Yes
Auth UID: user123
```

**Test Write Access**:
```
Location: /games/test-game
Operation: update
Authenticated: Yes
Auth UID: user123
Request Data: {
  "units": [...],
  "metadata": { "lastActivityAt": "2024-01-15T10:00:00Z" }
}
```

## Automated Testing (Future)

### Setup Test Suite

```bash
# Install testing dependencies
npm install --save-dev @firebase/rules-unit-testing

# Create test file
touch firestore.rules.test.ts
```

### Example Test

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Firestore Rules', () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  test('Unauthenticated user cannot read games', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.collection('games').doc('game123').get());
  });

  test('Game member can read their game', async () => {
    const db = testEnv.authenticatedContext('user123').firestore();
    // First create game with user123 as member
    // Then test read
    await assertSucceeds(db.collection('games').doc('game123').get());
  });

  test('Player cannot modify opponent faction', async () => {
    const db = testEnv.authenticatedContext('user123').firestore();
    // user123 is US player
    await assertFails(
      db.collection('games').doc('game123').update({
        units: [/* China units */]
      })
    );
  });
});
```

## Deployment

### Deploy Rules to Production

```bash
# Preview changes (dry-run)
firebase deploy --only firestore:rules --dry-run

# Deploy rules only
firebase deploy --only firestore:rules

# Deploy rules and indexes together
firebase deploy --only firestore
```

### Verify Deployment

1. Go to Firebase Console
2. Navigate to: **Firestore → Rules**
3. Check **"Rules"** tab shows new version
4. Check **"History"** tab for deployment timestamp

### Rollback if Needed

```bash
# View previous versions
firebase firestore:rules list

# Rollback to specific version
firebase firestore:rules rollback <version-id>
```

## Monitoring

### Check Rule Violations

1. Go to Firebase Console
2. Navigate to: **Firestore → Usage**
3. Look for **"Permission denied"** spikes
4. Check logs for specific error patterns

### Common Issues

**High Permission Denied Count**:
- Check if legitimate users are getting blocked
- Review recent rule changes
- Test with affected user accounts

**Slow Rule Evaluation**:
- Too many `get()` calls in rules
- Complex nested conditions
- Consider caching or simplifying rules

## Checklist Before Production Deployment

- [ ] All manual tests pass
- [ ] Rules tested in emulator
- [ ] No breaking changes for existing users
- [ ] Backward compatibility maintained (if needed)
- [ ] Team reviewed rule changes
- [ ] Deployment window scheduled
- [ ] Rollback plan ready
- [ ] Monitoring dashboard prepared
- [ ] Users notified (if needed)

## Support

For issues or questions about Firestore rules:
1. Check Firebase documentation: https://firebase.google.com/docs/firestore/security/get-started
2. Review this project's rules documentation: `docs/FIRESTORE_RULES.md`
3. Test in emulator before asking for help
4. Include error logs and rule evaluation details
