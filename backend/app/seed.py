import hashlib
from datetime import datetime, timedelta, timezone

from .database import store


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


DEMO_PORTFOLIO_SAMPLES = [
    {
        "id": "portfolio-1",
        "creator_id": "creator-demo",
        "title": "Urban Energy Launch — AI demo concept",
        "description": "A cinematic, fictional product-launch visual created for the CreatorTwin prototype. This is not commissioned or client-validated work.",
        "media_url": "/assets/portfolio/urban-energy-launch.svg",
        "thumbnail_url": "/assets/portfolio/urban-energy-launch.svg",
        "content_type": "Image",
        "tools": ["OpenAI Codex", "SVG 2.0"],
        "models": ["GPT-6 · vector code generation"],
        "skills": ["Text-to-Image", "Prompt Engineering", "Product Art Direction"],
        "specialization": "AI Advertising",
        "workflow": ["Concept brief", "AI-authored vector illustration", "SVG rendering", "Portfolio presentation"],
        "aspect_ratio": "2:3",
        "duration": "Static image",
        "commercial_use": "Demo presentation only; not cleared for client use",
        "usage_rights": "Prototype display only",
        "licensing_notes": "Fictional AI demo concept. No client approval, third-party rights check, or commercial license is represented.",
        "verification": {"status": "demo"},
        "source": "demo-generated",
    },
    {
        "id": "portfolio-2",
        "creator_id": "creator-demo",
        "title": "Home Pulse — AI demo concept",
        "description": "A calm smart-home product visualization generated for the CreatorTwin prototype; it does not represent client work.",
        "media_url": "/assets/portfolio/home-pulse-product-film.svg",
        "thumbnail_url": "/assets/portfolio/home-pulse-product-film.svg",
        "content_type": "Image",
        "tools": ["OpenAI Codex", "SVG 2.0"],
        "models": ["GPT-6 · vector code generation"],
        "skills": ["Text-to-Image", "Prompt Engineering", "Product Art Direction"],
        "specialization": "AI Product Visualization",
        "workflow": ["Concept brief", "AI-authored vector illustration", "SVG rendering", "Portfolio presentation"],
        "aspect_ratio": "2:3",
        "duration": "Static image",
        "commercial_use": "Demo presentation only; not cleared for client use",
        "usage_rights": "Prototype display only",
        "licensing_notes": "Fictional AI demo concept. No client approval, third-party rights check, or commercial license is represented.",
        "verification": {"status": "demo"},
        "source": "demo-generated",
    },
    {
        "id": "portfolio-3",
        "creator_id": "creator-demo",
        "title": "Botanical Serum — AI demo concept",
        "description": "An original fictional clean-beauty still life generated as a visual sample for this marketplace demo.",
        "media_url": "/assets/portfolio/botanical-skincare-concept.svg",
        "thumbnail_url": "/assets/portfolio/botanical-skincare-concept.svg",
        "content_type": "Image",
        "tools": ["OpenAI Codex", "SVG 2.0"],
        "models": ["GPT-6 · vector code generation"],
        "skills": ["Text-to-Image", "Prompt Engineering", "Product Art Direction"],
        "specialization": "Generative Art",
        "workflow": ["Concept brief", "AI-authored vector illustration", "SVG rendering", "Portfolio presentation"],
        "aspect_ratio": "2:3",
        "duration": "Static image",
        "commercial_use": "Demo presentation only; not cleared for client use",
        "usage_rights": "Prototype display only",
        "licensing_notes": "Fictional AI demo concept. No client approval, third-party rights check, or commercial license is represented.",
        "verification": {"status": "demo"},
        "source": "demo-generated",
    },
    {
        "id": "portfolio-4",
        "creator_id": "creator-demo",
        "title": "Orbit Bloom — AI motion-study concept",
        "description": "A fictional motion-art direction study made for the CreatorTwin demo, shown as a still frame rather than commissioned video work.",
        "media_url": "/assets/portfolio/orbital-motion-study.svg",
        "thumbnail_url": "/assets/portfolio/orbital-motion-study.svg",
        "content_type": "Image",
        "tools": ["OpenAI Codex", "SVG 2.0"],
        "models": ["GPT-6 · vector code generation"],
        "skills": ["Text-to-Image", "Prompt Engineering", "Motion Art Direction"],
        "specialization": "AI Storytelling",
        "workflow": ["Motion concept", "AI-authored vector illustration", "SVG rendering", "Portfolio presentation"],
        "aspect_ratio": "2:3",
        "duration": "Static concept frame",
        "commercial_use": "Demo presentation only; not cleared for client use",
        "usage_rights": "Prototype display only",
        "licensing_notes": "Fictional AI demo concept. No client approval, third-party rights check, or commercial license is represented.",
        "verification": {"status": "demo"},
        "source": "demo-generated",
    },
]


PUBLIC_CREATOR_SAMPLES = [
    {
        "id": "creator-guntur-manindra",
        "user_id": "public-source:behance:jonnakutih",
        "name": "Manindra Jonnakuti",
        "bio": "Guntur-based motion designer and aspiring AI VFX artist. Public Behance work includes an AI-assisted short film and motion-design projects. CreatorTwin has not independently verified this profile or its rights claims.",
        "location": "Guntur, India",
        "languages": ["English"],
        "specializations": ["AI Filmmaking", "Motion Design", "VFX"],
        "skills": ["AI Filmmaking", "Video Editing", "Motion Graphics", "VFX", "Compositing"],
        "tools": ["Illustrator", "Photoshop", "After Effects", "Premiere Pro", "Google Flow AI", "Google Veo 3.1 Fast", "ChatGPT", "Nuke", "Maya"],
        "content_types": ["Video", "Motion design", "Short film"],
        "formats": [],
        "availability": "Public profile says available for freelance and full-time work",
        "commercial_use": "Not stated publicly; commercial use is unverified",
        "licensing_notes": "Source-page attribution is provided. Public visibility does not grant a reuse or commercial license; confirm with the creator.",
        "usage_rights": "Unverified. Do not reuse or license this work without written permission.",
        "rate": "Not stated publicly",
        "profile_image": "",
        "verification": [],
        "source_url": "https://www.behance.net/jonnakutih",
        "source_platform": "Behance",
        "external_profile": True,
        "source_note": "Public Behance profile. The creator has not joined CreatorTwin; location and portfolio attribution are sourced from that page, not independently verified.",
    },
    {
        "id": "creator-guntur-nagarjuna",
        "user_id": "public-source:linkedin:nagarjuna-meka",
        "name": "Nagarjuna Meka",
        "bio": "AI video editor and SaaS explainer creator. His public profile lists Guntur in education; current work location is not confirmed. Portfolio descriptions and tool details are self-reported on LinkedIn.",
        "location": "Guntur-associated, India (education listed; current base unconfirmed)",
        "languages": ["English", "Telugu"],
        "specializations": ["AI Video Editing", "AI Storytelling", "SaaS Explainers"],
        "skills": ["Story Visualization", "AI Voiceover", "Scene-based Editing", "Short-form Video Storytelling", "Video Editing"],
        "tools": ["AI Voice", "Visual AI tools", "CapCut", "Adobe Premiere Pro"],
        "content_types": ["Video", "Short-form video", "Advertisement"],
        "formats": [],
        "availability": "Public profile says open to opportunities and collaborations",
        "commercial_use": "Not stated publicly; commercial use is unverified",
        "licensing_notes": "Source-page attribution is provided. No commercial license is stated; contact the creator before reuse.",
        "usage_rights": "Unverified. Do not reuse or license this work without written permission.",
        "rate": "Not stated publicly",
        "profile_image": "",
        "verification": [],
        "source_url": "https://www.linkedin.com/in/nagarjuna-meka-b115a93a6/",
        "source_platform": "LinkedIn",
        "external_profile": True,
        "source_note": "Public LinkedIn profile and self-described project posts. Guntur appears as education, not a confirmed current location. CreatorTwin has not verified the profile or rights claims.",
    },
]


PUBLIC_PORTFOLIO_SAMPLES = [
    {
        "id": "portfolio-manindra-ai-short",
        "creator_id": "creator-guntur-manindra",
        "title": "AI Filmmaker | VFX Artist | Cinematic Storytelling",
        "description": "Creator-described AI-assisted short-film project. The public project page says it explores a complete AI-assisted pipeline from concept to final cinematic presentation.",
        "media_url": "https://www-ccv.adobe.io/v1/player/ccv/S3vrjaZmK4A/embed?api_key=behance1&bgcolor=%23191919",
        "thumbnail_url": "https://mir-s3-cdn-cf.behance.net/projects/404/bff757252637499.Y3JvcCw1ODYsNDU4LDM5NCw1OA.png",
        "content_type": "AI short film",
        "tools": ["Premiere Pro", "After Effects", "Google Flow AI", "ChatGPT"],
        "models": ["Google Veo 3.1 Fast"],
        "skills": ["AI Filmmaking", "Video Editing", "VFX"],
        "specialization": "AI Filmmaking",
        "workflow": ["Concept", "AI-assisted production pipeline (detailed steps not published)", "Final cinematic presentation"],
        "aspect_ratio": "Not stated publicly",
        "duration": "Short film; duration not stated publicly",
        "commercial_use": "Not stated publicly; commercial use is unverified",
        "licensing_notes": "Public Behance page is linked. No reuse or commercial license is implied.",
        "usage_rights": "Unverified. Contact the creator for permission before reuse.",
        "source_url": "https://www.behance.net/gallery/252637499/AI-Filmmaker-VFX-Artist-Cinematic-Storytelling-",
        "source_platform": "Behance",
        "creator_attribution": "Manindra Jonnakuti",
        "rights_status": "unverified",
        "ai_provenance": "creator_described",
    },
    {
        "id": "portfolio-manindra-festive-motion",
        "creator_id": "creator-guntur-manindra",
        "title": "Festive Shopping Campaign — Motion Design",
        "description": "Creator-attributed Behance motion-design project. The project page does not disclose whether AI was used.",
        "media_url": "https://mir-s3-cdn-cf.behance.net/projects/404/2534f8256401221.Y3JvcCwxMzA5LDEwMjQsMCww.png",
        "thumbnail_url": "https://mir-s3-cdn-cf.behance.net/projects/404/2534f8256401221.Y3JvcCwxMzA5LDEwMjQsMCww.png",
        "content_type": "Motion design",
        "tools": [],
        "models": [],
        "skills": ["Motion Graphics", "Visual Design"],
        "specialization": "Motion Design",
        "workflow": ["Project-specific tools and workflow not published"],
        "aspect_ratio": "Not stated publicly",
        "duration": "Not stated publicly",
        "commercial_use": "Not stated publicly; commercial use is unverified",
        "licensing_notes": "AI use and license terms are not disclosed on the source profile.",
        "usage_rights": "Unverified. Contact the creator for permission before reuse.",
        "source_url": "https://www.behance.net/gallery/256401221/Festive-Shopping-Campaign-Motion-Design",
        "source_platform": "Behance",
        "creator_attribution": "Manindra Jonnakuti",
        "rights_status": "unverified",
        "ai_provenance": "not_disclosed",
    },
    {
        "id": "portfolio-manindra-motion-reels",
        "creator_id": "creator-guntur-manindra",
        "title": "Content Creation & Motion Design Reels",
        "description": "Creator-attributed Behance motion-design reel. The project page does not disclose whether AI was used.",
        "media_url": "https://mir-s3-cdn-cf.behance.net/projects/404/c75541255512377.Y3JvcCwxMzgwLDEwODAsOTIsMA.jpg",
        "thumbnail_url": "https://mir-s3-cdn-cf.behance.net/projects/404/c75541255512377.Y3JvcCwxMzgwLDEwODAsOTIsMA.jpg",
        "content_type": "Motion design",
        "tools": [],
        "models": [],
        "skills": ["Content Creation", "Motion Graphics", "Video Editing"],
        "specialization": "Motion Design",
        "workflow": ["Project-specific tools and workflow not published"],
        "aspect_ratio": "Not stated publicly",
        "duration": "Not stated publicly",
        "commercial_use": "Not stated publicly; commercial use is unverified",
        "licensing_notes": "AI use and license terms are not disclosed on the source profile.",
        "usage_rights": "Unverified. Contact the creator for permission before reuse.",
        "source_url": "https://www.behance.net/gallery/255510473/Content-Creation-Motion-Design-Reels",
        "source_platform": "Behance",
        "creator_attribution": "Manindra Jonnakuti",
        "rights_status": "unverified",
        "ai_provenance": "not_disclosed",
    },
    {
        "id": "portfolio-nagarjuna-ai-story-explainer",
        "creator_id": "creator-guntur-nagarjuna",
        "title": "AI Video Editing Demo — Story-based Explainer",
        "description": "Creator-described short explainer featuring a workplace story, voiceover, and scene-based editing. The LinkedIn post contains the video; its model is not named.",
        "media_url": "",
        "thumbnail_url": "",
        "content_type": "AI video",
        "tools": ["AI Voice", "Visual AI tools", "CapCut"],
        "models": [],
        "skills": ["Story Visualization", "AI Voiceover", "Scene-based Editing"],
        "specialization": "AI Video Editing",
        "workflow": ["Story visualization", "AI voiceover", "Scene-based editing", "Short-form storytelling"],
        "aspect_ratio": "Not stated publicly",
        "duration": "Short-form; exact length not stated publicly",
        "commercial_use": "Not stated publicly; commercial use is unverified",
        "licensing_notes": "Source is the creator's public LinkedIn profile. No reuse or commercial license is implied.",
        "usage_rights": "Unverified. Contact the creator for permission before reuse.",
        "source_url": "https://www.linkedin.com/in/nagarjuna-meka-b115a93a6/",
        "source_platform": "LinkedIn",
        "creator_attribution": "Nagarjuna Meka",
        "rights_status": "unverified",
        "ai_provenance": "creator_described",
    },
    {
        "id": "portfolio-nagarjuna-taskflow",
        "creator_id": "creator-guntur-nagarjuna",
        "title": "TaskFlow SaaS Explainer",
        "description": "Creator-described task-management SaaS explainer. The source says it uses an AI voiceover and Adobe Premiere Pro; the project is a portfolio concept, not an official product.",
        "media_url": "",
        "thumbnail_url": "",
        "content_type": "AI-assisted video",
        "tools": ["AI voiceover", "Adobe Premiere Pro"],
        "models": [],
        "skills": ["SaaS Explainers", "Video Editing", "Storytelling"],
        "specialization": "SaaS Explainers",
        "workflow": ["Structured script", "AI voiceover", "Visual storytelling", "Adobe Premiere Pro edit"],
        "aspect_ratio": "Not stated publicly",
        "duration": "Not stated publicly",
        "commercial_use": "Concept work; commercial use is unverified",
        "licensing_notes": "Source is the creator's public LinkedIn profile. No reuse or commercial license is implied.",
        "usage_rights": "Unverified. Contact the creator for permission before reuse.",
        "source_url": "https://www.linkedin.com/in/nagarjuna-meka-b115a93a6/",
        "source_platform": "LinkedIn",
        "creator_attribution": "Nagarjuna Meka",
        "rights_status": "unverified",
        "ai_provenance": "creator_described",
    },
    {
        "id": "portfolio-nagarjuna-taskflow-demo",
        "creator_id": "creator-guntur-nagarjuna",
        "title": "TaskFlow AI Video Concept",
        "description": "Creator-described demo video for a sample SaaS product, presented as a portfolio concept and not an official product. The source says scripting, visuals, and voice used AI tools; exact tools and model are not published.",
        "media_url": "",
        "thumbnail_url": "",
        "content_type": "AI video concept",
        "tools": ["AI tools (specific products not named)"],
        "models": [],
        "skills": ["Scripting", "AI Visuals", "AI Voice", "Video Editing"],
        "specialization": "AI Storytelling",
        "workflow": ["Scripting", "AI visuals", "AI voice", "Video edit"],
        "aspect_ratio": "Not stated publicly",
        "duration": "Not stated publicly",
        "commercial_use": "Concept work; commercial use is unverified",
        "licensing_notes": "Source is the creator's public LinkedIn profile. No reuse or commercial license is implied.",
        "usage_rights": "Unverified. Contact the creator for permission before reuse.",
        "source_url": "https://www.linkedin.com/in/nagarjuna-meka-b115a93a6/",
        "source_platform": "LinkedIn",
        "creator_attribution": "Nagarjuna Meka",
        "rights_status": "unverified",
        "ai_provenance": "creator_described",
    },
]


def ensure_seed_data():
    demo_now = datetime.now(timezone.utc).isoformat()
    first_deadline = (datetime.now(timezone.utc) + timedelta(days=21)).date().isoformat()
    second_deadline = (datetime.now(timezone.utc) + timedelta(days=35)).date().isoformat()
    had_creators_before_seed = bool(store.list("creators"))
    users = store.list("users")
    user_map = {user.get("email", "").lower(): user for user in users}

    for user in [
        {
            "id": "user-brand",
            "name": "Demo Brand",
            "email": "brand@demo.com",
            "password_hash": _hash_password("demo123"),
            "role": "brand",
            "created_at": demo_now,
        },
        {
            "id": "user-creator",
            "name": "Demo Creator",
            "email": "creator@demo.com",
            "password_hash": _hash_password("demo123"),
            "role": "creator",
            "created_at": demo_now,
        },
        {
            "id": "user-reviewer",
            "name": "Demo Reviewer",
            "email": "reviewer@demo.com",
            "password_hash": _hash_password("demo123"),
            "role": "reviewer",
            "created_at": demo_now,
        },
    ]:
        if user["email"].lower() not in user_map:
            store.insert("users", user)
            user_map[user["email"].lower()] = user

    # Refresh only the original, expired demo deadlines when an existing local store is reused.
    for record_id, deadline in (("brief-1", first_deadline), ("engagement-1", first_deadline), ("brief-2", second_deadline), ("engagement-2", second_deadline)):
        collection = "briefs" if record_id.startswith("brief-") else "engagements"
        record = store.find_one(collection, id=record_id)
        if record and str(record.get("deadline") or "").startswith("2024-"):
            store.update(collection, record_id, {"deadline": deadline})
    for record_id in ("verification-1", "verification-2", "verification-3"):
        record = store.find_one("verification", id=record_id)
        if record and record.get("status") == "demo" and record.get("evidence") == "Demo Verified Signal":
            store.update("verification", record_id, {"evidence": "Illustrative demo record; not independently verified", "verified_at": None})

    # Remove only the known fictional SVG samples. User-created portfolio items stay untouched.
    for sample in DEMO_PORTFOLIO_SAMPLES:
        current = store.find_one("portfolios", id=sample["id"])
        if current and current.get("source") == "demo-generated":
            store.delete("portfolios", sample["id"])
    demo_creator = store.find_one("creators", id="creator-demo")
    if demo_creator:
        creator_updates = {}
        if "OpenAI Codex" not in (demo_creator.get("tools") or []):
            creator_updates["tools"] = [*(demo_creator.get("tools") or []), "OpenAI Codex"]
        for field, additions in {
            "skills": ["Text-to-Image", "Product Art Direction", "Motion Art Direction"],
            "specializations": ["AI Advertising", "Generative Art"],
            "content_types": ["Image"],
            "formats": ["2:3"],
        }.items():
            existing_values = list(demo_creator.get(field) or [])
            missing_values = [value for value in additions if value not in existing_values]
            if missing_values:
                creator_updates[field] = [*existing_values, *missing_values]
        if demo_creator.get("commercial_use") == "Commercial work available":
            creator_updates["commercial_use"] = "Project-specific commercial license; demo artwork is not cleared for client use."
        if demo_creator.get("licensing_notes") == "Commercial rights included for client campaigns.":
            creator_updates["licensing_notes"] = "Project license terms are negotiated in writing; demo artwork has prototype-only usage."
        if not demo_creator.get("usage_rights"):
            creator_updates["usage_rights"] = "Client usage rights negotiated per project; full rights are not implied."
        if creator_updates:
            store.update("creators", "creator-demo", {**demo_creator, **creator_updates})

    for creator in PUBLIC_CREATOR_SAMPLES:
        current = store.find_one("creators", id=creator["id"])
        if not current:
            store.insert("creators", {**creator, "created_at": demo_now, "updated_at": demo_now})
        elif current.get("external_profile"):
            store.update("creators", creator["id"], {**current, **creator, "created_at": current.get("created_at", demo_now)})

    for item in PUBLIC_PORTFOLIO_SAMPLES:
        if not store.find_one("creators", id=item["creator_id"]):
            continue
        current = store.find_one("portfolios", id=item["id"])
        seeded_item = {**item, "source": "public-source", "created_at": demo_now, "updated_at": demo_now}
        if not current:
            store.insert("portfolios", seeded_item)
        elif current.get("source") == "public-source":
            store.update("portfolios", item["id"], {**current, **seeded_item, "created_at": current.get("created_at", demo_now)})

    if had_creators_before_seed:
        return

    demo_creators = [
        {
            "id": "creator-demo",
            "user_id": "user-creator",
            "name": "Demo Creator",
            "bio": "AI filmmaker and creative director focused on cinematic short-form branded storytelling.",
            "location": "Bengaluru, India",
            "languages": ["English", "Hindi"],
            "specializations": ["AI Filmmaking", "AI Storytelling", "AI Advertising", "Generative Art"],
            "skills": ["Prompt Engineering", "Text-to-Image", "Text-to-Video", "Product Art Direction", "Motion Art Direction", "Video Editing", "Storyboarding"],
            "tools": ["Runway", "Kling", "ChatGPT", "ElevenLabs", "OpenAI Codex"],
            "content_types": ["Video", "Image", "Short-form video", "Audio"],
            "formats": ["9:16", "16:9", "2:3"],
            "availability": "Available this month",
            "commercial_use": "Project-specific commercial license; demo artwork is not cleared for client use.",
            "licensing_notes": "Project license terms are negotiated in writing; demo artwork has prototype-only usage.",
            "usage_rights": "Client usage rights negotiated per project; full rights are not implied.",
            "rate": "$1200/project",
            "profile_image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
            "verification": {"demo": True},
            "created_at": demo_now,
            "updated_at": demo_now,
        },
        {
            "id": "creator-1",
            "user_id": "user-ravi",
            "name": "Ravi AI Studio",
            "bio": "AI filmmaker creating cinematic product visuals and launch campaigns for premium brands.",
            "location": "Bengaluru, India",
            "languages": ["English", "Hindi"],
            "specializations": ["AI Filmmaking", "AI Advertising"],
            "skills": ["Prompt Engineering", "Text-to-Video", "Video Editing", "Storyboarding"],
            "tools": ["Runway", "Kling", "Adobe Firefly", "ChatGPT"],
            "content_types": ["Video", "Advertisement", "Short-form video"],
            "formats": ["9:16", "16:9"],
            "availability": "Available for 2-4 week projects",
            "commercial_use": "Commercial work available",
            "licensing_notes": "Commercial licensing available for client usage.",
            "usage_rights": "Campaign rights negotiated by channel and duration.",
            "rate": "$1200/project",
            "profile_image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
            "verification": {"demo": True},
            "created_at": demo_now,
            "updated_at": demo_now,
        },
        {
            "id": "creator-2",
            "user_id": "user-sneha",
            "name": "Sneha Generative Lab",
            "bio": "Generative art studio crafting emotional campaign imagery and premium social visuals.",
            "location": "Mumbai, India",
            "languages": ["English", "Hindi", "Marathi"],
            "specializations": ["Generative Art", "AI Storytelling"],
            "skills": ["Text-to-Image", "Image-to-Video", "Prompt Engineering", "Motion Graphics"],
            "tools": ["Midjourney", "Stable Diffusion", "Leonardo AI", "After Effects"],
            "content_types": ["Image", "Animation", "Graphic"],
            "formats": ["1:1", "4:5", "16:9"],
            "availability": "Available this month",
            "commercial_use": "Commercial licensing required",
            "licensing_notes": "Licensing varies by project scope.",
            "usage_rights": "Usage scope agreed and licensed per project.",
            "rate": "$900/project",
            "profile_image": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
            "verification": {"demo": True},
            "created_at": demo_now,
            "updated_at": demo_now,
        },
    ]

    for creator in demo_creators:
        store.insert("creators", creator)

    if not store.list("verification"):
        for item in [
            {"id": "verification-1", "creator_id": "creator-demo", "type": "Tool verification", "status": "demo", "evidence": "Illustrative demo record; not independently verified", "verified_at": None},
            {"id": "verification-2", "creator_id": "creator-demo", "type": "Workflow verification", "status": "demo", "evidence": "Illustrative demo record; not independently verified", "verified_at": None},
            {"id": "verification-3", "creator_id": "creator-1", "type": "Portfolio verification", "status": "demo", "evidence": "Illustrative demo record; not independently verified", "verified_at": None},
        ]:
            store.insert("verification", item)

    if not store.list("briefs"):
        for brief in [
            {
                "id": "brief-1",
                "brand_id": "user-brand",
                "campaign_name": "Campus Pulse",
                "brand_name": "Nova Energy",
                "description": "Need a 30-second cinematic AI ad for a youth-focused energy drink campaign on Instagram.",
                "objective": "Create high-energy social storytelling with youth appeal",
                "content_type": "Video",
                "style": "Cinematic",
                "target_audience": "College students in India",
                "location": "India",
                "language": "English",
                "platform": "Instagram",
                "aspect_ratio": "9:16",
                "duration": "30 seconds",
                "required_tools": ["Runway", "ChatGPT"],
                "required_skills": ["Prompt Engineering", "Storyboarding", "Video Editing"],
                "required_specialization": ["AI Filmmaking", "AI Advertising"],
                "budget": "$1500",
                "deadline": first_deadline,
                "commercial_use_required": "Commercial work available",
                "licensing_requirement": "Commercial licensing required",
                "usage_rights": "Campaign rights for owned channels",
                "reference_links": ["https://example.com/reference1"],
                "additional_requirements": "Must feel energetic and authentic.",
                "status": "published",
                "created_at": demo_now,
                "updated_at": demo_now,
            },
            {
                "id": "brief-2",
                "brand_id": "user-brand",
                "campaign_name": "Home Pulse",
                "brand_name": "Luma Home",
                "description": "Create a premium product visualization film for an AI home assistant targeting urban families.",
                "objective": "Show lifestyle integration and premium feel",
                "content_type": "Product video",
                "style": "Modern",
                "target_audience": "Urban families",
                "location": "India",
                "language": "Hindi",
                "platform": "YouTube",
                "aspect_ratio": "16:9",
                "duration": "20 seconds",
                "required_tools": ["Runway", "After Effects"],
                "required_skills": ["Product Visualization", "Motion Graphics"],
                "required_specialization": ["AI Product Visualization"],
                "budget": "$2000",
                "deadline": second_deadline,
                "commercial_use_required": "Commercial work available",
                "licensing_requirement": "Commercial licensing required",
                "usage_rights": "Full usage rights for owned media",
                "reference_links": [],
                "additional_requirements": "Must feel premium and calm.",
                "status": "draft",
                "created_at": demo_now,
                "updated_at": demo_now,
            },
        ]:
            store.insert("briefs", brief)

    if not store.list("engagements"):
        for item in [
            {"id": "engagement-1", "brief_id": "brief-1", "brand_id": "user-brand", "creator_id": "creator-demo", "message": "Interested in the concept and timeline.", "budget": "$1500", "deadline": first_deadline, "status": "pending", "created_at": demo_now, "updated_at": demo_now},
            {"id": "engagement-2", "brief_id": "brief-2", "brand_id": "user-brand", "creator_id": "creator-1", "message": "Would love to explore the art direction.", "budget": "$1200", "deadline": second_deadline, "status": "accepted", "created_at": demo_now, "updated_at": demo_now},
        ]:
            store.insert("engagements", item)

