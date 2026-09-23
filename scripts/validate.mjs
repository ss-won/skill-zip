#!/usr/bin/env node
// Lint every skill: frontmatter, naming, size, registry entry. Used by CI and before commits.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { listSkills, readRegistry, SKILLS_DIR } from './lib/skills.mjs';

const errors = [];
const warn = [];
const registry = readRegistry();

for (const s of listSkills()) {
  const where = `skills/${s.dir}`;
  if (!s.text) { errors.push(`${where}: missing SKILL.md`); continue; }
  if (!s.meta) { errors.push(`${where}: missing YAML frontmatter`); continue; }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.dir)) errors.push(`${where}: directory must be kebab-case`);
  if (s.meta.name !== s.dir) errors.push(`${where}: frontmatter name "${s.meta.name}" must equal directory name`);
  if (!s.meta.description) errors.push(`${where}: description is required`);
  else if (s.meta.description.length > 1024) errors.push(`${where}: description > 1024 chars (Codex/agentskills limit)`);
  if (/[<>]/.test(s.meta.description ?? '')) errors.push(`${where}: description must not contain angle brackets`);
  const lines = s.text.split('\n').length;
  if (lines > 500) warn.push(`${where}: SKILL.md is ${lines} lines (>500) — move detail to references/`);
  if (!registry.skills[s.dir]) errors.push(`${where}: not listed in registry.json`);
  if (!existsSync(join(SKILLS_DIR, s.dir, 'agents', 'openai.yaml'))) warn.push(`${where}: no agents/openai.yaml (optional Codex UI metadata)`);
}
for (const name of Object.keys(registry.skills)) {
  if (!existsSync(join(SKILLS_DIR, name, 'SKILL.md'))) errors.push(`registry.json: "${name}" has no skills/${name}/SKILL.md`);
}

warn.forEach((w) => console.warn(`warn  ${w}`));
errors.forEach((e) => console.error(`error ${e}`));
console.log(errors.length ? `✗ ${errors.length} error(s)` : '✓ all skills valid');
process.exit(errors.length ? 1 : 0);
