// @ts-check
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { pathsToModuleNameMapper } = require('ts-jest');

const tsconfig = JSON.parse(readFileSync(path.join(__dirname, 'tsconfig.json'), 'utf8'));
const paths = tsconfig.compilerOptions?.paths ?? {};

/** @type {import('jest').Config} */
const base = {
  rootDir: '.',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: pathsToModuleNameMapper(paths, {
    prefix: '<rootDir>/src/',
  }),
  clearMocks: true,
  restoreMocks: true,
};

module.exports = base;
