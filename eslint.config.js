import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // 1. Ignore specific folders
  {
    ignores: ['node_modules/', 'dist/', 'build/'],
  },

  // 2. Base configuration for all JavaScript files
  {
    files: ['**/*.js', '**/*.jsx'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
      },
    },
  },

  // 3. TypeScript configuration (only runs on .ts files)
  ...tseslint.config({
    files: ['**/*.ts', '**/*.tsx'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json', // Required for type-aware linting
      },
    },
    rules: {
      // Customize your TS specific rules here
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/no-explicit-any': 'off', // Helpful during migration
    },
  }),

  // 4. Prettier integration (MUST be last to disable formatting conflicts)
  eslintConfigPrettier,
];
