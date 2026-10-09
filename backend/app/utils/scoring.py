from typing import Dict
import re


def _normalize_rights(value):
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).strip()


def _rights_fit(requirement, evidence, *, licensing=False):
    required = _normalize_rights(requirement)
    available = _normalize_rights(evidence)
    if not required:
        return None
    if required == available or (len(required) >= 12 and required in available):
        return 100
    # A broad commercial availability claim does not prove a specific license.
    explicit_license_offer = any(term in available for term in ("license available", "licensing available", "license negotiable", "licensing negotiable"))
    if licensing and "licens" in required and explicit_license_offer:
        return 55
    return 40


def compute_match_score(brief: Dict, creator: Dict):
    """Score only the criteria present in the brief, and explain each comparison."""
    dimensions = {}
    reasons = []

    brief_specializations = {str(item).strip().lower() for item in brief.get("required_specialization", []) if str(item).strip()}
    creator_specializations = {str(item).strip().lower() for item in creator.get("specializations", []) if str(item).strip()}
    if brief_specializations:
        matched = brief_specializations & creator_specializations
        score = (len(matched) / len(brief_specializations)) * 100
        dimensions["specialization_score"] = (score, 20)
        missing = sorted(brief_specializations - creator_specializations)
        reasons.append(f"Specialization: {len(matched)} of {len(brief_specializations)} required match" + ("es" if len(matched) != 1 else "") + (f" · missing {', '.join(missing)}" if missing else ""))

    for field, score_key, weight, label in [
        ("required_skills", "skills_score", 20, "Skills"),
        ("required_tools", "tools_score", 15, "Tools"),
    ]:
        required = {str(item).strip().lower() for item in brief.get(field, []) if str(item).strip()}
        available = {str(item).strip().lower() for item in creator.get("skills" if field == "required_skills" else "tools", []) if str(item).strip()}
        if required:
            matched = required & available
            score = (len(matched) / len(required)) * 100
            dimensions[score_key] = (score, weight)
            missing = sorted(required - available)
            reasons.append(f"{label}: {len(matched)} of {len(required)} required match" + ("es" if len(matched) != 1 else "") + (f" · missing {', '.join(missing)}" if missing else ""))

    for brief_key, creator_key, score_key, weight, label in [
        ("content_type", "content_types", "content_type_score", 15, "Content type"),
        ("aspect_ratio", "formats", "format_score", 10, "Format"),
        ("language", "languages", "language_score", 5, "Language"),
    ]:
        required = str(brief.get(brief_key) or "").strip().lower()
        available = {str(item).strip().lower() for item in creator.get(creator_key, []) if str(item).strip()}
        if required:
            score = 100 if required in available else 0
            dimensions[score_key] = (score, weight)
            reasons.append(f"{label} matches" if score else f"{label} not listed: {brief.get(brief_key)}")

    rights_requirements = [
        (brief.get("commercial_use_required"), creator.get("commercial_use"), False),
        (brief.get("licensing_requirement"), creator.get("licensing_notes"), True),
        (brief.get("usage_rights"), creator.get("usage_rights"), False),
    ]
    rights_scores = [score for requirement, evidence, licensing in rights_requirements
                     if (score := _rights_fit(requirement, evidence, licensing=licensing)) is not None]
    if rights_scores:
        score = sum(rights_scores) / len(rights_scores)
        dimensions["commercial_use_score"] = (score, 10)
        reasons.append("Commercial and licensing terms align" if score == 100 else "Commercial rights or licensing scope needs confirmation")

    total_weight = sum(weight for _, weight in dimensions.values())
    match_score = sum(score * weight for score, weight in dimensions.values()) / total_weight if total_weight else 100
    if not reasons:
        reasons.append("No specific requirements set; broad fit")

    result = {key: round(score, 2) for key, (score, _) in dimensions.items()}
    result.update({"match_score": round(match_score, 2), "reasons": reasons})
    return result
