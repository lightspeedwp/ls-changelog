# LightSpeed WP Changelog

A Claude Code skill for creating and reviewing WordPress project changelogs, with bundled sub-skills for branch context and changelog validation. The root [SKILL.md](SKILL.md) is the entrypoint.

## Install and invoke

The repository is `lightspeedwp/ls-wp-changelog`; the skill itself is named `ls-changelog`. Clone it into your personal Claude Code skills directory under the skill name:

```bash
git clone https://github.com/lightspeedwp/ls-wp-changelog.git ~/.claude/skills/ls-changelog
```

If this checkout already exists there, use it in place. In Claude Code:

```text
/ls-changelog Add changelog entries for this project's changes
/ls-changelog Review CHANGELOG.md for release readiness
/ls-changelog Map feature/gallery-controls to a changelog category
```

The parent skill reads the relevant sub-skill instructions when needed. The nested sub-skills are supporting files in this installation; they do not require separate installations or symlinks. This uses Claude Code's [personal skill entrypoint and linked supporting files](https://code.claude.com/docs/en/skills) (checked 1 November 2026).

## Structure

```text
ls-changelog/
├── SKILL.md                         # Parent skill and workflow routing
├── sub-skills/
│   ├── branch-context-mapper/
│   │   ├── SKILL.md                 # Branch analysis instructions
│   │   ├── scripts/                 # Node.js helper
│   │   ├── references/              # Branching strategy
│   │   ├── prompts/                 # Task examples
│   │   ├── __tests__/               # Vitest tests
│   │   └── tests/                   # BATS tests
│   └── changelog-validator/
│       ├── SKILL.md                 # Validation instructions and limitations
│       ├── scripts/                 # Node.js helper
│       ├── references/              # Governance principles
│       ├── prompts/                 # Task examples
│       ├── __tests__/               # Vitest tests
│       └── tests/                   # BATS tests
├── docs/                            # Guidelines, onboarding, and roadmap
├── references/                      # Evaluation scenarios and reference index
├── scripts/                         # Shared-script documentation
├── assets/                          # Asset documentation
├── .specify/                        # Existing Spec Kit configuration
├── .claude/                         # Existing Claude project configuration
├── CLAUDE.md                        # Repository maintenance instructions
├── AGENTS.md                        # Skill catalogue
└── lefthook.yaml                    # Existing hook configuration
```

## Helpers and current limits

Runtime use requires Node.js 18+ and no npm dependencies. Run helpers with the target project's changelog path explicitly:

```bash
node ~/.claude/skills/ls-changelog/sub-skills/branch-context-mapper/scripts/branch-context-mapper.cjs feature/gallery-controls
node ~/.claude/skills/ls-changelog/sub-skills/changelog-validator/scripts/validate-changelog.cjs /absolute/path/to/project/CHANGELOG.md --json
```

- [Branch Context Mapper](sub-skills/branch-context-mapper/SKILL.md) maps a fixed list of simple branch types (the original seven plus the organisation types it supports) to categories and version hints. It does not detect breaking changes or fully validate Git branch names.
- [Changelog Validator](sub-skills/changelog-validator/SKILL.md) checks for a changelog title and version-heading pattern. Its score, governance fields, and release-readiness flag are placeholders; manual review is required.

The skill instructions distinguish helper results from manual checks. Documentation and roadmap targets do not establish implemented enforcement. Changelog preparation alone does not authorise commits, tags, merges, or publication.

## Development checks

There are three npm packages: the root package (`@lightspeedwp/changelog-skill`, which tests the root `scripts/validate-changelog.cjs`) and one package in each sub-skill. No lockfiles are tracked (`package-lock.json` is git-ignored), so use `npm install`, not `npm ci`. Run checks from each package directory:

```bash
npm install
npm test
npm --prefix sub-skills/branch-context-mapper install
npm --prefix sub-skills/changelog-validator install
npm --prefix sub-skills/branch-context-mapper test
npm --prefix sub-skills/changelog-validator test
```

Tests use Vitest 5.1.0 with the V8 coverage provider, configured once in the root `vitest.config.ts`. Install the root package first (`npm install` at the root); the sub-skill `npm test` scripts delegate their Vitest run to it. The sub-skill `npm test` runs ESLint, Prettier, Vitest and BATS in sequence; the root `npm test` runs Vitest for all three packages and BATS. Install BATS separately. Coverage is reported (text, json-summary, lcov in `coverage/`) and the root run enforces an 80% global threshold, to be raised toward 90% over time; the sub-skill runs execute only their own tests and skip the threshold. See [scripts/README.md](scripts/README.md) for the tooling notes. A failed earlier stage prevents later stages from running.

`lefthook.yaml` contains existing hook configuration; hooks are not installed by using the skill. Review that configuration before enabling it in a development checkout.

## Further reading

- [Changelog Guidelines](docs/CHANGELOG_GUIDELINES.md): entry formatting and release conventions.
- [Team Onboarding](docs/TEAM_ONBOARDING.md): existing team workflow documentation.
- [Organisation Standards](docs/ORG_STANDARDS.md): organisation policy context.
- [Phase 2 Roadmap](docs/PHASE_2_ROADMAP.md): planned capabilities.
- [GitHub Issues](https://github.com/lightspeedwp/ls-wp-changelog/issues): repository issues.

Use the root and sub-skill instructions for current paths and supported helper options. Older workflow documents may describe planned capabilities or previous installation paths.
