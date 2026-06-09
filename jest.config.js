/**
 * @type { import('jest').Config }
 */
const config = {
  'moduleNameMapper': {
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },
  'transformIgnorePatterns': [
    'node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)',
  ],
};

module.exports = config;
