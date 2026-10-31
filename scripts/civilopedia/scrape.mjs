#!/usr/bin/env node
/**
 * CivTracker - Civilopedia description scraper
 *
 * Downloads leader and civilization descriptions from the Italian
 * Civilization VI civilopedia and writes them in the same text format used by
 * the app:
 *
 *   [Ability name] {Ability type}
 *
 *   Description with [IconToken] placeholders...
 *
 * Output goes to public/AUTOCivDescrizioni/{DescrizionePersonaggi,DescrizioneCiviltà}
 *
 * Usage:
 *   node scripts/civilopedia/scrape.mjs                 # all leaders + civs
 *   node scripts/civilopedia/scrape.mjs --only=leaders
 *   node scripts/civilopedia/scrape.mjs --only=civs
 *   node scripts/civilopedia/scrape.mjs --limit=5       # quick test
 *   node scripts/civilopedia/scrape.mjs --no-cache
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "../..");
const CACHE_DIR = path.join(SCRIPT_DIR, ".cache");
const OUT_DIR = path.join(ROOT, "public", "AUTOCivDescrizioni");
const LEADERS_OUT = path.join(OUT_DIR, "DescrizionePersonaggi");
const CIVS_OUT = path.join(OUT_DIR, "DescrizioneCiviltà");
const ICONS_DIR = path.join(ROOT, "public", "IconeAbilità");
const ICONS_PUBLIC_PATH = "/IconeAbilità";
const BASE = "https://www.civilopedia.net/it/gathering-storm";

// Ability icon manifest: { leaders: { fullName: { abilityName: path } }, civs: {...} }
const abilityIcons = { leaders: {}, civs: {} };

const args = process.argv.slice(2);
const getArg = (name, fallback = null) => {
  const found = args.find((arg) => arg.startsWith(`--${name}=`));
  return found ? found.split("=")[1] : fallback;
};
const ONLY = getArg("only", "all");
const LIMIT = Number(getArg("limit", "0")) || 0;
const USE_CACHE = !args.includes("--no-cache");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ */
/* Icon mapping: civilopedia image name -> app icon token             */
/* ------------------------------------------------------------------ */
const ICON_MAP = {
  strength: "StrengthIcon",
  religious_strength: "ReligiousStrengthIcon",
  science: "ScienceIcon",
  culture: "CultureIcon",
  faith: "FaithIcon",
  food: "FoodIcon",
  production: "ProductionIcon",
  gold: "GoldIcon",
  tourism: "TourismIcon",
  power: "PowerIcon",
  iron: "IronIcon",
  coal: "CoalIcon",
  oil: "OilIcon",
  aluminum: "AluminumIcon",
  aluminium: "AluminumIcon",
  uranium: "UraniumIcon",
  citizen: "CitizenIcon",
  population: "CitizenIcon",
  capital: "CapitalIcon",
  amenities: "AmenitiesIcon",
  amenity: "AmenitiesIcon",
  appeal: "AmenitiesIcon",
  district: "DistrictIcon",
  movement: "MovementIcon",
  promotion: "PromotionIcon",
  general: "GeneralIcon",
  nuclear: "NuclearDeviceIcon",
  nuclear_device: "NuclearDeviceIcon",
  thermonuclear: "ThermonuclearDeviceIcon",
  thermonuclear_device: "ThermonuclearDeviceIcon",
  favor: "DiplomaticFavorIcon",
  diplomatic_favor: "DiplomaticFavorIcon",
  diplomatic_visibility: "DiplomaticVisibilityIcon",
  envoy: "EnvoyIcon",
  trade_route: "TradeRouteIcon",
  traderoute: "TradeRouteIcon",
  trade: "TradeRouteIcon",
  trading_post: "TradingPostIcon",
  tradingpost: "TradingPostIcon",
  alliance: "AllianceIcon",
  gossip: "GossipIcon",
  grievance: "GrievancesIcon",
  grievances: "GrievancesIcon",
  stat_grievance: "GrievancesIcon",
  great_person: "GreatPersonIcon",
  greatperson: "GreatPersonIcon",
  great_prophet: "GreatProphetIcon",
  greatprophet: "GreatProphetIcon",
  scientist: "ScientistIcon",
  greatscientist: "ScientistIcon",
  merchant: "MerchantIcon",
  greatmerchant: "MerchantIcon",
  general: "GeneralIcon",
  greatgeneral: "GeneralIcon",
  greatadmiral: "GeneralIcon",
  greatengineer: "GreatPersonIcon",
  greatwriter: "GreatPersonIcon",
  greatartist: "GreatPersonIcon",
  greatmusician: "GreatPersonIcon",
  great_work_art: "GreatWorkArtIcon",
  greatwork_landscape: "GreatWorkArtIcon",
  great_work_music: "GreatWorkMusicIcon",
  greatwork_music: "GreatWorkMusicIcon",
  great_work_writing: "GreatWorkWritingIcon",
  greatwork_writing: "GreatWorkWritingIcon",
  religious_art: "ReligiousArtIcon",
  sculpture: "SculptureIcon",
  greatwork_sculpture: "SculptureIcon",
  artifact: "ArtifactAncientIcon",
  artifact_ancient: "ArtifactAncientIcon",
  greatwork_artifact: "ArtifactAncientIcon",
  relic: "RelicIcon",
  greatwork_relic: "RelicIcon",
  greatwork_herorelic: "RelicIcon",
  portrait: "PortraitIcon",
  eureka: "EurekaIcon",
  techboosted: "EurekaIcon",
  inspiration: "InspirationIcon",
  civicboosted: "InspirationIcon",
  build_charges: "BuildChargesIcon",
  turn: "TurnIcon",
  housing: "CitizenIcon",
  religion: "FaithIcon",
  vislimited: "DiplomaticVisibilityIcon",
};

const unknownIcons = new Map();

/* ------------------------------------------------------------------ */
/* Leader / civilization mapping                                      */
/* ------------------------------------------------------------------ */
// Our civilization name -> civilopedia slug
const CIV_SLUGS = {
  America: "civilization_america",
  Arabia: "civilization_arabia",
  Australia: "civilization_australia",
  Aztechi: "civilization_aztec",
  Babilonia: "civilization_babylon_stk",
  Bisanzio: "civilization_byzantium",
  Brasile: "civilization_brazil",
  Canada: "civilization_canada",
  Cina: "civilization_china",
  Congo: "civilization_kongo",
  Corea: "civilization_korea",
  Cree: "civilization_cree",
  Egitto: "civilization_egypt",
  Etiopia: "civilization_ethiopia",
  Fenicia: "civilization_phoenicia",
  Francia: "civilization_france",
  Gallia: "civilization_gaul",
  Georgia: "civilization_georgia",
  Germania: "civilization_germany",
  Giappone: "civilization_japan",
  "Gran Colombia": "civilization_gran_colombia",
  Grecia: "civilization_greece",
  "Impero Ottomano": "civilization_ottoman",
  Inca: "civilization_inca",
  India: "civilization_india",
  Indonesia: "civilization_indonesia",
  Inghilterra: "civilization_england",
  Khmer: "civilization_khmer",
  Macedonia: "civilization_macedon",
  Mali: "civilization_mali",
  Maori: "civilization_maori",
  Mapuche: "civilization_mapuche",
  Maya: "civilization_maya",
  Mongolia: "civilization_mongolia",
  Norvegia: "civilization_norway",
  Nubia: "civilization_nubia",
  Olanda: "civilization_netherlands",
  Persia: "civilization_persia",
  Polonia: "civilization_poland",
  Portogallo: "civilization_portugal",
  Roma: "civilization_rome",
  Russia: "civilization_russia",
  Scizia: "civilization_scythia",
  Scozia: "civilization_scotland",
  Spagna: "civilization_spain",
  Sumeria: "civilization_sumeria",
  Svezia: "civilization_sweden",
  Ungheria: "civilization_hungary",
  Vietnam: "civilization_vietnam",
  Zulù: "civilization_zulu",
};

// Our leader full name -> civilopedia slug (only where automatic matching
// cannot work because the names differ)
const LEADER_SLUG_OVERRIDES = {
  "Qin Shi Huang (Mandato Divino)": "leader_qin",
  "Qin Shi Huang (Unificatore)": "leader_qin_alt",
  // The website pairs the two Saladin personas with the wrong ability:
  // the Sultan has "La Rettitudine della Fede", the Vizier "Il Vittorioso".
  "Saladino (Sultano)": "leader_saladin",
  "Saladino (Visir)": "leader_saladin_alt",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
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

function splitName(fullName) {
  const match = fullName.match(/^(.+?)\s*\((?!.*\d{3})(.+)\)$/);
  if (!match) return { base: fullName.trim(), variant: null };
  return { base: match[1].trim(), variant: match[2].trim() };
}

function decodeEntities(text) {
  const named = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    hellip: "…",
    rsquo: "’",
    lsquo: "‘",
    ldquo: "“",
    rdquo: "”",
  };
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (whole, name) => named[name] ?? whole);
}

function cleanHtmlFragment(fragment) {
  let html = fragment;
  // Line breaks
  html = html.replace(/<br\s*\/?>/gi, "\n");
  // Icons
  html = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const match = tag.match(
      /\/images\/core\/([a-z0-9_]+)\.(?:png|webp|jpe?g)/i,
    );
    if (!match) return " ";
    const key = match[1].toLowerCase();
    const token = ICON_MAP[key];
    if (!token) {
      unknownIcons.set(key, (unknownIcons.get(key) || 0) + 1);
      return " ";
    }
    return ` [${token}] `;
  });
  // Remove remaining tags
  html = html.replace(/<[^>]+>/g, " ");
  html = decodeEntities(html);
  html = html
    .replace(/\u00a0/g, " ")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ +([,.;:!?])/g, "$1")
    .trim();
  return html;
}

async function fetchHtml(url, { retries = 3 } = {}) {
  const cacheKey = path.join(
    CACHE_DIR,
    url.replace(/^https:\/\/www\.civilopedia\.net\//, "").replace(/[\/?&=]/g, "_"),
  );
  if (USE_CACHE) {
    try {
      return await fs.readFile(cacheKey, "utf8");
    } catch {
      // not cached
    }
  }

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "CivTracker-description-sync/1.0 (personal non-commercial project)",
          "Accept-Language": "it-IT,it;q=0.9",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      const html = await response.text();
      if (USE_CACHE) {
        await fs.mkdir(CACHE_DIR, { recursive: true });
        await fs.writeFile(cacheKey, html, "utf8");
      }
      return html;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(1000 * (attempt + 1));
      }
    }
  }
  throw lastError;
}

/* ------------------------------------------------------------------ */
/* HTML parsing                                                       */
/* ------------------------------------------------------------------ */
function extractSections(html) {
  const sections = [];
  const marker = '<div class="_1k50iii3';
  let cursor = 0;

  while ((cursor = html.indexOf(marker, cursor)) !== -1) {
    const labelStart = html.indexOf(">", cursor) + 1;
    const labelEnd = html.indexOf("</div>", labelStart);
    if (labelEnd === -1) break;
    const label = decodeEntities(
      html.slice(labelStart, labelEnd).replace(/<[^>]+>/g, "").trim(),
    );
    const window = html.slice(labelEnd, labelEnd + 25000);
    const nameMatch = window.match(
      /<p class="_1k50iii4[^"]*">([\s\S]*?)<\/p>/,
    );
    const paragraphMatch = window.match(
      /<p class="_1k50iii5[^"]*">([\s\S]*?)<\/p>/,
    );
    const divMatch = window.match(
      /<div class="_1k50iii1[^"]*">([\s\S]*?)<\/div>/,
    );

    if (nameMatch && paragraphMatch) {
      sections.push({
        label,
        name: cleanHtmlFragment(nameMatch[1]).replace(/\n+/g, " ").trim(),
        description: cleanHtmlFragment(paragraphMatch[1]),
      });
    } else if (divMatch) {
      sections.push({
        label,
        name: null,
        description: cleanHtmlFragment(divMatch[1]),
      });
    }
    cursor = labelEnd + 10;
  }

  // The sidebar/content is duplicated on some pages: drop identical entries
  const seen = new Set();
  return sections.filter((section) => {
    const key = `${section.label}|${section.name}|${section.description}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getSidebarItems(html, allowedLabels) {
  const items = [];
  const labelRegex = /<div class="_8lp4s94[^"]*">([^<]+)<\/div>/g;
  const labels = [];
  let match;
  while ((match = labelRegex.exec(html)) !== null) {
    labels.push({ label: match[1].trim(), index: match.index });
  }

  for (let i = 0; i < labels.length; i += 1) {
    if (!allowedLabels.includes(labels[i].label)) continue;
    const start = labels[i].index;
    const end = i + 1 < labels.length ? labels[i + 1].index : html.length;
    const segment = html.slice(start, Math.min(end, start + 20000));
    const linkRegex = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    let link;
    while ((link = linkRegex.exec(segment)) !== null) {
      const href = link[1].startsWith("http")
        ? link[1]
        : `https://www.civilopedia.net${link[1]}`;
      const inner = link[2];
      const rawName =
        inner.match(/<div class="_8lp4s98">([^<]+)<\/div>/)?.[1] ||
        inner.match(/<img[^>]*title="([^"]+)"/)?.[1] ||
        inner.match(/<img[^>]*alt="([^"]+)"/)?.[1] ||
        decodeURIComponent(href.split("/").filter(Boolean).pop() || "");
      const name = decodeEntities(rawName).trim();
      items.push({
        href,
        name,
        type:
          labels[i].label === "Unità speciali"
            ? "Unità speciali"
            : "Infrastruttura speciale",
      });
    }
  }

  // Deduplicate by href + name
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.name}|${item.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseCivilopediaPage(html) {
  const sections = extractSections(html);
  const ability = sections.find(
    (section) => section.label === "Abilità esclusiva" && section.name,
  );
  const description = sections.find(
    (section) => section.label === "Descrizione" && section.description,
  );
  return { ability, description, sections };
}

/* ------------------------------------------------------------------ */
/* Output formatting                                                  */
/* ------------------------------------------------------------------ */
function formatAbilities(abilities) {
  return (
    abilities
      .map(
        (ability) =>
          `[${ability.name}] {${ability.type}}\n\n${ability.description}`,
      )
      .join("\n\n") + "\n"
  );
}

async function writeFileSafe(dir, fileName, content) {
  await fs.mkdir(dir, { recursive: true });
  const fullPath = path.join(dir, `${fileName}.txt`);
  await fs.writeFile(fullPath, content, "utf8");
  return fullPath;
}

/* ------------------------------------------------------------------ */
/* Ability icons                                                      */
/* ------------------------------------------------------------------ */
function findPageIconUrl(html) {
  const contentIcon = html.match(
    /<img[^>]*src="(https:\/\/static\.civilopedia\.net\/images\/core\/(icon_[^"]+?\.(?:png|webp)))"[^>]*width="256"/i,
  );
  if (contentIcon) return contentIcon[1];
  const reversed = html.match(
    /<img[^>]*width="256"[^>]*src="(https:\/\/static\.civilopedia\.net\/images\/core\/(icon_[^"]+?\.(?:png|webp)))"/i,
  );
  if (reversed) return reversed[1];
  const ogImage = html.match(
    /<meta property="og:image" content="([^"]+)"/i,
  );
  return ogImage?.[1] || null;
}

async function downloadIcon(iconUrl) {
  if (!iconUrl) return null;
  const fileName = iconUrl.split("/").pop().split("?")[0];
  if (!fileName) return null;
  const destination = path.join(ICONS_DIR, fileName);
  try {
    await fs.access(destination);
  } catch {
    try {
      const response = await fetch(iconUrl, {
        headers: {
          "User-Agent":
            "CivTracker-description-sync/1.0 (personal non-commercial project)",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.mkdir(ICONS_DIR, { recursive: true });
      await fs.writeFile(destination, buffer);
      process.stdout.write(`  ↓ icona ${fileName}\n`);
    } catch (error) {
      process.stdout.write(
        `  ! icona non scaricata (${fileName}): ${error.message}\n`,
      );
      return null;
    }
  }
  return `${ICONS_PUBLIC_PATH}/${fileName}`;
}

async function resolveAbilityIcon(html) {
  return downloadIcon(findPageIconUrl(html));
}

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */
async function loadOurLeaders() {
  const listPath = path.join(ROOT, "public", "ListaPersonaggiCiviltà.txt");
  const content = await fs.readFile(listPath, "utf8");
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.+?)\s*\[([^\]]+)\]$/);
      if (!match) throw new Error(`Invalid leader line: ${line}`);
      const fullName = match[1].trim();
      const civilization = match[2].trim();
      const { base, variant } = splitName(fullName);
      return {
        fullName,
        name: base,
        variant,
        civilization,
        fileBase: fullName,
      };
    });
}

async function loadSiteIndex() {
  const [leadersHtml, civsHtml] = await Promise.all([
    fetchHtml(`${BASE}/civilizations/leader_abraham_lincoln/`),
    fetchHtml(`${BASE}/civilizations/civilization_america/`),
  ]);

  const parseLinks = (html, prefix) => {
    const anchors = html.match(/<a\b[^>]*>/g) || [];
    const found = new Map();
    for (const anchor of anchors) {
      const id = anchor.match(/data-page-id="([^"]+)"/)?.[1];
      const name = anchor.match(/data-page-name="([^"]+)"/)?.[1];
      const href = anchor.match(/href="([^"]+)"/)?.[1];
      if (!id || !name || !href || !id.startsWith(prefix)) continue;
      const slug = href.split("/").filter(Boolean).pop();
      if (!slug || found.has(slug)) continue;
      found.set(slug, decodeEntities(name).trim());
    }
    return [...found.entries()].map(([slug, title]) => ({ slug, title }));
  };

  return {
    leaders: parseLinks(leadersHtml, "LEADER_"),
    civs: parseLinks(civsHtml, "CIVILIZATION_"),
  };
}

function mapLeaders(ourLeaders, siteLeaders) {
  const bySlug = new Map(siteLeaders.map((entry) => [entry.slug, entry]));
  const mapping = [];
  const problems = [];

  for (const leader of ourLeaders) {
    if (LEADER_SLUG_OVERRIDES[leader.fullName]) {
      const slug = LEADER_SLUG_OVERRIDES[leader.fullName];
      mapping.push({ ...leader, slug, siteTitle: bySlug.get(slug)?.title });
      continue;
    }

    const base = normalize(leader.name);
    const variant = leader.variant ? normalize(leader.variant) : null;
    const candidates = siteLeaders.filter((entry) => {
      const parts = splitName(entry.title);
      if (normalize(parts.base) !== base) return false;
      if (!variant) return !parts.variant;
      const siteVariant = parts.variant ? normalize(parts.variant) : "";
      return (
        siteVariant === variant ||
        siteVariant.includes(variant) ||
        variant.includes(siteVariant)
      );
    });

    if (candidates.length === 1) {
      mapping.push({
        ...leader,
        slug: candidates[0].slug,
        siteTitle: candidates[0].title,
      });
    } else {
      problems.push({
        leader: leader.fullName,
        candidates: candidates.map((entry) => entry.title),
      });
    }
  }

  return { mapping, problems };
}

async function scrapeLeaders(leaders, mapping) {
  const results = [];
  const byFullName = new Map(mapping.map((entry) => [entry.fullName, entry]));

  for (const leader of leaders) {
    const mapped = byFullName.get(leader.fullName);
    if (!mapped) {
      results.push({ leader, error: "missing mapping" });
      continue;
    }
    try {
      const html = await fetchHtml(`${BASE}/civilizations/${mapped.slug}/`);
      const { ability } = parseCivilopediaPage(html);
      if (!ability) {
        results.push({ leader, error: "ability not found" });
        continue;
      }
      const abilities = [
        {
          name: ability.name,
          type: "Abilità esclusiva",
          description: ability.description,
        },
      ];
      const leaderIcon = await resolveAbilityIcon(html);
      const leaderIcons = {};
      abilityIcons.leaders[leader.fullName] = leaderIcons;
      if (leaderIcon) leaderIcons[ability.name] = leaderIcon;

      // Some personas also bring a unique unit/infrastructure with them
      // (e.g. Basilio II → Tagma, Teddy Roosevelt → Rough Rider)
      const items = getSidebarItems(html, [
        "Unità speciali",
        "Infrastruttura speciale",
      ]);
      for (const item of items) {
        try {
          const itemHtml = await fetchHtml(item.href);
          const { description } = parseCivilopediaPage(itemHtml);
          if (description) {
            const itemName = description.name || item.name;
            abilities.push({
              name: itemName,
              type: item.type,
              description: description.description,
            });
            const itemIcon = await resolveAbilityIcon(itemHtml);
            if (itemIcon) {
              leaderIcons[itemName] = itemIcon;
            } else if (leaderIcon) {
              leaderIcons[itemName] = leaderIcon;
            }
          }
        } catch (error) {
          process.stdout.write(
            `  ! ${leader.fullName}: errore su ${item.name}: ${error.message}\n`,
          );
        }
        await sleep(250);
      }

      const content = formatAbilities(abilities);
      const filePath = await writeFileSafe(
        LEADERS_OUT,
        leader.fileBase,
        content,
      );
      results.push({
        leader,
        siteTitle: mapped.siteTitle,
        slug: mapped.slug,
        filePath,
      });
      process.stdout.write(`✓ leader ${leader.fullName}\n`);
    } catch (error) {
      results.push({ leader, error: error.message });
      process.stdout.write(`✗ leader ${leader.fullName}: ${error.message}\n`);
    }
    await sleep(250);
  }
  return results;
}

async function scrapeCiv(civilization, slug) {
  const html = await fetchHtml(`${BASE}/civilizations/${slug}/`);
  const { ability } = parseCivilopediaPage(html);
  if (!ability) throw new Error("civilization ability not found");

  const abilities = [
    {
      name: ability.name,
      type: "Abilità esclusiva",
      description: ability.description,
    },
  ];
  const civIcon = await resolveAbilityIcon(html);
  const civIcons = {};
  abilityIcons.civs[civilization] = civIcons;
  if (civIcon) civIcons[ability.name] = civIcon;

  const items = getSidebarItems(html, [
    "Unità speciali",
    "Infrastruttura speciale",
  ]);

  for (const item of items) {
    try {
      const itemHtml = await fetchHtml(item.href);
      const { description } = parseCivilopediaPage(itemHtml);
      if (!description) {
        process.stdout.write(
          `  ! ${civilization}: descrizione mancante per ${item.name}\n`,
        );
        continue;
      }
      const itemName = description.name || item.name;
      abilities.push({
        name: itemName,
        type: item.type,
        description: description.description,
      });
      const itemIcon = await resolveAbilityIcon(itemHtml);
      if (itemIcon) {
        civIcons[itemName] = itemIcon;
      } else if (civIcon) {
        civIcons[itemName] = civIcon;
      }
    } catch (error) {
      process.stdout.write(
        `  ! ${civilization}: errore su ${item.name}: ${error.message}\n`,
      );
    }
    await sleep(250);
  }

  return abilities;
}

async function scrapeCivs(civNames) {
  const results = [];
  for (const civilization of civNames) {
    const slug = CIV_SLUGS[civilization];
    if (!slug) {
      results.push({ civilization, error: "missing civ slug" });
      continue;
    }
    try {
      const abilities = await scrapeCiv(civilization, slug);
      const content = formatAbilities(abilities);
      const filePath = await writeFileSafe(CIVS_OUT, civilization, content);
      results.push({ civilization, slug, filePath, count: abilities.length });
      process.stdout.write(
        `✓ civ ${civilization} (${abilities.length} voci)\n`,
      );
    } catch (error) {
      results.push({ civilization, error: error.message });
      process.stdout.write(`✗ civ ${civilization}: ${error.message}\n`);
    }
    await sleep(250);
  }
  return results;
}

async function main() {
  console.log("Civilopedia → CivTracker description sync");
  console.log(`Output: ${OUT_DIR}`);

  const ourLeaders = await loadOurLeaders();
  const civNames = [...new Set(ourLeaders.map((leader) => leader.civilization))];
  console.log(
    `Leaders: ${ourLeaders.length}, civilizations: ${civNames.length}`,
  );

  const index = await loadSiteIndex();
  console.log(
    `Civilopedia index: ${index.leaders.length} leaders, ${index.civs.length} civilizations`,
  );

  const { mapping, problems } = mapLeaders(ourLeaders, index.leaders);
  if (problems.length > 0) {
    console.log("\nUnmapped leaders (need a manual override):");
    for (const problem of problems) {
      console.log(` - ${problem.leader}: ${JSON.stringify(problem.candidates)}`);
    }
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(
    path.join(OUT_DIR, "leader-slugs.json"),
    JSON.stringify(
      Object.fromEntries(
        mapping.map((entry) => [entry.fullName, entry.slug]),
      ),
      null,
      2,
    ),
    "utf8",
  );

  if (args.includes("--map-only")) {
    console.log("\nLeader mapping:");
    for (const entry of mapping) {
      console.log(` - ${entry.fullName} -> ${entry.slug} (${entry.siteTitle})`);
    }
    return;
  }

  let leaderResults = [];
  if (ONLY === "all" || ONLY === "leaders") {
    console.log("\nScraping leaders...");
    const leaders = LIMIT > 0 ? ourLeaders.slice(0, LIMIT) : ourLeaders;
    leaderResults = await scrapeLeaders(leaders, mapping);
  }

  let civResults = [];
  if (ONLY === "all" || ONLY === "civs") {
    console.log("\nScraping civilizations...");
    const civs = LIMIT > 0 ? civNames.slice(0, LIMIT) : civNames;
    civResults = await scrapeCivs(civs);
  }

  if (unknownIcons.size > 0) {
    console.log("\nUnknown icons (dropped from text):");
    for (const [icon, count] of unknownIcons) {
      console.log(` - ${icon} (${count})`);
    }
  }

  const errors = [...leaderResults, ...civResults].filter(
    (result) => result.error,
  );
  console.log(
    `\nDone. Leaders: ${leaderResults.length}, civilizations: ${civResults.length}, errors: ${errors.length}`,
  );

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(
    path.join(OUT_DIR, "ability-icons.json"),
    JSON.stringify(abilityIcons, null, 2),
    "utf8",
  );
  await fs.writeFile(
    path.join(OUT_DIR, "scrape-report.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        leaderCount: leaderResults.length,
        civCount: civResults.length,
        errors,
        unknownIcons: Object.fromEntries(unknownIcons),
      },
      null,
      2,
    ),
    "utf8",
  );
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exitCode = 1;
});
