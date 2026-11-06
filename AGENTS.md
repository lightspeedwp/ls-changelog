# Agents Reference

This repository provides one parent Claude Code skill with two bundled sub-skills.

| Component               | Entrypoint                                             | Purpose                                                                |
| ----------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| `ls-changelog`          | [SKILL.md](SKILL.md)                                   | Route changelog creation, editing, review, and release preparation     |
| `branch-context-mapper` | [Sub-skill](sub-skills/branch-context-mapper/SKILL.md) | Map branch context to changelog categories and version recommendations |
| `changelog-validator`   | [Sub-skill](sub-skills/changelog-validator/SKILL.md)   | Run basic checks and guide manual governance review                    |

The repository is `lightspeedwp/ls-wp-changelog`; the skill name is `ls-changelog`. Install the repository at `~/.claude/skills/ls-changelog/` and invoke `/ls-changelog`. The parent reads the relevant nested instructions; no separate sub-skill commands or globally installed branch-validation agent are required.

Both helpers are limited: the mapper is an advisory lookup of branch type to category and version hint, and the validator is a basic title and version-heading check. Governance, quality and release-readiness review are manual.

When maintaining these skills, preserve the root entrypoint and relative resource links. Keep documented helper capabilities aligned with executable behaviour. See [CLAUDE.md](CLAUDE.md) for repository development guidance.
