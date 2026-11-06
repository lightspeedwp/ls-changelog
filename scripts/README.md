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

Thresholds: the global `statements`, `branches`, `functions` and `lines` thresholds are 80% (set in `vitest.config.ts`). That is the agreed starting point, to be raised toward 90% over time as the agent is used and tested; the earlier Jest runs configured 90% and never met it, and Jest and V8 percentages are not equivalent, so 80% is a fresh baseline, not a carried-over number. The threshold applies to the whole root run (`npm run test:vitest`, `npm test` and the pre-commit hook). Sub-skill `npm test` runs execute only their own package's tests through `npm run test:unit`, so they skip the global threshold (a partial run cannot meet it).

Known limits:

- **Subprocess coverage:** the CLI tests (`scripts/__tests__/validate-changelog.test.js` and the BATS suites) spawn child processes, which V8 does not instrument. The root validator's real code is measured through `scripts/__tests__/validate-changelog.in-process.test.js`, which loads `ChangelogValidator` directly (the script exports it and only runs its CLI when executed).
  The "fewer than 80% pass" pre-commit request is read as this coverage threshold, not a test pass rate.

Hooks: `lefthook.yaml` runs the Vitest suite once per commit (`vitest-tests`) and fails the commit on a failing test or a missed coverage threshold. Hooks are not installed by this repository.

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
