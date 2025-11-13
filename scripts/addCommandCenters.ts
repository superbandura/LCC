/**
 * Temporary script to add Command Centers to existing games
 * This script updates the operationalAreas in Firestore to include the two Command Centers
 */

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { OperationalArea } from "../types";

// Command Centers to add
const commandCenters: OperationalArea[] = [
  {
    id: "command-center-us",
    name: "Command Center US Navy",
    bounds: [[0, 0], [0, 0]],
    color: "#F59E0B",
    fillOpacity: 0.05,
    assignedCards: [],
    playedCards: [],
    isCommandCenter: true,
    faction: "us"
  },
  {
    id: "command-center-china",
    name: "Command Center PLAN",
    bounds: [[0, 0], [0, 0]],
    color: "#F59E0B",
    fillOpacity: 0.05,
    assignedCards: [],
    playedCards: [],
    isCommandCenter: true,
    faction: "china"
  }
];

async function addCommandCentersToGame(gameId: string) {
  console.log(`\n🔧 Adding Command Centers to game: ${gameId}`);

  try {
    // Get game document reference
    const gameRef = doc(db, "games", gameId);

    // Get current game data
    const gameSnap = await getDoc(gameRef);

    if (!gameSnap.exists()) {
      console.error(`❌ Game ${gameId} does not exist`);
      return;
    }

    const gameData = gameSnap.data();
    const currentAreas = gameData.operationalAreas || [];

    console.log(`📊 Current operational areas: ${currentAreas.length}`);

    // Check if Command Centers already exist
    const hasUSCommandCenter = currentAreas.some((area: any) => area.id === "command-center-us");
    const hasChinaCommandCenter = currentAreas.some((area: any) => area.id === "command-center-china");

    if (hasUSCommandCenter && hasChinaCommandCenter) {
      console.log("✅ Command Centers already exist in this game");
      return;
    }

    // Convert Command Centers bounds to flat format for Firestore
    const flatCommandCenters = commandCenters.map(center => {
      const [topLeft, bottomRight] = center.bounds;
      return {
        ...center,
        bounds: [topLeft[0], topLeft[1], bottomRight[0], bottomRight[1]]
      };
    });

    // Add Command Centers at the beginning of the array
    const updatedAreas = [...flatCommandCenters, ...currentAreas];

    // Update Firestore
    await updateDoc(gameRef, {
      operationalAreas: updatedAreas
    });

    console.log(`✅ Command Centers added successfully`);
    console.log(`📊 Total operational areas now: ${updatedAreas.length}`);

  } catch (error) {
    console.error("❌ Error adding Command Centers:", error);
    throw error;
  }
}

// Main execution
async function main() {
  console.log("🚀 Command Center Addition Script");
  console.log("=" .repeat(50));

  // Get game ID from command line argument
  const gameId = process.argv[2];

  if (!gameId) {
    console.error("\n❌ Error: Game ID is required");
    console.log("\nUsage: npx tsx scripts/addCommandCenters.ts <gameId>");
    console.log("\nExample: npx tsx scripts/addCommandCenters.ts abc123");
    process.exit(1);
  }

  try {
    await addCommandCentersToGame(gameId);
    console.log("\n✨ Script completed successfully");
  } catch (error) {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  }
}

main();
