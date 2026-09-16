import math

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.report import Report, ReportStatus

RADIUS_METERS = 100.0
EARTH_RADIUS_METERS = 6_371_000.0


def _bounding_box(lat: float, lng: float, radius_meters: float) -> tuple[float, float, float, float]:
    """Cheap lat/lng bounding box so the DB query stays index-friendly;
    exact distance is checked afterwards with the haversine formula."""
    lat_delta = math.degrees(radius_meters / EARTH_RADIUS_METERS)
    lng_delta = math.degrees(radius_meters / (EARTH_RADIUS_METERS * math.cos(math.radians(lat))))
    return lat - lat_delta, lat + lat_delta, lng - lng_delta, lng + lng_delta


def haversine_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return 2 * EARTH_RADIUS_METERS * math.asin(math.sqrt(a))


def find_nearby_open_reports(db: Session, lat: float, lng: float, radius_meters: float = RADIUS_METERS) -> list[Report]:
    min_lat, max_lat, min_lng, max_lng = _bounding_box(lat, lng, radius_meters)

    candidates = db.execute(
        select(Report).where(
            Report.status != ReportStatus.resolved,
            Report.latitude.between(min_lat, max_lat),
            Report.longitude.between(min_lng, max_lng),
        )
    ).scalars().all()

    return [
        report
        for report in candidates
        if haversine_meters(lat, lng, report.latitude, report.longitude) <= radius_meters
    ]
