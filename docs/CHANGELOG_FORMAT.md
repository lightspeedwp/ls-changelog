# LightSpeedWP Changelog Format Reference

This document defines the exact format requirements for all CHANGELOG.md files in LightSpeedWP projects.

## Standard: Keep a Changelog 1.1.0

All changelogs must follow [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).

## Structure

```markdown
# Changelog

All notable changes to this project are documented in this file.

## [MAJOR.MINOR.PATCH] - YYYY-MM-DD

### Added
- Feature description (#PR-number)

### Changed
- Behavior change description (#PR-number)

### Fixed
- Bug fix description (#PR-number)

### Removed
- Deprecated feature description (#PR-number)

### Security
- Security fix description (#PR-number)

---

## [1.0.0] - YYYY-MM-DD

### Added
- Initial release
```

## Version Numbering

Use Semantic Versioning 2.0.0:

- **MAJOR**: Increment for breaking changes
- **MINOR**: Increment for new backward-compatible features
- **PATCH**: Increment for backward-compatible bug fixes

Examples:
- `0.1.0` → `0.1.1` (patch: bug fix)
- `0.1.0` → `0.2.0` (minor: new feature)
- `1.0.0` → `2.0.0` (major: breaking change)

## Date Format

Use ISO 8601: `YYYY-MM-DD`

Examples:
- `2026-10-30`
- `2026-01-15`

## Section Order

Use these sections in this exact order. Omit empty sections:

1. **Added** — New features, new public APIs, new functionality
2. **Changed** — Changes in existing functionality, behavior updates
3. **Deprecated** — Features marked for removal (use when relevant)
4. **Removed** — Removed features or APIs
5. **Fixed** — Bug fixes
6. **Security** — Security vulnerability fixes and security enhancements

## Entry Format

Each entry:
- Starts with a bullet (`-`)
- Uses third-person past tense: "Fixed" not "We fixed", "Added" not "I added"
- References PR/issue: `(#1234)` at the end
- Max 100 characters including PR reference (local guideline; the helpers do not enforce it. The organisation's canonical rule cites 250 characters; which applies is an open policy question and no enforcement change is made here)
- Uses em-dash (`—`) for emphasis, not hyphen (`-`)

### Good Examples

```markdown
### Added
- Support for async/await in skill execution (#1089)
- New `concurrency` option for performance tuning (#1089)

### Changed
- Improved error messages for better debugging (#1090)

### Fixed
- Memory leak when processing large inputs (#1092)

### Removed
- Deprecated `sync` mode — use async mode only (#1088)

### Security
- Patched injection vulnerability in parameters (#1094)
```

### Bad Examples

```markdown
# ❌ First person
- We added support for async/await

# ❌ Missing PR reference
- Fixed memory leak

# ❌ Too long (118 chars)
- Support for async/await in skill execution with new concurrency tuning options (#1089)

# ❌ Hyphen instead of em-dash
- Deprecated sync mode - use async mode only (#1088)

# ❌ Commit hash instead of PR
- Fixed bug 8f3a2c1

# ❌ Lowercase start
- added support for new features
```

## Breaking Changes

For breaking changes, include "Breaking:" prefix with migration guidance:

```markdown
### Changed
- Breaking: Removed `agent.sync()` method. Use `await agent.execute()` instead. (#1088)
```

## Unreleased Section

During development, maintain an `[Unreleased]` section at the top:

```markdown
# Changelog

## [Unreleased]

### Added
- Draft feature under development (#2001)

### Fixed
- Partial fix for memory issue (incomplete)

---

## [1.0.0] - 2026-09-18
...
```

When releasing:
1. Replace `[Unreleased]` with `[VERSION] - DATE`
2. Create a new `[Unreleased]` section at top
3. Never include incomplete items in releases

## Section Separator

Use horizontal rules between major sections for readability (optional but recommended):

```markdown
---

## [0.9.0] - 2026-09-15
```

## Validation

Your changelog must pass:

✅ **Parse correctly** — Valid Markdown with releases array
✅ **Have versions** — At least one release defined
✅ **Version format** — All versions are semver or `[Unreleased]`
✅ **Release dates** — All released versions have ISO 8601 dates

⚠️ **Best practices** (not auto-checked):
- Versions in descending order
- Each version has at least one entry
- All entries reference PR/issue numbers
- No entries exceed 100 characters (local guideline; see the entry-length note above)
- Consistent em-dash usage
- Third-person past tense
- No draft/incomplete entries in releases

## Complete Example

```markdown
# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added
- Support for custom error handlers (#2010)

### Fixed
- Race condition in concurrent processing (#2011)

---

## [2.0.0] - 2026-10-15

### Added
- Support for parallel skill execution (#1089)
- New `concurrency` configuration option (#1089)

### Changed
- Refactored agent initialization for better error handling (#1090)
- Improved logging output format (#1091)

### Fixed
- Memory leak when processing large inputs (#1092)
- Timeout not respected in nested calls (#1093)

### Removed
- Deprecated `sync` mode — use async mode only (#1088)
- Old configuration format — migrate to `default.json` (#1087)

### Security
- Patched injection vulnerability in skill parameters (#1094)

---

## [1.1.0] - 2026-09-28

### Added
- Configuration file support (#1000)
- Error recovery for transient failures (#1001)

### Fixed
- Missing type exports (#1002)

---

## [1.0.0] - 2026-09-18

### Added
- Initial agent release
- Core skill execution engine
- Support for async/await workflows
```

## Tools & Validation

Run validation with:

```bash
node scripts/validate-changelog.cjs CHANGELOG.md
```

This checks:
- Valid Markdown structure
- Proper version format
- Date validity
- Presence of required sections
