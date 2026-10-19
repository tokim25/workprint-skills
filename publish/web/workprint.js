// Shared by publish.html and view.html. Works in browsers and in Node 22.
// Reports are untrusted input: render with textContent only, never innerHTML.

export const MAX_REPORT_CHARS = 60000;
const PERCENT = /\d+(\.\d+)?\s*(%|percent\b)/i;
const SCORING = /\b(score[sd]?|scoring|grade[sd]?|grading)\b/i;

export function validateReport(r) {
  const errors = [];
  if (!r || typeof r !== "object") return ["Report is not an object."];
  if (r.v !== 1) errors.push("Unsupported report version.");
  if (typeof r.title !== "string" || !r.title.trim()) errors.push("Missing title.");
  if (!["claude", "chatgpt"].includes(r.platform)) errors.push("platform must be claude or chatgpt.");

  const evidence = Array.isArray(r.evidence) ? r.evidence : [];
  const ids = new Set(evidence.map((e) => e && e.id));
  evidence.forEach((e, i) => {
    if (!e || typeof e.id !== "string" || typeof e.label !== "string") errors.push(`evidence[${i}] needs id and label.`);
  });

  const claims = [];
  const fi = r.first_insight;
  if (!fi || typeof fi.text !== "string") errors.push("Missing first_insight.");
  else {
    if (fi.text.length < 20 || fi.text.length > 300) errors.push("first_insight must be 20 to 300 characters.");
    claims.push(["first_insight", fi]);
  }
  (Array.isArray(r.findings) ? r.findings : []).forEach((f, i) => claims.push([`findings[${i}]`, f]));

  for (const [name, c] of claims) {
    if (!c || typeof c.text !== "string") { errors.push(`${name} needs text.`); continue; }
    if (!Array.isArray(c.evidence) || c.evidence.length === 0) errors.push(`${name} cites no evidence.`);
    else for (const id of c.evidence) if (!ids.has(id)) errors.push(`${name} cites unknown evidence ${id}.`);
    if (PERCENT.test(c.text)) errors.push(`${name} contains a percentage.`);
    if (SCORING.test(c.text)) errors.push(`${name} uses scoring language.`);
  }
  if (!Array.isArray(r.unknowns) || r.unknowns.length === 0 || !r.unknowns.every((u) => typeof u === "string" && u.trim()))
    errors.push("At least one unknown is required.");
  if (JSON.stringify(r).length > MAX_REPORT_CHARS) errors.push("Report is too large.");
  return errors;
}

// Excerpts the creator did not switch on never leave the browser.
export function stripHiddenExcerpts(r) {
  const out = structuredClone(r);
  for (const e of out.evidence || []) {
    if (e.show_excerpt !== true) delete e.excerpt;
    delete e.show_excerpt;
  }
  return out;
}

const b64uEncode = (bytes) => {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const b64uDecode = (str) => {
  const s = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
};
export { b64uEncode, b64uDecode };

async function pipeThrough(bytes, stream) {
  const out = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

// Accepts the "#..." fragment from a publish link, or pasted raw JSON.
export async function decodeReportInput(input) {
  const text = input.trim().replace(/^#/, "");
  if (text.startsWith("{")) return JSON.parse(text);
  const bytes = await pipeThrough(b64uDecode(text), new DecompressionStream("deflate"));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function encryptReport(report) {
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(report));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data));
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key));
  return { ciphertext: b64uEncode(ct), iv: b64uEncode(iv), key: b64uEncode(raw) };
}

export async function decryptReport({ ciphertext, iv }, keyB64) {
  const key = await crypto.subtle.importKey("raw", b64uDecode(keyB64), "AES-GCM", false, ["decrypt"]);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64uDecode(iv) }, key, b64uDecode(ciphertext));
  return JSON.parse(new TextDecoder().decode(pt));
}

function el(doc, tag, props = {}, ...kids) {
  const n = doc.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") n.className = v;
    else n[k] = v;
  }
  for (const k of kids) n.append(k);
  return n;
}

// opts.preview: show excerpt toggles. opts.onToggle(id, checked): called when one changes.
export function renderReport(doc, root, report, opts = {}) {
  root.replaceChildren();
  const byId = new Map(report.evidence.map((e) => [e.id, e]));

  const chips = (ids) =>
    el(doc, "span", { class: "chips" }, ...ids.map((id) => el(doc, "a", { class: "chip", href: `#ev-${id}`, textContent: id })));

  const fi = report.first_insight;
  root.append(
    el(doc, "p", { class: "eyebrow", textContent: report.title }),
    el(doc, "h1", { class: "insight", textContent: fi.text }),
    el(doc, "p", { class: "basis" }, chips(fi.evidence), doc.createTextNode(
      ` ${fi.confidence ? "How sure we are: " + fi.confidence + ". " : ""}${fi.why || ""}`)),
    el(doc, "section", { class: "unknowns" },
      el(doc, "h2", { textContent: "What this cannot tell you" }),
      el(doc, "ul", {}, ...report.unknowns.map((u) => el(doc, "li", { textContent: u })))));

  if (report.findings.length) {
    root.append(el(doc, "h2", { textContent: "What we found" }),
      el(doc, "ul", { class: "findings" }, ...report.findings.map((f) =>
        el(doc, "li", {}, doc.createTextNode(f.text + " "), chips(f.evidence)))));
  }

  root.append(el(doc, "h2", { textContent: "Where this comes from" }));
  for (const e of report.evidence) {
    const body = el(doc, "div", { class: "ev-body" });
    if (opts.preview) {
      const box = el(doc, "input", { type: "checkbox", checked: e.show_excerpt === true });
      box.addEventListener("change", () => opts.onToggle && opts.onToggle(e.id, box.checked));
      body.append(el(doc, "p", { class: "excerpt", textContent: e.excerpt || "(no quote)" }),
        el(doc, "label", {}, box, doc.createTextNode(" Show this quote to readers")));
    } else {
      body.append(el(doc, "p", { class: e.excerpt ? "excerpt" : "hidden", textContent: e.excerpt || "The creator chose not to share this quote." }));
    }
    root.append(el(doc, "details", { id: `ev-${e.id}` },
      el(doc, "summary", { textContent: `${e.id} · ${e.label}${e.date ? " · " + e.date : ""}` }), body));
  }
}
