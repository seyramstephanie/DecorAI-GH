// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // server/ runs on plain Node (CommonJS), not React Native
    files: ['server/**/*.js'],
    languageOptions: {
      globals: { __dirname: 'readonly', Buffer: 'readonly', process: 'readonly' },
    },
  },
]);
