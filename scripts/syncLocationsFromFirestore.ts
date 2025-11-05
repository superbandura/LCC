import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Location } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function syncLocationsFromFirestore() {
  try {
    console.log('Fetching locations from Firestore...');

    // Get the game document
    const gameDocRef = doc(db, 'game', 'current');
    const gameDoc = await getDoc(gameDocRef);

    if (!gameDoc.exists()) {
      console.error('Game document does not exist in Firestore');
      return;
    }

    const data = gameDoc.data();
    const locations = data.locations as Location[];

    if (!locations || !Array.isArray(locations)) {
      console.error('No locations found in Firestore document');
      return;
    }

    console.log(`Found ${locations.length} locations in Firestore`);

    // Generate the TypeScript file content
    const fileContent = `import { Location } from '../types';

// This file was auto-generated from Firestore data
// Last updated: ${new Date().toISOString()}
// Total locations: ${locations.length}

export const locations: Location[] = ${JSON.stringify(locations, null, 2)};
`;

    // Write to file
    const filePath = path.join(__dirname, '..', 'data', 'locations.ts');
    fs.writeFileSync(filePath, fileContent, 'utf-8');

    console.log(`Successfully wrote ${locations.length} locations to ${filePath}`);
    console.log('\nLocations by country:');
    const byCountry = locations.reduce((acc, loc) => {
      acc[loc.country] = (acc[loc.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    Object.entries(byCountry).forEach(([country, count]) => {
      console.log(`  ${country}: ${count}`);
    });

  } catch (error) {
    console.error('Error syncing locations from Firestore:', error);
  }
}

// Run the sync
syncLocationsFromFirestore()
  .then(() => {
    console.log('\nSync complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Sync failed:', error);
    process.exit(1);
  });
