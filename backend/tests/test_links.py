from httpx import AsyncClient


async def _create_link(client: AsyncClient, suffix: str) -> dict:
    response = await client.post("/api/links", json={"target_url": f"https://example.com/{suffix}"})
    assert response.status_code == 201
    return response.json()


async def test_create_link_returns_short_code(client: AsyncClient) -> None:
    body = await _create_link(client, "create")
    assert len(body["short_code"]) == 7
    assert body["click_count"] == 0
    assert body["target_url"] == "https://example.com/create"


async def test_create_link_rejects_invalid_url(client: AsyncClient) -> None:
    response = await client.post("/api/links", json={"target_url": "not-a-url"})
    assert response.status_code == 422


async def test_list_links_includes_created(client: AsyncClient) -> None:
    body = await _create_link(client, "list")
    response = await client.get("/api/links")
    assert response.status_code == 200
    codes = [item["short_code"] for item in response.json()]
    assert body["short_code"] in codes


async def test_redirect_follows_and_counts_click(client: AsyncClient) -> None:
    body = await _create_link(client, "redirect")
    short_code = body["short_code"]

    redirect_response = await client.get(f"/{short_code}", follow_redirects=False)
    assert redirect_response.status_code == 302
    assert redirect_response.headers["location"] == "https://example.com/redirect"

    detail = await client.get(f"/api/links/{short_code}")
    assert detail.json()["click_count"] == 1


async def test_redirect_unknown_code_returns_404(client: AsyncClient) -> None:
    response = await client.get("/does-not-exist")
    assert response.status_code == 404
