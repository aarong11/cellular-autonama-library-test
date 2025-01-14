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
      '^@tests/(.*)$': '<rootDir>/tests/$1'
    },
    testTimeout: 20000
};