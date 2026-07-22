# Evidence Boundaries

Workprint reports what evidence supports. It does not fill gaps with
unsupported certainty.

## Always Preserve These Boundaries

- Authorship is unknown unless direct evidence explicitly says who authored a
  specific item.
- Ownership is unknown unless direct evidence explicitly establishes ownership.
- Effort is unknown; counts of files, commits, lines, messages, or excerpts do
  not measure effort.
- Contribution share is unknown; never calculate percentages.
- AI involvement is unknown unless evidence explicitly shows AI involvement.
- Intent is unknown unless directly stated.
- Correctness, completeness, originality, and quality are unknown unless the
  supplied evidence directly supports a narrow claim.

## Confidence Language

Use qualitative confidence only:

- High: multiple direct evidence items support the same narrow claim and
  important gaps are limited.
- Moderate: direct evidence supports the claim, but coverage is narrow or
  corroboration is limited.
- Limited: the claim is based on metadata, filenames, one source, or bounded
  excerpts.
- Low: weak, indirect, or conflicting evidence suggests a possibility, but the
  claim should be framed carefully.
- Unknown: evidence does not support a claim.

Do not use numeric confidence scores.

Plain-language meanings:

- High means Workprint has several direct pieces of evidence for a narrow
  claim, and no major visible contradiction.
- Moderate means Workprint has direct evidence, but it is incomplete or not
  strongly corroborated.
- Limited means Workprint is relying on a small, indirect, metadata-only, or
  summary-only evidence base.
- Low means Workprint can mention a weak signal only with careful caveats.
- Unknown means Workprint should not make the claim.

## Evidence-Linked Claims

Every substantive claim should cite evidence IDs. If a claim cannot cite an
evidence ID, either remove it or move it to a question/unknown.

The first supported insight should be one sentence, 90-160 characters. It
should name the most useful evidence-supported work pattern in plain language.
It must tell the user what they did or where human judgment, review, direction,
correction, or sequencing appears.

Good:

> The user narrowed scope through review while AI-assisted implementation
> turned the approved direction into code. Evidence: CHAT-001, GIT-003.

Bad:

> The user built a complete brand system.

Bad:

> The local cache shows Claude Desktop was available.

## Evidence-Linked Findings

Evidence-linked findings should help the user understand how the work came
together. They should analyze the evidence, not merely list it.

Good:

> The conversation records show the user narrowing the product contract before
> implementation, while assistant turns propose concrete structure and wording.
> Evidence: CHAT-001, CHAT-004, FILE-002.

Good:

> The repository history shows implementation activity after the design notes,
> but the evidence does not establish who wrote each changed file. Evidence:
> FILE-003, GIT-008.

Bad:

> README.md exists.

Bad:

> The AI did the implementation.

When describing roles, use "appears" language unless the evidence directly
states the role. Examples:

- "The user appears to set direction in the captured conversation."
- "The AI agent appears as a drafting or implementation partner in the captured
  assistant turns."
- "The evidence does not show whether an AI agent edited the final file."
- "The evidence does not establish line-level authorship."

## Allowed Claim Examples

Use claim patterns like these when supported by evidence:

- "The supplied files describe an aggregated project assembled from related
  prototypes, project notes, and repository activity."
- "The evidence shows a sequence from direction-setting to implementation,
  with notes preceding repository changes."
- "The captured user turns define constraints and acceptance criteria."
- "The captured assistant turns propose implementation structure and wording."
- "The captured turns show delegation when the user assigns implementation to
  the assistant after setting acceptance criteria."
- "The captured turns show discernment when the user rejects a broad answer and
  asks for a narrower one."
- "The notes describe multiple variants of the same broader project."
- "Git records commits after the planning notes, but Git does not prove who
  personally wrote the changed lines."
- "The evidence shows AI participation in the conversation, but not whether AI
  generated the final files."
- "The evidence supports a collaboration pattern, not a contribution score."
- "The evidence shows review or correction when the user rejects, revises, or
  narrows an assistant proposal."
- "The evidence shows a delivered artifact when project files, reports, or
  commits record that artifact directly."
- "The user-approved summary provides context about a long chat, but it does
  not prove the full transcript was processed."

## Unknowns Are Useful

Unknowns should feel honest, not disappointing. Phrase them as useful
boundaries:

- "The evidence does not show who wrote these files."
- "The evidence does not show whether Claude, ChatGPT, Copilot, or Gemini was
  involved."
- "The evidence does not show whether these prototypes were shipped."
