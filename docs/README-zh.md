# twinkle-cli

可扩展的命令合集。

[更新日志](../CHANGELOG.md)

## 安装

```shell
npm install --save-dev twinkle-cli
```

## 用法

```shell
npx twinkle help
```

```
twinkle [命令]

命令：
  twinkle exec [command]   从本地或远程运行一条命令
  twinkle iconfont [file]  从 iconfont.cn 解出图标
  twinkle tinify           使用 TinyPNG 压缩图片
  twinkle update           更新依赖包

选项：
  --help     显示帮助信息                                                 [布尔]
  --version  显示版本号                                                   [布尔]
```

具体的命令参考：

- [`twinkle exec`](./commands/exec-zh.md)
- [`twinkle iconfont`](./commands/iconfont-zh.md)
- [`twinkle tinify`](./commands/tinify-zh.md)
- [`twinkle update`](./commands/update-zh.md)

## 插件

Twinkle 会自动读取当前 `package.json` 中名字为 `[@*/]twinkle-plugin-*` 的依赖，将其作为插件加载。
