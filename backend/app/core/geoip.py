from functools import lru_cache
from pathlib import Path

import geoip2.database
from geoip2.errors import AddressNotFoundError

from app.core.config import settings


@lru_cache(maxsize=1)
def _get_reader() -> geoip2.database.Reader | None:
    if not Path(settings.geoip_db_path).is_file():
        return None
    return geoip2.database.Reader(settings.geoip_db_path)


def lookup_ip(ip_address: str) -> tuple[str | None, str | None]:
    """Return (country, city), both None if the DB is missing or the IP isn't found."""
    reader = _get_reader()
    if reader is None:
        return None, None
    try:
        response = reader.city(ip_address)
    except (AddressNotFoundError, ValueError):
        return None, None
    return response.country.name, response.city.name
