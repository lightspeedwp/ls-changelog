---
name: changelog-summariser
description: Condense a large CHANGELOG.md into a summary, or extract release notes for one release, keeping every entry's PR and issue links. Use when a changelog has grown too large to read, when asked for a condensed changelog or release notes drawn from the changelog, or before sharing recent changes.
---

# Changelog Summariser

Use this sub-skill through [ls-changelog](../../SKILL.md) to shorten a large changelog or to pull the notes for a single release. It is read-only: output goes to standard output, the changelog is never written, and nothing is published. Generating a summary is not a release announcement.

## Ownership and overlap

Release communication already exists elsewhere, so this sub-skill is deliberately narrow:

| Capability                                                                                                                        | Owner                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Condense the changelog file itself, and extract one release's notes from it, keeping PR and issue links                           | This sub-skill (`ls-wp-changelog`)                                                                                                                 |
| Multi-channel release communication (GitHub Release, email, Slack, blog), commit-history parsing, contributor credit, publication | `ls-wp-release` (`release-notes-generator`, `changelog-management`) and the release-ops plugin (`changelog-compliance`, `release-notes-generator`) |

Why: the changelog repository owns the changelog's format and entries, so condensing them belongs here, while the release repository owns what is announced and where. This sub-skill reads only the changelog (no git history, no network), produces plain Markdown or JSON, and does not duplicate the release-side formatters. Nothing is imported or merged from the release repository or the release-ops stubs. The release agent may use this output as input to its own notes. If the maintainers later decide that summaries belong to the release repository, this sub-skill can be removed without touching the validator or mapper.

## Run the helper

Resolve `scripts/summarise-changelog.ts` relative to this file's directory and pass the changelog explicitly, preferably as an absolute path:

```bash
node "${CLAUDE_SKILL_DIR}/sub-skills/changelog-summariser/scripts/summarise-changelog.ts" "/absolute/path/to/CHANGELOG.md"
```

Modes and options:

- **Summary (default):** `[Unreleased]` and the latest `--keep-latest N` released versions (default 3) are kept in full, with entries and links exactly as written. Older releases are collapsed to a category count line plus every PR link and issue link their entries contain, and a count of entries that have no such link.
- **Release notes:** `--notes X.Y.Z` (or `--notes unreleased`) prints one release's entries by category, verbatim. A leading `v` is ignored.
- **`--json`:** prints structured data (`file`, `mode`, and the releases with counts, links and entries) instead of Markdown.

Exit codes: `0` success, `2` usage error, unreadable file, no release sections, or an unknown release.

Requires Node.js 24 LTS (or 22.18+), which runs TypeScript directly. On Node 22.6 to 22.17 add `--experimental-strip-types` before the script path. The script depends only on the [link verifier](../changelog-link-verifier/SKILL.md) script for link classification.

## Example output

Summary of an older release (links retained, entries condensed):

```markdown
## [1.0.0] - 2026-01-01 (collapsed, 3 entries)

- Changes: Added 2, Security 1
- Pull requests: [PR #1](https://github.com/org/repo/pull/1), [PR #3](https://github.com/org/repo/pull/3)
- Issues: [LS-1](https://linear.app/org/issue/LS-1), [LS-2](https://linear.app/org/issue/LS-2), [LS-3](https://linear.app/org/issue/LS-3)
```

## Limits

- Collapsing removes entry wording for older releases. Link traceability is kept, but the original text is only in the changelog, so point readers to it.
- Links are read from the entry text; the summariser never fetches or verifies them. Use the [link verifier](../changelog-link-verifier/SKILL.md) to find entries missing links.
- Only `## [version]` sections, `###` categories and top-level list items are recognised. Content in code fences and text outside releases is ignored.
- Released history is never edited. Write any summary to a separate file only when the user asks for one.

## Development checks

From the repository root, `npm install` installs Vitest, then `npm run test:vitest` runs this sub-skill's tests (`__tests__/summarise-changelog.test.ts`) with V8 coverage. Inspect the command output before claiming results.
