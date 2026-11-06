# Changelog

All notable changes to the LightSpeed WP Changelog Generator project are documented in this file.

## [Unreleased]

### Added
- Branch mapper and branch hook accept the supported organisation branch types ([PR #2](https://github.com/lightspeedwp/ls-wp-changelog/pull/2), [LS-4774](https://linear.app/lightspeedwp/issue/LS-4774/refactor-ls-wp-changelog-align-branch-handling-with-the-org-branch))
- Root changelog validator rejects a changelog without a `# Changelog` title ([PR #1](https://github.com/lightspeedwp/ls-wp-changelog/pull/1), [LS-4773](https://linear.app/lightspeedwp/issue/LS-4773/refactor-ls-wp-changelog-repair-the-test-harness-and-hooks))

### Changed
- Repository identity, setup and capability descriptions now match the tracked tree: `ls-wp-changelog` repository, no tracked lockfiles, root npm package documented ([LS-4776](https://linear.app/lightspeedwp/issue/LS-4776/refactor-ls-wp-changelog-fix-repository-identity-metadata-and-setup))
- `changelog-validate` hook checks the real `CHANGELOG.md` and uses POSIX shell syntax ([PR #1](https://github.com/lightspeedwp/ls-wp-changelog/pull/1), [LS-4773](https://linear.app/lightspeedwp/issue/LS-4773/refactor-ls-wp-changelog-repair-the-test-harness-and-hooks))

### Fixed
- Root test suite targets the real `scripts/validate-changelog.cjs` and Jest discovery is limited to `scripts/` ([PR #1](https://github.com/lightspeedwp/ls-wp-changelog/pull/1), [LS-4773](https://linear.app/lightspeedwp/issue/LS-4773/refactor-ls-wp-changelog-repair-the-test-harness-and-hooks))

## [0.1.0] - 2026-10-30

### Added
- Initial repository structure
- Changelog skill for creating and maintaining CHANGELOG.md files
- Keep a Changelog 1.1.0 compliance
- Semantic versioning support
- Branch validation agent
- Documentation and reference materials
- Validation scripts and tooling
- Spec management with speckit integration
