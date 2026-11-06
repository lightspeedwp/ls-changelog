import { defineConfig } from 'vitest/config';

// Vitest covers the TypeScript sub-skills. The existing root Jest suite
// (scripts/) and the nested Jest suites keep their own configuration.
export default defineConfig({
  test: {
    include: ['sub-skills/**/__tests__/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      include: ['sub-skills/**/scripts/**/*.ts']
    }
  }
});
