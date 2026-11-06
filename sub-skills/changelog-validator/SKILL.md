---
name: changelog-validator
description: Review CHANGELOG.md structure, LightSpeed WP governance, traceability, and release readiness. Use when checking changelog entries, reviewing release notes, or assessing whether a changelog is ready for release.
---

# Changelog Validator

Use this sub-skill through [ls-changelog](../../SKILL.md) to combine a basic script check with an evidence-based changelog review.

## Run the helper

Resolve `scripts/validate-changelog.cjs` relative to this file's directory. Pass the target changelog explicitly, preferably as an absolute path. From the root skill, use:

```bash
node "${CLAUDE_SKILL_DIR}/sub-skills/changelog-validator/scripts/validate-changelog.cjs" "/absolute/path/to/target/CHANGELOG.md" --json
```

The CLI accepts a file path and optional `--json`. Without `--json`, it prints a text summary. It exits 0 when the basic checks pass and 1 for an invalid or unreadable file. JSON fields are `isValid`, `score`, `errors`, `governance`, and `readyForRelease`.

### Implementation limits

The helper only checks that the file contains `# Changelog` and a version-heading pattern such as `## [Unreleased]` or `## [1.2.3]`. This is not a Markdown parser or full Keep a Changelog validator.

It returns a fixed score of 85 on success and 0 on failure. Governance fields are placeholders; for readable files they are all marked `pass` without checking entries or history. `readyForRelease` repeats the basic result. These values do not establish governance compliance, quality, or release readiness.

`--rule`, `--release-version`, `--score-only`, `--validate-only`, and rule exclusions are not implemented. Do not use them or claim their checks ran.

## Review beyond the helper

Read [Governance Rules](references/GOVERNANCE_RULES.md) for the six review principles and [Changelog Guidelines](../../docs/CHANGELOG_GUIDELINES.md) for entry formatting. Those documents describe desired policy, not implemented script checks. Review the requested scope against the target project's own instructions:

- **Structure and consistency:** Check real headings, newest-first versions, semantic versions, valid `YYYY-MM-DD` dates, standard categories, spacing, and entry style.
- **Immutability:** Compare released sections with an appropriate existing Git baseline. If history or a baseline is unavailable, report this check as unverified.
- **Atomicity and clarity:** Each entry should describe one coherent change with specific user impact. Follow the target project's length and PR-reference rules.
- **Traceability:** Verify PR or issue references against supplied evidence or available repository data. Do not fabricate links or treat plausible URLs as verified.
- **Completeness:** Compare entries with the relevant diff or release scope. An ordinary development changelog may contain unreleased entries. For an authorised release, check that the intended entries moved into the version section and `[Unreleased]` is retained empty.

Report script results, manual findings, and unverified checks separately. Do not invent a numerical quality score or treat the helper's fixed score as a release gate. A successful check does not authorise merging, tagging, or publishing.

## Development checks

From this sub-skill's directory, `npm install` installs development dependencies (no lockfile is tracked, so `npm ci` does not work). Run `npm test` for lint, Vitest tests, and BATS tests; the Vitest run is delegated to the root package, so run `npm install` at the repository root first, and BATS must be installed separately. Report failures and measured results rather than assumed pass counts.
