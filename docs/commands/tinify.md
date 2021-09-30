# `twinkle tinify`

[Chinese docs(中文文档)](./tinify-zh.md)

Use [tinify](https://www.npmjs.com/package/tinify) to compress images.

## Usage

```shell
npx twinkle tinify [files...] --key=<string>
```

## Options

- `[files...] ` : The path of the images to be compressed.
- `--key` : The API key for [TinyPNG](https://tinypng.com/developers).
- `--staged` : Whether to skip historical files during Git merges. Defaults to `-false`.


## Other Tips

- If your project uses Vue CLI, you can manage `key` through the `.env.development` file. A simple example is as follows:

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
- It is recommended to add this process to the [lint-staged](https://www.npmjs.com/package/lint-staged). A simple example is as follows:

  ```json
  {
    "lint-staged": {
      "*. {png,jpg,jpeg}": [
        "twinkle tinify --staged"
      ]
    }
  }
  ```
