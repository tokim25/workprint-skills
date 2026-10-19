import { readReport, deleteReport } from "../../lib/handlers.js";
import { blobStore } from "../../lib/blob-store.js";
import { send } from "../../lib/respond.js";

export default async function handler(req, res) {
  const id = req.query.id;
  if (req.method === "GET") return send(res, await readReport(blobStore, id));
  if (req.method === "DELETE") return send(res, await deleteReport(blobStore, id, req.headers["x-delete-token"]));
  send(res, { status: 405 });
}
