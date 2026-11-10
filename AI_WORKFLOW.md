# AI Workflow Note

## Tools used

- **Claude (Anthropic), chat**: turning the brief into a plan, generating the project code, tests and docs, and step-by-step help with setup and deployment.
- No other AI coding assistants were used.

## Where AI materially sped up my work

- Turning a long, open-ended brief into a prioritized plan with a time budget and clear scope cuts.
- Generating the first full version: Prisma schema, API routes, access rules, TipTap editor and toolbar, share dialog, file import, 17 tests and the docs.
- Debugging setup problems quickly: a nested unzip folder (npm couldn't find package.json), a placeholder database URL causing a P1000 auth error, and stale Git credentials blocking the push.

## What I changed, rejected, or decided myself

- **Rejected major upgrades** suggested by tools (Prisma 5 → 8 and `npm audit fix --force`). They would bring breaking changes in a timebox, so I kept the pinned, tested versions.
- **Rejected Vercel's suggested Prisma Postgres integration** and kept one Neon database, so local and production use the same documented setup.
- **Skipped the Neon CLI / agent onboarding** and used a plain connection string in `.env` and a Vercel environment variable, which means fewer moving parts for reviewers.
- **Kept mocked auth** (seeded users) instead of real login, so the time went into sharing and access logic, which the brief allows.
- **Kept one shared role (editor)** instead of adding viewer roles, to protect the core flow within the time limit.

## How I verified correctness, UX and reliability

- `npm test`: 17 tests pass (access rules, file import including HTML escaping, input validation).
- Manual end-to-end test locally: created a document, applied bold, a heading and a numbered list, refreshed to confirm it saved, renamed it, shared it with Carol, switched user and confirmed it appears under "Shared with me".
- Checked that `.env` (database password) was not committed to GitHub.
- Opened the live Vercel URL in a fresh session and confirmed it loads the seeded users from Neon.

## Takeaway

AI wrote most of the code quickly. My job was scoping, deciding what not to build, keeping the setup simple for reviewers, and checking every flow myself before submitting.