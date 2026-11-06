# Validate Changelog Format

**Task:** Run the basic changelog check, then review the rest manually

## Input

- CHANGELOG.md file (pass its path to the helper)

## Output

- Basic format result (`isValid`)
- Placeholder score (fixed at 85 on success, 0 on failure)
- Placeholder governance status (the helper marks every principle `pass` without checking entries)
- Error messages if any
- Separately, your manual findings and any checks you could not verify

## What the helper checks

- The file exists
- It contains `# Changelog`
- It contains a version heading such as `## [Unreleased]` or `## [1.2.3]`

## Review manually

Structure, dates, entry quality, traceability, immutability and completeness are not checked by the helper. See [Governance Rules](../references/GOVERNANCE_RULES.md) and the instructions in [SKILL.md](../SKILL.md). Do not treat the score or `readyForRelease` as a quality or release decision.

## Example

Input: `CHANGELOG.md` with a title and a version heading

Output (real helper output):

```json
{
  "isValid": true,
  "score": 85,
  "errors": [],
  "governance": {
    "immutability": "pass",
    "atomicity": "pass",
    "consistency": "pass",
    "completeness": "pass",
    "clarity": "pass",
    "traceability": "pass"
  },
  "readyForRelease": true
}
```

For a file with no `# Changelog` title the helper returns `"isValid": false`, `"score": 0`, the error `Missing "# Changelog" title`, and `"readyForRelease": false` (the governance fields still read `pass`).

## Success Criteria

- The helper result is reported as a basic check only
- Manual findings and unverified checks are reported separately
- No quality score or release readiness is claimed from the helper output
