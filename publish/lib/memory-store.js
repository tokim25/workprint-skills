// In-memory store for tests.
export function memoryStore() {
  const m = new Map();
  let n = 0;
  return {
    async get(k) { const v = m.get(k); return v ? { record: structuredClone(v.record), etag: v.etag } : null; },
    async put(k, record, { etag } = {}) {
      const cur = m.get(k);
      if (etag && cur && cur.etag !== etag) throw new Error("precondition failed");
      m.set(k, { record: structuredClone(record), etag: String(++n) });
    },
    async del(k) { m.delete(k); },
    async list(prefix) { return [...m.keys()].filter((k) => k.startsWith(prefix)); },
    raw: m,
  };
}
