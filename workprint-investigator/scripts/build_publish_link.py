#!/usr/bin/env python3
"""Turn a finished Workprint report (JSON) into a one-click publish link.

The report is compressed and placed after the "#" in the link, so it is never
sent to a server until the user clicks Publish in their own browser.

Usage: build_publish_link.py report.json [--base-url URL]
"""
import argparse
import base64
import json
import re
import sys
import zlib

PERCENT = re.compile(r"\d+(\.\d+)?\s*(%|percent\b)", re.I)
SCORING = re.compile(r"\b(score[sd]?|scoring|grade[sd]?|grading)\b", re.I)
MAX_REPORT_CHARS = 60000
DEFAULT_BASE = "https://workprint-publish.vercel.app/publish.html"
LONG_LINK = 8000


def validate_report(r):
    """Mirror of validateReport in publish/web/workprint.js. Keep them in step."""
    if not isinstance(r, dict):
        return ["Report is not an object."]
    errors = []
    if r.get("v") != 1:
        errors.append("Unsupported report version.")
    if not (isinstance(r.get("title"), str) and r["title"].strip()):
        errors.append("Missing title.")
    if r.get("platform") not in ("claude", "chatgpt"):
        errors.append("platform must be claude or chatgpt.")

    evidence = r.get("evidence") if isinstance(r.get("evidence"), list) else []
    ids = {e.get("id") for e in evidence if isinstance(e, dict)}
    for i, e in enumerate(evidence):
        if not (isinstance(e, dict) and isinstance(e.get("id"), str) and isinstance(e.get("label"), str)):
            errors.append(f"evidence[{i}] needs id and label.")

    claims = []
    fi = r.get("first_insight")
    if not (isinstance(fi, dict) and isinstance(fi.get("text"), str)):
        errors.append("Missing first_insight.")
    else:
        if not 20 <= len(fi["text"]) <= 300:
            errors.append("first_insight must be 20 to 300 characters.")
        claims.append(("first_insight", fi))
    findings = r.get("findings") if isinstance(r.get("findings"), list) else []
    claims += [(f"findings[{i}]", f) for i, f in enumerate(findings)]

    for name, c in claims:
        if not (isinstance(c, dict) and isinstance(c.get("text"), str)):
            errors.append(f"{name} needs text.")
            continue
        cited = c.get("evidence")
        if not isinstance(cited, list) or not cited:
            errors.append(f"{name} cites no evidence.")
        else:
            errors += [f"{name} cites unknown evidence {x}." for x in cited if x not in ids]
        if PERCENT.search(c["text"]):
            errors.append(f"{name} contains a percentage.")
        if SCORING.search(c["text"]):
            errors.append(f"{name} uses scoring language.")
    unknowns = r.get("unknowns")
    if not (isinstance(unknowns, list) and unknowns and all(isinstance(u, str) and u.strip() for u in unknowns)):
        errors.append("At least one unknown is required.")
    if len(json.dumps(r, separators=(",", ":"))) > MAX_REPORT_CHARS:
        errors.append("Report is too large.")
    return errors


def build_link(report, base_url=DEFAULT_BASE):
    raw = json.dumps(report, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    packed = base64.urlsafe_b64encode(zlib.compress(raw, 9)).rstrip(b"=").decode()
    return f"{base_url}#{packed}"


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("report")
    ap.add_argument("--base-url", default=DEFAULT_BASE)
    args = ap.parse_args()
    with open(args.report, encoding="utf-8") as f:
        report = json.load(f)
    errors = validate_report(report)
    if errors:
        print("Report not ready to publish:", file=sys.stderr)
        for e in errors:
            print(f"- {e}", file=sys.stderr)
        return 1
    link = build_link(report, args.base_url)
    print(link)
    print(f"link length: {len(link)} characters", file=sys.stderr)
    if len(link) > LONG_LINK:
        print("This link is long. If it breaks in chat, paste the report JSON into the publish page instead.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
