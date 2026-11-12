#!/usr/bin/env python3
"""Regression tests for WISE² Remote Command; no external packages needed."""
import importlib.util
import json
import secrets
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("wise2_remote_agent", HERE / "agent.py")
agent = importlib.util.module_from_spec(spec)
spec.loader.exec_module(agent)

class RemoteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = TemporaryDirectory()
        cls.token = secrets.token_hex(32)
        cls.audit = Path(cls.temp.name) / "audit.jsonl"
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), agent.build_handler(cls.token, cls.audit))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = "http://127.0.0.1:%d" % cls.server.server_address[1]
    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.temp.cleanup()
    def request(self, path, data=None, token=None):
        headers = {}
        if token is not None:
            headers["Authorization"] = "Bearer " + token
        if data is not None:
            headers["Content-Type"] = "application/json"
        request = urllib.request.Request(self.url + path,
            data=None if data is None else json.dumps(data).encode(), headers=headers)
        try:
            with urllib.request.urlopen(request, timeout=5) as response:
                return response.status, json.load(response)
        except urllib.error.HTTPError as err:
            return err.code, json.load(err)
    def test_health(self):
        status, body = self.request("/health")
        self.assertEqual(status, 200)
        self.assertEqual(body["mode"], "read-only")
    def test_no_unauthorized_diagnostics(self):
        self.assertEqual(self.request("/v1/diagnostics", {"task": "system.uptime"})[0], 401)
    def test_unknown_task_rejected(self):
        self.assertEqual(self.request("/v1/diagnostics", {"task": "shell.exec"}, self.token)[0], 400)
    def test_injection_rejected(self):
        self.assertEqual(self.request("/v1/diagnostics", {"task": "system.uptime; id"}, self.token)[0], 400)
    def test_extra_args_rejected(self):
        self.assertEqual(self.request("/v1/diagnostics", {"task": "system.uptime", "args": ["-x"]}, self.token)[0], 400)
    def test_diagnostics_work(self):
        status, body = self.request("/v1/diagnostics", {"task": "system.uptime"}, self.token)
        self.assertEqual(status, 200)
        self.assertEqual(body["results"][0]["exit_code"], 0)
    def test_audit_created(self):
        self.request("/v1/diagnostics", {"task": "system.disk"}, self.token)
        self.assertIn("system.disk", self.audit.read_text())

if __name__ == "__main__":
    unittest.main()
