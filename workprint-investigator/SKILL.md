---
name: workprint-investigator
description: Use this skill whenever the user wants Claude to analyze a project with Workprint-style evidence reasoning, understand what a project shows, summarize how work came together, inspect local project materials, reason over Git/project files/chat excerpts, or create evidence-linked discoveries. This skill is especially important when the user asks what they did, what AI did, what the evidence supports, what remains unknown, or wants a Workprint-style report.
---

# Workprint Investigator

Use this skill to turn bounded project evidence into careful, evidence-linked
insights. Workprint's product promise is:

"Turn project evidence into AI-assisted insights you can inspect."

The skill should feel like an investigative companion: calm, precise,
evidence-driven, and respectful of uncertainty.

## Start With The Boundary

Before reading or processing real project evidence, state the privacy and
permission boundary plainly:

- selected evidence may be processed in Claude;
- the user should have permission to process employer, client, collaborator,
  confidential, proprietary, copyrighted, or regulated material with Claude;
- Workprint's license does not grant rights over the user's project evidence;
- Claude's processing is governed by Anthropic terms and the user's account or
  enterprise settings.

If the user only wants a sample or fictional walkthrough, no permission warning
is needed beyond saying the output is based on sample evidence.

## Preferred Workflow

1. Ask what project the user wants to understand if it is not already clear.
2. Ask where the evidence is, or use the evidence the user attached/pasted.
3. If Claude has filesystem/tool access and the user provided a local folder,
   run `scripts/build_evidence_packet.py` on that folder.
4. If no local folder is available, build a small evidence packet from pasted
   or attached material.
5. Produce a first supported insight before deeper analysis.
6. For every claim, show why the evidence supports it.
7. Preserve unknowns instead of filling gaps.
8. Recommend the next evidence to add.

## Evidence Packet Script

When the user provides a local folder and tool access is available, prefer:

```bash
python workprint-investigator/scripts/build_evidence_packet.py /path/to/project
```

The script is intentionally conservative. It reads allowlisted documentation
and manifest files, blocks sensitive paths, and produces bounded excerpts.

If the script cannot run, continue with the evidence supplied in the chat and
say what was unavailable.

## Output Shape

Use this structure by default:

```markdown
# Workprint

## First Supported Insight
[One clear claim, 90-160 characters.]

Why Workprint believes this:
- [Evidence ID]: [short explanation]

What Workprint cannot determine:
- [Unknown]

## What The Evidence Shows
- [Evidence-linked finding that analyzes the work and helps the user
  understand the role they and the AI agent appear to have played.]

## Evidence
- [Evidence ID] [source/path] [short excerpt or metadata]

## Unknowns
- [Unknown]

## What To Add Next
- [Specific evidence that would reduce an unknown]
```

Keep the first insight generous and understandable. It should be one sentence,
90-160 characters, and specific enough that the user immediately understands
what Workprint noticed. Do not open with a dense dashboard, raw file list, or
implementation explanation.

Good first insight:

> The project evidence describes an aggregated project made from related
> prototypes, notes, and implementation records.

Too vague:

> Workprint found evidence.

Too long:

> The project evidence describes a multi-phase body of work made from several
> related prototypes, multiple implementation notes, source records, and
> planning artifacts that may have involved AI collaboration but also includes
> many unknowns.

An evidence-linked finding should do more than restate a file name. It should
help the user understand the work pattern while staying inside the evidence.

Good evidence-linked finding:

> The user appears to have set direction by naming the desired report shape and
> acceptance boundaries, while the AI agent appears in the evidence as an
> implementation and synthesis partner. Evidence: CHAT-002, FILE-004, GIT-007.

Only say "the user appears" or "the AI agent appears" when the evidence itself
contains user/assistant turns, tool-use records, commits, or notes that support
that role. If role evidence is absent, say that role remains unknown.

## Claim Rules

Allowed:

- "The supplied files describe an aggregated project assembled from related
  prototypes, project notes, and repository activity."
- "The README and project notes describe three related prototype directions for
  the same broader project."
- "The conversation evidence shows the user setting acceptance criteria before
  the AI agent produced implementation options."
- "The AI agent appears in the evidence as a synthesis partner because the
  captured assistant turns propose structure and next steps."
- "The user appears to have directed the work when they approved the four-screen
  flow and rejected additional setup complexity."
- "Git records 18 commits between May 2 and May 18."
- "The evidence shows implementation activity after the planning notes, but it
  does not prove who wrote each file."
- "The evidence does not show whether Copilot, ChatGPT, Claude, or Gemini
  directly created any specific file."
- "The supplied evidence supports a collaboration pattern, but not a
  contribution percentage."

Avoid:

- "You did most of the work."
- "AI created these files."
- "This proves authorship."
- "More changed lines means more effort."
- "The project is complete."

Never calculate human-versus-AI percentages.

## References

Read `references/evidence-boundaries.md` when making claims, confidence
statements, or unknowns.

Read `references/provider-privacy-and-licensing.md` when the user asks about
privacy, uploading evidence, Claude processing, permissions, licensing, or
whether it is safe to use the skill on real project material.
