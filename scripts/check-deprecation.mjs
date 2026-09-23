#!/usr/bin/env node
// Flag skills that may no longer earn their place. A skill becomes a *candidate* (never auto-deleted) when:
//
//   caught-up   latest benchmark on a tracked model shows delta < policy.minDelta
//               → the base model now does this well without the skill
//   regression  with-skill pass rate dropped by > policy.regressionDrop vs the previous run on the same model
//               → a model update broke the skill; fix it or retire it
//   unused      no usage on any device for policy.unusedDays (needs metrics/usage/*.json)
//   stale       no benchmark for a tracked model, or last one older than policy.staleBenchmarkDays
//               → not a deprecation reason by itself; means "re-benchmark me"
//
//   node scripts/check-deprecation.mjs [--json] [--apply]
//
// --apply sets registry status to "candidate" for skills with caught-up / regression / unused flags.
// Moving candidate → deprecated is always a human decision.
import { readdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { METRICS_DIR, ROOT, readRegistry, readJsonl, daysBetween, today } from './lib/skills.mjs';

const { values } = parseArgs({ options: { json: { type: 'boolean' }, apply: { type: 'boolean' } } });
const registry = readRegistry();
const { policy, trackedModels } = registry;
const now = today();

// merge usage across devices
const usageDir = join(METRICS_DIR, 'usage');
const lastUsed = {};
let haveUsage = false;
if (existsSync(usageDir)) {
  for (const f of readdirSync(usageDir).filter((f) => f.endsWith('.json'))) {
    haveUsage = true;
    const r = JSON.parse(readFileSync(join(usageDir, f), 'utf8'));
    for (const [skill, agents] of Object.entries(r.usage ?? {})) {
      for (const a of Object.values(agents)) {
        if (a.lastUsed && (!lastUsed[skill] || a.lastUsed > lastUsed[skill])) lastUsed[skill] = a.lastUsed;
      }
    }
  }
}

const report = [];
for (const [name, info] of Object.entries(registry.skills)) {
  if (info.status === 'deprecated') continue;
  const rows = readJsonl(join(METRICS_DIR, name, 'benchmarks.jsonl'));
  const flags = [];

  for (const model of trackedModels) {
    const runs = rows.filter((r) => r.model === model).sort((a, b) => a.date.localeCompare(b.date));
    const last = runs.at(-1);
    if (!last) { flags.push({ type: 'stale', detail: `no benchmark on ${model}` }); continue; }
    if (daysBetween(last.date, now) > policy.staleBenchmarkDays)
      flags.push({ type: 'stale', detail: `${model}: last benchmark ${last.date}` });
    // "caught-up" only makes sense against a no-skill baseline (version-vs-version runs measure the edit, not the skill's value)
    const vsBase = runs.filter((r) => r.baselineKind !== 'previous-version').at(-1);
    if (vsBase && vsBase.delta < policy.minDelta)
      flags.push({ type: 'caught-up', detail: `${model}: delta ${vsBase.delta} < ${policy.minDelta} (skill ${vsBase.withSkill} vs no-skill ${vsBase.baseline})` });
    const prev = runs.at(-2);
    if (prev && prev.withSkill - last.withSkill > policy.regressionDrop)
      flags.push({ type: 'regression', detail: `${model}: ${prev.withSkill} → ${last.withSkill}` });
  }

  if (haveUsage) {
    const lu = lastUsed[name];
    const since = lu ?? info.added;
    if (daysBetween(since, now) > policy.unusedDays)
      flags.push({ type: 'unused', detail: lu ? `last used ${lu}` : `never used since added ${info.added}` });
  }

  const deprecating = flags.some((f) => f.type !== 'stale');
  report.push({ skill: name, status: info.status, candidate: deprecating, flags });
  if (values.apply && deprecating && info.status === 'active') info.status = 'candidate';
  if (values.apply && !deprecating && info.status === 'candidate') info.status = 'active';
}

if (values.apply) writeFileSync(join(ROOT, 'registry.json'), JSON.stringify(registry, null, 2) + '\n');

if (values.json) {
  console.log(JSON.stringify({ date: now, report }, null, 2));
} else {
  console.log(`# Skill health — ${now}\n`);
  if (!haveUsage) console.log('_No usage data in metrics/usage/ — run `node scripts/collect-usage.mjs --write` on each device._\n');
  console.log('| skill | status | verdict | flags |\n|---|---|---|---|');
  for (const r of report) {
    const verdict = r.candidate ? '⚠️ deprecation candidate' : r.flags.length ? '🔁 re-benchmark' : '✅ healthy';
    console.log(`| ${r.skill} | ${r.status} | ${verdict} | ${r.flags.map((f) => `${f.type}: ${f.detail}`).join('<br>') || '—'} |`);
  }
}
process.exitCode = report.some((r) => r.candidate) ? 3 : 0;
