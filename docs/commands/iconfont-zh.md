# `twinkle iconfont`

这个命令用来在项目中生成 iconfont 相关产物。

## 用法

```shell
npx twinkle iconfont [file] --output=<path>
```

你可以在 `twinkle.config.js` 中定义参数：

```javascript
// twinkle.config.js
module.exports = {
  iconfont: {
    output: '/path/to/iconfont',
  },
};
```

### 选项

- `[file]` : 待解压缩的图标文件压缩包。默认为 `~/Downloads/download.zip`。
  - 如果该文件不存在，则会在浏览器中打开 `iconfontURL`。通常可以直接在这个页面下载得到一个 `download.zip` 文件。
- `--output` : 生成文件的目标目录。
- `--ignoreFiles` : 需要从压缩包中忽略的文件。默认为 `demo_index.html`、`demo.css` 和 `iconfont.json`。
- `--iconfontURL` : [iconfont.cn](https://www.iconfont.cn/) 的项目地址。
- `--transformer` : 自定义文件转换函数对象。可以将压缩包内的文件转换为一个或多个目标文件。
  - `transformer` 的 key 对应压缩包内的文件名，value 对应一个函数，接受文件内容，返回字符串或 `{ content: string, name?: string }` 结构，或是它们构成的数组。
- `--prune` : 是否在解压缩之后删除压缩包文件。默认为 `false`。

## 其他提示

- 如果想要获取字体图标对应的 CSS content 属性，可以使用 `transformer` 对 `iconfont.json` 进行处理。
- 生成的文件通常来说不需要进行 Code Review 和 Diff，因此可以在 `.gitattributes` 中将其指定为 `binary`。
