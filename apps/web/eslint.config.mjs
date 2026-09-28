import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.turbo/**',
      'out/**',
      'build/**',
      'certificates/**',
      'next-env.d.ts',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Pre-existing violations; warn until the affected effects are refactored.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
  // Must be last to disable rules that conflict with Prettier
  eslintConfigPrettier,
];

export default eslintConfig;
