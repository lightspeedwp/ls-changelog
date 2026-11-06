# Claude Project Instructions

This repository (`lightspeedwp/ls-wp-changelog`) is the `ls-changelog` Claude Code skill, installed at `~/.claude/skills/ls-changelog/` for personal use. The runtime skill name stays `ls-changelog`.

## Entrypoints and resources

- [SKILL.md](SKILL.md): runtime entrypoint for `/ls-changelog`; routes to the bundled sub-skills.
- [Branch Context Mapper](sub-skills/branch-context-mapper/SKILL.md): branch analysis and version recommendations.
- [Changelog Validator](sub-skills/changelog-validator/SKILL.md): basic helper checks and manual governance review.
- [Changelog Guidelines](docs/CHANGELOG_GUIDELINES.md): entry and release formatting guidance.

The sub-skills remain inside this repository as supporting files. The root skill loads their instructions when needed; they do not need separate installations or symlinks. Follow the root and sub-skill instructions for actual script paths and supported options. Some planning and reference documents describe capabilities the current helpers do not implement.

## Maintaining this repository

Preserve the parent skill and bundled sub-skill layout. Keep the root entrypoint concise and link specialised guidance rather than duplicating it. Do not move or overwrite unrelated personal skills or agents.

There are three npm packages: a root package (`@lightspeedwp/changelog-skill`, covering the root `scripts/validate-changelog.cjs`) and one in each sub-skill. No lockfiles are tracked and `package-lock.json` is git-ignored, so use `npm install` rather than `npm ci`. Run development commands in the relevant package directory. The runtime helper scripts require Node.js 18+ and use only built-in modules. In each sub-skill `npm test` runs lint, Jest coverage checks, and BATS; at the root it runs Jest and BATS. BATS is a separate prerequisite. Verify results before making pass or coverage claims.

Use the existing branch and preserve local changes. Keep commits and external actions within the user's authorised scope. Do not add another model's attribution to work it did not perform.

Repository: https://github.com/lightspeedwp/ls-wp-changelog
