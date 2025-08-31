module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { tsconfig: 'tsconfig.jest.json', useESM: false }
    ]
  },
  // extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(svg|png|jpg|jpeg|gif|webp|avif)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/apps/web/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/', '<rootDir>/tests/e2e/'],
  collectCoverage: true,
  coverageDirectory: 'reports/ui/coverage',
  reporters: [
    'default',
    [
      'jest-junit',
      { outputDirectory: 'reports/ui', outputName: 'junit.xml' }
    ]
  ]
};


