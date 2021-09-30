# twinkle-cli

Extensible command collection.

[Change Log](CHANGELOG.md)

[Chinese docs(中文文档)](docs/README-zh.md)

## Installation

```shell
npm install --save-dev twinkle-cli
```

## Usage

```shell
npx twinkle help
```

```
twinkle [command]

Commands:
  twinkle exec [command]   Run a command from local or remote
  twinkle iconfont [file]  Extract icons from iconfont.cn
  twinkle tinify           Tinify images by TinyPNG
  twinkle update           Update dependencies

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

Commands can be found in:

- [`twinkle exec`](./docs/commands/exec.md)
- [`twinkle iconfont`](./docs/commands/iconfont.md)
- [`twinkle tinify`](./docs/commands/tinify.md)
- [`twinkle update`](./docs/commands/update.md)

## Plugins

Twinkle will automatically read the dependency named `[@*/]twinkle-plugin-*` in the current `package.json` and load it as a plugin.
