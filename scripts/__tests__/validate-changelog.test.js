/**
 * Jest tests for validate-changelog.cjs
 * Tests the changelog validation script with 90%+ coverage
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SCRIPT_PATH = path.resolve(__dirname, '../validate-changelog.cjs');
const TEMP_DIR = path.join(__dirname, './temp-changelogs');

// Setup and teardown
beforeAll(() => {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
});

afterEach(() => {
  // Clean up temp files
  if (fs.existsSync(TEMP_DIR)) {
    fs.readdirSync(TEMP_DIR).forEach(file => {
      fs.unlinkSync(path.join(TEMP_DIR, file));
    });
  }
});

afterAll(() => {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmdirSync(TEMP_DIR);
  }
});

// Helper function to run validation.
// Uses an argument vector (no shell) so paths containing spaces or quotes are safe.
function validateChangelog(filename, options = '') {
  const args = [SCRIPT_PATH, path.join(TEMP_DIR, filename)];
  if (options) {
    args.push(...options.split(/\s+/).filter(Boolean));
  }
  try {
    const result = execFileSync(process.execPath, args, { encoding: 'utf8' });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, output: error.stdout || error.message };
  }
}

describe('Changelog Validation - Format Compliance', () => {
  test('should pass valid simple changelog', () => {
    const content = `# Changelog

All notable changes to this project are documented here.

## [1.0.0] - 2026-10-30

### Added
- Initial release

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'valid-simple.md'), content);
    const result = validateChangelog('valid-simple.md');
    expect(result.success).toBe(true);
  });

  test('should pass changelog with multiple versions', () => {
    const content = `# Changelog

## [2.0.0] - 2026-10-30

### Added
- New feature

---

## [1.0.0] - 2026-09-15

### Added
- Initial release

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'multi-version.md'), content);
    const result = validateChangelog('multi-version.md');
    expect(result.success).toBe(true);
  });

  test('should pass changelog with Unreleased section', () => {
    const content = `# Changelog

## [Unreleased]

### Added
- Work in progress

## [1.0.0] - 2026-09-15

### Added
- Initial release

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'unreleased.md'), content);
    const result = validateChangelog('unreleased.md');
    expect(result.success).toBe(true);
  });

  test('should pass with all category sections', () => {
    const content = `# Changelog

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

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'all-categories.md'), content);
    const result = validateChangelog('all-categories.md');
    expect(result.success).toBe(true);
  });

  test('should reject invalid version format (v prefix)', () => {
    const content = `# Changelog

## [v1.0.0] - 2026-10-30

### Added
- Feature

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'invalid-v-prefix.md'), content);
    const result = validateChangelog('invalid-v-prefix.md');
    expect(result.success).toBe(false);
    expect(result.output).toContain('Invalid version format');
  });

  test('should reject incomplete semver (missing patch)', () => {
    const content = `# Changelog

## [1.0] - 2026-10-30

### Added
- Feature

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'incomplete-semver.md'), content);
    const result = validateChangelog('incomplete-semver.md');
    expect(result.success).toBe(false);
  });

  test('should reject missing date on released version', () => {
    const content = `# Changelog

## [1.0.0]

### Added
- Feature

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'missing-date.md'), content);
    const result = validateChangelog('missing-date.md');
    expect(result.success).toBe(false);
    expect(result.output).toContain('missing date');
  });

  test('should reject invalid date format', () => {
    const content = `# Changelog

## [1.0.0] - 10/30/2026

### Added
- Feature

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'invalid-date-format.md'), content);
    const result = validateChangelog('invalid-date-format.md');
    expect(result.success).toBe(false);
  });

  test('should reject Unreleased with date', () => {
    const content = `# Changelog

## [Unreleased] - 2026-10-30

### Added
- Feature

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'unreleased-with-date.md'), content);
    const result = validateChangelog('unreleased-with-date.md');
    expect(result.success).toBe(false);
    expect(result.output).toContain('Unreleased');
  });

  test('should reject missing changelog title', () => {
    const content = `## [1.0.0] - 2026-10-30

### Added
- Feature

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'no-title.md'), content);
    const result = validateChangelog('no-title.md');
    expect(result.success).toBe(false);
    expect(result.output).toContain('Missing required "# Changelog" title');
  });

  test('should reject non-existent file', () => {
    const result = validateChangelog('does-not-exist.md');
    expect(result.success).toBe(false);
    expect(result.output).toContain('File not found');
  });
});

describe('Changelog Validation - Entry Format', () => {
  test('should pass properly formatted entries', () => {
    const content = `# Changelog

## [1.0.0] - 2026-10-30

### Added
- Added async support (#123)
- New configuration option (#124)

### Fixed
- Fixed memory leak (#125)

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'good-entries.md'), content);
    const result = validateChangelog('good-entries.md');
    expect(result.success).toBe(true);
  });

  test('should pass entries without PR numbers (not auto-checked)', () => {
    const content = `# Changelog

## [1.0.0] - 2026-10-30

### Added
- Added feature

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'no-pr-refs.md'), content);
    const result = validateChangelog('no-pr-refs.md');
    expect(result.success).toBe(true);
  });

  test('should handle entries with em-dashes', () => {
    const content = `# Changelog

## [1.0.0] - 2026-10-30

### Removed
- Deprecated oldAPI — use newAPI instead (#123)

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'em-dash-entries.md'), content);
    const result = validateChangelog('em-dash-entries.md');
    expect(result.success).toBe(true);
  });

  test('should handle breaking changes in entries', () => {
    const content = `# Changelog

## [2.0.0] - 2026-10-30

### Changed
- Breaking: Removed sync() method. Use async instead. (#120)

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'breaking-changes.md'), content);
    const result = validateChangelog('breaking-changes.md');
    expect(result.success).toBe(true);
  });
});

describe('Changelog Validation - Semantic Versioning', () => {
  test('should parse MAJOR versions correctly', () => {
    const content = `# Changelog

## [2.0.0] - 2026-10-30

### Changed
- Breaking change

## [1.0.0] - 2026-09-15

### Added
- Initial release

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'major-versions.md'), content);
    const result = validateChangelog('major-versions.md');
    expect(result.success).toBe(true);
  });

  test('should parse MINOR versions correctly', () => {
    const content = `# Changelog

## [1.2.0] - 2026-10-30

### Added
- New feature

## [1.1.0] - 2026-10-20

### Added
- Another feature

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'minor-versions.md'), content);
    const result = validateChangelog('minor-versions.md');
    expect(result.success).toBe(true);
  });

  test('should parse PATCH versions correctly', () => {
    const content = `# Changelog

## [1.0.1] - 2026-10-30

### Fixed
- Bug fix

## [1.0.0] - 2026-09-15

### Added
- Initial release

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'patch-versions.md'), content);
    const result = validateChangelog('patch-versions.md');
    expect(result.success).toBe(true);
  });

  test('should handle pre-release versions', () => {
    const content = `# Changelog

## [1.0.0-beta.1] - 2026-10-30

### Added
- Beta feature

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'prerelease-versions.md'), content);
    const result = validateChangelog('prerelease-versions.md');
    expect(result.success).toBe(true);
  });
});

describe('Changelog Validation - JSON Output', () => {
  test('should output JSON format with --json flag', () => {
    const content = `# Changelog

## [1.0.0] - 2026-10-30

### Added
- Feature

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'json-output.md'), content);
    const result = validateChangelog('json-output.md', '--json');
    expect(result.success).toBe(true);
    const json = JSON.parse(result.output);
    expect(json).toHaveProperty('valid');
    expect(json).toHaveProperty('errors');
    expect(json).toHaveProperty('warnings');
  });

  test('should report errors in JSON format', () => {
    const content = `# Changelog

## [invalid] - 2026-10-30

### Added
- Feature

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'json-errors.md'), content);
    const result = validateChangelog('json-errors.md', '--json');
    expect(result.success).toBe(false);
    const json = JSON.parse(result.output);
    expect(json.valid).toBe(false);
    expect(json.errors.length).toBeGreaterThan(0);
  });
});

describe('Changelog Validation - Edge Cases', () => {
  test('should handle empty sections', () => {
    const content = `# Changelog

## [1.0.0] - 2026-10-30

### Added

### Changed
- Update

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'empty-sections.md'), content);
    const result = validateChangelog('empty-sections.md');
    expect(result.success).toBe(true);
  });

  test('should handle multiple horizontal rules', () => {
    const content = `# Changelog

## [2.0.0] - 2026-10-30

### Added
- Feature

---

## [1.0.0] - 2026-09-15

### Added
- Initial

---

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'multiple-rules.md'), content);
    const result = validateChangelog('multiple-rules.md');
    expect(result.success).toBe(true);
  });

  test('should handle whitespace variations', () => {
    const content = `# Changelog

##  [1.0.0]   -   2026-10-30

### Added
-   Feature with extra spaces

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'whitespace.md'), content);
    const result = validateChangelog('whitespace.md');
    expect(result.success).toBe(true);
  });

  test('should handle very long changelog', () => {
    let content = '# Changelog\n\n';
    for (let i = 10; i >= 1; i--) {
      content += `## [${i}.0.0] - 2026-${String(i).padStart(2, '0')}-01\n\n### Added\n- Feature ${i}\n\n---\n\n`;
    }
    fs.writeFileSync(path.join(TEMP_DIR, 'long-changelog.md'), content);
    const result = validateChangelog('long-changelog.md');
    expect(result.success).toBe(true);
  });

  test('should handle a target path containing spaces', () => {
    const content = `# Changelog

## [1.0.0] - 2026-10-30

### Added
- Feature

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'path with spaces.md'), content);
    const result = validateChangelog('path with spaces.md');
    expect(result.success).toBe(true);
  });

  test('should handle special characters in entries', () => {
    const content = `# Changelog

## [1.0.0] - 2026-10-30

### Added
- Fixed regex pattern: /^test$/ (#123)
- Added JSON support: {"key": "value"} (#124)

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'special-chars.md'), content);
    const result = validateChangelog('special-chars.md');
    expect(result.success).toBe(true);
  });
});

describe('Changelog Validation - Real-world Scenarios', () => {
  test('should validate typical project changelog', () => {
    const content = `# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added
- New async support (#200)

### Fixed
- Memory leak fix (#201)

---

## [2.1.0] - 2026-10-15

### Added
- Support for custom middleware (#150)
- New configuration option (#151)

### Changed
- Improved error messages (#152)

### Fixed
- Fixed timeout issue (#153)

### Removed
- Deprecated sync mode — use async instead (#149)

### Security
- Patched XSS vulnerability (#154)

---

## [2.0.0] - 2026-09-15

### Added
- Major redesign with async/await
- New agent framework

### Removed
- Old callback-based API

---

## [1.0.0] - 2026-08-01

### Added
- Initial release

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'realistic.md'), content);
    const result = validateChangelog('realistic.md');
    expect(result.success).toBe(true);
  });

  test('should reject malformed realistic scenario', () => {
    const content = `# Changelog

## Unreleased

### Added
- Missing version brackets

## [1.0.0]

### Added
- Missing date

`;
    fs.writeFileSync(path.join(TEMP_DIR, 'malformed-realistic.md'), content);
    const result = validateChangelog('malformed-realistic.md');
    expect(result.success).toBe(false);
  });
});
