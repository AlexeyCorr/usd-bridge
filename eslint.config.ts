import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'node_modules'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  // Правила React Compiler живут здесь: отдельный eslint-plugin-react-compiler
  // депрекейтнут и влит в этот плагин.
  reactHooks.configs.flat['recommended-latest'],
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
  },
  {
    files: ['worker.ts'],
    languageOptions: { globals: globals.worker },
  },
  {
    files: ['vite.config.ts', 'eslint.config.ts'],
    languageOptions: { globals: globals.node },
  },
);
