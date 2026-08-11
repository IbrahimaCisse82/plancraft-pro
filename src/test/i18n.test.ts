import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const ctxFile = path.join(root, "contexts", "I18nContext.tsx");
const source = fs.readFileSync(ctxFile, "utf8");

/** Extract the translations map keys with their available languages. */
function parseTranslations() {
  const body = source.slice(source.indexOf("const translations"), source.indexOf("interface I18nContextType"));
  const entries = new Map<string, { fr: boolean; en: boolean }>();
  const re = /"([^"\n]+)":\s*\{\s*fr:\s*(?:"|')/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const line = body.slice(m.index, body.indexOf("\n", m.index));
    entries.set(m[1], { fr: true, en: /\ben:\s*("|')/.test(line) });
  }
  return entries;
}

function walk(dir: string, acc: string[] = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (["ui", "test", "integrations"].includes(f.name)) continue;
      walk(p, acc);
    } else if (/\.tsx?$/.test(f.name)) acc.push(p);
  }
  return acc;
}

describe("i18n", () => {
  const translations = parseTranslations();

  it("charge un nombre significatif de clés", () => {
    expect(translations.size).toBeGreaterThan(300);
  });

  it("chaque clé possède une traduction FR et EN", () => {
    const missing = [...translations.entries()].filter(([, v]) => !v.fr || !v.en).map(([k]) => k);
    expect(missing).toEqual([]);
  });

  it("chaque clé utilisée via t(\"...\") existe dans le dictionnaire", () => {
    const used = new Set<string>();
    for (const file of walk(root)) {
      if (file === ctxFile) continue;
      const src = fs.readFileSync(file, "utf8");
      const re = /\bt\(\s*"([a-zA-Z0-9_.]+)"/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src))) used.add(m[1]);
    }
    const unknown = [...used].filter((k) => k.includes(".") && !translations.has(k));
    expect(unknown).toEqual([]);
  });
});
