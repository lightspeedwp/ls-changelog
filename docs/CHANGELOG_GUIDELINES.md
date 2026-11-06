# Changelog Guidelines

This document provides detailed guidance for maintaining changelogs in LightSpeed WP projects.

## Quick Start

### For Adding Entries

1. Open your project's CHANGELOG.md
2. Find the `[Unreleased]` section
3. Add your entry under the appropriate category:
   - **Added** — New features
   - **Changed** — Existing feature updates
   - **Fixed** — Bug fixes
   - **Removed** — Removed features
   - **Security** — Security fixes

4. Format: `- Description of change (#PR-number)`
5. Save and commit with your PR

### For Creating a Release

1. Determine new version using semantic versioning (MAJOR.MINOR.PATCH)
2. Replace `[Unreleased]` with `[VERSION] - YYYY-MM-DD`
3. Create new `[Unreleased]` section
4. Validate: `node ~/.claude/skills/ls-changelog/sub-skills/changelog-validator/scripts/validate-changelog.cjs /absolute/path/to/project/CHANGELOG.md`
5. Commit and push

## Writing Good Changelog Entries

### ✅ Good Entries

```markdown
- Added async/await support for skill execution (#1089)
- Fixed memory leak in agent startup routine (#1092)
- Changed default timeout from 30s to 60s (#1091)
- Removed deprecated `sync()` method — use async instead (#1088)
- Security: Patched XSS vulnerability in template rendering (#1094)
```

### ❌ Bad Entries

```markdown
- Added stuff # ← No PR, too vague
- We fixed the memory leak # ← First person, no PR
- Fix bug 8f3a2c1 # ← Commit hash, not PR
- Added async support (but incomplete) # ← Draft in release version
- FIXED EVERYTHING # ← Wrong capitalization
```

### Rules for Writing Entries

1. **Start with verb**: Added, Fixed, Changed, Removed, Improved
2. **Use past tense**: "Added" not "Adding"
3. **Third person only**: "Fixed" not "We fixed"
4. **Be specific**: "Fixed memory leak" not "Fixed bug"
5. **Reference PR**: Always include `(#PR-number)` at end
6. **Keep it short**: Aim for 50-80 characters before PR reference
7. **Use em-dash for emphasis**: `— use this instead` not `- use this instead`

### Template

```markdown
- [Verb] [specific change] — [context if needed] (#PR-NUMBER)
```

## Semantic Versioning

### Version Bumps

| Bump      | Change          | Example       | When                             |
| --------- | --------------- | ------------- | -------------------------------- |
| **MAJOR** | Breaking change | 1.0.0 → 2.0.0 | Removed/changed API              |
| **MINOR** | New feature     | 1.0.0 → 1.1.0 | New feature, backward compatible |
| **PATCH** | Bug fix         | 1.0.0 → 1.0.1 | Bug fixes only                   |

### Examples

```
1.0.0 → 1.0.1: Fixed bug
1.0.0 → 1.1.0: Added new feature
1.0.0 → 2.0.0: Removed deprecated API (breaking)
0.1.0 → 0.2.0: New feature in pre-release
```

### When to Bump

- **MAJOR**: When changes break existing code
  - Removed methods/APIs
  - Changed method signatures
  - Changed data formats
  - Changed configuration schema

- **MINOR**: When adding backward-compatible features
  - New methods/APIs
  - New configuration options
  - New capabilities

- **PATCH**: When fixing bugs
  - Fixes regressions
  - Improves performance
  - Clarifies documentation
  - Updates dependencies (usually)

## Release Process

### Step 1: Prepare

```bash
# Make sure your branch is up to date
git fetch origin
git merge origin/main

# Verify changelog is valid
node ~/.claude/skills/ls-changelog/sub-skills/changelog-validator/scripts/validate-changelog.cjs /absolute/path/to/project/CHANGELOG.md
```

### Step 2: Update Changelog

Edit CHANGELOG.md:

```markdown
# Before (in development)

## [Unreleased]

### Added

- New feature (#123)

---

## [1.0.0] - 2026-09-15

# After (ready to release)

## [Unreleased]

---

## [1.1.0] - 2026-10-30

### Added

- New feature (#123)

---

## [1.0.0] - 2026-09-15
```

### Step 3: Update Version Numbers

Update version in:

- `package.json` (if Node project)
- `style.css` (if WordPress theme)
- Header comments in main files
- Any version config files

### Step 4: Validate & Commit

```bash
# Validate changelog
node ~/.claude/skills/ls-changelog/sub-skills/changelog-validator/scripts/validate-changelog.cjs /absolute/path/to/project/CHANGELOG.md

# Commit
git add CHANGELOG.md package.json (and other version files)
git commit -m "Release v1.1.0

- Added async/await support
- Fixed memory leak issue"
```

Committing, tagging and pushing are separate release actions. Preparing the changelog does not authorise them: run them only when the maintainer has explicitly authorised each one. Add attribution lines (such as `Co-Authored-By`) only for people or tools that actually contributed to the change.

```bash
# Only when tagging and pushing have been explicitly authorised
git tag v1.1.0
git push origin main --tags
```

## Category Guide

### Added

Use for new features, capabilities, or APIs:

```markdown
### Added

- Support for async/await in skill execution (#1089)
- New `concurrency` configuration option (#1089)
- API endpoint for retrieving agent status (#1090)
```

### Changed

Use for behavior changes, improvements, or refactoring:

```markdown
### Changed

- Improved error messages for better clarity (#1091)
- Refactored agent initialization for performance (#1092)
- Changed default timeout from 30 to 60 seconds (#1093)
```

### Fixed

Use for bug fixes and corrections:

```markdown
### Fixed

- Memory leak in agent startup (#1092)
- Timeout not respected in nested calls (#1093)
- Incorrect error handling in retry logic (#1094)
```

### Removed

Use for removed features or deprecated items:

```markdown
### Removed

- Deprecated `sync()` method — use async mode instead (#1088)
- Old configuration format — migrate to default.json (#1087)
- Internet Explorer support (not tested) (#1095)
```

### Security

Use for security fixes and vulnerabilities:

```markdown
### Security

- Patched XSS vulnerability in template rendering (#1094)
- Fixed injection attack in parameter handling (#1096)
- Upgraded vulnerable dependencies (#1097)
```

## Breaking Changes

For changes that break backward compatibility, include migration guidance:

```markdown
### Changed

- Breaking: Removed `agent.sync()` method. Use `await agent.execute()` instead. (#1088)

### Removed

- Breaking: Changed configuration schema. See docs/MIGRATION.md for upgrade path. (#1095)
```

## Changelog Format

### File Structure

```markdown
# Changelog

All notable changes to this [project name] are documented in this file.

## [Unreleased]

### Added

...

## [1.1.0] - 2026-10-30

### Added

...

### Fixed

...

---

## [1.0.0] - 2026-09-18

### Added

- Initial release
```

### Headers

- Main title: `# Changelog`
- Version headers: `## [VERSION] - DATE`
- Category headers: `### Category`
- Entries: `- Description (#PR)`

### Spacing

- One blank line between version sections
- One blank line between category headers and entries
- No blank lines between entries
- Optional: Horizontal rule (`---`) before older versions

## Common Issues

### Issue: Entry Too Long

**Problem:** Entry exceeds 100 characters (local guideline; the organisation's canonical rule cites 250, and which applies is an open policy question)

**Solution:** Shorten the description

```markdown
# Too long (118 chars)

- Support for async/await in skill execution with concurrent processing capabilities (#1089)

# Good (73 chars)

- Support for async/await and concurrent processing (#1089)
```

### Issue: Missing PR Reference

**Problem:** Entry has no PR/issue number

**Solution:** Add PR number at end

```markdown
# Bad

- Fixed memory leak

# Good

- Fixed memory leak (#1234)
```

### Issue: Wrong Tense or Person

**Problem:** Entry uses wrong tense or first person

**Solution:** Use third-person past tense

```markdown
# Bad

- We added async support
- Adding new features
- I fixed the bug

# Good

- Added async support
```

### Issue: Version Order Wrong

**Problem:** Versions are in wrong order

**Solution:** Put newest versions first

```markdown
# Bad

## [1.0.0] - 2026-09-18

## [1.1.0] - 2026-10-30 ← Should be before 1.0.0

# Good

## [1.1.0] - 2026-10-30

## [1.0.0] - 2026-09-18
```

## Tools & Automation

### Validation Script

```bash
node ~/.claude/skills/ls-changelog/sub-skills/changelog-validator/scripts/validate-changelog.cjs /absolute/path/to/project/CHANGELOG.md
```

The current helper checks for `# Changelog` and a version-heading pattern only. Its score and governance fields are placeholders. Review Markdown structure, semantic versions, dates, categories, entry quality, and traceability manually using the [validator sub-skill](../sub-skills/changelog-validator/SKILL.md).

### CI/CD Integration

Inspect the target repository's workflows and branch protection before claiming CI validation or merge blocking. Installing this skill does not install hooks, configure CI, or enforce release gates.

## Resources

- [Keep a Changelog 1.1.0](https://keepachangelog.com/)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [Changelog Format](#changelog-format)
- [Validator Instructions](../sub-skills/changelog-validator/SKILL.md)

## Questions?

If you have questions about changelog guidelines:

1. Check the [FAQ](#faq) section below
2. Review [Changelog Format](#changelog-format)
3. Run validation and check error messages
4. Ask on Slack or create an issue

## FAQ

**Q: Can I update a released version's changelog?**  
A: No, released versions are immutable. Create a new patch release if changes are needed.

**Q: Should I include the [Unreleased] section in commits?**  
A: Yes, keep [Unreleased] in the repo so future entries can be added during development.

**Q: Can I skip the PR number?**  
A: No, all entries must reference a PR/issue for traceability.

**Q: How do I document urgent hotfixes?**  
A: Add to [Unreleased], then release immediately as a PATCH version.

**Q: What if my change affects multiple categories?**  
A: Add entries to each category, or if tightly related, pick the primary one and note others in the description.
