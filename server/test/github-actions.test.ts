import { afterEach, beforeEach, test } from 'node:test'

import {
  cliJsonEqual,
  cliJsonMatch,
  removeProject,
  run,
  startProject,
  writeProjectFile
} from './utils.ts'

beforeEach(async () => {
  await startProject()
})

afterEach(async () => {
  await removeProject()
})

test('shows GitHub Actions changes in workflows', async () => {
  await writeProjectFile('.github/workflows/test.yml', {
    jobs: {
      test: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          { uses: 'actions/checkout@v4.2.0' },
          { uses: 'actions/setup-node@v3.8.1' }
        ]
      }
    },
    name: 'Test',
    on: ['push']
  })

  await run('git add .')
  await run('git commit -m "Add workflow with checkout v4.2.0"')

  await writeProjectFile('.github/workflows/test.yml', {
    jobs: {
      test: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          { uses: 'actions/checkout@v4.2.1' },
          { uses: 'actions/setup-node@v3.8.1' }
        ]
      }
    },
    name: 'Test',
    on: ['push']
  })

  await cliJsonMatch([
    {
      after: 'v4.2.1',
      before: 'v4.2.0',
      diff: /Check out other refs.*by commit if provided/,
      from: 'github-actions',
      name: 'actions/checkout',
      type: 'github-actions'
    }
  ])
})

test('shows new GitHub Actions', async () => {
  await writeProjectFile('.github/workflows/test.yml', {
    jobs: {
      test: {
        'runs-on': 'ubuntu-latest',
        'steps': [{ uses: 'actions/checkout@v4.2.1' }]
      }
    },
    name: 'Test',
    on: ['push']
  })

  await cliJsonMatch([
    {
      after: 'v4.2.1',
      before: false,
      diff: /action\.yml.*name.*description.*runs/s,
      name: 'actions/checkout',
      type: 'github-actions'
    }
  ])
})

test('handles multiple actions in single workflow', async () => {
  await writeProjectFile('.github/workflows/ci.yml', {
    jobs: {
      test: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          { uses: 'actions/checkout@v4.2.0' },
          { uses: 'actions/setup-node@v3.8.1' },
          { uses: 'actions/cache@v3.3.2' }
        ]
      }
    },
    name: 'CI',
    on: ['push']
  })

  await run('git add .')
  await run('git commit -m "Add CI workflow"')

  await writeProjectFile('.github/workflows/ci.yml', {
    jobs: {
      test: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          { uses: 'actions/checkout@v4.2.1' },
          { uses: 'actions/setup-node@v3.8.2' },
          { uses: 'actions/cache@v3.3.2' }
        ]
      }
    },
    name: 'CI',
    on: ['push']
  })

  await cliJsonMatch([
    {
      after: 'v4.2.1',
      before: 'v4.2.0',
      name: 'actions/checkout'
    },
    {
      after: 'v3.8.2',
      before: 'v3.8.1',
      name: 'actions/setup-node'
    }
  ])
})

test('supports actions with commit hash', async () => {
  await writeProjectFile('.github/workflows/secure.yml', {
    jobs: {
      test: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          { uses: 'actions/checkout@8ade135a41bc03ea155e62e844d188df1ea18608' }
        ]
      }
    },
    name: 'Secure',
    on: ['push']
  })

  await run('git add .')
  await run('git commit -m "Add secure workflow"')

  await writeProjectFile('.github/workflows/secure.yml', {
    jobs: {
      test: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          { uses: 'actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11' }
        ]
      }
    },
    name: 'Secure',
    on: ['push']
  })

  await cliJsonMatch([
    {
      after: 'b4ffde65f46336ab88eb53be808477a3936bae11',
      before: '8ade135a41bc03ea155e62e844d188df1ea18608',
      name: 'actions/checkout'
    }
  ])
})

test('supports actions in any .github file', async () => {
  await writeProjectFile('.github/actions/init/action.yml', {
    description: 'Initialize project',
    name: 'Initialize',
    runs: {
      steps: [{ uses: 'actions/checkout@v4.2.0' }],
      using: 'composite'
    }
  })

  await writeProjectFile('.github/workflows/test.yml', {
    jobs: {
      test: {
        'runs-on': 'ubuntu-latest',
        'steps': [{ uses: './.github/actions/init' }]
      }
    },
    name: 'Test',
    on: ['push']
  })

  await run('git add .')
  await run('git commit -m "Add custom action"')

  await writeProjectFile('.github/actions/init/action.yml', {
    description: 'Initialize project',
    name: 'Initialize',
    runs: {
      steps: [{ uses: 'actions/checkout@v4.2.1' }],
      using: 'composite'
    }
  })

  await cliJsonMatch([
    {
      after: 'v4.2.1',
      before: 'v4.2.0',
      name: 'actions/checkout'
    }
  ])
})

test('ignores local and docker actions', async () => {
  await writeProjectFile('.github/workflows/test.yml', {
    jobs: {
      test: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          { uses: './local-action' },
          { uses: 'docker://alpine:3.18' },
          { uses: 'actions/checkout@v4.2.0' }
        ]
      }
    },
    name: 'Test',
    on: ['push']
  })

  await run('git add .')
  await run('git commit -m "Add workflow with mixed actions"')

  await writeProjectFile('.github/workflows/test.yml', {
    jobs: {
      test: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          { uses: './local-action' },
          { uses: 'docker://alpine:3.19' },
          { uses: 'actions/checkout@v4.2.1' }
        ]
      }
    },
    name: 'Test',
    on: ['push']
  })

  await cliJsonMatch([
    {
      after: 'v4.2.1',
      before: 'v4.2.0',
      name: 'actions/checkout'
    }
  ])
})

test('handles deleted workflow files', async () => {
  await writeProjectFile('.github/workflows/test.yml', {
    jobs: {
      test: {
        'runs-on': 'ubuntu-latest',
        'steps': [{ uses: 'actions/checkout@v4.2.0' }]
      }
    },
    name: 'Test',
    on: ['push']
  })

  await run('git add .')
  await run('git commit -m "Add workflow"')
  await run('rm .github/workflows/test.yml')

  await cliJsonEqual([])
})

test('deduplicates same actions with same version', async () => {
  await writeProjectFile('.github/workflows/ci.yml', {
    jobs: {
      build: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          { uses: 'actions/checkout@v4.2.0' },
          { uses: 'actions/cache@v3.3.2' }
        ]
      },
      test: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          { uses: 'actions/checkout@v4.2.0' },
          { uses: 'actions/setup-node@v3.8.1' }
        ]
      }
    },
    name: 'CI',
    on: ['push']
  })

  await writeProjectFile('.github/actions/test/action.yml', {
    description: 'Test composite action',
    name: 'Test Action',
    runs: {
      steps: [{ uses: 'actions/checkout@v4.2.0' }],
      using: 'composite'
    }
  })

  await run('git add .')
  await run('git commit -m "Add workflows with duplicate actions"')

  await writeProjectFile('.github/workflows/ci.yml', {
    jobs: {
      build: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          { uses: 'actions/checkout@v4.2.1' },
          { uses: 'actions/cache@v3.3.2' }
        ]
      },
      test: {
        'runs-on': 'ubuntu-latest',
        'steps': [
          { uses: 'actions/checkout@v4.2.1' },
          { uses: 'actions/setup-node@v3.8.1' }
        ]
      }
    },
    name: 'CI',
    on: ['push']
  })

  await writeProjectFile('.github/actions/test/action.yml', {
    description: 'Test composite action',
    name: 'Test Action',
    runs: {
      steps: [{ uses: 'actions/checkout@v4.2.1' }],
      using: 'composite'
    }
  })

  // Should only show one change for actions/checkout despite appearing in multiple files
  await cliJsonMatch([
    {
      after: 'v4.2.1',
      before: 'v4.2.0',
      name: 'actions/checkout'
    }
  ])
})
