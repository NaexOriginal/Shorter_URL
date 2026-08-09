from datetime import UTC, datetime, timedelta

from httpx import AsyncClient

from app.models.click import Click


async def test_overview_empty_state(auth_client: AsyncClient) -> None:
    response = await auth_client.get("/api/analytics/overview")
    assert response.status_code == 200
    body = response.json()
    assert body == {
        "clicks_by_day": [],
        "top_link": None,
        "top_country": None,
        "recent_clicks": [],
    }


async def test_overview_aggregates_recent_click(auth_client: AsyncClient) -> None:
    created = (
        await auth_client.post("/api/links", json={"target_url": "https://example.com/a"})
    ).json()

    await auth_client.get(f"/{created['short_code']}", follow_redirects=False)

    body = (await auth_client.get("/api/analytics/overview")).json()

    assert len(body["clicks_by_day"]) == 1
    assert body["clicks_by_day"][0]["count"] == 1
    assert body["top_link"] == {
        "short_code": created["short_code"],
        "target_url": "https://example.com/a",
        "clicks": 1,
    }
    assert len(body["recent_clicks"]) == 1
    assert body["recent_clicks"][0]["short_code"] == created["short_code"]


async def test_overview_excludes_clicks_older_than_30_days(auth_client: AsyncClient) -> None:
    created = (
        await auth_client.post("/api/links", json={"target_url": "https://example.com/old"})
    ).json()

    async with auth_client.session_factory() as session:
        session.add(
            Click(link_id=created["id"], clicked_at=datetime.now(UTC) - timedelta(days=45))
        )
        await session.commit()

    body = (await auth_client.get("/api/analytics/overview")).json()

    assert body["clicks_by_day"] == []
    assert body["top_link"] is None
    # Still shows up in "recent" regardless of the 30-day analytics window.
    assert len(body["recent_clicks"]) == 1


async def test_overview_top_country(auth_client: AsyncClient) -> None:
    created = (
        await auth_client.post("/api/links", json={"target_url": "https://example.com/geo"})
    ).json()

    async with auth_client.session_factory() as session:
        session.add_all(
            [
                Click(link_id=created["id"], country="Argentina"),
                Click(link_id=created["id"], country="Argentina"),
                Click(link_id=created["id"], country="Brasil"),
                Click(link_id=created["id"], country=None),
            ]
        )
        await session.commit()

    body = (await auth_client.get("/api/analytics/overview")).json()

    assert body["top_country"] == {"country": "Argentina", "clicks": 2}


async def test_overview_scoped_to_owner(client: AsyncClient, auth_client: AsyncClient) -> None:
    await auth_client.post("/api/links", json={"target_url": "https://example.com/mine"})
    await auth_client.get("/api/analytics/overview")

    await client.post(
        "/api/auth/register", json={"email": "other@example.com", "password": "supersecret"}
    )
    login = await client.post(
        "/api/auth/login", data={"username": "other@example.com", "password": "supersecret"}
    )
    other_token = login.json()["access_token"]

    response = await client.get(
        "/api/analytics/overview", headers={"Authorization": f"Bearer {other_token}"}
    )
    body = response.json()
    assert body["recent_clicks"] == []
    assert body["top_link"] is None


async def test_overview_requires_auth(client: AsyncClient) -> None:
    response = await client.get("/api/analytics/overview")
    assert response.status_code == 401
