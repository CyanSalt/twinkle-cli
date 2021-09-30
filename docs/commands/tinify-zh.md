# `twinkle tinify`

使用 [tinify](https://www.npmjs.com/package/tinify) 压缩图片。

## 用法

```shell
npx twinkle tinify [files..] --key=<string>
```

## 选项

- `[files..]` : 需要压缩的图片路径。
- `--key` : [TinyPNG](https://tinypng.com/developers) 的 API key。
- `--staged` : 是否跳过 Git 合并过程中历史提交的文件。默认为 `false`。


## 其他提示

- 如果项目使用 Vue CLI，则可以通过 `.env.development` 文件来管理 `key`。一个简单的示例如下：

  ```javascript
  // twinkle.config.js
  const { loadVueCLIEnv } = require('twinkle-cli/dist/lib/utils');

  module.exports = {
    tinify() {
      loadVueCLIEnv('development');
      return {
        key: process.env.TINYPNG_API_KEY,
      };
    },
  };
  ```
- 推荐将这一流程加入 [lint-staged](https://www.npmjs.com/package/lint-staged) 中。一个简单的示例如下：

  ```json
  {
    "lint-staged": {
      "*.{png,jpg,jpeg}": [
        "twinkle tinify --staged"
      ]
    }
  }
  ```
