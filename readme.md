# octoherd-script-sync-labels

> Sync labels accross repositories

[![test](https://github.com/stoe/octoherd-script-sync-labels/actions/workflows/test.yml/badge.svg)](https://github.com/stoe/octoherd-script-sync-labels/actions/workflows/test.yml) [![codeql](https://github.com/stoe/octoherd-script-sync-labels/actions/workflows/codeql.yml/badge.svg)](https://github.com/stoe/octoherd-script-sync-labels/actions/workflows/codeql.yml) [![publish](https://github.com/stoe/octoherd-script-sync-labels/actions/workflows/publish.yml/badge.svg)](https://github.com/stoe/octoherd-script-sync-labels/actions/workflows/publish.yml) [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## Usage

```sh
npx @stoe/octoherd-script-sync-labels \
  --template "stoe/octoherd-script-sync-labels"
```

Pass all options as CLI flags to avoid user prompts

```sh
$ npx @stoe/octoherd-script-sync-labels \
  --template "stoe/octoherd-script-sync-labels"
  --octoherd-token ghp_0123456789abcdefghjklmnopqrstuvwxyzA \
  --octoherd-repos "stoe/*"
```

## Options

| option       | type    | description                                       |
| ------------ | ------- | ------------------------------------------------- |
| `--defaults` | boolean | use [default labels](./labels.js)                 |
| `--path`     | string  | path to your labels.json ([example](labels.json)) |
| `--template` | string  | repository to sync labels from                    |

## Contributing

See [CONTRIBUTING.md](https://github.com/stoe/.github/blob/HEAD/.github/CONTRIBUTING.md)

## About Octoherd

[@octoherd](https://github.com/octoherd/) is project to help you keep your GitHub repositories in line.

## License

[MIT](license)
