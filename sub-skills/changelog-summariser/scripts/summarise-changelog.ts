#!/usr/bin/env node

/**
 * summarise-changelog.ts
 *
 * Read-only condensing of a large CHANGELOG.md. Two outputs, both printed to
 * standard output (the changelog is never written and nothing is published):
 *
 *   summary (default)  Recent releases in full, older releases collapsed to
 *                      category counts plus every PR and issue link they contain.
 *   --notes VERSION    Release notes for one release, entries and links verbatim.
 *
 * Usage:
 *   node summarise-changelog.ts CHANGELOG.md [--keep-latest N] [--json]
 *   node summarise-changelog.ts CHANGELOG.md --notes X.Y.Z|unreleased [--json]
 *
 * Exit codes: 0 success, 2 usage error, unreadable file, no releases or unknown release.
 * Runs on Node.js 24 LTS (or 22.18+); older 22.x needs --experimental-strip-types.
 * Uses erasable TypeScript syntax only.
 */

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { classifyLink } from '../../changelog-link-verifier/scripts/verify-changelog-links.ts';

export interface EntryLink {
  label: string;
  url: string;
  kind: 'pr' | 'issue' | null;
}

export interface Entry {
  text: string;
  links: EntryLink[];
}

export interface Release {
  version: string;
  date: string | null;
  categories: Record<string, Entry[]>;
}

export interface SummaryRelease {
  version: string;
  date: string | null;
  detail: 'full' | 'collapsed';
  entryCount: number;
  counts: Record<string, number>;
  entries?: Record<string, Entry[]>;
  prLinks: EntryLink[];
  issueLinks: EntryLink[];
  entriesWithoutLinks: number;
}

export interface SummaryOptions {
  keepLatest?: number;
}

const LINK_PATTERN = /\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const RELEASE_PATTERN = /^##\s+\[([^\]]+)\](?:\s+-\s+(\S+))?/;
const CATEGORY_PATTERN = /^###\s+(.+?)\s*$/;
const ENTRY_PATTERN = /^ {0,3}[-*+]\s+(\S.*)$/;
const CONTINUATION_PATTERN = /^ {2,}\S/;
const UNCATEGORISED = 'Other';

export function extractLinks(text: string): EntryLink[] {
  const links: EntryLink[] = [];
  for (const match of text.matchAll(LINK_PATTERN)) {
    links.push({ label: match[1], url: match[2], kind: classifyLink(match[1], match[2]) });
  }
  return links;
}

/** Parse the changelog into releases, categories and entries. Code fences are ignored. */
export function parseChangelog(content: string): Release[] {
  const releases: Release[] = [];
  let release: Release | null = null;
  let category = UNCATEGORISED;
  let inFence = false;
  let pending: string | null = null;

  const flush = (): void => {
    if (pending !== null && release !== null) {
      const text: string = pending;
      (release.categories[category] ??= []).push({ text, links: extractLinks(text) });
    }
    pending = null;
  };

  for (const rawLine of content.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(rawLine)) {
      flush();
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }
    const releaseMatch = rawLine.match(RELEASE_PATTERN);
    if (releaseMatch) {
      flush();
      release = { version: releaseMatch[1], date: releaseMatch[2] ?? null, categories: {} };
      releases.push(release);
      category = UNCATEGORISED;
      continue;
    }
    if (release === null) {
      continue;
    }
    const categoryMatch = rawLine.match(CATEGORY_PATTERN);
    if (categoryMatch) {
      flush();
      category = categoryMatch[1];
      continue;
    }
    const entryMatch = rawLine.match(ENTRY_PATTERN);
    if (entryMatch) {
      flush();
      pending = entryMatch[1].trim();
      continue;
    }
    if (pending !== null && CONTINUATION_PATTERN.test(rawLine)) {
      pending = `${pending} ${rawLine.trim()}`;
      continue;
    }
    flush();
  }
  flush();
  return releases;
}

function allEntries(release: Release): Entry[] {
  return Object.values(release.categories).flat();
}

function uniqueLinks(entries: Entry[], kind: 'pr' | 'issue'): EntryLink[] {
  const seen = new Set<string>();
  const out: EntryLink[] = [];
  for (const entry of entries) {
    for (const link of entry.links) {
      if (link.kind === kind && !seen.has(link.url)) {
        seen.add(link.url);
        out.push(link);
      }
    }
  }
  return out;
}

function isUnreleased(release: Release): boolean {
  return release.version.toLowerCase() === 'unreleased';
}

function normaliseVersion(version: string): string {
  return version.trim().replace(/^v/i, '').toLowerCase();
}

function describe(release: Release, detail: 'full' | 'collapsed'): SummaryRelease {
  const entries = allEntries(release);
  const counts: Record<string, number> = {};
  for (const [name, list] of Object.entries(release.categories)) {
    counts[name] = list.length;
  }
  const summary: SummaryRelease = {
    version: release.version,
    date: release.date,
    detail,
    entryCount: entries.length,
    counts,
    prLinks: uniqueLinks(entries, 'pr'),
    issueLinks: uniqueLinks(entries, 'issue'),
    entriesWithoutLinks: entries.filter((entry) => !entry.links.some((link) => link.kind !== null))
      .length
  };
  if (detail === 'full') {
    summary.entries = release.categories;
  }
  return summary;
}

/**
 * Summarise releases: [Unreleased] and the latest `keepLatest` released versions
 * stay in full; older releases are collapsed. Changelog order is preserved.
 */
export function summarise(releases: Release[], options: SummaryOptions = {}): SummaryRelease[] {
  const keepLatest = options.keepLatest ?? 3;
  let released = 0;
  return releases.map((release) => {
    if (isUnreleased(release)) {
      return describe(release, 'full');
    }
    released += 1;
    return describe(release, released <= keepLatest ? 'full' : 'collapsed');
  });
}

/** Find one release for release notes. Throws if it does not exist. */
export function selectRelease(releases: Release[], version: string): Release {
  const wanted = normaliseVersion(version);
  const found = releases.find((release) => normaliseVersion(release.version) === wanted);
  if (!found) {
    throw new Error(`Release [${version}] not found in changelog`);
  }
  return found;
}

function linkMarkdown(link: EntryLink): string {
  return `[${link.label}](${link.url})`;
}

function heading(release: { version: string; date: string | null }, level: string): string {
  return `${level} [${release.version}]${release.date ? ` - ${release.date}` : ''}`;
}

function entryBlock(categories: Record<string, Entry[]>, level: string): string[] {
  const out: string[] = [];
  for (const [name, entries] of Object.entries(categories)) {
    if (entries.length === 0) {
      continue;
    }
    out.push('', `${level} ${name}`);
    for (const entry of entries) {
      out.push(`- ${entry.text}`);
    }
  }
  return out;
}

export function renderSummary(releases: SummaryRelease[], file: string): string {
  const total = releases.reduce((sum, release) => sum + release.entryCount, 0);
  const out = [
    '# Changelog summary',
    '',
    `Condensed from ${file}: ${releases.length} releases, ${total} entries. The full history is in the changelog itself. This summary is not a release publication.`
  ];
  for (const release of releases) {
    out.push('');
    if (release.detail === 'full') {
      out.push(heading(release, '##'));
      out.push(...entryBlock(release.entries ?? {}, '###'));
      continue;
    }
    const counts = Object.entries(release.counts)
      .filter(([, count]) => count > 0)
      .map(([name, count]) => `${name} ${count}`)
      .join(', ');
    out.push(`${heading(release, '##')} (collapsed, ${release.entryCount} entries)`);
    out.push('', `- Changes: ${counts || 'none'}`);
    if (release.prLinks.length > 0) {
      out.push(`- Pull requests: ${release.prLinks.map(linkMarkdown).join(', ')}`);
    }
    if (release.issueLinks.length > 0) {
      out.push(`- Issues: ${release.issueLinks.map(linkMarkdown).join(', ')}`);
    }
    if (release.entriesWithoutLinks > 0) {
      out.push(
        `- ${release.entriesWithoutLinks} ${release.entriesWithoutLinks === 1 ? 'entry has' : 'entries have'} no PR or issue link`
      );
    }
  }
  return out.join('\n');
}

export function renderNotes(release: Release): string {
  const out = [`# Release notes: ${heading(release, '').trim()}`];
  out.push(...entryBlock(release.categories, '##'));
  if (allEntries(release).length === 0) {
    out.push('', 'No entries.');
  }
  return out.join('\n');
}

export interface Io {
  log: (message: string) => void;
  error: (message: string) => void;
}

const USAGE =
  'Usage: node summarise-changelog.ts CHANGELOG.md [--keep-latest N | --notes X.Y.Z|unreleased] [--json]';

/** Run the CLI. Returns the process exit code. */
export function main(argv: string[], io: Io): number {
  let json = false;
  let file: string | null = null;
  let notes: string | null = null;
  let keepLatest: number | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') {
      json = true;
    } else if (arg === '--notes' || arg === '--keep-latest') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        io.error(`${arg} needs a value\n${USAGE}`);
        return 2;
      }
      if (arg === '--notes') {
        notes = value;
      } else if (/^\d+$/.test(value)) {
        keepLatest = Number(value);
      } else {
        io.error(`--keep-latest needs a whole number\n${USAGE}`);
        return 2;
      }
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
  if (notes !== null && keepLatest !== undefined) {
    io.error(`Use either --notes or --keep-latest, not both\n${USAGE}`);
    return 2;
  }

  let content: string;
  try {
    content = readFileSync(file, 'utf8');
  } catch (err) {
    io.error(`Cannot read ${file}: ${(err as Error).message}`);
    return 2;
  }

  const releases = parseChangelog(content);
  if (releases.length === 0) {
    io.error(`No release sections (## [version]) found in ${file}`);
    return 2;
  }

  if (notes !== null) {
    let release: Release;
    try {
      release = selectRelease(releases, notes);
    } catch (err) {
      io.error((err as Error).message);
      return 2;
    }
    io.log(
      json
        ? JSON.stringify({ file, mode: 'notes', ...describe(release, 'full') }, null, 2)
        : renderNotes(release)
    );
    return 0;
  }

  const summary = summarise(releases, { keepLatest });
  io.log(
    json
      ? JSON.stringify({ file, mode: 'summary', releases: summary }, null, 2)
      : renderSummary(summary, file)
  );
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Set the exit code instead of calling process.exit() so large output piped to another process is not cut off.
  process.exitCode = main(process.argv.slice(2), { log: console.log, error: console.error });
}
