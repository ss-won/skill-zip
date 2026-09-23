# skill-zip

Personal, agent-agnostic skills — packaged in the open [Agent Skills](https://agentskills.io/) format so the same folder works in **Claude Code**, **Claude desktop / claude.ai**, and **Codex**. Every skill is benchmarked per model, its usage is tracked, and ones that stop earning their place get flagged for deprecation.

## Skills

| Skill | What it does | Status |
|---|---|---|
| [`decision-buddy`](skills/decision-buddy/SKILL.md) | 결정장애 도우미 — 쉬운 객관식 질문 몇 개로 고민을 좁히고, 간단한 비교표 후 하나를 딱 골라줘요. 모드: ⚡빠르게 / 🙂적당히 / 🔍꼼꼼히 — 말로 바꾸거나 "설정"으로 기본값 변경. 개발자가 아니어도 쓰기 쉽게. | active |

## Install

**Option A — `npx skills` (Vercel's open skills CLI):**

```bash
npx skills add ss-won/skill-zip -a claude-code -a codex -g
npx skills add ss-won/skill-zip -s decision-buddy -a claude-code -g   # just one skill
```

**Option B — clone + `skillzip` (symlinks, so `git pull` updates skills in place; on/off per machine):**

```bash
git clone https://github.com/ss-won/skill-zip ~/skill-zip && cd ~/skill-zip
node scripts/skillzip.mjs on decision-buddy            # → ~/.claude/skills + ~/.agents/skills
node scripts/skillzip.mjs on --all --agent codex
node scripts/skillzip.mjs off decision-buddy
node scripts/skillzip.mjs list
```

**Claude desktop / claude.ai:** `node scripts/skillzip.mjs pack decision-buddy` → upload `dist/decision-buddy.zip` from the app's Skills settings.

| Agent | User skill dir | Notes |
|---|---|---|
| Claude Code | `~/.claude/skills/<name>/` | also used by the desktop app's Code tab |
| Codex | `~/.agents/skills/<name>/` | `agents/openai.yaml` adds UI metadata; disable via `[[skills.config]] enabled=false` in `~/.codex/config.toml` |
| Claude desktop / claude.ai | uploaded zip | |

## Lifecycle: benchmark → track → deprecate

```
skills/<name>/          the skill (SKILL.md, references/, agents/openai.yaml)
evals/<name>/           eval prompts + simulated-user personas (not shipped with the skill)
metrics/<name>/benchmarks.jsonl   one row per benchmark run: date, model, harness, with-skill vs baseline pass rate, tokens
metrics/usage/<device>.json       per-device usage counts (skill names + dates only)
registry.json           version, status (active | candidate | deprecated), tracked models, thresholds
```

1. **Benchmark** whenever a model ships or a skill changes — run the evals with Anthropic's `skill-creator` (with-skill vs no-skill), then:
   ```bash
   node scripts/record-benchmark.mjs <workspace>/iteration-N/benchmark.json --skill decision-buddy --model <model-id> --harness claude-code
   ```
   Add the new model id to `registry.json → trackedModels`.
2. **Track usage** on each machine (scans local Claude Code / Codex transcripts; no hooks needed):
   ```bash
   node scripts/collect-usage.mjs --write && git add metrics/usage && git commit -m "usage: $(hostname)"
   ```
3. **Health check** — `node scripts/check-deprecation.mjs` (also runs monthly in CI and opens a *Skill health report* issue). A skill becomes a **candidate** when:
   - `caught-up` — newest benchmark delta < `minDelta` (the base model now does it without the skill)
   - `regression` — with-skill pass rate dropped > `regressionDrop` on the same model
   - `unused` — no usage on any device for `unusedDays`
   - `stale` only means "re-benchmark me".

   `--apply` writes `candidate` into the registry. Moving a candidate to `deprecated` is always a manual call.

## Roadmap

- [x] Phase 1 — cross-agent skills (Claude Code, Codex, desktop zip)
- [x] Phase 2 — per-model benchmarks, usage tracking, deprecation candidates
- [ ] Phase 3 — skill hub: device *profiles* (`skillzip pull work-mac` → exact set of skills on/off, like pulling an image), desktop-app first

## Adding a skill

See [AGENTS.md](AGENTS.md).

## License

MIT
