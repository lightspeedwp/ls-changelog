---
name: ls-changelog
description: Create, update, or review LightSpeed WP changelogs and release notes, map branch types to changelog categories, and assess semantic version changes for WordPress themes and plugins. Use when working on CHANGELOG.md, adding release entries, validating a changelog, or preparing a release.
---

# LightSpeed WP Changelog

Maintain the target project's changelog using Keep a Changelog structure and LightSpeed WP conventions. This repository is one Claude Code skill with three bundled sub-skills. Read their files as needed; they are supporting instructions, not separate slash commands in this installation.

## Choose the workflow

| Request                                                          | Read when needed                                                                   |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Analyse a branch, choose a category, or recommend a version bump | [Branch Context Mapper](sub-skills/branch-context-mapper/SKILL.md)                 |
| Validate format, review governance, or assess release readiness  | [Changelog Validator](sub-skills/changelog-validator/SKILL.md)                     |
| Check that every entry has a PR link and an issue link           | [Changelog Link Verifier](sub-skills/changelog-link-verifier/SKILL.md)             |
| Create or edit changelog entries                                 | [Changelog Guidelines](docs/CHANGELOG_GUIDELINES.md), then the validator sub-skill |

For a combined request, use the mapper to inform entries, then the validator and the link verifier after editing. Load only the resources needed for the request. The guidelines describe the desired format; use the commands and implementation limits in the sub-skills for actual validation.

## Work in the target project

- Resolve the target repository and changelog from the user's request and current working directory. This skill's own `CHANGELOG.md` is not the default target when working in another project.
- Inspect the target project's instructions, existing format, relevant diff, commits, and PR information before writing entries. Preserve existing edits and released sections.
- Use `[Unreleased]` for development entries and the standard categories: Added, Changed, Deprecated, Removed, Fixed, Security. Describe user-visible changes with concise, specific wording and real PR or issue references. Do not invent references or release facts.
- Create a new changelog only when requested or needed for the task. Use `# Changelog` and `## [Unreleased]`; add dated version sections only when the version and release date are known.
- Recommend MAJOR for incompatible changes, MINOR for backwards-compatible features, and PATCH for backwards-compatible fixes. Treat branch names as hints; inspect the actual changes for breaking behaviour.
- When preparing an authorised release, move the relevant unreleased entries into `## [X.Y.Z] - YYYY-MM-DD`, retain an empty `[Unreleased]` heading, and preserve older releases. Follow the target project's version-file conventions.

## Bundled tools

Node.js 18+ is required to run the helpers. Both helpers use Node's standard library; runtime use does not require `npm install`. Development checks (tests, lint) are only needed when maintaining this skill: install per package with `npm install` (no lockfiles are tracked); see [README](README.md#development-checks). The root `scripts/validate-changelog.cjs` belongs to this repository's own tests and hooks; use the validator sub-skill's helper for target projects.

Resolve helper paths from this skill directory and keep the working directory in the target project. Claude Code supplies `${CLAUDE_SKILL_DIR}` for this root entrypoint:

```bash
node "${CLAUDE_SKILL_DIR}/sub-skills/branch-context-mapper/scripts/branch-context-mapper.cjs" 'feat/example-change'
node "${CLAUDE_SKILL_DIR}/sub-skills/changelog-validator/scripts/validate-changelog.cjs" "/absolute/path/to/target/CHANGELOG.md" --json
node "${CLAUDE_SKILL_DIR}/sub-skills/changelog-link-verifier/scripts/verify-changelog-links.ts" "/absolute/path/to/target/CHANGELOG.md"
```

The link verifier is TypeScript and needs Node.js 24 LTS (or 22.18+); see its [instructions](sub-skills/changelog-link-verifier/SKILL.md).

When reading a sub-skill as a supporting file, resolve its relative links and script paths from that sub-skill's directory. Do not assume a second variable substitution or a separately installed sub-skill.

## Verify and report

Run the validator against the target changelog after editing. Its present implementation checks only the title and presence of a version heading; its fixed score, governance fields, and `readyForRelease` flag do not establish compliance or release readiness. Complete the requested review using the validator sub-skill's manual checks and available repository evidence.

Report changed entries, any version recommendation and its reason, checks actually run, and remaining gaps. Preparing a changelog does not by itself authorise committing, pushing, tagging, merging, or publishing a release.
