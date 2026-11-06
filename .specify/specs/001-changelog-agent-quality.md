# Spec: Changelog Agent Quality (001)

**Status:** Active  
**Version:** 1.0.0  
**Created:** 2026-10-30  
**Updated:** 2026-10-30  

## Overview

This specification defines quality standards for the Changelog Generator skill and related agents. It ensures changelogs created or maintained with these tools meet LightSpeed WP organizational standards and Keep a Changelog 1.1.0 compliance.

## Objectives

1. **Correctness**: Changelogs must follow Keep a Changelog 1.1.0 exactly
2. **Compliance**: Changelog entries must follow LightSpeed WP formatting standards
3. **Usability**: The skill must be easy to invoke and produce correct output
4. **Reliability**: All outputs must pass automated validation
5. **Documentation**: Users must have clear guidance on proper usage

## Quality Criteria

### Criterion 1: Format Compliance

**Definition**: All generated changelogs must be valid Keep a Changelog 1.1.0 format

**Requirements**:
- Must parse as valid Markdown
- Must contain a releases array
- Must have at least one release
- All versions must be semver or `[Unreleased]`
- All released versions must have ISO 8601 dates

**How to Verify**:
```bash
node scripts/validate-changelog.cjs CHANGELOG.md
# Must exit with code 0 (success)
```

**Test Cases**:
- `format-simple-changelog`: Create basic CHANGELOG.md
- `format-multi-version`: Create changelog with multiple versions
- `format-unreleased-section`: Create with [Unreleased] section

---

### Criterion 2: Entry Formatting

**Definition**: All changelog entries must follow LightSpeed WP formatting standards

**Requirements**:
- Each entry starts with hyphen: `- `
- Each entry includes PR/issue reference: `(#1234)`
- Each entry uses third-person past tense: "Added", "Fixed"
- Each entry uses em-dash (`—`) for emphasis, not hyphen (`-`)
- Each entry is ≤ 100 characters (including PR reference; local rule, the organisation's canonical rule cites 250 and which applies is an open policy question)
- No first-person language: "We", "I", "You"
- No abbreviations without explanation

**How to Verify**:
```bash
# The helpers have no --strict option; entry rules below are checked manually.
# Check all entries match pattern: `- [Description] (#\d+)`
```

**Test Cases**:
- `entries-correct-tense`: Entries use "Added", "Fixed", "Changed"
- `entries-with-pr-refs`: All entries have PR numbers
- `entries-em-dash-not-hyphen`: Em-dashes used correctly
- `entries-max-length`: No entry exceeds 100 chars

---

### Criterion 3: Semantic Versioning

**Definition**: Version bumps must follow Semantic Versioning 2.0.0 rules

**Requirements**:
- Format: `MAJOR.MINOR.PATCH`
- MAJOR: Incremented for breaking changes
- MINOR: Incremented for new backward-compatible features
- PATCH: Incremented for bug fixes only
- No version jumps without justification

**How to Verify**:
By inspection and changelog review:
- Check if breaking changes → MAJOR bump
- Check if new features → MINOR bump
- Check if only fixes → PATCH bump

**Test Cases**:
- `semver-major-breaking`: Breaking change → MAJOR bump
- `semver-minor-feature`: New feature → MINOR bump
- `semver-patch-bugfix`: Bug fix → PATCH bump

---

### Criterion 4: Category Management

**Definition**: Changelogs must use standard categories in the correct order

**Requirements**:
- Categories used in order: Added, Changed, Fixed, Removed, Security
- Only include categories with entries (no empty sections)
- Each category has appropriate entries
- Categories are properly formatted as headers: `### Category`

**How to Verify**:
By inspection:
- Verify only valid categories are used
- Verify categories are in correct order
- Verify no empty sections exist

**Test Cases**:
- `categories-standard-set`: Uses Added, Changed, Fixed, Removed
- `categories-correct-order`: Categories in right order
- `categories-no-empty`: No empty category sections
- `categories-correct-formatting`: Headers use ### Category format

---

### Criterion 5: Release Workflow

**Definition**: The skill must properly handle development and release workflows

**Requirements**:
- `[Unreleased]` section maintained during development
- Proper conversion of `[Unreleased]` to versioned release
- New `[Unreleased]` created after release
- Version dates in ISO 8601 format: YYYY-MM-DD
- Versions in descending order (newest first)

**How to Verify**:
By workflow testing:
- Add entries to [Unreleased]
- Convert to release version
- Verify new [Unreleased] created
- Verify dates are correct
- Verify order is correct

**Test Cases**:
- `workflow-add-entries`: Add entries to [Unreleased]
- `workflow-create-release`: Convert [Unreleased] to version
- `workflow-new-unreleased`: New [Unreleased] created after release
- `workflow-version-ordering`: Versions in descending order

---

### Criterion 6: Validation Integration

**Definition**: All outputs must pass automated validation

**Requirements**:
- Must pass format validation
- Must pass entry validation
- Must pass CI/CD checks
- Validation errors must be clear and actionable

**How to Verify**:
```bash
node scripts/validate-changelog.cjs CHANGELOG.md
# Exit code 0 = success
# Exit code 1 = validation failed
```

**Test Cases**:
- `validation-passes`: Valid changelog passes
- `validation-fails-invalid-version`: Invalid version detected
- `validation-fails-missing-date`: Missing date detected
- `validation-clear-errors`: Error messages are clear

---

### Criterion 7: Documentation Clarity

**Definition**: Users must have clear guidance for using the skill

**Requirements**:
- Skill description includes trigger words and use cases
- References provided for standards (Keep a Changelog, semver)
- Examples show both good and bad formatting
- Common errors and fixes documented
- Workflow instructions clear and actionable

**How to Verify**:
By reading SKILL.md and reference materials:
- Check all trigger words present
- Verify examples are clear
- Verify error scenarios documented
- Verify workflow is explained

**Test Cases**:
- `docs-skill-description`: SKILL.md is clear and complete
- `docs-examples-good-bad`: Examples show right and wrong
- `docs-error-scenarios`: Common errors explained
- `docs-workflow`: Workflow instructions clear

---

## Acceptance Criteria

### Must Have (Required)

- ✅ All generated changelogs pass format validation
- ✅ All entries follow formatting standards
- ✅ Semantic versioning rules are enforced
- ✅ Categories are used correctly
- ✅ Release workflow functions properly
- ✅ Validation integration works
- ✅ Documentation is clear

### Should Have (Important)

- ✅ Skill triggers on all relevant user requests
- ✅ Error messages are actionable
- ✅ Performance is reasonable (< 5s for typical operations)
- ✅ References are accurate and up-to-date

### Nice to Have (Optional)

- 🔲 Auto-fix common formatting issues
- 🔲 Integration with git hooks
- 🔲 Generation from commit messages
- 🔲 Multiple language support

## Test Coverage

### Unit Tests

| Test Case | Category | Status | Notes |
|-----------|----------|--------|-------|
| format-simple-changelog | Format Compliance | ⏳ | Basic CHANGELOG creation |
| format-multi-version | Format Compliance | ⏳ | Multiple versions |
| entries-correct-tense | Entry Formatting | ⏳ | Past tense usage |
| entries-em-dash | Entry Formatting | ⏳ | Em-dash vs hyphen |
| semver-major-breaking | Semver | ⏳ | Breaking change |
| categories-standard-set | Categories | ⏳ | Standard categories |
| workflow-add-entries | Release Workflow | ⏳ | Add to Unreleased |
| workflow-create-release | Release Workflow | ⏳ | Create release |
| validation-passes | Validation | ⏳ | Valid output |
| docs-skill-description | Documentation | ⏳ | SKILL.md clarity |

### Integration Tests

| Test Case | Scenario | Status | Notes |
|-----------|----------|--------|-------|
| end-to-end-create-release | Create new changelog → Add entries → Release version | ⏳ | Full workflow |
| branch-to-changelog | Branch name → Changelog entry | ⏳ | Branch validation integration |
| pr-to-changelog | PR description → Changelog entries | ⏳ | PR parsing |
| validation-in-ci | Changelog validates in CI | ⏳ | CI integration |

## Success Metrics

### Quantitative

- **Format compliance**: 100% of generated changelogs pass validation
- **Test coverage**: ≥ 90% of code paths covered
- **Performance**: Operations complete in < 5 seconds
- **Error rate**: < 1% of invocations result in validation errors

### Qualitative

- Users report the skill is easy to use
- Users find entries well-formatted
- No recurring complaints about format issues
- Changelog quality improves after skill adoption

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-10-30 | Initial spec | Claude Haiku 4.5 |

## Dependencies

- Keep a Changelog 1.1.0 (https://keepachangelog.com/en/1.1.0/)
- Semantic Versioning 2.0.0 (https://semver.org/)
- Changelog Skill (`~/.claude/skills/ls-changelog/`)
- Validation Script (`~/.claude/skills/ls-changelog/sub-skills/changelog-validator/scripts/validate-changelog.cjs`)

## Related Specs

- [LightSpeed WP Branching Strategy](../../sub-skills/branch-context-mapper/references/BRANCHING_STRATEGY.md) (local reference; the organisation source is `docs/BRANCHING_STRATEGY.md` in `lightspeedwp/.github`)
- PR Guidelines: no local document exists; destination unresolved
- Release Process: no local document exists; destination unresolved

## Sign-Off

- **Spec Owner:** LightSpeed WP Development Team
- **Status:** Ready for Implementation
- **Next Review:** 2026-12-30
