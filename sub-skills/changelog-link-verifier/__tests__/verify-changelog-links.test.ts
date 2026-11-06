import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import {
  classifyLink,
  formatReport,
  main,
  missingForEntry,
  verifyChangelog
} from '../scripts/verify-changelog-links.ts';

const PR = '[PR #123](https://github.com/lightspeedwp/ls-wp-changelog/pull/123)';
const ISSUE = '[LS-4749](https://linear.app/lightspeedwp/issue/LS-4749/epic-example)';
const GH_ISSUE = '[#45](https://github.com/lightspeedwp/ls-wp-changelog/issues/45)';

function changelog(entries: string[], heading = '## [Unreleased]'): string {
  return `# Changelog\n\nIntro text.\n\n${heading}\n\n### Added\n${entries.join('\n')}\n`;
}

function run(argv: string[]) {
  const logs: string[] = [];
  const errors: string[] = [];
  const code = main(argv, { log: (m) => logs.push(m), error: (m) => errors.push(m) });
  return { code, logs, errors };
}

let dir: string;
beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'changelog-links '));
});
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

function write(name: string, content: string): string {
  const path = join(dir, name);
  writeFileSync(path, content);
  return path;
}

describe('classifyLink', () => {
  test.each([
    ['PR #1', 'https://github.com/o/r/pull/1', 'pr'],
    ['#1', 'https://github.com/o/r/pull/1', 'pr'],
    ['PR #2', 'https://example.com/x', 'pr'],
    ['Pull Request 3', 'https://example.com/x', 'pr'],
    ['LS-4749', 'https://linear.app/org/issue/LS-4749/slug', 'issue'],
    ['LS-4749', 'https://example.com/x', 'issue'],
    ['#45', 'https://github.com/o/r/issues/45', 'issue'],
    ['Issue #7', 'https://example.com/x', 'issue'],
    ['docs', 'https://example.com/docs', null],
    ['#9', 'https://example.com/x', null]
  ])('%s -> %s', (text, url, expected) => {
    expect(classifyLink(text, url)).toBe(expected);
  });
});

describe('missingForEntry', () => {
  test('passes with adjacent PR and Linear issue links', () => {
    expect(missingForEntry(`Added gallery controls (${PR}, ${ISSUE})`)).toEqual([]);
  });

  test('passes with a GitHub issue link and links in either order', () => {
    expect(missingForEntry(`Added thing (${GH_ISSUE}, ${PR})`)).toEqual([]);
    expect(missingForEntry(`Added thing (${PR} and ${ISSUE})`)).toEqual([]);
    expect(missingForEntry(`Added thing (${PR}; ${ISSUE})`)).toEqual([]);
  });

  test('reports a missing issue link', () => {
    expect(missingForEntry(`Added thing (${PR})`)).toEqual(['issue']);
  });

  test('reports a missing PR link', () => {
    expect(missingForEntry(`Added thing (${ISSUE})`)).toEqual(['pr']);
  });

  test('reports both missing', () => {
    expect(missingForEntry('Added thing')).toEqual(['pr', 'issue']);
    expect(missingForEntry('Added thing (#123)')).toEqual(['pr', 'issue']);
  });

  test('reports links that are present but not adjacent', () => {
    expect(missingForEntry(`Added ${PR} with extra words ${ISSUE}`)).toEqual(['adjacent']);
  });

  test('ignores links that are neither PR nor issue links', () => {
    expect(missingForEntry('Added [docs](https://example.com/docs)')).toEqual(['pr', 'issue']);
  });
});

describe('verifyChangelog', () => {
  test('passes when every entry has both links', () => {
    const result = verifyChangelog(
      changelog([`- Added a (${PR}, ${ISSUE})`, `* Added b (${GH_ISSUE}, ${PR})`])
    );
    expect(result.passed).toBe(true);
    expect(result.checked).toBe(2);
    expect(result.failures).toEqual([]);
  });

  test('reports every failing entry with its line number and release', () => {
    const content = changelog([
      `- Added ok (${PR}, ${ISSUE})`,
      `- Missing issue (${PR})`,
      `- Missing PR (${ISSUE})`,
      '- Missing both',
      `- Not adjacent ${PR} some words ${ISSUE}`
    ]);
    const result = verifyChangelog(content);
    expect(result.passed).toBe(false);
    expect(result.checked).toBe(5);
    expect(result.failures.map((f) => [f.line, f.missing])).toEqual([
      [9, ['issue']],
      [10, ['pr']],
      [11, ['pr', 'issue']],
      [12, ['adjacent']]
    ]);
    expect(result.failures[0].release).toBe('Unreleased');
  });

  test('joins wrapped continuation lines into one entry', () => {
    const content = `# Changelog\n\n## [1.0.0] - 2026-01-01\n\n- Added a long entry\n  that wraps (${PR}, ${ISSUE})\n`;
    const result = verifyChangelog(content);
    expect(result.checked).toBe(1);
    expect(result.passed).toBe(true);
  });

  test('ignores text outside releases and inside code fences', () => {
    const content = [
      '# Changelog',
      '',
      '- A list item before any release',
      '',
      '## [Unreleased]',
      '',
      '```md',
      '- Not an entry',
      '```',
      '',
      `- Real entry (${PR}, ${ISSUE})`,
      ''
    ].join('\n');
    const result = verifyChangelog(content);
    expect(result.checked).toBe(1);
    expect(result.passed).toBe(true);
  });

  test('handles CRLF line endings', () => {
    const content = changelog([`- Added a (${PR}, ${ISSUE})`]).replace(/\n/g, '\r\n');
    expect(verifyChangelog(content).passed).toBe(true);
  });

  test('checks released sections by default and can limit to Unreleased or a version', () => {
    const content = [
      '# Changelog',
      '',
      '## [Unreleased]',
      `- New (${PR}, ${ISSUE})`,
      '',
      '## [1.0.0] - 2026-01-01',
      '- Old entry without links',
      ''
    ].join('\n');
    expect(verifyChangelog(content).passed).toBe(false);
    expect(verifyChangelog(content, { unreleasedOnly: true }).passed).toBe(true);
    expect(verifyChangelog(content, { version: '1.0.0' }).failures).toHaveLength(1);
    expect(verifyChangelog(content, { version: 'v1.0.0' }).checked).toBe(1);
  });

  test('passes an empty Unreleased section with zero entries', () => {
    const result = verifyChangelog('# Changelog\n\n## [Unreleased]\n');
    expect(result).toMatchObject({ checked: 0, passed: true });
  });

  test('throws when the requested release does not exist', () => {
    expect(() =>
      verifyChangelog('# Changelog\n\n## [1.0.0] - 2026-01-01\n', { version: '2.0.0' })
    ).toThrow('not found');
    expect(() =>
      verifyChangelog('# Changelog\n\n## [1.0.0] - 2026-01-01\n', { unreleasedOnly: true })
    ).toThrow('[Unreleased] not found');
  });
});

describe('formatReport', () => {
  test('summarises passing and failing results', () => {
    const pass = verifyChangelog(changelog([`- A (${PR}, ${ISSUE})`]));
    expect(formatReport(pass, 'C.md')).toBe(
      '✓ All 1 entries have an adjacent PR link and issue link (C.md)'
    );
    const fail = verifyChangelog(changelog(['- A', `- B ${PR} x ${ISSUE}`, `- C (${PR})`]));
    const text = formatReport(fail, 'C.md');
    expect(text).toContain('✗ 3 of 3 entries fail link verification (C.md)');
    expect(text).toContain('missing PR link, missing issue link - "A"');
    expect(text).toContain('PR link and issue link are not adjacent');
    expect(text).toContain('missing issue link');
  });
});

describe('main (in-process)', () => {
  test('exits 0 and prints a passing report', () => {
    const file = write('good.md', changelog([`- A (${PR}, ${ISSUE})`]));
    const { code, logs } = run([file]);
    expect(code).toBe(0);
    expect(logs[0]).toContain('✓ All 1 entries');
  });

  test('exits 1 and reports each failing entry', () => {
    const file = write('bad.md', changelog(['- A', `- B (${PR})`]));
    const { code, logs } = run([file]);
    expect(code).toBe(1);
    expect(logs[0]).toContain('2 of 2 entries fail');
  });

  test('prints parseable JSON with --json', () => {
    const file = write('json.md', changelog(['- A']));
    const { code, logs } = run([file, '--json']);
    expect(code).toBe(1);
    const parsed = JSON.parse(logs[0]);
    expect(parsed.passed).toBe(false);
    expect(parsed.failures[0].missing).toEqual(['pr', 'issue']);
  });

  test('supports --unreleased-only and --version', () => {
    const file = write(
      'scoped.md',
      `# Changelog\n\n## [Unreleased]\n- A (${PR}, ${ISSUE})\n\n## [1.0.0] - 2026-01-01\n- Old\n`
    );
    expect(run([file, '--unreleased-only']).code).toBe(0);
    expect(run([file, '--version', '1.0.0']).code).toBe(1);
  });

  test('exits 2 for usage and read errors', () => {
    const file = write('usage.md', changelog([`- A (${PR}, ${ISSUE})`]));
    expect(run([]).code).toBe(2);
    expect(run([file, '--bogus']).code).toBe(2);
    expect(run([file, 'extra']).code).toBe(2);
    expect(run([file, '--version']).code).toBe(2);
    expect(run([file, '--version', '--json']).code).toBe(2);
    expect(run([file, '--unreleased-only', '--version', '1.0.0']).code).toBe(2);
    expect(run([join(dir, 'missing.md')]).code).toBe(2);
    expect(run([file, '--version', '9.9.9']).code).toBe(2);
    const noReleases = write('none.md', '# Changelog\n\nNothing here.\n');
    expect(run([noReleases]).code).toBe(2);
  });

  test('leaves the input file unchanged', () => {
    const file = write('bytes.md', changelog(['- A', `- B (${PR}, ${ISSUE})`]));
    const before = createHash('sha256').update(readFileSync(file)).digest('hex');
    run([file]);
    run([file, '--json']);
    const after = createHash('sha256').update(readFileSync(file)).digest('hex');
    expect(after).toBe(before);
  });
});

describe('CLI process', () => {
  const script = fileURLToPath(new URL('../scripts/verify-changelog-links.ts', import.meta.url));
  const node = ['--experimental-strip-types', '--no-warnings', script];

  test('exits 0 for a passing changelog at a path containing spaces', () => {
    const file = write('spaced name.md', changelog([`- A (${PR}, ${ISSUE})`]));
    const out = execFileSync(process.execPath, [...node, file], { encoding: 'utf8' });
    expect(out).toContain('✓ All 1 entries');
  });

  test('exits non-zero with diagnostics when an entry fails', () => {
    const file = write('cli-bad.md', changelog(['- Missing both']));
    const result = spawnSync(process.execPath, [...node, file], { encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('line 8 [Unreleased]: missing PR link, missing issue link');
  });

  test('exits 2 when no file is given', () => {
    const result = spawnSync(process.execPath, node, { encoding: 'utf8' });
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('Usage:');
  });
});
