def has_duplicate_review(reviews, reviewer_id: str, engagement_id: str) -> bool:
    for review in reviews:
        if review.get("reviewer_id") == reviewer_id and review.get("engagement_id") == engagement_id:
            return True
    return False
