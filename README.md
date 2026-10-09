# CreatorTwin AI

CreatorTwin AI is a marketplace prototype for brands and agencies to discover AI-native creative talent and manage a project from brief through delivery.

## The problem

Brands need more than a reel of images when hiring AI creators. They need to understand the tools and workflow behind the work, whether a creator can meet a format and timeline, and what commercial-use terms apply.

## The product

CreatorTwin connects creator evidence to brand requirements. A brand can structure a brief, compare creators against the actual requirements in that brief, inspect portfolio workflows and usage terms, and manage the collaboration through approval and feedback.

## What works in the prototype

- Brand and creator accounts with role-based access
- Creator profiles and editable AI portfolios with image or video media, models, tools, skills, workflow, format, and licensing fields
- Creator search and filtering by skill, specialization, tool, content type, format, language, location, commercial use, and availability
- CreatorTwin AI assistant using the OmniRoute OpenAI-compatible gateway when configured, with short conversation context, JSON brief output, focused follow-up questions, and a clearly labeled local fallback
- AI-assisted brief drafting, with model-backed extraction when configured and conservative local parsing when no API key is available
- Brief-specific fit scores with readable matched and missing criteria
- Engagement lifecycle with a required delivery URL and submission notes, revision history, versioned re-deliveries, approval, and review
- Ratings and written feedback tied to completed engagements
- Creator evidence submissions with a reviewer-only queue, approval/rejection decisions, and reviewer notes
- Brand and creator dashboards, with JSON persistence when MongoDB is unavailable

## Matching

The backend compares brief requirements with creator profile fields across specialization, skills, tools, content type, format, language, commercial-use terms, licensing scope, and usage rights. Rights requirements must match the corresponding creator claim; a generic commercial-use statement cannot satisfy a separate license or full-usage-rights requirement. It scores only criteria present in a brief and returns readable reasons. This is deterministic field matching, not semantic or generative ranking. Availability remains visible as a separate creator profile signal.

## Trust and portfolio data

The prototype includes public portfolio previews attributed to creators with public Behance and LinkedIn profiles associated with Guntur, Andhra Pradesh. These people have not joined CreatorTwin. AI tools, models, and workflows are shown only where the source describes them; otherwise the UI says they were not disclosed. Source links are provided, and reuse and commercial rights are marked unverified. A source link or public preview does not grant permission to reuse the work. Public profiles cannot receive CreatorTwin engagement requests. CreatorTwin's own demo verification signals are labeled as illustrative, and creator verification submissions stay pending until a reviewer records a decision. Engagement delivery accepts a public URL; binary upload storage is not wired up. Reviews can be submitted only after a delivery is approved.

## Data model note

- **Creator profile:** skills, tools, specializations, content types, formats, languages, availability, rate, commercial-use preference, licensing notes, usage-rights scope, and optional public-source attribution.
- **Portfolio item:** media URL and optional thumbnail/source link, content type, disclosed tools/models, AI provenance, creator attribution, demonstrated skills, specialization, ordered workflow steps, aspect ratio, duration, commercial-use statement, rights status, usage rights, and licensing notes.
- **Brief:** campaign goal, content type, style, audience, platform, format, duration, required tools/skills/specialization, budget, deadline, and usage/licensing requirements.
- **Engagement:** links a brief, brand, and creator with message, budget, deadline, status, versioned delivery URLs and notes, and timestamped revision requests. Reviews link back to completed engagements.
- **Verification:** creator, evidence, type, status, reviewer identity and note, and submission/review timestamps. Demo signals do not count as verified.

## Run locally

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

On Windows, activate the environment with `.venv\Scripts\Activate.ps1`.

## Deploy on Render

The repository includes a Render Blueprint and Dockerfile. From Render, choose **New → Blueprint**, connect `gangadharyeddula/GravityX-HacXLerate-2026`, and deploy the Blueprint. It builds the React frontend and serves it with the FastAPI backend from one web service; `/health` is the service health check.

The prototype starts with its seeded demo data and JSON fallback. For data that must survive service restarts or deployments, set `MONGODB_URI` to a reachable MongoDB database in the Render service environment.

Live AI requires a publicly reachable OmniRoute gateway and its endpoint key. Set `OMNIROUTE_BASE_URL` and `OMNIROUTE_API_KEY` in the Render service environment. The local default `http://localhost:20128/v1` points inside the Render container and cannot reach a gateway running on your computer. Without these settings, the assistant uses its local fallback.

To enable live AI, connect an upstream provider in OmniRoute, confirm its active combo/model routing, and create an API key under Dashboard → Endpoints. Put that key in `OMNIROUTE_API_KEY` in the project-root `.env` file. The default base URL is `http://localhost:20128/v1`; `OMNIROUTE_MODEL=auto` uses OmniRoute's configured routing. You can set a specific available model ID instead. Restart the CreatorTwin backend after changing these values. The key stays on the backend and is never sent to the browser. `GET /api/ai/status` reports the selected provider/model and whether live AI is configured; chat responses identify OmniRoute or the local fallback.

## Demo accounts

- Brand: `brand@demo.com` / `demo123`
- Creator: `creator@demo.com` / `demo123`
- Reviewer: `reviewer@demo.com` / `demo123`

## API highlights

- `POST /api/ai/brief-builder`
- `GET /api/creators` with profile filters
- `GET /api/briefs/{id}/matches`
- `POST /api/engagements`; `POST /api/engagements/{id}/deliveries`; `POST /api/engagements/{id}/revisions`; `PUT /api/engagements/{id}/status`
- `POST /api/reviews`; `GET /api/creators/{id}/reviews`
- `POST /api/verification`; `GET /api/verification/requests`; `PUT /api/verification/{id}/decision`

See [JUDGING_DEMO.md](JUDGING_DEMO.md) for a short walkthrough and judge-facing story.
