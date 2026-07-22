# Provider Privacy And Licensing

This skill runs in a Claude context. That means selected evidence may be
processed by Claude/Anthropic according to the user's product surface, account
type, settings, and agreements.

## Required Disclosure

Before processing real evidence, say:

> Selected project evidence may be processed in Claude. Make sure you have
> permission to process this material with Claude. Workprint's license covers
> the Workprint skill/software; it does not grant rights to upload client,
> employer, collaborator, confidential, copyrighted, regulated, or proprietary
> evidence to an AI provider.

Keep the disclosure close to the action. Do not bury it in a footer.

## Licensing Boundary

Workprint's license applies to the Workprint code and skill package. It does
not apply to:

- the user's project files;
- employer or client materials;
- collaborator materials;
- third-party copyrighted content;
- open-source dependencies included in the evidence;
- confidential or regulated data;
- provider-generated output terms.

The user may have obligations from:

- employer policy;
- client agreements;
- NDAs;
- contractor or collaborator agreements;
- copyright licenses;
- open-source licenses;
- data-processing agreements;
- Anthropic account terms;
- enterprise retention and data-use settings;
- applicable privacy or industry rules.

Do not give legal advice. Make the boundary visible and recommend checking
permissions when the material is not clearly the user's own.

## Data Minimization

Prefer bounded evidence packets over broad file dumps.

In plain terms, a bounded evidence packet means Claude receives selected
excerpts and metadata from the evidence the user approved, not the user's whole
project folder or complete chat history.

Do not request secrets, credentials, private keys, tokens, certificates,
environment files, or whole dependency/build/cache folders.

When using user-approved chat summaries, say clearly that the summary adds
context without sending or proving the entire underlying chat.
