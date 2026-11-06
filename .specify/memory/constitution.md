# Changelog Automation Constitution

**Project:** LightSpeed WP Changelog Automation System  
**Version:** 1.0.0 | **Ratified:** 2026-10-31 | **Last Amended:** 2026-10-31

---

## Core Principles

### I. Org-Wide Standards Alignment
All changelog validation, branch mapping, and release practices must align with LightSpeed WP's canonical standards:
- **24 branch types** with consistent naming conventions (feature/, fix/, security/, docs/, etc.)
- **20 changelog validation rules** (R001-R020) with error/warning severity levels
- **6 changelog categories** (feature, fix, improvement, breaking-change, security, performance)
- **Forbidden prefixes** (claude, copilot, openai) — validation mandatory
- Keep a Changelog 1.1.0 format compliance
- Semantic Versioning 2.0.0 (MAJOR.MINOR.PATCH)

### II. Quality-First Governance
Every changelog entry must pass governance rules ensuring:
- **Immutability:** Released versions cannot be modified
- **Atomicity:** Each entry references exactly one PR/issue
- **Consistency:** All entries follow format and category rules
- **Completeness:** [Unreleased] section empty before release
- **Clarity:** User-focused descriptions with quality scoring (0-100 scale, 90+ required)
- **Traceability:** Every entry links to code change

### III. Test-First Validation
Tests are mandatory and form the quality gate:
- **Jest unit tests:** 90%+ coverage (lines, functions, branches, statements)
- **BATS shell tests:** 100% pass rate on integration tests
- **Real-world examples:** WordPress block themes and plugins only
- All tests pass before merge; coverage is non-negotiable

### IV. Developer Experience
The system must be:
- **User-friendly:** Clear error messages with remediation steps
- **WordPress-native:** Examples and guidance tailored to block themes/plugins
- **Actionable:** Every validation failure includes "how to fix" guidance
- **Automatable:** Integrated git hooks (Lefthook) validate before commit/push

### V. Phase-Based Implementation
Work proceeds in defined phases with clear handoffs:
- **Phase 1 (✅ Complete):** 6 governance rules, 7 branch types, Lefthook integration
- **Phase 2 (🔄 Planned):** All 24 branch types, all 20 rules, YAML field validation, PR template routing
- **Phase 3 (📋 Future):** GitHub Actions automation, team rollout, continuous improvement

---

## Technical Standards

### Branch Conventions
- Format: `{type}/{scope}-{description}` (kebab-case, lowercase only)
- Examples: `feature/oauth-auth`, `fix/checkout-validation`, `security/xss-vulnerability`
- Validation: Automated by branch-context-mapper sub-skill
- Routing: Branch type automatically routes to correct PR template

### Changelog Format
- **File:** CHANGELOG.md in repo root
- **Standard:** Keep a Changelog 1.1.0 (Semantic Versioning 2.0.0)
- **Structure:** [Unreleased], [X.Y.Z] - YYYY-MM-DD sections
- **Categories:** Added, Changed, Deprecated, Removed, Fixed, Security (Phase 1) → feature, fix, improvement, breaking-change, security, performance (Phase 2)
- **Fields (Phase 2):** category, title, description, PR/issue link, date

### Quality Scoring Factors
- **Length (0-10):** Description length and completeness
- **Clarity (0-15):** Action verbs, context, user benefit
- **Completeness (0-10):** PR/issue linking and references
- **Format (0-10):** Markdown and category compliance
- **Specificity (0-5):** Technical detail and precision
- **Total:** 0-100 scale (90+ = production ready)

### Validation Rules (Phase 2 Target: All 20)
**Critical (ERROR - Blocking):** R001-R008, R010, R015-R016, R020  
**Quality (WARNING - Non-blocking):** R005, R009, R011-R014, R017-R019

---

## Development Workflow

1. **Create branch** following LightSpeed conventions
   - Type: feature/, fix/, security/, docs/, etc.
   - Validation: branch-context-mapper validates on commit
2. **Develop & test** with TDD (tests first)
   - Run: `npm test` (Jest + BATS)
   - Required: 90%+ coverage
3. **Add changelog entry** in [Unreleased]
   - Category from branch type
   - Run: `changelog-validator` scores quality
   - Target: Quality score 90+
4. **Commit** with validated message
   - Lefthook validates format automatically
5. **Open PR** with routed template
   - PR template auto-selected by branch type
6. **Merge** only when:
   - All tests pass (90%+ coverage)
   - Changelog validates (quality score 90+)
   - CI checks green

---

## Governance & Enforcement

### Constitution Authority
This constitution supersedes all prior practices and is the source of truth for:
- Changelog validation rules and quality standards
- Branch naming conventions
- Release readiness criteria
- Quality scoring methodology

### Compliance Verification
- **Automated:** Git hooks (pre-commit, commit-msg, pre-push) verify compliance
- **Human Review:** PRs must demonstrate changelog quality and governance compliance
- **CI Integration:** GitHub Actions verify test coverage and changelog scoring
- **Release Gate:** Changelog validator blocks releases unless readiness confirmed

### Amendments Process
1. Proposal documented with impact assessment
2. Team review and alignment
3. CLAUDE.md updated with new guidance
4. Documentation and examples updated
5. Migration plan for existing entries if required
6. Version bump and ratification date recorded

---

## Related Standards

- **Org Canonical:** [LightSpeed WP Branching Strategy](https://github.com/lightspeedwp/.github/blob/develop/docs/BRANCHING_STRATEGY.md)
- **Governance Details:** [docs/ORG_STANDARDS.md](../../docs/ORG_STANDARDS.md)
- **Team Onboarding:** [docs/TEAM_ONBOARDING.md](../../docs/TEAM_ONBOARDING.md)
- **Phase 2 Roadmap:** [docs/PHASE_2_ROADMAP.md](../../docs/PHASE_2_ROADMAP.md)
- **Project Guidance:** [CLAUDE.md](../../CLAUDE.md)

---

**Status:** Phase 1 ✅ | Phase 2 🔄 | Phase 3 📋  
**Spec-Kit:** v1.2.5 with Claude integration  
**Last Reviewed:** 2026-10-31
