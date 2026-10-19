// Run: node --test publish/tests/publish.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  validateReport, stripHiddenExcerpts, encryptReport, decryptReport, decodeReportInput,
} from "../web/workprint.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const samplePath = path.join(here, "..", "fixtures", "sample-report.json");
const script = path.join(here, "..", "..", "workprint-investigator", "scripts", "build_publish_link.py");
const sample = () => JSON.parse(readFileSync(samplePath, "utf8"));

test("sample report is valid", () => assert.deepEqual(validateReport(sample()), []));

test("rejects uncited claims, unknown ids, percentages and scoring", () => {
  const r = sample();
  r.findings[0].evidence = [];
  r.findings[1].evidence = ["NOPE"];
  r.findings[2].text = "The user did 70% of the work.";
  r.findings[3].text = "The user earned a high score for review.";
  const errs = validateReport(r).join(" ");
  assert.match(errs, /findings\[0\] cites no evidence/);
  assert.match(errs, /unknown evidence NOPE/);
  assert.match(errs, /percentage/);
  assert.match(errs, /scoring language/);
});

test("requires at least one unknown", () => {
  const r = sample(); r.unknowns = [];
  assert.match(validateReport(r).join(" "), /unknown is required/);
});

test("hidden excerpts are removed before upload", () => {
  const out = stripHiddenExcerpts(sample());
  assert.equal(out.evidence.find((e) => e.id === "CHAT-005").excerpt, undefined);
  assert.ok(out.evidence.find((e) => e.id === "CHAT-001").excerpt);
  assert.ok(out.evidence.every((e) => !("show_excerpt" in e)));
  assert.doesNotMatch(JSON.stringify(out), /remove the icons/);
});

test("encrypt then decrypt round-trips, and a wrong key fails", async () => {
  const report = stripHiddenExcerpts(sample());
  const enc = await encryptReport(report);
  assert.doesNotMatch(enc.ciphertext, /pricing/);
  assert.deepEqual(await decryptReport(enc, enc.key), report);
  const other = await encryptReport(report);
  await assert.rejects(() => decryptReport(enc, other.key));
});

test("python publish link decodes in the browser module", async () => {
  const out = execFileSync("python3", [script, samplePath, "--base-url", "https://x.test/publish.html"], { encoding: "utf8" });
  const link = out.trim();
  const decoded = await decodeReportInput(link.slice(link.indexOf("#")));
  assert.deepEqual(decoded, sample());
});

test("pasted raw JSON is accepted", async () => {
  assert.deepEqual(await decodeReportInput(JSON.stringify(sample())), sample());
});
