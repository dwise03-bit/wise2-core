"""Backend tests for WISE² Sound Labs Command Center API."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://build-exact-13.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "dwise@wise2.net"
ADMIN_PASSWORD = "Glock19!"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data
    return data["token"]


@pytest.fixture(scope="session")
def auth_session(session, token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    return s


# ---------- Health ----------
class TestHealth:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "online"


# ---------- Auth ----------
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert "token" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "Administrator"
        assert isinstance(data["token"], str) and len(data["token"]) > 0

    def test_login_wrong_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass"})
        assert r.status_code == 401

    def test_login_unknown_email(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "nobody@example.com", "password": "x"})
        assert r.status_code == 401

    def test_me_authenticated(self, auth_session):
        r = auth_session.get(f"{API}/auth/me")
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert "password_hash" not in data
        assert "_id" not in data

    def test_me_unauthenticated(self, session):
        r = session.get(f"{API}/auth/me")
        assert r.status_code == 401


# ---------- Dashboard aggregate ----------
class TestDashboard:
    def test_dashboard_shape(self, session):
        r = session.get(f"{API}/dashboard")
        assert r.status_code == 200
        d = r.json()
        for key in ["stats", "live_studio", "schedule", "projects", "feed",
                    "leaderboard", "discord", "enterprise", "update", "roadmap", "metrics"]:
            assert key in d, f"Missing key: {key}"
        assert d["stats"]["live_viewers"] == 358
        assert d["stats"]["community_online"] == 1247
        assert d["live_studio"]["is_live"] is True
        assert len(d["live_studio"]["stages"]) == 7
        assert len(d["schedule"]) == 7
        assert len(d["projects"]) >= 4
        assert len(d["feed"]) >= 3
        assert len(d["leaderboard"]) >= 5
        assert d["discord"]["invite"].startswith("https://discord.gg/")
        assert isinstance(d["discord"]["benefits"], list) and len(d["discord"]["benefits"]) >= 5
        # No mongo _id leaks
        for arr_key in ["projects", "feed", "leaderboard"]:
            for item in d[arr_key]:
                assert "_id" not in item


# ---------- Chat ----------
class TestChat:
    def test_get_chat(self, session):
        r = session.get(f"{API}/chat")
        assert r.status_code == 200
        msgs = r.json()
        assert isinstance(msgs, list)
        assert len(msgs) >= 5
        for m in msgs:
            assert "_id" not in m
            assert "text" in m and "user" in m

    def test_post_chat_authenticated(self, auth_session):
        payload = {"text": "TEST_chat_message_from_pytest"}
        r = auth_session.post(f"{API}/chat", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data["text"] == payload["text"]
        assert data["role"] == "ADMIN"
        assert "id" in data
        # Verify persisted via GET
        g = auth_session.get(f"{API}/chat")
        assert g.status_code == 200
        assert any(m["id"] == data["id"] for m in g.json())

    def test_post_chat_unauthenticated(self, session):
        r = session.post(f"{API}/chat", json={"text": "should fail"})
        assert r.status_code == 401


# ---------- Feed ----------
class TestFeed:
    def test_like_post(self, session, auth_session):
        # Get a post id
        d = session.get(f"{API}/dashboard").json()
        post = d["feed"][0]
        before = post["likes"]
        r = auth_session.post(f"{API}/feed/{post['id']}/like")
        assert r.status_code == 200
        after = r.json()
        assert after["likes"] == before + 1
        assert "_id" not in after

    def test_like_unknown_post(self, auth_session):
        r = auth_session.post(f"{API}/feed/nonexistent-id/like")
        assert r.status_code == 404

    def test_like_unauthenticated(self, session):
        d = session.get(f"{API}/dashboard").json()
        post = d["feed"][0]
        r = session.post(f"{API}/feed/{post['id']}/like")
        assert r.status_code == 401


# ---------- Notifications ----------
class TestNotifications:
    def test_get_notifications(self, session):
        r = session.get(f"{API}/notifications")
        assert r.status_code == 200
        data = r.json()
        assert "items" in data and "unread" in data
        assert isinstance(data["items"], list)
        assert len(data["items"]) >= 5
        for n in data["items"]:
            assert "_id" not in n

    def test_mark_read(self, auth_session):
        r = auth_session.post(f"{API}/notifications/read")
        assert r.status_code == 200
        assert r.json().get("ok") is True
        # Verify unread == 0 after
        n = auth_session.get(f"{API}/notifications").json()
        assert n["unread"] == 0

    def test_mark_read_unauthenticated(self, session):
        r = session.post(f"{API}/notifications/read")
        assert r.status_code == 401


# ---------- Search ----------
class TestSearch:
    def test_search_empty(self, session):
        r = session.get(f"{API}/search", params={"q": ""})
        assert r.status_code == 200
        assert r.json() == {"projects": []}

    def test_search_hit(self, session):
        r = session.get(f"{API}/search", params={"q": "urban"})
        assert r.status_code == 200
        data = r.json()
        assert any("urban" in p["name"].lower() for p in data["projects"])
