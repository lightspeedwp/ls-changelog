# LightSpeed WP Branching Strategy

Branch naming convention: `{type}/{description}`

## Types

| Type     | Category | Version     | Purpose                                                       |
| -------- | -------- | ----------- | ------------------------------------------------------------- |
| feature  | Added    | MINOR       | New features                                                  |
| fix      | Fixed    | PATCH       | Bug fixes                                                     |
| security | Security | PATCH/MAJOR | Security patches                                              |
| docs     | -        | -           | Documentation                                                 |
| refactor | Changed  | -           | Code improvements                                             |
| test     | -        | -           | Tests                                                         |
| chore    | -        | PATCH       | Maintenance                                                   |
| feat     | Added    | MINOR       | New features (organisation prefix; same mapping as `feature`) |
| hotfix   | Fixed    | PATCH       | Urgent production fixes                                       |
| perf     | Changed  | PATCH       | Performance improvements                                      |
| design   | Changed  | -           | Design and UI changes                                         |
| a11y     | Changed  | PATCH       | Accessibility improvements                                    |
| deps     | -        | PATCH       | Dependency updates                                            |
| ci       | -        | -           | CI/CD and workflows                                           |
| build    | -        | -           | Build process changes                                         |
| task     | -        | -           | Scoped project work                                           |
| release  | -        | -           | Release branches                                              |

The organisation's source of truth is `docs/BRANCHING_STRATEGY.md` in `lightspeedwp/.github` (format `{type}/{scope}-{short-title}`). This local table lists only the types the helper maps. Other organisation types such as `revert/`, `ops/` or `epic/` are not mapped by the helper.

## Examples

- `feat/oauth-authentication` (`feature/oauth-authentication` is also accepted)
- `fix/sidebar-width-bug`
- `security/xss-vulnerability-fix`
- `docs/api-documentation`
- `refactor/component-cleanup`
- `hotfix/auth-bypass`
- `deps/upgrade-packages`
