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

- Strong: multiple direct evidence items support the same narrow claim and
  important gaps are limited.
- Moderate: direct evidence supports the claim, but coverage is narrow or
  corroboration is limited.
- Limited: the claim is based on metadata, filenames, one source, or bounded
  excerpts.
- Unknown: evidence does not support a claim.

Do not use numeric confidence scores.

## Evidence-Linked Claims

Every substantive claim should cite evidence IDs. If a claim cannot cite an
evidence ID, either remove it or move it to a question/unknown.

Good:

> The project materials describe three related prototypes for the same
> lactation consulting practice. Evidence: FILE-001, FILE-002, FILE-003.

Bad:

> The user built a complete brand system.

## Unknowns Are Useful

Unknowns should feel honest, not disappointing. Phrase them as useful
boundaries:

- "The evidence does not show who wrote these files."
- "The evidence does not show whether Claude, ChatGPT, Copilot, or Gemini was
  involved."
- "The evidence does not show whether these prototypes were shipped."
