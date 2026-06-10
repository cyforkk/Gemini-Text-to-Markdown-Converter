(function attachConverter(global) {
  function lineEnding(line) {
    if (line.endsWith("\r\n")) return "\r\n";
    if (line.endsWith("\n")) return "\n";
    return "";
  }

  function lineBody(line) {
    return line.replace(/\r?\n$/, "");
  }

  function emptyBacktickFence(line) {
    const body = lineBody(line);
    const stripped = body.trim();
    if (/^`{3,}$/.test(stripped)) {
      const indent = body.slice(0, body.length - body.trimStart().length);
      return { indent, fence: "`".repeat(stripped.length) };
    }
    return null;
  }

  function languageCandidate(line) {
    const token = lineBody(line).trim();
    if (!token || token.length > 40) return null;
    if (/^[#\-*+>`]/.test(token)) return null;
    if (/\s/.test(token)) return null;
    return token;
  }

  function convertMarkdown(text) {
    const lines = text.match(/[^\r\n]*(?:\r\n|\n|$)/g) || [];
    if (lines.length && lines[lines.length - 1] === "") lines.pop();

    const result = [];
    let inFence = false;
    let fenceMarker = "";

    for (const line of lines) {
      const body = lineBody(line);
      const stripped = body.trim();

      if (inFence) {
        result.push(line);
        if (stripped.startsWith(fenceMarker) && /^`+$/.test(stripped)) {
          inFence = false;
          fenceMarker = "";
        }
        continue;
      }

      if (stripped.startsWith("```")) {
        const emptyFence = emptyBacktickFence(line);
        if (emptyFence) {
          let previousIndex = result.length - 1;
          while (previousIndex >= 0 && lineBody(result[previousIndex]).trim() === "") {
            previousIndex -= 1;
          }

          const language = previousIndex >= 0 ? languageCandidate(result[previousIndex]) : null;
          if (language) {
            result.splice(previousIndex);
            result.push(`${emptyFence.indent}${emptyFence.fence}${language}${lineEnding(line)}`);
            inFence = true;
            fenceMarker = emptyFence.fence;
            continue;
          }

          result.push(line);
          inFence = true;
          fenceMarker = emptyFence.fence;
          continue;
        }

        result.push(line);
        fenceMarker = (body.match(/^\s*(`{3,})/) || [null, "```"])[1];
        inFence = true;
        continue;
      }

      result.push(line);
    }

    return result.join("");
  }

  const api = { convertMarkdown };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  global.GeminiMarkdownConverter = api;
})(globalThis);
