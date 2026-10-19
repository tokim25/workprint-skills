// Storage-independent request logic. The server only ever sees ciphertext.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const MAX_BODY = 200_000;
export const ALLOWED_DAYS = [7, 30, 90];
const key = (id) => `reports/${id}.json`;
const hash = (t) => createHash("sha256").update(t).digest("hex");
const urlsafe = (n) => randomBytes(n).toString("base64url").replace(/[-_]/g, "a");

export async function createReport(store, body, now = Date.now()) {
  const { ciphertext, iv, expires_days: days } = body || {};
  if (typeof ciphertext !== "string" || typeof iv !== "string" || !ALLOWED_DAYS.includes(days)) return { status: 400 };
  if (ciphertext.length + iv.length > MAX_BODY) return { status: 413 };
  const id = urlsafe(16), token = randomBytes(24).toString("base64url");
  await store.put(key(id), { ciphertext, iv, token_hash: hash(token), expires: now + days * 86_400_000, opens: 0 });
  return { status: 201, body: { id, delete_token: token } };
}

export async function readReport(store, id, now = Date.now()) {
  if (!/^[A-Za-z0-9]+$/.test(id || "")) return { status: 404 };
  const found = await store.get(key(id));
  if (!found) return { status: 404 };
  const { record, etag } = found;
  if (record.expires < now) { await store.del(key(id)); return { status: 410 }; }
  // Approximate open count. A lost update under concurrency is acceptable.
  try { await store.put(key(id), { ...record, opens: record.opens + 1 }, { etag }); } catch {}
  return { status: 200, body: { ciphertext: record.ciphertext, iv: record.iv } };
}

export async function deleteReport(store, id, token, now = Date.now()) {
  if (!/^[A-Za-z0-9]+$/.test(id || "")) return { status: 404 };
  const found = await store.get(key(id));
  if (!found) return { status: 404 };
  const a = Buffer.from(found.record.token_hash), b = Buffer.from(hash(token || ""));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { status: 403 };
  await store.del(key(id));
  return { status: 200 };
}

// Removes reports past their expiry, including ones nobody opened again.
export async function purgeExpired(store, now = Date.now()) {
  let removed = 0;
  for (const k of await store.list("reports/")) {
    const found = await store.get(k);
    if (found && found.record.expires < now) { await store.del(k); removed++; }
  }
  return removed;
}
