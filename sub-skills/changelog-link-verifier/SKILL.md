---
name: changelog-link-verifier
description: Verify that every changelog entry has an adjacent pull request link and issue link (Linear or GitHub), and accept a release-agent handoff for the check. Use when asked to check changelog traceability, find entries missing PR or issue links, or verify a changelog before a release.
---

# Changelog Link Verifier

Use this sub-skill through [ls-changelog](../../SKILL.md) to find changelog entries that are missing a PR link or an issue link. It is read-only: it never edits the changelog, fetches links, or takes any release action.

## Entry format

Every entry needs one PR link and one issue link next to each other, normally in a trailing parenthetical:

```markdown
- Added gallery controls ([PR #123](https://github.com/org/repo/pull/123), [LS-4749](https://linear.app/org/issue/LS-4749))
```

This is the adopted format for the verifier. It is stricter than the `(#1234)` examples in [Changelog Format](../../docs/CHANGELOG_FORMAT.md).

How links are recognised:

- **PR link:** a URL containing `/pull/<n>`, or link text such as `PR #123` or `Pull Request 123`.
- **Issue link:** a Linear issue URL (`linear.app/<workspace>/issue/<KEY-n>`), a GitHub URL containing `/issues/<n>`, or link text such as `LS-4749` or `Issue #45`.
- **Adjacent:** only whitespace, commas, semicolons, `/`, `&` or the word "and" sit between the PR link and the issue link, in either order.
- A bare `(#123)` is not a link and does not count.

An entry is a top-level list item (`-`, `*` or `+`) inside a `## [version]` section. Indented wrapped lines are treated as part of the entry. Text outside release sections and inside code fences is ignored.

## Run the helper

Resolve `scripts/verify-changelog-links.ts` relative to this file's directory and pass the target changelog explicitly, preferably as an absolute path:

```bash
node "${CLAUDE_SKILL_DIR}/sub-skills/changelog-link-verifier/scripts/verify-changelog-links.ts" "/absolute/path/to/CHANGELOG.md"
```

Options:

- `--json` prints `{ file, releases, checked, failures, passed }`. Each failure has `line`, `release`, `entry` and `missing` (`pr`, `issue` or `adjacent`).
- `--unreleased-only` checks only `## [Unreleased]`. Released history is immutable, so use this when older entries predate the link rule.
- `--version X.Y.Z` checks only that release (a leading `v` is ignored).

Exit codes: `0` every checked entry passes, `1` at least one entry fails (every failing entry is reported with its line number), `2` usage error, unreadable file, no release sections, or a requested release that does not exist.

Requires Node.js 24 LTS (or 22.18+), which runs TypeScript directly. On Node 22.6 to 22.17 add `--experimental-strip-types` before the script path. The script has no dependencies.

## Limits

- It checks link presence and adjacency only. It does not check that a link resolves, points at the right PR or issue, or that the entry text is accurate.
- Other validation (title, version headings, dates, governance review) stays with the [changelog validator](../changelog-validator/SKILL.md).
- Report the verifier result separately from any manual findings. A passing result does not authorise merging, tagging or publishing.

## Release-agent handoff intake

The release agent hands a changelog check to this sub-skill with four fields (see the release-side issue [LS-4770](https://linear.app/lightspeedwp/issue/LS-4770/refactor-ls-wp-release-fix-doc-links-add-changelog-handoff-and-script) and its epic LS-4750):

| Field          | Use                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Version        | Pass as `--version <version>` to check that release's entries                                                                             |
| Release issue  | The Linear or GitHub issue for the release. Record it in the report; do not change it                                                     |
| PR list        | The PRs the release should contain. Compare it manually with the PR links the verifier found; automated cross-checking is not implemented |
| Changelog path | Pass as the file argument                                                                                                                 |

Run the verifier with the path and version, report the failures, and return the result to the release agent. The verifier makes no release decision and edits nothing. The exact release-to-changelog validation rules are still to be agreed with the release-side issue.

## Development checks

From the repository root, `npm install` installs Vitest, then `npm run test:vitest` runs this sub-skill's tests (`__tests__/verify-changelog-links.test.ts`) with V8 coverage. Inspect the command output before claiming results.
