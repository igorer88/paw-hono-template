export default {
  parserPreset: {
    parserOpts: {
      headerPattern: /^[^\s]+\s\((\w+)\)(\w+)(?:!)?:\s(.*)$/,
      headerCorrespondence: ['scope', 'type', 'subject'],
    },
  },
  rules: {
    'header-max-length': [2, 'always', 100],
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
