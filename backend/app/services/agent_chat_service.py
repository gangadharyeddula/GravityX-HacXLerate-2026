import json
import re
from typing import Dict, List
import httpx


class LiveModelUnavailable(RuntimeError):
    """Raised when the configured live model cannot complete a response."""


def _blank_brief(description: str = "") -> Dict:
    return {
        "campaign_name": "", "brand_name": "", "description": description,
        "objective": "", "content_type": "", "style": "", "target_audience": "",
        "location": "", "language": "", "platform": "", "aspect_ratio": "",
        "duration": "", "required_tools": [], "required_skills": [],
        "required_specialization": [], "budget": "", "country": "", "currency": "USD",
        "project_type": "", "deadline": "", "commercial_use_required": "",
        "licensing_requirement": "", "usage_rights": "", "reference_links": [],
        "additional_requirements": "", "status": "draft",
    }


def _clean_history(history) -> List[Dict[str, str]]:
    if not isinstance(history, list):
        return []
    result = []
    for turn in history[-6:]:
        if not isinstance(turn, dict) or turn.get("role") not in {"user", "assistant"}:
            continue
        text = str(turn.get("content") or "").strip()
        if text:
            result.append({"role": turn["role"], "content": text[:1500]})
    return result


def _fallback_reply(message: str, history=None, force_brief: bool = False) -> Dict:
    prompt = (message or "").strip()
    if not prompt:
        return {
            "intent": "clarify", "can_create_brief": False,
            "reply": "Tell me what you want to create, who it is for, and where it will run. I can shape that into a brief or help you discover AI creators.",
            "actions": [], "brief_preview": {}, "full_brief": _blank_brief(),
        }

    previous = [turn["content"] for turn in _clean_history(history) if turn["role"] == "user"][-2:]
    lower = prompt.lower()
    follow_up = bool(previous and re.search(r"\b(it|that|this|same|more|less|better|change|make|keep|instead)\b", lower))
    brief_text = " ".join(previous + [prompt]) if follow_up else prompt
    lowered = brief_text.lower()
    greeting = re.fullmatch(r"\s*(hi|hello|hey|good morning|good afternoon|good evening)[!. ]*", prompt, re.I)
    creator_search = re.search(r"\b(find|search|recommend|suggest|match|shortlist|discover|which|best)\b", lower) and re.search(r"\b(creators?|talent|filmmakers?|animators?|artists?)\b", lower)
    if creator_search and not force_brief:
        return {
            "intent": "question", "can_create_brief": False,
            "reply": "I can help narrow the creator search. Specify the niche or product, deliverable, and any must-have tools or rights; then compare the matching profiles' portfolios and verification evidence.",
            "actions": [], "brief_preview": {}, "full_brief": _blank_brief(),
        }
    question_like = re.match(r"\s*(how|what|why|which|where|when|can|do|does|is|are|should|who)\b", lower)
    request_action = re.search(r"\b(create|make|write|draft|build|generate|turn|refine|rewrite|shorten|change|update|improve|design|suggest|recommend|plan|promote|advertise|launch|need|want)\b", lower)
    if question_like and not request_action and not force_brief:
        if re.search(r"\b(licens|commercial use|usage rights|paid media|rights)\b", lower):
            answer = "State the exact scope: channels, paid or organic use, territory, duration, and exclusivity. Check the creator's terms for each portfolio item; a general commercial-use claim does not establish full usage rights."
        elif re.search(r"\b(ratio|aspect|format|size)\b", lower) and re.search(r"\b(instagram|tiktok|reel|shorts|youtube)\b", lower):
            answer = "For Instagram Reels and TikTok, 9:16 is the usual vertical choice. Standard YouTube video is usually 16:9; YouTube Shorts is 9:16. Confirm the placement before locking the brief."
        else:
            answer = "I can help with creator profiles, AI portfolios, campaign briefs, creator matching, delivery reviews, and licensing scope. Which part of the project are you working on?"
        return {
            "intent": "question", "can_create_brief": False, "reply": answer,
            "actions": [], "brief_preview": {}, "full_brief": _blank_brief(),
        }
    campaign_request = force_brief or re.search(
        r"\b(campaign|brand|product|launch|ad|advert|content|video|film|image|animation|brief|promo|promot|marketing|instagram|tiktok|youtube|reel|shorts|social|app|service|sales|business)\b",
        lowered,
    )
    if not campaign_request:
        reply = (
            "Hi! Tell me what you are launching and I can shape the campaign brief, recommend a format, or help find AI creators."
            if greeting
            else "I can help with campaign ideas, structured briefs, creator discovery, and licensing details. Share the product or service, audience, and platform you have in mind."
        )
        return {
            "intent": "clarify" if greeting else "question", "can_create_brief": False,
            "reply": reply, "actions": [], "brief_preview": {}, "full_brief": _blank_brief(),
        }

    platforms = [
        (r"\btiktok\b", "TikTok", "9:16"),
        (r"\b(instagram|ig)\b|\breels?\b", "Instagram", "9:16"),
        (r"\byoutube shorts?\b", "YouTube", "9:16"),
        (r"\byoutube\b", "YouTube", "16:9"),
        (r"\blinkedin\b", "LinkedIn", "1:1"),
        (r"\bpinterest\b", "Pinterest", "2:3"),
        (r"\bfacebook\b", "Facebook", "4:5"),
        (r"\b(website|web page|landing page)\b", "Website", "16:9"),
    ]
    platform_sources = (lower, lowered) if follow_up else (lowered,)
    platform, ratio = next((
        (name, aspect)
        for source in platform_sources
        for pattern, name, aspect in platforms
        if re.search(pattern, source)
    ), ("", ""))
    content_source = next((source for source in platform_sources if re.search(r"\b(animation|animated|motion graphic|image|images|photo|photography|poster|graphic|carousel|thumbnail|video|film|reel|shorts|ad|advertisement|commercial|spot)\b", source)), lowered)
    if re.search(r"\b(animation|animated|motion graphic)\b", content_source):
        content_type = "Animation"
    elif re.search(r"\b(image|images|photo|photography|poster|graphic|carousel|thumbnail)\b", content_source):
        content_type = "Image"
    elif re.search(r"\b(video|film|reel|shorts|ad|advertisement|commercial|spot)\b", content_source):
        content_type = "Video"
    else:
        content_type = ""

    styles = [
        ("cinematic", "Cinematic"), ("premium", "Premium"), ("luxury", "Luxury"),
        ("minimal", "Minimal"), ("playful", "Playful"), ("bold", "Bold"),
        ("documentary", "Documentary"), ("realistic", "Realistic"),
        ("dreamy", "Dreamy"), ("modern", "Modern"),
    ]
    style = next((value for source in platform_sources for term, value in styles if term in source), "")
    duration_match = next((match for source in platform_sources if (match := re.search(r"\b(\d{1,3})[\s-]*(seconds?|secs?|s|minutes?|mins?|m)\b", source))), None)
    duration = ""
    if duration_match:
        amount, unit = duration_match.groups()
        duration = f"{amount} minute{'s' if amount != '1' else ''}" if unit.startswith("m") else f"{amount} second{'s' if amount != '1' else ''}"
    audience_match = re.search(
        r"\b(?:targeting|aimed at|for)\s+(?:the\s+)?((?:gen\s*z|gen\s*alpha|millennials?|college students?|students?|young professionals?|parents?|founders?|gamers?|athletes?|new mothers?|small business owners?))(?=\s+(?:on|in|for|using|via|with|featuring|through)\b|[,.;!?]|$)",
        lower if follow_up and re.search(r"\b(?:targeting|aimed at|for)\b", lower) else lowered,
    )
    audience = audience_match.group(1).strip().title() if audience_match else ""
    title_prompt = previous[0] if follow_up and previous else prompt
    title = re.split(r"[.!?\n]", title_prompt, maxsplit=1)[0].strip(" -,:;")[:55] or "Campaign draft"

    known = [name for name, value in (
        ("platform", platform), ("content format", content_type),
        ("visual style", style), ("target audience", audience), ("duration", duration),
    ) if value]
    missing = [name for name, value in (
        ("platform", platform), ("content format", content_type), ("target audience", audience),
    ) if not value]
    next_question = "Who is the target audience?" if "target audience" in missing else f"Which {missing[0]} should I use?" if missing else "What budget and commercial usage rights should I include?"
    unknown_note = f" I left {', '.join(missing)} open instead of guessing." if missing else " I left budget, deadline, and licensing terms open because you did not specify them."
    reply = f"I prepared a first-pass brief and carried through {', '.join(known) if known else 'your campaign idea'}.{unknown_note} {next_question}"
    if follow_up:
        reply = "I applied your follow-up to the earlier campaign details. " + reply

    brief = _blank_brief(brief_text)
    brief.update({
        "campaign_name": title, "brand_name": "Your brand",
        "objective": "Create campaign content for the stated product or service.",
        "content_type": content_type, "style": style, "target_audience": audience,
        "platform": platform, "aspect_ratio": ratio, "duration": duration,
        "project_type": content_type, "status": "published",
    })
    preview = {key: brief[key] for key in ("campaign_name", "objective", "platform", "content_type", "style", "target_audience")}
    actions = [
        {"label": f"Confirm the {missing[0]}"} if missing else {"label": "Confirm budget and usage rights"},
        {"label": "Review creator tools and portfolio evidence"},
        {"label": "Compare creator fit against this brief"},
    ]
    return {"intent": "brief", "can_create_brief": True, "reply": reply, "actions": actions, "brief_preview": preview, "full_brief": brief}


def _omniroute_error(error: Exception) -> LiveModelUnavailable:
    status_code = getattr(getattr(error, "response", None), "status_code", None)
    if status_code == 429:
        detail = "OmniRoute returned a rate limit or quota response. Check its usage limits, then retry."
    elif status_code in {401, 403}:
        detail = "OmniRoute rejected its API key. Copy a key from Dashboard → Endpoints and update OMNIROUTE_API_KEY."
    elif status_code == 400:
        detail = "OmniRoute rejected the model or request. Check the model ID in its active model list or use auto."
    elif status_code == 404:
        detail = "The OmniRoute endpoint or configured model was not found. Check OMNIROUTE_BASE_URL and OMNIROUTE_MODEL."
    elif status_code in {502, 503, 504}:
        detail = "OmniRoute or its selected model is temporarily unavailable. Check the gateway and retry."
    else:
        detail = "OmniRoute could not respond. Check that the gateway is running and a provider/model is available."
    return LiveModelUnavailable(detail)


def _request_omniroute(api_key: str, model: str, base_url: str, instructions: str, history, prompt: str) -> str:
    turns = list(history)
    if not turns or turns[-1] != {"role": "user", "content": prompt[:1500]}:
        turns.append({"role": "user", "content": prompt[:3000]})
    while turns and turns[0]["role"] == "assistant":
        turns.pop(0)
    request_body = {
        "model": model,
        "messages": [{"role": "system", "content": instructions}, *turns],
        "max_tokens": 4096,
        "response_format": {"type": "json_object"},
    }
    url = f"{base_url.rstrip('/')}/chat/completions"
    response = httpx.post(
        url,
        headers={"Authorization": f"Bearer {api_key}"},
        json=request_body,
        timeout=45.0,
    )
    response.raise_for_status()
    payload = response.json()
    choices = payload.get("choices") or []
    message = (choices[0].get("message") or {}) if choices else {}
    content = message.get("content", "")
    if isinstance(content, list):
        content = "".join(part.get("text", "") for part in content if isinstance(part, dict))
    return str(content or "").strip()


def respond(api_key: str, model: str, message: str, history=None, force_brief: bool = False,
            base_url: str = "http://localhost:20128/v1") -> Dict:
    prompt = (message or "").strip()
    safe_history = _clean_history(history)
    if not api_key:
        result = _fallback_reply(prompt, safe_history, force_brief)
        result["model_mode"] = "local_fallback"
        return result

    instructions = (
        "You are CreatorTwin's campaign and AI-creator marketplace assistant. Answer the latest request directly and use earlier "
        "turns when a short follow-up refers to them. Preserve all explicit user constraints; newer instructions update only the fields "
        "they address. Help with campaign creation, prompt refinement, creator discovery guidance, licensing questions, and questions "
        "about this marketplace. Do not invent a brand name, audience, budget, deadline, creator, verification status, availability, or "
        "licensing permission. For an incomplete campaign prompt, produce a useful editable draft, leave unknown fields empty, explain "
        "important assumptions in reply, and ask at most one focused question. For a general question, answer it without forcing a brief. "
        "Never claim that you searched or contacted creators; discovery is handled separately by the app. Use concise, concrete language. "
        "Set can_create_brief=true only for a campaign creation or edit request. For creator-search requests and general questions set "
        "can_create_brief=false and leave the brief fields empty. Keep tools, skills, specializations, rights and reference "
        "links empty unless the user explicitly gives them or they are strongly supported by the request. Respond in the same language "
        "as the user's latest message, preserving product, platform, and tool names. Set every array to an array and "
        "every missing text value to an empty string. Return only the structured response."
    )
    if force_brief:
        instructions += " The user is asking for a campaign brief from the supplied idea; set can_create_brief=true even if the idea is short."
    try:
        output_text = _request_omniroute(api_key, model, base_url, instructions, safe_history, prompt)
        result = json.loads(output_text)
        if not isinstance(result, dict) or not isinstance(result.get("reply"), str):
            raise ValueError("The model returned an incomplete assistant response.")
        if not result.get("can_create_brief"):
            result["full_brief"] = _blank_brief()
        result["model_mode"] = "live"
        return result
    except LiveModelUnavailable:
        raise
    except httpx.HTTPError as error:
        raise _omniroute_error(error) from error
    except Exception as error:
        raise LiveModelUnavailable("OmniRoute returned an invalid structured response. Try again or select a model with JSON output support.") from error
