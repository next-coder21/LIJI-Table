import { readFileSync } from "node:fs";
import path from "node:path";

export interface ChangelogCategory {
  name: string;
  items: string[];
}

export interface ChangelogPackage {
  name: string;
  categories: ChangelogCategory[];
}

export interface ChangelogEntry {
  version: string;
  date?: string;
  note: string[]; // freeform paragraph lines attached directly under the version header
  packages: ChangelogPackage[];
}

export interface ChangelogData {
  entries: ChangelogEntry[];
  unreleased: ChangelogCategory[];
}

const VERSION_HEADER = /^##\s+\[([^\]]+)\](?:\s*(?:–|-)\s*(.+))?$/;
const PACKAGE_HEADER = /^###\s+(.+)$/;
const CATEGORY_HEADER = /^####\s+(.+)$/;
const BULLET = /^-\s+(.+)$/;

export function getChangelog(): ChangelogData {
  const filePath = path.join(process.cwd(), "..", "CHANGELOG.md");
  const raw = readFileSync(filePath, "utf-8");
  // Normalize CRLF (the file is authored on Windows) so `$`-anchored regexes
  // below match line ends correctly - JS's `$` does not match before a
  // trailing `\r`.
  const lines = raw.replace(/\r\n/g, "\n").split("\n");

  const entries: ChangelogEntry[] = [];
  const unreleased: ChangelogCategory[] = [];

  let mode: "none" | "entries" | "unreleased" = "none";
  let currentEntry: ChangelogEntry | null = null;
  let currentPackage: ChangelogPackage | null = null;
  let currentCategory: ChangelogCategory | null = null;

  const flushCategory = () => {
    if (currentCategory && currentPackage) currentPackage.categories.push(currentCategory);
    currentCategory = null;
  };
  const flushPackage = () => {
    flushCategory();
    if (currentPackage && currentEntry) currentEntry.packages.push(currentPackage);
    currentPackage = null;
  };
  const flushEntry = () => {
    flushPackage();
    if (currentEntry) entries.push(currentEntry);
    currentEntry = null;
  };

  for (const line of lines) {
    if (/^##\s+Legend/.test(line)) {
      flushEntry();
      mode = "none";
      continue;
    }
    if (/^##\s+Unreleased/.test(line)) {
      flushEntry();
      mode = "unreleased";
      continue;
    }

    const versionMatch = line.match(VERSION_HEADER);
    if (versionMatch) {
      flushEntry();
      mode = "entries";
      currentEntry = { version: versionMatch[1], date: versionMatch[2]?.trim(), note: [], packages: [] };
      continue;
    }

    if (mode === "entries" && currentEntry) {
      const pkgMatch = line.match(PACKAGE_HEADER);
      if (pkgMatch) {
        flushPackage();
        currentPackage = { name: pkgMatch[1].trim(), categories: [] };
        continue;
      }
      const catMatch = line.match(CATEGORY_HEADER);
      if (catMatch && currentPackage) {
        flushCategory();
        currentCategory = { name: catMatch[1].trim(), items: [] };
        continue;
      }
      const bulletMatch = line.match(BULLET);
      if (bulletMatch) {
        if (currentCategory) {
          currentCategory.items.push(bulletMatch[1]);
        } else if (!currentPackage) {
          // bullet directly under the version header (e.g. the undocumented-range note)
          currentEntry.note.push(line);
        }
        continue;
      }
      if (!currentPackage && line.trim() && !line.startsWith("---")) {
        currentEntry.note.push(line.trim());
      }
      continue;
    }

    if (mode === "unreleased") {
      const catMatch = line.match(CATEGORY_HEADER);
      if (catMatch) {
        if (currentCategory) unreleased.push(currentCategory);
        currentCategory = { name: catMatch[1].trim(), items: [] };
        continue;
      }
      const bulletMatch = line.match(BULLET);
      if (bulletMatch && currentCategory) {
        currentCategory.items.push(bulletMatch[1]);
      }
      continue;
    }
  }

  // Push any pending "unreleased" category BEFORE flushEntry(): flushEntry()
  // cascades into flushCategory(), which unconditionally nulls
  // `currentCategory` (shared between "entries" and "unreleased" mode) -
  // calling it first would wipe out the category we're about to push.
  if (mode === "unreleased" && currentCategory) {
    unreleased.push(currentCategory);
    currentCategory = null;
  }
  flushEntry();

  return { entries, unreleased };
}
