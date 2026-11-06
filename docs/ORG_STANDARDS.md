# LightSpeed WP Org-Wide Standards Alignment

**Document:** Org-wide standards reference and changelog project alignment  
**Last Updated:** 2026-10-31  
**Status:** Phase 1 (6 governance rules) | Phase 2 (20 rules + 24 branch types planned)

---

## Overview

This document explains how the changelog automation project aligns with (and will align with) LightSpeed WP's org-wide standards defined in the [.github repository](https://github.com/lightspeedwp/.github/blob/develop/docs/BRANCHING_STRATEGY.md).

---

## 1. Branch Types (24 Total)

### Org-Wide Canonical List

LightSpeed WP defines 24 approved branch types:

**Core Types (All Repos)**
- `feat/` — New feature or enhancement
- `task/` — Scoped unit of work
- `fix/` — Bug fix
- `hotfix/` — Urgent production fix
- `release/` — Release branches
- `refactor/` — Code restructuring
- `chore/` — Maintenance or dependency updates
- `docs/` or `doc/` — Documentation
- `test/` — Testing only
- `perf/` — Performance improvements
- `ci/` — CI/CD or workflow changes
- `build/` — Build process changes
- `deps/` — Dependency updates
- `security/` — Security-related fixes
- `revert/` — Revert previous changes
- `research/` — Research spikes
- `design/`, `ds/`, `a11y/`, `ux/` — Design/UX changes
- `ops/` — Operations or deployment
- `audit/` — Governance audits and compliance reviews
- `codex/` — Code generation or AI-assisted work
- `automation/` — Automation scripts and tooling
- `telemetry/` — Analytics/metrics
- `epic/` — Epic completion
- `i18n/` — Internationalization
- `config/` — Configuration changes
- `migrate/` — Framework or data migration
- `qa/`, `uat/` — Testing variants
- `aiops/` — AI-assisted operations
- `content/` — Content updates
- `seo/` — Search visibility enhancements
- `schema/` — Data/API schema changes
- `api/` — API surface changes

### Forbidden Prefixes
- `claude`
- `copilot`
- `openai`

### Naming Convention

**Format:** `{type}/{scope}-{short-title}`

**Rules:**
- Lowercase, kebab-case only
- 2-4 words in scope/title
- No underscores, periods, or special characters
- Use hyphens to separate words
- Example: `feat/user-registration-flow`

### Phase 1 Coverage

✅ The branch-context mapper currently maps: `feature`, `feat`, `fix`, `hotfix`, `security`, `docs`, `refactor`, `test`, `chore`, `perf`, `design`, `a11y`, `deps`, `ci`, `build`, `task`, `release`

⚠️ Phase 2 will cover the remaining organisation branch types (for example `revert`, `ops`, `epic`), which the mapper does not map yet

---

## 2. Changelog Categories (6 Total)

### Org-Wide Canonical Categories

- `feature` — New capability or enhancement
- `fix` — Bug fix
- `improvement` — Enhancement to existing feature
- `breaking-change` — Breaking API or behavior change
- `security` — Security vulnerability fix
- `performance` — Performance improvement

### Phase 1 Status

Phase 1 uses Keep a Changelog format with these categories:
- Added
- Changed
- Deprecated
- Removed
- Fixed
- Security

⚠️ **Alignment Gap:** Our categories differ from org's 6-category model

🔄 **Phase 2 Plan:** Migrate to org's 6-category model with YAML field structure

---

## 3. Changelog Validation Rules (20 Total)

### Critical Rules (ERROR - Blocking)

| Rule | Name | Description |
|------|------|-------------|
| R001 | no_implementation_details | No code patterns, API names, or framework references |
| R002 | has_category | Entry must specify category field |
| R003 | has_title | Entry must have descriptive title field |
| R004 | has_description | Entry must have user-facing description |
| R006 | proper_formatting | Valid YAML/Markdown syntax |
| R007 | no_backticks | No code blocks or inline code |
| R008 | no_internal_terminology | No internal acronyms or project terms |
| R010 | valid_pr_reference | PR/issue numbers must be valid and accessible |
| R015 | proper_dates | Dates must be ISO 8601 (YYYY-MM-DD) |
| R016 | no_todos | No TODO/FIXME comments |
| R020 | valid_category | Category must be in allowed list |

### Quality Rules (WARNING - Non-blocking)

| Rule | Name | Description |
|------|------|-------------|
| R005 | clear_language | No jargon, use active voice |
| R009 | has_pr_reference | Should reference a PR or issue |
| R011 | meaningful_description | Description ≥20 characters |
| R012 | user_focused | Describe user benefit, not implementation |
| R013 | no_emoji | No emoji in changelog entries |
| R014 | consistent_tense | Use consistent tense throughout |
| R017 | appropriate_length | Description 1-3 sentences |
| R018 | no_personal_pronouns | Avoid first/second person pronouns |
| R019 | no_marketing_hype | No superlatives or marketing language |

### Phase 1 Status

✅ Phase 1 documents 6 core governance principles as manual review guidance (the helpers do not enforce them):
- Immutability
- Atomicity
- Consistency
- Completeness
- Clarity
- Traceability

⚠️ **Alignment Gap:** We document 6 principles, org defines 20 rules

🔄 **Phase 2 Plan:** Implement all 20 validation rules (R001-R020)

---

## 4. PR Template Routing

### Org-Wide Mapping

Each branch type automatically routes to a specific PR template:

| Branch Type | PR Template |
|------------|-------------|
| `feat` | pr_feature.md |
| `fix` | pr_bug.md |
| `hotfix` | pr_hotfix.md |
| `release` | pr_release.md |
| `refactor` | pr_refactor.md |
| `chore` | pr_chore.md |
| `docs` | pr_docs.md |
| `test` | pr_test.md |
| `ci` | pr_ci.md |
| `security` | pr_security.md |
| `design` | pr_design.md |
| `a11y` | pr_a11y.md |
| `deps` | pr_dep_update.md |
| `audit` | pr_audit.md |
| `codex`, `aiops`, `automation` | pr_aiops.md |
| `epic` | pr_epic.md |

### Phase 1 Status

⚠️ **Not yet integrated:** Phase 1 does not route to org PR templates

🔄 **Phase 2 Plan:** Implement PR template routing logic

---

## 5. Branch Protection Rules

### Org-Wide Requirements

Applied to `main` branch (and optional `develop`):

- ✅ Require pull request before merging
- ✅ Require 1+ approval (2 for critical repos)
- ✅ Require review from Code Owners
- ✅ Dismiss stale approvals on new commits
- ✅ Require conversation resolution
- ✅ Require status checks pass (lint, tests, build)
- ✅ Require branches up to date before merge
- ✅ Require linear history (squash-merge only)
- ✅ Disable merge commits and rebase merges
- ✅ Optionally require signed commits

### Phase 1 Status

These should be configured in GitHub repository settings.

⚠️ **Verify:** Check GitHub branch protection rules are enabled

---

## 6. Alignment Summary

### What's Already Aligned ✅

- Branch type concept (feat, fix, security, docs, etc.)
- Semantic versioning (MAJOR, MINOR, PATCH)
- Keep a Changelog 1.1.0 format
- PR/issue traceability requirement
- User-focused descriptions

### What Needs Enhancement ⚠️

| Area | Phase 1 | Org Standard | Phase 2 Plan |
|------|---------|--------------|-------------|
| Branch Types | 7 types | 24+ types | Expand to all 24 |
| Changelog Categories | 5 (KAC format) | 6 specific | Migrate to 6-category model |
| Validation Rules | 6 rules | 20 rules (R001-R020) | Implement all 20 |
| PR Template Routing | Not implemented | 16 templates | Add routing logic |
| Field Structure | Markdown format | YAML with fields | Add category/title/description fields |
| Forbidden Prefixes | Not checked | claude, copilot, openai | Add prefix validation |

---

## 7. Implementation Roadmap

### Phase 1 (✅ Complete)
- 6 core governance principles documented (manual review guidance)
- Basic branch type mapping (7 types at the time; extended to the supported organisation types in LS-4774)
- Keep a Changelog 1.1.0 format
- Quality scoring placeholder (the helper returns a fixed score; real quality review is manual)
- Lefthook git hooks integration
- Team onboarding materials
- Spec-Kit integration

### Phase 2 (🔄 Planned)
- Expand to all 24 org-wide branch types
- Implement all 20 validation rules (R001-R020)
- Migrate to 6-category changelog model
- Add YAML field validation (category, title, description)
- Implement PR template routing
- Add forbidden prefix checking
- GitHub API integration for PR/issue validation

### Phase 3 (📋 Future)
- Full automation with GitHub Actions
- Custom metrics and reporting
- Team-wide adoption and rollout
- Continuous improvement based on feedback

---

## 8. Configuration Files

### Canonical Sources

All canonical configurations are defined in the org's `.github` repository:

- **Branching Strategy:** [docs/BRANCHING_STRATEGY.md](https://github.com/lightspeedwp/.github/blob/develop/docs/BRANCHING_STRATEGY.md)
- **Branch Types:** [.github/branch-types.yml](https://github.com/lightspeedwp/.github/blob/develop/.github/branch-types.yml)
- **Changelog Rules:** [.github/changelog-rules.yml](https://github.com/lightspeedwp/.github/blob/develop/.github/changelog-rules.yml)
- **Branch Labels:** [.github/branch-labels.yml](https://github.com/lightspeedwp/.github/blob/develop/.github/branch-labels.yml)
- **Labels:** [.github/labels.yml](https://github.com/lightspeedwp/.github/blob/develop/.github/labels.yml)
- **PR Templates:** [.github/PULL_REQUEST_TEMPLATE/](https://github.com/lightspeedwp/.github/tree/develop/.github/PULL_REQUEST_TEMPLATE)

---

## 9. Next Steps

1. **Verify Repository Settings**
   - [ ] Branch protection rules enabled on `main`
   - [ ] Squash merge only configured
   - [ ] Status checks required

2. **Phase 2 Planning**
   - [ ] Expand branch-context-mapper to support all 24 types
   - [ ] Implement all 20 changelog validation rules
   - [ ] Add YAML field validation
   - [ ] Integrate PR template routing

3. **Team Enablement**
   - [ ] Communicate org standards alignment
   - [ ] Update CI/CD pipeline validation
   - [ ] Document in team onboarding

---

**Repository:** https://github.com/lightspeedwp/changelog  
**Org Standards:** https://github.com/lightspeedwp/.github  
**Status:** Phase 1 ✅ | Phase 2 🔄 | Phase 3 📋
