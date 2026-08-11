from httpx import AsyncClient


async def test_register_creates_user(client: AsyncClient) -> None:
    response = await client.post(
        "/api/auth/register", json={"email": "new@example.com", "password": "supersecret"}
    )
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "new@example.com"
    assert "hashed_password" not in body


async def test_register_rejects_duplicate_email(client: AsyncClient) -> None:
    payload = {"email": "dup@example.com", "password": "supersecret"}
    await client.post("/api/auth/register", json=payload)
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 400


async def test_login_returns_token(client: AsyncClient) -> None:
    await client.post(
        "/api/auth/register", json={"email": "login@example.com", "password": "supersecret"}
    )
    response = await client.post(
        "/api/auth/login",
        data={"username": "login@example.com", "password": "supersecret"},
    )
    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"]


async def test_login_rejects_wrong_password(client: AsyncClient) -> None:
    await client.post(
        "/api/auth/register", json={"email": "wrong@example.com", "password": "supersecret"}
    )
    response = await client.post(
        "/api/auth/login",
        data={"username": "wrong@example.com", "password": "notthepassword"},
    )
    assert response.status_code == 401


async def test_me_requires_token(client: AsyncClient) -> None:
    response = await client.get("/api/auth/me")
    assert response.status_code == 401


async def test_me_returns_current_user(auth_client: AsyncClient) -> None:
    response = await auth_client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == "owner@example.com"


async def test_update_email_requires_correct_password(auth_client: AsyncClient) -> None:
    response = await auth_client.patch(
        "/api/auth/me/email",
        json={"current_password": "wrongpass", "new_email": "new@example.com"},
    )
    assert response.status_code == 401


async def test_update_email_rejects_taken_email(auth_client: AsyncClient) -> None:
    await auth_client.post(
        "/api/auth/register", json={"email": "taken@example.com", "password": "supersecret"}
    )
    response = await auth_client.patch(
        "/api/auth/me/email",
        json={"current_password": "supersecret", "new_email": "taken@example.com"},
    )
    assert response.status_code == 409


async def test_update_email_succeeds_and_returns_new_token(auth_client: AsyncClient) -> None:
    response = await auth_client.patch(
        "/api/auth/me/email",
        json={"current_password": "supersecret", "new_email": "updated@example.com"},
    )
    assert response.status_code == 200
    new_token = response.json()["access_token"]

    auth_client.headers["Authorization"] = f"Bearer {new_token}"
    me = await auth_client.get("/api/auth/me")
    assert me.json()["email"] == "updated@example.com"


async def test_update_password_requires_correct_password(auth_client: AsyncClient) -> None:
    response = await auth_client.patch(
        "/api/auth/me/password",
        json={"current_password": "wrongpass", "new_password": "brandnewpass"},
    )
    assert response.status_code == 401


async def test_update_password_allows_login_with_new_password(auth_client: AsyncClient) -> None:
    response = await auth_client.patch(
        "/api/auth/me/password",
        json={"current_password": "supersecret", "new_password": "brandnewpass"},
    )
    assert response.status_code == 204

    login = await auth_client.post(
        "/api/auth/login",
        data={"username": "owner@example.com", "password": "brandnewpass"},
    )
    assert login.status_code == 200


async def test_delete_account_requires_correct_password(auth_client: AsyncClient) -> None:
    response = await auth_client.post(
        "/api/auth/me/delete", json={"current_password": "wrongpass"}
    )
    assert response.status_code == 401


async def test_delete_account_removes_user(auth_client: AsyncClient) -> None:
    response = await auth_client.post(
        "/api/auth/me/delete", json={"current_password": "supersecret"}
    )
    assert response.status_code == 204

    me = await auth_client.get("/api/auth/me")
    assert me.status_code == 401


async def test_delete_account_cascades_to_links(auth_client: AsyncClient) -> None:
    created = await auth_client.post(
        "/api/links",
        json={"target_url": "https://example.com/mine", "custom_slug": "mine-only"},
    )
    assert created.status_code == 201

    await auth_client.post("/api/auth/me/delete", json={"current_password": "supersecret"})

    await auth_client.post(
        "/api/auth/register", json={"email": "other@example.com", "password": "supersecret2"}
    )
    login = await auth_client.post(
        "/api/auth/login",
        data={"username": "other@example.com", "password": "supersecret2"},
    )
    auth_client.headers["Authorization"] = f"Bearer {login.json()['access_token']}"

    # If the deleted owner's link wasn't actually removed, this slug would
    # still be taken and creation would 409.
    reused = await auth_client.post(
        "/api/links",
        json={"target_url": "https://example.com/other", "custom_slug": "mine-only"},
    )
    assert reused.status_code == 201
