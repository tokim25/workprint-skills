import { createReport, MAX_BODY } from "../../lib/handlers.js";
import { blobStore } from "../../lib/blob-store.js";
import { send, readJson } from "../../lib/respond.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, { status: 405 });
  const body = await readJson(req, MAX_BODY + 1000);
  if (body === null) return send(res, { status: 413 });
  send(res, await createReport(blobStore, body));
}
