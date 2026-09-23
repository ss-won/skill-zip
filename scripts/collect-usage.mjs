#!/usr/bin/env node
// Count how often each skill in this repo was actually used, by scanning local agent transcripts.
// No hooks needed — works for any agent that logs to JSONL:
//   Claude Code / Claude desktop : ~/.claude/projects/**/*.jsonl   ("name":"Skill","input":{"skill":"<name>"} or .../<name>/SKILL.md)
//   Codex                        : ~/.codex/sessions/**/*.jsonl     (reads of .../<name>/SKILL.md, or $<name> mentions)
//
//   node scripts/collect-usage.mjs [--days 90] [--device my-mac] [--write]
//
// --write saves metrics/usage/<device>.json (commit it so check-deprecation.mjs sees usage across machines).
// Only skill names + dates are recorded — never transcript content.
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { homedir, hostname } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { listSkills, METRICS_DIR, today } from './lib/skills.mjs';

const { values } = parseArgs({
  options: {
    days: { type: 'string', default: '90' },
    device: { type: 'string', default: hostname().replace(/\.local$/, '') },
    write: { type: 'boolean', default: false },
  },
});
const since = Date.now() - Number(values.days) * 86_400_000;
const names = listSkills().map((s) => s.dir);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = Object.fromEntries(
  names.map((n) => [
    n,
    new RegExp(`"skill"\\s*:\\s*"(?:[\\w-]+:)?${esc(n)}"|/${esc(n)}/SKILL\\.md|\\$${esc(n)}\\b`),
  ]),
);

const roots = {
  'claude-code': join(homedir(), '.claude', 'projects'),
  codex: join(homedir(), '.codex', 'sessions'),
};

function* walk(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.jsonl')) yield p;
  }
}

// usage[skill][agent] = { sessions, lastUsed }
const usage = Object.fromEntries(names.map((n) => [n, {}]));
for (const [agent, root] of Object.entries(roots)) {
  for (const file of walk(root)) {
    const mtime = statSync(file).mtimeMs;
    if (mtime < since) continue;
    const text = readFileSync(file, 'utf8');
    for (const n of names) {
      if (!patterns[n].test(text)) continue;
      const u = (usage[n][agent] ??= { sessions: 0, lastUsed: null });
      u.sessions += 1;
      const d = new Date(mtime).toISOString().slice(0, 10);
      if (!u.lastUsed || d > u.lastUsed) u.lastUsed = d;
    }
  }
}

const report = { device: values.device, collected: today(), windowDays: Number(values.days), usage };
console.log(JSON.stringify(report, null, 2));
if (values.write) {
  mkdirSync(join(METRICS_DIR, 'usage'), { recursive: true });
  const out = join(METRICS_DIR, 'usage', `${values.device}.json`);
  writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
  console.error(`wrote ${out}`);
}
