# `twinkle exec`

[Chinese docs(中文文档)](./exec-zh.md)

The main purpose of this command is to run a twinkle plugin without being sure if it is installed or not.

## Usage

```shell
> npx twinkle similar-image foo.png "images/*.png"
E: Unknown argument：similar-image
```

```shell
> npx twinkle exec similar-image -- foo.png "images/*.png"
(...Installing)
```

### Options

- `[command]` : The command to be executed.
- `--package` `-p` : Specify the name of the NPM package to be installed by the command.
- `--scope` : When `--package` is not specified, the package name will be generated using `scope` with the command name..
- `--` : Arguments to be passed to the command.
