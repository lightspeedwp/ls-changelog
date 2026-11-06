#!/usr/bin/env bats

SCRIPT_PATH="$(cd "$(dirname "${BATS_TEST_FILENAME}")" && pwd)/../scripts/branch-context-mapper.cjs"

@test "should validate feature branch names" {
  result=$(node "$SCRIPT_PATH" feature/oauth-auth)
  [[ "$result" == *"feature"* ]]
}

@test "should validate fix branch names" {
  result=$(node "$SCRIPT_PATH" fix/sidebar-bug)
  [[ "$result" == *"fix"* ]]
}

@test "should reject invalid branch format" {
  run node "$SCRIPT_PATH" invalid-branch
  [ "$status" -ne 0 ]
}

@test "should require branch name argument" {
  run node "$SCRIPT_PATH"
  [ "$status" -ne 0 ]
}

@test "should accept org feat/ branch names" {
  run node "$SCRIPT_PATH" feat/user-registration
  [ "$status" -eq 0 ]
  [[ "$output" == *'"branchType": "feat"'* ]]
  [[ "$output" == *'"category": "Added"'* ]]
}

@test "should accept org hotfix/ branch names" {
  run node "$SCRIPT_PATH" hotfix/auth-bypass
  [ "$status" -eq 0 ]
  [[ "$output" == *'"category": "Fixed"'* ]]
}

@test "should reject unknown branch types" {
  run node "$SCRIPT_PATH" wip/something
  [ "$status" -ne 0 ]
  [[ "$output" == *"Unknown branch type"* ]]
}

@test "should reject extra slashes" {
  run node "$SCRIPT_PATH" feat/scope/title
  [ "$status" -ne 0 ]
}

@test "should reject uppercase branch types" {
  run node "$SCRIPT_PATH" Feature/Oauth
  [ "$status" -ne 0 ]
}
