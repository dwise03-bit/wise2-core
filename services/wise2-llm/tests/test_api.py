import os
import sys
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ["WISE2_LLM_API_KEY"] = "test-secret"
from app import app

client = TestClient(app)

def test_auth_required():
    response = client.post("/v1/chat/completions", json={"messages": [{"role": "user", "content": "Hi"}]})
    assert response.status_code == 401

def test_unknown_model_rejected():
    response = client.post("/v1/chat/completions", headers={"Authorization": "Bearer test-secret"}, json={"model": "not-allowlisted", "messages": [{"role": "user", "content": "Hi"}]})
    assert response.status_code == 400

def test_streaming_rejected():
    response = client.post("/v1/chat/completions", headers={"Authorization": "Bearer test-secret"}, json={"stream": True, "messages": [{"role": "user", "content": "Hi"}]})
    assert response.status_code == 400

def test_empty_messages_rejected():
    response = client.post("/v1/chat/completions", headers={"Authorization": "Bearer test-secret"}, json={"messages": []})
    assert response.status_code == 422

def test_model_list():
    response = client.get("/v1/models", headers={"Authorization": "Bearer test-secret"})
    assert response.status_code == 200
    assert response.json()["data"][0]["owned_by"] == "wise2"

def test_mock_inference():
    class FakeResponse:
        def raise_for_status(self): pass
        def json(self):
            return {"message": {"content": "WISE2 ready"}, "prompt_eval_count": 3, "eval_count": 2}
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock, return_value=FakeResponse()):
        response = client.post("/v1/chat/completions", headers={"Authorization": "Bearer test-secret"}, json={"messages": [{"role": "user", "content": "Hi"}]})
    assert response.status_code == 200, response.text
    assert response.json()["choices"][0]["message"]["content"] == "WISE2 ready"
    assert response.json()["usage"]["total_tokens"] == 5
