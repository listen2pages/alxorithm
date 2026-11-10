import { defineConfig } from 'eslint/config';
import next from 'eslint-config-next';

export default defineConfig([
  {
    ignores: [
      '.next/**',
      '.next-validation/**',
      '.next-demo-check/**',
      '.next-preview/**',
      '.next-landing-preview/**',
      'node_modules/**',
    ],
  },
  {
    extends: [...next],
  },
]);
