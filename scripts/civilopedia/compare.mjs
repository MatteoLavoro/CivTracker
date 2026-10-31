#!/usr/bin/env node
/**
 * Compare the automatically scraped descriptions with the hand-written ones.
 *
 * Usage: node scripts/civilopedia/compare.mjs [--threshold=0.95]
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "../..");
const AUTO_DIR = path.join(ROOT, "public", "AUTOCivDescrizioni");
const MANUAL_DIR = path.join(ROOT, "public", "CivDescrizioni");
const LEADERS = "DescrizionePersonaggi";
const CIVS = "DescrizioneCiviltà";

const args = process.argv.slice(2);
const threshold =
  Number(args.find((arg) => arg.startsWith("--threshold="))?.split("=")[1]) ||
  0.95;

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

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\[[a-z]+icon\]/gi, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  let current = new Array(b.length + 1);
  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      );
    }
    [previous, current] = [current, previous];
  }
  return previous[b.length];
}

function similarity(a, b) {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const maxLength = Math.max(a.length, b.length);
  return 1 - levenshtein(a, b) / maxLength;
}

function scoreFile(existingAbilities, generatedAbilities) {
  const used = new Set();
  const details = [];
  let total = 0;

  for (const existing of existingAbilities) {
    const existingName = normalizeText(existing.name);
    const existingDescription = normalizeText(existing.description);

    let best = null;
    generatedAbilities.forEach((generated, index) => {
      if (used.has(index)) return;
      const generatedName = normalizeText(generated.name);
      const nameScore =
        generatedName === existingName
          ? 1
          : similarity(generatedName, existingName);
      if (nameScore < 0.72) return;
      const descriptionScore = similarity(
        existingDescription,
        normalizeText(generated.description),
      );
      const score = nameScore * 0.15 + descriptionScore * 0.85;
      if (!best || score > best.score) {
        best = { index, nameScore, descriptionScore, score, generated };
      }
    });

    if (best) {
      used.add(best.index);
      total += best.descriptionScore;
      details.push({
        name: existing.name,
        matchedName: best.generated.name,
        nameScore: Number(best.nameScore.toFixed(3)),
        score: Number(best.descriptionScore.toFixed(3)),
      });
    } else {
      details.push({ name: existing.name, matchedName: null, score: 0 });
    }
  }

  const matched = details.filter((detail) => detail.matchedName).length;
  const coverage =
    matched / Math.max(existingAbilities.length, generatedAbilities.length, 1);
  const average = matched > 0 ? total / matched : 0;
  return {
    score: Number((average * coverage).toFixed(3)),
    average: Number(average.toFixed(3)),
    coverage: Number(coverage.toFixed(3)),
    abilities: details,
  };
}

async function listTxt(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".txt"))
      .map((entry) => entry.name.replace(/\.txt$/i, ""))
      .sort((a, b) => a.localeCompare(b, "it"));
  } catch {
    return [];
  }
}

async function readAbilities(dir, name) {
  const text = await fs.readFile(path.join(dir, `${name}.txt`), "utf8");
  return parseAbilities(text);
}

async function compareGroup(kind, folder) {
  const manualNames = await listTxt(path.join(MANUAL_DIR, folder));
  const autoNames = await listTxt(path.join(AUTO_DIR, folder));
  const files = [];

  for (const name of manualNames) {
    if (kind === "civs" && name === "Didone") {
      files.push({ name, skipped: true, reason: "non è una civiltà" });
      continue;
    }
    if (!autoNames.includes(name)) {
      files.push({ name, score: 0, missing: true, abilities: [] });
      continue;
    }
    const [existing, generated] = await Promise.all([
      readAbilities(path.join(MANUAL_DIR, folder), name),
      readAbilities(path.join(AUTO_DIR, folder), name),
    ]);
    files.push({ name, ...scoreFile(existing, generated) });
  }

  const scored = files.filter((file) => !file.skipped);
  const average =
    scored.length > 0
      ? scored.reduce((sum, file) => sum + file.score, 0) / scored.length
      : 0;
  const passed = scored.filter((file) => file.score >= threshold).length;

  return {
    kind,
    manualCount: manualNames.length,
    autoCount: autoNames.length,
    missingAuto: scored.filter((file) => file.missing).map((file) => file.name),
    average: Number(average.toFixed(4)),
    passed,
    total: scored.length,
    files: files.sort((a, b) => (a.score ?? 1) - (b.score ?? 1)),
  };
}

function formatReport(report) {
  const lines = [];
  lines.push("# Confronto descrizioni AUTO vs manuali");
  lines.push("");
  lines.push(`Soglia: **${threshold}**`);
  lines.push("");
  for (const group of report.groups) {
    lines.push(
      `## ${group.kind} — media ${(group.average * 100).toFixed(1)}% (${group.passed}/${group.total} sopra soglia)`,
    );
    lines.push("");
    lines.push("| File | Punteggio | Copertura | Media abilità |");
    lines.push("| --- | ---: | ---: | ---: |");
    for (const file of group.files) {
      if (file.skipped) {
        lines.push(`| ${file.name} | — | — | saltato: ${file.reason} |`);
        continue;
      }
      lines.push(
        `| ${file.name} | ${((file.score ?? 0) * 100).toFixed(1)}% | ${((file.coverage ?? 0) * 100).toFixed(0)}% | ${((file.average ?? 0) * 100).toFixed(1)}% |`,
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  const [leaders, civs] = await Promise.all([
    compareGroup("leaders", LEADERS),
    compareGroup("civs", CIVS),
  ]);

  const scored = [...leaders.files, ...civs.files].filter(
    (file) => !file.skipped,
  );
  const overallAverage =
    scored.reduce((sum, file) => sum + (file.score ?? 0), 0) / scored.length;

  const report = {
    generatedAt: new Date().toISOString(),
    threshold,
    groups: [leaders, civs],
    overall: {
      average: Number(overallAverage.toFixed(4)),
      files: scored.length,
      passed: scored.filter((file) => (file.score ?? 0) >= threshold).length,
      passesThreshold: overallAverage >= threshold,
    },
  };

  await fs.mkdir(AUTO_DIR, { recursive: true });
  await fs.writeFile(
    path.join(AUTO_DIR, "comparison-report.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  );
  const markdown = formatReport(report);
  await fs.writeFile(
    path.join(AUTO_DIR, "comparison-report.md"),
    markdown,
    "utf8",
  );

  console.log(markdown);
  console.log(
    `\nRISULTATO: media ${(overallAverage * 100).toFixed(2)}% — soglia ${threshold * 100}% — ${overallAverage >= threshold ? "SUPERATA" : "NON SUPERATA"}`,
  );
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exitCode = 1;
});
