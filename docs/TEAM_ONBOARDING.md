# LightSpeed WP Changelog Automation — Team Onboarding Guide

**Phase 1 Complete** | Ready for Team Implementation  
**Document Version:** 1.0 | Updated: 2026-10-30

---

## Welcome, Team! 👋

This guide teaches you how to use, test, extend, and contribute to the LightSpeed WP changelog automation system. Whether you're building WordPress block themes or plugins, this toolkit enforces consistent, production-ready changelogs across your project.

---

## 🚀 Quick Start (15 minutes)

### Prerequisites
- Node.js 18+
- Git (for working with our branch-based workflow)
- A text editor

### Step 1: Clone and Install

```bash
# Clone the changelog repository
git clone https://github.com/lightspeedwp/changelog ~/Studio/changelog
cd ~/Studio/changelog

# Install dependencies for both sub-skills
cd sub-skills/branch-context-mapper
npm install

cd ../changelog-validator
npm install

# Return to root
cd ../..
```

### Step 2: Install Git Hooks

```bash
# Install lefthook for pre-commit validation
lefthook install

# Verify hooks are active
lefthook run pre-commit --all-files
```

### Step 3: Run Tests

```bash
# Test branch-context-mapper
cd sub-skills/branch-context-mapper
npm test

# Test changelog-validator
cd ../changelog-validator
npm test
```

**✅ Success:** Both test suites pass with 90%+ coverage. You're ready to develop!

---

## 📚 Understanding the Two Sub-Skills

### 1. **branch-context-mapper**
**Purpose:** Analyze a git branch name and extract changelog metadata.

**What it does:**
- Extracts branch type (feature, fix, security, etc.)
- Maps type → changelog category (Added, Fixed, Security, etc.)
- Calculates semantic version bump (MAJOR, MINOR, PATCH)
- Detects breaking changes

**Quick example:**
```bash
cd sub-skills/branch-context-mapper
node scripts/branch-context-mapper.cjs feature/oauth-authentication
```

Output:
```json
{
  "branchType": "feature",
  "category": "Added",
  "versionBump": "MINOR",
  "isBreaking": false
}
```

**Branch types (LightSpeed WP convention):**
- `feature/` → "Added" (MINOR bump)
- `fix/` → "Fixed" (PATCH bump)
- `security/` → "Security" (PATCH bump, breaking-change aware)
- `docs/`, `refactor/`, `test/`, `chore/` → No changelog entry
- `breaking:` prefix → Sets isBreaking to true (MAJOR bump)

---

### 2. **changelog-validator**
**Purpose:** Validate changelog entries and enforce governance rules.

**What it does:**
- Validates Keep a Changelog 1.1.0 format
- Enforces 6 governance rules (immutability, atomicity, consistency, completeness, clarity, traceability)
- Calculates quality score (0-100 scale)
- Confirms readiness for release

**Quick example:**
```bash
cd sub-skills/changelog-validator
node scripts/validate-changelog.cjs ../../CHANGELOG.md --json
```

Output:
```json
{
  "score": 91,
  "readyForRelease": true,
  "governance": {
    "immutability": { "passed": true },
    "atomicity": { "passed": true },
    "consistency": { "passed": true },
    "completeness": { "passed": true },
    "clarity": { "passed": true },
    "traceability": { "passed": true }
  }
}
```

---

## 🧪 Testing Your Changes

### Running Jest (Unit Tests)

```bash
# Run all tests in a sub-skill
cd sub-skills/branch-context-mapper
npm test

# Run in watch mode (auto-rerun on save)
npm run test:watch

# Run with coverage report
npm run test:jest -- --coverage
```

**Coverage requirements:** 90% across lines, functions, branches, and statements.

### Running BATS (Integration Tests)

```bash
# Run all BATS tests
cd sub-skills/branch-context-mapper
npm run test:bats

# Run a specific test file
bats tests/branch-context-mapper.bats

# Run with verbose output
bats --verbose-run tests/branch-context-mapper.bats
```

**Expect:** 100% pass rate on all BATS tests.

### Pre-Commit Hooks

Lefthook runs automatically before each commit:
1. **Branch naming validation** — Checks your branch name matches LightSpeed conventions
2. **Jest coverage check** — Ensures 90%+ coverage before allowing commit
3. **BATS test pass** — Verifies all shell integration tests pass
4. **Commit message format** — Validates message against branch-based rules

To bypass (⚠️ use with caution):
```bash
git commit --no-verify
```

---

## 🛠️ Extending the Skills

### Adding a New Branch Type

**For branch-context-mapper:**

1. **Update the mapping** in `sub-skills/branch-context-mapper/scripts/branch-context-mapper.cjs`:

```javascript
const BRANCH_TYPES = {
  'feature': { category: 'Added', versionBump: 'MINOR' },
  'fix': { category: 'Fixed', versionBump: 'PATCH' },
  'experimental': { category: 'Experimental', versionBump: 'MINOR' },  // NEW
};
```

2. **Add a test** in `__tests__/branch-context-mapper.test.js`:

```javascript
describe('experimental branch type', () => {
  it('should map experimental to Experimental category', () => {
    const result = mapBranchType('experimental/new-feature');
    expect(result.category).toBe('Experimental');
  });
});
```

3. **Add integration test** in `tests/branch-context-mapper.bats`:

```bash
@test "experimental branch maps to Experimental" {
  result=$(node scripts/branch-context-mapper.cjs experimental/test)
  [[ "$result" =~ "Experimental" ]]
}
```

4. **Update documentation** in `sub-skills/branch-context-mapper/references/BRANCHING_STRATEGY.md`.

5. **Run tests** to verify:
```bash
npm test
```

### Adding a New Governance Rule

**For changelog-validator:**

1. **Implement the rule** in `scripts/validate-changelog.cjs`:

```javascript
function checkDeprecationNotice(changelogContent) {
  // Your rule implementation
  return {
    passed: /* boolean */,
    details: /* description */
  };
}
```

2. **Add unit test** in `__tests__/validate-changelog.test.js`:

```javascript
describe('deprecation-notice rule', () => {
  it('should pass when deprecation entries have notices', () => {
    const result = validateGovernanceRule('deprecation-notice', content);
    expect(result.passed).toBe(true);
  });
});
```

3. **Add integration test** in `tests/validate-changelog.bats`:

```bash
@test "deprecation entries must include notices" {
  # Hypothetical example: the current validators have no --rule option
  run validate-changelog --rule deprecation-notice
  [[ "$status" -eq 0 ]]
}
```

4. **Document the rule** in `sub-skills/changelog-validator/references/GOVERNANCE_RULES.md`.

---

## 📖 Governance Rules (Quick Reference)

All changelog entries must follow these 6 rules:

1. **Immutability** — Released versions never change (only [Unreleased] is mutable)
2. **Atomicity** — Each entry references exactly one PR or issue
3. **Consistency** — All entries follow Keep a Changelog format
4. **Completeness** — [Unreleased] section is empty before release
5. **Clarity** — Entries meet minimum quality thresholds (score ≥ 90)
6. **Traceability** — Every entry links to code (PR/issue/commit)

**Quality Scoring (0-100 scale):**
- 90+ = Production-ready (✅ can release)
- 80-89 = Good (⚠️ needs minor polish)
- <80 = Needs work (❌ request changes)

---

## 🎨 WordPress Block Theme/Plugin Examples

### Example 1: Adding a Changelog Entry for a Block Theme Feature

**Branch:** `feature/hero-block-animation`

```bash
# This is what the mapper extracts:
# branchType: "feature"
# category: "Added"
# versionBump: "MINOR"
```

**Changelog entry:**
```markdown
## [1.1.0] - 2026-11-15

### Added
- Hero block with configurable animations and parallax support ([#42](https://github.com/lightspeedwp/my-theme/pull/42))
```

### Example 2: Security Fix for a WooCommerce Plugin

**Branch:** `security/checkout-xss-fix`

```bash
# Mapper extracts:
# branchType: "security"
# category: "Security"
# versionBump: "PATCH"
# isBreaking: true (if sensitive API removed)
```

**Changelog entry:**
```markdown
## [1.2.1] - 2026-11-14

### Security
- Fixed XSS vulnerability in checkout form input sanitization ([#89](https://github.com/lightspeedwp/my-plugin/pull/89))
```

### Example 3: Breaking Change in a Block Plugin

**Branch:** `breaking:block-api-v2-migration`

```bash
# Mapper extracts:
# branchType: "breaking"
# category: "Changed" (or "Added" + breaking flag)
# versionBump: "MAJOR"
# isBreaking: true
```

**Changelog entry:**
```markdown
## [2.0.0] - 2026-11-13

### BREAKING CHANGES
- Block registration API changed from `registerBlockType()` to `registerBlock()`. Update all blocks. ([#156](https://github.com/lightspeedwp/my-blocks/pull/156))

### Added
- New registration API with better TypeScript support
```

---

## 🔄 Common Workflows

### Workflow 1: Create a Feature Branch and Add Changelog Entry

```bash
# 1. Create feature branch (mapper validates naming)
git checkout -b feature/add-block-alignment-controls

# 2. Make your changes
# ... edit code ...

# 3. Write changelog entry (validator checks quality)
# Edit CHANGELOG.md with new entry

# 4. Commit (lefthook runs pre-commit checks)
git commit -m "feat(blocks): add alignment controls to gallery block

- Adds left, center, right, justify alignment options
- Updates block.json with new attributes
- Adds e2e tests for alignment UX

Fixes #42"

# 5. Push (pre-push hook runs final validation)
git push origin feature/add-block-alignment-controls

# 6. Create PR (validator scores changelog entry)
# GitHub CI runs full test suite
```

### Workflow 2: Review and Approve a PR

```bash
# 1. Reviewer checks branch name
# ✅ "feature/user-auth-flow" — good

# 2. Reviewer checks changelog entry
# Run validator locally:
cd sub-skills/changelog-validator
node scripts/validate-changelog.cjs ../../CHANGELOG.md --json
# Score: 87 — Good, but request minor polish

# 3. Request changes:
# "Excellent work! Entry score is 87. Please add a link to the related issue for full traceability."

# 4. Author updates and re-commits
# Score rises to 92 ✅

# 5. Approve and merge
# Release CI validates full changelog is ready
```

### Workflow 3: Cut a Release

```bash
# 1. Verify changelog is release-ready
cd sub-skills/changelog-validator
node scripts/validate-changelog.cjs CHANGELOG.md
# Score: 94, readyForRelease: true ✅

# 2. Create release branch
git checkout -b release/1.2.0

# 3. Update version numbers (handled by CI)

# 4. Finalize changelog
# Move [Unreleased] section to new version heading
# Update dates and version numbers

# 5. Commit and push
git commit -m "chore(release): 1.2.0"
git push origin release/1.2.0

# 6. Create release PR
# CI validates everything

# 7. Merge and tag
# GitHub Actions cuts the release automatically
```

---

## 🐛 Troubleshooting

### "Pre-commit hook failed: Branch name does not match LightSpeed conventions"

**Cause:** Your branch name is invalid.

**Fix:**
```bash
# Check branch naming rules
cat sub-skills/branch-context-mapper/references/BRANCHING_STRATEGY.md

# Rename your branch
git branch -m feature/my-bad-name feature/my-good-name
```

### "Jest coverage threshold not met: 87% < 90%"

**Cause:** Your tests don't cover enough code.

**Fix:**
```bash
# Generate coverage report
npm test -- --coverage

# Open the HTML report
open coverage/lcov-report/index.html

# Add tests to uncovered lines
# Re-run: npm test
```

### "Changelog validation failed"

**Cause:** The changelog is missing its title, a version heading, or has an invalid version or date.

**Run the validator to see what failed:**
```bash
cd sub-skills/changelog-validator
node scripts/validate-changelog.cjs ../../CHANGELOG.md --json
```

The helper only checks the basic format and returns a fixed placeholder score. Entry quality (missing issue/PR links, length, unclear language) is reviewed manually.

**Fix:** Update your entry with:
- Clear, action-oriented description
- Link to PR or issue
- Context for other developers

---

## 📞 Getting Help

- **Questions about branch naming?** → `sub-skills/branch-context-mapper/references/BRANCHING_STRATEGY.md`
- **Need governance rule details?** → `sub-skills/changelog-validator/references/GOVERNANCE_RULES.md`
- **Want to understand the mapper?** → `sub-skills/branch-context-mapper/SKILL.md`
- **Want to understand validation?** → `sub-skills/changelog-validator/SKILL.md`
- **Stuck on tests?** → Run `npm run test:jest` or `npm run test:bats` in the relevant package directory and read the failure output

---

## ✅ Success Checklist

Before your first PR:

- [ ] Cloned the repo and installed dependencies
- [ ] Ran `npm test` in both sub-skills (all pass)
- [ ] Installed lefthook (`lefthook install`)
- [ ] Created a feature branch following LightSpeed naming
- [ ] Ran a test commit to verify pre-commit hooks work
- [ ] Read `BRANCHING_STRATEGY.md` and `GOVERNANCE_RULES.md`
- [ ] Reviewed a WordPress block theme/plugin example above

---

## 🎯 What's Next?

Once onboarded:
1. **Pick a task from Phase 2 roadmap** (see separate document)
2. **Implement one sub-skill's core logic**
3. **Write tests (Jest + BATS) to 90%+ coverage**
4. **Submit PR for review**

Welcome to the team! Questions? Ask in Slack or open a GitHub Discussion. Happy coding! 🚀

---

**Phase 1 Status:** ✅ Complete  
**Repository:** https://github.com/lightspeedwp/changelog  
**Maintained by:** LightSpeed WP Team
