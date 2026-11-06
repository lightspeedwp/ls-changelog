# Governance Rules

Six core principles for changelog automation:

## 1. Immutability

Released versions cannot be modified after release.

## 2. Atomicity

Each entry references one PR link and one issue link, next to each other (checked by the [changelog link verifier](../../changelog-link-verifier/SKILL.md)).

## 3. Consistency

All entries follow the same format and style.

## 4. Completeness

[Unreleased] section must be empty in releases.

## 5. Clarity

Entries must meet quality thresholds (0-100 scoring).

## 6. Traceability

Every entry must link to the code change (one PR link) and its issue (one Linear or GitHub issue link).

## Quality Scoring

- 90-100: Excellent (ready for release)
- 80-89: Good (ready with notes)
- <80: Issues need fixing
