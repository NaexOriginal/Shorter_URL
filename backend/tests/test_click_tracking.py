from httpx import AsyncClient

IPHONE_UA = (
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
)


async def _create_link(client: AsyncClient, suffix: str) -> dict:
    response = await client.post(
        "/api/links", json={"target_url": f"https://example.com/{suffix}"}
    )
    assert response.status_code == 201
    return response.json()


async def test_redirect_records_device_info(auth_client: AsyncClient) -> None:
    body = await _create_link(auth_client, "device")
    short_code = body["short_code"]

    await auth_client.get(
        f"/{short_code}", follow_redirects=False, headers={"User-Agent": IPHONE_UA}
    )

    clicks = (await auth_client.get(f"/api/links/{short_code}/clicks")).json()
    assert len(clicks) == 1
    assert clicks[0]["device_type"] == "mobile"
    assert clicks[0]["os"] == "iOS"
    assert clicks[0]["browser"] == "Mobile Safari"
    # No GeoLite2 database available in the test environment.
    assert clicks[0]["country"] is None
    assert clicks[0]["city"] is None


async def test_list_clicks_requires_auth(client: AsyncClient) -> None:
    response = await client.get("/api/links/anything/clicks")
    assert response.status_code == 401


async def test_list_clicks_not_found_for_other_owner(
    client: AsyncClient, auth_client: AsyncClient
) -> None:
    body = await _create_link(auth_client, "private")

    await client.post(
        "/api/auth/register", json={"email": "intruder@example.com", "password": "supersecret"}
    )
    login = await client.post(
        "/api/auth/login", data={"username": "intruder@example.com", "password": "supersecret"}
    )
    token = login.json()["access_token"]

    response = await client.get(
        f"/api/links/{body['short_code']}/clicks",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404
