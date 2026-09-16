import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.report import Report, ReportCategory, ReportPriority, ReportStatus
from app.models.report_image import ReportImage
from app.models.user import User
from app.schemas.report import DuplicateInfo, ReportCreate, ReportCreateResponse, ReportOut, ReportUpdate
from app.services import ai
from app.services.auth import get_current_user, require_authority
from app.services.duplicate import find_nearby_open_reports, haversine_meters

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=ReportCreateResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    classification = ai.classify_report(payload.title, payload.description)
    category = payload.category or classification.category

    report = Report(
        title=payload.title,
        description=payload.description,
        category=category,
        priority=classification.priority,
        status=ReportStatus.open,
        latitude=payload.latitude,
        longitude=payload.longitude,
        ai_confidence=classification.confidence,
        ai_reasoning=classification.reasoning,
        reporter_id=current_user.id,
    )
    db.add(report)
    db.flush()

    for url in payload.image_urls:
        db.add(ReportImage(report_id=report.id, url=url))

    nearby = [r for r in find_nearby_open_reports(db, payload.latitude, payload.longitude) if r.id != report.id]

    possible_duplicates: list[DuplicateInfo] = []
    if nearby:
        candidates = [{"id": str(r.id), "title": r.title, "description": r.description} for r in nearby]
        dup_result = ai.find_duplicates(payload.title, payload.description, candidates)
        nearby_by_id = {str(r.id): r for r in nearby}

        flagged = [m for m in dup_result.matches if m.is_duplicate]
        if flagged:
            top_match = max(flagged, key=lambda m: m.similarity)
            report.duplicate_of_id = uuid.UUID(top_match.report_id)

        for match in flagged:
            candidate = nearby_by_id.get(match.report_id)
            if candidate is None:
                continue
            possible_duplicates.append(
                DuplicateInfo(
                    report_id=candidate.id,
                    title=candidate.title,
                    distance_meters=haversine_meters(
                        payload.latitude, payload.longitude, candidate.latitude, candidate.longitude
                    ),
                    similarity=match.similarity,
                )
            )

    db.commit()
    db.refresh(report)
    return ReportCreateResponse(report=report, possible_duplicates=possible_duplicates)


@router.get("", response_model=list[ReportOut])
def list_reports(
    status_filter: ReportStatus | None = None,
    category: ReportCategory | None = None,
    priority: ReportPriority | None = None,
    min_lat: float | None = None,
    max_lat: float | None = None,
    min_lng: float | None = None,
    max_lng: float | None = None,
    db: Session = Depends(get_db),
):
    query = select(Report)

    if status_filter is not None:
        query = query.where(Report.status == status_filter)
    if category is not None:
        query = query.where(Report.category == category)
    if priority is not None:
        query = query.where(Report.priority == priority)
    if min_lat is not None:
        query = query.where(Report.latitude >= min_lat)
    if max_lat is not None:
        query = query.where(Report.latitude <= max_lat)
    if min_lng is not None:
        query = query.where(Report.longitude >= min_lng)
    if max_lng is not None:
        query = query.where(Report.longitude <= max_lng)

    query = query.order_by(Report.created_at.desc())
    return db.execute(query).scalars().all()


@router.get("/{report_id}", response_model=ReportOut)
def get_report(report_id: uuid.UUID, db: Session = Depends(get_db)):
    report = db.get(Report, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report


@router.patch("/{report_id}", response_model=ReportOut)
def update_report(
    report_id: uuid.UUID,
    payload: ReportUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_authority),
):
    report = db.get(Report, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(report, field, value)

    db.commit()
    db.refresh(report)
    return report
