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

## Workflow for a new skill or change

1. Draft / edit with Anthropic's `skill-creator`.
2. Add or update `evals/{name}/evals.json`; run with-skill vs baseline; review in the eval viewer.
3. `node scripts/record-benchmark.mjs … --model <id>`; bump `version` in `registry.json`.
4. `node scripts/validate.mjs` must pass.
5. Only merge when the owner rates real-world quality ≈ 80%+.

## Commits

Author as `ss-won`. Conventional-ish messages: `feat(decision-buddy): …`, `metrics: …`, `chore: …`.
