/**
 * In-process tests for the root validator (scripts/validate-changelog.cjs).
 *
 * The CLI tests in validate-changelog.test.js run the script in a child process,
 * which V8 coverage cannot instrument. These tests load the class directly so
 * the real production code is measured, and they mirror the CLI contract.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { ChangelogValidator } = require('../validate-changelog.cjs');

let tempDir;

beforeAll(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'root-validator-'));
});

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

function write(name, content) {
  const file = path.join(tempDir, name);
  fs.writeFileSync(file, content);
  return file;
}

function run(content, options) {
  const file = write(`case-${Math.random().toString(36).slice(2)}.md`, content);
  const validator = new ChangelogValidator(file, options);
  const valid = validator.validate();
  return { validator, valid };
}

const VALID = `# Changelog

## [1.0.0] - 2026-10-30

### Added
- Initial release
`;

describe('ChangelogValidator (in-process)', () => {
  describe('valid changelogs', () => {
    test('accepts a simple changelog and reports a pass', () => {
      const { validator, valid } = run(VALID);
      expect(valid).toBe(true);
      expect(validator.errors).toEqual([]);
      expect(validator.report()).toContain('✓ Changelog validation passed');
    });

    test('accepts Unreleased, prerelease and multiple versions', () => {
      const content = `# Changelog

## [Unreleased]

### Added
- Work in progress

## [2.0.0-beta.1] - 2026-10-30

### Changed
- Beta change

## [1.0.0] - 2026-09-01

### Fixed
- Fix
`;
      expect(run(content).valid).toBe(true);
    });

    test('parses all six categories and entries', () => {
      const validator = new ChangelogValidator('unused.md');
      const releases = validator.parseChangelog(`# Changelog

## [1.0.0] - 2026-10-30

### Added
- a
### Changed
- b
### Deprecated
- c
### Removed
- d
### Fixed
- e
### Security
- f
`);
      expect(Object.keys(releases[0].sections)).toEqual([
        'Added',
        'Changed',
        'Deprecated',
        'Removed',
        'Fixed',
        'Security'
      ]);
      expect(releases[0].sections.Security).toEqual(['f']);
    });

    test('ignores entries that appear before any category or release', () => {
      const validator = new ChangelogValidator('unused.md');
      const releases = validator.parseChangelog(`# Changelog

- stray entry

## [1.0.0] - 2026-10-30

- entry without a category

### Added
- real entry
`);
      expect(releases).toHaveLength(1);
      expect(releases[0].sections.Added).toEqual(['real entry']);
    });
  });

  describe('invalid changelogs', () => {
    test('rejects a missing # Changelog title', () => {
      const { validator, valid } = run('## [1.0.0] - 2026-10-30\n\n### Added\n- Feature\n');
      expect(valid).toBe(false);
      expect(validator.errors).toContain('Missing required "# Changelog" title');
    });

    test('accepts a title preceded by a byte order mark', () => {
      expect(run(`${String.fromCharCode(0xfeff)}${VALID}`).valid).toBe(true);
    });

    test('rejects a file with no release headings', () => {
      const { validator, valid } = run('# Changelog\n\nNothing here.\n');
      expect(valid).toBe(false);
      expect(validator.errors).toContain('Changelog does not parse or has no releases array');
    });

    test('rejects an invalid version format', () => {
      const { validator, valid } = run(
        '# Changelog\n\n## [v1.0.0] - 2026-10-30\n\n### Added\n- x\n'
      );
      expect(valid).toBe(false);
      expect(validator.errors[0]).toContain('Invalid version format');
    });

    test('rejects a released version without a date', () => {
      const { validator, valid } = run('# Changelog\n\n## [1.0.0]\n\n### Added\n- x\n');
      expect(valid).toBe(false);
      expect(validator.errors).toContain('Version [1.0.0] missing date (expected: YYYY-MM-DD)');
    });

    test('rejects a date that is not in YYYY-MM-DD form', () => {
      const validator = new ChangelogValidator('unused.md');
      validator.validateRelease({ version: '1.0.0', date: '2026-1-1', sections: { Added: ['x'] } });
      expect(validator.errors[0]).toContain('invalid date format');
    });

    test('rejects a dated Unreleased section', () => {
      const { validator, valid } = run(
        '# Changelog\n\n## [Unreleased] - 2026-10-30\n\n### Added\n- x\n'
      );
      expect(valid).toBe(false);
      expect(validator.errors).toContain('[Unreleased] must not have a date');
    });

    test('rejects a missing file', () => {
      const validator = new ChangelogValidator(path.join(tempDir, 'does-not-exist.md'));
      expect(validator.validate()).toBe(false);
      expect(validator.errors[0]).toContain('File not found');
    });

    test('reports a read error when the path is a directory', () => {
      const validator = new ChangelogValidator(tempDir);
      expect(validator.validate()).toBe(false);
      expect(validator.errors[0]).toContain('Error reading file');
    });

    test('returns null when parsing throws', () => {
      const validator = new ChangelogValidator('unused.md');
      expect(validator.parseChangelog(undefined)).toBeNull();
    });
  });

  describe('warnings', () => {
    test('warns about a released version with no entries but still passes', () => {
      const { validator, valid } = run('# Changelog\n\n## [1.0.0] - 2026-10-30\n');
      expect(valid).toBe(true);
      expect(validator.warnings).toEqual(['Version [1.0.0] has no entries']);
      expect(validator.report()).toContain('Warnings:');
    });

    test('does not warn about an empty Unreleased section', () => {
      const { validator } = run('# Changelog\n\n## [Unreleased]\n');
      expect(validator.warnings).toEqual([]);
    });
  });

  describe('reports', () => {
    test('text report lists errors and warnings', () => {
      const { validator } = run('# Changelog\n\n## [1.0]\n');
      const text = validator.report();
      expect(text).toContain('✗ Validation failed');
      expect(text).toContain('Errors:');
      expect(text).toContain('Invalid version format');
    });

    test('JSON report has valid, errors and warnings', () => {
      const { validator } = run(VALID, { json: true });
      expect(JSON.parse(validator.report())).toEqual({ valid: true, errors: [], warnings: [] });
      const failing = run('# Changelog\n\n## [x]\n', { json: true });
      const parsed = JSON.parse(failing.validator.report());
      expect(parsed.valid).toBe(false);
      expect(parsed.errors.length).toBeGreaterThan(0);
    });

    test('defaults the verbose and json options to false', () => {
      const validator = new ChangelogValidator('unused.md');
      expect(validator.verbose).toBe(false);
      expect(validator.json).toBe(false);
      expect(new ChangelogValidator('unused.md', { verbose: true }).verbose).toBe(true);
    });
  });

  test('leaves the validated file unchanged', () => {
    const file = write('bytes.md', VALID);
    const before = fs.readFileSync(file);
    new ChangelogValidator(file).validate();
    expect(fs.readFileSync(file).equals(before)).toBe(true);
  });
});
