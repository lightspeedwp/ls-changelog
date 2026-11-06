# Prompt: Validate Changelog Format

Validate a CHANGELOG.md file and report any format issues.

## Input

**File:** CHANGELOG.md  

You need to check if the changelog follows Keep a Changelog 1.1.0 format and LightSpeed WP standards.

## Expected Output

The helper check is basic, so report its result separately from your own manual findings.

**If the helper check passes** (root validator, run from this repository's root):
```
✓ Changelog validation passed
```

**If the helper check fails:**
```
✗ Validation failed

Errors:
  ✗ Invalid version format: [v1.0.0] (expected MAJOR.MINOR.PATCH or [Unreleased])
  ✗ Version [1.1.0] missing date (expected: YYYY-MM-DD)
  ✗ [Unreleased] must not have a date

Warnings:
  ⚠ Version [0.9.0] has no entries
```

A pass means only that the automated checks below succeeded. It does not show that entries are good, that the changelog is complete, or that it is ready to merge or release.

## Checks Performed

**Automated (root validator):**
- Required `# Changelog` title
- At least one release heading
- Valid semver versions (MAJOR.MINOR.PATCH) or [Unreleased]
- ISO 8601 dates (YYYY-MM-DD) on released versions
- [Unreleased] has no date
- A warning for a released version with no entries

The validator uses line patterns, not a full Markdown parser.

**Manual (best practices, not checked by the helpers):**
- All entries have PR/issue references (the [link verifier](../sub-skills/changelog-link-verifier/SKILL.md) can find entries missing them)
- No entry exceeds 100 characters (local guideline; the organisation's canonical rule cites 250 and which applies is an open policy question)
- Entries use third-person past tense
- Categories are in correct order
- Versions are in descending order
- No empty sections in released versions

## Key Points

- A failed automated check should be fixed before committing; the repository's `lefthook.yaml` hook blocks a commit when the root validator fails (hooks are not installed by default, and this repository has no CI workflow)
- Warnings don't fail the helper, but should be addressed
- Fix issues before releasing; a passing check is not release approval
- Validate this repository's own changelog with: `node scripts/validate-changelog.cjs CHANGELOG.md`
- Validate a target project's changelog with the sub-skill helper: `node "${CLAUDE_SKILL_DIR}/sub-skills/changelog-validator/scripts/validate-changelog.cjs" "/absolute/path/to/CHANGELOG.md" --json` (it only checks for a title and a version heading, and its score, governance fields and `readyForRelease` flag are placeholders)
