#!/usr/bin/env python3
"""Build a bounded Workprint evidence packet from a local project folder."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path


LIMITS = {
    "max_files": 30,
    "max_bytes_per_file": 100_000,
    "max_total_bytes": 600_000,
    "max_excerpt_chars": 1_200,
    "max_excerpt_lines": 20,
}

ALLOWED_EXTENSIONS = {
    ".adoc",
    ".json",
    ".md",
    ".mdx",
    ".rst",
    ".toml",
    ".txt",
    ".yaml",
    ".yml",
}

MANIFEST_NAMES = {
    "package.json",
    "pyproject.toml",
    "tsconfig.json",
}

BLOCKED_DIRECTORIES = {
    ".cache",
    ".git",
    ".next",
    ".nuxt",
    ".parcel-cache",
    ".pytest_cache",
    ".svelte-kit",
    ".turbo",
    "__pycache__",
    "bower_components",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "out",
    "target",
    "tmp",
    "vendor",
}

SENSITIVE_TERMS = {
    ".env",
    "credential",
    "credentials",
    "keychain",
    "passwd",
    "password",
    "private-key",
    "private_key",
    "secret",
    "secrets",
    "token",
}

SENSITIVE_EXTENSIONS = {
    ".cer",
    ".cert",
    ".crt",
    ".der",
    ".key",
    ".p12",
    ".pem",
    ".pfx",
}


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Create a bounded Workprint evidence packet as JSON."
    )
    parser.add_argument("project_path", help="Local project folder to inspect")
    parser.add_argument("--max-files", type=int, default=LIMITS["max_files"])
    args = parser.parse_args()

    root = Path(args.project_path).expanduser().resolve()
    if not root.exists() or not root.is_dir():
        raise SystemExit("project_path must be an existing directory")

    max_files = max(1, min(args.max_files, LIMITS["max_files"]))
    evidence = []
    skipped = []
    total_bytes = 0

    for path in iter_candidate_files(root):
        if len(evidence) >= max_files:
            break
        if not path.is_file():
            continue

        relative = path.relative_to(root).as_posix()
        reason = skip_reason(relative, path)
        if reason:
            skipped.append({"path": relative, "reason": reason})
            continue

        size = path.stat().st_size
        if size > LIMITS["max_bytes_per_file"]:
            skipped.append({"path": relative, "reason": "blocked_oversized"})
            continue
        if total_bytes + size > LIMITS["max_total_bytes"]:
            skipped.append({"path": relative, "reason": "blocked_total_limit"})
            continue

        text = read_text(path)
        if text is None:
            skipped.append({"path": relative, "reason": "not_text"})
            continue

        total_bytes += size
        evidence_id = f"FILE-{len(evidence) + 1:03d}"
        evidence.append(
            {
                "id": evidence_id,
                "source": "project-file",
                "path": relative,
                "name": path.name,
                "extension": path.suffix.lower(),
                "bytes": size,
                "line_count": line_count(text),
                "excerpt": bounded_excerpt(text),
            }
        )

    packet = {
        "schema": "workprint-evidence-packet-v0",
        "project": {
            "name": root.name,
            "root_label": str(root),
        },
        "limits": {**LIMITS, "max_files": max_files},
        "evidence": evidence,
        "skipped": skipped[:100],
        "unknowns": [
            "This packet does not prove authorship, ownership, effort, contribution, intent, correctness, completeness, originality, or AI involvement.",
            "Files outside the allowlist, blocked paths, and evidence not selected for this packet are not represented.",
        ],
    }
    print(json.dumps(packet, indent=2, ensure_ascii=False))
    return 0


def skip_reason(relative: str, path: Path) -> str | None:
    parts = relative.split("/")
    if any(part.lower() in BLOCKED_DIRECTORIES for part in parts[:-1]):
        return "blocked_directory"

    lower = relative.lower()
    suffix = path.suffix.lower()
    if suffix in SENSITIVE_EXTENSIONS:
        return "blocked_sensitive"
    if any(term in lower for term in SENSITIVE_TERMS):
        return "blocked_sensitive"

    name = path.name.lower()
    if name.startswith("readme"):
        return None
    if name in MANIFEST_NAMES:
        return None
    if suffix in ALLOWED_EXTENSIONS:
        return None
    return "unsupported_type"


def iter_candidate_files(root: Path):
    candidates = []
    for current_root, dirnames, filenames in os.walk(root):
        dirnames[:] = [
            dirname
            for dirname in dirnames
            if dirname.lower() not in BLOCKED_DIRECTORIES
        ]
        current = Path(current_root)
        for filename in filenames:
            path = current / filename
            relative = path.relative_to(root).as_posix()
            candidates.append((file_priority(relative, path), relative, path))

    for _, _, path in sorted(candidates):
        yield path


def file_priority(relative: str, path: Path) -> tuple[int, str]:
    name = path.name.lower()
    if name.startswith("readme"):
        return (0, relative)
    if path.suffix.lower() in {".md", ".mdx", ".txt", ".rst", ".adoc"}:
        return (1, relative)
    if name in MANIFEST_NAMES:
        return (2, relative)
    return (3, relative)


def read_text(path: Path) -> str | None:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        try:
            return path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            return None
    except OSError:
        return None


def bounded_excerpt(text: str) -> str:
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = normalized.split("\n")[: LIMITS["max_excerpt_lines"]]
    excerpt = "\n".join(lines)[: LIMITS["max_excerpt_chars"]].rstrip()
    if len(normalized) > len(excerpt):
        return f"{excerpt}\n..."
    return excerpt


def line_count(text: str) -> int:
    if not text:
        return 0
    return text.count("\n") + 1


if __name__ == "__main__":
    raise SystemExit(main())
