module.exports = {
  root: true,
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 2021
  },
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    'backups/',
    'logs/',
    'data/'
  ],
  rules: {}
};
