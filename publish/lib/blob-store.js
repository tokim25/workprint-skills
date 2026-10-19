// Vercel Blob adapter. Blobs are private: only these functions can read them.
// Not exercised against real Blob until a store exists and the project is deployed.
import { put, get, del, list } from "@vercel/blob";

export const blobStore = {
  async get(k) {
    const r = await get(k, { access: "private", useCache: false });
    if (!r || r.statusCode !== 200) return null;
    return { record: JSON.parse(await new Response(r.stream).text()), etag: r.blob.etag };
  },
  async put(k, record, { etag } = {}) {
    await put(k, JSON.stringify(record), {
      access: "private", contentType: "application/json", allowOverwrite: true, addRandomSuffix: false,
      ...(etag ? { ifMatch: etag } : {}),
    });
  },
  async del(k) { await del(k); },
  async list(prefix) {
    const out = []; let cursor;
    do {
      const r = await list({ prefix, cursor });
      out.push(...r.blobs.map((b) => b.pathname));
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor);
    return out;
  },
};
