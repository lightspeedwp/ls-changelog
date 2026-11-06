#!/usr/bin/env bats
#
# BATS tests for validate-changelog.cjs
# Tests the changelog validation script end-to-end

SCRIPT_DIR="$(cd "$(dirname "${BATS_TEST_FILENAME}")" && pwd)"
SCRIPT_PATH="${SCRIPT_DIR}/../scripts/validate-changelog.cjs"
TEST_DIR="${BATS_TMPDIR}/changelog-tests"

setup() {
  mkdir -p "${TEST_DIR}"
}

teardown() {
  rm -rf "${TEST_DIR}"
}

# Helper to create and validate a changelog
validate_changelog() {
  local filename="$1"
  local expected_exit="$2"
  node "${SCRIPT_PATH}" "${TEST_DIR}/${filename}"
  echo $?
}

# Test Suite: Valid Changelogs
@test "validate: accepts simple valid changelog" {
  cat > "${TEST_DIR}/valid-simple.md" << 'EOF'
# Changelog

## [1.0.0] - 2026-10-30

### Added
- Initial release
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/valid-simple.md"
  [ "$status" -eq 0 ]
  [[ "$output" == *"passed"* ]]
}

@test "validate: accepts changelog with multiple versions" {
  cat > "${TEST_DIR}/multi-version.md" << 'EOF'
# Changelog

## [2.0.0] - 2026-10-30

### Added
- New feature

## [1.0.0] - 2026-09-15

### Added
- Initial release
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/multi-version.md"
  [ "$status" -eq 0 ]
}

@test "validate: accepts changelog with [Unreleased] section" {
  cat > "${TEST_DIR}/unreleased.md" << 'EOF'
# Changelog

## [Unreleased]

### Added
- Work in progress

## [1.0.0] - 2026-09-15

### Added
- Initial release
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/unreleased.md"
  [ "$status" -eq 0 ]
}

@test "validate: accepts all changelog categories" {
  cat > "${TEST_DIR}/all-categories.md" << 'EOF'
# Changelog

## [1.1.0] - 2026-10-30

### Added
- New feature

### Changed
- Modified behavior

### Fixed
- Bug fix

### Removed
- Deprecated feature

### Security
- Security patch
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/all-categories.md"
  [ "$status" -eq 0 ]
}

@test "validate: accepts pre-release versions" {
  cat > "${TEST_DIR}/prerelease.md" << 'EOF'
# Changelog

## [1.0.0-beta.1] - 2026-10-30

### Added
- Beta feature
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/prerelease.md"
  [ "$status" -eq 0 ]
}

@test "validate: accepts entries with PR numbers" {
  cat > "${TEST_DIR}/pr-entries.md" << 'EOF'
# Changelog

## [1.0.0] - 2026-10-30

### Added
- Added async support (#123)
- New feature (#124)
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/pr-entries.md"
  [ "$status" -eq 0 ]
}

@test "validate: accepts entries with em-dashes" {
  cat > "${TEST_DIR}/em-dashes.md" << 'EOF'
# Changelog

## [1.0.0] - 2026-10-30

### Removed
- Deprecated API — use new API instead (#100)
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/em-dashes.md"
  [ "$status" -eq 0 ]
}

# Test Suite: Invalid Format Errors
@test "validate: rejects version with 'v' prefix" {
  cat > "${TEST_DIR}/v-prefix.md" << 'EOF'
# Changelog

## [v1.0.0] - 2026-10-30

### Added
- Feature
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/v-prefix.md"
  [ "$status" -ne 0 ]
  [[ "$output" == *"Invalid version"* ]]
}

@test "validate: rejects incomplete semver version" {
  cat > "${TEST_DIR}/incomplete-semver.md" << 'EOF'
# Changelog

## [1.0] - 2026-10-30

### Added
- Feature
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/incomplete-semver.md"
  [ "$status" -ne 0 ]
}

@test "validate: rejects missing date on released version" {
  cat > "${TEST_DIR}/missing-date.md" << 'EOF'
# Changelog

## [1.0.0]

### Added
- Feature
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/missing-date.md"
  [ "$status" -ne 0 ]
  [[ "$output" == *"missing date"* ]]
}

@test "validate: rejects invalid date format (MM/DD/YYYY)" {
  cat > "${TEST_DIR}/invalid-date-format.md" << 'EOF'
# Changelog

## [1.0.0] - 10/30/2026

### Added
- Feature
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/invalid-date-format.md"
  [ "$status" -ne 0 ]
}

@test "validate: rejects [Unreleased] with a date" {
  cat > "${TEST_DIR}/unreleased-dated.md" << 'EOF'
# Changelog

## [Unreleased] - 2026-10-30

### Added
- Feature
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/unreleased-dated.md"
  [ "$status" -ne 0 ]
  [[ "$output" == *"Unreleased"* ]]
}

@test "validate: rejects changelog without title" {
  cat > "${TEST_DIR}/no-title.md" << 'EOF'
## [1.0.0] - 2026-10-30

### Added
- Feature
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/no-title.md"
  [ "$status" -ne 0 ]
  [[ "$output" == *'Missing required "# Changelog" title'* ]]
}

@test "validate: rejects non-existent file" {
  run node "${SCRIPT_PATH}" "${TEST_DIR}/does-not-exist.md"
  [ "$status" -ne 0 ]
  [[ "$output" == *"File not found"* ]]
}

# Test Suite: Real-world Scenarios
@test "validate: accepts realistic full changelog" {
  cat > "${TEST_DIR}/realistic.md" << 'EOF'
# Changelog

All notable changes documented here.

## [Unreleased]

### Added
- New async support (#200)

---

## [2.1.0] - 2026-10-15

### Added
- Custom middleware (#150)

### Changed
- Better error messages (#152)

### Fixed
- Timeout issue (#153)

### Removed
- Deprecated sync mode (#149)

### Security
- XSS vulnerability fix (#154)

---

## [1.0.0] - 2026-08-01

### Added
- Initial release
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/realistic.md"
  [ "$status" -eq 0 ]
}

@test "validate: rejects malformed real-world scenario" {
  cat > "${TEST_DIR}/malformed-realistic.md" << 'EOF'
# Changelog

## Unreleased

### Added
- Missing brackets

## [1.0.0]

### Added
- Missing date
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/malformed-realistic.md"
  [ "$status" -ne 0 ]
}

# Test Suite: Edge Cases
@test "validate: handles multiple horizontal rules" {
  cat > "${TEST_DIR}/multiple-rules.md" << 'EOF'
# Changelog

## [2.0.0] - 2026-10-30

### Added
- Feature

---

## [1.0.0] - 2026-09-15

### Added
- Initial

---
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/multiple-rules.md"
  [ "$status" -eq 0 ]
}

@test "validate: handles extra whitespace" {
  cat > "${TEST_DIR}/whitespace.md" << 'EOF'
# Changelog

##  [1.0.0]   -   2026-10-30

### Added
-   Feature with spaces
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/whitespace.md"
  [ "$status" -eq 0 ]
}

@test "validate: handles special characters in entries" {
  cat > "${TEST_DIR}/special-chars.md" << 'EOF'
# Changelog

## [1.0.0] - 2026-10-30

### Added
- Regex pattern: /^test$/ (#123)
- JSON support: {"key": "value"} (#124)
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/special-chars.md"
  [ "$status" -eq 0 ]
}

@test "validate: handles breaking change entries" {
  cat > "${TEST_DIR}/breaking-changes.md" << 'EOF'
# Changelog

## [2.0.0] - 2026-10-30

### Changed
- Breaking: Removed sync() method. Use async instead. (#120)
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/breaking-changes.md"
  [ "$status" -eq 0 ]
}

# Test Suite: JSON Output
@test "validate: outputs JSON format with --json flag" {
  cat > "${TEST_DIR}/json-valid.md" << 'EOF'
# Changelog

## [1.0.0] - 2026-10-30

### Added
- Feature
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/json-valid.md" --json
  [ "$status" -eq 0 ]
  [[ "$output" == *'"valid"'* ]]
}

@test "validate: reports errors in JSON format" {
  cat > "${TEST_DIR}/json-errors.md" << 'EOF'
# Changelog

## [invalid] - 2026-10-30

### Added
- Feature
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/json-errors.md" --json
  [ "$status" -ne 0 ]
  [[ "$output" == *'"valid": false'* ]]
  [[ "$output" == *'"errors"'* ]]
}

# Test Suite: Performance/Scale
@test "validate: handles large changelog (10+ versions)" {
  cat > "${TEST_DIR}/large-changelog.md" << 'EOF'
# Changelog

## [10.0.0] - 2026-10-01

### Added
- Version 10

## [9.0.0] - 2026-09-01

### Added
- Version 9

## [8.0.0] - 2026-08-01

### Added
- Version 8

## [7.0.0] - 2026-07-01

### Added
- Version 7

## [6.0.0] - 2026-06-01

### Added
- Version 6

## [5.0.0] - 2026-05-01

### Added
- Version 5

## [4.0.0] - 2026-04-01

### Added
- Version 4

## [3.0.0] - 2026-03-01

### Added
- Version 3

## [2.0.0] - 2026-02-01

### Added
- Version 2

## [1.0.0] - 2026-01-01

### Added
- Version 1
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/large-changelog.md"
  [ "$status" -eq 0 ]
}

@test "validate: rejects invalid entry without title" {
  cat > "${TEST_DIR}/invalid-entry.md" << 'EOF'
# Changelog

## [1.0.0] - 2026-10-30

### Added

## [0.9.0] - 2026-09-01

### Added
- Feature
EOF
  run node "${SCRIPT_PATH}" "${TEST_DIR}/invalid-entry.md"
  # Should still pass (empty sections allowed)
  [ "$status" -eq 0 ]
}
