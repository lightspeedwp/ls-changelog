# Analyze Branch Name

**Task:** Extract and analyze git branch metadata

## Input

- Branch name (e.g., `feature/oauth-authentication`)

## Output

- Branch type (feature/feat/fix/docs/etc)
- Description
- Changelog category
- Version bump
- Breaking change flag

## Accepted prefixes

`feature`, `feat`, `fix`, `hotfix`, `security`, `docs`, `refactor`, `test`, `chore`, `perf`, `design`, `a11y`, `deps`, `ci`, `build`, `task`, `release`. Types must be lowercase and the name must contain exactly one slash. Other prefixes are rejected.

## Example

Input: `feature/oauth-authentication`

Output:

```json
{
  "branchType": "feature",
  "description": "oauth-authentication",
  "category": "Added",
  "versionBump": "MINOR",
  "isBreaking": false
}
```

## Success Criteria

- Branch type correctly identified
- Category correctly mapped
- Version bump correctly calculated
- Breaking changes detected if present
