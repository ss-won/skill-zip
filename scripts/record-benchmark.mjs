#!/usr/bin/env node
// Append one line to metrics/<skill>/benchmarks.jsonl from a skill-creator benchmark.json.
//
//   node scripts/record-benchmark.mjs <path/to/benchmark.json> --skill decision-buddy \
//        --model claude-opus-5-5 [--harness claude-code|codex|cowork-subagent] [--note "..."]
//
// Run this every time you re-benchmark (new model release, skill edit). check-deprecation.mjs reads the history.
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { METRICS_DIR, readRegistry, today } from './lib/skills.mjs';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    skill: { type: 'string' },
    model: { type: 'string' },
    harness: { type: 'string', default: 'claude-code' },
    note: { type: 'string', default: '' },
  },
});
const [file] = positionals;
if (!file || !values.skill || !values.model) {
  console.error('usage: record-benchmark.mjs <benchmark.json> --skill <name> --model <model-id> [--harness h] [--note n]');
  process.exit(2);
}

const b = JSON.parse(readFileSync(file, 'utf8'));
const rs = b.run_summary ?? {};
const pick = (cfg, k) => rs[cfg]?.[k]?.mean ?? null;
const withSkill = pick('with_skill', 'pass_rate');
const baseline = pick('without_skill', 'pass_rate') ?? pick('old_skill', 'pass_rate');
if (withSkill == null || baseline == null) {
  console.error('benchmark.json has no run_summary.with_skill / without_skill pass_rate');
  process.exit(1);
}

const registry = readRegistry();
const row = {
  date: today(),
  skill: values.skill,
  version: registry.skills[values.skill]?.version ?? 'unknown',
  model: values.model,
  harness: values.harness,
  evals: new Set((b.runs ?? []).map((r) => r.eval_id)).size || null,
  withSkill: +withSkill.toFixed(3),
  baseline: +baseline.toFixed(3),
  delta: +(withSkill - baseline).toFixed(3),
  tokensWith: Math.round(pick('with_skill', 'tokens') ?? 0),
  tokensBaseline: Math.round(pick('without_skill', 'tokens') ?? pick('old_skill', 'tokens') ?? 0),
  baselineKind: rs.without_skill ? 'no-skill' : 'previous-version',
  note: values.note,
};
mkdirSync(join(METRICS_DIR, values.skill), { recursive: true });
appendFileSync(join(METRICS_DIR, values.skill, 'benchmarks.jsonl'), JSON.stringify(row) + '\n');
console.log('recorded', row);
