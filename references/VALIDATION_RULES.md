# Changelog Validation Rules

This document details all validation rules applied to CHANGELOG.md files.

## Automated Validation (Required)

These rules are checked automatically and must pass:

### 1. Parse Validation
- **Rule**: File must be valid Markdown
- **Check**: `parseChangelog()` returns valid JSON with `releases` array
- **Failure**: "Changelog does not parse or has no releases array"
- **Fix**: Check heading structure, unclosed code blocks, syntax errors

### 2. Releases Presence
- **Rule**: Changelog must contain at least one release
- **Check**: `releases.length > 0`
- **Failure**: "Changelog must have at least one release"
- **Fix**: Add at least `## [0.1.0] - 2026-01-01`

### 3. Version Format Validation
- **Rule**: Every version must be semver or `[Unreleased]`
- **Pattern**: `/^(Unreleased|\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?)$/`
- **Valid**: `[1.0.0]`, `[0.1.0]`, `[1.0.0-alpha]`, `[Unreleased]`
- **Invalid**: `[v1.0.0]`, `[1.0]`, `[Latest]`, `1.0.0` (without brackets)
- **Failure**: "Invalid version format: [VERSION]"
- **Fix**: Ensure semver format with brackets

### 4. Date Format Validation
- **Rule**: All released versions (not `Unreleased`) must have ISO 8601 dates
- **Pattern**: `/^\d{4}-\d{2}-\d{2}$/`
- **Valid**: `2026-10-30`, `2026-01-01`
- **Invalid**: `10/30/2026`, `2026-1-1`, `Oct 30, 2026`, missing date
- **Failure**: "Version [VERSION] missing date or has invalid format"
- **Fix**: Add `- YYYY-MM-DD` after version

### 5. Unreleased Must Not Have Date
- **Rule**: `[Unreleased]` must never have a date
- **Valid**: `## [Unreleased]`
- **Invalid**: `## [Unreleased] - 2026-10-30`
- **Failure**: "`[Unreleased]` must not have a date"
- **Fix**: Remove date from `[Unreleased]` line

## Manual Validation (Recommended)

These rules are not yet automated but should be checked:

### 6. Version Order
- **Rule**: Versions must be in descending order (newest first)
- **Pattern**: v1 date > v2 date > v3 date (for released versions)
- **Valid**:
  ```
  [Unreleased]
  [1.1.0] - 2026-10-30
  [1.0.0] - 2026-09-15
  ```
- **Invalid**:
  ```
  [1.0.0] - 2026-09-15
  [1.1.0] - 2026-10-30
  ```
- **Fix**: Reorder entries so `[Unreleased]` is first, then release dates descend

### 7. Entry Presence
- **Rule**: Each version should have at least one entry
- **Sections**: Added, Changed, Fixed, Removed, Security
- **Warning**: Empty versions or missing all sections
- **Example**:
  ```markdown
  ## [1.0.0] - 2026-09-15

  ### Added
  - Initial release
  ```
- **Fix**: Add at least one entry or remove empty version

### 8. No Draft Sections
- **Rule**: Released versions should not have incomplete entries
- **Flags**: Look for entries like "(WIP)", "[TODO]", "draft", "incomplete"
- **Valid**:
  ```markdown
  ### Fixed
  - Memory leak in startup (#1234)
  ```
- **Invalid**:
  ```markdown
  ### Fixed
  - [TODO] Memory leak fix
  - (WIP) Performance improvement
  ```
- **Fix**: Complete or remove draft entries before release

### 9. Entry Format Consistency
- **Rule**: All entries follow consistent format
- **Format**: `- Description (#1234)` or `- Breaking: Description and migration (#1234)`
- **Checks**:
  - Starts with hyphen: `-`
  - Ends with PR/issue: `(#1234)` or `(#1234-1235)` for multiple
  - No trailing punctuation after PR number
  - Uses third-person past tense (Fixed, Added, Changed)
  - Uses em-dash (`—`) not hyphen for emphasis

### 10. PR/Issue References
- **Rule**: Every entry should reference a PR or issue
- **Pattern**: `(#\d+)` at end of entry
- **Valid**: `- Added feature (#123)`, `- Fixed bug (#456-457)`
- **Invalid**: `- Added feature`, `- Fixed bug 8f3a2c1`
- **Fix**: Add `(#PR-NUMBER)` to each entry

### 11. Entry Length
- **Rule**: Each entry should not exceed 100 characters (including PR ref). Local guideline only: the organisation's canonical rule cites 250 characters, and which applies is an open policy question. The helpers do not enforce it
- **Count**: Character count from dash to closing paren
- **Valid** (73 chars): `- Added support for async handlers — improves performance (#567)`
- **Invalid** (118 chars): `- Added support for async handlers with new concurrency tuning options that allow better performance (#567)`
- **Fix**: Shorten description or move details to PR

### 12. Capitalization
- **Rule**: Section names use title case, entries start capitalized
- **Valid**:
  ```markdown
  ### Added
  - Added feature description (#1234)
  ```
- **Invalid**:
  ```markdown
  ### added
  - added feature description (#1234)
  ```
- **Fix**: Capitalize properly

### 13. Tense Consistency
- **Rule**: All entries use past tense third-person
- **Valid**: "Added", "Fixed", "Changed", "Removed", "Improved"
- **Invalid**: "We added", "I fixed", "Adding feature", "Fix memory leak"
- **Fix**: Rephrase in past tense

### 14. Em-Dash vs Hyphen
- **Rule**: Use em-dash (`—`, Unicode U+2014) for emphasis, not hyphen (`-`)
- **Valid**: `- Deprecated oldAPI — use newAPI instead (#1234)`
- **Invalid**: `- Deprecated oldAPI - use newAPI instead (#1234)`
- **Fix**: Replace hyphen with em-dash in descriptions

## CI/CD Validation

### PR Submission Check
The organisation's CI may run a stricter validator. It lives in `lightspeedwp/.github` (not in this repository) and its behaviour is not verified here:

```bash
node .github/validation/changelog/bin/validate.js --trigger pr_submission
```

The rules below are the intended targets for that validator, not checks implemented by this repository's helpers:
- Maximum entry length: 100 chars (see the entry-length note in rule 11)
- Required PR/issue references
- Tense and capitalization
- No abbreviations without explanation
- No changes to released versions

### Pre-release Check
Before releasing, run the repository's root validator:

```bash
node scripts/validate-changelog.cjs CHANGELOG.md
```

It checks only the `# Changelog` title, that at least one release exists, version and date formats, and that `[Unreleased]` has no date. Every other rule in this document is a manual review item.

## Validation Error Examples

### Error 1: Invalid Version Format
```
Error: Invalid version format: [1.0]
Expected: [MAJOR.MINOR.PATCH] or [Unreleased]
Fix: Change [1.0] to [1.0.0]
```

### Error 2: Missing Date
```
Error: Version [1.1.0] missing date
Expected: [1.1.0] - YYYY-MM-DD
Fix: Add - 2026-10-30 after version
```

### Error 3: Unreleased With Date
```
Error: [Unreleased] must not have a date
Expected: ## [Unreleased]
Fix: Remove date, change "## [Unreleased] - 2026-10-30" to "## [Unreleased]"
```

The error examples 4 and 5 below are illustrative: the current helpers do not emit them.

### Error 4: Entry Too Long
```
Error: Entry exceeds 100 characters (118 chars)
Entry: Added support for async/await in skill execution with concurrent processing options (#1089)
Fix: Shorten to: "Added async/await and concurrency options (#1089)"
```

### Error 5: Missing PR Reference
```
Error: Entry missing PR/issue reference
Entry: - Fixed memory leak in startup
Fix: Add PR number: "- Fixed memory leak in startup (#1234)"
```

## Validation Output

The examples below are illustrative. The root validator prints `✓ Changelog validation passed` or a list of errors; it does not print per-rule lines.

### Valid Changelog
```
✓ Changelog parses correctly
✓ Contains 3 releases
✓ All versions are valid (semver or Unreleased)
✓ All released versions have dates
✓ No [Unreleased] entries have dates
✓ Validation passed
```

### Invalid Changelog
```
✗ Validation failed
✗ Version [1.0] is invalid format (expected MAJOR.MINOR.PATCH)
✗ Version [1.1.0] is missing date
✗ Version [Unreleased] has a date (should not)
```

## Running Validation

### Locally
```bash
node scripts/validate-changelog.cjs CHANGELOG.md
node scripts/validate-changelog.cjs CHANGELOG.md --json
```
(`--verbose` is accepted by the root validator but adds no extra output.)

### In CI (pre-merge)
```bash
node .github/validation/changelog/bin/validate.js CHANGELOG.md --trigger pr_submission
```

### Automatic fixes
Not implemented: neither validator supports `--fix`. Correct reported issues by editing the changelog.
