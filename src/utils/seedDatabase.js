// Database Seeding Utility
// Import this in your dev environment to populate the database

import {
  seedLeaders,
  verifyLeaderIcons,
} from "../services/firebase/seedLeaders";

/**
 * Run database seeding
 * Call this function from browser console or a dev page
 */
export const runSeeding = async () => {
  console.log("=== CivTracker Database Seeding ===");
  console.log("");

  // Step 1: Verify data
  console.log("Step 1: Verifying leader data...");
  const leaders = verifyLeaderIcons();
  console.log(`Found ${leaders.length} leaders to seed`);
  console.log("");

  // Step 2: Confirm
  const confirmed = window.confirm(
    `Ready to seed ${leaders.length} leaders into Firestore database.\n\n` +
      "This will create documents in the 'leaders' collection.\n\n" +
      "Continue?",
  );

  if (!confirmed) {
    console.log("❌ Seeding cancelled by user");
    return;
  }

  // Step 3: Seed database
  console.log("Step 2: Seeding database...");
  const result = await seedLeaders();

  if (result.success) {
    console.log("");
    console.log("=== ✨ Seeding Complete! ===");
    console.log(`✅ Successfully added ${result.count} leaders`);
    console.log("");
    console.log("You can now:");
    console.log("- View leaders in Firebase Console");
    console.log("- Query leaders using leader service functions");
    console.log("- Build UI components to display leaders");
  } else {
    console.log("");
    console.log("=== ❌ Seeding Failed ===");
    console.log(`Error: ${result.error}`);
  }
};

// Expose to window for easy access in console
if (typeof window !== "undefined") {
  window.seedDatabase = runSeeding;
  window.verifyLeaders = verifyLeaderIcons;
}

export default runSeeding;
