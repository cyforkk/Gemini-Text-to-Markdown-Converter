# Markdown 代码块格式转换工具

这个项目用于修复复制 Markdown 时常见的代码块语言标记错位问题。

错误格式：

````markdown
Bash

```
curl -O https://example.com/dataset.zip
```
````

正确格式：

````markdown
```Bash
curl -O https://example.com/dataset.zip
```
````

## 功能

- 在线转换：打开 `index.html`，粘贴 Markdown 后自动得到正确格式。
- 单文件转换：传入 `.md` 文件路径，转换后覆盖保存。
- 文件夹转换：传入文件夹路径，递归转换其中所有 `.md` 文件。
- 预览模式：使用 `--dry-run` 查看哪些文件会被修改，不实际写入。
- 标准输入：使用 `--stdin` 从管道读取 Markdown 并输出转换结果。
- exe 交互模式：双击 exe 后输入文件或文件夹路径，处理完成后窗口不会立即关闭。

## 快速开始

如果只想临时粘贴一段 Markdown：

```text
打开 index.html
```

如果想原地修改某个 Markdown 文件：

```powershell
uv run python .\md_code_fence_converter.py .\example.md
```

如果想原地批量修改一个文件夹：

```powershell
uv run python .\md_code_fence_converter.py .\docs
```

如果不想安装 Python 或 uv：

```text
双击 dist\md-fence-converter.exe
```

## 在线转换

直接用浏览器打开：

```text
index.html
```

把 Markdown 粘贴到左侧输入框，右侧会自动显示转换后的内容，点击“复制结果”即可复制。

网页也支持点击“选择文件”或“选择文件夹”，读取本地 `.md` 文件并为每个文件生成转换后的下载按钮。文件夹选择依赖浏览器支持，推荐使用 Chrome 或 Edge。

浏览器出于安全限制，不能通过手输文件路径直接读取或覆盖本地文件。如果需要按路径原地修改文件，请使用命令行脚本或 exe。

## 命令行使用

推荐使用 `uv` 运行：

```powershell
uv run python .\md_code_fence_converter.py .\example.md
```

也可以直接运行 Python 脚本：

转换单个 Markdown 文件并覆盖保存：

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

从标准输入读取并输出转换结果：

```powershell
Get-Content .\example.md -Raw | python .\md_code_fence_converter.py --stdin
```

使用 `uv` 的等价写法：

```powershell
Get-Content .\example.md -Raw | uv run python .\md_code_fence_converter.py --stdin
```

### 参数说明

```text
path       Markdown 文件路径，或包含 Markdown 文件的文件夹路径
--stdin    从标准输入读取 Markdown，并把转换结果输出到终端
--dry-run  只显示会修改哪些文件，不写入磁盘
```

注意：`--dry-run` 只对文件和文件夹模式生效；`--stdin` 本身不会写文件。

## exe 使用

已经打包好的 Windows 可执行文件位于：

```text
dist\md-fence-converter.exe
```

双击 exe 会进入交互模式，可以输入 `.md` 文件路径或文件夹路径。执行完成后窗口会等待按 Enter 再关闭。

转换单个 Markdown 文件：

```powershell
.\dist\md-fence-converter.exe .\example.md
```

转换文件夹内所有 Markdown 文件：

```powershell
.\dist\md-fence-converter.exe .\docs
```

从标准输入读取并输出转换结果：

```powershell
Get-Content .\example.md -Raw | .\dist\md-fence-converter.exe --stdin
```

## 重新打包 exe

项目使用 `uv` 管理 PyInstaller 开发依赖。重新打包命令：

```powershell
uv run pyinstaller --onefile --name md-fence-converter md_code_fence_converter.py
```

打包产物会生成到 `dist\md-fence-converter.exe`。

`build/` 和 `*.spec` 是 PyInstaller 的中间产物，已经在 `.gitignore` 中忽略；`dist/` 默认也被忽略，因为 exe 属于构建产物。

## 转换规则

工具会把这种模式：

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

已经是正确格式的代码块不会重复转换：

````markdown
```Bash
echo ok
```
````

代码块内部的内容不会被再次扫描，避免误改嵌套示例。

### 会转换的示例

````markdown
Python
```
print("hello")
```
````

会变成：

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

### 不会转换的示例

已经正确的代码块不会处理：

````markdown
```Python
print("hello")
```
````

普通段落后面的代码块通常不会被当成语言名，除非上一行是一个无空格的独立短词。为了避免误转换，转换前可以先用 `--dry-run` 检查文件范围。

## 文件说明

- `.gitignore`：忽略本地虚拟环境、缓存和构建产物。
- `index.html`：本地在线转换页面。
- `md_code_fence_converter.py`：Python 命令行转换脚本。
- `pyproject.toml`：`uv` 项目配置。
- `uv.lock`：`uv` 锁文件。
- `README.md`：项目说明文档。
- `dist/md-fence-converter.exe`：Windows 可执行文件，默认不纳入 Git 跟踪。

## 环境要求

- 在线页面：现代浏览器。
- 命令行脚本：Python 3.9 或更高版本。
- 项目管理：`uv`。

## 开发命令

安装/同步项目环境：

```powershell
uv sync
```

运行转换脚本：

```powershell
uv run python .\md_code_fence_converter.py --help
```

检查 Python 语法：

```powershell
uv run python -m py_compile .\md_code_fence_converter.py
```

重新打包 exe：

```powershell
uv run pyinstaller --onefile --name md-fence-converter md_code_fence_converter.py
```

查看 Git 状态：

```powershell
git status --short --ignored
```

## 常见问题

### 为什么网页不能输入文件路径直接转换？

浏览器不能随意读取或覆盖本地路径，这是安全限制。网页只能通过文件选择器读取用户主动选择的文件，并通过下载方式保存转换结果。

### 为什么双击 exe 之前会一闪而过？

早期版本是纯命令行程序，没有参数时会直接退出。现在无参数启动会进入交互模式，输入文件或文件夹路径后再执行转换。

### exe 要不要提交到 Git？

默认不提交。源码、`pyproject.toml` 和 `uv.lock` 足以重新构建 exe。如果需要把 exe 分发给别人，可以直接发送 `dist/md-fence-converter.exe`，或调整 `.gitignore` 后再提交。
