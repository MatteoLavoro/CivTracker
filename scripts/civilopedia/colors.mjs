#!/usr/bin/env node
/**
 * Build leader colour palettes from Civilization VI game data.
 *
 * - Base/DLC leaders: exact colours from PlayerColors + PlayerStandardColors XML
 *   (primary, secondary and the three alternate jerseys).
 * - Leaders whose colour rows are not in the data dump (mostly expansions):
 *   the main jersey image is downloaded from the Civilization Wiki and its two
 *   colours are sampled with Pillow.
 *
 * Output:
 *   src/data/leaderColors.json
 *   public/AUTOCivDescrizioni/leader-colors.json
 */

import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "../..");
const OUT_DIR = path.join(ROOT, "public", "AUTOCivDescrizioni");
const CACHE_DIR = path.join(SCRIPT_DIR, ".cache", "jerseys");
const SRC_OUT = path.join(ROOT, "src", "data", "leaderColors.json");
const RAW_BASE = "https://raw.githubusercontent.com/mrobaczyk/civ6/main/";
const WIKI_API = "https://civilization.fandom.com/api.php";

const COLOR_FILES = [
  "Base/Assets/UI/Colors/PlayerColors.xml",
  "Base/Assets/UI/Colors/PlayerStandardColors.xml",
  "DLC/Australia/Data/Australia_Colors.xml",
  "DLC/Aztec_Montezuma/Data/Aztec_Montezuma_Colors.xml",
  "DLC/Babylon/Data/Babylon_Colors.xml",
  "DLC/Babylon/Data/Babylon_Colors_Config.xml",
  "DLC/Byzantium_Gaul/Data/Byzantium_Gaul_Colors.xml",
  "DLC/CatherineDeMedici/Data/CatherineDeMedici_Colors.xml",
  "DLC/Ethiopia/Data/Ethiopia_Colors.xml",
  "DLC/GranColombia_Maya/Data/GranColombia_Maya_Colors.xml",
  "DLC/GreatBuilders/Data/GreatBuilders_Colors.xml",
  "DLC/GreatNegotiators/Data/GreatNegotiators_Colors.xml",
  "DLC/GreatWarlords/Data/GreatWarlords_Colors.xml",
  "DLC/Indonesia_Khmer/Data/Indonesia_Khmer_Colors.xml",
  "DLC/JuliusCaesar/Data/JuliusCaesar_Colors.xml",
  "DLC/KublaiKhan_Vietnam/Data/KublaiKhan_Vietnam_Colors.xml",
  "DLC/Macedonia_Persia/Data/Macedonia_Persia_Colors.xml",
  "DLC/Macedonia_Persia/Data/Macedonia_Persia_PlayerColors.xml",
  "DLC/Nubia_Amanitore/Data/Nubia_Colors.xml",
  "DLC/Nubia_Amanitore/Data/Nubia_PlayerColors.xml",
  "DLC/Poland_Jadwiga/Data/Poland_Jadwiga_Colors.xml",
  "DLC/Portugal/Data/Portugal_Colors.xml",
  "DLC/RulersOfChina/Data/RulersOfChina_Colors.xml",
  "DLC/RulersOfEngland/Data/RulersOfEngland_Colors.xml",
  "DLC/RulersOfTheSahara/Data/RulersOfTheSahara_Colors.xml",
  "DLC/TeddyRoosevelt/Data/TeddyRoosevelt_Colors.xml",
  "DLC/VikingsLandmarks/Data/VikingsLandmarks_Colors.xml",
];

// Leader full name -> name used by the Jersey System wiki page
// (only for leaders whose colours are not in the game-data dump)
const WIKI_NAMES = {
  Chandragupta: "Chandragupta",
  Cristina: "Kristina",
  Didone: "Dido",
  "Eleonora d'Aquitania (Francia)": "Eleanor of Aquitaine (French)",
  "Eleonora d'Aquitania (Inghilterra)": "Eleanor of Aquitaine (English)",
  "Genghis Khan": "Genghis Khan",
  Guglielmina: "Wilhelmina",
  Kupe: "Kupe",
  Lautaro: "Lautaro",
  "Mansa Musa": "Mansa Musa",
  "Mattia Corvino": "Matthias Corvinus",
  Pachacuti: "Pachacuti",
  Poundmaker: "Poundmaker",
  "Robert Bruce": "Robert the Bruce",
  Seondeok: "Seondeok",
  Shaka: "Shaka",
  "Solimano (Kanuni)": "Suleiman (Kanuni)",
  Tamara: "Tamar",
  "Wilfrid Laurier": "Wilfrid Laurier",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url, options = {}) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "CivTracker-leader-colors/1.0 (personal non-commercial project)",
        ...(options.headers || {}),
      },
    });
    if (response.ok) return response.text();
    await sleep(500 * (attempt + 1));
  }
  throw new Error(`Failed to fetch ${url}`);
}

function xmlRows(text) {
  return [...text.matchAll(/<Row>([\s\S]*?)<\/Row>/g)].map((match) => {
    const block = match[1];
    const get = (tag) =>
      block.match(new RegExp(`<${tag}>([^<]+)</${tag}>`))?.[1];
    return { get };
  });
}

function hexFromColor(value) {
  if (!value) return null;
  const parts = value.split(",").map(Number);
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  return `#${parts
    .slice(0, 3)
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")}`;
}

function parseLeaderList(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.+?)\s*\[([^\]]+)\]$/);
      const fullName = match[1].trim();
      const civilization = match[2].trim();
      const variantMatch = fullName.match(/^(.+?)\s*\((.+)\)$/);
      return {
        fullName,
        civilization,
        name: variantMatch ? variantMatch[1].trim() : fullName,
        variant: variantMatch ? variantMatch[2].trim() : null,
      };
    });
}

async function loadGameColors() {
  const standard = {};
  const colors = {};
  for (const file of COLOR_FILES) {
    const text = await fetchText(RAW_BASE + file, {
      headers: { "User-Agent": "CivTracker/1.0" },
    });
    for (const row of xmlRows(text)) {
      const type = row.get("Type");
      const color = row.get("Color");
      if (!type) continue;
      if (`${file}`.includes("PlayerStandardColors")) {
        const hex = hexFromColor(color);
        if (hex) standard[type] = hex;
      }
    }
  }

  for (const file of COLOR_FILES) {
    if (!file.includes("Colors")) continue;
    const text = await fetchText(RAW_BASE + file, {
      headers: { "User-Agent": "CivTracker/1.0" },
    });
    for (const row of xmlRows(text)) {
      const type = row.get("Type");
      if (!type?.startsWith("LEADER_")) continue;
      const resolve = (name) => standard[name] || null;
      const palette = {
        primary: resolve(row.get("PrimaryColor")),
        secondary: resolve(row.get("SecondaryColor")),
      };
      const alternates = [];
      for (let i = 1; i <= 3; i += 1) {
        const primary = resolve(row.get(`Alt${i}PrimaryColor`));
        const secondary = resolve(row.get(`Alt${i}SecondaryColor`));
        if (primary && secondary) alternates.push({ primary, secondary });
      }
      if (palette.primary && palette.secondary) {
        colors[type] = { ...palette, alternates };
      }
    }
  }
  return { standard, colors };
}

async function getJerseyMainFiles(wikiNames) {
  const url = `${WIKI_API}?action=parse&page=Jersey_System_(Civ6)&prop=wikitext&format=json&formatversion=2`;
  const data = JSON.parse(
    await fetchText(url, { headers: { "Accept": "application/json" } }),
  );
  const text = data.parse.wikitext;
  const result = {};
  for (const wikiName of wikiNames) {
    const marker = `{{SurePageIconLineBreak6|${wikiName}}}`;
    const index = text.indexOf(marker);
    if (index === -1) continue;
    const chunk = text.slice(index, index + 900);
    const files = [...chunk.matchAll(/\[\[File:([^|\]]+\.png)/g)].map(
      (match) => match[1],
    );
    if (files.length > 0) result[wikiName] = files.slice(0, 4);
  }
  return result;
}

async function resolveImageUrls(titles) {
  const result = {};
  for (let i = 0; i < titles.length; i += 20) {
    const batch = titles.slice(i, i + 20);
    const url = `${WIKI_API}?action=query&titles=${batch
      .map((title) => encodeURIComponent(`File:${title}`))
      .join("|")}&prop=imageinfo&iiprop=url&format=json&formatversion=2`;
    const data = JSON.parse(
      await fetchText(url, { headers: { "Accept": "application/json" } }),
    );
    for (const page of data.query?.pages || []) {
      const title = page.title.replace(/^File:/, "");
      const imageUrl = page.imageinfo?.[0]?.url;
      if (imageUrl) result[title] = imageUrl;
    }
    await sleep(200);
  }
  return result;
}

async function downloadFile(url, destination) {
  try {
    await fs.access(destination);
    return true;
  } catch {
    // not cached
  }
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
      "Referer": "https://civilization.fandom.com/",
      "Accept": "image/webp,image/png,image/*;q=0.8,*/*;q=0.5",
    },
  });
  if (!response.ok) return false;
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, buffer);
  return true;
}

function sampleImages(images, standard) {
  const python = process.env.PYTHON || "python";
  const input = JSON.stringify({
    images,
    palette: Object.entries(standard).map(([name, hex]) => ({ name, hex })),
  });
  const script = `
import json, sys
from PIL import Image
from collections import Counter
data = json.loads(sys.stdin.read())
palette = []
for entry in data["palette"]:
    h = entry["hex"].lstrip("#")
    palette.append((int(h[0:2],16), int(h[2:4],16), int(h[4:6],16), entry["hex"]))
def nearest(rgb):
    best = None
    for r,g,b,hexv in palette:
        d = (r-rgb[0])**2 + (g-rgb[1])**2 + (b-rgb[2])**2
        if best is None or d < best[0]: best = (d, hexv)
    return best[1] if best else None
out = {}
for item in data["images"]:
    try:
        im = Image.open(item["path"]).convert("RGBA")
        w,h = im.size
        corners = [(2,2),(w-3,2),(2,h-3),(w-3,h-3)]
        corner_colors = []
        for x,y in corners:
            r,g,b,a = im.getpixel((x,y))
            if a > 200: corner_colors.append((r,g,b))
        counts = Counter()
        for r,g,b,a in im.getdata():
            if a < 200: continue
            hexv = nearest((r,g,b))
            if hexv: counts[hexv] += 1
        primary = None
        if corner_colors:
            common_corner = Counter(corner_colors).most_common(1)[0][0]
            primary = nearest(common_corner)
        if not primary and counts:
            primary = counts.most_common(1)[0][0]
        secondary = None
        for hexv,_ in counts.most_common():
            if hexv != primary:
                secondary = hexv; break
        if primary and secondary:
            out[item["name"]] = {"primary": primary, "secondary": secondary}
    except Exception as e:
        pass
print(json.dumps(out))
`;
  const output = execFileSync(python, ["-c", script], {
    input,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  return JSON.parse(output);
}

async function main() {
  console.log("Leader colors from Civ VI game data + jersey images");
  const { standard, colors } = await loadGameColors();
  console.log(`Game-data palettes: ${Object.keys(colors).length}`);

  const listText = await fs.readFile(
    path.join(ROOT, "public", "ListaPersonaggiCiviltà.txt"),
    "utf8",
  );
  const leaders = parseLeaderList(listText);
  const slugs = JSON.parse(
    await fs.readFile(path.join(OUT_DIR, "leader-slugs.json"), "utf8"),
  );

  const missing = [];
  const result = {};
  for (const leader of leaders) {
    const slug = slugs[leader.fullName] || "";
    const type = `LEADER_${slug.replace(/^leader_/, "").toUpperCase()}`;
    if (colors[type]) {
      result[leader.fullName] = {
        ...colors[type],
        civilization: leader.civilization,
        source: "game-data",
      };
    } else {
      missing.push(leader);
    }
  }
  console.log(`Leaders without game-data colours: ${missing.length}`);

  const wikiNames = missing
    .map((leader) => WIKI_NAMES[leader.fullName])
    .filter(Boolean);
  const jerseyFiles = await getJerseyMainFiles(wikiNames);
  const allTitles = [...new Set(Object.values(jerseyFiles).flat())];
  const imageUrls = await resolveImageUrls(allTitles);

  const images = [];
  for (const leader of missing) {
    const wikiName = WIKI_NAMES[leader.fullName];
    const files = jerseyFiles[wikiName] || [];
    if (files.length === 0) continue;
    for (let index = 0; index < files.length; index += 1) {
      const title = files[index];
      const url = imageUrls[title];
      if (!url) continue;
      const safe = `${leader.fullName.replace(/[^a-z0-9]+/gi, "_")}_${index}.img`;
      const destination = path.join(CACHE_DIR, safe);
      if (await downloadFile(url, destination)) {
        images.push({ name: `${leader.fullName}#${index}`, path: destination });
      }
      await sleep(150);
    }
  }

  let sampled = {};
  if (images.length > 0) {
    try {
      sampled = sampleImages(images, standard);
    } catch (error) {
      console.warn(`Colour sampling skipped: ${error.message}`);
    }
  }

  for (const leader of missing) {
    const palettes = [];
    for (let index = 0; index < 4; index += 1) {
      const palette = sampled[`${leader.fullName}#${index}`];
      if (palette) palettes.push(palette);
    }
    if (palettes.length > 0) {
      result[leader.fullName] = {
        primary: palettes[0].primary,
        secondary: palettes[0].secondary,
        alternates: palettes.slice(1),
        civilization: leader.civilization,
        source: "jersey-image",
      };
    }
  }

  // Fallback: reuse another leader palette of the same civilization
  for (const leader of leaders) {
    if (result[leader.fullName]) continue;
    const sibling = Object.entries(result).find(
      ([name, palette]) =>
        palette.civilization === leader.civilization &&
        !name.includes("("),
    );
    if (sibling) {
      result[leader.fullName] = {
        primary: sibling[1].primary,
        secondary: sibling[1].secondary,
        alternates: sibling[1].alternates || [],
        civilization: leader.civilization,
        source: `fallback:${sibling[0]}`,
      };
    } else {
      result[leader.fullName] = {
        primary: "#0f3252",
        secondary: "#d4af37",
        alternates: [],
        civilization: leader.civilization,
        source: "fallback:generic",
      };
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    note:
      "Colori ufficiali da Civilization VI PlayerColors.xml; per i leader senza riga nei dati di gioco il colore è campionato dall'immagine della jersey principale della Civilization Wiki.",
    palette: result,
  };

  await fs.mkdir(path.dirname(SRC_OUT), { recursive: true });
  await fs.writeFile(SRC_OUT, JSON.stringify(payload, null, 2), "utf8");
  await fs.writeFile(
    path.join(OUT_DIR, "leader-colors.json"),
    JSON.stringify(payload, null, 2),
    "utf8",
  );

  const sources = Object.values(result).reduce((acc, palette) => {
    acc[palette.source.startsWith("fallback") ? "fallback" : palette.source] =
      (acc[palette.source.startsWith("fallback") ? "fallback" : palette.source] || 0) + 1;
    return acc;
  }, {});
  console.log(`Written ${Object.keys(result).length} leader palettes`, sources);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exitCode = 1;
});
