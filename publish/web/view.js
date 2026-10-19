import { decryptReport, validateReport, renderReport } from "./workprint.js";

const $ = (id) => document.getElementById(id);
const fail = (msg) => { $("status").textContent = msg; };

try {
  const [id, key] = location.hash.slice(1).split(".");
  if (!id || !key) throw new Error("link");
  const res = await fetch(`api/reports/${encodeURIComponent(id)}`);
  if (res.status === 404 || res.status === 410) throw new Error("gone");
  const report = await decryptReport(await res.json(), key);
  const errs = validateReport(report);
  if (errs.length) throw new Error("invalid");
  $("status").hidden = true;
  renderReport(document, $("report"), report);
  $("foot").hidden = false;
} catch (e) {
  fail(e.message === "gone" ? "This report has expired or was deleted."
     : "This link is incomplete or the report could not be opened.");
}
