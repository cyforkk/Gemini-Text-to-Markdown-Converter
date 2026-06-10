const input = document.querySelector("#input");
const output = document.querySelector("#output");
const inputCount = document.querySelector("#inputCount");
const outputCount = document.querySelector("#outputCount");
const copyBtn = document.querySelector("#copyBtn");
const clearBtn = document.querySelector("#clearBtn");
const fileBtn = document.querySelector("#fileBtn");
const folderBtn = document.querySelector("#folderBtn");
const fileInput = document.querySelector("#fileInput");
const folderInput = document.querySelector("#folderInput");
const fileSummary = document.querySelector("#fileSummary");
const fileList = document.querySelector("#fileList");
const statusText = document.querySelector("#statusText");
const toast = document.querySelector("#toast");

const { convertMarkdown } = window.GeminiMarkdownConverter;
let toastTimer = null;

function setStatus(message) {
  statusText.textContent = message;
}

function showToast(message, type = "success") {
  toast.textContent = message;
  toast.classList.toggle("error", type === "error");
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function refresh() {
  output.value = convertMarkdown(input.value);
  inputCount.textContent = `${input.value.length} 字`;
  outputCount.textContent = `${output.value.length} 字`;
  setStatus(input.value ? "已自动转换粘贴内容" : "等待输入");
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "utf-8");
  });
}

function fileLabel(file) {
  return file.webkitRelativePath || file.name;
}

function downloadName(file) {
  return fileLabel(file).replace(/[\\/]+/g, "__");
}

async function processFiles(fileSource) {
  const markdownFiles = Array.from(fileSource || []).filter((file) => {
    return file.name.toLowerCase().endsWith(".md");
  });

  fileList.replaceChildren();
  fileSummary.textContent = markdownFiles.length
    ? `读取 ${markdownFiles.length} 个 Markdown 文件`
    : "没有选择 Markdown 文件";

  if (!markdownFiles.length) {
    setStatus("未读取到 Markdown 文件");
    showToast("没有读取到 Markdown 文件", "error");
    return;
  }

  let changedCount = 0;

  for (const file of markdownFiles) {
    const row = document.createElement("div");
    row.className = "file-row";

    const name = document.createElement("div");
    name.className = "file-name";
    name.textContent = fileLabel(file);

    const state = document.createElement("div");
    state.className = "file-state";
    state.textContent = "读取中";

    const downloadBtn = document.createElement("button");
    downloadBtn.type = "button";
    downloadBtn.textContent = "下载";
    downloadBtn.disabled = true;

    row.append(name, state, downloadBtn);
    fileList.append(row);

    try {
      const original = await readFile(file);
      const converted = convertMarkdown(original);
      const changed = converted !== original;
      if (changed) changedCount += 1;
      state.textContent = changed ? "已转换" : "无需修改";
      downloadBtn.disabled = false;
      downloadBtn.addEventListener("click", () => {
        downloadText(downloadName(file), converted);
        showToast(`已下载：${downloadName(file)}`);
      });
    } catch (error) {
      state.textContent = "读取失败";
      showToast(`读取失败：${file.name}`, "error");
    }
  }

  const message = `文件处理完成：${markdownFiles.length} 个文件，${changedCount} 个有变化`;
  setStatus(message);
  showToast(message);
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(output.value);
    copyBtn.textContent = "已复制";
    setStatus("结果已复制到剪贴板");
    showToast("转换结果已复制");
  } catch (error) {
    output.focus();
    output.select();
    setStatus("浏览器未允许自动复制，已选中结果文本");
    showToast("浏览器未允许自动复制，已选中结果文本", "error");
  }

  setTimeout(() => {
    copyBtn.textContent = "复制结果";
  }, 1200);
}

input.addEventListener("input", refresh);
fileBtn.addEventListener("click", () => fileInput.click());
folderBtn.addEventListener("click", () => folderInput.click());
fileInput.addEventListener("change", () => processFiles(fileInput.files));
folderInput.addEventListener("change", () => processFiles(folderInput.files));
clearBtn.addEventListener("click", () => {
  input.value = "";
  fileInput.value = "";
  folderInput.value = "";
  fileList.replaceChildren();
  fileSummary.textContent = "未选择文件";
  refresh();
  showToast("内容已清空");
  input.focus();
});
copyBtn.addEventListener("click", copyOutput);

refresh();
