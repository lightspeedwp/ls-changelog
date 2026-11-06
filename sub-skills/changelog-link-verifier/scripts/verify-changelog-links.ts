#!/usr/bin/env node

/**
 * verify-changelog-links.ts
 *
 * Read-only check that every changelog entry has an adjacent pull request link
 * and issue link (Linear or GitHub), for example:
 *
 *   - Added gallery controls ([PR #123](https://github.com/org/repo/pull/123), [LS-4749](https://linear.app/org/issue/LS-4749))
 *
 * Only link presence and adjacency are checked. Links are never fetched.
 * The file is never written.
 *
 * Usage:
 *   node verify-changelog-links.ts CHANGELOG.md [--json] [--unreleased-only | --version X.Y.Z]
 *
 * Exit codes: 0 all entries pass, 1 at least one entry fails, 2 usage or read error.
 * Runs on Node.js 24 LTS (or 22.18+); older 22.x needs --experimental-strip-types.
 * Uses erasable TypeScript syntax only.
 */

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export type MissingKind = 'pr' | 'issue' | 'adjacent';

export interface EntryFailure {
  line: number;
  release: string;
  entry: string;
  missing: MissingKind[];
}

export interface VerifyOptions {
  unreleasedOnly?: boolean;
  version?: string;
}

export interface VerifyResult {
  releases: string[];
  checked: number;
  failures: EntryFailure[];
  passed: boolean;
}

interface FoundLink {
  kind: 'pr' | 'issue' | null;
  start: number;
  end: number;
}

const LINK_PATTERN = /\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const RELEASE_PATTERN = /^##\s+\[([^\]]+)\]/;
const ENTRY_PATTERN = /^ {0,3}[-*+]\s+(\S.*)$/;
const CONTINUATION_PATTERN = /^ {2,}\S/;
const SEPARATOR_ONLY = /^[\s,;&/]*$/;

/** Classify a Markdown link as a pull request link, an issue link, or neither. */
export function classifyLink(text: string, url: string): 'pr' | 'issue' | null {
  if (/\/pulls?\/\d+/.test(url)) {
    return 'pr';
  }
  if (
    /linear\.app\/[^/]+\/issue\/[A-Za-z][A-Za-z0-9]*-\d+/.test(url) ||
    /\/issues\/\d+/.test(url)
  ) {
    return 'issue';
  }
  if (/^(?:PR|Pull Request)\s*#?\d+$/i.test(text.trim())) {
    return 'pr';
  }
  if (/^[A-Z][A-Z0-9]*-\d+$/.test(text.trim()) || /^Issue\s*#?\d+$/i.test(text.trim())) {
    return 'issue';
  }
  return null;
}

function findLinks(entry: string): FoundLink[] {
  const found: FoundLink[] = [];
  for (const match of entry.matchAll(LINK_PATTERN)) {
    const start = match.index ?? 0;
    found.push({
      kind: classifyLink(match[1], match[2]),
      start,
      end: start + match[0].length
    });
  }
  return found;
}

function areAdjacent(entry: string, first: FoundLink, second: FoundLink): boolean {
  const [a, b] = first.start <= second.start ? [first, second] : [second, first];
  const between = entry.slice(a.end, b.start).replace(/\band\b/gi, '');
  return SEPARATOR_ONLY.test(between);
}

/** Which required links an entry is missing; an empty list means the entry passes. */
export function missingForEntry(entry: string): MissingKind[] {
  const links = findLinks(entry);
  const prs = links.filter((link) => link.kind === 'pr');
  const issues = links.filter((link) => link.kind === 'issue');
  const missing: MissingKind[] = [];
  if (prs.length === 0) {
    missing.push('pr');
  }
  if (issues.length === 0) {
    missing.push('issue');
  }
  if (missing.length === 0) {
    const adjacent = prs.some((pr) => issues.some((issue) => areAdjacent(entry, pr, issue)));
    if (!adjacent) {
      missing.push('adjacent');
    }
  }
  return missing;
}

function normaliseVersion(version: string): string {
  return version.trim().replace(/^v/i, '').toLowerCase();
}

/** Verify every entry in the changelog text. Throws if a requested release does not exist. */
export function verifyChangelog(content: string, options: VerifyOptions = {}): VerifyResult {
  const wanted = options.unreleasedOnly
    ? 'unreleased'
    : options.version
      ? normaliseVersion(options.version)
      : null;
  const releases: string[] = [];
  const failures: EntryFailure[] = [];
  let checked = 0;
  let currentRelease: string | null = null;
  let inFence = false;
  let pending: { line: number; release: string; text: string } | null = null;

  const flush = (): void => {
    if (!pending) {
      return;
    }
    checked += 1;
    const missing = missingForEntry(pending.text);
    if (missing.length > 0) {
      failures.push({ line: pending.line, release: pending.release, entry: pending.text, missing });
    }
    pending = null;
  };

  const lines = content.split(/\r?\n/);
  lines.forEach((rawLine, index) => {
    if (/^\s*(```|~~~)/.test(rawLine)) {
      flush();
      inFence = !inFence;
      return;
    }
    if (inFence) {
      return;
    }
    const releaseMatch = rawLine.match(RELEASE_PATTERN);
    if (releaseMatch) {
      flush();
      currentRelease = releaseMatch[1];
      releases.push(currentRelease);
      return;
    }
    if (currentRelease === null) {
      return;
    }
    if (wanted !== null && normaliseVersion(currentRelease) !== wanted) {
      return;
    }
    const entryMatch = rawLine.match(ENTRY_PATTERN);
    if (entryMatch) {
      flush();
      pending = { line: index + 1, release: currentRelease, text: entryMatch[1].trim() };
      return;
    }
    if (pending && CONTINUATION_PATTERN.test(rawLine)) {
      pending.text = `${pending.text} ${rawLine.trim()}`;
      return;
    }
    flush();
  });
  flush();

  if (wanted !== null && !releases.some((release) => normaliseVersion(release) === wanted)) {
    throw new Error(
      `Release [${options.unreleasedOnly ? 'Unreleased' : options.version}] not found in changelog`
    );
  }

  return { releases, checked, failures, passed: failures.length === 0 };
}

const MISSING_TEXT: Record<MissingKind, string> = {
  pr: 'missing PR link',
  issue: 'missing issue link',
  adjacent: 'PR link and issue link are not adjacent'
};

export function formatReport(result: VerifyResult, file: string): string {
  if (result.passed) {
    return `✓ All ${result.checked} entries have an adjacent PR link and issue link (${file})`;
  }
  const out = [
    `✗ ${result.failures.length} of ${result.checked} entries fail link verification (${file})`
  ];
  for (const failure of result.failures) {
    const reasons = failure.missing.map((kind) => MISSING_TEXT[kind]).join(', ');
    out.push(`  line ${failure.line} [${failure.release}]: ${reasons} - "${failure.entry}"`);
  }
  return out.join('\n');
}

export interface Io {
  log: (message: string) => void;
  error: (message: string) => void;
}

const USAGE =
  'Usage: node verify-changelog-links.ts CHANGELOG.md [--json] [--unreleased-only | --version X.Y.Z]';

/** Run the CLI. Returns the process exit code. */
export function main(argv: string[], io: Io): number {
  const options: VerifyOptions = {};
  let json = false;
  let file: string | null = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') {
      json = true;
    } else if (arg === '--unreleased-only') {
      options.unreleasedOnly = true;
    } else if (arg === '--version') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        io.error(`--version needs a value\n${USAGE}`);
        return 2;
      }
      options.version = value;
      i += 1;
    } else if (arg.startsWith('--')) {
      io.error(`Unknown option: ${arg}\n${USAGE}`);
      return 2;
    } else if (file === null) {
      file = arg;
    } else {
      io.error(`Unexpected argument: ${arg}\n${USAGE}`);
      return 2;
    }
  }

  if (file === null) {
    io.error(USAGE);
    return 2;
  }
  if (options.unreleasedOnly && options.version) {
    io.error(`Use either --unreleased-only or --version, not both\n${USAGE}`);
    return 2;
  }

  let content: string;
  try {
    content = readFileSync(file, 'utf8');
  } catch (err) {
    io.error(`Cannot read ${file}: ${(err as Error).message}`);
    return 2;
  }

  let result: VerifyResult;
  try {
    result = verifyChangelog(content, options);
  } catch (err) {
    io.error((err as Error).message);
    return 2;
  }
  if (result.releases.length === 0) {
    io.error(`No release sections (## [version]) found in ${file}`);
    return 2;
  }

  io.log(json ? JSON.stringify({ file, ...result }, null, 2) : formatReport(result, file));
  return result.passed ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Set the exit code instead of calling process.exit() so large output piped to another process is not cut off.
  process.exitCode = main(process.argv.slice(2), { log: console.log, error: console.error });
}
