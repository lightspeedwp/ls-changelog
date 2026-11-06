# Scripts

Shared utility scripts and implementation code.

## Purpose

Utility functions and helpers used across both sub-skills:

- Common validation functions
- Shared formatting utilities
- Reusable error handling
- Standard output formatting

## Organization

Each script should:

- Have a clear, single responsibility
- Include error handling
- Document expected inputs/outputs
- Support both CLI and module usage

## Testing Scripts

Scripts are tested with:

- Vitest unit tests (`__tests__/`), run from the root: `npm install && npm run test:vitest`
- BATS shell integration tests (`tests/`)

Vitest 5.1.0 and `@vitest/coverage-v8` 5.1.0 are pinned to the identical version in the root `package.json`. One root `vitest.config.ts` discovers the root test file and both sub-skill packages, keeps the Jest-style globals the existing tests use, and runs once (no watch) under `npm run test:vitest`. The test environment needs Node.js 22.12+ (Vitest's minimum); Node.js 24 LTS is the target. The runtime helpers' Node.js 18+ claim is unchanged until each package context is verified.

## Coverage

Coverage uses the V8 provider and writes `text`, `json-summary` and `lcov` reports to `coverage/` (already git-ignored). The `lcov` reporter also writes `coverage/lcov-report/index.html`, which `docs/TEAM_ONBOARDING.md` refers to. Every intended production script (`scripts/**` and `sub-skills/**/scripts/**`, `.cjs`, `.mjs`, `.js` and `.ts`) is in the denominator whether or not a test runs it; only `__tests__` files are excluded.

Known gaps and open items (recorded, not decided):

- **Subprocess coverage:** the root `scripts/validate-changelog.cjs` is only exercised by spawning a child process, so V8 reports 0% for it. That is a measurement gap, not evidence the code is untested. The two nested helpers are loaded in-process and are instrumented.
- **Thresholds:** the agreed starting point is 80% (global lines, functions, branches and statements), to be raised toward 90% over time as the agent is used and tested (decision from Ash). It is not enforced yet. The previous Jest runs configured 90% in the root and both sub-skill packages, mirrored in `.claude/settings.json`, and never met it. Today's V8 totals are about 76% statements, 69% branches, 82% functions and 75% lines, almost entirely because the root validator's 92 statements read 0% (the subprocess gap above); the other four scripts are between 55% and 99%. Turning on 80% now would make `npm test` and the pre-commit hook fail. Follow-up: make the root validator importable, test it in-process, then set `coverage.thresholds` to 80 in `vitest.config.ts` and update the settings mirror.
- **Hooks:** `lefthook.yaml` runs the Vitest suite once per commit (`vitest-tests`) and fails the commit on any test failure. Hooks are not installed by this repository.

## Dependency updates

- **Dependabot:** no Dependabot configuration is tracked (no `.github/` directory). Read-only repository checks show vulnerability alerts enabled and Dependabot security updates disabled. Nothing was deleted or disabled here; disabling alerts or handing over is a separate administrative step.
- **Renovate:** `renovate.json` configures the npm manifests (root and both sub-skills) with human review and no automerge, a `area:dependencies` label, and one group for `vitest` and `@vitest/coverage-v8` so the identical pins move together. The Renovate GitHub App must be installed and enabled by a repository admin; this file does not activate it, and no Dependabot permissions or bypasses are carried over.

## Not changed

Existing JavaScript and CJS scripts, the three BATS suites and the Spec Kit shell scripts under `.specify/scripts/bash/` are kept as they are. New scripts are TypeScript.

## Adding New Scripts

1. Create in the scripts folder
2. Document inputs and outputs
3. Add unit tests
4. Add BATS integration tests where a CLI contract needs it
5. Check the coverage report for the new file

---

See sub-skill directories for implementation details.
