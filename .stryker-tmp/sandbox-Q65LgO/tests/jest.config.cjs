/** @type {import('jest').Config} */
// @ts-nocheck

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/unit'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: './tsconfig.json', diagnostics: false, isolatedModules: true }]
  },
  moduleNameMapper: {
    '^next/server$': '<rootDir>/shims/next-server.ts',
    '^next/headers$': '<rootDir>/shims/next-headers.ts',
    '^@supabase/auth-helpers-nextjs$': '<rootDir>/shims/supabase-auth-helpers-nextjs.ts',
    '^zod$': require.resolve('zod'),
    '^@shared$': '<rootDir>/../packages/shared/src/index.ts',
    '^@shared/(.*)$': '<rootDir>/../packages/shared/src/$1',
    '^@education/shared$': '<rootDir>/../packages/shared/src/index.ts',
    '^@education/shared/(.*)$': '<rootDir>/../packages/shared/src/$1',
    '^@/(.*)$': '<rootDir>/../apps/web/src/$1'
  },
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    },
    // Critical services should stay very high
    '<rootDir>/../apps/web/src/server/services/**/*.ts': {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95
    },
    // API route handlers should remain at or above 90
    '<rootDir>/../apps/web/src/app/api/**/*.ts': {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90
    }
  },
  coverageDirectory: '<rootDir>/test-results/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coveragePathIgnorePatterns: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    '<rootDir>/../apps/web/src/server/**/*.{ts,tsx}',
    '!<rootDir>/../apps/web/src/server/**/route.ts',
    '<rootDir>/../packages/shared/src/**/*.ts'
  ],
  coverageProvider: 'babel'
};


