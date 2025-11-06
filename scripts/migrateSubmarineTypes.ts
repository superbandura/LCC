import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Card, SubmarineDeployment, SubmarineEvent, SubmarineCampaignState } from '../types';

async function migrateSubmarineTypes() {
  try {
    console.log('🔧 Starting submarine type migration...\n');

    // Get game document from Firestore
    const gameDocRef = doc(db, 'game', 'current');
    const gameDoc = await getDoc(gameDocRef);

    if (!gameDoc.exists()) {
      console.error('❌ Game document not found in Firestore');
      return;
    }

    const data = gameDoc.data();
    const cards = data.cards as Card[];
    const submarineCampaign = data.submarineCampaign as SubmarineCampaignState;

    if (!cards || !Array.isArray(cards)) {
      console.error('❌ Cards not found in Firestore');
      return;
    }

    if (!submarineCampaign) {
      console.error('❌ Submarine campaign data not found in Firestore');
      return;
    }

    console.log(`📊 Found ${cards.length} cards in database`);
    console.log(`📊 Found ${submarineCampaign.deployedSubmarines?.length || 0} deployed submarines`);
    console.log(`📊 Found ${submarineCampaign.events?.length || 0} submarine events\n`);

    // Create card lookup map for fast access
    const cardMap = new Map<string, Card>();
    cards.forEach(card => {
      cardMap.set(card.id, card);
    });

    let deploymentsUpdated = 0;
    let eventsUpdated = 0;
    let errors = 0;

    // Process deployed submarines
    if (submarineCampaign.deployedSubmarines && Array.isArray(submarineCampaign.deployedSubmarines)) {
      console.log('🔍 Checking deployed submarines...');

      submarineCampaign.deployedSubmarines.forEach((deployment: SubmarineDeployment, index: number) => {
        if (!deployment.submarineType) {
          const card = cardMap.get(deployment.cardId);

          if (card && card.submarineType) {
            deployment.submarineType = card.submarineType;
            deploymentsUpdated++;
            console.log(`  ✅ Updated deployment #${index + 1}: ${deployment.submarineName} (${deployment.cardId}) → submarineType: ${card.submarineType}`);
          } else if (!card) {
            errors++;
            console.log(`  ⚠️  Card not found for deployment #${index + 1}: ${deployment.submarineName} (${deployment.cardId})`);
          } else if (!card.submarineType) {
            errors++;
            console.log(`  ⚠️  Card ${deployment.cardId} has no submarineType property`);
          }
        }
      });
    }

    // Process submarine events
    if (submarineCampaign.events && Array.isArray(submarineCampaign.events)) {
      console.log('\n🔍 Checking submarine events...');

      submarineCampaign.events.forEach((event: SubmarineEvent, index: number) => {
        if (!event.submarineType) {
          const card = cardMap.get(event.cardId);

          if (card && card.submarineType) {
            event.submarineType = card.submarineType;
            eventsUpdated++;
            console.log(`  ✅ Updated event #${index + 1}: ${event.submarineName} (${event.cardId}) → submarineType: ${card.submarineType}`);
          } else if (!card) {
            errors++;
            console.log(`  ⚠️  Card not found for event #${index + 1}: ${event.submarineName} (${event.cardId})`);
          } else if (!card.submarineType) {
            errors++;
            console.log(`  ⚠️  Card ${event.cardId} has no submarineType property`);
          }
        }
      });
    }

    console.log('\n📈 Migration Summary:');
    console.log(`  - Deployments updated: ${deploymentsUpdated}`);
    console.log(`  - Events updated: ${eventsUpdated}`);
    console.log(`  - Errors encountered: ${errors}`);

    // Update Firestore if changes were made
    if (deploymentsUpdated > 0 || eventsUpdated > 0) {
      console.log('\n💾 Updating Firestore...');

      await updateDoc(gameDocRef, {
        submarineCampaign: submarineCampaign
      });

      console.log('✅ Firestore updated successfully!');
    } else {
      console.log('\n✨ No updates needed - all records already have submarineType');
    }

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

// Run the migration
migrateSubmarineTypes()
  .then(() => {
    console.log('\n🎉 Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
