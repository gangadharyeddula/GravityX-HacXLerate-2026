from typing import Dict, List

from ..database import store
from ..utils.scoring import compute_match_score


def find_matching_creators_for_brief(brief: Dict) -> List[Dict]:
    creators = store.list("creators")
    results = []
    for creator in creators:
        match = compute_match_score(brief, creator)
        match["creator_id"] = creator.get("id")
        match["creator"] = creator
        results.append(match)

    results.sort(key=lambda item: item["match_score"], reverse=True)
    return results
