// Seed Descriptions Service
// Populate leaders and civilizations with descriptions from text files
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "./config";

/**
 * Apply icon replacements to description text
 * Converts double spaces + keywords into [IconName] tags
 */
function applyIconReplacements(text) {
  if (!text) return text;

  // Icon replacements map
  const replacements = {
    "  Scienza": " [ScienceIcon] Scienza",
    "  Cultura": " [CultureIcon] Cultura",
    "  Fede": " [FaithIcon] Fede",
    "  Cibo": " [FoodIcon] Cibo",
    "  Produzione": " [ProductionIcon] Produzione",
    "  Oro": " [GoldIcon] Oro",
    "  Forza di combattimento": " [StrengthIcon] Forza di combattimento",
    "  Forza religiosa": " [ReligiousStrengthIcon] Forza religiosa",
    "  Turismo": " [TourismIcon] Turismo",
    "  Abitazioni": " [CitizenIcon] Abitazioni",
    "  Supporto diplomatico": " [DiplomaticFavorIcon] Supporto diplomatico",
    "  Emissari": " [EnvoyIcon] Emissari",
    "  Rotta commerciale": " [TradeRouteIcon] Rotta commerciale",
    "  Rotte commerciali": " [TradeRouteIcon] Rotte commerciali",
    "  capitale": " [CapitalIcon] capitale",
    "  Capitale": " [CapitalIcon] Capitale",
    "  Grande Profeta": " [GreatProphetIcon] Grande Profeta",
    "  Grande Persona": " [GreatPersonIcon] Grande Persona",
    "  Grande Scienziato": " [ScientistIcon] Grande Scienziato",
    "  Grande Mercante": " [MerchantIcon] Grande Mercante",
    "  Grande Generale": " [GeneralIcon] Grande Generale",
    "  Movimento": " [MovementIcon] Movimento",
    "  Energia": " [PowerIcon] Energia",
    "  Cittadini": " [CitizenIcon] Cittadini",
    "  Amenità": " [AmenitiesIcon] Amenità",
    "  Attrattiva": " [AmenitiesIcon] Attrattiva",
    "  Distretti": " [DistrictIcon] Distretti",
    "  Distretto": " [DistrictIcon] Distretto",
    "  Alleanza": " [AllianceIcon] Alleanza",
    "  turno": " [TurnIcon] turno",
    "  Lagnanze": " [GrievancesIcon] Lagnanze",
  };

  let processed = text;
  for (const [key, value] of Object.entries(replacements)) {
    processed = processed.replaceAll(key, value);
  }

  return processed;
}

/**
 * Parse ability text to extract name, type, and description
 * Format: [Ability Name] {Ability Type}\n\nDescription...
 */
function parseAbilityText(text) {
  const abilities = [];
  const lines = text.split(/\r?\n/); // Split by newlines (handles both \n and \r\n)

  let currentAbility = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if this line is an ability header: [Name] {Type}
    const headerMatch = trimmed.match(/^\[([^\]]+)\]\s*\{([^}]+)\}$/);

    if (headerMatch) {
      // Save previous ability if exists
      if (currentAbility && currentAbility.description.trim()) {
        // Apply icon replacements to description before saving
        currentAbility.description = applyIconReplacements(
          currentAbility.description,
        );
        abilities.push(currentAbility);
      }

      // Start new ability
      currentAbility = {
        name: headerMatch[1].trim(),
        type: headerMatch[2].trim(),
        description: "",
      };
    } else if (currentAbility && trimmed) {
      // This is description text for the current ability
      // Add line to description (preserve paragraph breaks)
      if (currentAbility.description) {
        currentAbility.description += "\n" + trimmed;
      } else {
        currentAbility.description = trimmed;
      }
    }
  }

  // Save last ability
  if (currentAbility && currentAbility.description.trim()) {
    // Apply icon replacements to description before saving
    currentAbility.description = applyIconReplacements(
      currentAbility.description,
    );
    abilities.push(currentAbility);
  }

  return abilities;
}

/**
 * Fetch description file from public folder
 */
async function fetchDescriptionFile(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const text = await response.text();
    return { success: true, text };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Seed leaders with descriptions from text files
 */
export async function seedLeadersDescriptions() {
  try {
    console.log("=== Seeding Leaders Descriptions ===");

    // Get all leaders from Firestore
    const leadersSnapshot = await getDocs(collection(db, "leaders"));
    const leaders = leadersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Found ${leaders.length} leaders in database`);

    let updated = 0;
    let notFound = 0;
    const errors = [];

    for (const leader of leaders) {
      // Construct filename from leader name and variant
      const fullName = leader.variant
        ? `${leader.name} (${leader.variant})`
        : leader.name;

      const filename = `/CivDescrizioni/DescrizionePersonaggi/${fullName}.txt`;

      console.log(`Fetching: ${filename}`);

      const result = await fetchDescriptionFile(filename);

      if (!result.success) {
        console.warn(`❌ Not found: ${filename}`);
        console.warn(`   Error: ${result.error}`);
        console.warn(
          `   Hint: Se hai appena aggiunto il file, riavvia il server dev (npm run dev)`,
        );
        notFound++;
        continue;
      }

      // Debug: log first 100 chars of text
      console.log(`   Text preview: ${result.text.substring(0, 100)}...`);

      // Parse abilities from text
      const abilities = parseAbilityText(result.text);

      if (abilities.length === 0) {
        console.warn(`⚠️ No abilities parsed for: ${fullName}`);
        console.warn(`   Raw text length: ${result.text.length}`);
        continue;
      }

      // Update leader document
      const leaderRef = doc(db, "leaders", leader.id);
      await updateDoc(leaderRef, {
        abilities: abilities,
        updatedAt: new Date().toISOString(),
      });

      console.log(
        `✅ Updated ${fullName}: ${abilities.length} abilities (icons auto-applied)`,
      );
      updated++;
    }

    console.log("\n=== Seeding Complete ===");
    console.log(`✅ Updated: ${updated}`);
    console.log(`❌ Not found: ${notFound}`);

    return {
      success: true,
      total: leaders.length,
      updated,
      notFound,
      errors,
    };
  } catch (error) {
    console.error("Error seeding leaders descriptions:", error);
    return {
      success: false,
      error: error.message,
      total: 0,
      updated: 0,
      notFound: 0,
    };
  }
}

/**
 * Seed civilizations with descriptions from text files
 * Civilizations are stored in leader documents, so we need to:
 * 1. Get unique civilizations from leaders
 * 2. Fetch their description files
 * 3. Update all leaders of that civilization with the civ description
 */
export async function seedCivilizationsDescriptions() {
  try {
    console.log("=== Seeding Civilizations Descriptions ===");

    // Get all leaders from Firestore
    const leadersSnapshot = await getDocs(collection(db, "leaders"));
    const leaders = leadersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get unique civilizations
    const civilizations = [
      ...new Set(leaders.map((leader) => leader.civilization)),
    ];

    console.log(`Found ${civilizations.length} unique civilizations`);

    let updated = 0;
    const civDescriptions = {};

    for (const civilization of civilizations) {
      const filename = `/CivDescrizioni/DescrizioneCiviltà/${civilization}.txt`;

      console.log(`Fetching: ${filename}`);

      const result = await fetchDescriptionFile(filename);

      if (!result.success) {
        console.warn(`❌ Not found: ${filename} (${result.error})`);
        continue;
      }

      // Parse abilities from text
      const abilities = parseAbilityText(result.text);

      if (abilities.length === 0) {
        console.warn(`⚠️ No abilities parsed for: ${civilization}`);
        continue;
      }

      // Store for updating leaders
      civDescriptions[civilization] = abilities;
    }

    // Update all leaders with their civilization's abilities
    for (const leader of leaders) {
      const civAbilities = civDescriptions[leader.civilization];

      if (!civAbilities) {
        continue;
      }

      const leaderRef = doc(db, "leaders", leader.id);
      await updateDoc(leaderRef, {
        civilizationAbilities: civAbilities,
        updatedAt: new Date().toISOString(),
      });

      console.log(
        `✅ Updated ${leader.name} [${leader.civilization}]: ${civAbilities.length} civ abilities (icons auto-applied)`,
      );
      updated++;
    }

    console.log("\n=== Seeding Complete ===");
    console.log(`✅ Updated: ${updated} leaders`);
    console.log(`📚 Civilizations: ${Object.keys(civDescriptions).length}`);

    return {
      success: true,
      total: civilizations.length,
      updated: Object.keys(civDescriptions).length,
    };
  } catch (error) {
    console.error("Error seeding civilizations descriptions:", error);
    return {
      success: false,
      error: error.message,
      total: 0,
      updated: 0,
    };
  }
}
