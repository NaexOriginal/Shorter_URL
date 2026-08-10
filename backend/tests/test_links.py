from httpx import AsyncClient


async def _create_link(client: AsyncClient, suffix: str) -> dict:
    response = await client.post(
        "/api/links", json={"target_url": f"https://example.com/{suffix}"}
    )
    assert response.status_code == 201
    return response.json()


async def test_create_link_requires_auth(client: AsyncClient) -> None:
    response = await client.post("/api/links", json={"target_url": "https://example.com/x"})
    assert response.status_code == 401


async def test_create_link_returns_short_code(auth_client: AsyncClient) -> None:
    body = await _create_link(auth_client, "create")
    assert len(body["short_code"]) == 7
    assert body["click_count"] == 0
    assert body["target_url"] == "https://example.com/create"


async def test_create_link_rejects_invalid_url(auth_client: AsyncClient) -> None:
    response = await auth_client.post("/api/links", json={"target_url": "not-a-url"})
    assert response.status_code == 422


async def test_list_links_includes_created(auth_client: AsyncClient) -> None:
    body = await _create_link(auth_client, "list")
    response = await auth_client.get("/api/links")
    assert response.status_code == 200
    codes = [item["short_code"] for item in response.json()]
    assert body["short_code"] in codes


async def test_list_links_scoped_to_owner(client: AsyncClient, auth_client: AsyncClient) -> None:
    await _create_link(auth_client, "owned-by-first-user")

    await client.post(
        "/api/auth/register", json={"email": "other@example.com", "password": "supersecret"}
    )
    login = await client.post(
        "/api/auth/login", data={"username": "other@example.com", "password": "supersecret"}
    )
    other_token = login.json()["access_token"]

    response = await client.get(
        "/api/links", headers={"Authorization": f"Bearer {other_token}"}
    )
    assert response.status_code == 200
    assert response.json() == []


async def test_redirect_follows_and_counts_click(auth_client: AsyncClient) -> None:
    body = await _create_link(auth_client, "redirect")
    short_code = body["short_code"]

    redirect_response = await auth_client.get(f"/{short_code}", follow_redirects=False)
    assert redirect_response.status_code == 302
    assert redirect_response.headers["location"] == "https://example.com/redirect"

    detail = await auth_client.get(f"/api/links/{short_code}")
    assert detail.json()["click_count"] == 1


async def test_redirect_unknown_code_returns_404(client: AsyncClient) -> None:
    response = await client.get("/does-not-exist")
    assert response.status_code == 404


async def test_create_link_with_custom_slug(auth_client: AsyncClient) -> None:
    response = await auth_client.post(
        "/api/links", json={"target_url": "https://example.com/x", "custom_slug": "mi-marca"}
    )
    assert response.status_code == 201
    assert response.json()["short_code"] == "mi-marca"


async def test_create_link_rejects_duplicate_slug(auth_client: AsyncClient) -> None:
    await auth_client.post(
        "/api/links", json={"target_url": "https://example.com/a", "custom_slug": "taken"}
    )
    response = await auth_client.post(
        "/api/links", json={"target_url": "https://example.com/b", "custom_slug": "taken"}
    )
    assert response.status_code == 409


async def test_create_link_rejects_reserved_slug(auth_client: AsyncClient) -> None:
    response = await auth_client.post(
        "/api/links", json={"target_url": "https://example.com/x", "custom_slug": "api"}
    )
    assert response.status_code == 422


async def test_create_link_rejects_invalid_slug_characters(auth_client: AsyncClient) -> None:
    response = await auth_client.post(
        "/api/links", json={"target_url": "https://example.com/x", "custom_slug": "no spaces!"}
    )
    assert response.status_code == 422


async def test_create_link_rejects_slug_taken_by_random_code(auth_client: AsyncClient) -> None:
    existing = await _create_link(auth_client, "random")
    response = await auth_client.post(
        "/api/links",
        json={"target_url": "https://example.com/y", "custom_slug": existing["short_code"]},
    )
    assert response.status_code == 409
