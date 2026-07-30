export default {
  plugins: [
    {
      rules: {
        'body-list-min-items': (parsed) => {
          const { body } = parsed
          if (!body) return [true, '']

          const items = body.split('\n').filter(
            (l) => l.trim().startsWith('- ') || l.trim().startsWith('* '),
          )

          if (items.length > 0 && items.length < 2) {
            return [false, 'body list must have more than one item when present']
          }

          return [true, '']
        },
      },
    },
  ],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w+)\(([^)]+)\)(!)?:\s(.*)$/,
      headerCorrespondence: ['type', 'scope', 'breaking', 'subject'],
    },
  },
  rules: {
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'body-list-min-items': [2, 'always'],
    'scope-empty': [2, 'never'],
    'scope-enum': [2, 'always', [
      'app', 'middleware', 'routes', 'shared',
      'auth', 'docs', 'infra', 'root',
    ]],
    'subject-empty': [2, 'never'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'type-empty': [2, 'never'],
    'type-enum': [2, 'always', [
      'feat', 'fix', 'chore', 'refactor',
      'test', 'docs', 'style', 'perf',
    ]],
  },
}
