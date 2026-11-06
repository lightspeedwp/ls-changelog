const { analyzeBranch, BRANCH_TYPES } = require('../scripts/branch-context-mapper.cjs');

describe('Branch Context Mapper', () => {
  describe('Branch Type Extraction', () => {
    test('should extract feature branch type', () => {
      const result = analyzeBranch('feature/oauth-auth');
      expect(result.branchType).toBe('feature');
      expect(result.description).toBe('oauth-auth');
    });

    test('should extract fix branch type', () => {
      const result = analyzeBranch('fix/sidebar-bug');
      expect(result.branchType).toBe('fix');
      expect(result.description).toBe('sidebar-bug');
    });

    test('should reject invalid branch format', () => {
      const result = analyzeBranch('invalid-branch');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Category Mapping', () => {
    test('should map feature to Added', () => {
      const result = analyzeBranch('feature/new-feature');
      expect(result.category).toBe('Added');
    });

    test('should map fix to Fixed', () => {
      const result = analyzeBranch('fix/bug-fix');
      expect(result.category).toBe('Fixed');
    });
  });

  describe('Version Bump Calculation', () => {
    test('should calculate MINOR for features', () => {
      const result = analyzeBranch('feature/new');
      expect(result.versionBump).toBe('MINOR');
    });

    test('should calculate PATCH for fixes', () => {
      const result = analyzeBranch('fix/issue');
      expect(result.versionBump).toBe('PATCH');
    });

    test('should calculate PATCH for security fixes', () => {
      const result = analyzeBranch('security/xss-fix');
      expect(result.versionBump).toBe('PATCH');
      expect(result.category).toBe('Security');
    });

    test('should have null version bump for docs', () => {
      const result = analyzeBranch('docs/readme');
      expect(result.versionBump).toBeNull();
      expect(result.category).toBeNull();
    });

    test('should have null version bump for refactor', () => {
      const result = analyzeBranch('refactor/cleanup');
      expect(result.versionBump).toBeNull();
      expect(result.category).toBe('Changed');
    });

    test('should have null version bump for test', () => {
      const result = analyzeBranch('test/new-tests');
      expect(result.versionBump).toBeNull();
      expect(result.category).toBeNull();
    });

    test('should calculate PATCH for chore', () => {
      const result = analyzeBranch('chore/deps');
      expect(result.versionBump).toBe('PATCH');
      expect(result.category).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should reject null branch name', () => {
      const result = analyzeBranch(null);
      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain('Branch name is required');
    });

    test('should reject empty branch name', () => {
      const result = analyzeBranch('');
      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain('Branch name is required');
    });

    test('should reject branch without slash separator', () => {
      const result = analyzeBranch('featureoauth');
      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain('Branch name must follow format: type/description');
    });

    test('should reject branch with multiple slashes', () => {
      const result = analyzeBranch('feature/oauth/auth');
      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain('Branch name must follow format: type/description');
    });

    test('should reject unknown branch type', () => {
      const result = analyzeBranch('unknown/feature');
      expect(result.isValid).toBe(false);
      expect(result.validationErrors[0]).toContain('Unknown branch type');
    });
  });

  describe('Breaking Changes', () => {
    test('should detect non-breaking branches', () => {
      const result = analyzeBranch('feature/new-feature');
      expect(result.isBreaking).toBe(false);
    });
  });

  describe('Organisation Branch Types', () => {
    test.each([
      ['feat/user-registration', 'feat', 'Added', 'MINOR'],
      ['hotfix/auth-bypass', 'hotfix', 'Fixed', 'PATCH'],
      ['perf/query-cache', 'perf', 'Changed', 'PATCH'],
      ['design/button-states', 'design', 'Changed', null],
      ['a11y/focus-order', 'a11y', 'Changed', 'PATCH'],
      ['deps/upgrade-packages', 'deps', null, 'PATCH'],
      ['ci/lint-workflow', 'ci', null, null],
      ['build/bundle-config', 'build', null, null],
      ['task/epic-cleanup', 'task', null, null],
      ['release/v1-2-0', 'release', null, null]
    ])('should accept %s', (branch, type, category, versionBump) => {
      const result = analyzeBranch(branch);
      expect(result.isValid).toBe(true);
      expect(result.branchType).toBe(type);
      expect(result.category).toBe(category);
      expect(result.versionBump).toBe(versionBump);
      expect(result.isBreaking).toBe(false);
    });

    test('should map feat the same as feature', () => {
      const feat = analyzeBranch('feat/x');
      const feature = analyzeBranch('feature/x');
      expect(feat.category).toBe(feature.category);
      expect(feat.versionBump).toBe(feature.versionBump);
    });

    test('should still reject types outside the supported list', () => {
      const result = analyzeBranch('wip/something');
      expect(result.isValid).toBe(false);
      expect(result.validationErrors[0]).toContain('Unknown branch type');
    });
  });

  describe('Preserved Edge Behaviour', () => {
    test('should reject uppercase branch types', () => {
      expect(analyzeBranch('Feature/Oauth').isValid).toBe(false);
      expect(analyzeBranch('FIX/bug').isValid).toBe(false);
    });

    test('should reject extra slashes for organisation types', () => {
      const result = analyzeBranch('feat/scope/title');
      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain('Branch name must follow format: type/description');
    });

    test('should keep accepting fix/ with an empty description', () => {
      const result = analyzeBranch('fix/');
      expect(result.isValid).toBe(true);
      expect(result.branchType).toBe('fix');
      expect(result.description).toBe('');
    });
  });

  describe('Module Exports', () => {
    test('should export analyzeBranch function', () => {
      expect(typeof analyzeBranch).toBe('function');
    });

    test('should export BRANCH_TYPES mapping', () => {
      expect(BRANCH_TYPES).toBeDefined();
      expect(BRANCH_TYPES.feature).toBeDefined();
      expect(BRANCH_TYPES.fix).toBeDefined();
      expect(BRANCH_TYPES.security).toBeDefined();
      expect(BRANCH_TYPES.docs).toBeDefined();
      expect(BRANCH_TYPES.refactor).toBeDefined();
      expect(BRANCH_TYPES.test).toBeDefined();
      expect(BRANCH_TYPES.chore).toBeDefined();
      expect(BRANCH_TYPES.feat).toBeDefined();
    });

    test('should have correct branch type mappings', () => {
      expect(BRANCH_TYPES.feature.category).toBe('Added');
      expect(BRANCH_TYPES.feature.versionBump).toBe('MINOR');
      expect(BRANCH_TYPES.fix.category).toBe('Fixed');
      expect(BRANCH_TYPES.fix.versionBump).toBe('PATCH');
      expect(BRANCH_TYPES.security.category).toBe('Security');
      expect(BRANCH_TYPES.docs.category).toBeNull();
      expect(BRANCH_TYPES.refactor.category).toBe('Changed');
      expect(BRANCH_TYPES.refactor.versionBump).toBeNull();
    });
  });
});
