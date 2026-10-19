"""Run: python3 -m unittest discover -s publish/tests -v"""
import json
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "workprint-investigator" / "scripts"))
sys.path.insert(0, str(ROOT / "publish" / "server"))

import build_publish_link as bpl  # noqa: E402
import dev_server  # noqa: E402

SAMPLE = json.loads((ROOT / "publish" / "fixtures" / "sample-report.json").read_text())


class ScriptTests(unittest.TestCase):
    def test_sample_valid(self):
        self.assertEqual(bpl.validate_report(SAMPLE), [])

    def test_rejects_same_cases_as_browser(self):
        r = json.loads(json.dumps(SAMPLE))
        r["findings"][0]["evidence"] = []
        r["findings"][1]["evidence"] = ["NOPE"]
        r["findings"][2]["text"] = "The user did 70% of the work."
        r["findings"][3]["text"] = "The user earned a high score for review."
        r["unknowns"] = []
        errs = " ".join(bpl.validate_report(r))
        for needle in ("cites no evidence", "unknown evidence NOPE", "percentage", "scoring language", "unknown is required"):
            self.assertIn(needle, errs)

    def test_link_has_no_plaintext(self):
        link = bpl.build_link(SAMPLE)
        self.assertNotIn("pricing", link)
        self.assertTrue(link.startswith(bpl.DEFAULT_BASE + "#"))


def _grade(text):
    """Flesch-Kincaid grade level with a simple syllable guess."""
    import re
    words = re.findall(r"[A-Za-z']+", text)
    sentences = max(1, len(re.findall(r"[.!?]+(?:\s|$)", text)))
    syll = sum(max(1, len(re.findall(r"[aeiouy]+", w.lower())) - (1 if w.lower().endswith("e") else 0)) for w in words)
    return 0.39 * len(words) / sentences + 11.8 * syll / len(words) - 15.59


class PlainLanguageTests(unittest.TestCase):
    JARGON = ("commit", "excerpt", "repository", "repo ", "api", "json", "hash", "endpoint")

    def reader_text(self):
        r = SAMPLE
        parts = [r["first_insight"]["text"], r["first_insight"]["why"]]
        parts += [f["text"] for f in r["findings"]] + r["unknowns"] + [e["label"] for e in r["evidence"]]
        return parts

    def test_reads_at_or_below_12th_grade(self):
        grade = _grade(" ".join(self.reader_text()))
        self.assertLessEqual(grade, 12, f"reading grade {grade:.1f}")

    def test_no_engineering_jargon_in_reader_text(self):
        text = " ".join(self.reader_text()).lower()
        self.assertEqual([w for w in self.JARGON if w in text], [])

    def test_first_insight_is_short_and_names_the_person(self):
        fi = SAMPLE["first_insight"]["text"]
        self.assertLessEqual(len(fi.split()), 25)
        self.assertFalse(fi.startswith("The "), "open with the person's name")

    def test_no_the_creator_and_no_guessed_pronouns(self):
        text = " ".join(self.reader_text()).lower()
        self.assertNotIn("the creator", text)
        self.assertEqual([w for w in (" he ", " she ", " his ", " her ", " him ") if w in f" {text} "], [])

    def test_unknowns_open_plainly(self):
        self.assertTrue(all(u.startswith("We can't tell") for u in SAMPLE["unknowns"]))


class BundleSyncTests(unittest.TestCase):
    """The ChatGPT bundle carries copies of these files. They must not drift."""

    def test_gpt_copies_match_skill(self):
        gpt = ROOT / "chatgpt-custom-gpt" / "knowledge"
        skill = ROOT / "workprint-investigator"
        for name, src in (("build_publish_link.py", skill / "scripts"), ("report-format.md", skill / "references")):
            self.assertEqual((gpt / name).read_text(), (src / name).read_text(), name)

    def test_gpt_instructions_fit_the_builder_limit(self):
        text = (ROOT / "chatgpt-custom-gpt" / "instructions.md").read_text().split("\n---\n", 1)[1]
        self.assertLess(len(text), 8000)


class ServerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        dev_server.DATA = Path(self.tmp.name)
        self.srv = ThreadingHTTPServer(("127.0.0.1", 0), partial(dev_server.Handler, directory=str(dev_server.WEB)))
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()
        self.base = f"http://127.0.0.1:{self.srv.server_port}"

    def tearDown(self):
        self.srv.shutdown()
        self.srv.server_close()
        self.tmp.cleanup()

    def call(self, method, path, body=None, headers=None):
        req = urllib.request.Request(self.base + path, method=method, headers=headers or {},
                                     data=json.dumps(body).encode() if body is not None else None)
        try:
            with urllib.request.urlopen(req) as r:
                return r.status, json.loads(r.read())
        except urllib.error.HTTPError as e:
            return e.code, None

    def publish(self, days=30):
        return self.call("POST", "/api/reports", {"ciphertext": "abc", "iv": "def", "expires_days": days})

    def test_publish_read_delete(self):
        status, made = self.publish()
        self.assertEqual(status, 201)
        self.assertEqual(self.call("GET", f"/api/reports/{made['id']}"), (200, {"ciphertext": "abc", "iv": "def"}))
        self.assertEqual(self.call("DELETE", f"/api/reports/{made['id']}", headers={"x-delete-token": "wrong"})[0], 403)
        self.assertEqual(self.call("DELETE", f"/api/reports/{made['id']}", headers={"x-delete-token": made["delete_token"]})[0], 200)
        self.assertEqual(self.call("GET", f"/api/reports/{made['id']}")[0], 404)

    def test_rejects_bad_expiry_and_stores_no_key(self):
        self.assertEqual(self.publish(days=365)[0], 400)
        _, made = self.publish()
        stored = (Path(self.tmp.name) / f"{made['id']}.json").read_text()
        self.assertNotIn(made["delete_token"], stored)  # only a hash is kept

    def test_expired_report_is_gone(self):
        _, made = self.publish()
        p = Path(self.tmp.name) / f"{made['id']}.json"
        rec = json.loads(p.read_text()); rec["expires"] = 0; p.write_text(json.dumps(rec))
        self.assertEqual(self.call("GET", f"/api/reports/{made['id']}")[0], 410)


if __name__ == "__main__":
    unittest.main()
