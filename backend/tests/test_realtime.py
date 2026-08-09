import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect


def _register_and_login(client: TestClient, email: str, password: str = "supersecret") -> str:
    client.post("/api/auth/register", json={"email": email, "password": password})
    response = client.post("/api/auth/login", data={"username": email, "password": password})
    return response.json()["access_token"]


def test_ws_rejects_missing_token(ws_client: TestClient) -> None:
    with pytest.raises(WebSocketDisconnect):
        with ws_client.websocket_connect("/ws/links/whatever"):
            pass


def test_ws_rejects_invalid_token(ws_client: TestClient) -> None:
    with pytest.raises(WebSocketDisconnect):
        with ws_client.websocket_connect("/ws/links/whatever?token=not-a-real-token"):
            pass


def test_ws_rejects_unknown_link(ws_client: TestClient) -> None:
    token = _register_and_login(ws_client, "wsuser@example.com")
    with pytest.raises(WebSocketDisconnect):
        with ws_client.websocket_connect(f"/ws/links/doesnotexist?token={token}"):
            pass


def test_ws_rejects_other_owners_link(ws_client: TestClient) -> None:
    owner_token = _register_and_login(ws_client, "owner@example.com")
    link = ws_client.post(
        "/api/links",
        json={"target_url": "https://example.com/ws"},
        headers={"Authorization": f"Bearer {owner_token}"},
    ).json()

    intruder_token = _register_and_login(ws_client, "intruder@example.com")
    with pytest.raises(WebSocketDisconnect):
        with ws_client.websocket_connect(
            f"/ws/links/{link['short_code']}?token={intruder_token}"
        ):
            pass


def test_ws_me_rejects_missing_token(ws_client: TestClient) -> None:
    with pytest.raises(WebSocketDisconnect):
        with ws_client.websocket_connect("/ws/me"):
            pass


def test_ws_me_rejects_invalid_token(ws_client: TestClient) -> None:
    with pytest.raises(WebSocketDisconnect):
        with ws_client.websocket_connect("/ws/me?token=not-a-real-token"):
            pass
