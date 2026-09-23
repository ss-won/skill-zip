// Shared helpers. Zero dependencies on purpose so every script runs with plain `node`.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SKILLS_DIR = join(ROOT, 'skills');
export const METRICS_DIR = join(ROOT, 'metrics');

/** Minimal YAML frontmatter parser: handles `key: value` scalars (the only thing SKILL.md needs). */
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

export function listSkills() {
  if (!existsSync(SKILLS_DIR)) return [];
  return readdirSync(SKILLS_DIR)
    .filter((d) => statSync(join(SKILLS_DIR, d)).isDirectory())
    .map((dir) => {
      const path = join(SKILLS_DIR, dir, 'SKILL.md');
      const text = existsSync(path) ? readFileSync(path, 'utf8') : '';
      return { dir, path, text, meta: parseFrontmatter(text) };
    });
}

export function readRegistry() {
  return JSON.parse(readFileSync(join(ROOT, 'registry.json'), 'utf8'));
}

export function readJsonl(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

export const daysBetween = (a, b) => Math.floor((new Date(b) - new Date(a)) / 86_400_000);
export const today = () => new Date().toISOString().slice(0, 10);
