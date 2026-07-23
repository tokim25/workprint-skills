# Workprint Skills

Turn project evidence into AI-assisted insights you can inspect.

This repo packages Workprint's evidence-bounded, no-verdict investigation
philosophy for two AI platforms, instead of requiring a standalone macOS app
install:

- **[Claude Skill](workprint-investigator/)** — a `SKILL.md`-based skill with
  a local evidence-packet script. Runs with real filesystem access wherever
  Claude Skills run (Claude Code, Claude.ai, the Claude Agent SDK).
- **[ChatGPT Custom GPT](chatgpt-custom-gpt/)** — the same rules ported to a
  Custom GPT's instructions and knowledge files, with a Code Interpreter path
  for running the same evidence-packet script against an uploaded project
  zip.

Both are a **lighter-weight version of Workprint** than the desktop app: they
apply the evidence-boundary and claim rules through instructions (and, for
the ChatGPT path, an uploaded script run via Code Interpreter), not through
the desktop app's full deterministic validation pipeline (regex-based
boundary checks, evidence-ID verification, a reject/rewrite/hold pipeline
running in code). Each bundle says this plainly to users who ask.

## What Both Bundles Do

- Help the assistant build a bounded evidence packet from project material.
- Read only allowlisted documentation/manifest files through the included
  script; block obvious secrets, credentials, dependency folders, build
  output, and generated caches.
- Produce evidence-linked insights, unknowns, and follow-up questions.
- Use the AI Fluency 4D lens where evidence supports it: Delegation,
  Description, Discernment, and Diligence.
- Support user-approved long-chat summaries as summary evidence, without
  pretending the full chat history was processed.
- Keep every claim tied to evidence IDs.
- Refuse authorship, ownership, effort, contribution, intent, and
  human-versus-AI percentage claims unless direct evidence supports the exact
  narrow statement.

## Important Privacy And Permission Boundary

Using either bundle means selected project evidence may be processed by
whichever AI platform is running it (Anthropic/Claude, or OpenAI/ChatGPT) —
see each bundle's own privacy/licensing reference for the platform-specific
disclosure text.

Workprint's license covers the Workprint software and these bundles. It does
not give you permission to upload, disclose, or process employer, client,
collaborator, third-party, confidential, copyrighted, regulated, or
proprietary evidence with any AI provider.

Before using either bundle on real project material, make sure you have
permission to process the selected evidence with the AI platform you're
using, and that its terms, data-use policies, retention settings, and your
account or enterprise agreement fit your obligations.

This is not legal advice. It is a product boundary.

## Project Structure

```text
workprint-investigator/          Claude Skill bundle
  SKILL.md
  references/
    evidence-boundaries.md
    ai-fluency-lens.md
    provider-privacy-and-licensing.md
  scripts/
    build_evidence_packet.py
chatgpt-custom-gpt/               ChatGPT Custom GPT bundle
  instructions.md
  knowledge/
    evidence-boundaries.md
    ai-fluency-lens.md
    provider-privacy-and-licensing.md
    build_evidence_packet.py
  README.md                      Step-by-step GPT builder setup
evals/
  evals.json
```

## Use — Claude Skill

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

## Use — ChatGPT Custom GPT

See [`chatgpt-custom-gpt/README.md`](chatgpt-custom-gpt/README.md) for exact
step-by-step setup in the ChatGPT GPT builder — name, description,
instructions, capabilities to enable, and which knowledge files to upload.
Claude cannot create or publish the GPT itself; that step happens in your own
ChatGPT account.

## Current Workprint Guardrails

- The first supported insight must tell the user what they did or where human
  judgment, review, direction, correction, or sequencing appears.
- The first insight may also describe what AI/tooling appears to have done, how
  work moved from idea to implementation, or what the evidence cannot
  separate.
- A first insight that only names evidence sources is not enough.
- Confidence is qualitative: High, Moderate, Limited, Low, or Unknown.
- A bounded evidence packet means selected excerpts and metadata, not the whole
  project folder or full chat history.
- User-approved chat summaries are useful context, but they are summary
  evidence rather than direct transcripts.
- When naming the AI Fluency 4D lens, credit Anthropic Academy and the
  framework authors.

## Keeping The Two Bundles In Sync

These are two separate copies of the same rules (a Claude Skill and a ChatGPT
Custom GPT's instructions/knowledge), and nothing enforces that they stay
identical. When you change `workprint-investigator/SKILL.md` or its
`references/`, check whether `chatgpt-custom-gpt/instructions.md` and its
`knowledge/` files need the same update, and vice versa.
