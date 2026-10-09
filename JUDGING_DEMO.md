# CreatorTwin — judging walkthrough

## Demo accounts

- Brand: `brand@demo.com` / `demo123`
- Creator: `creator@demo.com` / `demo123`
- Reviewer: `reviewer@demo.com` / `demo123`

Reviewer access is a seeded demo role; public sign-up only allows creator and brand accounts.

## Suggested demo flow

1. **Show public creator portfolios.** Filter creators by Guntur and open Manindra Jonnakuti or Nagarjuna Meka. Point out their linked Behance or LinkedIn sources, several attributed portfolio entries, and the `creator-described` versus `not disclosed` AI provenance labels. Manindra's linked AI film source names Google Veo 3.1 Fast and a tool set. Explain that these are public source previews, neither creator has joined CreatorTwin, profiles are not verified, and rights are unverified. The LinkedIn items link to the creator profile because direct post URLs are not exposed in the public profile data.
2. **Show the trust review.** As Demo Creator, open Profile and submit a tool, workflow, portfolio, or commercial-rights review with an evidence note or public link. Sign in as Demo Reviewer and open the Verification queue. Inspect the evidence and approve it or return it with a reviewer note. The decision appears in the creator’s visible verification signals.
3. **Show rights-aware discovery.** As Demo Brand, open the Campus Pulse brief’s matches. Explain the fit reasons and point out that broad commercial availability does not satisfy a separate licensing or full-usage-rights requirement.
4. **Show real delivery review.** As Demo Creator, accept the pending engagement and start production. Submit a reachable file URL plus delivery notes. As Demo Brand, open the submitted work, request a revision with specific notes, and approve it only after the revised delivery is attached. Each delivery version and revision note stays on the engagement.
5. **Close on accountability.** Complete the engagement and leave feedback. Return to the creator profile to show feedback tied to a completed collaboration.

## What judges should notice

- Creator discovery compares AI skills and portfolio evidence against the brief.
- Public portfolio entries link to their source and show the disclosed tools and workflow. Missing AI details and unverified rights are stated clearly.
- A delivery URL and submission note are required before a project can enter brand review.
- Revision requests name the requested changes, and subsequent submissions are versioned.
- Verification claims stay pending until a reviewer records a decision and note.
- Commercial availability, licensing scope, and usage rights are evaluated as separate requirements.

## Prototype limits

- Public previews are attributed to their linked profiles, but CreatorTwin does not claim authorship, verification, or reuse rights for them. Get written permission before reuse.
- Engagement delivery currently accepts a public URL; binary file upload is not wired to storage.
- Verification reviews rely on the evidence note or public link supplied by the creator; reviewers inspect it manually.
- Matching uses deterministic field scoring rather than semantic AI ranking.

## Data model

Creator profiles store skills, tools, specializations, formats, commercial-use preferences, licensing notes, and optional public-source attribution. Portfolio items store media/source links, AI provenance, creator attribution, tool/model disclosures, skills, workflow, format, and rights status. Briefs store campaign and commercial-use, licensing, and usage-rights requirements. Engagements store versioned delivery URLs and notes plus timestamped revision requests. Verification records store the claim, creator evidence, reviewer decision, reviewer note, and review timestamps.
