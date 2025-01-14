module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
      '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['<rootDir>/tests/**/*.test.[jt]s?(x)'], // Only include files ending with .test.ts or .test.js in the tests folder
  moduleNameMapper: {
      '^@src/(.*)$': '<rootDir>/src/$1',
      '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  testTimeout: 20000,
  // Enable sourcemaps for better debugging support
  globals: {
      'ts-jest': {
          tsconfig: '<rootDir>/tsconfig.json',
          diagnostics: false, // Disable diagnostic warnings for better debugging
      },
  },
  // Generate coverage report only when needed
  collectCoverage: false,
  coverageDirectory: '<rootDir>/coverage',
  // Enable test reporting for debugging purposes
  reporters: ['default'],
  // Ensure proper source maps for debugging in VS Code
  testRunner: 'jest-circus/runner',
};
