#!/usr/bin/env node

/**
 * Branch Context Mapper
 * Maps git branch types to changelog categories and version bumps
 * Implementation Phase 1
 */

// Branch type mapping
// The first seven entries are the original mapper contract and must not change.
// The remaining entries align with the organisation branch types
// (lightspeedwp/.github docs/BRANCHING_STRATEGY.md section 9.5).
const BRANCH_TYPES = {
  feature: { category: 'Added', versionBump: 'MINOR' },
  fix: { category: 'Fixed', versionBump: 'PATCH' },
  security: { category: 'Security', versionBump: 'PATCH' },
  docs: { category: null, versionBump: null },
  refactor: { category: 'Changed', versionBump: null },
  test: { category: null, versionBump: null },
  chore: { category: null, versionBump: 'PATCH' },
  // Organisation branch types
  feat: { category: 'Added', versionBump: 'MINOR' },
  hotfix: { category: 'Fixed', versionBump: 'PATCH' },
  perf: { category: 'Changed', versionBump: 'PATCH' },
  design: { category: 'Changed', versionBump: null },
  a11y: { category: 'Changed', versionBump: 'PATCH' },
  deps: { category: null, versionBump: 'PATCH' },
  ci: { category: null, versionBump: null },
  build: { category: null, versionBump: null },
  task: { category: null, versionBump: null },
  release: { category: null, versionBump: null }
};

function analyzeBranch(branchName) {
  if (!branchName) {
    return {
      branchType: null,
      isValid: false,
      validationErrors: ['Branch name is required'],
      description: null,
      category: null,
      versionBump: null,
      isBreaking: null
    };
  }

  const parts = branchName.split('/');
  if (parts.length !== 2) {
    return {
      branchType: null,
      isValid: false,
      validationErrors: ['Branch name must follow format: type/description'],
      description: null,
      category: null,
      versionBump: null,
      isBreaking: null
    };
  }

  const [branchType, description] = parts;

  if (!BRANCH_TYPES[branchType]) {
    return {
      branchType,
      isValid: false,
      validationErrors: [
        `Unknown branch type: '${branchType}'. Valid types: ${Object.keys(BRANCH_TYPES).join(', ')}`
      ],
      description,
      category: null,
      versionBump: null,
      isBreaking: null
    };
  }

  const { category, versionBump } = BRANCH_TYPES[branchType];
  return {
    branchType,
    isValid: true,
    validationErrors: [],
    description,
    category,
    versionBump,
    isBreaking: false
  };
}

// CLI Usage
if (require.main === module) {
  const branchName = process.argv[2];
  const result = analyzeBranch(branchName);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.isValid ? 0 : 1);
}

module.exports = { analyzeBranch, BRANCH_TYPES };
