# Prompt: Create a Release Version

Convert the [Unreleased] section to a versioned release with date and semantic version bump. Here the new version is supplied with the request.

## Scope

This prompt describes a manual edit of `CHANGELOG.md`. It does not commit, tag, push or publish anything; those are separate release actions that need explicit authorisation. Use the version and release date you are given, and do not invent either. The `(#1089)` style in the examples follows [Changelog Format](../docs/CHANGELOG_FORMAT.md); the [link verifier](../sub-skills/changelog-link-verifier/SKILL.md) is stricter and expects an adjacent PR link and issue link on each entry.

## Input

**Previous version:** 1.0.0  
**Release type:** Minor (new features)  
**New version:** 1.1.0  
**Release date:** 2026-10-30  

**Current CHANGELOG.md:**
```markdown
# Changelog

## [Unreleased]

### Added
- Async/await support (#1089)
- Custom middleware (#1090)

### Fixed
- Memory leak issue (#1091)

## [1.0.0] - 2026-09-18

### Added
- Initial release
```

## Expected Output

Convert [Unreleased] to versioned release:

```markdown
# Changelog

## [Unreleased]

---

## [1.1.0] - 2026-10-30

### Added
- Async/await support (#1089)
- Custom middleware (#1090)

### Fixed
- Memory leak issue (#1091)

---

## [1.0.0] - 2026-09-18

### Added
- Initial release
```

## Key Points

- Replace [Unreleased] with [VERSION] - DATE
- Create new [Unreleased] section at top
- Add horizontal rules for readability
- Keep versions in descending order (newest first)
- Bump version correctly per semver:
  - MAJOR (1.0.0 → 2.0.0) for breaking changes
  - MINOR (1.0.0 → 1.1.0) for new features
  - PATCH (1.0.0 → 1.0.1) for bug fixes only
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
