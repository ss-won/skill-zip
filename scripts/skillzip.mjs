#!/usr/bin/env node
// skillzip — tiny local manager: install skills from this repo into agents and toggle them on/off.
// (Phase-1 preview of the "skill hub" idea: pull a profile of skills onto a machine, swap them per device.)
//
//   node scripts/skillzip.mjs list
//   node scripts/skillzip.mjs on  <skill...|--all> [--agent claude-code,codex] [--copy]
//   node scripts/skillzip.mjs off <skill...|--all> [--agent claude-code,codex]
//   node scripts/skillzip.mjs pack <skill...|--all>          # dist/<skill>.zip for Claude desktop / claude.ai upload
//
// "on" symlinks skills/<name> into each agent's user skill dir (so `git pull` updates them in place);
// --copy copies instead. "off" removes only links/copies that skillzip created (tracked in ~/.skill-zip/state.json).
import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, cpSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { ROOT, SKILLS_DIR, listSkills, readRegistry } from './lib/skills.mjs';

const AGENTS = {
  'claude-code': join(homedir(), '.claude', 'skills'), // also picked up by Claude desktop (Code tab)
  codex: join(homedir(), '.agents', 'skills'), // Codex user scope (developers.openai.com/codex/skills)
};
const STATE = join(homedir(), '.skill-zip', 'state.json');
const loadState = () => (existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : { installed: {} });
const saveState = (s) => { mkdirSync(join(homedir(), '.skill-zip'), { recursive: true }); writeFileSync(STATE, JSON.stringify(s, null, 2)); };

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { agent: { type: 'string', default: 'claude-code,codex' }, all: { type: 'boolean' }, copy: { type: 'boolean' } },
});
const [cmd, ...rest] = positionals;
const registry = readRegistry();
const all = listSkills().map((s) => s.dir);
const targets = values.all ? all.filter((n) => registry.skills[n]?.status !== 'deprecated') : rest;
const agents = values.agent.split(',').map((a) => a.trim());
for (const a of agents) if (!AGENTS[a]) { console.error(`unknown agent "${a}" (known: ${Object.keys(AGENTS)})`); process.exit(2); }
for (const t of targets) if (!all.includes(t)) { console.error(`unknown skill "${t}"`); process.exit(2); }

const state = loadState();
const key = (agent, name) => `${agent}:${name}`;

function on(name, agent) {
  const dest = join(AGENTS[agent], name);
  mkdirSync(AGENTS[agent], { recursive: true });
  if (existsSync(dest) || isLink(dest)) {
    if (!state.installed[key(agent, name)]) return console.log(`skip  ${agent}:${name} (exists, not managed by skillzip)`);
    rmSync(dest, { recursive: true, force: true });
  }
  if (values.copy) cpSync(join(SKILLS_DIR, name), dest, { recursive: true });
  else symlinkSync(join(SKILLS_DIR, name), dest, 'dir');
  state.installed[key(agent, name)] = { dest, mode: values.copy ? 'copy' : 'link', at: new Date().toISOString() };
  console.log(`on    ${agent}:${name} → ${dest}`);
}
function off(name, agent) {
  const rec = state.installed[key(agent, name)];
  if (!rec) return console.log(`skip  ${agent}:${name} (not installed by skillzip)`);
  rmSync(rec.dest, { recursive: true, force: true });
  delete state.installed[key(agent, name)];
  console.log(`off   ${agent}:${name}`);
}
function isLink(p) { try { return lstatSync(p).isSymbolicLink(); } catch { return false; } }

switch (cmd) {
  case 'list': {
    console.log('skill'.padEnd(24), 'status'.padEnd(11), agents.map((a) => a.padEnd(12)).join(''));
    for (const n of all) {
      const cols = agents.map((a) => (state.installed[key(a, n)] ? 'on' : isLink(join(AGENTS[a], n)) || existsSync(join(AGENTS[a], n)) ? 'external' : '-').padEnd(12));
      console.log(n.padEnd(24), (registry.skills[n]?.status ?? '?').padEnd(11), cols.join(''));
    }
    break;
  }
  case 'on':
    for (const n of targets) {
      if (registry.skills[n]?.status === 'deprecated') { console.log(`skip  ${n} (deprecated)`); continue; }
      agents.forEach((a) => on(n, a));
    }
    saveState(state);
    break;
  case 'off':
    for (const n of targets) agents.forEach((a) => off(n, a));
    saveState(state);
    break;
  case 'pack': {
    mkdirSync(join(ROOT, 'dist'), { recursive: true });
    for (const n of targets) {
      const out = join(ROOT, 'dist', `${n}.zip`);
      rmSync(out, { force: true });
      execFileSync('zip', ['-qr', out, n, '-x', '*.DS_Store'], { cwd: SKILLS_DIR });
      console.log(`packed dist/${n}.zip`);
    }
    break;
  }
  default:
    console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 11).join('\n').replace(/^\/\/ ?/gm, ''));
}
