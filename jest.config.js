module.exports = {
  coverageDirectory: './coverage/',
  collectCoverage: true,
  moduleFileExtensions: [
    'js',
    'json',
    'ts',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '**/tests/**/*.test.(ts|js)',
  ],
  testEnvironment: 'node',
  preset: 'ts-jest',
};
