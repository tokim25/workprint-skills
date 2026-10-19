# Publishable Report Format

Use this format only when the user asks to share or publish their Workprint. It is the same insight written as JSON, so a browser page can check it, show a preview and encrypt it before anything is uploaded.

## Fields

```json
{
  "v": 1,
  "title": "Short project name",
  "platform": "claude",
  "created": "YYYY-MM-DD",
  "first_insight": {
    "text": "One plain sentence about the person's role, 20 to 300 characters.",
    "evidence": ["EVIDENCE-ID"],
    "confidence": "limited",
    "why": "One sentence on why the evidence supports it."
  },
  "findings": [{"text": "One evidence-linked finding.", "evidence": ["EVIDENCE-ID"]}],
  "unknowns": ["A specific gap, not a generic disclaimer."],
  "evidence": [
    {"id": "EVIDENCE-ID", "label": "Plain-words description of the source", "date": "YYYY-MM-DD", "excerpt": "Short quote.", "show_excerpt": false}
  ]
}
```

- `platform` is `claude` or `chatgpt`, whichever you are.
- `confidence` is one of high, moderate, limited, low, unknown.
- Use the evidence IDs from the evidence packet. Every id cited by the first insight or a finding must appear in `evidence`.

## Writing for readers

Readers are clients and hiring managers, not engineers. Write at about a 12th grade reading level.

- The first insight is about the person's role: what they decided, directed, reviewed, turned down or changed. Use the name the user gave you (ask once before publishing). After the first use, repeat the name or say "they". Never guess "he" or "she" from a name. If they give no name, write "this person". Never write "the creator".
- Short sentences, everyday words. Say "saved change" and "quote", not "commit" or "excerpt".
- Source labels describe the source in plain words, for example "Maya's feedback on the first layout", not a file name.
- Unknowns start with "We can't tell".
- Plain words must not make a claim stronger than the evidence supports.

## Rules the publish page enforces

- Every claim cites at least one evidence ID, and the ID exists.
- No percentages and no scoring language ("score", "grade") in the first insight or findings.
- At least one specific unknown.
- Excerpts are private by default. Set `show_excerpt` to `true` only for an excerpt the user has said readers may see. If the user has not said, leave it `false`.
- Do not include names of people other than the user, or client or employer material, in any label, claim or excerpt unless the user chose to share it.

## Producing the link

1. Save the JSON to a file, for example `report.json`.
2. Run `python build_publish_link.py report.json`. It checks the report and prints a link. If it lists errors, fix the report and run it again.
3. Give the user the link and tell them: "Opening this link shows a preview. Nothing is uploaded until you click Publish."

If you cannot run code, or the link is more than about 8,000 characters, or the user's chat does not show it as a working link, give the JSON in a code block instead and tell the user to paste it into the Workprint publish page.

Never say the published report is verified. The reader page says Workprint has not verified it.
