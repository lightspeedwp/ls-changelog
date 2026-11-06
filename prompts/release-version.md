# Prompt: Create a Release Version

Convert your `[Unreleased]` section to a versioned release with a date and semantic version bump. Here the new version is worked out from the current version and the release type. (To convert with a version you are given, see [create-release.md](create-release.md).)

## Scope

This prompt describes a manual edit of `CHANGELOG.md`. It does not commit, tag, push or publish anything; those are separate release actions that need explicit authorisation. Use the version and release date you are given, and do not invent either. The `(#1089)` style in the examples follows [Changelog Format](../docs/CHANGELOG_FORMAT.md); the [link verifier](../sub-skills/changelog-link-verifier/SKILL.md) is stricter and expects an adjacent PR link and issue link on each entry.

## Input

**Current version:** 1.0.0  
**Release type:** Minor (new feature)  
**Release date:** 2026-10-30  
**Current CHANGELOG.md:**

```markdown
# Changelog

## [Unreleased]

### Added
- Support for async/await in skill execution (#1089)
- New `concurrency` configuration option (#1089)

### Fixed
- Memory leak in startup (#1092)

## [1.0.0] - 2026-09-18

### Added
- Initial release
```

## Expected Output

The `[Unreleased]` section becomes `[1.1.0] - 2026-10-30`, and a new empty `[Unreleased]` is created:

```markdown
# Changelog

## [Unreleased]

## [1.1.0] - 2026-10-30

### Added
- Support for async/await in skill execution (#1089)
- New `concurrency` configuration option (#1089)

### Fixed
- Memory leak in startup (#1092)

---

## [1.0.0] - 2026-09-18

### Added
- Initial release
```

## Key Points

- Version bumps: 1.0.0 → 1.1.0 (minor), 1.0.0 → 2.0.0 (major), 1.0.0 → 1.0.1 (patch)
- Date format: YYYY-MM-DD
- Create new `[Unreleased]` for future entries
- Add horizontal rule (`---`) before previous versions for readability
- Keep versions in descending order
- The bump is a judgement from the actual changes; the branch mapper's version hint is advisory only

## Verify

From this repository's root, run the root validator on the result (it checks the title, version and date formats, and that `[Unreleased]` has no date):

```bash
node scripts/validate-changelog.cjs CHANGELOG.md
```

For a target project, use the sub-skill helper (it only checks for a title and a version heading):

```bash
node "${CLAUDE_SKILL_DIR}/sub-skills/changelog-validator/scripts/validate-changelog.cjs" "/absolute/path/to/CHANGELOG.md" --json
```

Entry quality, version order and the choice of bump remain manual checks.
