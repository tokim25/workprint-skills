"""Local dev server for the publish flow. Stores ciphertext only.

Run: python3 publish/server/dev_server.py [port]
This is a development stand-in, not production hosting.
"""
import hashlib
import hmac
import json
import secrets
import sys
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

WEB = Path(__file__).resolve().parent.parent / "web"
DATA = Path(__file__).resolve().parent / "data"
MAX_BODY = 200_000
ALLOWED_DAYS = {7, 30, 90}


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):  # no request logging: no IPs written anywhere
        pass

    def _json(self, status, body=None):
        raw = json.dumps(body or {}).encode()
        self.send_response(status)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(raw)))
        self.send_header("cache-control", "no-store")
        self.end_headers()
        self.wfile.write(raw)

    def _record_path(self, rid):
        return DATA / f"{rid}.json" if rid.isalnum() else None

    def do_POST(self):
        if self.path != "/api/reports":
            return self._json(404)
        length = int(self.headers.get("content-length", 0))
        if length > MAX_BODY:
            return self._json(413)
        try:
            body = json.loads(self.rfile.read(length))
            days = int(body["expires_days"])
            ciphertext, iv = body["ciphertext"], body["iv"]
            assert isinstance(ciphertext, str) and isinstance(iv, str) and days in ALLOWED_DAYS
        except (ValueError, KeyError, AssertionError, TypeError):
            return self._json(400)
        rid, token = secrets.token_urlsafe(16).replace("-", "a").replace("_", "b"), secrets.token_urlsafe(24)
        DATA.mkdir(exist_ok=True)
        (DATA / f"{rid}.json").write_text(json.dumps({
            "ciphertext": ciphertext, "iv": iv, "token_hash": _hash(token),
            "expires": time.time() + days * 86400, "opens": 0,
        }))
        self._json(201, {"id": rid, "delete_token": token})

    def do_GET(self):
        if not self.path.startswith("/api/reports/"):
            return super().do_GET()
        path = self._record_path(self.path.rsplit("/", 1)[1])
        if not path or not path.exists():
            return self._json(404)
        rec = json.loads(path.read_text())
        if rec["expires"] < time.time():
            path.unlink()
            return self._json(410)
        rec["opens"] += 1  # an approximate count, no identity
        path.write_text(json.dumps(rec))
        self._json(200, {"ciphertext": rec["ciphertext"], "iv": rec["iv"]})

    def do_DELETE(self):
        path = self._record_path(self.path.rsplit("/", 1)[1]) if self.path.startswith("/api/reports/") else None
        if not path or not path.exists():
            return self._json(404)
        rec = json.loads(path.read_text())
        token = self.headers.get("x-delete-token", "")
        if not hmac.compare_digest(rec["token_hash"], _hash(token)):
            return self._json(403)
        path.unlink()
        self._json(200)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    server = ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(WEB)))
    print(f"Workprint publish dev server on http://127.0.0.1:{port}/publish.html")
    server.serve_forever()
