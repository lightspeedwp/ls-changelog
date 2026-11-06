---
name: branch-context-mapper
description: Analyse LightSpeed WP branch names to suggest changelog categories and semantic version changes. Use for branch-to-changelog mapping, branch naming checks, or a version recommendation based on branch context.
---

# Branch Context Mapper

Use this sub-skill through [ls-changelog](../../SKILL.md) when branch context informs a changelog entry or version recommendation.

## Run the helper

Resolve `scripts/branch-context-mapper.cjs` relative to this file's directory, not the target project's working directory. From the root skill, use:

```bash
node "${CLAUDE_SKILL_DIR}/sub-skills/branch-context-mapper/scripts/branch-context-mapper.cjs" 'feature/oauth-auth'
```

The CLI accepts one branch-name argument and prints JSON. Exit code 0 means the helper accepted the branch type and slash structure; exit code 1 means it rejected them. Output fields are `branchType`, `isValid`, `validationErrors`, `description`, `category`, `versionBump`, and `isBreaking`.

| Type        | Helper category | Helper version bump |
| ----------- | --------------- | ------------------- |
| `feature/`  | Added           | MINOR               |
| `fix/`      | Fixed           | PATCH               |
| `security/` | Security        | PATCH               |
| `docs/`     | null            | null                |
| `refactor/` | Changed         | null                |
| `test/`     | null            | null                |
| `chore/`    | null            | PATCH               |
| `feat/`     | Added           | MINOR               |
| `hotfix/`   | Fixed           | PATCH               |
| `perf/`     | Changed         | PATCH               |
| `design/`   | Changed         | null                |
| `a11y/`     | Changed         | PATCH               |
| `deps/`     | null            | PATCH               |
| `ci/`       | null            | null                |
| `build/`    | null            | null                |
| `task/`     | null            | null                |
| `release/`  | null            | null                |

The first seven rows are the original mapper contract; `feature/` remains accepted alongside the organisation's `feat/`. The remaining rows align with the organisation branch types in [Branching Strategy](references/BRANCHING_STRATEGY.md). Branch types outside this table, including `revert/`, `ops/` and `epic/`, are rejected.

For naming context, read [Branching Strategy](references/BRANCHING_STRATEGY.md). The helper requires exactly one slash and a recognised lowercase type. Uppercase types and extra slashes are rejected. An empty description such as `fix/` is still accepted. It does not enforce lowercase descriptions, description length, non-empty descriptions, or valid Git ref syntax. It does not support scoped types, `breaking:` prefixes, `--validate-only`, or `--commit-message`.

## Interpret the result

Use a branch supplied by the user or read the actual branch with `git branch --show-current` in the target repository. Do not rename or create a branch to satisfy the helper.

Inspect the diff, commit messages, and PR description for actual impact. The helper always returns `isBreaking: false` for accepted branches and does not detect breaking changes. A documented incompatible change warrants a MAJOR recommendation even when the helper suggests MINOR or PATCH. A branch name alone cannot prove compatibility or release scope.

Report helper output separately from any additional naming checks or version judgement. A null category or version bump is a hint to inspect impact, not permission to omit a required entry under the target project's rules.

## Development checks

From this sub-skill's directory, `npm ci` installs development dependencies. Run `npm test` for lint, Jest coverage checks, and BATS tests; BATS must be installed separately. Inspect command results before claiming coverage or pass counts.
