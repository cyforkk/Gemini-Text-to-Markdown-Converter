#!/usr/bin/env python3
"""Fix Markdown code fences whose language is placed on the previous line."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


def _split_lines(text: str) -> list[str]:
    return text.splitlines(keepends=True)


def _line_body(line: str) -> str:
    return line.rstrip("\r\n")


def _line_ending(line: str) -> str:
    if line.endswith("\r\n"):
        return "\r\n"
    if line.endswith("\n"):
        return "\n"
    return ""


def _empty_backtick_fence(line: str) -> tuple[str, str] | None:
    body = _line_body(line)
    stripped = body.strip()
    if stripped and set(stripped) == {"`"} and len(stripped) >= 3:
        indent = body[: len(body) - len(body.lstrip())]
        return indent, "`" * len(stripped)
    return None


def _opening_backtick_fence(line: str) -> str | None:
    match = re.match(r"^\s*(`{3,})", _line_body(line))
    return match.group(1) if match else None


def _language_candidate(line: str) -> str | None:
    token = _line_body(line).strip()
    if not token:
        return None
    if token.startswith(("#", "-", "*", "+", ">", "`")):
        return None
    if any(ch.isspace() for ch in token):
        return None
    if len(token) > 40:
        return None
    return token


def convert_markdown(text: str) -> str:
    """Move standalone language labels onto following empty code fences."""
    lines = _split_lines(text)
    output: list[str] = []
    in_fence = False
    fence_marker = ""

    for line in lines:
        body = _line_body(line)
        stripped = body.strip()

        if in_fence:
            output.append(line)
            if stripped.startswith(fence_marker) and set(stripped) == {"`"}:
                in_fence = False
                fence_marker = ""
            continue

        if stripped.startswith("```"):
            empty_fence = _empty_backtick_fence(line)
            if empty_fence:
                previous_index = len(output) - 1
                while previous_index >= 0 and _line_body(output[previous_index]).strip() == "":
                    previous_index -= 1

                language = _language_candidate(output[previous_index]) if previous_index >= 0 else None
                if language:
                    del output[previous_index:]
                    indent, fence = empty_fence
                    output.append(f"{indent}{fence}{language}{_line_ending(line)}")
                    in_fence = True
                    fence_marker = fence
                    continue

                output.append(line)
                in_fence = True
                fence_marker = empty_fence[1]
                continue

            output.append(line)
            fence_marker = _opening_backtick_fence(line) or "```"
            in_fence = True
            continue

        output.append(line)

    return "".join(output)


def convert_file(path: Path, *, dry_run: bool = False) -> bool:
    original = path.read_text(encoding="utf-8")
    converted = convert_markdown(original)
    changed = converted != original
    if changed and not dry_run:
        path.write_text(converted, encoding="utf-8", newline="")
    return changed


def iter_markdown_files(path: Path) -> list[Path]:
    if path.is_file():
        if path.suffix.lower() != ".md":
            raise ValueError(f"Not a Markdown file: {path}")
        return [path]
    if path.is_dir():
        return sorted(p for p in path.rglob("*.md") if p.is_file())
    raise FileNotFoundError(path)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert Markdown from 'Bash\\n\\n```' to '```Bash'."
    )
    parser.add_argument("path", nargs="?", help="Markdown file or folder path.")
    parser.add_argument(
        "--stdin",
        action="store_true",
        help="Read Markdown from stdin and print the converted result.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show which files would change without writing them.",
    )
    args = parser.parse_args()

    if args.stdin:
        sys.stdout.write(convert_markdown(sys.stdin.read()))
        return 0

    if not args.path:
        return interactive_main()

    files = iter_markdown_files(Path(args.path))
    changed_files = [path for path in files if convert_file(path, dry_run=args.dry_run)]

    action = "Would update" if args.dry_run else "Updated"
    for path in changed_files:
        print(f"{action}: {path}")
    print(f"Checked {len(files)} file(s), changed {len(changed_files)} file(s).")
    return 0


def interactive_main() -> int:
    print("Markdown code fence converter")
    print("Input a Markdown file path or folder path, then press Enter.")
    print("Leave it empty to exit.")
    print()

    raw_path = input("Path: ").strip().strip('"')
    if not raw_path:
        input("Press Enter to exit...")
        return 0

    try:
        files = iter_markdown_files(Path(raw_path))
        changed_files = [path for path in files if convert_file(path)]
    except Exception as exc:
        print(f"Error: {exc}")
        input("Press Enter to exit...")
        return 1

    for path in changed_files:
        print(f"Updated: {path}")
    print(f"Checked {len(files)} file(s), changed {len(changed_files)} file(s).")
    input("Press Enter to exit...")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
