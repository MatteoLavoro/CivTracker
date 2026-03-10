// Seed Descriptions Service
// Populate leaders and civilizations with descriptions from text files
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "./config";

/**
 * Apply icon replacements to description text
 * - Converts double spaces + keywords into [IconName] tags
 * - Fixes incorrect icons
 * - Preserves newlines and does NOT touch ability names [Name] or types {Type}
 */
function applyIconReplacements(text) {
  if (!text) return text;

  let processed = text;

  // Step 1: Fix incorrect icons that might exist
  const iconCorrections = [
    // Corregge icone sbagliate comuni
    { wrong: /\[StreghtIcon\]/g, correct: "[StrengthIcon]" },
    {
      wrong: /\[ProductionIcon\] Forza di combattimento/g,
      correct: "[StrengthIcon] Forza di combattimento",
    },
    {
      wrong: /\[ProductionIcon\] Forza religiosa/g,
      correct: "[ReligiousStrengthIcon] Forza religiosa",
    },
    {
      wrong: /\[GoldIcon\] Rotta commerciale/g,
      correct: "[TradeRouteIcon] Rotta commerciale",
    },
    {
      wrong: /\[GoldIcon\] Rotte commerciali/g,
      correct: "[TradeRouteIcon] Rotte commerciali",
    },
    {
      wrong: /\[DiplomaticFavorIcon\] Emissari/g,
      correct: "[EnvoyIcon] Emissari",
    },
    {
      wrong: /\[GreatPersonIcon\] Grande Profeta/g,
      correct: "[GreatProphetIcon] Grande Profeta",
    },
    { wrong: /\[CultureIcon\] Turismo/g, correct: "[TourismIcon] Turismo" },
  ];

  for (const { wrong, correct } of iconCorrections) {
    processed = processed.replace(wrong, correct);
  }

  // Step 2: Remove duplicate icons (e.g., "[Icon] [Icon] Word" -> "[Icon] Word")
  const iconPattern = /(\[[A-Z][a-zA-Z]+Icon\])\s*\1/g;
  processed = processed.replace(iconPattern, "$1");

  // Step 3: Add missing icons - replace only if icon not already present
  // IMPORTANTE: Non tocca mai il contenuto tra [] e {} (titoli e tipi delle abilità)
  const replacements = [
    // Risorse base
    { pattern: /\s{2,}Scienza(?!\])/g, replacement: " [ScienceIcon] Scienza" },
    { pattern: /\s{2,}Cultura(?!\])/g, replacement: " [CultureIcon] Cultura" },
    { pattern: /\s{2,}Fede(?!\])/g, replacement: " [FaithIcon] Fede" },
    { pattern: /\s{2,}Cibo(?!\])/g, replacement: " [FoodIcon] Cibo" },
    {
      pattern: /\s{2,}Produzione(?!\])/g,
      replacement: " [ProductionIcon] Produzione",
    },
    { pattern: /\s{2,}Oro(?!\])/g, replacement: " [GoldIcon] Oro" },
    { pattern: /\s{2,}Turismo(?!\])/g, replacement: " [TourismIcon] Turismo" },

    // Risorse strategiche
    { pattern: /\s{2,}Ferro(?!\])/g, replacement: " [IronIcon] Ferro" },
    { pattern: /\s{2,}Carbone(?!\])/g, replacement: " [CoalIcon] Carbone" },
    { pattern: /\s{2,}Petrolio(?!\])/g, replacement: " [OilIcon] Petrolio" },
    {
      pattern: /\s{2,}Alluminio(?!\])/g,
      replacement: " [AluminumIcon] Alluminio",
    },
    { pattern: /\s{2,}Uranio(?!\])/g, replacement: " [UraniumIcon] Uranio" },

    // Combattimento
    {
      pattern: /\s{2,}Forza di combattimento(?!\])/g,
      replacement: " [StrengthIcon] Forza di combattimento",
    },
    {
      pattern: /\s{2,}Forza religiosa(?!\])/g,
      replacement: " [ReligiousStrengthIcon] Forza religiosa",
    },
    {
      pattern: /\s{2,}Movimento(?!\])/g,
      replacement: " [MovementIcon] Movimento",
    },
    {
      pattern: /\s{2,}Promozione(?!\])/g,
      replacement: " [PromotionIcon] Promozione",
    },
    {
      pattern: /\s{2,}Promozioni(?!\])/g,
      replacement: " [PromotionIcon] Promozioni",
    },

    // Città e popolazione
    {
      pattern: /\s{2,}Abitazioni(?!\])/g,
      replacement: " [CitizenIcon] Abitazioni",
    },
    {
      pattern: /\s{2,}Cittadini(?!\])/g,
      replacement: " [CitizenIcon] Cittadini",
    },
    {
      pattern: /\s{2,}Amenità(?!\])/g,
      replacement: " [AmenitiesIcon] Amenità",
    },
    {
      pattern: /\s{2,}Attrattiva(?!\])/g,
      replacement: " [AmenitiesIcon] Attrattiva",
    },
    {
      pattern: /\s{2,}capitale(?!\])/g,
      replacement: " [CapitalIcon] capitale",
    },
    {
      pattern: /\s{2,}Capitale(?!\])/g,
      replacement: " [CapitalIcon] Capitale",
    },
    {
      pattern: /\s{2,}Distretti(?!\])/g,
      replacement: " [DistrictIcon] Distretti",
    },
    {
      pattern: /\s{2,}Distretto(?!\])/g,
      replacement: " [DistrictIcon] Distretto",
    },

    // Diplomazia
    {
      pattern: /\s{2,}Supporto diplomatico(?!\])/g,
      replacement: " [DiplomaticFavorIcon] Supporto diplomatico",
    },
    { pattern: /\s{2,}Emissari(?!\])/g, replacement: " [EnvoyIcon] Emissari" },
    {
      pattern: /\s{2,}Alleanza(?!\])/g,
      replacement: " [AllianceIcon] Alleanza",
    },
    {
      pattern: /\s{2,}Lagnanze(?!\])/g,
      replacement: " [GrievancesIcon] Lagnanze",
    },

    // Commercio
    {
      pattern: /\s{2,}Rotte commerciali(?!\])/g,
      replacement: " [TradeRouteIcon] Rotte commerciali",
    },
    {
      pattern: /\s{2,}Rotta commerciale(?!\])/g,
      replacement: " [TradeRouteIcon] Rotta commerciale",
    },
    {
      pattern: /\s{2,}Emporio commerciale(?!\])/g,
      replacement: " [TradingPostIcon] Emporio commerciale",
    },
    {
      pattern: /\s{2,}Empori commerciali(?!\])/g,
      replacement: " [TradingPostIcon] Empori commerciali",
    },

    // Grandi Persone
    {
      pattern: /\s{2,}Grande Profeta(?!\])/g,
      replacement: " [GreatProphetIcon] Grande Profeta",
    },
    {
      pattern: /\s{2,}Grande Persona(?!\])/g,
      replacement: " [GreatPersonIcon] Grande Persona",
    },
    {
      pattern: /\s{2,}Grande Scienziato(?!\])/g,
      replacement: " [ScientistIcon] Grande Scienziato",
    },
    {
      pattern: /\s{2,}Grande Mercante(?!\])/g,
      replacement: " [MerchantIcon] Grande Mercante",
    },
    {
      pattern: /\s{2,}Grande Generale(?!\])/g,
      replacement: " [GeneralIcon] Grande Generale",
    },

    // Meccaniche speciali
    { pattern: /\s{2,}Eureka(?!\])/g, replacement: " [EurekaIcon] Eureka" },
    { pattern: /\s{2,}eureka(?!\])/g, replacement: " [EurekaIcon] eureka" },
    {
      pattern: /\s{2,}Ispirazione(?!\])/g,
      replacement: " [InspirationIcon] Ispirazione",
    },
    {
      pattern: /\s{2,}ispirazione(?!\])/g,
      replacement: " [InspirationIcon] ispirazione",
    },
    {
      pattern: /\s{2,}cariche(?!\])/g,
      replacement: " [BuildChargesIcon] cariche",
    },

    // Cultura e opere
    { pattern: /\s{2,}Reliquia(?!\])/g, replacement: " [RelicIcon] Reliquia" },
    { pattern: /\s{2,}Reliquie(?!\])/g, replacement: " [RelicIcon] Reliquie" },
    {
      pattern: /\s{2,}Grande opera d'arte(?!\])/g,
      replacement: " [GreatWorkArtIcon] Grande opera d'arte",
    },
    {
      pattern: /\s{2,}Grande opera musicale(?!\])/g,
      replacement: " [GreatWorkMusicIcon] Grande opera musicale",
    },
    {
      pattern: /\s{2,}Grande opera letteraria(?!\])/g,
      replacement: " [GreatWorkWritingIcon] Grande opera letteraria",
    },

    // Altro
    { pattern: /\s{2,}Energia(?!\])/g, replacement: " [PowerIcon] Energia" },
    { pattern: /\s{2,}turno(?!\])/g, replacement: " [TurnIcon] turno" },
  ];

  // Apply each replacement
  for (const { pattern, replacement } of replacements) {
    processed = processed.replace(pattern, replacement);
  }

  // Step 4: Clean up multiple spaces before icons (e.g., "alla  [Icon]" -> "alla [Icon]")
  processed = processed.replace(/\s{2,}(\[[A-Z][a-zA-Z]+Icon\])/g, " $1");

  // Step 5: Clean up any remaining triple+ spaces (but preserve newlines!)
  // Solo gli spazi, non i \n
  processed = processed.replace(/ {3,}/g, " ");

  // NOTE: NON rimuoviamo i \n (a capo) perché preserviamo la formattazione
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
