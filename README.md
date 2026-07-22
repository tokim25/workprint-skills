# Workprint Claude Skill

Turn project evidence into AI-assisted insights you can inspect.

This is the Claude-native version of Workprint. Instead of packaging a
standalone macOS app, it provides a Claude Skill that helps Claude prepare and
reason over bounded project evidence while preserving Workprint's evidence,
privacy, and attribution boundaries.

## What This Skill Does

- Helps Claude build a bounded evidence packet from a local project folder.
- Reads only allowlisted project materials through the included script.
- Blocks obvious secrets, credentials, dependency folders, build output, and
  generated caches.
- Produces evidence-linked insights, unknowns, and follow-up questions.
- Uses the AI Fluency 4D lens where evidence supports it: Delegation,
  Description, Discernment, and Diligence.
- Supports user-approved long-chat summaries as summary evidence without
  pretending the full chat history was processed.
- Keeps every claim tied to evidence IDs.
- Refuses authorship, ownership, effort, contribution, intent, and
  human-versus-AI percentage claims unless direct evidence supports the exact
  narrow statement.

## Important Privacy And Permission Boundary

Using this skill means selected project evidence may be processed inside the
Claude environment where the skill is running.

Workprint's license covers the Workprint software and this skill package. It
does not give you permission to upload, disclose, or process employer, client,
collaborator, third-party, confidential, copyrighted, regulated, or
proprietary evidence with Claude.

Before using this skill on real project material, make sure you have
permission to process the selected evidence with Claude and that Anthropic's
terms, data-use policies, retention settings, and your account or enterprise
agreement fit your obligations.

This is not legal advice. It is a product boundary.

## Project Structure

```text
workprint-investigator/
  SKILL.md
  references/
    evidence-boundaries.md
    provider-privacy-and-licensing.md
  scripts/
    build_evidence_packet.py
evals/
  evals.json
```

## Use

Install or point Claude at the `workprint-investigator/` skill folder.

Example prompt:

> Use the Workprint investigator skill on this project folder and tell me what
> the evidence supports, what remains unknown, and what evidence I should add
> next.

If Claude has tool access to the local filesystem, it can run:

```bash
python workprint-investigator/scripts/build_evidence_packet.py /path/to/project
```

The script writes JSON to stdout. Claude should reason from that evidence
packet, not from unrestricted project access.

## Current Workprint Guardrails

- The first supported insight must tell the user what they did or where human
  judgment, review, direction, correction, or sequencing appears.
- The first insight may also describe what AI/tooling appears to have done, how
  work moved from idea to implementation, or what the evidence cannot separate.
- A first insight that only names evidence sources is not enough.
- Confidence is qualitative: High, Moderate, Limited, Low, or Unknown.
- A bounded evidence packet means selected excerpts and metadata, not the whole
  project folder or full chat history.
- User-approved chat summaries are useful context, but they are summary
  evidence rather than direct transcripts.
- When naming the AI Fluency 4D lens, credit Anthropic Academy and the
  framework authors.
