# Workprint Investigator — ChatGPT Custom GPT

This is the ChatGPT-native version of the Workprint Investigator. It is the
same evidence-bounded, claim-boundary philosophy as the
[Claude Skill](../workprint-investigator/), adapted for a platform where
ChatGPT cannot browse a user's local filesystem or run a deterministic
validation pipeline in code the way the desktop app does.

**This is a lighter-weight version of Workprint.** It applies Workprint's
rules through instructions, not through the desktop app's code-enforced
validation pipeline (regex boundary checks, evidence-ID verification,
reject/rewrite/hold). Say so plainly if a user asks how much to trust it.

## What's In This Folder

```text
chatgpt-custom-gpt/
  instructions.md          Paste this into the GPT builder's Instructions field
  knowledge/
    evidence-boundaries.md
    ai-fluency-lens.md
    provider-privacy-and-licensing.md   (ChatGPT/OpenAI-specific, not the Claude version)
    build_evidence_packet.py            (same script as the Claude Skill, for Code Interpreter)
    build_publish_link.py               (makes the private publish link; same script as the Claude Skill)
    report-format.md                    (the JSON format the publish page expects)
```

## Creating The GPT (ChatGPT Web UI)

Claude cannot create or publish a Custom GPT on your behalf — that requires
your own ChatGPT login and happens entirely in OpenAI's UI. Steps:

1. Go to **chatgpt.com → Explore GPTs → Create** (or **My GPTs → Create a
   GPT**).
2. Under the **Configure** tab, set:
   - **Name**: `Workprint Investigator`
   - **Description**: `Turn project evidence into AI-assisted insights you can inspect — evidence-linked, never a verdict on authorship, effort, or ownership.`
   - **Instructions**: paste the full contents of `instructions.md` (the block
     after the `---`), unmodified.
   - **Conversation starters**:
     - `Use Workprint on this project and tell me what the evidence supports.`
     - `Can Workprint prove I did most of this work?`
     - `Use the AI Fluency 4D lens on this evidence.`
     - `I have a long chat I can't paste in full — how should I summarize it for Workprint?`
3. Under **Capabilities**, enable **Code Interpreter & Data Analysis** (needed
   to run `build_evidence_packet.py` against an uploaded project zip). Leave
   **Web Browsing** and **DALL·E Image Generation** off — neither is needed
   and both expand scope beyond what this bundle is meant to do.
4. Under **Knowledge**, upload all six files from the `knowledge/` folder in
   this directory.
5. Test it with a real (or sample) project before sharing: try a zipped
   project upload, a pasted-excerpt-only conversation, and the four
   conversation starters above. Confirm the privacy disclosure appears before
   any real evidence is processed, and that the first response is an insight,
   not a file inventory.
6. Publish visibility is your call in the GPT builder (only me / link / GPT
   Store) — nothing here decides that for you.

## Why Two Evidence Paths Exist

ChatGPT cannot read a user's local folder directly, so this bundle offers
two ways to get evidence to the model, both documented in `instructions.md`:

1. **Zip upload + Code Interpreter** — closest to parity with the Claude
   Skill, since the same deterministic script runs and applies the same
   directory-exclusion and sensitive-term blocking before the model ever
   reasons over content.
2. **Direct paste/upload of individual files** — works with no setup, but
   has no code-level bounding behind it; the model is the only thing
   deciding what to skip. `instructions.md` tells it to say so.

## Keeping This In Sync

If `workprint-investigator/SKILL.md` or its `references/*.md` change, review
whether `instructions.md` and the files in `knowledge/` need the same update.
These are two separate copies of the same rules — nothing enforces that they
stay identical, so treat a SKILL.md change as a prompt to check this folder
too.
