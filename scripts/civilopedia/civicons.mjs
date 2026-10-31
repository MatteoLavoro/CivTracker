#!/usr/bin/env node
/**
 * Download the alternate civilization logos used by each leader.
 *
 * The Civilization Wiki leader pages and the Jersey System table show the
 * civilization icon in the leader's jersey colours (e.g. Lincoln uses the
 * white American logo instead of the standard blue one). This script saves
 * those logos locally and writes a manifest used by upload.mjs.
 *
 * Output:
 *   public/IconeCiviltàAlterne/<leader>.webp|png
 *   public/AUTOCivDescrizioni/civ-icons.json
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "../..");
const OUT_DIR = path.join(ROOT, "public", "IconeCiviltàAlterne");
const MANIFEST = path.join(ROOT, "public", "AUTOCivDescrizioni", "civ-icons.json");
const WIKI_API = "https://civilization.fandom.com/api.php";

const ALIASES = {
  "Teddy Roosevelt (L'alce)": "Teddy Roosevelt (Bull Moose)",
  "Saladino (Visir)": "Saladin (Vizier)",
  "Saladino (Sultano)": "Saladin (Sultan)",
  "Caterina de' Medici (La Magnifica)":
    "Catherine de Medici (Magnificence)",
  "Caterina de' Medici (Regina Nera)": "Catherine de Medici (Black Queen)",
  "Qin Shi Huang (Mandato Divino)": "Qin Shi Huang (Mandate of Heaven)",
  "Qin Shi Huang (Unificatore)": "Qin Shi Huang (Unifier)",
  "Kublai Khan (Cina)": "Kublai Khan (Chinese)",
  "Kublai Khan (Mongolia)": "Kublai Khan (Mongolian)",
  "Vittoria (Età dell'Impero)": "Victoria (Age of Empire)",
  "Vittoria (Età del Vapore)": "Victoria (Age of Steam)",
  "Eleonora d'Aquitania (Francia)": "Eleanor of Aquitaine (French)",
  "Eleonora d'Aquitania (Inghilterra)": "Eleanor of Aquitaine (English)",
  "Cleopatra (Egiziana)": "Cleopatra (Egyptian)",
  "Cleopatra (Tolemaica)": "Cleopatra (Ptolemaic)",
  "Harald Hardrada (Variago)": "Harald Hardrada (Varangian)",
  "Solimano (Muhtesem)": "Suleiman (Muhteşem‎‎)",
  "Solimano (Kanuni)": "Suleiman (Kanuni)",
  "Basilio II": "Basil II",
  "Giulio Cesare": "Julius Caesar",
  "Elisabetta I": "Elizabeth I",
  "Federico Barbarossa": "Frederick Barbarossa",
  "Nadir Shah": "Nader Shah",
  Pericle: "Pericles",
  Teodora: "Theodora",
  Traiano: "Trajan",
  Alessandro: "Alexander",
  Ciro: "Cyrus",
  Cristina: "Kristina",
  Didone: "Dido",
  Edvige: "Jadwiga",
  "Filippo II": "Philip II",
  Guglielmina: "Wilhelmina",
  "Ludovico II": "Ludwig II",
  "Mattia Corvino": "Matthias Corvinus",
  Pietro: "Peter",
  "Robert Bruce": "Robert the Bruce",
  Tamara: "Tamar",
  Tomiri: "Tomyris",
  "Wac-Chanil-Ahau": "Lady Six Sky",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "CivTracker-civ-icons/1.0 (personal non-commercial)",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
}

async function getJerseyTable() {
  const url = `${WIKI_API}?action=parse&page=Jersey_System_(Civ6)&prop=wikitext&format=json&formatversion=2`;
  const data = JSON.parse(await fetchText(url));
  const text = data.parse.wikitext;
  const entries = [];
  for (const match of text.matchAll(
    /\{\{SurePageIconLineBreak6\|([^}]+)\}\}\s*\|\s*\[\[File:([^|\]]+\.png)/g,
  )) {
    entries.push({ wikiName: match[1].trim(), mainFile: match[2].trim() });
  }
  return entries;
}

async function resolveImageUrls(titles) {
  const result = {};
  for (let i = 0; i < titles.length; i += 20) {
    const batch = titles.slice(i, i + 20);
    const url = `${WIKI_API}?action=query&titles=${batch
      .map((title) => encodeURIComponent(`File:${title}`))
      .join("|")}&prop=imageinfo&iiprop=url&format=json&formatversion=2`;
    const data = JSON.parse(await fetchText(url));
    for (const page of data.query?.pages || []) {
      const title = page.title.replace(/^File:/, "");
      const imageUrl = page.imageinfo?.[0]?.url;
      if (imageUrl) result[title] = imageUrl;
    }
    await sleep(200);
  }
  return result;
}

function matchWikiName(fullName, entries) {
  if (ALIASES[fullName]) return ALIASES[fullName];
  const normalized = normalize(fullName);
  const exact = entries.find((entry) => normalize(entry.wikiName) === normalized);
  if (exact) return exact.wikiName;
  return null;
}

function safeFileName(fullName) {
  return (
    fullName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "leader"
  );
}

async function main() {
  const listText = await fs.readFile(
    path.join(ROOT, "public", "ListaPersonaggiCiviltà.txt"),
    "utf8",
  );
  const leaders = listText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.match(/^(.+?)\s*\[([^\]]+)\]$/)?.[1].trim())
    .filter(Boolean);

  const entries = await getJerseyTable();
  console.log(`Jersey entries: ${entries.length}, leaders: ${leaders.length}`);

  const mapping = [];
  const missing = [];
  for (const fullName of leaders) {
    const wikiName = matchWikiName(fullName, entries);
    const entry = entries.find((item) => item.wikiName === wikiName);
    if (!entry) {
      missing.push(fullName);
      continue;
    }
    mapping.push({ fullName, wikiName, mainFile: entry.mainFile });
  }

  if (missing.length > 0) {
    console.log("Leader senza immagine nella tabella:", JSON.stringify(missing));
  }

  const urls = await resolveImageUrls([
    ...new Set(mapping.map((entry) => entry.mainFile)),
  ]);
  const manifest = {};
  for (const entry of mapping) {
    const url =
      urls[entry.mainFile] ||
      urls[entry.mainFile.replace(/_/g, " ")] ||
      urls[entry.mainFile.replace(/ /g, "_")];
    if (!url) {
      console.log(`✗ ${entry.fullName}: URL non trovato (${entry.mainFile})`);
      continue;
    }
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
        "Referer": "https://civilization.fandom.com/",
        "Accept": "image/png,image/*;q=0.8,*/*;q=0.5",
      },
    });
    if (!response.ok) {
      console.log(`✗ ${entry.fullName}: download ${response.status}`);
      continue;
    }
    const contentType = response.headers.get("content-type") || "image/png";
    const extension = contentType.includes("webp") ? "webp" : "png";
    const fileName = `${safeFileName(entry.fullName)}.${extension}`;
    const destination = path.join(OUT_DIR, fileName);
    await fs.mkdir(OUT_DIR, { recursive: true });
    await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
    manifest[entry.fullName] = {
      path: `/IconeCiviltàAlterne/${fileName}`,
      wikiName: entry.wikiName,
      source: entry.mainFile,
    };
    console.log(`✓ ${entry.fullName} ← ${entry.mainFile}`);
    await sleep(150);
  }

  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Scaricati ${Object.keys(manifest).length}/${leaders.length} loghi`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exitCode = 1;
});
