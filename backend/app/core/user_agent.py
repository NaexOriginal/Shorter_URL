from user_agents import parse


def parse_user_agent(ua_string: str | None) -> tuple[str | None, str | None, str | None]:
    """Return (device_type, browser, os), all None if there's no UA string."""
    if not ua_string:
        return None, None, None

    ua = parse(ua_string)
    if ua.is_mobile:
        device_type = "mobile"
    elif ua.is_tablet:
        device_type = "tablet"
    elif ua.is_pc:
        device_type = "desktop"
    else:
        device_type = "other"

    return device_type, ua.browser.family or None, ua.os.family or None
