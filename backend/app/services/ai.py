import json
import logging
import re
from dataclasses import dataclass, field
from functools import lru_cache

import google.generativeai as genai

from app.config import get_settings
from app.models.report import ReportCategory, ReportPriority

logger = logging.getLogger(__name__)

_VALID_CATEGORIES = {c.value for c in ReportCategory}
_VALID_PRIORITIES = {p.value for p in ReportPriority}

# Gemini free-tier flash models occasionally wrap JSON in markdown fences
# even when asked not to, so we strip those before parsing.
_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE | re.MULTILINE)


@lru_cache
def _get_model():
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(
        settings.gemini_model,
        generation_config={"response_mime_type": "application/json"},
    )


def _extract_json(raw_text: str) -> dict | list | None:
    cleaned = _FENCE_RE.sub("", raw_text.strip())
    try:
        return json.loads(cleaned)
    except (json.JSONDecodeError, TypeError):
        logger.warning("Gemini returned non-JSON output: %s", raw_text[:500])
        return None


@dataclass
class ClassificationResult:
    category: ReportCategory
    priority: ReportPriority
    confidence: float
    reasoning: str
    fallback: bool = False


def classify_report(title: str, description: str) -> ClassificationResult:
    """Classify a report's category and priority in a single Gemini call.

    Falls back to safe defaults on any API error or malformed response so a
    Gemini outage never blocks report submission.
    """
    prompt = f"""You are triaging a civic issue report for a local government platform.

Title: {title}
Description: {description}

Classify this report and respond with ONLY a JSON object (no markdown fences) with exactly these keys:
- "category": one of {sorted(_VALID_CATEGORIES)}
- "priority": one of {sorted(_VALID_PRIORITIES)}
- "confidence": a number between 0 and 1 representing your confidence in the category choice
- "reasoning": a short (1-2 sentence) explanation of the classification and priority

Guidance: "critical" priority means immediate danger to life/safety (e.g. major flooding, exposed live wires,
a collapsed structure). "high" means significant hazard or disruption. "medium" is the default for typical
issues. "low" is cosmetic or minor.
"""
    try:
        response = _get_model().generate_content(prompt)
        data = _extract_json(response.text)
    except Exception:
        logger.exception("Gemini classification call failed")
        data = None

    if not isinstance(data, dict):
        return ClassificationResult(
            category=ReportCategory.other,
            priority=ReportPriority.medium,
            confidence=0.0,
            reasoning="AI classification unavailable; defaulted for manual review.",
            fallback=True,
        )

    category_raw = str(data.get("category", "")).strip().lower()
    priority_raw = str(data.get("priority", "")).strip().lower()

    category = ReportCategory(category_raw) if category_raw in _VALID_CATEGORIES else ReportCategory.other
    priority = ReportPriority(priority_raw) if priority_raw in _VALID_PRIORITIES else ReportPriority.medium

    try:
        confidence = float(data.get("confidence", 0.0))
    except (TypeError, ValueError):
        confidence = 0.0
    confidence = max(0.0, min(1.0, confidence))

    reasoning = str(data.get("reasoning", "")).strip() or "No reasoning provided."

    return ClassificationResult(
        category=category,
        priority=priority,
        confidence=confidence,
        reasoning=reasoning,
        fallback=category_raw not in _VALID_CATEGORIES,
    )


@dataclass
class DuplicateCandidateResult:
    report_id: str
    similarity: float
    is_duplicate: bool


@dataclass
class DuplicateCheckResult:
    matches: list[DuplicateCandidateResult] = field(default_factory=list)


def find_duplicates(
    new_title: str,
    new_description: str,
    candidates: list[dict],
) -> DuplicateCheckResult:
    """Ask Gemini to judge similarity against nearby OPEN reports in a single call.

    `candidates` is a list of {"id": str, "title": str, "description": str} already
    pre-filtered by radius and (loosely) by category on the DB side, so this call
    only ever reasons over a handful of geographically-relevant reports rather than
    the whole table.
    """
    if not candidates:
        return DuplicateCheckResult(matches=[])

    candidate_lines = "\n".join(
        f'{i}. id="{c["id"]}" title="{c["title"]}" description="{c["description"][:300]}"'
        for i, c in enumerate(candidates)
    )

    prompt = f"""You are deduplicating civic issue reports that were already filtered to be within ~100m
of each other and geographically close. Decide if the NEW report describes the same real-world issue
as any of the EXISTING reports below.

NEW report:
title="{new_title}" description="{new_description[:500]}"

EXISTING nearby reports:
{candidate_lines}

Respond with ONLY a JSON array (no markdown fences). One object per EXISTING report, in the same order,
with exactly these keys:
- "id": the existing report's id, copied exactly
- "similarity": a number between 0 and 1 for how likely this is the same underlying issue
- "is_duplicate": true only if similarity is high enough (roughly >= 0.75) that a human should be shown a link
"""
    try:
        response = _get_model().generate_content(prompt)
        data = _extract_json(response.text)
    except Exception:
        logger.exception("Gemini duplicate-check call failed")
        data = None

    if not isinstance(data, list):
        return DuplicateCheckResult(matches=[])

    matches: list[DuplicateCandidateResult] = []
    for item in data:
        if not isinstance(item, dict) or "id" not in item:
            continue
        try:
            similarity = max(0.0, min(1.0, float(item.get("similarity", 0.0))))
        except (TypeError, ValueError):
            similarity = 0.0
        matches.append(
            DuplicateCandidateResult(
                report_id=str(item["id"]),
                similarity=similarity,
                is_duplicate=bool(item.get("is_duplicate", False)) and similarity >= 0.75,
            )
        )
    return DuplicateCheckResult(matches=matches)
