// Run: node --test publish/tests/handlers.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { createReport, readReport, deleteReport, purgeExpired } from "../lib/handlers.js";
import { memoryStore } from "../lib/memory-store.js";

const body = { ciphertext: "abc", iv: "def", expires_days: 30 };

test("publish, read, delete", async () => {
  const s = memoryStore();
  const made = await createReport(s, body);
  assert.equal(made.status, 201);
  assert.deepEqual((await readReport(s, made.body.id)).body, { ciphertext: "abc", iv: "def" });
  assert.equal((await deleteReport(s, made.body.id, "wrong")).status, 403);
  assert.equal((await deleteReport(s, made.body.id, made.body.delete_token)).status, 200);
  assert.equal((await readReport(s, made.body.id)).status, 404);
});

test("rejects bad input and oversize bodies", async () => {
  const s = memoryStore();
  assert.equal((await createReport(s, { ...body, expires_days: 365 })).status, 400);
  assert.equal((await createReport(s, { iv: "x", expires_days: 7 })).status, 400);
  assert.equal((await createReport(s, null)).status, 400);
  assert.equal((await createReport(s, { ...body, ciphertext: "a".repeat(250_000) })).status, 413);
});

test("the delete token is stored only as a hash and nothing identifies the creator", async () => {
  const s = memoryStore();
  const { body: made } = await createReport(s, body);
  const stored = JSON.stringify([...s.raw.values()]);
  assert.ok(!stored.includes(made.delete_token));
  assert.deepEqual(Object.keys([...s.raw.values()][0].record).sort(), ["ciphertext", "expires", "iv", "opens", "token_hash"]);
});

test("expired reports are gone, and unread expired ones are purged", async () => {
  const s = memoryStore();
  const t0 = 1_000_000;
  const a = await createReport(s, body, t0), b = await createReport(s, body, t0);
  const later = t0 + 31 * 86_400_000;
  assert.equal((await readReport(s, a.body.id, later)).status, 410);
  assert.equal(await purgeExpired(s, later), 1); // b was never read
  assert.equal((await readReport(s, b.body.id, later)).status, 404);
});

test("opens are counted", async () => {
  const s = memoryStore();
  const { body: made } = await createReport(s, body);
  await readReport(s, made.id); await readReport(s, made.id);
  assert.equal([...s.raw.values()][0].record.opens, 2);
});

test("ids with path characters are refused", async () => {
  assert.equal((await readReport(memoryStore(), "../x")).status, 404);
});
