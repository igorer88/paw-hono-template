## 1.0.0 (2026-08-13)

### 🚀 Features

- **global:** add request correlation id middleware ([1f1a010](https://github.com/igorer88/paw-hono-template/commit/1f1a010f61e58e31fe969431f2b52f1da4e26be7))
- **global:** resolve all typecheck errors and add typecheck to CI ([a16db24](https://github.com/igorer88/paw-hono-template/commit/a16db24f8721c570bb85077d44670c0e2a657758))
- **global:** validate CORS origins and add request timeout/body limit guards ([c2a5c1c](https://github.com/igorer88/paw-hono-template/commit/c2a5c1c17d796dda48065b15cab1950636a9705a))
- **infra:** add automated release pipeline with semantic-release ([011ce31](https://github.com/igorer88/paw-hono-template/commit/011ce31e9df0c9f2eeed5d7abc74e66399bcef37))
- **infra:** add emoji section headers to release notes ([49b7001](https://github.com/igorer88/paw-hono-template/commit/49b7001235028525ebec0abdb7138c96d1ed7b41))
- **infra:** add trivy vulnerability and misconfiguration scan ([3f412e8](https://github.com/igorer88/paw-hono-template/commit/3f412e823af51344bd35a5ebfc1efb3f4273d16c))
- **infra:** keep package.json version in sync with releases ([61173a5](https://github.com/igorer88/paw-hono-template/commit/61173a59ef189d9494a61c17079aa4feac5bccde))
- **root:** add degit scaffold script ([1ed9a45](https://github.com/igorer88/paw-hono-template/commit/1ed9a45ef796cebfe869a0a0ceb81fe4f4e52e62))
- **root:** merge degit scaffold script ([91e8a74](https://github.com/igorer88/paw-hono-template/commit/91e8a74b8977bd3180f7151518eb537dbb8c0579))
- **shared:** add Result<T> type and validateInput utility for cloud-agnostic services ([40f30a1](https://github.com/igorer88/paw-hono-template/commit/40f30a119266d5297aef40eafc3ee527931a4e57))

### 🐛 Bug Fixes

- **global:** align health router with AppInstance convention and sync docs with code ([cdcc9c5](https://github.com/igorer88/paw-hono-template/commit/cdcc9c53c333b5ef3990f392085e695a998c5bcd))
- **global:** harden client IP extraction and debug header logging ([b84ecc4](https://github.com/igorer88/paw-hono-template/commit/b84ecc4505d30c4345ef3645b71f91d070268b05))
- **global:** require ENVIRONMENT and gate 4xx messages on HTTPException ([152997f](https://github.com/igorer88/paw-hono-template/commit/152997f299a1c564d6badaa364abaea5ec227b27))
- **infra:** grant pull-requests read for gitleaks PR scan ([6a40bc2](https://github.com/igorer88/paw-hono-template/commit/6a40bc25c0ac507e040d26aa8d24b86ed2d729ae))
- **infra:** pin base images, non-root runtime, healthcheck, working capnp ([735f451](https://github.com/igorer88/paw-hono-template/commit/735f45154b6659741df2b08d831f4e2d4f9ff999))
- **infra:** pin conventional-changelog-conventionalcommits to v9 ([335407f](https://github.com/igorer88/paw-hono-template/commit/335407fe6ca4c7c7e9b2c6b5b9c4306cd3ed0286))
- **infra:** scope GitHub token permissions and pin actions to SHAs ([6667144](https://github.com/igorer88/paw-hono-template/commit/666714418147acce3d2ed0887c87a57701fe1f13))
- **middleware:** harden CORS, logging, error responses, and production deploy ([a380762](https://github.com/igorer88/paw-hono-template/commit/a3807621d47a79f3948cf81ecdccb47c9bfe19ab))

# Changelog
