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
python3 workprint-investigator/scripts/build_publish_link.py publish/fixtures/sample-report.json
```

Open the printed link in a browser.

## Tests

```bash
node --test publish/tests/publish.test.mjs
python3 -m unittest discover -s publish/tests -p 'test_*.py'
```

## Not built yet

- Skill and GPT instructions that produce the report JSON and call the link script.
- Production hosting and storage. The dev server keeps files on disk.
- Rate limiting, abuse reporting and an expiry cleanup job.
- A measured link length in the real Claude and ChatGPT interfaces. The sample report makes a 1,466-character link.
