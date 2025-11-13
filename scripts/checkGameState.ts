/**
 * Script to check current game state in Firestore for testing
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Firebase configuration (from firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyAyEK4dSW4RG_6R05A6-5XCK-yI1uXe0O8",
  authDomain: "lcc-v2.firebaseapp.com",
  projectId: "lcc-v2",
  storageBucket: "lcc-v2.firebasestorage.app",
  messagingSenderId: "542551001037",
  appId: "1:542551001037:web:d09d34cea07f88ddae42b5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkGameState() {
  try {
    console.log('🔍 CHECKING FIRESTORE STATE...\n');

    // List all games
    console.log('📋 GAMES:');
    const gamesSnapshot = await getDocs(collection(db, 'games'));

    if (gamesSnapshot.empty) {
      console.log('  ❌ No games found');
      return;
    }

    gamesSnapshot.forEach((gameDoc) => {
      const gameId = gameDoc.id;
      console.log(`\n  Game ID: ${gameId}`);
    });

    // Check first game's state
    const firstGameId = gamesSnapshot.docs[0].id;
    console.log(`\n\n🎮 CHECKING GAME: ${firstGameId}\n`);

    // Get metadata
    const metadataRef = doc(db, 'games', firstGameId, 'metadata', 'info');
    const metadataSnap = await getDoc(metadataRef);

    if (metadataSnap.exists()) {
      const metadata = metadataSnap.data();
      console.log('📊 METADATA:');
      console.log(`  Name: ${metadata.name}`);
      console.log(`  Creator: ${metadata.creatorUid}`);
      console.log(`  Visibility: ${metadata.visibility}`);
      console.log(`  Players: ${Object.keys(metadata.players || {}).length}`);

      if (metadata.players) {
        console.log('\n👥 PLAYERS:');
        Object.entries(metadata.players).forEach(([uid, player]: [string, any]) => {
          console.log(`  - ${uid}: ${player.displayName} (${player.role})`);
        });
      }
    }

    // Get game state
    const stateRef = doc(db, 'games', firstGameId, 'state', 'current');
    const stateSnap = await getDoc(stateRef);

    if (stateSnap.exists()) {
      const state = stateSnap.data();

      console.log('\n🎯 TURN STATE:');
      if (state.turnState) {
        console.log(`  Current Date: ${state.turnState.currentDate}`);
        console.log(`  Turn Number: ${state.turnState.turnNumber}`);
        console.log(`  Day of Week: ${state.turnState.dayOfWeek}`);
        console.log(`  Is Pre-Planning: ${state.turnState.isPrePlanningPhase || false}`);
        console.log(`  Is Planning: ${state.turnState.isPlanningPhase || false}`);
      }

      console.log('\n👤 REGISTERED PLAYERS:');
      const registeredPlayers = state.registeredPlayers || [];
      if (registeredPlayers.length === 0) {
        console.log('  ❌ No registered players');
      } else {
        registeredPlayers.forEach((player: any) => {
          console.log(`  - ${player.playerName} (${player.faction.toUpperCase()})`);
        });
      }

      console.log('\n📍 PLAYER ASSIGNMENTS:');
      const playerAssignments = state.playerAssignments || [];
      if (playerAssignments.length === 0) {
        console.log('  ❌ No player assignments');
      } else {
        playerAssignments.forEach((assignment: any) => {
          console.log(`  - ${assignment.playerName} → ${assignment.operationalAreaId} (${assignment.faction.toUpperCase()})`);
        });
      }

      // Calculate unassigned players
      const unassigned = registeredPlayers.filter((rp: any) =>
        !playerAssignments.some((pa: any) => pa.playerName === rp.playerName)
      );

      console.log('\n⚠️  UNASSIGNED PLAYERS:');
      if (unassigned.length === 0) {
        console.log('  ✅ All players assigned');
      } else {
        console.log(`  ⚠️  ${unassigned.length} player(s) unassigned:`);
        unassigned.forEach((player: any) => {
          console.log(`    - ${player.playerName} (${player.faction.toUpperCase()})`);
        });
      }
    }

    console.log('\n✅ Check complete');

  } catch (error) {
    console.error('❌ Error checking game state:', error);
  }
}

checkGameState();
