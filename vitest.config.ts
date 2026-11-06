import { defineConfig } from 'vitest/config';

// One Vitest run covers the root package and both sub-skill packages.
// Existing tests keep their Jest-style globals (describe, test, expect, ...).
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['scripts/__tests__/**/*.test.js', 'sub-skills/**/__tests__/**/*.test.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      // Every intended production script is in the denominator, executed or not.
      include: ['scripts/**/*.{cjs,mjs,js,ts}', 'sub-skills/**/scripts/**/*.{cjs,mjs,js,ts}'],
      // Test files only; no production file is excluded.
      exclude: ['**/__tests__/**'],
      // Agreed starting point (raise toward 90% over time). Global, over all production scripts.
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 }
    }
  }
});
