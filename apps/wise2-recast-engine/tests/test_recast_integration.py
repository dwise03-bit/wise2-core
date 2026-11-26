"""End-to-end integration tests for WISE² RECAST ENGINE × OpenJutsu."""
from __future__ import annotations

import http.server
import json
import os
import shutil
import socketserver
import struct
import threading
import zlib
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import auth, backends, hardware, main, recast, store

FIXTURE_VIDEO = Path(__file__).resolve().parents[1] / "fixtures" / "synthetic_36s.mp4"


def _make_png_bytes(width: int = 64, height: int = 64) -> bytes:
    """Create a valid minimal RGB PNG image in memory (authorized synthetic test asset)."""
    raw = b"".join(b"\x00" + (b"\x00\xd9\xff" * width) for _ in range(height))

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b"")


@pytest.fixture()
def isolated_env(tmp_path, monkeypatch):
    monkeypatch.setenv("WISE2_DATA_DIR", str(tmp_path))
    monkeypatch.delenv("WISE2_ACCESS_PASSWORD", raising=False)
    monkeypatch.delenv("OPENJUTSU_PASSWORD", raising=False)
    monkeypatch.delenv("WISE2_ALLOW_PAID_BACKENDS", raising=False)
    store.set_db(tmp_path / "jobs.sqlite3")
    auth.reset_auth_state_for_tests()
    yield tmp_path
    store.set_db(None)
    auth.reset_auth_state_for_tests()


def _start_mock_comfyui_server(sample_mp4: Path, required_nodes: list[str]):
    """Spin up a real local HTTP server implementing ComfyUI's REST API contract."""
    state = {"uploads": [], "prompts": []}

    class Handler(http.server.BaseHTTPRequestHandler):
        def log_message(self, format, *args):
            return

        def _send_json(self, code: int, obj):
            body = json.dumps(obj).encode("utf-8")
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            if self.path == "/queue":
                return self._send_json(200, {"queue_running": [], "queue_pending": []})
            if self.path == "/system_stats":
                return self._send_json(200, {"system": {"comfyui_version": "0.42.0-mock"}, "devices": [{"name": "Mock Remote GPU"}]})
            if self.path == "/websocket_reconnect_fix":
                return self._send_json(200, {"ok": True})
            if self.path.startswith("/object_info/"):
                node = self.path.split("/object_info/", 1)[1]
                if node in required_nodes:
                    return self._send_json(200, {node: {"input": {"required": {}}}})
                return self._send_json(200, {})
            if self.path.startswith("/history/"):
                pid = self.path.split("/history/", 1)[1]
                return self._send_json(200, {
                    pid: {
                        "status": {"status_str": "success"},
                        "outputs": {
                            "67": {"videos": [{"filename": "recast_result.mp4", "subfolder": "", "type": "output"}]}
                        },
                    }
                })
            if self.path.startswith("/view?"):
                data = sample_mp4.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "video/mp4")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return
            self.send_response(404)
            self.end_headers()

        def do_POST(self):
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length)
            if self.path == "/upload/image":
                state["uploads"].append(len(body))
                return self._send_json(200, {"name": f"uploaded_{len(state['uploads'])}.bin", "subfolder": "wise2_recast"})
            if self.path == "/prompt":
                parsed = json.loads(body.decode("utf-8"))
                state["prompts"].append(parsed)
                return self._send_json(200, {"prompt_id": "mock-prompt-001"})
            self.send_response(404)
            self.end_headers()

    httpd = socketserver.TCPServer(("127.0.0.1", 0), Handler)
    port = httpd.server_address[1]
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd, f"http://127.0.0.1:{port}", state


def test_hardware_detection_and_paid_guard(isolated_env):
    client = TestClient(main.app)
    r = client.get("/api/hardware")
    assert r.status_code == 200
    hw = r.json()
    assert hw["toolchain"]["ffmpeg"]["found"] is True
    assert hw["toolchain"]["python"]["found"] is True
    assert "recommended_backend" in hw

    # RunPod paid fallback must be blocked without explicit opt-in
    r_paid = client.put("/api/backends/runpod", json={"comfyui_url": "https://example.proxy.runpod.net", "set_active": True})
    assert r_paid.status_code == 403

    # On non-CUDA ThinkPad X1, local-nvidia must also be blocked
    if not hw["gpu"]["local_render_allowed"]:
        r_loc = client.put("/api/backends/local-nvidia", json={"set_active": True})
        assert r_loc.status_code == 403


def test_authentication_and_file_magic_validation(isolated_env, monkeypatch):
    monkeypatch.setenv("WISE2_ACCESS_PASSWORD", "Wise2-Obsidian-Forged-2026!")
    client = TestClient(main.app)

    # Health & auth status stay accessible
    assert client.get("/api/health").status_code == 200
    assert client.get("/api/auth/status").json()["authenticated"] is False

    # Protected API rejects unauthenticated access
    assert client.get("/api/recast/capabilities").status_code == 401
    assert client.get("/api/recast/profiles").status_code == 401

    # Wrong password rejected
    assert client.post("/api/auth/login", json={"password": "wrong-password"}).status_code == 401

    # Correct password sets signed HttpOnly cookie & returns bearer token
    login = client.post("/api/auth/login", json={"password": "Wise2-Obsidian-Forged-2026!"})
    assert login.status_code == 200
    assert login.json()["authenticated"] is True
    assert client.get("/api/recast/capabilities").status_code == 200

    # Reject fake PNG (invalid magic bytes)
    bad_img = client.post(
        "/api/recast/profiles",
        data={"name": "FakeImg", "category": "character"},
        files={"image": ("fake.png", b"NOT_A_REAL_PNG_FILE_CONTENT", "image/png")},
    )
    assert bad_img.status_code == 400

    # Reject fake MP4 (invalid magic bytes)
    bad_vid = client.post(
        "/api/recast/jobs",
        data={"capability_id": "background_replacement"},
        files={"video": ("fake.mp4", b"NOT_A_REAL_MP4_STREAM_DATA", "video/mp4")},
    )
    assert bad_vid.status_code == 400


def test_character_vault_and_license_gate(isolated_env):
    client = TestClient(main.app)
    caps = client.get("/api/recast/capabilities").json()
    assert len(caps["capabilities"]) == 13
    assert len(caps["relight_presets"]) == 17

    png = _make_png_bytes()
    created = client.post(
        "/api/recast/profiles",
        data={"name": "WISE2 Studio Host", "role": "the host", "category": "character"},
        files={"image": ("host.png", png, "image/png")},
    )
    assert created.status_code == 201
    prof = created.json()
    assert prof["name"] == "WISE2 Studio Host"
    assert len(prof["sha256"]) == 64

    # Verify image retrieval and persistence
    img_r = client.get(prof["image_url"])
    assert img_r.status_code == 200
    assert img_r.content == png
    assert len(client.get("/api/recast/profiles").json()["profiles"]) == 1

    # Fix Faces must enforce non-commercial license acknowledgement
    vid_bytes = FIXTURE_VIDEO.read_bytes()
    denied = client.post(
        "/api/recast/jobs",
        data={
            "capability_id": "facial_consistency",
            "profile_ids": json.dumps([prof["id"]]),
            "accept_noncommercial_face_license": "false",
        },
        files={"video": ("clip.mp4", vid_bytes, "video/mp4")},
    )
    assert denied.status_code == 403

    # Delete profile
    assert client.delete(f"/api/recast/profiles/{prof['id']}").status_code == 200
    assert len(client.get("/api/recast/profiles").json()["profiles"]) == 0


def test_six_second_480p_recast_e2e_and_recovery(isolated_env):
    """Attempt a real 6-second 480p character replacement pipeline:
    1) Verify honest awaiting_gpu_backend state when remote GPU is offline (while still preparing real 6s 480p MP4 & OpenJutsu graph).
    2) Retry against a live mock ComfyUI HTTP server and verify full upload -> prompt -> poll -> MP4 export -> ffprobe QC.
    """
    assert FIXTURE_VIDEO.is_file(), "Authorized synthetic_36s.mp4 test fixture missing"
    client = TestClient(main.app)

    # Save character profile in vault
    prof = client.post(
        "/api/recast/profiles",
        data={"name": "WISE2 Lead", "role": "the presenter", "category": "character"},
        files={"image": ("lead.png", _make_png_bytes(), "image/png")},
    ).json()

    # Configure unreachable remote backend first to test error recovery
    client.put("/api/backends/remote-comfyui", json={"comfyui_url": "http://127.0.0.1:19999", "set_active": True})

    res = client.post(
        "/api/recast/jobs",
        data={
            "capability_id": "character_replacement",
            "profile_ids": json.dumps([prof["id"]]),
            "resolution": "480p",
            "duration_sec": "6",
            "start_sec": "0",
            "role": "the presenter",
            "run_sync": "true",
        },
        files={"video": ("synthetic_36s.mp4", FIXTURE_VIDEO.read_bytes(), "video/mp4")},
    )
    assert res.status_code == 202
    job = res.json()
    assert job["status"] == "awaiting_gpu_backend"
    assert job["prepared_meta"]["duration_sec"] == pytest.approx(6.0, abs=0.35)
    assert min(job["prepared_meta"]["width"], job["prepared_meta"]["height"]) == 480

    # Compiled OpenJutsu graph is downloadable and valid JSON
    graph_r = client.get(job["workflow_url"])
    assert graph_r.status_code == 200
    compiled_graph = graph_r.json()
    assert any(n.get("class_type") == "VHS_LoadVideo" for n in compiled_graph.values())
    assert any(n.get("class_type") == "H3OneClickSwapPlan" for n in compiled_graph.values())

    # Now start mock ComfyUI HTTP server implementing the real ComfyUI API contract and retry
    prepared_path = recast.get_job_file(job["id"], "prepared")
    assert prepared_path and prepared_path.is_file()
    req_nodes = recast.required_nodes_for_workflow("simple")
    httpd, mock_url, mock_state = _start_mock_comfyui_server(prepared_path, req_nodes)
    try:
        client.put("/api/backends/remote-comfyui", json={"comfyui_url": mock_url, "set_active": True})
        probe = client.post("/api/backends/remote-comfyui/probe", json={"workflow": "simple"}).json()
        assert probe["reachable"] is True
        assert probe["ready_for_workflow"] is True

        retried = client.post(
            f"/api/recast/jobs/{job['id']}/retry",
            json={"backend_id": "remote-comfyui", "run_sync": True},
        )
        assert retried.status_code == 202
        done_job = retried.json()
        assert done_job["status"] == "succeeded"
        assert done_job["output_url"] == f"/api/recast/jobs/{job['id']}/output"
        assert len(mock_state["uploads"]) == 2  # 1 prepared video + 1 character reference image
        assert len(mock_state["prompts"]) == 1

        dl = client.get(done_job["output_url"])
        assert dl.status_code == 200
        assert dl.content[4:8] == b"ftyp"
        assert done_job["output_meta"]["duration_sec"] == pytest.approx(6.0, abs=0.35)
    finally:
        httpd.shutdown()


def test_venom_collector_catalog_and_ui_served(isolated_env):
    client = TestClient(main.app)
    cat = client.get("/api/venom/catalog?limit=150").json()
    assert cat["total_catalog"] == 117
    assert len(cat["adapters"]) >= 6

    home = client.get("/")
    assert home.status_code == 200
    assert "WISE² RECAST ENGINE" in home.text
    assert "OBSIDIAN // FORGED" in home.text
