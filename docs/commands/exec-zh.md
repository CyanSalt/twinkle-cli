# `twinkle exec`

这个命令主要的作用是在不确定是否已安装的情况下运行一个 twinkle 插件。

## 用法

```shell
> npx twinkle similar-image foo.png "images/*.png"
E: 无法识别的选项：similar-image
```

```shell
> npx twinkle exec similar-image -- foo.png "images/*.png"
(...安装中)
```

### 选项

- `[command]` : 需要执行的命令。
- `--package` `-p` : 指定命令需要安装的 NPM 包名。
- `--scope` : 当未指定 `--package` 时，将使用 `scope` 与命令名称生成包名。。
- `--` : 需要传递给命令的参数。
