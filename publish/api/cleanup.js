import { purgeExpired } from "../lib/handlers.js";
import { blobStore } from "../lib/blob-store.js";
import { send } from "../lib/respond.js";

// Called daily by Vercel Cron. Vercel sends the CRON_SECRET as a bearer token.
export default async function handler(req, res) {
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`)
    return send(res, { status: 401 });
  send(res, { status: 200, body: { removed: await purgeExpired(blobStore) } });
}
