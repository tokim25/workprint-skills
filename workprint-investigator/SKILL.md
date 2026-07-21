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
[One clear claim.]

Why Workprint believes this:
- [Evidence ID]: [short explanation]

What Workprint cannot determine:
- [Unknown]

## What The Evidence Shows
- [Evidence-linked finding]

## Evidence
- [Evidence ID] [source/path] [short excerpt or metadata]

## Unknowns
- [Unknown]

## What To Add Next
- [Specific evidence that would reduce an unknown]
```

Keep the first insight generous and understandable. Do not open with a dense
dashboard, raw file list, or implementation explanation.

## Claim Rules

Allowed:

- "The README states this is a responsive prototype for Carrie Kim's lactation
  consulting practice."
- "The supplied notes describe feedback coaching scenarios."
- "Git records 18 commits between May 2 and May 18."
- "The evidence does not show who wrote the files."

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
