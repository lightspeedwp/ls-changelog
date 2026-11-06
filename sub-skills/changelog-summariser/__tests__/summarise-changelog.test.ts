import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import {
  extractLinks,
  main,
  parseChangelog,
  renderNotes,
  renderSummary,
  selectRelease,
  summarise
} from '../scripts/summarise-changelog.ts';

const pr = (n: number) => `[PR #${n}](https://github.com/o/r/pull/${n})`;
const issue = (n: number) => `[LS-${n}](https://linear.app/o/issue/LS-${n}/slug)`;

const CHANGELOG = [
  '# Changelog',
  '',
  'Intro text that is not an entry.',
  '',
  '## [Unreleased]',
  '',
  '### Added',
  `- Added unreleased thing (${pr(9)}, ${issue(9)})`,
  '',
  '## [3.0.0] - 2026-03-01',
  '',
  '### Added',
  `- Added three (${pr(7)}, ${issue(7)})`,
  `- Added three b (${pr(8)}, ${issue(8)})`,
  '',
  '### Fixed',
  `- Fixed three (${pr(6)}, ${issue(6)})`,
  '',
  '## [2.0.0] - 2026-02-01',
  '',
  '### Added',
  `- Added two (${pr(4)}, ${issue(4)})`,
  '- Added two without links',
  '',
  '### Changed',
  `- Changed two (${pr(5)}, ${issue(5)})`,
  '',
  '## [1.0.0] - 2026-01-01',
  '',
  '### Added',
  `- Added one (${pr(1)}, ${issue(1)})`,
  `- Added one b (${pr(1)}, ${issue(2)})`,
  '',
  '### Security',
  `- Secured one (${pr(3)}, ${issue(3)})`,
  ''
].join('\n');

function run(argv: string[]) {
  const logs: string[] = [];
  const errors: string[] = [];
  const code = main(argv, { log: (m) => logs.push(m), error: (m) => errors.push(m) });
  return { code, logs, errors };
}

let dir: string;
beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'changelog summary '));
});
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});
function write(name: string, content: string): string {
  const path = join(dir, name);
  writeFileSync(path, content);
  return path;
}

describe('extractLinks', () => {
  test('finds and classifies links', () => {
    const links = extractLinks(`Text (${pr(1)}, ${issue(2)}, [docs](https://example.com))`);
    expect(links.map((l) => l.kind)).toEqual(['pr', 'issue', null]);
    expect(links[0].url).toBe('https://github.com/o/r/pull/1');
  });
});

describe('parseChangelog', () => {
  test('parses releases, dates, categories and entries', () => {
    const releases = parseChangelog(CHANGELOG);
    expect(releases.map((r) => [r.version, r.date])).toEqual([
      ['Unreleased', null],
      ['3.0.0', '2026-03-01'],
      ['2.0.0', '2026-02-01'],
      ['1.0.0', '2026-01-01']
    ]);
    expect(Object.keys(releases[1].categories)).toEqual(['Added', 'Fixed']);
    expect(releases[1].categories.Added).toHaveLength(2);
  });

  test('puts entries before any category under Other', () => {
    const releases = parseChangelog('## [1.0.0] - 2026-01-01\n- Loose entry\n');
    expect(releases[0].categories.Other[0].text).toBe('Loose entry');
  });

  test('joins wrapped lines, ignores code fences, text before releases and non-entry lines', () => {
    const content = [
      '- stray before release',
      '## [1.0.0]',
      '### Added',
      '- Wrapped entry',
      '  continues here',
      'plain paragraph',
      '```',
      '- not an entry',
      '```',
      '* Star bullet',
      ''
    ].join('\n');
    const [release] = parseChangelog(content);
    expect(release.categories.Added.map((e) => e.text)).toEqual([
      'Wrapped entry continues here',
      'Star bullet'
    ]);
  });

  test('handles CRLF and an empty file', () => {
    expect(parseChangelog(CHANGELOG.replace(/\n/g, '\r\n'))).toHaveLength(4);
    expect(parseChangelog('')).toEqual([]);
  });
});

describe('summarise', () => {
  const releases = parseChangelog(CHANGELOG);

  test('keeps Unreleased and the latest releases in full and collapses older ones', () => {
    const result = summarise(releases, { keepLatest: 1 });
    expect(result.map((r) => [r.version, r.detail])).toEqual([
      ['Unreleased', 'full'],
      ['3.0.0', 'full'],
      ['2.0.0', 'collapsed'],
      ['1.0.0', 'collapsed']
    ]);
  });

  test('defaults to keeping the latest three releases in full', () => {
    expect(summarise(releases).map((r) => r.detail)).toEqual(['full', 'full', 'full', 'full']);
    expect(summarise(releases, { keepLatest: 0 }).map((r) => r.detail)).toEqual([
      'full',
      'collapsed',
      'collapsed',
      'collapsed'
    ]);
  });

  test('collapsed releases carry counts, deduplicated links and unlinked entry counts', () => {
    const [, , two, one] = summarise(releases, { keepLatest: 1 });
    expect(two.entryCount).toBe(3);
    expect(two.counts).toEqual({ Added: 2, Changed: 1 });
    expect(two.entriesWithoutLinks).toBe(1);
    expect(two.entries).toBeUndefined();
    expect(one.prLinks.map((l) => l.label)).toEqual(['PR #1', 'PR #3']);
    expect(one.issueLinks.map((l) => l.label)).toEqual(['LS-1', 'LS-2', 'LS-3']);
  });
});

describe('renderSummary', () => {
  test('renders full and collapsed releases without losing any PR or issue link', () => {
    const releases = parseChangelog(CHANGELOG);
    const text = renderSummary(summarise(releases, { keepLatest: 0 }), 'CHANGELOG.md');
    expect(text).toContain('# Changelog summary');
    expect(text).toContain('4 releases, 10 entries');
    expect(text).toContain('not a release publication');
    expect(text).toContain('## [2.0.0] - 2026-02-01 (collapsed, 3 entries)');
    expect(text).toContain('- Changes: Added 2, Changed 1');
    expect(text).toContain('- 1 entry has no PR or issue link');
    expect(text).toContain('- Added unreleased thing');
    const sourceUrls = releases
      .flatMap((r) => Object.values(r.categories).flat())
      .flatMap((e) => e.links.filter((l) => l.kind !== null).map((l) => l.url));
    expect(sourceUrls.length).toBeGreaterThan(0);
    for (const url of sourceUrls) {
      expect(text).toContain(url);
    }
  });

  test('handles collapsed releases that have no categories or links', () => {
    const empty = parseChangelog('## [Unreleased]\n\n## [1.0.0] - 2026-01-01\n');
    const text = renderSummary(summarise(empty, { keepLatest: 0 }), 'C.md');
    expect(text).toContain('## [1.0.0] - 2026-01-01 (collapsed, 0 entries)');
    expect(text).toContain('- Changes: none');
    expect(text).not.toContain('Pull requests');
  });

  test('omits the date for releases without one', () => {
    const text = renderSummary(
      summarise(parseChangelog('## [Unreleased]\n### Added\n- A\n')),
      'C.md'
    );
    expect(text).toContain('## [Unreleased]\n');
  });
});

describe('release notes', () => {
  const releases = parseChangelog(CHANGELOG);

  test('selects releases case-insensitively and ignores a leading v', () => {
    expect(selectRelease(releases, 'v3.0.0').version).toBe('3.0.0');
    expect(selectRelease(releases, 'unreleased').version).toBe('Unreleased');
    expect(() => selectRelease(releases, '9.9.9')).toThrow('not found');
  });

  test('renders entries and links verbatim by category', () => {
    const text = renderNotes(selectRelease(releases, '3.0.0'));
    expect(text).toContain('# Release notes: [3.0.0] - 2026-03-01');
    expect(text).toContain('## Added');
    expect(text).toContain(`- Added three (${pr(7)}, ${issue(7)})`);
    expect(text).toContain('## Fixed');
  });

  test('says when a release has no entries', () => {
    const [empty] = parseChangelog('## [1.0.0] - 2026-01-01\n');
    expect(renderNotes(empty)).toContain('No entries.');
  });
});

describe('main (in-process)', () => {
  test('prints a summary by default and with --keep-latest', () => {
    const file = write('c.md', CHANGELOG);
    const all = run([file]);
    expect(all.code).toBe(0);
    expect(all.logs[0]).toContain('# Changelog summary');
    const condensed = run([file, '--keep-latest', '1']);
    expect(condensed.logs[0]).toContain('(collapsed');
  });

  test('prints release notes with --notes', () => {
    const file = write('notes.md', CHANGELOG);
    const result = run([file, '--notes', '2.0.0']);
    expect(result.code).toBe(0);
    expect(result.logs[0]).toContain('# Release notes: [2.0.0] - 2026-02-01');
  });

  test('prints parseable JSON for both modes', () => {
    const file = write('json.md', CHANGELOG);
    const summary = JSON.parse(run([file, '--json', '--keep-latest', '1']).logs[0]);
    expect(summary.mode).toBe('summary');
    expect(summary.releases[2].detail).toBe('collapsed');
    const notes = JSON.parse(run([file, '--json', '--notes', '3.0.0']).logs[0]);
    expect(notes.mode).toBe('notes');
    expect(notes.entryCount).toBe(3);
  });

  test('exits 2 for usage, read and lookup errors', () => {
    const file = write('usage.md', CHANGELOG);
    expect(run([]).code).toBe(2);
    expect(run([file, '--bogus']).code).toBe(2);
    expect(run([file, 'extra']).code).toBe(2);
    expect(run([file, '--notes']).code).toBe(2);
    expect(run([file, '--notes', '--json']).code).toBe(2);
    expect(run([file, '--keep-latest', 'two']).code).toBe(2);
    expect(run([file, '--notes', '1.0.0', '--keep-latest', '1']).code).toBe(2);
    expect(run([file, '--notes', '9.9.9']).code).toBe(2);
    expect(run([join(dir, 'missing.md')]).code).toBe(2);
    expect(run([write('none.md', '# Changelog\n\nNothing.\n')]).code).toBe(2);
  });

  test('leaves the changelog unchanged', () => {
    const file = write('bytes.md', CHANGELOG);
    const before = createHash('sha256').update(readFileSync(file)).digest('hex');
    run([file]);
    run([file, '--notes', '1.0.0', '--json']);
    expect(createHash('sha256').update(readFileSync(file)).digest('hex')).toBe(before);
  });
});

describe('CLI process', () => {
  const script = fileURLToPath(new URL('../scripts/summarise-changelog.ts', import.meta.url));
  const node = ['--experimental-strip-types', '--no-warnings', script];

  test('summarises a changelog at a path containing spaces', () => {
    const file = write('spaced name.md', CHANGELOG);
    const out = execFileSync(process.execPath, [...node, file, '--keep-latest', '1'], {
      encoding: 'utf8'
    });
    expect(out).toContain('(collapsed, 3 entries)');
  });

  test('does not truncate large output written to a pipe', () => {
    const lines = ['# Changelog', ''];
    for (let v = 400; v >= 1; v -= 1) {
      lines.push(`## [${v}.0.0] - 2026-01-01`, '', '### Added');
      for (let e = 0; e < 5; e += 1) {
        const n = v * 10 + e;
        lines.push(
          `- Entry ${n} ([PR #${n}](https://github.com/o/r/pull/${n}), [LS-${n}](https://linear.app/o/issue/LS-${n}/x))`
        );
      }
      lines.push('');
    }
    const file = write('large.md', lines.join('\n'));
    const result = spawnSync(process.execPath, [...node, file, '--keep-latest', '0'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024
    });
    expect(result.status).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(100000);
    expect(result.stdout).toContain('https://github.com/o/r/pull/4004');
    expect(result.stdout).toContain('https://github.com/o/r/pull/10');
    expect(
      result.stdout.trimEnd().endsWith('no PR or issue link') ||
        result.stdout.includes('## [1.0.0]')
    ).toBe(true);
  });

  test('exits 2 with usage when no file is given', () => {
    const result = spawnSync(process.execPath, node, { encoding: 'utf8' });
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('Usage:');
  });
});
