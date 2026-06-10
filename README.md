# Gemini 复制文本 Markdown 转换器

这个项目是一个纯 JavaScript 静态网页工具，用于修复从 Gemini 复制 Markdown 内容时常见的代码块格式问题。

Gemini 复制出来的内容有时会出现两类问题：

- 代码块语言名单独放在代码块上一行。
- 代码块内容前后多出空行。

## 示例

错误格式：

````markdown
Bash

```
curl -O https://example.com/dataset.zip
```
````

转换后：

````markdown
```Bash
curl -O https://example.com/dataset.zip
```
````

已经带语言名但结尾多空行的格式：

````markdown
```bash
curl -o my_script.sh https://example.com/install.sh

```
````

转换后：

````markdown
```bash
curl -o my_script.sh https://example.com/install.sh
```
````

## 功能

- 粘贴转换：把 Gemini 复制文本粘贴到网页中，自动生成修正后的 Markdown。
- 文件转换：选择一个或多个 `.md` 文件，转换后下载结果。
- 文件夹转换：选择文件夹，批量读取其中的 `.md` 文件并生成下载结果。
- 本地处理：所有转换都在浏览器本地完成，文件不会上传到服务器。
- Netlify 部署：无需后端、无需构建命令，直接部署静态文件。

## 本地使用

### 启动命令

在当前项目目录运行：

```powershell
python -m http.server 8888
```

然后浏览器打开：

```text
http://localhost:8888
```

停止服务时，在终端按 `Ctrl + C`。

### 直接打开文件

直接用浏览器打开：

```text
index.html
```

这种方式也能用，但推荐优先使用本地静态服务器，因为它更接近 Netlify 线上环境。

### 测试命令

运行 JavaScript 转换核心测试：

```powershell
node .\tests\converter.test.js
```

如果修改了 `converter.js` 后页面仍显示旧结果，使用 `Ctrl + F5` 强制刷新浏览器缓存。


## 网页操作

### 粘贴转换

把从 Gemini 复制的 Markdown 粘贴到左侧输入框，右侧会自动显示转换后的内容。点击“复制结果”即可复制修正后的 Markdown。

### 文件转换

点击“选择文件”，选择一个或多个 `.md` 文件。网页会读取文件内容，转换后为每个文件生成一个“下载”按钮。

### 文件夹转换

点击“选择文件夹”，选择包含 Markdown 文件的目录。网页会读取其中的 `.md` 文件，并为每个文件生成转换后的下载结果。

文件夹选择依赖浏览器支持，推荐使用 Chrome 或 Edge。

浏览器出于安全限制，不能通过手输路径直接读取或覆盖本地文件。网页只能读取你主动选择的文件，并通过下载方式保存转换结果。

## Netlify 部署

这是一个纯静态 JavaScript 工具，部署到 Netlify 不需要 Python、uv、Node 构建步骤或后端服务。

Netlify 配置文件：

```text
netlify.toml
```

当前配置：

```toml
[build]
publish = "."
command = ""
```

部署方式：

```text
1. 把当前仓库推送到 GitHub、GitLab 或 Bitbucket
2. 在 Netlify 新建站点并选择该仓库
3. Build command 留空
4. Publish directory 使用 .
5. 部署完成后访问 Netlify 生成的网址
```

线上版本的转换、文件读取和下载都在用户浏览器本地完成，文件不会上传到 Netlify 服务器。

当前 `netlify.toml` 使用根目录发布。根目录里的文件会按静态资源处理，因此不要把密钥、私密配置或不能公开的文件放进仓库根目录。如果后续只想发布前端文件，可以把 `index.html`、`styles.css`、`converter.js` 和 `app.js` 移到单独的 `site/` 目录，并把 `publish` 改成 `site`。

## 转换规则

### 语言名错位

把这种结构：

````markdown
语言名
可选空行
```
代码内容
```
````

转换为：

````markdown
```语言名
代码内容
```
````

### 代码块首尾空行

转换器会移除代码块内容开头和结尾的连续空行：

````markdown
```bash

curl -o my_script.sh https://example.com/install.sh

```
````

转换为：

````markdown
```bash
curl -o my_script.sh https://example.com/install.sh
```
````

已经正确的代码块不会重复转换：

````markdown
```Python
print("hello")
```
````

代码块内部的普通内容不会被再次扫描，避免误改嵌套示例。

## 测试 JavaScript

运行转换核心测试：

```powershell
node .\tests\converter.test.js
```

当前测试覆盖：

- Gemini 语言名错位转换
- 代码块开头多空行移除
- 代码块结尾多空行移除
- 已正确代码块保持稳定
- 代码块内部内容不重复扫描

## 文件说明

- `index.html`：Netlify 静态页面入口。
- `styles.css`：页面样式。
- `converter.js`：Gemini Markdown 转换核心逻辑。
- `app.js`：网页交互、文件读取、复制和下载逻辑。
- `netlify.toml`：Netlify 静态部署配置。
- `tests/converter.test.js`：JavaScript 转换核心测试。
- `README.md`：项目说明文档。

## 注意事项

- 网页模式不会覆盖原文件，只会提供转换后的下载结果。
- 文件内容不会上传服务器，转换在浏览器本地完成。
- 普通段落后如果刚好是一个独立短词并紧跟空代码块，也可能被识别为语言名；批量处理前建议先备份或使用 Git。
