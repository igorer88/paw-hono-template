export default {
  '*.{ts,tsx}': ['oxlint --fix', 'oxfmt --write'],
  '*.{json,md}': ['oxfmt --write']
}
