# Gemini 复制文本 Markdown 转换器

这个项目用于修复从 Gemini 复制 Markdown 内容时常见的代码块格式问题。

Gemini 复制出来的内容有时会把代码块语言名单独放在代码块上一行，导致 Markdown 渲染器无法正确识别代码语言。

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

也就是把：

````text
语言名
可选空行
```
代码内容
```
````

转换为：

````text
```语言名
代码内容
```
````

## 适用场景

- 从 Gemini 复制回答后，代码块语言标记不在 ``` 后面。
- 需要把 Gemini 输出整理成可正常渲染的 Markdown。
- 需要批量修复已经保存下来的 `.md` 文件。
- 需要把一个文件夹里的 Markdown 文档统一修正。

## 功能

- 在线粘贴转换：打开 `index.html`，粘贴 Gemini 复制文本，直接得到正确 Markdown。
- 网页文件转换：选择一个或多个 `.md` 文件，转换后下载结果。
- 网页文件夹转换：选择文件夹，批量读取其中的 `.md` 文件并生成下载结果。
- 命令行单文件转换：传入 `.md` 文件路径，原地修改并保存。
- 命令行文件夹转换：传入文件夹路径，递归转换所有 `.md` 文件。
- 预览模式：使用 `--dry-run` 查看哪些文件会被修改，不实际写入。
- 标准输入：使用 `--stdin` 从管道读取文本并输出转换结果。
- Windows exe：双击后输入文件或文件夹路径即可转换。

## 快速开始

临时处理一段从 Gemini 复制的文本：

```text
打开 index.html
```

部署到 Netlify 时，本项目不需要构建命令，直接发布当前目录即可。

原地修复一个 Markdown 文件：

```powershell
uv run python .\md_code_fence_converter.py .\example.md
```

原地批量修复一个文件夹：

```powershell
uv run python .\md_code_fence_converter.py .\docs
```

不想安装 Python 或 uv：

```text
双击 dist\gemini-markdown-converter.exe
```

## 网页使用

直接用浏览器打开：

```text
index.html
```

### 粘贴转换

把从 Gemini 复制的 Markdown 粘贴到左侧输入框，右侧会自动显示转换后的内容。点击“复制结果”即可复制修正后的 Markdown。

### 文件转换

点击“选择文件”，选择一个或多个 `.md` 文件。网页会读取文件内容，转换后为每个文件生成一个“下载”按钮。

### 文件夹转换

点击“选择文件夹”，选择包含 Markdown 文件的目录。网页会读取其中的 `.md` 文件，并为每个文件生成转换后的下载结果。

文件夹选择依赖浏览器支持，推荐使用 Chrome 或 Edge。

浏览器出于安全限制，不能通过手输路径直接读取或覆盖本地文件。网页只能读取你主动选择的文件，并通过下载方式保存转换结果。如果需要按路径原地修改文件，请使用命令行脚本或 exe。

## Netlify 部署

这是一个纯静态 JavaScript 工具，部署到 Netlify 不需要 Python、uv、Node 构建步骤或后端服务。

Netlify 配置文件：

```text
netlify.toml
```

配置内容使用当前目录作为发布目录：

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

当前 `netlify.toml` 使用根目录发布，适合这个小工具直接部署。根目录里的文件会按静态资源处理，因此不要把密钥、私密配置或不能公开的文件放进仓库根目录。如果后续只想发布前端文件，可以把 `index.html`、`styles.css`、`converter.js` 和 `app.js` 移到单独的 `site/` 目录，并把 `publish` 改成 `site`。

## 命令行使用

推荐使用 `uv` 运行：

```powershell
uv run python .\md_code_fence_converter.py .\example.md
```

也可以直接运行 Python 脚本：

```powershell
python .\md_code_fence_converter.py .\example.md
```

转换文件夹内所有 Markdown 文件并覆盖保存：

```powershell
python .\md_code_fence_converter.py .\docs
```

只查看哪些文件会被修改：

```powershell
python .\md_code_fence_converter.py .\docs --dry-run
```

从标准输入读取 Gemini 复制文本并输出转换结果：

```powershell
Get-Content .\gemini-output.md -Raw | python .\md_code_fence_converter.py --stdin
```

使用 `uv` 的等价写法：

```powershell
Get-Content .\gemini-output.md -Raw | uv run python .\md_code_fence_converter.py --stdin
```

### 参数说明

```text
path       Markdown 文件路径，或包含 Markdown 文件的文件夹路径
--stdin    从标准输入读取 Markdown，并把转换结果输出到终端
--dry-run  只显示会修改哪些文件，不写入磁盘
```

`--dry-run` 只对文件和文件夹模式生效；`--stdin` 本身不会写文件。

## exe 使用

已经打包好的 Windows 可执行文件位于：

```text
dist\gemini-markdown-converter.exe
```

双击 exe 会进入交互模式。输入 `.md` 文件路径或文件夹路径后按 Enter，程序会原地转换并保存。执行完成后窗口会等待按 Enter 再关闭。

转换单个 Markdown 文件：

```powershell
.\dist\gemini-markdown-converter.exe .\example.md
```

转换文件夹内所有 Markdown 文件：

```powershell
.\dist\gemini-markdown-converter.exe .\docs
```

从标准输入读取并输出转换结果：

```powershell
Get-Content .\gemini-output.md -Raw | .\dist\gemini-markdown-converter.exe --stdin
```

## 转换规则

转换器只处理 Gemini 常见的这种结构：

````markdown
Python
```
print("hello")
```
````

转换为：

````markdown
```Python
print("hello")
```
````

中间有空行也会处理：

````markdown
Bash

```
echo ok
```
````

已经正确的代码块不会重复转换：

````markdown
```Python
print("hello")
```
````

代码块内部的内容不会被再次扫描，避免误改嵌套示例。

## 注意事项

- 转换前建议先用 `--dry-run` 检查文件范围。
- 当前工具默认读取 UTF-8 编码的 Markdown 文件。
- 网页模式不会覆盖原文件，只会提供转换后的下载结果。
- 命令行和 exe 模式会原地覆盖保存文件。
- 普通段落后如果刚好是一个独立短词并紧跟空代码块，也可能被识别为语言名；批量处理前建议先备份或使用 Git。

## 重新打包 exe

项目使用 `uv` 管理 PyInstaller 开发依赖。重新打包命令：

```powershell
uv run pyinstaller --onefile --name gemini-markdown-converter md_code_fence_converter.py
```

打包产物会生成到：

```text
dist\gemini-markdown-converter.exe
```

`build/` 和 `*.spec` 是 PyInstaller 的中间产物，已经在 `.gitignore` 中忽略；`dist/` 默认也被忽略，因为 exe 属于构建产物。

## 文件说明

- `.gitignore`：忽略本地虚拟环境、缓存和构建产物。
- `index.html`：Netlify 静态页面入口。
- `styles.css`：页面样式。
- `converter.js`：Gemini Markdown 转换核心逻辑。
- `app.js`：网页交互、文件读取、复制和下载逻辑。
- `netlify.toml`：Netlify 静态部署配置。
- `md_code_fence_converter.py`：Python 命令行转换脚本。
- `pyproject.toml`：`uv` 项目配置。
- `uv.lock`：`uv` 锁文件。
- `README.md`：项目说明文档。
- `dist/gemini-markdown-converter.exe`：Windows 可执行文件，默认不纳入 Git 跟踪。

## 环境要求

- 网页：现代浏览器，文件夹选择推荐 Chrome 或 Edge。
- Netlify 部署：不需要构建环境。
- 命令行脚本：Python 3.9 或更高版本。
- 项目管理和打包：`uv`。

## 开发命令

安装或同步项目环境：

```powershell
uv sync
```

查看脚本帮助：

```powershell
uv run python .\md_code_fence_converter.py --help
```

检查 Python 语法：

```powershell
uv run python -m py_compile .\md_code_fence_converter.py
```

重新打包 exe：

```powershell
uv run pyinstaller --onefile --name gemini-markdown-converter md_code_fence_converter.py
```

查看 Git 状态：

```powershell
git status --short --ignored
```

## 常见问题

### 为什么叫 Gemini 复制文本 Markdown 转换器？

因为这个工具主要针对从 Gemini 复制出来的 Markdown 内容：语言名被放在代码块上一行，导致代码块不能正常高亮。

### 为什么网页不能输入文件路径直接转换？

浏览器不能随意读取或覆盖本地路径，这是安全限制。网页只能通过文件选择器读取你主动选择的文件，并通过下载方式保存转换结果。

### 为什么 exe 双击后不会直接转换？

双击 exe 时没有传入文件路径，所以程序会进入交互模式，等待你输入 `.md` 文件路径或文件夹路径。

### exe 要不要提交到 Git？

默认不提交。源码、`pyproject.toml` 和 `uv.lock` 足以重新构建 exe。如果需要把 exe 分发给别人，可以直接发送 `dist/gemini-markdown-converter.exe`，或调整 `.gitignore` 后再提交。
