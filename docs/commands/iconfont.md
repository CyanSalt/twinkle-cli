# `twinkle iconfont`

[Chinese docs(中文文档)](./iconfont-zh.md)

This command is used to generate iconfont related products in the project.

## Usage

```shell
npx twinkle iconfont [file] --output=<path>
```

You can define the arguments in `twinkle.config.js`.

```javascript
// twinkle.config.js
module.exports = {
  iconfont: {
    output: '/path/to/iconfont',
  },
};
```

### Options

- `[file]` : The zip archive of the icon files to be unzipped. Defaults to `~/Downloads/download.zip`.
  - If the file does not exist, then `iconfontURL` will be opened in the browser. You can usually get a `download.zip` file by downloading it directly from the page.
- `--output` : The destination directory to generate the files.
- `--ignoreFiles` : The files to be ignored from the archive. Defaults to `-demo_index.html`, `-demo.css` and `-iconfont.json`.
- `--iconfontURL` : The project address of [iconfont.cn](https://www.iconfont.cn/).
- `--transformer` : Custom file transformer object. You can convert files inside the zip archive to one or more target files.
  - The key of `transformer` corresponds to the name of the file in the archive, and the value corresponds to a function that takes the contents of the file and returns a string or `{ content: string, name?: string }` structure, or an array of them.
- `--prune` : Whether to delete the archive files after unpacking. Defaults to `false`.

## Other Tips

- If you want to get the CSS content attribute of the font icon, you can use `transformer` to process `iconfont.json`.
- The generated file is usually not subject to Code Review and Diff, so you can specify it as `binary` in `.gitattributes`.
