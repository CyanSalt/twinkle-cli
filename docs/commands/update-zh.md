# `twinkle update`

批量更新所有内部依赖包。

## 用法

```shell
npx twinkle update
```

## 选项

- `--packages` : 需要检查更新的软件包的正则表达式。
- `--latest` : 是否无视 `package.json` 中指定的版本范围限制。默认为 `true`。
- `--postinstall` : 对某些包指定升级后的额外命令。
  - 默认会在 `@cyansalt/*` 中的 linting 配置升级后，对相关插件进行升级。
- `--yes` `-y` : 是否跳过询问直接进行更新。
- `--lock` : 是否更新深层依赖。默认为 `false`。
  - 设为 `true` 以更新 `package-lock.json` 中涉及的包版本。

## 其他提示

- 在 [Lerna](https://www.npmjs.com/package/lerna) 中使用时，如果希望对指定的包运行命令，可以使用 `npx lerna exec [--scope=<package-name>] -- npx twinkle update`。
- `--lock` 的一个常见的用例是使用 `npx twinkle update --lock --packages "^@babel/" "^babel-"` 更新所有 Babel 相关的依赖。这可以同步更新深层依赖。
