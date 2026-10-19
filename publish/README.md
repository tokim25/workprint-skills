# Workprint publish (milestone 1)

Publishes a finished Workprint report as a private, encrypted link. The server stores ciphertext only. This is a local development build and is not deployed anywhere.

## How it works

1. `workprint-investigator/scripts/build_publish_link.py report.json` checks the report and prints a link with the compressed report after the `#`. That part is never sent to a server.
2. Opening the link shows a preview in the browser, with a switch for each excerpt. Excerpts are off unless the creator turns them on, and the ones left off are removed before anything is uploaded.
3. Publish encrypts the report in the browser (AES-GCM) and uploads the ciphertext. The key goes into the share link after the `#`. A second link deletes the report.
4. The reader page decrypts in the browser, checks the report again, and shows it with a note that Workprint has not verified it.

## Try it

```bash
python3 publish/server/dev_server.py        # http://127.0.0.1:8765
python3 workprint-investigator/scripts/build_publish_link.py publish/fixtures/sample-report.json --base-url http://127.0.0.1:8765/publish.html
```

Open the printed link in a browser.

## Tests

```bash
node --test publish/tests/publish.test.mjs publish/tests/handlers.test.mjs
python3 -m unittest discover -s publish/tests -p 'test_*.py'
```

## Production build (deployed)

`publish/` is a Vercel project: static pages in `web/`, functions in `api/`, storage in a private Vercel Blob store, and a daily cron that deletes expired reports. `vercel.json` sets a strict content security policy (no inline scripts, no third-party requests), no-referrer and noindex headers.

To deploy, someone with the Vercel account needs to:
1. Create the project with `publish/` as the root directory.
2. Create a Blob store and connect it to the project, which sets `BLOB_READ_WRITE_TOKEN`.
3. Set `CRON_SECRET` to a long random value.
4. Put the live publish URL into `DEFAULT_BASE` in `build_publish_link.py` and its copy in `chatgpt-custom-gpt/knowledge/`. Done: `https://workprint-publish.vercel.app/publish.html`.

The handler logic is tested with an in-memory store. The Blob adapter has run against a real private store: one report was published and read back as ciphertext only.

Vercel keeps its own request logs, which can include IP addresses. Workprint stores none, but the platform may. Say so in any privacy notice.

## Not built yet

- Rate limiting and abuse reporting.
- A measured link length in the real Claude and ChatGPT interfaces. The sample report makes a 1,466-character link.
