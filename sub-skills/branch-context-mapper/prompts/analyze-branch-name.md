# Analyze Branch Name

**Task:** Extract and analyze git branch metadata

## Input

- Branch name (e.g., `feature/oauth-authentication`)

## Output

- Branch type (feature/feat/fix/docs/etc)
- Description
- Changelog category (a hint, null for some types)
- Version bump (a hint, null for some types)
- `isBreaking`, which is always `false` for an accepted branch: the helper does not detect breaking changes

## Accepted prefixes

`feature`, `feat`, `fix`, `hotfix`, `security`, `docs`, `refactor`, `test`, `chore`, `perf`, `design`, `a11y`, `deps`, `ci`, `build`, `task`, `release`. Types must be lowercase and the name must contain exactly one slash. Other prefixes are rejected.

## Example

Input: `feature/oauth-authentication`

Output (real helper output; exit code 0 for an accepted branch, 1 for a rejected one):

```json
{
  "branchType": "feature",
  "isValid": true,
  "validationErrors": [],
  "description": "oauth-authentication",
  "category": "Added",
  "versionBump": "MINOR",
  "isBreaking": false
}
```

## Success Criteria

- Branch type correctly identified
- Category and version bump reported as the helper's hints
- Breaking changes assessed manually from the diff, commits and PR (a branch name cannot prove compatibility); recommend MAJOR when an incompatible change is documented, whatever the helper returns
- A null category or version bump is not permission to omit a required changelog entry
