const [id, token] = location.hash.slice(1).split(".");
document.getElementById("go").addEventListener("click", async () => {
  const out = document.getElementById("out");
  if (!id || !token) { out.textContent = "This link is incomplete."; return; }
  const res = await fetch(`api/reports/${encodeURIComponent(id)}`, { method: "DELETE", headers: { "x-delete-token": token } });
  out.textContent = res.ok ? "Deleted." : "Could not delete. It may already be gone.";
});
