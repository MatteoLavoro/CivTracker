// Seed Leaders Database
// Run this once to populate the leaders collection in Firestore
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./config";

/**
 * Parse leader entry from text format
 * @param {string} entry - Leader entry string (e.g., "Abraham Lincoln [America]")
 * @param {number} number - Position in alphabetical order
 * @returns {Object} Leader object
 */
function parseLeaderEntry(entry, number) {
  // Extract civilization (text between square brackets)
  const civilizationMatch = entry.match(/\[([^\]]+)\]/);
  const civilization = civilizationMatch ? civilizationMatch[1] : "";

  // Extract name (everything before the civilization)
  let fullName = entry.replace(/\s*\[.*?\]\s*$/, "").trim();

  // Check for variant (text in parentheses)
  let name = fullName;
  let variant = null;

  const variantMatch = fullName.match(/^(.+?)\s*\((.+)\)$/);
  if (variantMatch) {
    name = variantMatch[1].trim();
    variant = variantMatch[2].trim();
  }

  // Generate ID (slug)
  const id = fullName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();

  // Generate icon paths
  const leaderIconPath = `/IconePersonaggi/${fullName} [${civilization}].webp`;
  const civilizationIconPath = `/IconeCiviltà/[${civilization}].webp`;

  return {
    id,
    number,
    name,
    civilization,
    variant,
    leaderIconPath,
    civilizationIconPath,
    description: "",
    // Future fields
    abilities: [],
    agenda: "",
    uniqueUnits: [],
    uniqueBuildings: [],
    uniqueDistricts: [],
    stats: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Complete list of leaders from ListaPersonaggiCiviltà.txt
const LEADERS_LIST = [
  "Abraham Lincoln [America]",
  "Alessandro [Macedonia]",
  "Amanitore [Nubia]",
  "Ambiorix [Gallia]",
  "Ba Trieu [Vietnam]",
  "Basilio II [Bisanzio]",
  "Caterina de' Medici (La Magnifica) [Francia]",
  "Caterina de' Medici (Regina Nera) [Francia]",
  "Chandragupta [India]",
  "Ciro [Persia]",
  "Cleopatra (Egiziana) [Egitto]",
  "Cleopatra (Tolemaica) [Egitto]",
  "Cristina [Svezia]",
  "Didone [Fenicia]",
  "Edvige [Polonia]",
  "Eleonora d'Aquitania (Francia) [Francia]",
  "Eleonora d'Aquitania (Inghilterra) [Inghilterra]",
  "Elisabetta I [Inghilterra]",
  "Federico Barbarossa [Germania]",
  "Filippo II [Spagna]",
  "Gandhi [India]",
  "Genghis Khan [Mongolia]",
  "Gilgamesh [Sumeria]",
  "Gitarja [Indonesia]",
  "Giulio Cesare [Roma]",
  "Gorgo [Grecia]",
  "Guglielmina [Olanda]",
  "Hammurabi [Babilonia]",
  "Harald Hardrada (Konge) [Norvegia]",
  "Harald Hardrada (Variago) [Norvegia]",
  "Hojo Tokimune [Giappone]",
  "Jayavarman VII [Khmer]",
  "João III [Portogallo]",
  "John Curtin [Australia]",
  "Kublai Khan (Cina) [Cina]",
  "Kublai Khan (Mongolia) [Mongolia]",
  "Kupe [Maori]",
  "Lautaro [Mapuche]",
  "Ludovico II [Germania]",
  "Mansa Musa [Mali]",
  "Mattia Corvino [Ungheria]",
  "Menelik II [Etiopia]",
  "Montezuma [Aztechi]",
  "Mvemba a Nzinga [Congo]",
  "Nadir Shah [Persia]",
  "Nzinga Mbande [Congo]",
  "Pachacuti [Inca]",
  "Pedro II [Brasile]",
  "Pericle [Grecia]",
  "Pietro [Russia]",
  "Poundmaker [Cree]",
  "Qin Shi Huang (Mandato Divino) [Cina]",
  "Qin Shi Huang (Unificatore) [Cina]",
  "Ramses II [Egitto]",
  "Robert Bruce [Scozia]",
  "Saladino (Sultano) [Arabia]",
  "Saladino (Visir) [Arabia]",
  "Sejong [Corea]",
  "Seondeok [Corea]",
  "Shaka [Zulù]",
  "Simón Bolívar [Gran Colombia]",
  "Solimano (Kanuni) [Impero Ottomano]",
  "Solimano (Muhtesem) [Impero Ottomano]",
  "Sundiata Keita [Mali]",
  "Tamara [Georgia]",
  "Teddy Roosevelt (L'alce) [America]",
  "Teddy Roosevelt (Rough Rider) [America]",
  "Teodora [Bisanzio]",
  "Tokugawa [Giappone]",
  "Tomiri [Scizia]",
  "Traiano [Roma]",
  "Vittoria (Età del Vapore) [Inghilterra]",
  "Vittoria (Età dell'Impero) [Inghilterra]",
  "Wac-Chanil-Ahau [Maya]",
  "Wilfrid Laurier [Canada]",
  "Wu Zetian [Cina]",
  "Yongle [Cina]",
];

/**
 * Seed leaders database
 * @returns {Promise<{success: boolean, count: number, error: string|null}>}
 */
export const seedLeaders = async () => {
  try {
    console.log("Starting leaders seeding...");

    let count = 0;

    for (let i = 0; i < LEADERS_LIST.length; i++) {
      const entry = LEADERS_LIST[i];
      const number = i + 1; // 1-indexed

      const leaderData = parseLeaderEntry(entry, number);

      // Create document with custom ID
      const docRef = doc(db, "leaders", leaderData.id);
      await setDoc(docRef, leaderData);

      count++;
      console.log(
        `✅ Added leader ${number}/${LEADERS_LIST.length}: ${leaderData.name}`,
      );
    }

    console.log(`✨ Successfully seeded ${count} leaders!`);
    return { success: true, count, error: null };
  } catch (error) {
    console.error("Error seeding leaders:", error);
    return { success: false, count: 0, error: error.message };
  }
};

/**
 * Clear all leaders (use with caution!)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const clearLeaders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "leaders"));

    for (const document of querySnapshot.docs) {
      await deleteDoc(doc(db, "leaders", document.id));
    }

    console.log("✨ All leaders cleared!");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error clearing leaders:", error);
    return { success: false, error: error.message };
  }
};

// Helper to verify leader icons exist
export const verifyLeaderIcons = () => {
  const leaders = LEADERS_LIST.map((entry, i) =>
    parseLeaderEntry(entry, i + 1),
  );

  console.log("Leaders to be seeded:");
  leaders.forEach((leader) => {
    console.log(
      `${leader.number}. ${leader.name}${leader.variant ? ` (${leader.variant})` : ""} - ${leader.civilization}`,
    );
    console.log(`   Leader Icon: ${leader.leaderIconPath}`);
    console.log(`   Civ Icon: ${leader.civilizationIconPath}`);
  });

  return leaders;
};
