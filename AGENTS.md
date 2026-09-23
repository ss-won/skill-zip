# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Cursor, …) working in this repository.

## Layout

```
skills/{name}/            kebab-case; directory name == frontmatter `name`
  SKILL.md                required — YAML frontmatter (name, description) + instructions
  references/             optional — loaded on demand; link from SKILL.md with "when to read"
  scripts/                optional — executable helpers (prefer over inline code)
  agents/openai.yaml      optional — Codex UI metadata
evals/{name}/             evals.json + personas/ (never shipped inside the skill)
metrics/{name}/benchmarks.jsonl
registry.json             every skill must be listed here
```

## Rules for skills

- Must work in any agent. Don't hard-depend on one harness's tools; when a tool helps (e.g. `AskUserQuestion`), say "if available, use X; otherwise …".
- `description` ≤ 1024 chars, no angle brackets, includes trigger phrases in the languages the owner uses (Korean + English).
- SKILL.md < 500 lines; push detail to `references/`.
- Explain *why* instead of stacking MUST/NEVER.
- Never write to a user's home directory from a skill unless the user asked.

## Atomic skills

Skills here are small and do **one job** each; bigger flows come from several skills triggering in sequence (e.g. `option-finder` → "골라줘" → `decision-buddy`).

- **One job, one trigger.** If a description needs "and also…" to cover two different user situations, split it.
- **State the boundary in both descriptions.** Each description says when *not* to use it, pointing at the neighbour's situation, so the two don't compete ("Do not use when the person already names options…").
- **Standalone.** Skills can't call each other and may be installed alone. Never assume the neighbour exists; degrade gracefully (ask for what's missing, or do a minimal version).
- **Hand off in the user's words.** End with a short line that invites the phrase that triggers the next skill ("이 중에 고르기 어려우면 '골라줘'라고 해주세요").
- **Shared conventions are copied, not imported.** Keep them tiny (tone, plain language, mode names) so drift is easy to spot. Record pairings in `registry.json → pairsWith`.

## Workflow for a new skill or change

1. Draft / edit with Anthropic's `skill-creator`.
2. Add or update `evals/{name}/evals.json`; run with-skill vs baseline; review in the eval viewer.
3. `node scripts/record-benchmark.mjs … --model <id>`; bump `version` in `registry.json`.
4. `node scripts/validate.mjs` must pass.
5. Only merge when the owner rates real-world quality ≈ 80%+.

## Commits

Author as `ss-won`. Conventional-ish messages: `feat(decision-buddy): …`, `metrics: …`, `chore: …`.
