/** @type {import('jest').Config} */
const maybeZod = (() => { try { return require.resolve('zod'); } catch { return 'zod'; } })();
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/unit/ui'],
  setupFilesAfterEnv: ['<rootDir>/unit/ui/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': '<rootDir>/jest.ts-transformer.cjs'
  },
  moduleNameMapper: {
    '^next/headers$': '<rootDir>/shims/next-headers.ts',
    '^@/(.*)$': '<rootDir>/../apps/web/src/$1',
    '^@education/shared$': '<rootDir>/../packages/shared/src/index.ts',
    '^@education/shared/(.*)$': '<rootDir>/../packages/shared/src/$1',
    '^@shared$': '<rootDir>/../packages/shared/src/index.ts',
    '^@shared/(.*)$': '<rootDir>/../packages/shared/src/$1',
    '^react-hook-form$': '<rootDir>/shims/react-hook-form.ts',
    '^msw/node$': '<rootDir>/shims/msw-node.ts',
    '^msw$': '<rootDir>/shims/msw.ts',
    '^\.\./helpers/supabaseMock$': '<rootDir>/unit/helpers/supabaseMock.ts',
    '^zod$': maybeZod
  }
};


