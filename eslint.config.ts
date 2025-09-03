import loguxSvelteConfig from '@logux/eslint-config/svelte'
import type { Linter } from 'eslint'

export default [
  {
    ignores: ['dist/', 'storybook-static/', 'client/vite.config.ts.*']
  },
  ...loguxSvelteConfig,
  {
    rules: {
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
      'n/no-unsupported-features/node-builtins': [
        'error',
        {
          allowExperimental: true
        }
      ]
    }
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-misused-spread': 'off',
      '@typescript-eslint/only-throw-error': 'off'
    }
  },
  {
    files: ['client/stories/*.ts'],
    rules: {
      'no-console': 'off'
    }
  },
  {
    files: ['client/pages/**/*', 'client/ui/**/*', 'client/main/**/*'],
    rules: {
      'n/no-unsupported-features/node-builtins': 'off'
    }
  },
  {
    files: ['web/**/*.svelte'],
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'svelte/no-unused-class-name': [
        'error',
        {
          allowedClassNames: ['is-dark-theme', 'is-light-theme']
        }
      ],
      'svelte/sort-attributes': 'warn'
    }
  },
  {
    files: ['scripts/*'],
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'n/no-unsupported-features/node-builtins': [
        'error',
        {
          version: '>=24.0.0'
        }
      ]
    }
  }
] satisfies Linter.Config[]
