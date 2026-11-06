#!/usr/bin/env node

/**
 * validate-changelog.cjs
 *
 * Validates CHANGELOG.md files against Keep a Changelog 1.1.0 and
 * LightSpeedWP organizational standards.
 *
 * Usage:
 *   node validate-changelog.cjs CHANGELOG.md
 *   node validate-changelog.cjs CHANGELOG.md --verbose
 *   node validate-changelog.cjs CHANGELOG.md --json
 */

const fs = require('fs');
const path = require('path');

class ChangelogValidator {
  constructor(filePath, options = {}) {
    this.filePath = filePath;
    this.verbose = options.verbose || false;
    this.json = options.json || false;
    this.errors = [];
    this.warnings = [];
  }

  validate() {
    try {
      // 1. Check file exists
      if (!fs.existsSync(this.filePath)) {
        this.errors.push(`File not found: ${this.filePath}`);
        return false;
      }

      // 2. Read file
      const content = fs.readFileSync(this.filePath, 'utf8');

      // 3. Require the "# Changelog" title
      if (!/^#\s+Changelog\s*$/m.test(content.replace(/^\uFEFF/, ''))) {
        this.errors.push('Missing required "# Changelog" title');
      }

      // 4. Parse changelog structure
      const releases = this.parseChangelog(content);
      if (releases === null) {
        this.errors.push('Changelog does not parse or has no releases array');
        return false;
      }

      // 5. Check releases presence
      if (releases.length === 0) {
        this.errors.push('Changelog must have at least one release');
        return false;
      }

      // 6. Validate each release
      for (const release of releases) {
        this.validateRelease(release);
      }

      return this.errors.length === 0;
    } catch (err) {
      this.errors.push(`Error reading file: ${err.message}`);
      return false;
    }
  }

  parseChangelog(content) {
    try {
      const lines = content.split('\n');
      const releases = [];
      let currentRelease = null;

      for (const line of lines) {
        const versionMatch = line.match(/^##\s+\[([^\]]+)\](?:\s+-\s+(\d{4}-\d{2}-\d{2}))?/);

        if (versionMatch) {
          if (currentRelease) {
            releases.push(currentRelease);
          }

          const version = versionMatch[1];
          const date = versionMatch[2] || null;

          currentRelease = {
            version,
            date,
            sections: {}
          };
        }

        const sectionMatch = line.match(/^###\s+(Added|Changed|Deprecated|Removed|Fixed|Security)/);
        if (sectionMatch && currentRelease) {
          currentRelease.currentSection = sectionMatch[1];
          currentRelease.sections[currentRelease.currentSection] = [];
        }

        const entryMatch = line.match(/^-\s+(.+)/);
        if (entryMatch && currentRelease && currentRelease.currentSection) {
          currentRelease.sections[currentRelease.currentSection].push(entryMatch[1]);
        }
      }

      if (currentRelease) {
        releases.push(currentRelease);
      }

      return releases.length > 0 ? releases : null;
    } catch (err) {
      return null;
    }
  }

  validateRelease(release) {
    const { version, date } = release;

    // Validate version format
    const isUnreleased = version === 'Unreleased';
    const isSemver = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?$/.test(version);

    if (!isUnreleased && !isSemver) {
      this.errors.push(`Invalid version format: [${version}] (expected MAJOR.MINOR.PATCH or [Unreleased])`);
    }

    // Validate date format
    if (!isUnreleased && !date) {
      this.errors.push(`Version [${version}] missing date (expected: YYYY-MM-DD)`);
    } else if (!isUnreleased && date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        this.errors.push(`Version [${version}] has invalid date format: ${date} (expected: YYYY-MM-DD)`);
      }
    }

    // Check Unreleased doesn't have date
    if (isUnreleased && date) {
      this.errors.push(`[Unreleased] must not have a date`);
    }

    // Warn if no entries
    const entryCount = Object.values(release.sections).flat().length;
    if (entryCount === 0 && !isUnreleased) {
      this.warnings.push(`Version [${version}] has no entries`);
    }
  }

  report() {
    if (this.json) {
      return this.reportJSON();
    } else {
      return this.reportText();
    }
  }

  reportText() {
    let output = '';

    if (this.errors.length === 0 && this.warnings.length === 0) {
      output += '✓ Changelog validation passed\n';
    } else {
      if (this.errors.length > 0) {
        output += '✗ Validation failed\n\n';
        output += 'Errors:\n';
        this.errors.forEach(err => {
          output += `  ✗ ${err}\n`;
        });
      }

      if (this.warnings.length > 0) {
        output += '\nWarnings:\n';
        this.warnings.forEach(warn => {
          output += `  ⚠ ${warn}\n`;
        });
      }
    }

    return output;
  }

  reportJSON() {
    return JSON.stringify({
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    }, null, 2);
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node validate-changelog.cjs CHANGELOG.md [--verbose] [--json]');
  process.exit(1);
}

const filePath = args[0];
const options = {
  verbose: args.includes('--verbose'),
  json: args.includes('--json')
};

const validator = new ChangelogValidator(filePath, options);
const isValid = validator.validate();
const report = validator.report();

console.log(report);
process.exit(isValid ? 0 : 1);
