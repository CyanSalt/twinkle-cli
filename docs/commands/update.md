# `twinkle update`

[Chinese docs(中文文档)](./update-zh.md)

Batch update all internal dependency packages.

## Usage

```shell
npx twinkle update
```

## Options

- `--packages` : Regular expressions for packages that need to be checked for updates.
- `--latest` : Whether to check packages without considering version ranges specified in `package.json`.
- `--postinstall` : Specify additional commands for certain packages after upgrade.
  - The default will be to upgrade the relevant plugins after the linting configuration in `@cyansalt/*` has been upgraded.
- `--yes` `-y` : Whether to skip the prompt and update directly.
- `--lock` : Whether to update deep dependencies. Defaults to `false`.
  - Set to `true` to update the package version involved in `package-lock.json`.

## Other Tips

- When used in [Lerna](https://www.npmjs.com/package/lerna), if you wish to run the command for the specified package, you can use `npx lerna exec [--scope=<package-name>] -- npx twinkle update`.
- A common use case of `--lock` is to use `npx twinkle update --lock --packages "^@babel/" "^babel-"` to update all Babel-related dependencies, including deep dependencies.
