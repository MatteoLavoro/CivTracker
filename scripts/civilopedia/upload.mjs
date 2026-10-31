#!/usr/bin/env node
/**
 * Upload the AUTO descriptions to Firestore (leaders collection).
 *
 * The app stores descriptions inside each leader document:
 *   abilities: [{ name, type, description }]
 *   civilizationAbilities: [{ name, type, description }]
 *
 * The script signs in with a temporary account (created via Firebase Auth
 * REST API) because the current Firestore rules allow any authenticated user
 * to update leaders. The account is deleted at the end.
 *
 * Usage:
 *   node scripts/civilopedia/upload.mjs            # dry run
 *   node scripts/civilopedia/upload.mjs --apply    # write to Firestore
 *   node scripts/civilopedia/upload.mjs --apply --limit=5
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "../..");
const AUTO_DIR = path.join(ROOT, "public", "AUTOCivDescrizioni");
const LEADERS_DIR = path.join(AUTO_DIR, "DescrizionePersonaggi");
const CIVS_DIR = path.join(AUTO_DIR, "DescrizioneCiviltà");
const ICONS_MANIFEST = path.join(AUTO_DIR, "ability-icons.json");
const CIV_ICONS_MANIFEST = path.join(AUTO_DIR, "civ-icons.json");

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const VERIFY_ONLY = args.includes("--verify-only");
const LIMIT = Number(args.find((arg) => arg.startsWith("--limit="))?.split("=")[1]) || 0;

const API_KEY =
  process.env.VITE_FIREBASE_API_KEY ||
  "AIzaSyAgIPKkYjlHMBym97HxmNbAViX8HvNwtAA";
const PROJECT_ID =
  process.env.VITE_FIREBASE_PROJECT_ID || "civtracker-1";
const AUTH_BASE = "https://identitytoolkit.googleapis.com/v1";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseAbilities(text) {
  const abilities = [];
  let current = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    const header = line.match(/^\[([^\]]+)\]\s*\{([^}]+)\}$/);
    if (header) {
      if (current?.lines.length) abilities.push(current);
      current = {
        name: header[1].trim(),
        type: header[2].trim(),
        lines: [],
      };
    } else if (current && line) {
      current.lines.push(line);
    }
  }
  if (current?.lines.length) abilities.push(current);
  return abilities.map((ability) => ({
    name: ability.name,
    type: ability.type,
    description: ability.lines.join("\n"),
  }));
}

async function readAbilities(dir, name) {
  const text = await fs.readFile(path.join(dir, `${name}.txt`), "utf8");
  return parseAbilities(text);
}

function withIcons(abilities, iconMap = {}) {
  return abilities.map((ability) => ({
    ...ability,
    ...(iconMap[ability.name] ? { icon: iconMap[ability.name] } : {}),
  }));
}

async function api(url, options = {}, retries = 3) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      const body = await response.text();
      let json = null;
      try {
        json = body ? JSON.parse(body) : null;
      } catch {
        // keep raw body
      }
      if (!response.ok) {
        const message =
          json?.error?.message || body.slice(0, 300) || response.statusText;
        throw new Error(`HTTP ${response.status}: ${message}`);
      }
      return json;
    } catch (error) {
      lastError = error;
      if (attempt < retries) await sleep(500 * (attempt + 1));
    }
  }
  throw lastError;
}

function toFirestoreValue(abilities) {
  return {
    arrayValue: {
      values: abilities.map((ability) => ({
        mapValue: {
          fields: {
            name: { stringValue: ability.name },
            type: { stringValue: ability.type },
            description: { stringValue: ability.description },
            ...(ability.icon ? { icon: { stringValue: ability.icon } } : {}),
          },
        },
      })),
    },
  };
}

function fromFirestoreAbilities(document, field) {
  const values = document?.fields?.[field]?.arrayValue?.values || [];
  return values.map((value) => {
    const fields = value.mapValue?.fields || {};
    return {
      name: fields.name?.stringValue || "",
      type: fields.type?.stringValue || "",
      description: fields.description?.stringValue || "",
      ...(fields.icon?.stringValue
        ? { icon: fields.icon.stringValue }
        : {}),
    };
  });
}

async function createTemporaryUser() {
  const email = `civtracker.autoseed.${Date.now()}@example.com`;
  const password = crypto.randomBytes(18).toString("base64url");
  const response = await api(`${AUTH_BASE}/accounts:signUp?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  return {
    email,
    idToken: response.idToken,
    localId: response.localId,
    refreshToken: response.refreshToken,
  };
}

async function deleteTemporaryUser(idToken) {
  return api(`${AUTH_BASE}/accounts:delete?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

async function listLeaders(idToken) {
  const documents = [];
  let pageToken = "";
  do {
    const url = new URL(`${FIRESTORE_BASE}/leaders`);
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const response = await api(url.toString(), {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    documents.push(...(response.documents || []));
    pageToken = response.nextPageToken || "";
  } while (pageToken);
  return documents;
}

function getField(document, field) {
  return document.fields?.[field]?.stringValue ?? "";
}

async function main() {
  console.log(`Upload descrizioni AUTO ${APPLY ? "(APPLY)" : "(dry run)"}`);
  console.log(`Project: ${PROJECT_ID}`);

  const leaderFiles = (await fs.readdir(LEADERS_DIR))
    .filter((name) => name.endsWith(".txt"))
    .map((name) => name.replace(/\.txt$/i, ""));
  const civFiles = (await fs.readdir(CIVS_DIR))
    .filter((name) => name.endsWith(".txt"))
    .map((name) => name.replace(/\.txt$/i, ""));
  const iconManifest = JSON.parse(await fs.readFile(ICONS_MANIFEST, "utf8"));
  const civIconManifest = JSON.parse(
    await fs.readFile(CIV_ICONS_MANIFEST, "utf8"),
  );
  console.log(`File AUTO: ${leaderFiles.length} leader, ${civFiles.length} civiltà`);

  let temporaryUser = null;
  let updated = 0;
  const missing = [];
  const civCache = new Map();

  try {
    temporaryUser = await createTemporaryUser();
    console.log(`Account temporaneo creato: ${temporaryUser.email}`);

    const documents = await listLeaders(temporaryUser.idToken);
    console.log(`Leader trovati in Firestore: ${documents.length}`);

    const leaders = documents
      .map((document) => {
        const id = document.name.split("/").pop();
        const name = getField(document, "name");
        const variant = getField(document, "variant");
        const civilization = getField(document, "civilization");
        return {
          id,
          name,
          variant,
          civilization,
          fullName: variant ? `${name} (${variant})` : name,
        };
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName, "it"));

    const selected = LIMIT > 0 ? leaders.slice(0, LIMIT) : leaders;

    if (VERIFY_ONLY) {
      let checked = 0;
      let mismatches = 0;
      for (const leader of selected) {
        const document = documents.find((entry) =>
          entry.name.endsWith(`/${leader.id}`),
        );
        if (!document) {
          mismatches += 1;
          console.log(`✗ ${leader.fullName}: documento non trovato`);
          continue;
        }
        const abilities = leaderFiles.includes(leader.fullName)
          ? withIcons(
              await readAbilities(LEADERS_DIR, leader.fullName),
              iconManifest.leaders?.[leader.fullName],
            )
          : [];
        const civilizationAbilities = civFiles.includes(leader.civilization)
          ? withIcons(
              await readAbilities(CIVS_DIR, leader.civilization),
              iconManifest.civs?.[leader.civilization],
            )
          : [];
        const actualAbilities = fromFirestoreAbilities(document, "abilities");
        const actualCiv = fromFirestoreAbilities(
          document,
          "civilizationAbilities",
        );
        const sameAbilities =
          JSON.stringify(actualAbilities) === JSON.stringify(abilities);
        const sameCiv =
          civilizationAbilities.length === 0 ||
          JSON.stringify(actualCiv) === JSON.stringify(civilizationAbilities);
        const expectedCivIcon = civIconManifest[leader.fullName]?.path;
        const sameCivIcon =
          !expectedCivIcon ||
          getField(document, "civilizationIconPath") === expectedCivIcon;
        if (!sameAbilities || !sameCiv || !sameCivIcon) {
          mismatches += 1;
          console.log(
            `✗ ${leader.fullName}: abilities=${sameAbilities ? "ok" : "diverse"}, civ=${sameCiv ? "ok" : "diverse"}, iconaCiv=${sameCivIcon ? "ok" : "diversa"}`,
          );
        }
        checked += 1;
      }
      console.log(
        `\nVerifica contenuti: ${checked - mismatches}/${checked} leader identici`,
      );
      return;
    }

    for (const leader of selected) {
      if (!leaderFiles.includes(leader.fullName)) {
        missing.push(`leader: ${leader.fullName} (${leader.id})`);
        continue;
      }
      if (!civFiles.includes(leader.civilization)) {
        missing.push(
          `civ: ${leader.civilization} per ${leader.fullName} (${leader.id})`,
        );
      }

      const abilities = withIcons(
        await readAbilities(LEADERS_DIR, leader.fullName),
        iconManifest.leaders?.[leader.fullName],
      );
      let civilizationAbilities = [];
      if (civFiles.includes(leader.civilization)) {
        if (!civCache.has(leader.civilization)) {
          civCache.set(
            leader.civilization,
            withIcons(
              await readAbilities(CIVS_DIR, leader.civilization),
              iconManifest.civs?.[leader.civilization],
            ),
          );
        }
        civilizationAbilities = civCache.get(leader.civilization);
      }

      if (!APPLY) {
        console.log(
          `· ${leader.fullName}: ${abilities.length} abilità, ${civilizationAbilities.length} civ (dry)`,
        );
        continue;
      }

      const fields = {
        abilities: toFirestoreValue(abilities),
      };
      if (civilizationAbilities.length > 0) {
        fields.civilizationAbilities = toFirestoreValue(
          civilizationAbilities,
        );
      }

      const updateMask = ["abilities"];
      if (civilizationAbilities.length > 0) {
        updateMask.push("civilizationAbilities");
      }

      // Alternate civilization logo (leader-specific jersey colours)
      const civIconPath = civIconManifest[leader.fullName]?.path;
      if (civIconPath) {
        const document = documents.find((entry) =>
          entry.name.endsWith(`/${leader.id}`),
        );
        const currentCivIcon = getField(document, "civilizationIconPath");
        const baseCivIcon = getField(document, "baseCivilizationIconPath");
        fields.civilizationIconPath = { stringValue: civIconPath };
        updateMask.push("civilizationIconPath");
        if (!baseCivIcon && currentCivIcon) {
          fields.baseCivilizationIconPath = { stringValue: currentCivIcon };
          updateMask.push("baseCivilizationIconPath");
        }
      }
      const query = updateMask
        .map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`)
        .join("&");

      await api(`${FIRESTORE_BASE}/leaders/${leader.id}?${query}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${temporaryUser.idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });
      updated += 1;
      if (updated % 10 === 0) {
        console.log(`  aggiornati ${updated}/${selected.length}…`);
      }
      await sleep(80);
    }

    if (missing.length > 0) {
      console.log("\nCorrispondenze mancanti:");
      missing.forEach((entry) => console.log(` - ${entry}`));
    }
    console.log(
      `\n${APPLY ? "Aggiornati" : "Da aggiornare"}: ${APPLY ? updated : selected.length} leader`,
    );

    if (APPLY && updated > 0) {
      // Verify what was written by reading the collection again
      const check = await listLeaders(temporaryUser.idToken);
      const withAbilities = check.filter(
        (document) => document.fields?.abilities?.arrayValue?.values?.length,
      );
      console.log(
        `Verifica: ${withAbilities.length}/${check.length} leader con descrizioni in Firestore`,
      );
    }
  } finally {
    if (temporaryUser) {
      try {
        await deleteTemporaryUser(temporaryUser.idToken);
        console.log("Account temporaneo eliminato.");
      } catch (error) {
        console.error(
          `ATTENZIONE: impossibile eliminare l'account temporaneo ${temporaryUser.email}: ${error.message}`,
        );
      }
    }
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exitCode = 1;
});
