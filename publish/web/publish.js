import { decodeReportInput, validateReport, stripHiddenExcerpts, encryptReport, renderReport } from "./workprint.js";

const $ = (id) => document.getElementById(id);
let report = null;

function show(r) {
  const errs = validateReport(r);
  $("errors").textContent = errs.join(" ");
  if (errs.length) return;
  report = r;
  $("paste").hidden = true;
  $("preview").hidden = false;
  renderReport(document, $("report"), report, {
    preview: true,
    onToggle: (id, on) => { report.evidence.find((e) => e.id === id).show_excerpt = on; },
  });
}

async function load(text) {
  try { show(await decodeReportInput(text)); }
  catch { $("errors").textContent = "That does not look like a Workprint report."; $("paste").hidden = false; }
}

$("load").addEventListener("click", () => load($("input").value));
if (location.hash.length > 1) {
  load(location.hash);
  history.replaceState(null, "", location.pathname); // keep the report out of history
} else $("paste").hidden = false;

$("publish").addEventListener("click", async () => {
  $("publish").disabled = true;
  try {
    const enc = await encryptReport(stripHiddenExcerpts(report));
    const res = await fetch("api/reports", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ ciphertext: enc.ciphertext, iv: enc.iv, expires_days: Number($("expiry").value) }),
    });
    if (!res.ok) throw new Error();
    const { id, delete_token } = await res.json();
    const base = new URL(".", location.href).href;
    $("share").value = `${base}view.html#${id}.${enc.key}`;
    $("revoke").value = `${base}revoke.html#${id}.${delete_token}`;
    $("preview").hidden = true; $("done").hidden = false;
  } catch {
    $("errors").textContent = "Publishing failed. Nothing was shared. Try again.";
    $("publish").disabled = false;
  }
});
