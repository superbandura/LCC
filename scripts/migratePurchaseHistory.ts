/**
 * Migration Script: Initialize Purchase History for Existing Games
 *
 * This script migrates existing games that don't have the purchaseHistory field.
 * It counts all cards purchased across all game states and initializes the counter.
 *
 * Run with: npx tsx scripts/migratePurchaseHistory.ts
 */

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Card,
  OperationalArea,
  PurchasedCards,
  PendingDeployments,
  Unit,
  SubmarineCampaignState,
  PurchaseHistory
} from '../types';

const GAME_DOC_REF = doc(db, 'game', 'current');

async function migratePurchaseHistory() {
  console.log('🔄 Starting purchase history migration...\n');

  try {
    // Read current game state
    const docSnap = await getDoc(GAME_DOC_REF);

    if (!docSnap.exists()) {
      console.error('❌ Game document does not exist. Nothing to migrate.');
      return;
    }

    const data = docSnap.data();

    // Check if purchaseHistory already exists
    if (data.purchaseHistory) {
      console.log('ℹ️  purchaseHistory already exists:');
      console.log(`   - US: ${data.purchaseHistory.us}`);
      console.log(`   - China: ${data.purchaseHistory.china}`);
      console.log('\n⚠️  Migration not needed. Exiting.');
      return;
    }

    console.log('✓ purchaseHistory field not found. Calculating from existing data...\n');

    // Get all relevant data
    const cards: Card[] = data.cards || [];
    const operationalAreas: OperationalArea[] = data.operationalAreas || [];
    const purchasedCards: PurchasedCards = data.purchasedCards || { us: [], china: [] };
    const pendingDeployments: PendingDeployments = data.pendingDeployments || { cards: [], units: [], taskForces: [] };
    const units: Unit[] = data.units || [];
    const submarineCampaign: SubmarineCampaignState = data.submarineCampaign || {
      deployedSubmarines: [],
      events: [],
      currentTurn: 0,
      usedSubmarineNames: { us: [], china: [] }
    };

    // Count cards per faction
    let usCount = 0;
    let chinaCount = 0;

    // 1. Count cards in purchasedCards (not yet deployed)
    usCount += purchasedCards.us.length;
    chinaCount += purchasedCards.china.length;
    console.log(`📦 Purchased cards (not deployed):`);
    console.log(`   - US: ${purchasedCards.us.length}`);
    console.log(`   - China: ${purchasedCards.china.length}`);

    // 2. Count cards in operational areas (assignedCards + playedCards)
    let assignedUS = 0;
    let assignedChina = 0;
    let playedUS = 0;
    let playedChina = 0;

    operationalAreas.forEach(area => {
      // Count assignedCards
      if (area.assignedCards) {
        area.assignedCards.forEach(instanceId => {
          // Extract card ID from instance ID (format: "us-001_1234567890")
          const cardId = instanceId.includes('_') ? instanceId.split('_')[0] : instanceId;
          const card = cards.find(c => c.id === cardId);
          if (card) {
            if (card.faction === 'us') assignedUS++;
            else if (card.faction === 'china') assignedChina++;
          }
        });
      }

      // Count playedCards
      if (area.playedCards) {
        area.playedCards.forEach(id => {
          // playedCards might also use instance IDs
          const cardId = id.includes('_') ? id.split('_')[0] : id;
          const card = cards.find(c => c.id === cardId);
          if (card) {
            if (card.faction === 'us') playedUS++;
            else if (card.faction === 'china') playedChina++;
          }
        });
      }
    });

    usCount += assignedUS + playedUS;
    chinaCount += assignedChina + playedChina;
    console.log(`\n🗺️  Cards in operational areas:`);
    console.log(`   - US assigned: ${assignedUS}`);
    console.log(`   - US played: ${playedUS}`);
    console.log(`   - China assigned: ${assignedChina}`);
    console.log(`   - China played: ${playedChina}`);

    // 3. Count cards in pending deployments
    let pendingUS = 0;
    let pendingChina = 0;
    if (pendingDeployments.cards) {
      pendingDeployments.cards.forEach(dep => {
        if (dep.faction === 'us') pendingUS++;
        else if (dep.faction === 'china') pendingChina++;
      });
    }
    usCount += pendingUS;
    chinaCount += pendingChina;
    console.log(`\n⏳ Cards in pending deployments:`);
    console.log(`   - US: ${pendingUS}`);
    console.log(`   - China: ${pendingChina}`);

    // 4. Count cards attached to units
    let attachedUS = 0;
    let attachedChina = 0;
    units.forEach(unit => {
      if (unit.attachedCard) {
        if (unit.faction === 'us') attachedUS++;
        else if (unit.faction === 'china') attachedChina++;
      }
    });
    usCount += attachedUS;
    chinaCount += attachedChina;
    console.log(`\n🔗 Cards attached to units:`);
    console.log(`   - US: ${attachedUS}`);
    console.log(`   - China: ${attachedChina}`);

    // 5. Count cards in submarine campaign
    let subUS = 0;
    let subChina = 0;
    if (submarineCampaign.deployedSubmarines) {
      submarineCampaign.deployedSubmarines.forEach(sub => {
        if (sub.faction === 'us') subUS++;
        else if (sub.faction === 'china') subChina++;
      });
    }
    usCount += subUS;
    chinaCount += subChina;
    console.log(`\n🌊 Cards in submarine campaign:`);
    console.log(`   - US: ${subUS}`);
    console.log(`   - China: ${subChina}`);

    // Create purchaseHistory object
    const purchaseHistory: PurchaseHistory = {
      us: usCount,
      china: chinaCount
    };

    console.log(`\n📊 TOTAL CARDS PURCHASED:`);
    console.log(`   - US: ${usCount}`);
    console.log(`   - China: ${chinaCount}`);

    // Update Firestore
    console.log(`\n💾 Updating Firestore...`);
    await updateDoc(GAME_DOC_REF, {
      purchaseHistory: purchaseHistory
    });

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`\n🎯 Purchase history initialized:`);
    console.log(`   - US: ${purchaseHistory.us} cards`);
    console.log(`   - China: ${purchaseHistory.china} cards`);
    console.log(`\n🔄 Please refresh your browser to see the updated counter.`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migratePurchaseHistory()
  .then(() => {
    console.log('\n✓ Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Migration script failed:', error);
    process.exit(1);
  });
